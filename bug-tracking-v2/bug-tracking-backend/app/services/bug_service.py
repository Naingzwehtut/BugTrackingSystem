"""
app/services/bug_service.py
-----------------------------
Business helpers shared by the bug and comment routes: loading a bug,
visibility rules, audit-trail writes, and response serializers.

Lookup helpers raise ApiError subclasses (see app/errors.py), so routes
never need `if error: return error` boilerplate.
"""

from datetime import datetime, timezone

from flask import g

from app.errors import ForbiddenError, NotFoundError
from app.extensions import get_db
from app.services.user_service import fetch_user_names
from app.utils.request import first_row
from app.utils.validators import is_valid_uuid


class HistoryAction:
    CREATED = "created"
    STATUS_CHANGED = "status_changed"
    ASSIGNMENT_CHANGED = "assignment_changed"
    PRIORITY_CHANGED = "priority_changed"
    SEVERITY_CHANGED = "severity_changed"


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


# --- loading & visibility ----------------------------------------------------
def fetch_bug(bug_id):
    """
    Return the bug row, or None if the id is malformed, doesn't exist, or
    belongs to another project (other projects' bugs are invisible: 404).
    """
    if not is_valid_uuid(bug_id):
        return None
    result = (
        get_db()
        .table("bugs")
        .select("*")
        .eq("id", bug_id)
        .eq("project_id", g.current_user.get("project_id"))
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def can_view_bug(user, bug):
    """Admins and testers see every bug; developers only their assigned ones."""
    if user["role"] in ("admin", "tester"):
        return True
    return bug.get("assigned_to") == user["id"]


def get_bug_or_404(bug_id):
    """Return the bug, or raise 404 if it doesn't exist."""
    bug = fetch_bug(bug_id)
    if bug is None:
        raise NotFoundError("Bug not found")
    return bug


def get_viewable_bug(bug_id, action="view this bug"):
    """Like get_bug_or_404 but also enforces per-role visibility (403)."""
    bug = get_bug_or_404(bug_id)
    if not can_view_bug(g.current_user, bug):
        raise ForbiddenError(f"You do not have permission to {action}")
    return bug


def update_bug_row(bug_id, values):
    """Apply `values` (plus a fresh updated_at) and return the updated row."""
    result = get_db().table("bugs").update({**values, "updated_at": utc_now_iso()}).eq("id", bug_id).execute()
    return first_row(result, "Bug not found")


# --- audit trail -------------------------------------------------------------
def record_history(bug_id, action, old_value, new_value):
    """Append an audit-trail row attributed to the current user."""
    get_db().table("bug_history").insert(
        {
            "bug_id": bug_id,
            "user_id": g.current_user["id"],
            "action": action,
            "old_value": None if old_value is None else str(old_value),
            "new_value": None if new_value is None else str(new_value),
        }
    ).execute()


# --- serializers -------------------------------------------------------------
def attach_user_names(bugs):
    """
    Add `reporter_name` and `assigned_developer_name` to each bug.

    Uses one extra query for ALL bugs (not one per bug). A plain lookup is used
    instead of a PostgREST embed because `bugs` has two foreign keys to
    `users`, which makes an un-hinted embed ambiguous.
    """
    names = fetch_user_names(
        uid for bug in bugs for uid in (bug.get("reported_by"), bug.get("assigned_to"))
    )
    return [
        {
            **bug,
            "reporter_name": names.get(bug.get("reported_by")),
            "assigned_developer_name": names.get(bug.get("assigned_to")),
        }
        for bug in bugs
    ]


def serialize_comment(row, author=None):
    """Flatten the embedded `users` join into `user_name` / `user_role`."""
    joined = row.get("users") or author or {}
    return {
        "id": row["id"],
        "bug_id": row["bug_id"],
        "user_id": row["user_id"],
        "comment": row["comment"],
        "created_at": row["created_at"],
        "user_name": joined.get("name"),
        "user_role": joined.get("role"),
    }


def serialize_history(rows):
    """Flatten the user join and resolve assignee ids into readable names."""
    assignment_ids = [
        value
        for row in rows
        if row["action"] == HistoryAction.ASSIGNMENT_CHANGED
        for value in (row.get("old_value"), row.get("new_value"))
    ]
    names = fetch_user_names(assignment_ids)

    def label(row, field):
        value = row.get(field)
        if row["action"] == HistoryAction.ASSIGNMENT_CHANGED:
            return names.get(value, value)
        return value

    return [
        {
            "id": row["id"],
            "bug_id": row["bug_id"],
            "user_id": row["user_id"],
            "action": row["action"],
            "old_value": row.get("old_value"),
            "new_value": row.get("new_value"),
            "old_value_label": label(row, "old_value"),
            "new_value_label": label(row, "new_value"),
            "created_at": row["created_at"],
            "user_name": (row.get("users") or {}).get("name"),
        }
        for row in rows
    ]
