from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/v1/menu", tags=["menu"])


@router.get("", response_model=list[schemas.MenuItemOut])
def list_menu(outlet: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.MenuItem)
    if outlet:
        query = query.filter(models.MenuItem.outlet == outlet)
    return query.order_by(models.MenuItem.name).all()