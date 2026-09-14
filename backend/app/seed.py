"""
Seeds a small set of demo data so the API is immediately testable after
`docker compose up`. Safe to re-run: only seeds when the guests table is empty.

Run standalone with:  docker compose exec backend python -m app.seed
"""

from datetime import date, timedelta

from app import models
from app.database import SessionLocal
from app.models import utcnow
from app.core.security import hash_password
from app.mongo import get_preferences_collection


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        property_ = db.query(models.Property).first()
        if not property_:
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
            guest = models.Guest(
                name="Jamie Rivera",
                email="jamie.rivera@example.com",
                phone="+1-555-0100",
                loyalty_tier="gold",
            )
            db.add_all([rate_plan, guest])
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
            db.add(models.Folio(
                reservation_id=reservation.id,
                line_items=[
                    {"description": "3 nights - Standard Rate", "amount": 747.00},
                    {"description": "Resort fee", "amount": 45.00},
                ],
                balance=792.00,
                status=models.FolioStatus.open,
            ))

        guest = db.query(models.Guest).first()
        if not guest:
            guest = models.Guest(
                name="Jamie Rivera",
                email="jamie.rivera@example.com",
                phone="+1-555-0100",
                loyalty_tier="gold",
            )
            db.add(guest)
            db.flush()

        locations = ["Chickpet", "Whitefield", "Trinity", "Indiranagar", "Koramangala", "HSR Layout", "Malleshwaram"]
        existing_items = db.query(models.InventoryItem).order_by(models.InventoryItem.name).all()
        for index, item in enumerate(existing_items):
            if item.outlet == "Main Kitchen":
                item.outlet = locations[index % len(locations)]
            item.unit = "kg"

        inventory = [
            ("Rice Noodles", "Dry goods", 18, 6), ("Coconut Milk", "Pantry", 24, 8),
            ("Soy Sauce", "Pantry", 12, 4), ("Sesame Seeds", "Dry goods", 9, 3),
            ("Paneer", "Dairy", 14, 5), ("Yogurt", "Dairy", 20, 6),
            ("Onions", "Produce", 35, 10), ("Garlic", "Produce", 7, 4),
            ("Ginger", "Produce", 6, 3), ("Carrots", "Produce", 16, 5),
            ("Bell Peppers", "Produce", 4, 6), ("Spinach", "Produce", 0, 4),
            ("Lentils", "Dry goods", 22, 8), ("Chickpeas", "Dry goods", 17, 6),
            ("Turmeric", "Spices", 5, 2), ("Garam Masala", "Spices", 3, 2),
            ("Chili Powder", "Spices", 0, 3), ("Coriander", "Spices", 8, 3),
            ("Cumin", "Spices", 7, 3), ("Cardamom", "Spices", 2, 2),
        ]
        new_items = []
        for outlet in locations:
            outlet_names = {item.name for item in existing_items if item.outlet == outlet}
            for name, category, quantity, threshold in inventory:
                if len(outlet_names) >= 10:
                    break
                if name in outlet_names:
                    continue
                new_items.append(models.InventoryItem(
                    property_id=property_.id,
                    outlet=outlet,
                    name=name,
                    category=category,
                    quantity=quantity,
                    unit="kg",
                    reorder_threshold=threshold,
                ))
                outlet_names.add(name)
        db.add_all(new_items)

        menu_items = [
            ("Chicken Bowl", 450, ["chicken", "rice", "vegetables"], [], "Chickpet"),
            ("Nutty Pasta", 400, ["pasta", "peanut", "sauce"], ["peanuts"], "Chickpet"),
            ("Margherita", 350, ["cheese", "tomato", "basil"], ["milk"], "Chickpet"),
            ("Paneer Tikka", 380, ["paneer", "spices", "peppers"], ["milk"], "Whitefield"),
            ("Green Garden Bowl", 320, ["spinach", "carrots", "rice"], [], "Whitefield"),
            ("Chicken Tikka", 420, ["chicken", "yogurt", "spices"], ["milk"], "Trinity"),
            ("Tandoori Vegetables", 290, ["cauliflower", "peppers", "spices"], [], "Trinity"),
        ]
        for name, price, ingredients, allergens, outlet in menu_items:
            if not db.query(models.MenuItem).filter_by(name=name, outlet=outlet).first():
                db.add(models.MenuItem(property_id=property_.id, name=name, price=price, ingredients=ingredients, allergens=allergens, outlet=outlet))

        demo_users = [
            ("Arjun", "staff1@meridian.com", "staff123", models.UserRole.staff, "Chickpet"),
            ("Neha", "staff2@meridian.com", "staff123", models.UserRole.staff, "Whitefield"),
            ("Ravi", "staff3@meridian.com", "staff123", models.UserRole.staff, "Trinity"),
            ("Maya", "staff4@meridian.com", "staff123", models.UserRole.staff, "Indiranagar"),
            ("Admin Manager", "manager@meridian.com", "manager123", models.UserRole.manager, None),
        ]
        for name, email, password, role, outlet in demo_users:
            if not db.query(models.User).filter_by(email=email).first():
                db.add(models.User(name=name, email=email, password_hash=hash_password(password), role=role, outlet=outlet, property_id=property_.id))

        balances = {
            "Sam Okafor": (7200, "platinum"), "Marcus Ling": (7000, "platinum"),
            "Jamie Rivera": (3500, "gold"), "Anika Shah": (2800, "gold"),
            "Rohan Mehta": (2400, "silver"), "Priya Nair": (1900, "silver"),
            "Vikram Rao": (1500, "silver"), "Neha Kapoor": (1100, "bronze"),
            "Arjun Das": (800, "bronze"), "Isha Menon": (500, "bronze"),
        }
        existing_guests = {member.name: member for member in db.query(models.Guest).all()}
        for name, (points, tier) in balances.items():
            if name not in existing_guests:
                member = models.Guest(name=name, email=f"{name.lower().replace(' ', '.')}@example.com", loyalty_tier=tier)
                db.add(member)
                db.flush()
                existing_guests[name] = member
            if not db.query(models.LoyaltyAccount).filter_by(guest_id=existing_guests[name].id).first():
                db.add(models.LoyaltyAccount(guest_id=existing_guests[name].id, points_balance=points, tier=tier))

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
