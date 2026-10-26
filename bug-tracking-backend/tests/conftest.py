"""Shared pytest fixtures: an app wired to an in-memory fake Supabase."""

import pytest
from werkzeug.security import generate_password_hash

from app import create_app
from tests.fakes import FakeSupabase

PASSWORD = "Passw0rd1"


@pytest.fixture()
def db():
    return FakeSupabase()


@pytest.fixture()
def outbox():
    """Every email the app 'sends' during a test: (to, subject, text, html)."""
    return []


@pytest.fixture()
def app(db, outbox):
    return create_app(
        config_overrides={
            "TESTING": True,
            "JWT_SECRET_KEY": "unit-test-secret-unit-test-secret-1234",
            "OWNER_EMAILS": "owner@example.com",
            "EMAIL_SENDER": lambda *message: outbox.append(message),
            "SSE_KEEPALIVE_SECONDS": 0.05,
            "SSE_MAX_SECONDS": 1,
        },
        supabase_client=db,
    )


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def project(db):
    """The project every `people` member belongs to."""
    db.table("projects").insert({"name": "Demo Project", "invite_code": "BUG-DEMO23", "created_by": None}).execute()
    return db.tables["projects"][-1]


@pytest.fixture()
def make_user(db, project):
    """Insert a user directly into the fake DB (registration only makes testers)."""

    def _make(role, name=None, email=None, project_id="default"):
        row = {
            "name": name or f"{role.title()} User",
            "email": email or f"{role}@example.com",
            "password_hash": generate_password_hash(PASSWORD),
            "role": role,
            "project_id": project["id"] if project_id == "default" else project_id,
            "email_notifications": True,
        }
        db.table("users").insert(row).execute()
        return next(u for u in db.tables["users"] if u["email"] == row["email"])

    return _make


@pytest.fixture()
def login(client):
    def _login(user):
        resp = client.post("/api/auth/login", json={"email": user["email"], "password": PASSWORD})
        assert resp.status_code == 200, resp.get_json()
        return {"Authorization": f"Bearer {resp.get_json()['data']['token']}"}

    return _login


@pytest.fixture()
def people(make_user):
    return {
        "admin": make_user("admin"),
        "tester": make_user("tester"),
        "developer": make_user("developer"),
        "other_dev": make_user("developer", "Other Dev", "other.dev@example.com"),
    }


@pytest.fixture()
def headers(people, login):
    return {role: login(user) for role, user in people.items()}


BUG = {
    "title": "Checkout page crashes",
    "description": "Applying a coupon returns a 500 error.",
    "severity": "Major",
    "priority": "High",
}


@pytest.fixture()
def bug_id(client, headers):
    resp = client.post("/api/bugs", json=BUG, headers=headers["tester"])
    assert resp.status_code == 201
    return resp.get_json()["data"]["bug"]["id"]
