"""Loyalty service — DB access for the kitchen vertical's LoyaltyAccount entity."""

from sqlalchemy.orm import Session

from app import models


def get_loyalty_account(db: Session, guest_id: str) -> models.LoyaltyAccount | None:
    return (
        db.query(models.LoyaltyAccount)
        .filter(models.LoyaltyAccount.guest_id == guest_id)
        .first()
    )


def get_or_create_loyalty_account(db: Session, guest_id: str) -> models.LoyaltyAccount:
    account = get_loyalty_account(db, guest_id)
    if account:
        return account
    account = models.LoyaltyAccount(guest_id=guest_id, points_balance=0, tier="bronze")
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def adjust_points(db: Session, guest_id: str, points_delta) -> models.LoyaltyAccount:
    account = get_or_create_loyalty_account(db, guest_id)
    account.points_balance = account.points_balance + points_delta
    db.commit()
    db.refresh(account)
    return account


def list_members(db: Session, limit: int = 50) -> list[tuple[models.LoyaltyAccount, models.Guest]]:
    return (
        db.query(models.LoyaltyAccount, models.Guest)
        .join(models.Guest, models.Guest.id == models.LoyaltyAccount.guest_id)
        .order_by(models.LoyaltyAccount.points_balance.desc())
        .limit(limit)
        .all()
    )
