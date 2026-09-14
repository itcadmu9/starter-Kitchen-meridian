from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.core.security import get_current_user, require_manager
from app import models
from app.services import reorder_service

router = APIRouter(prefix="/api/v1/reorder", tags=["reorder"])


@router.get("", response_model=list[schemas.ReorderRequestOut])
def list_reorder_requests(property_id: str | None = None, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    return reorder_service.list_reorder_requests(db, property_id=property_id, outlet=user.outlet if user else None)


@router.post("", response_model=schemas.ReorderRequestOut, status_code=201)
def create_reorder_request(payload: schemas.ReorderRequestCreate, db: Session = Depends(get_db)):
    return reorder_service.create_reorder_request(db, payload)


@router.patch("/{request_id}", response_model=schemas.ReorderRequestOut)
def update_reorder_status(request_id: str, payload: schemas.ReorderStatusUpdate, db: Session = Depends(get_db), _manager: models.User | None = Depends(require_manager)):
    request = reorder_service.update_status(db, request_id, payload.status)
    if not request:
        raise HTTPException(status_code=404, detail="Reorder request not found")
    return request
