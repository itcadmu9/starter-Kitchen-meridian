def test_register_and_login(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Manager",
            "email": "test.manager@example.com",
            "password": "pw123456",
            "role": "manager",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "test.manager@example.com"
    assert body["role"] == "manager"
    assert "password" not in body

    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test.manager@example.com", "password": "pw123456"},
    )
    assert resp.status_code == 200
    token_body = resp.json()
    assert token_body["token_type"] == "bearer"
    assert token_body["user"]["email"] == "test.manager@example.com"

    resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_body['access_token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "test.manager@example.com"


def test_register_duplicate_email_rejected(client):
    payload = {"name": "One", "email": "dup@example.com", "password": "pw123456"}
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_login_wrong_password_rejected(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "One", "email": "wrongpw@example.com", "password": "pw123456"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpw@example.com", "password": "not-the-password"},
    )
    assert resp.status_code == 401


def test_me_requires_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
