from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.core.security import require_manager
from app import models
from app.services import loyalty_service

router = APIRouter(prefix="/api/v1/loyalty", tags=["loyalty"])


@router.get("", response_model=list[schemas.LoyaltyMemberOut])
def list_loyalty_members(limit: int = 50, db: Session = Depends(get_db), _manager: models.User | None = Depends(require_manager)):
    return [
        {**account.__dict__, "name": guest.name, "email": guest.email}
        for account, guest in loyalty_service.list_members(db, min(max(limit, 1), 50))
    ]


@router.get("/{guest_id}", response_model=schemas.LoyaltyAccountOut)
def get_loyalty_account(guest_id: str, db: Session = Depends(get_db), _manager: models.User | None = Depends(require_manager)):
    return loyalty_service.get_or_create_loyalty_account(db, guest_id)


@router.post("/{guest_id}/adjust", response_model=schemas.LoyaltyAccountOut)
def adjust_loyalty_points(
    guest_id: str, payload: schemas.LoyaltyAdjustment, db: Session = Depends(get_db), _manager: models.User | None = Depends(require_manager)
):
    raise HTTPException(status_code=403, detail="Loyalty points are system-managed and read-only")
