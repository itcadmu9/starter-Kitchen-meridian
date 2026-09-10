from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/v1", tags=["inventory"])


@router.get("/inventory-stock", response_model=list[schemas.InventoryStockOut])
def list_inventory(db: Session = Depends(get_db)):
    return crud.list_inventory_stock(db)
