"""
app/services/admin_request_service.py
---------------------------------------
"Request admin access": a user asks the platform owners for the admin role.
Owners get a notification + email, and approve or reject in the app.
"""

from datetime import datetime, timezone

from app.errors import BadRequestError, ConflictError
from app.extensions import get_db
from app.services.notification_service import NotificationType, notify, owner_ids
from app.utils.request import first_row
from app.utils.validators import REASON_MAX, REASON_MIN, clean_str


def validate_reason(value):
    reason = clean_str(value)
    if not reason or len(reason) < REASON_MIN:
        raise BadRequestError(f"Tell the owners why you need admin access (at least {REASON_MIN} characters)")
    if len(reason) > REASON_MAX:
        raise BadRequestError(f"Reason must be at most {REASON_MAX} characters")
    return reason


def latest_admin_request(user_id):
    rows = (
        get_db()
        .table("admin_requests")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
        .data
    )
    return rows[0] if rows else None


def create_admin_request(user, reason):
    latest = latest_admin_request(user["id"])
    if latest and latest["status"] == "pending":
        raise ConflictError("You already have a pending admin request")

    row = first_row(
        get_db()
        .table("admin_requests")
        .insert({"user_id": user["id"], "reason": reason, "status": "pending"})
        .execute(),
        "Failed to create admin request",
    )
    notify(
        owner_ids(),
        NotificationType.ADMIN_REQUESTED,
        f"{user['name']} requested admin access",
        link="/owner/requests",
        email=(
            f"Admin access request from {user['name']}",
            f"{user['name']} ({user['email']}) requested admin access",
            f"Reason:\n{reason}\n\nReview it on the Admin Requests page.",
        ),
    )
    return row


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()
