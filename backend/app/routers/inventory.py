from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import inventory_service

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


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


@router.post("", response_model=schemas.InventoryItemOut, status_code=201)
def create_inventory_item(payload: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    return inventory_service.create_inventory_item(db, payload)


@router.patch("/{item_id}/quantity", response_model=schemas.InventoryItemOut)
def adjust_inventory_quantity(
    item_id: str, payload: schemas.InventoryQuantityAdjustment, db: Session = Depends(get_db)
):
    item = inventory_service.adjust_quantity(db, item_id, payload.quantity_delta)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item
