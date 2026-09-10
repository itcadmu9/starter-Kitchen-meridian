from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import reorder_service

router = APIRouter(prefix="/api/v1/reorder", tags=["reorder"])


@router.get("", response_model=list[schemas.ReorderRequestOut])
def list_reorder_requests(property_id: str | None = None, db: Session = Depends(get_db)):
    return reorder_service.list_reorder_requests(db, property_id=property_id)


@router.post("", response_model=schemas.ReorderRequestOut, status_code=201)
def create_reorder_request(payload: schemas.ReorderRequestCreate, db: Session = Depends(get_db)):
    return reorder_service.create_reorder_request(db, payload)
