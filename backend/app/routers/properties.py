from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/v1/properties", tags=["properties"])


@router.get("", response_model=list[schemas.PropertyOut])
def list_properties(db: Session = Depends(get_db)):
    return crud.list_properties(db)
