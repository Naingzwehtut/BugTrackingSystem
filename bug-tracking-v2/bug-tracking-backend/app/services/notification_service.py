"""
app/services/notification_service.py
--------------------------------------
One function, `notify()`, used by every route that should tell someone
something. It:
  1. skips the person who did the action (nobody is notified about
     their own clicks) and removes duplicates,
  2. stores one row per recipient in `notifications` (the bell + page),
  3. pushes it to the recipient's open browser tabs (live, see realtime.py),
  4. optionally emails recipients who haven't turned email off.
"""

from flask import g

from app.extensions import get_db
from app.services.email_service import render_email, send_email
from app.services.realtime import bus


class NotificationType:
    BUG_CREATED = "bug_created"
    BUG_ASSIGNED = "bug_assigned"
    BUG_UNASSIGNED = "bug_unassigned"
    STATUS_CHANGED = "status_changed"
    COMMENT_ADDED = "comment_added"
    BUG_UPDATED = "bug_updated"
    ROLE_CHANGED = "role_changed"
    MEMBER_JOINED = "member_joined"
    ADMIN_REQUESTED = "admin_requested"
    ADMIN_REQUEST_DECIDED = "admin_request_decided"
    SUPPORT_QUESTION = "support_question"
    SUPPORT_ANSWERED = "support_answered"


def serialize_notification(row):
    return {
        "id": row["id"],
        "type": row["type"],
        "message": row["message"],
        "link": row.get("link"),
        "bug_id": row.get("bug_id"),
        "is_read": bool(row.get("is_read")),
        "created_at": row.get("created_at"),
    }


def notify(user_ids, type_, message, *, bug_id=None, link=None, email=None, include_actor=False):
    """
    Notify users.

    user_ids  iterable of user ids (None values are ignored)
    email     optional (subject, heading, body) tuple; sends an email too
    Returns the list of created notification rows.
    """
    actor = getattr(g, "current_user", None)
    actor_id = actor["id"] if actor else None
    recipients = []
    for uid in user_ids:
        if uid and uid not in recipients and (include_actor or uid != actor_id):
            recipients.append(uid)
    if not recipients:
        return []

    if link is None and bug_id:
        link = f"/bugs/{bug_id}"

    db = get_db()
    created = []
    for uid in recipients:
        row = (
            db.table("notifications")
            .insert({
                "user_id": uid,
                "bug_id": bug_id,
                "type": type_,
                "message": message,
                "link": link,
                "is_read": False,
            })
            .execute()
            .data[0]
        )
        created.append(row)
        bus.publish(uid, {"event": "notification", "notification": serialize_notification(row)})

    if email:
        subject, heading, body = email
        users = db.table("users").select("id, email, email_notifications").in_("id", recipients).execute().data
        text, html = render_email(heading, body, link)
        for user in users:
            if user.get("email_notifications", True):
                send_email(user["email"], subject, text, html)

    return created


def project_admin_ids(project_id):
    rows = get_db().table("users").select("id").eq("project_id", project_id).eq("role", "admin").execute().data
    return [row["id"] for row in rows]


def owner_ids():
    rows = get_db().table("users").select("id").eq("role", "owner").execute().data
    return [row["id"] for row in rows]
