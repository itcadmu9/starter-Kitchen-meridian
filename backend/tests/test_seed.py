"""
app/seed.py opens its own SessionLocal/Mongo collection rather than taking them via
FastAPI's Depends() (it runs at startup, outside a request), so — unlike the router
tests — we point its module-level references at the test doubles with monkeypatch
instead of using dependency_overrides.
"""

from app import models
from app.seed import seed_if_empty
from tests.conftest import FakePreferencesCollection, TestingSessionLocal


def _patch_seed_targets(monkeypatch, preferences_store):
    import app.seed as seed_module

    monkeypatch.setattr(seed_module, "SessionLocal", TestingSessionLocal)
    monkeypatch.setattr(
        seed_module,
        "get_preferences_collection",
        lambda: FakePreferencesCollection(preferences_store),
    )


def test_seed_if_empty_populates_demo_data(db_session, preferences_store, monkeypatch):
    _patch_seed_targets(monkeypatch, preferences_store)

    seed_if_empty()

    guests = db_session.query(models.Guest).all()
    assert len(guests) == 5
    jamie = next(g for g in guests if g.email == "jamie.rivera@example.com")

    properties = db_session.query(models.Property).all()
    assert len(properties) == 1

    reservations = db_session.query(models.Reservation).all()
    assert len(reservations) == 1
    assert reservations[0].guest_id == jamie.id

    folios = db_session.query(models.Folio).all()
    assert len(folios) == 1
    assert folios[0].reservation_id == reservations[0].id
    assert folios[0].balance == 792

    assert preferences_store[jamie.id]["dietary"] == ["vegetarian"]

    inventory_items = db_session.query(models.InventoryItem).all()
    assert len(inventory_items) == 10

    loyalty_accounts = db_session.query(models.LoyaltyAccount).all()
    assert len(loyalty_accounts) == 5
    assert {account.tier for account in loyalty_accounts} == {
        "bronze",
        "silver",
        "gold",
        "platinum",
    }


def test_seed_if_empty_is_idempotent(db_session, preferences_store, monkeypatch):
    _patch_seed_targets(monkeypatch, preferences_store)

    seed_if_empty()
    seed_if_empty()  # a second call (e.g. container restart) must not duplicate data

    assert db_session.query(models.Guest).count() == 5
    assert db_session.query(models.Reservation).count() == 1
    assert db_session.query(models.InventoryItem).count() == 10
    assert db_session.query(models.LoyaltyAccount).count() == 5
