"""Loyalty service — DB access for the kitchen vertical's LoyaltyAccount entity."""

from sqlalchemy.orm import Session

from app import models

# Section 18 of the design doc: tier is recalculated whenever points_balance changes.
_TIER_THRESHOLDS = [
    ("platinum", 6000),
    ("gold", 3000),
    ("silver", 1000),
    ("bronze", 0),
]


def _tier_for_points(points) -> str:
    for tier, minimum in _TIER_THRESHOLDS:
        if points >= minimum:
            return tier
    return "bronze"


def get_loyalty_account(db: Session, guest_id: str) -> models.LoyaltyAccount | None:
    return (
        db.query(models.LoyaltyAccount)
        .filter(models.LoyaltyAccount.guest_id == guest_id)
        .first()
    )


def list_loyalty_accounts(db: Session) -> list[dict]:
    """Joins each account with its guest's name/email for display purposes."""
    rows = (
        db.query(models.LoyaltyAccount, models.Guest)
        .join(models.Guest, models.Guest.id == models.LoyaltyAccount.guest_id)
        .order_by(models.LoyaltyAccount.points_balance.desc())
        .all()
    )
    return [
        {
            "id": account.id,
            "guest_id": account.guest_id,
            "points_balance": account.points_balance,
            "tier": account.tier,
            "updated_at": account.updated_at,
            "guest_name": guest.name,
            "guest_email": guest.email,
        }
        for account, guest in rows
    ]


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
    account.points_balance = max(0, account.points_balance + points_delta)
    account.tier = _tier_for_points(account.points_balance)
    db.commit()
    db.refresh(account)
    return account
