def test_ask_assistant_returns_response(client):
    resp = client.post("/api/v1/assistant", json={"prompt": "What's low on stock?"})
    assert resp.status_code == 200
    assert resp.json()["response"]


def test_ask_assistant_empty_prompt(client):
    resp = client.post("/api/v1/assistant", json={"prompt": "   "})
    assert resp.status_code == 200
    assert resp.json()["response"] == "Please provide a question."
