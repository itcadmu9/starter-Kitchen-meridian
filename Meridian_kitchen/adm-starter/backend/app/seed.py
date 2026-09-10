"""
Seeds a small set of demo data so the API is immediately testable after
`docker compose up`. Safe to re-run: only seeds when the guests table is empty.

Run standalone with:  docker compose exec backend python -m app.seed
"""

from datetime import date, timedelta

from app import models
from app.database import SessionLocal
from app.models import utcnow
from app.mongo import get_preferences_collection


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(models.Guest).count() > 0:
            if db.query(models.InventoryStock).count() == 0:
                inventory_records = [
                    {"ingredient": "Tomato", "outlet": "Downtown Kitchen", "quantity": 125.5, "reorder_threshold": 20.0},
                    {"ingredient": "Lettuce", "outlet": "Downtown Kitchen", "quantity": 42.0, "reorder_threshold": 15.0},
                    {"ingredient": "Beef", "outlet": "Harbor Grill", "quantity": 18.0, "reorder_threshold": 25.0},
                    {"ingredient": "Rice", "outlet": "Harbor Grill", "quantity": 70.0, "reorder_threshold": 30.0},
                    {"ingredient": "Onion", "outlet": "Riverside Cafe", "quantity": 12.0, "reorder_threshold": 18.0},
                ]
                for record in inventory_records:
                    db.add(models.InventoryStock(**record))
                db.commit()
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

        inventory_records = [
            {"ingredient": "Tomato", "outlet": "Downtown Kitchen", "quantity": 125.5, "reorder_threshold": 20.0},
            {"ingredient": "Lettuce", "outlet": "Downtown Kitchen", "quantity": 42.0, "reorder_threshold": 15.0},
            {"ingredient": "Beef", "outlet": "Harbor Grill", "quantity": 18.0, "reorder_threshold": 25.0},
            {"ingredient": "Rice", "outlet": "Harbor Grill", "quantity": 70.0, "reorder_threshold": 30.0},
            {"ingredient": "Onion", "outlet": "Riverside Cafe", "quantity": 12.0, "reorder_threshold": 18.0},
        ]
        for record in inventory_records:
            db.add(models.InventoryStock(**record))

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
