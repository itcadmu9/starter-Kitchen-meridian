from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import inventory_service

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


@router.get("/outlets", response_model=list[str])
def list_inventory_outlets(property_id: str | None = None, db: Session = Depends(get_db)):
    return inventory_service.list_outlets(db, property_id=property_id)


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
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    items, total = inventory_service.paged_inventory(db, property_id, outlet, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("", response_model=list[schemas.InventoryItemOut])
def list_inventory(property_id: str | None = None, db: Session = Depends(get_db)):
    return inventory_service.list_inventory(db, property_id=property_id)


@router.get("/low-stock", response_model=list[schemas.InventoryItemOut])
def list_low_stock(property_id: str | None = None, db: Session = Depends(get_db)):
    return inventory_service.list_low_stock(db, property_id=property_id)


@router.get("/{item_id}", response_model=schemas.InventoryItemOut)
def get_inventory_item(item_id: str, db: Session = Depends(get_db)):
    item = inventory_service.get_inventory_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.patch("/{item_id}/stock", response_model=schemas.InventoryItemOut)
def update_inventory_stock(
    item_id: str, payload: schemas.InventoryStockUpdate, db: Session = Depends(get_db)
):
    item = inventory_service.update_stock(db, item_id, payload.quantity)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("", response_model=schemas.InventoryItemOut, status_code=201)
def create_inventory_item(payload: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    return inventory_service.create_inventory_item(db, payload)
