"""
app/routes/users.py
---------------------
  GET /api/users             - list all users                 (admin)
  GET /api/users/developers  - list developers for dropdowns  (any logged-in user)
  PUT /api/users/<id>/role   - change a user's role           (admin)
"""

from flask import Blueprint, g

from app.errors import BadRequestError, NotFoundError
from app.extensions import get_db
from app.middleware.auth import token_required
from app.middleware.permissions import project_required, role_required
from app.services.notification_service import NotificationType, notify
from app.services.user_service import public_user
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import ROLES, is_valid_role, is_valid_uuid, one_of_message

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@token_required
@project_required
@role_required("admin")
def list_users():
    result = (
        get_db()
        .table("users")
        .select("id, name, email, role, created_at")
        .eq("project_id", g.current_user["project_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return success_response("Users retrieved", {"users": result.data})


@users_bp.route("/developers", methods=["GET"])
@token_required
@project_required
def list_developers():
    result = (
        get_db()
        .table("users")
        .select("id, name, email")
        .eq("role", "developer")
        .eq("project_id", g.current_user["project_id"])
        .order("name")
        .execute()
    )
    return success_response("Developers retrieved", {"developers": result.data})


@users_bp.route("/<user_id>/role", methods=["PUT"])
@token_required
@project_required
@role_required("admin")
def update_user_role(user_id):
    new_role = json_body().get("role")
    if not is_valid_role(new_role):
        raise BadRequestError(one_of_message("role", ROLES))

    db = get_db()
    # Only members of the admin's own project can be found (others are 404).
    found = (
        db.table("users").select("id, role").eq("id", user_id).eq("project_id", g.current_user["project_id"]).limit(1).execute().data
        if is_valid_uuid(user_id)
        else []
    )
    if not found:
        raise NotFoundError("User not found")

    # An admin demoting themselves could leave nobody able to manage roles.
    # The UI already prevented this; now the API enforces it too.
    if user_id == g.current_user["id"]:
        raise BadRequestError("You cannot change your own role")

    updated = first_row(db.table("users").update({"role": new_role}).eq("id", user_id).execute(), "User not found")
    if found[0]["role"] != new_role:
        label = {"admin": "an Admin", "tester": "a Tester", "developer": "a Developer"}[new_role]
        notify(
            [user_id],
            NotificationType.ROLE_CHANGED,
            f"{g.current_user['name']} made you {label}",
            link="/",
            email=(f"Your role is now {new_role.title()}", f"You are now {label}", f"{g.current_user['name']} changed your role. Refresh the app to see your new dashboard."),
        )
    return success_response("User role updated", {"user": public_user(updated)})
