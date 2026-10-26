"""
app/utils/validators.py
-------------------------
Single source of truth for allowed values, workflow rules and input
validation. Routes, services and tests all import from here so they can
never disagree about what "valid" means.
"""

import re
import uuid

# Roles inside a project. "owner" is a platform-level role (see config.OWNER_EMAILS)
# and can never be given through the API.
ROLES = ("admin", "tester", "developer")
OWNER_ROLE = "owner"
SEVERITIES = ("Minor", "Major", "Critical", "Blocker")
PRIORITIES = ("Low", "Medium", "High", "Critical")
STATUSES = ("Open", "In Progress", "Resolved", "Closed", "Reopened")

# Which statuses each status may move to (the overall workflow).
STATUS_TRANSITIONS = {
    "Open": {"In Progress"},
    "In Progress": {"Resolved"},
    "Resolved": {"Closed", "Reopened"},
    "Reopened": {"In Progress"},
    "Closed": set(),  # terminal state
}

# Which of those moves each role may perform. Admin may make any valid move.
ROLE_STATUS_MOVES = {
    "developer": {("Open", "In Progress"), ("In Progress", "Resolved"), ("Reopened", "In Progress")},
    "tester": {("Resolved", "Closed"), ("Resolved", "Reopened")},
}

BUG_FIELDS = ("title", "description", "severity", "priority")
TITLE_MIN, TITLE_MAX = 3, 200
DESCRIPTION_MIN, DESCRIPTION_MAX = 10, 5000
COMMENT_MAX = 2000
PROJECT_NAME_MIN, PROJECT_NAME_MAX = 2, 80
REASON_MIN, REASON_MAX = 10, 1000
QUESTION_MAX, ANSWER_MAX = 500, 3000
NAME_MAX = 100
PASSWORD_MIN = 8

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# --- generic helpers ---------------------------------------------------------
def clean_str(value):
    """Return the stripped string, or None if `value` isn't a string."""
    return value.strip() if isinstance(value, str) else None


def require_fields(data, fields):
    """Names in `fields` that are missing, not a string, or blank in `data`."""
    data = data or {}
    return [f for f in fields if not clean_str(data.get(f))]


def is_valid_uuid(value):
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


# --- users -------------------------------------------------------------------
def one_of_message(field, allowed):
    """e.g. "role must be one of: admin, tester, developer"."""
    return f"{field} must be one of: {', '.join(allowed)}"


def is_valid_email(email):
    return bool(email) and bool(EMAIL_REGEX.match(email))


def is_valid_password(password):
    """At least 8 characters, with at least one letter and one number."""
    if not isinstance(password, str) or len(password) < PASSWORD_MIN:
        return False
    return any(c.isalpha() for c in password) and any(c.isdigit() for c in password)


def is_valid_role(role):
    return role in ROLES


# --- bugs --------------------------------------------------------------------
def is_valid_severity(value):
    return value in SEVERITIES


def is_valid_priority(value):
    return value in PRIORITIES


def is_valid_status(value):
    return value in STATUSES


def is_valid_status_transition(old_status, new_status):
    return new_status in STATUS_TRANSITIONS.get(old_status, set())


def can_role_make_move(role, old_status, new_status):
    """Is this role allowed to perform this specific status move?"""
    if role == "admin":
        return True
    return (old_status, new_status) in ROLE_STATUS_MOVES.get(role, set())


def validate_bug_fields(data, *, only=BUG_FIELDS, require_all=False):
    """
    Validate bug fields from a request body.

    Returns (clean_fields, error_message). Exactly one of them is None.
      only         - which fields this caller may set
      require_all  - every field in `only` must be present (used on create)
    """
    data = data or {}
    if require_all:
        missing = require_fields(data, only)
        if missing:
            return None, f"Missing required field(s): {', '.join(missing)}"

    clean = {}
    if "title" in only and "title" in data:
        title = clean_str(data["title"])
        if title is None or len(title) < TITLE_MIN:
            return None, f"Bug title must be at least {TITLE_MIN} characters"
        if len(title) > TITLE_MAX:
            return None, f"Bug title must be at most {TITLE_MAX} characters"
        clean["title"] = title

    if "description" in only and "description" in data:
        description = clean_str(data["description"])
        if description is None or len(description) < DESCRIPTION_MIN:
            return None, f"Bug description must be at least {DESCRIPTION_MIN} characters"
        if len(description) > DESCRIPTION_MAX:
            return None, f"Bug description must be at most {DESCRIPTION_MAX} characters"
        clean["description"] = description

    if "severity" in only and "severity" in data:
        if not is_valid_severity(data["severity"]):
            return None, "Invalid severity value"
        clean["severity"] = data["severity"]

    if "priority" in only and "priority" in data:
        if not is_valid_priority(data["priority"]):
            return None, "Invalid priority value"
        clean["priority"] = data["priority"]

    return clean, None


# --- list query parameters ---------------------------------------------------
LIST_FILTERS = {"status": STATUSES, "severity": SEVERITIES, "priority": PRIORITIES}


def validate_list_filters(args):
    """
    Validate ?status=&severity=&priority=&assigned_to= on GET /api/bugs.

    Returns (filters, error_message). Unknown values used to be passed straight
    to the database; a malformed `assigned_to` made PostgreSQL reject the uuid
    and the request failed with a 500.
    """
    filters = {}
    for column, allowed in LIST_FILTERS.items():
        value = args.get(column)
        if not value:
            continue
        if value not in allowed:
            return None, one_of_message(column, allowed)
        filters[column] = value

    assigned_to = args.get("assigned_to")
    if assigned_to:
        if not is_valid_uuid(assigned_to):
            return None, "assigned_to must be a valid user id"
        filters["assigned_to"] = assigned_to
    return filters, None
