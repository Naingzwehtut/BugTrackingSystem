"""app/services/user_service.py - shared user helpers."""

from app.extensions import get_db


def public_user(row):
    """Strip internal fields (password_hash!) before a user leaves the API."""
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "created_at": row.get("created_at"),
    }


def fetch_user_names(user_ids):
    """Return {user_id: name} for the given ids using ONE query."""
    ids = sorted({uid for uid in user_ids if uid})
    if not ids:
        return {}
    result = get_db().table("users").select("id, name").in_("id", ids).execute()
    return {row["id"]: row["name"] for row in result.data}
