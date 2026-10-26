"""
app/routes/comments.py
------------------------
  POST /api/bugs/<bug_id>/comments  - add a comment
  GET  /api/bugs/<bug_id>/comments  - list comments (oldest first)

Registered under the same "/api/bugs" prefix as routes/bugs.py. Anyone who
can view a bug may read and write its comments.
"""

from flask import Blueprint, g

from app.errors import BadRequestError
from app.extensions import get_db
from app.middleware.auth import token_required
from app.middleware.permissions import project_required
from app.services.notification_service import NotificationType, notify
from app.services.bug_service import get_viewable_bug, serialize_comment
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import COMMENT_MAX, clean_str

comments_bp = Blueprint("comments", __name__)


@comments_bp.route("/<bug_id>/comments", methods=["POST"])
@token_required
@project_required
def add_comment(bug_id):
    bug = get_viewable_bug(bug_id, "comment on this bug")

    text = clean_str(json_body().get("comment"))
    if not text:
        raise BadRequestError("A non-empty 'comment' field is required")
    if len(text) > COMMENT_MAX:
        raise BadRequestError(f"Comment must be at most {COMMENT_MAX} characters")

    result = (
        get_db()
        .table("comments")
        .insert({"bug_id": bug["id"], "user_id": g.current_user["id"], "comment": text})
        .execute()
    )
    row = first_row(result, "Failed to add comment")
    preview = text if len(text) <= 80 else f"{text[:77]}..."
    notify(
        [bug.get("reported_by"), bug.get("assigned_to")],
        NotificationType.COMMENT_ADDED,
        f"{g.current_user['name']} commented on {bug['title']}: \"{preview}\"",
        bug_id=bug["id"],
    )
    return success_response(
        "Comment added successfully",
        {"comment": serialize_comment(row, author=g.current_user)},
        201,
    )


@comments_bp.route("/<bug_id>/comments", methods=["GET"])
@token_required
@project_required
def get_comments(bug_id):
    bug = get_viewable_bug(bug_id, "view comments on this bug")
    rows = (
        get_db()
        .table("comments")
        .select("*, users(name, email, role)")
        .eq("bug_id", bug["id"])
        .order("created_at", desc=False)
        .execute()
        .data
    )
    return success_response("Comments retrieved", {"comments": [serialize_comment(r) for r in rows]})
