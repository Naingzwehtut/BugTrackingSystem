"""
app/routes/admin_requests.py
------------------------------
  POST /api/admin-requests             - ask for admin access      (user without a project)
  GET  /api/admin-requests             - all requests, newest first (owner)
  PUT  /api/admin-requests/<id>        - {"decision": "approve" | "reject"} (owner)

Approving makes the user an admin; they then create their project on the
Welcome page. Either way the user gets a notification and an email.
"""

from flask import Blueprint, g

from app.errors import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.extensions import get_db
from app.middleware.auth import token_required
from app.middleware.permissions import role_required
from app.services.admin_request_service import create_admin_request, utc_now_iso, validate_reason
from app.services.notification_service import NotificationType, notify
from app.services.user_service import fetch_user_names
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import OWNER_ROLE, is_valid_uuid

admin_requests_bp = Blueprint("admin_requests", __name__)


@admin_requests_bp.route("", methods=["POST"])
@token_required
def request_admin():
    user = g.current_user
    if user["role"] in (OWNER_ROLE, "admin"):
        raise BadRequestError("You already have admin access")
    if user.get("project_id"):
        raise ForbiddenError("You are already a member of a project. Ask its admin to promote you.")
    row = create_admin_request(user, validate_reason(json_body().get("reason")))
    return success_response("Admin request sent to the owners", {"request": row}, 201)


@admin_requests_bp.route("", methods=["GET"])
@token_required
@role_required(OWNER_ROLE)
def list_requests():
    db = get_db()
    rows = db.table("admin_requests").select("*").order("created_at", desc=True).execute().data
    users = {}
    ids = sorted({r["user_id"] for r in rows})
    if ids:
        users = {u["id"]: u for u in db.table("users").select("id, name, email, role").in_("id", ids).execute().data}
    reviewers = fetch_user_names(r.get("reviewed_by") for r in rows)
    requests = [
        {
            **row,
            "user_name": users.get(row["user_id"], {}).get("name"),
            "user_email": users.get(row["user_id"], {}).get("email"),
            "reviewed_by_name": reviewers.get(row.get("reviewed_by")),
        }
        for row in rows
    ]
    return success_response("Admin requests retrieved", {"requests": requests})


@admin_requests_bp.route("/<request_id>", methods=["PUT"])
@token_required
@role_required(OWNER_ROLE)
def decide(request_id):
    decision = json_body().get("decision")
    if decision not in ("approve", "reject"):
        raise BadRequestError("decision must be 'approve' or 'reject'")

    db = get_db()
    rows = db.table("admin_requests").select("*").eq("id", request_id).limit(1).execute().data if is_valid_uuid(request_id) else []
    if not rows:
        raise NotFoundError("Admin request not found")
    request_row = rows[0]
    if request_row["status"] != "pending":
        raise ConflictError(f"This request was already {request_row['status']}")

    status = "approved" if decision == "approve" else "rejected"
    updated = first_row(
        db.table("admin_requests")
        .update({"status": status, "reviewed_by": g.current_user["id"], "reviewed_at": utc_now_iso()})
        .eq("id", request_row["id"])
        .execute()
    )
    if status == "approved":
        db.table("users").update({"role": "admin"}).eq("id", request_row["user_id"]).execute()
        message = "Your admin request was approved. Create your project to get started."
        body = "You can now create a project and invite your team with its invite code."
    else:
        message = "Your admin request was not approved. You can still join a project with an invite code."
        body = "You can join an existing project with an invite code from its admin, or contact the owners."

    notify(
        [request_row["user_id"]],
        NotificationType.ADMIN_REQUEST_DECIDED,
        message,
        link="/welcome",
        email=(f"Your admin request was {status}", message, body),
    )
    return success_response(f"Request {status}", {"request": updated})
