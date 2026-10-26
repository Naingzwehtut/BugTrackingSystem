"""
app/middleware/auth.py
------------------------
JWT handling: creating a token at login, validating it on every protected
request, and the `@token_required` decorator that routes use.

On success `@token_required` stores the freshly loaded user on
`flask.g.current_user` (without password_hash). The user row is re-read from
the database on each request so role changes and deleted accounts take
effect immediately instead of trusting stale data inside the token.
"""

from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, request

from app.errors import UnauthorizedError
from app.extensions import get_db


def generate_token(user):
    """Create a signed JWT for a user dict containing id, email and role."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "iat": now,
        "exp": now + timedelta(hours=current_app.config["JWT_EXPIRES_HOURS"]),
    }
    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )
    return token.decode("utf-8") if isinstance(token, bytes) else token  # PyJWT < 2


def decode_token(token):
    """Decode and validate a JWT. Raises a jwt exception on failure."""
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=[current_app.config["JWT_ALGORITHM"]],
    )


def _bearer_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header.split(" ", 1)[1].strip() or None


USER_COLUMNS = "id, name, email, role, project_id, email_notifications, created_at"


def load_current_user():
    """Validate the Bearer token and return the user row it belongs to (or 401)."""
    token = _bearer_token()
    if not token:
        raise UnauthorizedError("Missing or invalid Authorization header")

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired, please log in again") from None
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token") from None

    result = (
        get_db()
        .table("users")
        .select(USER_COLUMNS)
        .eq("id", payload.get("sub"))
        .limit(1)
        .execute()
    )
    if not result.data:
        raise UnauthorizedError("User account no longer exists")
    return result.data[0]


def token_required(f):
    """Protect a route: 401 unless a valid Bearer token for a real user is sent."""

    @wraps(f)
    def decorated(*args, **kwargs):
        g.current_user = load_current_user()
        return f(*args, **kwargs)

    return decorated
