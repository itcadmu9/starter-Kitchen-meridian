from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.post("", response_model=schemas.TransactionResult, status_code=201)
def complete_sale(payload: schemas.TransactionCreate, db: Session = Depends(get_db), user: models.User | None = Depends(get_current_user)):
    if user and user.outlet and payload.outlet != user.outlet:
        raise HTTPException(status_code=403, detail="Staff can only complete sales at their outlet")
    guest = db.query(models.Guest).filter(models.Guest.id == payload.guest_id).first()
    property_ = db.query(models.Property).first()
    if not guest or not property_:
        raise HTTPException(status_code=404, detail="Customer or property not found")
    account = db.query(models.LoyaltyAccount).filter(models.LoyaltyAccount.guest_id == guest.id).first()
    if not account:
        account = models.LoyaltyAccount(guest_id=guest.id, points_balance=0, tier="silver")
        db.add(account)
        db.flush()
    previous_tier = account.tier
    points = payload.amount
    account.points_balance += points
    account.tier = "platinum" if account.points_balance >= 5000 else "gold" if account.points_balance >= 1000 else "silver"
    transaction = models.Transaction(property_id=property_.id, guest_id=guest.id, outlet=payload.outlet, amount=payload.amount, points_earned=points)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return {"transaction": transaction, "guest_name": guest.name, "points_balance": account.points_balance, "tier": account.tier, "tier_changed": previous_tier != account.tier}