from tests.factories import make_guest


def test_get_loyalty_account_creates_default(client, db_session):
    guest = make_guest(db_session)
    db_session.commit()

    resp = client.get(f"/api/v1/loyalty/{guest.id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["guest_id"] == guest.id
    assert body["tier"] == "bronze"


def test_adjust_loyalty_points(client, db_session):
    guest = make_guest(db_session)
    db_session.commit()

    resp = client.post(f"/api/v1/loyalty/{guest.id}/adjust", json={"points_delta": "50"})
    assert resp.status_code == 200
    assert float(resp.json()["points_balance"]) == 50.0
