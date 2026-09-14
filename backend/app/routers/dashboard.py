from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.core.security import get_current_user
from app.services import inventory_service, loyalty_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=schemas.DashboardOut)
def get_dashboard(db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    member_rows = loyalty_service.list_members(db, limit=1)
    top_member = None
    if member_rows:
        account, guest = member_rows[0]
        top_member = {**account.__dict__, "name": guest.name, "email": guest.email}

    property_ = db.query(models.Property).first()
    return {
        "property_name": property_.name if property_ else "Kitchen Collective",
        "summary": inventory_service.inventory_summary(db, outlet=user.outlet if user else None),
        "top_member": top_member,
    }