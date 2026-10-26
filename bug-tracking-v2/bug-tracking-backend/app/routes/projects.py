"""
app/routes/projects.py
------------------------
  POST /api/projects                        - create your project      (admin without a project)
  POST /api/projects/join                   - {"invite_code": "BUG-..."} (user without a project)
  GET  /api/projects/current                - your project (+ invite code for admins, + member count)
  PUT  /api/projects/current                - rename                    (admin)
  POST /api/projects/current/invite-code    - new invite code           (admin)
  GET  /api/projects                        - every project with counts (owner)

Each user belongs to at most one project. Joining always makes you a
Tester; the project admin promotes people on the Users page.
"""

from flask import Blueprint, g

from app.errors import BadRequestError, NotFoundError
from app.extensions import get_db
from app.middleware.auth import token_required
from app.middleware.permissions import project_required, role_required
from app.services.notification_service import NotificationType, notify, project_admin_ids
from app.services.project_service import (
    find_project_by_code,
    generate_invite_code,
    get_project,
    seed_default_faqs,
    serialize_project,
)
from app.utils.request import first_row, json_body
from app.utils.responses import success_response
from app.utils.validators import OWNER_ROLE, PROJECT_NAME_MAX, PROJECT_NAME_MIN, clean_str

projects_bp = Blueprint("projects", __name__)


def _project_name(data):
    name = clean_str(data.get("name"))
    if not name or len(name) < PROJECT_NAME_MIN:
        raise BadRequestError(f"Project name must be at least {PROJECT_NAME_MIN} characters")
    if len(name) > PROJECT_NAME_MAX:
        raise BadRequestError(f"Project name must be at most {PROJECT_NAME_MAX} characters")
    return name


def _current_project_or_404():
    project = get_project(g.current_user.get("project_id"))
    if not project:
        raise NotFoundError("Project not found")
    return project


def _project_details(project, include_code):
    members = get_db().table("users").select("id, role").eq("project_id", project["id"]).execute().data
    counts = {}
    for member in members:
        counts[member["role"]] = counts.get(member["role"], 0) + 1
    return {**serialize_project(project, include_code=include_code), "member_count": len(members), "role_counts": counts}


@projects_bp.route("", methods=["POST"])
@token_required
@role_required("admin")
def create_project():
    user = g.current_user
    if user.get("project_id"):
        raise BadRequestError("You already manage a project")

    db = get_db()
    project = first_row(
        db.table("projects")
        .insert({"name": _project_name(json_body()), "invite_code": generate_invite_code(), "created_by": user["id"]})
        .execute(),
        "Failed to create project",
    )
    db.table("users").update({"project_id": project["id"]}).eq("id", user["id"]).execute()
    seed_default_faqs(project["id"])
    return success_response("Project created", {"project": _project_details(project, include_code=True)}, 201)


@projects_bp.route("/join", methods=["POST"])
@token_required
def join_project():
    user = g.current_user
    if user["role"] == OWNER_ROLE:
        raise BadRequestError("Owners don't join projects")
    if user.get("project_id"):
        raise BadRequestError("You are already a member of a project")

    project = find_project_by_code(json_body().get("invite_code"))
    if not project:
        raise BadRequestError("Invite code not found. Check it with your project admin.")

    # Joining always starts as a Tester, even for an approved admin who
    # chooses to join someone else's project instead of creating one.
    get_db().table("users").update({"project_id": project["id"], "role": "tester"}).eq("id", user["id"]).execute()
    notify(
        project_admin_ids(project["id"]),
        NotificationType.MEMBER_JOINED,
        f"{user['name']} joined {project['name']} as a Tester",
        link="/admin/users",
    )
    return success_response(f"You joined {project['name']}", {"project": serialize_project(project, include_code=False)})


@projects_bp.route("/current", methods=["GET"])
@token_required
@project_required
def current_project():
    project = _current_project_or_404()
    return success_response("Project retrieved", {"project": _project_details(project, g.current_user["role"] == "admin")})


@projects_bp.route("/current", methods=["PUT"])
@token_required
@project_required
@role_required("admin")
def rename_project():
    project = _current_project_or_404()
    updated = first_row(get_db().table("projects").update({"name": _project_name(json_body())}).eq("id", project["id"]).execute())
    return success_response("Project renamed", {"project": _project_details(updated, include_code=True)})


@projects_bp.route("/current/invite-code", methods=["POST"])
@token_required
@project_required
@role_required("admin")
def regenerate_code():
    project = _current_project_or_404()
    updated = first_row(
        get_db().table("projects").update({"invite_code": generate_invite_code()}).eq("id", project["id"]).execute()
    )
    return success_response("New invite code created. The old code no longer works.", {"project": _project_details(updated, include_code=True)})


@projects_bp.route("", methods=["GET"])
@token_required
@role_required(OWNER_ROLE)
def list_projects():
    db = get_db()
    projects = db.table("projects").select("*").order("created_at", desc=True).execute().data
    users = db.table("users").select("id, name, role, project_id").execute().data
    bugs = db.table("bugs").select("id, project_id, status").execute().data

    result = []
    for project in projects:
        members = [u for u in users if u.get("project_id") == project["id"]]
        project_bugs = [b for b in bugs if b.get("project_id") == project["id"]]
        admins = [u["name"] for u in members if u["role"] == "admin"]
        result.append({
            **serialize_project(project, include_code=True),
            "admins": admins,
            "member_count": len(members),
            "bug_count": len(project_bugs),
            "open_bug_count": sum(b["status"] != "Closed" for b in project_bugs),
        })
    return success_response("Projects retrieved", {"projects": result})
