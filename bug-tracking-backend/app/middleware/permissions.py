"""
app/middleware/permissions.py
-------------------------------
Role-based access control (RBAC). This decorator must always be used
AFTER @token_required, because it reads g.current_user which
token_required is responsible for setting.

Example:
    @bugs_bp.route("/bugs/<bug_id>/assign", methods=["PUT"])
    @token_required
    @role_required("admin")
    def assign_bug(bug_id):
        ...
"""

from functools import wraps
from flask import g

from app.errors import ForbiddenError, UnauthorizedError


def project_required(f):
    """
    The user must belong to a project (use AFTER @token_required).

    Every bug, comment and member query is scoped to the caller's project,
    so users who haven't created or joined one yet get a clear 403.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = getattr(g, "current_user", None)
        if not current_user:
            raise UnauthorizedError("Authentication required")
        if not current_user.get("project_id"):
            raise ForbiddenError("Join or create a project first")
        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """Only allow the request through if g.current_user's role is in allowed_roles."""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = getattr(g, "current_user", None)
            if not current_user:
                # Should never happen if @token_required ran first, but
                # guard against misuse/misordering of decorators.
                raise UnauthorizedError("Authentication required")

            if current_user["role"] not in allowed_roles:
                raise ForbiddenError()
            return f(*args, **kwargs)

        return decorated

    return decorator
