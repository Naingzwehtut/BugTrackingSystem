"""
app/routes/bugs.py
--------------------
  POST   /api/bugs              - create a bug                       (tester)
  GET    /api/bugs              - list bugs (filterable)             (all roles)
  GET    /api/bugs/<id>         - one bug                            (if permitted)
  PUT    /api/bugs/<id>         - edit title/description/severity/priority
  DELETE /api/bugs/<id>         - delete a bug                       (admin)
  PUT    /api/bugs/<id>/assign  - assign to a developer              (admin)
  PUT    /api/bugs/<id>/status  - move through the workflow          (role-limited)
  GET    /api/bugs/<id>/history - audit trail                        (if permitted)

Every change to status / assignment / priority / severity writes a row to
`bug_history`. Shared helpers (loading, visibility, serializers) live in
app/services/bug_service.py; validation rules in app/utils/validators.py.
Failures are raised as ApiError subclasses and rendered by app/errors.py.

Everything is scoped to the caller's project (@project_required), and each
workflow hand-off notifies whoever has to act next (notify()).
"""

from flask import Blueprint, g, request

from app.errors import BadRequestError, ForbiddenError, NotFoundError
from app.extensions import get_db
from app.middleware.auth import token_required
from app.middleware.permissions import project_required, role_required
from app.services.bug_service import (
    HistoryAction,
    attach_user_names,
    get_bug_or_404,
    get_viewable_bug,
    record_history,
    serialize_history,
    update_bug_row,
)
from app.services.notification_service import NotificationType, notify, project_admin_ids
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import (
    BUG_FIELDS,
    STATUSES,
    can_role_make_move,
    is_valid_status,
    is_valid_status_transition,
    is_valid_uuid,
    one_of_message,
    validate_bug_fields,
    validate_list_filters,
)

bugs_bp = Blueprint("bugs", __name__)

# Fields whose changes are recorded in the audit trail by PUT /api/bugs/<id>.
TRACKED_FIELDS = {
    "severity": HistoryAction.SEVERITY_CHANGED,
    "priority": HistoryAction.PRIORITY_CHANGED,
}


def _bug_payload(bug):
    return {"bug": attach_user_names([bug])[0]}


@bugs_bp.route("", methods=["POST"])
@token_required
@project_required
@role_required("tester")
def create_bug():
    fields, error = validate_bug_fields(json_body(), require_all=True)
    if error:
        raise BadRequestError(error)

    result = (
        get_db()
        .table("bugs")
        .insert({
            **fields,
            "project_id": g.current_user["project_id"],
            "status": "Open",
            "reported_by": g.current_user["id"],
            "assigned_to": None,
        })
        .execute()
    )
    bug = first_row(result, "Failed to create bug")
    record_history(bug["id"], HistoryAction.CREATED, None, "Open")
    notify(
        project_admin_ids(bug["project_id"]),
        NotificationType.BUG_CREATED,
        f"{g.current_user['name']} reported a new {bug['priority'].lower()}-priority bug: {bug['title']}",
        bug_id=bug["id"],
    )
    return success_response("Bug created successfully", _bug_payload(bug), 201)


@bugs_bp.route("", methods=["GET"])
@token_required
@project_required
def list_bugs():
    filters, error = validate_list_filters(request.args)
    if error:
        raise BadRequestError(error)

    # Developers only ever see bugs assigned to them, whatever they ask for.
    user = g.current_user
    if user["role"] == "developer":
        filters["assigned_to"] = user["id"]

    query = get_db().table("bugs").select("*").eq("project_id", user["project_id"])
    for column, value in filters.items():  # e.g. /api/bugs?status=Open&priority=High
        query = query.eq(column, value)

    bugs = attach_user_names(query.order("created_at", desc=True).execute().data)
    return success_response("Bugs retrieved", {"bugs": bugs, "count": len(bugs)})


@bugs_bp.route("/<bug_id>", methods=["GET"])
@token_required
@project_required
def get_bug(bug_id):
    return success_response("Bug retrieved", _bug_payload(get_viewable_bug(bug_id)))


@bugs_bp.route("/<bug_id>", methods=["PUT"])
@token_required
@project_required
def update_bug(bug_id):
    """
    Admin: may edit any bug and any field.
    Developer: may edit only the *description* of a bug assigned to them
               (triage fields belong to the admin). Other fields are ignored.
    Tester: no generic edit permission (they use /status instead).
    """
    bug = get_bug_or_404(bug_id)
    user = g.current_user

    if user["role"] == "admin":
        allowed = BUG_FIELDS
    elif user["role"] == "developer":
        if bug.get("assigned_to") != user["id"]:
            raise ForbiddenError("You can only update bugs assigned to you")
        allowed = ("description",)
    else:
        raise ForbiddenError()

    updates, error = validate_bug_fields(json_body(), only=allowed)
    if error:
        raise BadRequestError(error)
    if not updates:
        raise BadRequestError("No editable fields were provided")

    updated = update_bug_row(bug["id"], updates)
    changes = []
    for field, action in TRACKED_FIELDS.items():
        if field in updates and updates[field] != bug[field]:
            record_history(bug["id"], action, bug[field], updates[field])
            changes.append(f"{field} {bug[field]} → {updates[field]}")
    if changes:
        notify(
            [bug.get("assigned_to")],
            NotificationType.BUG_UPDATED,
            f"{user['name']} changed {', '.join(changes)} on: {bug['title']}",
            bug_id=bug["id"],
        )

    return success_response("Bug updated successfully", _bug_payload(updated))


@bugs_bp.route("/<bug_id>", methods=["DELETE"])
@token_required
@project_required
@role_required("admin")
def delete_bug(bug_id):
    bug = get_bug_or_404(bug_id)
    get_db().table("bugs").delete().eq("id", bug["id"]).execute()
    return success_response("Bug deleted successfully")


@bugs_bp.route("/<bug_id>/assign", methods=["PUT"])
@token_required
@project_required
@role_required("admin")
def assign_bug(bug_id):
    bug = get_bug_or_404(bug_id)

    developer_id = json_body().get("assigned_to")
    if not developer_id:
        raise BadRequestError("assigned_to (developer user id) is required")
    if not is_valid_uuid(developer_id):
        raise BadRequestError("assigned_to must be a valid user id")

    found = (
        get_db()
        .table("users")
        .select("id, role")
        .eq("id", developer_id)
        .eq("project_id", g.current_user["project_id"])  # only members of this project
        .limit(1)
        .execute()
        .data
    )
    if not found:
        raise NotFoundError("Assigned user not found")
    if found[0]["role"] != "developer":
        raise BadRequestError("Bugs can only be assigned to users with the developer role")

    # Re-assigning to the same developer is a no-op, not a new history entry.
    if bug.get("assigned_to") == developer_id:
        return success_response("Bug is already assigned to this developer", _bug_payload(bug))

    updated = update_bug_row(bug["id"], {"assigned_to": developer_id})
    record_history(bug["id"], HistoryAction.ASSIGNMENT_CHANGED, bug.get("assigned_to"), developer_id)

    admin_name = g.current_user["name"]
    notify(
        [developer_id],
        NotificationType.BUG_ASSIGNED,
        f"{admin_name} assigned you: {bug['title']}",
        bug_id=bug["id"],
        email=(
            f"Assigned to you: {bug['title']}",
            f"{admin_name} assigned you a bug",
            f"{bug['title']}\nPriority: {bug['priority']} · Severity: {bug['severity']}",
        ),
    )
    notify(
        [bug.get("assigned_to")],
        NotificationType.BUG_UNASSIGNED,
        f"{bug['title']} was reassigned to another developer",
        bug_id=bug["id"],
    )
    return success_response("Bug assigned successfully", _bug_payload(updated))


@bugs_bp.route("/<bug_id>/status", methods=["PUT"])
@token_required
@project_required
def change_status(bug_id):
    bug = get_bug_or_404(bug_id)

    new_status = json_body().get("status")
    if not is_valid_status(new_status):
        raise BadRequestError(f"A valid 'status' is required. {one_of_message('status', STATUSES)}")

    old_status = bug["status"]
    user = g.current_user

    # 1. Is this move legal in the overall workflow?
    if not is_valid_status_transition(old_status, new_status):
        raise BadRequestError(f"Invalid status transition: cannot move from '{old_status}' to '{new_status}'")
    # 2. Is *this role* allowed to make it?
    if not can_role_make_move(user["role"], old_status, new_status):
        raise ForbiddenError()
    # 3. Developers may only move bugs assigned to them.
    if user["role"] == "developer" and bug.get("assigned_to") != user["id"]:
        raise ForbiddenError("You can only update bugs assigned to you")

    updated = update_bug_row(bug["id"], {"status": new_status})
    record_history(bug["id"], HistoryAction.STATUS_CHANGED, old_status, new_status)
    _notify_status_change(bug, new_status)
    return success_response("Bug status updated successfully", _bug_payload(updated))


# Who has to act after each move, and whether it's worth an email.
def _notify_status_change(bug, new_status):
    actor = g.current_user["name"]
    title = bug["title"]
    reporter, developer = bug.get("reported_by"), bug.get("assigned_to")

    if new_status == "In Progress":
        notify([reporter], NotificationType.STATUS_CHANGED, f"{actor} started working on: {title}", bug_id=bug["id"])
    elif new_status == "Resolved":
        notify(
            [reporter],
            NotificationType.STATUS_CHANGED,
            f"{actor} resolved your bug. Please verify it: {title}",
            bug_id=bug["id"],
            email=(f"Ready to verify: {title}", f"{actor} marked your bug as resolved", f"{title}\n\nPlease check the fix, then close or reopen it."),
        )
    elif new_status == "Reopened":
        notify(
            [developer],
            NotificationType.STATUS_CHANGED,
            f"{actor} reopened: {title}. The fix didn't work",
            bug_id=bug["id"],
            email=(f"Reopened: {title}", f"{actor} reopened a bug assigned to you", f"{title}\n\nThe fix didn't pass verification. See the comments for details."),
        )
    elif new_status == "Closed":
        notify(
            [developer, *project_admin_ids(bug["project_id"])],
            NotificationType.STATUS_CHANGED,
            f"{actor} verified and closed: {title}",
            bug_id=bug["id"],
        )


@bugs_bp.route("/<bug_id>/history", methods=["GET"])
@token_required
@project_required
def get_bug_history(bug_id):
    bug = get_viewable_bug(bug_id, "view this bug's history")
    rows = (
        get_db()
        .table("bug_history")
        .select("*, users(name, email)")
        .eq("bug_id", bug["id"])
        .order("created_at", desc=False)
        .execute()
        .data
    )
    return success_response("Bug history retrieved", {"history": serialize_history(rows)})
