from app import models


def test_inventory_stock_list_returns_records(client, db_session):
    stock = models.InventoryStock(
        ingredient="Tomato",
        outlet="Downtown Kitchen",
        quantity=125.5,
        reorder_threshold=20.0,
    )
    db_session.add(stock)
    db_session.commit()

    response = client.get("/api/v1/inventory-stock")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["ingredient"] == "Tomato"
    assert payload[0]["outlet"] == "Downtown Kitchen"
    assert payload[0]["quantity"] == 125.5
    assert payload[0]["reorder_threshold"] == 20.0
