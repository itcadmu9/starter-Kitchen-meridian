"""
Seeds a small set of demo data so the API is immediately testable after
`docker compose up`. Safe to re-run: only seeds when the guests table is empty.

Run standalone with:  docker compose exec backend python -m app.seed
"""

from datetime import date, timedelta

from app import models
from app.core.security import hash_password
from app.database import SessionLocal
from app.models import utcnow
from app.mongo import get_preferences_collection


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(models.Guest).count() > 0:
            return

        property_ = models.Property(
            name="Demo Property",
            brand="Meridian Demo Brand",
            address="1 Harbor View Rd",
            timezone="America/New_York",
        )
        db.add(property_)
        db.flush()

        rate_plan = models.RatePlan(
            property_id=property_.id,
            name="Standard Rate",
            nightly_rate=249.00,
            cancellation_policy="Free cancellation up to 48h before check-in",
        )
        db.add(rate_plan)
        db.flush()

        guest = models.Guest(
            name="Jamie Rivera",
            email="jamie.rivera@example.com",
            phone="+1-555-0100",
            loyalty_tier="gold",
        )
        db.add(guest)
        db.flush()

        reservation = models.Reservation(
            guest_id=guest.id,
            property_id=property_.id,
            rate_plan_id=rate_plan.id,
            check_in=date.today() + timedelta(days=3),
            check_out=date.today() + timedelta(days=6),
            status=models.ReservationStatus.confirmed,
        )
        db.add(reservation)
        db.flush()

        folio = models.Folio(
            reservation_id=reservation.id,
            line_items=[
                {"description": "3 nights - Standard Rate", "amount": 747.00},
                {"description": "Resort fee", "amount": 45.00},
            ],
            balance=792.00,
            status=models.FolioStatus.open,
        )
        db.add(folio)

        db.commit()

        # ---- Kitchen vertical: inventory (mix of in/low/out of stock) ----
        inventory_rows = [
            ("All-Purpose Flour", "dry_goods", 40, "kg", 10),
            ("Olive Oil", "pantry", 15, "L", 5),
            ("Almonds", "bakery", 8, "kg", 4),
            ("Chicken Breast", "meat", 25, "kg", 8),
            ("Butter", "dairy", 6, "kg", 5),
            ("Tomatoes", "produce", 2, "kg", 5),
            ("Fresh Basil", "produce", 3, "kg", 5),
            ("Arborio Rice", "dry_goods", 3, "kg", 5),
            ("Salmon Fillets", "seafood", 0, "kg", 6),
            ("Mozzarella Cheese", "dairy", 0, "kg", 3),
        ]
        for name, category, quantity, unit, threshold in inventory_rows:
            db.add(
                models.InventoryItem(
                    property_id=property_.id,
                    name=name,
                    category=category,
                    quantity=quantity,
                    unit=unit,
                    reorder_threshold=threshold,
                )
            )
        db.commit()

        # ---- Kitchen vertical: guests + loyalty accounts across every tier ----
        loyalty_rows = [
            ("Priya Anand", "priya.anand@example.com", 210, "bronze"),
            ("Dana Whitfield", "dana.whitfield@example.com", 1280, "silver"),
            ("Sam Okafor", "sam.okafor@example.com", 4200, "gold"),
            ("Marcus Ling", "marcus.ling@example.com", 6800, "platinum"),
        ]
        for name, email, points, tier in loyalty_rows:
            loyalty_guest = models.Guest(name=name, email=email, loyalty_tier=tier)
            db.add(loyalty_guest)
            db.flush()
            db.add(
                models.LoyaltyAccount(
                    guest_id=loyalty_guest.id, points_balance=points, tier=tier
                )
            )
        db.add(models.LoyaltyAccount(guest_id=guest.id, points_balance=3500, tier="gold"))
        db.commit()

        if db.query(models.User).count() == 0:
            db.add_all(
                [
                    models.User(
                        name="Alex Rivera",
                        email="manager@meridiankitchens.com",
                        hashed_password=hash_password("meridian123"),
                        role=models.UserRole.manager,
                    ),
                    models.User(
                        name="Jordan Lee",
                        email="staff@meridiankitchens.com",
                        hashed_password=hash_password("meridian123"),
                        role=models.UserRole.staff,
                    ),
                ]
            )
            db.commit()

        get_preferences_collection().update_one(
            {"guest_id": guest.id},
            {
                "$set": {
                    "guest_id": guest.id,
                    "dietary": ["vegetarian"],
                    "room_preferences": ["high floor", "away from elevator"],
                    "notes": ["Celebrating anniversary - welcome note requested"],
                    "updated_at": utcnow().isoformat(),
                }
            },
            upsert=True,
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed_if_empty()
    print("Seed complete (or already seeded).")
