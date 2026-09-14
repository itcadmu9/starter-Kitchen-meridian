"""Inventory service — DB access for the kitchen vertical's InventoryItem entity."""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas


def list_inventory(db: Session, property_id: str | None = None, outlet: str | None = None) -> list[models.InventoryItem]:
    query = db.query(models.InventoryItem)
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    if outlet:
        query = query.filter(models.InventoryItem.outlet == outlet)
    return query.order_by(models.InventoryItem.name).all()


def list_outlets(db: Session, property_id: str | None = None, outlet: str | None = None) -> list[str]:
    query = db.query(models.InventoryItem.outlet).distinct()
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    if outlet:
        query = query.filter(models.InventoryItem.outlet == outlet)
    return [row[0] for row in query.order_by(models.InventoryItem.outlet).all()]


def paged_inventory(
    db: Session,
    property_id: str | None = None,
    outlet: str | None = None,
    page: int = 1,
    page_size: int = 20,
    allowed_outlet: str | None = None,
) -> tuple[list[models.InventoryItem], int]:
    query = db.query(models.InventoryItem)
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    if outlet:
        query = query.filter(models.InventoryItem.outlet == outlet)
    if allowed_outlet:
        query = query.filter(models.InventoryItem.outlet == allowed_outlet)
    total = query.count()
    items = (
        query.order_by(models.InventoryItem.updated_at.desc(), models.InventoryItem.name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def inventory_summary(db: Session, property_id: str | None = None, outlet: str | None = None) -> dict:
    items = list_inventory(db, property_id, outlet)
    total = len(items)
    out_of_stock = sum(item.quantity <= 0 for item in items)
    low_stock = sum(0 < item.quantity <= item.reorder_threshold for item in items)
    in_stock = total - out_of_stock - low_stock

    def percent(value: int) -> float:
        return round(value / total * 100, 1) if total else 0

    return {
        "total": total,
        "in_stock": in_stock,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "in_stock_percent": percent(in_stock),
        "low_stock_percent": percent(low_stock),
        "out_of_stock_percent": percent(out_of_stock),
    }


def update_stock(db: Session, item_id: str, quantity, action: str = "add") -> models.InventoryItem | None:
    item = get_inventory_item(db, item_id)
    if not item:
        return None
    item.quantity = item.quantity + quantity if action == "add" else max(item.quantity - quantity, 0)
    active_request = db.query(models.ReorderRequest).filter(
        models.ReorderRequest.inventory_item_id == item.id,
        models.ReorderRequest.status.in_([
            models.ReorderStatus.pending, models.ReorderStatus.approved, models.ReorderStatus.ordered
        ]),
    ).first()
    if item.quantity <= item.reorder_threshold and not active_request:
        db.add(models.ReorderRequest(
            property_id=item.property_id,
            inventory_item_id=item.id,
            quantity=max(item.reorder_threshold * 2, 1),
        ))
    elif item.quantity > item.reorder_threshold and active_request:
        active_request.status = models.ReorderStatus.received
    db.commit()
    db.refresh(item)
    return item


def get_inventory_item(db: Session, item_id: str) -> models.InventoryItem | None:
    return db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()


def create_inventory_item(
    db: Session, payload: schemas.InventoryItemCreate
) -> models.InventoryItem:
    existing_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.property_id == payload.property_id,
        models.InventoryItem.outlet == payload.outlet,
        func.lower(models.InventoryItem.name) == payload.name.strip().lower(),
    ).first()
    if existing_item:
        raise ValueError("An ingredient with this name already exists at this outlet")
    item = models.InventoryItem(**payload.model_dump(exclude_none=True))
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_low_stock(db: Session, property_id: str | None = None, outlet: str | None = None) -> list[models.InventoryItem]:
    query = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_threshold
    )
    if property_id:
        query = query.filter(models.InventoryItem.property_id == property_id)
    if outlet:
        query = query.filter(models.InventoryItem.outlet == outlet)
    return query.order_by(models.InventoryItem.name).all()
