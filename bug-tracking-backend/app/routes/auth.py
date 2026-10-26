"""
app/routes/auth.py
--------------------
  POST /api/auth/register      - create an account (see "Registering" below)
  POST /api/auth/login         - verify credentials and return a JWT
  GET  /api/auth/me            - the current user + their project + admin request
  PUT  /api/auth/me/preferences - e.g. {"email_notifications": false}

Registering
  * invite_code      -> joins that project as a TESTER (admins promote later)
  * request_admin    -> account with no project + a pending admin request
                        that the owners review (they get an email)
  * email listed in OWNER_EMAILS -> platform owner (no project)
  A client-supplied "role" is always ignored.

Security notes
  - Passwords are hashed (PBKDF2-SHA256) and never returned by any endpoint.
  - Login uses one generic error for unknown email and wrong password so
    the API doesn't reveal which emails are registered.
"""

from flask import Blueprint, g
from werkzeug.security import check_password_hash, generate_password_hash

from app.errors import BadRequestError, UnauthorizedError
from app.extensions import get_db
from app.middleware.auth import generate_token, token_required
from app.services.admin_request_service import create_admin_request, latest_admin_request, validate_reason
from app.services.notification_service import NotificationType, notify, project_admin_ids
from app.services.project_service import find_project_by_code, get_project, is_owner_email, serialize_project
from app.services.user_service import public_user
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import (
    NAME_MAX,
    OWNER_ROLE,
    PASSWORD_MIN,
    clean_str,
    is_valid_email,
    is_valid_password,
    require_fields,
)

auth_bp = Blueprint("auth", __name__)

DUPLICATE_EMAIL = "An account with this email already exists"


def _require(data, fields):
    missing = require_fields(data, fields)
    if missing:
        raise BadRequestError(f"Missing required field(s): {', '.join(missing)}")


def _is_unique_violation(exc):
    """True for PostgreSQL's unique_violation (SQLSTATE 23505)."""
    return getattr(exc, "code", None) == "23505" or "duplicate key" in str(exc)


def session_payload(user):
    """What the frontend needs to decide where the user belongs."""
    project = get_project(user.get("project_id"))
    request_row = None if user["role"] == OWNER_ROLE or project else latest_admin_request(user["id"])
    return {
        "user": public_user(user),
        "project": serialize_project(project, include_code=user["role"] == "admin"),
        "admin_request": request_row and {
            "id": request_row["id"],
            "status": request_row["status"],
            "created_at": request_row.get("created_at"),
        },
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = json_body()
    _require(data, ["name", "email", "password"])

    name = clean_str(data["name"])
    email = clean_str(data["email"]).lower()
    password = data["password"]

    if len(name) > NAME_MAX:
        raise BadRequestError(f"Name must be at most {NAME_MAX} characters")
    if not is_valid_email(email):
        raise BadRequestError("Invalid email format")
    if not is_valid_password(password):
        raise BadRequestError(
            f"Password must be at least {PASSWORD_MIN} characters and include a letter and a number"
        )

    # Decide how this account enters the system BEFORE creating anything.
    project, reason, role = None, None, "tester"
    if is_owner_email(email):
        role = OWNER_ROLE
    elif data.get("request_admin"):
        reason = validate_reason(data.get("reason"))
    else:
        if not clean_str(data.get("invite_code")):
            raise BadRequestError("Enter your project's invite code, or request admin access")
        project = find_project_by_code(data["invite_code"])
        if not project:
            raise BadRequestError("Invite code not found. Check it with your project admin.")

    db = get_db()
    if db.table("users").select("id").eq("email", email).limit(1).execute().data:
        raise BadRequestError(DUPLICATE_EMAIL)

    try:
        result = (
            db.table("users")
            .insert(
                {
                    "name": name,
                    "email": email,
                    "password_hash": generate_password_hash(password),
                    "role": role,  # never trust a client-supplied role
                    "project_id": project["id"] if project else None,
                    "email_notifications": True,
                }
            )
            .execute()
        )
    except Exception as exc:
        # Two sign-ups with the same email at the same moment both pass the
        # check above; the database's UNIQUE constraint stops the second one.
        if _is_unique_violation(exc):
            raise BadRequestError(DUPLICATE_EMAIL) from None
        raise

    user = first_row(result, "Failed to create user")
    g.current_user = user  # so notifications are attributed to the new user

    if reason:
        create_admin_request(user, reason)
        message = "Account created. Your admin request was sent to the owners for review."
    elif project:
        notify(
            project_admin_ids(project["id"]),
            NotificationType.MEMBER_JOINED,
            f"{name} joined {project['name']} as a Tester",
            link="/admin/users",
        )
        message = f"Account created. You joined {project['name']} as a Tester."
    else:
        message = "Owner account created"

    return success_response(message, {"user": public_user(user)}, 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = json_body()
    _require(data, ["email", "password"])

    email = clean_str(data["email"]).lower()
    result = get_db().table("users").select("*").eq("email", email).limit(1).execute()

    user = result.data[0] if result.data else None
    if not user or not check_password_hash(user["password_hash"], data["password"]):
        raise UnauthorizedError("Invalid email or password")

    return success_response("Login successful", {"token": generate_token(user), **session_payload(user)})


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    return success_response("Current user", session_payload(g.current_user))


@auth_bp.route("/me/preferences", methods=["PUT"])
@token_required
def update_preferences():
    data = json_body()
    if not isinstance(data.get("email_notifications"), bool):
        raise BadRequestError("email_notifications must be true or false")
    updated = first_row(
        get_db()
        .table("users")
        .update({"email_notifications": data["email_notifications"]})
        .eq("id", g.current_user["id"])
        .execute(),
        "User not found",
    )
    return success_response("Preferences saved", {"user": public_user(updated)})
