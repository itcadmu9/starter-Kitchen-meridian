from app import models


def test_create_and_list_inventory_item(client, db_session):
    from tests.factories import make_property

    property_ = make_property(db_session)
    db_session.commit()

    resp = client.post(
        "/api/v1/inventory",
        json={
            "property_id": property_.id,
            "name": "Olive Oil",
            "category": "pantry",
            "quantity": "5",
            "unit": "L",
            "reorder_threshold": "2",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Olive Oil"

    resp = client.get("/api/v1/inventory", params={"property_id": property_.id})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_low_stock_endpoint(client, db_session):
    from tests.factories import make_property

    property_ = make_property(db_session)
    db_session.add(
        models.InventoryItem(
            property_id=property_.id,
            name="Flour",
            category="dry_goods",
            quantity=1,
            unit="kg",
            reorder_threshold=10,
        )
    )
    db_session.commit()

    resp = client.get("/api/v1/inventory/low-stock", params={"property_id": property_.id})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_inventory_item_not_found(client):
    resp = client.get("/api/v1/inventory/does-not-exist")
    assert resp.status_code == 404
