"""Registration, login and token handling."""

from tests.conftest import PASSWORD


def test_register_creates_tester_and_hides_hash(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Ann", "email": "ANN@Example.com", "password": PASSWORD, "role": "admin"},
    )
    assert resp.status_code == 201
    user = resp.get_json()["data"]["user"]
    assert user["role"] == "tester"  # client-supplied role is ignored
    assert user["email"] == "ann@example.com"
    assert "password_hash" not in user


def test_register_validation_and_duplicates(client):
    body = {"name": "Ann", "email": "ann@example.com", "password": PASSWORD}
    assert client.post("/api/auth/register", json={**body, "password": "weak"}).status_code == 400
    assert client.post("/api/auth/register", json={**body, "email": "bad"}).status_code == 400
    assert client.post("/api/auth/register", json={**body, "name": 123}).status_code == 400
    assert client.post("/api/auth/register", json=body).status_code == 201
    assert client.post("/api/auth/register", json=body).status_code == 400


def test_login_success_and_failures(client, people):
    ok = client.post("/api/auth/login", json={"email": "tester@example.com", "password": PASSWORD})
    assert ok.status_code == 200 and ok.get_json()["data"]["token"]

    wrong = client.post("/api/auth/login", json={"email": "tester@example.com", "password": "nope"})
    unknown = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": PASSWORD})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.get_json()["message"] == unknown.get_json()["message"]  # no account enumeration


def test_protected_endpoint_requires_valid_token(client, headers):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401
    me = client.get("/api/auth/me", headers=headers["tester"])
    assert me.status_code == 200 and me.get_json()["data"]["user"]["role"] == "tester"


def test_unknown_route_returns_json_envelope(client):
    resp = client.get("/api/nope")
    assert resp.status_code == 404 and resp.get_json()["success"] is False
