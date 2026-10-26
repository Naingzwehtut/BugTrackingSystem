"""End-to-end bug lifecycle, validation, history and comments."""

from tests.conftest import BUG


def _status(client, bug_id, who, status):
    return client.put(f"/api/bugs/{bug_id}/status", json={"status": status}, headers=who)


def test_create_bug_validates_input(client, headers):
    h = headers["tester"]
    assert client.post("/api/bugs", json={**BUG, "title": "x"}, headers=h).status_code == 400
    assert client.post("/api/bugs", json={**BUG, "priority": "Urgent"}, headers=h).status_code == 400
    assert client.post("/api/bugs", json={"title": "Only title"}, headers=h).status_code == 400
    ok = client.post("/api/bugs", json=BUG, headers=h)
    bug = ok.get_json()["data"]["bug"]
    assert ok.status_code == 201 and bug["status"] == "Open"
    assert bug["reporter_name"] == "Tester User" and bug["assigned_developer_name"] is None


def test_full_lifecycle_with_history(client, headers, people, bug_id):
    dev = people["developer"]
    assigned = client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": dev["id"]}, headers=headers["admin"])
    assert assigned.status_code == 200
    assert assigned.get_json()["data"]["bug"]["assigned_developer_name"] == dev["name"]

    assert _status(client, bug_id, headers["developer"], "In Progress").status_code == 200
    assert _status(client, bug_id, headers["developer"], "Resolved").status_code == 200
    reopened = _status(client, bug_id, headers["tester"], "Reopened")
    assert reopened.status_code == 200
    assert _status(client, bug_id, headers["developer"], "In Progress").status_code == 200
    assert _status(client, bug_id, headers["developer"], "Resolved").status_code == 200
    closed = _status(client, bug_id, headers["tester"], "Closed")
    assert closed.get_json()["data"]["bug"]["status"] == "Closed"

    history = client.get(f"/api/bugs/{bug_id}/history", headers=headers["admin"]).get_json()["data"]["history"]
    assert [h["action"] for h in history][:2] == ["created", "assignment_changed"]
    assert history[1]["new_value_label"] == dev["name"]  # id resolved to a readable name
    assert history[0]["user_name"] == "Tester User"
    assert sum(h["action"] == "status_changed" for h in history) == 6  # six status moves in the full lifecycle


def test_invalid_and_forbidden_status_moves(client, headers, people, bug_id):
    client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": people["developer"]["id"]}, headers=headers["admin"])
    bad = _status(client, bug_id, headers["developer"], "Closed")
    assert bad.status_code == 400 and "Invalid status transition" in bad.get_json()["message"]
    assert _status(client, bug_id, headers["tester"], "In Progress").status_code == 403  # wrong role for the move
    assert _status(client, bug_id, headers["other_dev"], "In Progress").status_code == 403  # not their bug
    assert _status(client, bug_id, headers["developer"], "Nonsense").status_code == 400


def test_role_permissions(client, headers, people, bug_id):
    dev_id = people["developer"]["id"]
    assert client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": dev_id}, headers=headers["tester"]).status_code == 403
    assert client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": people["tester"]["id"]}, headers=headers["admin"]).status_code == 400
    assert client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": "nope"}, headers=headers["admin"]).status_code == 400
    assert client.post("/api/bugs", json=BUG, headers=headers["developer"]).status_code == 403
    assert client.delete(f"/api/bugs/{bug_id}", headers=headers["developer"]).status_code == 403
    assert client.get("/api/users", headers=headers["tester"]).status_code == 403
    assert client.put(f"/api/bugs/{bug_id}", json={"title": "Edited"}, headers=headers["tester"]).status_code == 403


def test_developer_visibility(client, headers, people, bug_id):
    dev_list = client.get("/api/bugs", headers=headers["developer"]).get_json()["data"]
    assert dev_list["count"] == 0
    assert client.get(f"/api/bugs/{bug_id}", headers=headers["developer"]).status_code == 403

    client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": people["developer"]["id"]}, headers=headers["admin"])
    assert client.get("/api/bugs", headers=headers["developer"]).get_json()["data"]["count"] == 1
    assert client.get("/api/bugs", headers=headers["other_dev"]).get_json()["data"]["count"] == 0
    assert client.get(f"/api/bugs/{bug_id}/comments", headers=headers["other_dev"]).status_code == 403


def test_admin_edit_filters_and_delete(client, headers, bug_id):
    edit = client.put(f"/api/bugs/{bug_id}", json={"priority": "Low", "severity": "Minor"}, headers=headers["admin"])
    assert edit.status_code == 200 and edit.get_json()["data"]["bug"]["priority"] == "Low"
    history = client.get(f"/api/bugs/{bug_id}/history", headers=headers["admin"]).get_json()["data"]["history"]
    assert {"priority_changed", "severity_changed"} <= {h["action"] for h in history}

    assert client.put(f"/api/bugs/{bug_id}", json={}, headers=headers["admin"]).status_code == 400
    assert client.get("/api/bugs?status=Open", headers=headers["admin"]).get_json()["data"]["count"] == 1
    assert client.get("/api/bugs?status=Closed", headers=headers["admin"]).get_json()["data"]["count"] == 0

    assert client.delete(f"/api/bugs/{bug_id}", headers=headers["admin"]).status_code == 200
    assert client.get(f"/api/bugs/{bug_id}", headers=headers["admin"]).status_code == 404


def test_malformed_ids_are_404_not_500(client, headers):
    for path in ("/api/bugs/not-a-uuid", "/api/bugs/not-a-uuid/comments", "/api/bugs/not-a-uuid/history"):
        assert client.get(path, headers=headers["admin"]).status_code == 404
    assert client.put("/api/users/not-a-uuid/role", json={"role": "admin"}, headers=headers["admin"]).status_code == 404


def test_comments(client, headers, bug_id):
    resp = client.post(f"/api/bugs/{bug_id}/comments", json={"comment": "  Reproduced on staging.  "}, headers=headers["tester"])
    comment = resp.get_json()["data"]["comment"]
    assert resp.status_code == 201
    assert comment["comment"] == "Reproduced on staging."
    assert comment["user_name"] == "Tester User" and comment["user_role"] == "tester"

    assert client.post(f"/api/bugs/{bug_id}/comments", json={"comment": "   "}, headers=headers["tester"]).status_code == 400
    listed = client.get(f"/api/bugs/{bug_id}/comments", headers=headers["admin"]).get_json()["data"]["comments"]
    assert [c["user_name"] for c in listed] == ["Tester User"]


def test_admin_can_change_roles_and_list_developers(client, headers, people):
    resp = client.put(f"/api/users/{people['tester']['id']}/role", json={"role": "developer"}, headers=headers["admin"])
    assert resp.status_code == 200 and resp.get_json()["data"]["user"]["role"] == "developer"
    assert client.put(f"/api/users/{people['tester']['id']}/role", json={"role": "boss"}, headers=headers["admin"]).status_code == 400
    devs = client.get("/api/users/developers", headers=headers["tester"]).get_json()["data"]["developers"]
    assert len(devs) == 3


# --- regression tests for the second refactor pass ---------------------------
def test_non_object_json_body_is_400_not_500(client, headers, people, bug_id):
    # A JSON array used to reach `.get()` and crash the request with a 500.
    assert client.post("/api/auth/register", json=["x"]).status_code == 400
    assert client.post("/api/auth/login", json=["x"]).status_code == 400
    assert client.post("/api/bugs", json=["x"], headers=headers["tester"]).status_code == 400
    assert client.put(f"/api/bugs/{bug_id}/status", json=[1], headers=headers["admin"]).status_code == 400
    assert client.put(f"/api/users/{people['tester']['id']}/role", json=["admin"], headers=headers["admin"]).status_code == 400
    resp = client.post(f"/api/bugs/{bug_id}/comments", json="hi", headers=headers["tester"])
    assert resp.status_code == 400 and resp.get_json()["message"] == "Request body must be a JSON object"


def test_list_filters_are_validated(client, headers, people, bug_id):
    admin = headers["admin"]
    assert client.get("/api/bugs?status=Bogus", headers=admin).status_code == 400
    assert client.get("/api/bugs?priority=Urgent", headers=admin).status_code == 400
    # A malformed id made PostgreSQL reject the uuid (500); now it's a clean 400.
    assert client.get("/api/bugs?assigned_to=abc", headers=admin).status_code == 400
    dev_id = people["developer"]["id"]
    client.put(f"/api/bugs/{bug_id}/assign", json={"assigned_to": dev_id}, headers=admin)
    assert client.get(f"/api/bugs?assigned_to={dev_id}&severity=Major", headers=admin).get_json()["data"]["count"] == 1
    # Developers stay scoped to their own bugs even if they ask for someone else's.
    other = client.get(f"/api/bugs?assigned_to={dev_id}", headers=headers["other_dev"])
    assert other.get_json()["data"]["count"] == 0


def test_admin_cannot_change_own_role(client, headers, people):
    resp = client.put(f"/api/users/{people['admin']['id']}/role", json={"role": "tester"}, headers=headers["admin"])
    assert resp.status_code == 400 and "your own role" in resp.get_json()["message"]
    me = client.get("/api/auth/me", headers=headers["admin"]).get_json()["data"]["user"]
    assert me["role"] == "admin"


def test_reassigning_same_developer_is_a_noop(client, headers, people, bug_id):
    body = {"assigned_to": people["developer"]["id"]}
    client.put(f"/api/bugs/{bug_id}/assign", json=body, headers=headers["admin"])
    again = client.put(f"/api/bugs/{bug_id}/assign", json=body, headers=headers["admin"])
    assert again.status_code == 200
    history = client.get(f"/api/bugs/{bug_id}/history", headers=headers["admin"]).get_json()["data"]["history"]
    assert sum(h["action"] == "assignment_changed" for h in history) == 1


def test_oversized_body_is_rejected(client):
    resp = client.post("/api/auth/login", data="x" * (2 * 1024 * 1024), content_type="application/json")
    assert resp.status_code == 413 and resp.get_json()["success"] is False
