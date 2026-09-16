"""Reorder service — DB access for the kitchen vertical's ReorderRequest entity."""

from sqlalchemy.orm import Session, joinedload

from app import models, schemas


def list_reorder_requests(
    db: Session, property_id: str | None = None, outlet: str | None = None
) -> list[models.ReorderRequest]:
    query = db.query(models.ReorderRequest).options(joinedload(models.ReorderRequest.inventory_item))
    if property_id:
        query = query.filter(models.ReorderRequest.property_id == property_id)
    if outlet:
        query = query.join(models.InventoryItem).filter(models.InventoryItem.outlet == outlet)
    return query.order_by(models.ReorderRequest.requested_at.desc()).all()


def create_reorder_request(
    db: Session, payload: schemas.ReorderRequestCreate
) -> models.ReorderRequest:
    # A manager reordering an item is an explicit action, so mark it "ordered" right away
    # rather than routing through pending/approval. Reuse any existing active requests for
    # the same item instead of creating duplicates.
    active_requests = db.query(models.ReorderRequest).filter(
        models.ReorderRequest.inventory_item_id == payload.inventory_item_id,
        models.ReorderRequest.status.in_([
            models.ReorderStatus.pending, models.ReorderStatus.approved, models.ReorderStatus.ordered
        ]),
    ).all()
    if active_requests:
        primary, *duplicates = active_requests
        primary.quantity = payload.quantity
        primary.status = models.ReorderStatus.ordered
        for duplicate in duplicates:
            duplicate.status = models.ReorderStatus.ordered
        db.commit()
        db.refresh(primary)
        return primary
    request = models.ReorderRequest(**payload.model_dump(), status=models.ReorderStatus.ordered)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def update_status(db: Session, request_id: str, status: models.ReorderStatus):
    request = db.query(models.ReorderRequest).filter(models.ReorderRequest.id == request_id).first()
    if not request:
        return None
    request.status = status
    db.commit()
    db.refresh(request)
    return request
