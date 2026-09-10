from tests.factories import make_property


def test_create_and_list_reorder_requests(client, db_session):
    from app import models

    property_ = make_property(db_session)
    item = models.InventoryItem(
        property_id=property_.id,
        name="Tomatoes",
        category="produce",
        quantity=2,
        unit="kg",
        reorder_threshold=5,
    )
    db_session.add(item)
    db_session.commit()

    resp = client.post(
        "/api/v1/reorder",
        json={"property_id": property_.id, "inventory_item_id": item.id, "quantity": "10"},
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"

    resp = client.get("/api/v1/reorder", params={"property_id": property_.id})
    assert resp.status_code == 200
    assert len(resp.json()) == 1
