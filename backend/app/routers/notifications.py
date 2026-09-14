from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_manager
from app.database import get_db

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db), _manager: models.User | None = Depends(require_manager)):
    notifications = []
    for item in db.query(models.InventoryItem).filter(models.InventoryItem.quantity <= models.InventoryItem.reorder_threshold).all():
        status = "out of stock" if item.quantity <= 0 else "low stock"
        notifications.append({"id": f"inventory-{item.id}", "kind": "inventory", "message": f"{item.name} is {status} at {item.outlet} ({item.quantity} {item.unit} remaining)", "created_at": item.updated_at, "read": "false"})
    for account, guest in db.query(models.LoyaltyAccount, models.Guest).join(models.Guest, models.Guest.id == models.LoyaltyAccount.guest_id).filter(models.LoyaltyAccount.tier.in_(["gold", "platinum"])).order_by(models.LoyaltyAccount.updated_at.desc()).limit(10).all():
        notifications.append({"id": f"loyalty-{account.id}", "kind": "loyalty", "message": f"{guest.name} has reached {account.tier.upper()} with {account.points_balance} points", "created_at": account.updated_at, "read": "false"})
    return sorted(notifications, key=lambda notification: notification["created_at"], reverse=True)