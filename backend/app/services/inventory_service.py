"""Inventory service — DB access for the kitchen vertical's InventoryItem entity."""

from sqlalchemy.orm import Session

from app import models, schemas


def list_inventory(db: Session, property_id: str | None = None) -> list[models.InventoryItem]:
    query = db.query(models.InventoryItem)
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    return query.order_by(models.InventoryItem.name).all()


def get_inventory_item(db: Session, item_id: str) -> models.InventoryItem | None:
    return db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()


def create_inventory_item(
    db: Session, payload: schemas.InventoryItemCreate
) -> models.InventoryItem:
    item = models.InventoryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_low_stock(db: Session, property_id: str | None = None) -> list[models.InventoryItem]:
    query = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_threshold
    )
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    return query.order_by(models.InventoryItem.name).all()
