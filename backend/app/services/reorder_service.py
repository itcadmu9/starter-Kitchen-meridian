"""Reorder service — DB access for the kitchen vertical's ReorderRequest entity."""

from sqlalchemy.orm import Session

from app import models, schemas


def list_reorder_requests(
    db: Session, property_id: str | None = None
) -> list[models.ReorderRequest]:
    query = db.query(models.ReorderRequest)
    if property_id:
        query = query.filter(models.ReorderRequest.property_id == property_id)
    return query.order_by(models.ReorderRequest.requested_at.desc()).all()


def create_reorder_request(
    db: Session, payload: schemas.ReorderRequestCreate
) -> models.ReorderRequest:
    request = models.ReorderRequest(**payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def get_reorder_request(db: Session, request_id: str) -> models.ReorderRequest | None:
    return db.query(models.ReorderRequest).filter(models.ReorderRequest.id == request_id).first()


def update_status(
    db: Session, request_id: str, status: schemas.ReorderStatus
) -> models.ReorderRequest | None:
    request = get_reorder_request(db, request_id)
    if not request:
        return None
    request.status = status
    db.commit()
    db.refresh(request)
    return request
