from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.core.security import get_current_user
from app import models
from app.services import inventory_service

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


@router.get("/outlets", response_model=list[str])
def list_inventory_outlets(property_id: str | None = None, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    return inventory_service.list_outlets(db, property_id=property_id, outlet=user.outlet if user else None)


@router.get("/summary", response_model=schemas.InventorySummary)
def get_inventory_summary(property_id: str | None = None, db: Session = Depends(get_db)):
    return inventory_service.inventory_summary(db, property_id=property_id)


@router.get("/paged")
def list_paged_inventory(
    property_id: str | None = None,
    outlet: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    user: models.User | None = Depends(get_current_user),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    items, total = inventory_service.paged_inventory(db, property_id, outlet, page, page_size, user.outlet if user else None)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("", response_model=list[schemas.InventoryItemOut])
def list_inventory(property_id: str | None = None, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    return inventory_service.list_inventory(db, property_id=property_id, outlet=user.outlet if user else None)


@router.get("/low-stock", response_model=list[schemas.InventoryItemOut])
def list_low_stock(property_id: str | None = None, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    return inventory_service.list_low_stock(db, property_id=property_id, outlet=user.outlet if user else None)


@router.get("/{item_id}", response_model=schemas.InventoryItemOut)
def get_inventory_item(item_id: str, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    item = inventory_service.get_inventory_item(db, item_id)
    if item and user and user.outlet and item.outlet != user.outlet:
        raise HTTPException(status_code=403, detail="Staff can only access their outlet")
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.patch("/{item_id}/stock", response_model=schemas.InventoryItemOut)
def update_inventory_stock(
    item_id: str, payload: schemas.InventoryStockUpdate, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)
):
    item = inventory_service.get_inventory_item(db, item_id)
    if item and user and user.outlet and item.outlet != user.outlet:
        raise HTTPException(status_code=403, detail="Staff can only update their outlet")
    item = inventory_service.update_stock(db, item_id, payload.quantity, payload.action)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("", response_model=schemas.InventoryItemOut, status_code=201)
def create_inventory_item(
    payload: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    user: models.User | None = Depends(get_current_user),
):
    if user and user.property_id:
        if payload.property_id and payload.property_id != user.property_id:
            raise HTTPException(status_code=403, detail="You can only add stock to your property")
        payload.property_id = user.property_id
        if user.outlet:
            if payload.outlet and payload.outlet != user.outlet:
                raise HTTPException(status_code=403, detail="Staff can only add stock to their outlet")
            payload.outlet = user.outlet
    if not payload.property_id:
        raise HTTPException(status_code=400, detail="Property is required")
    try:
        return inventory_service.create_inventory_item(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
