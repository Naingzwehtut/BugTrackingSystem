"""Pure unit tests for validation and workflow rules (no app, no DB)."""

import pytest

from app.utils import validators as v


@pytest.mark.parametrize(
    "old,new,ok",
    [
        ("Open", "In Progress", True),
        ("In Progress", "Resolved", True),
        ("Resolved", "Closed", True),
        ("Resolved", "Reopened", True),
        ("Reopened", "In Progress", True),
        ("Open", "Closed", False),
        ("In Progress", "Closed", False),
        ("Closed", "Open", False),
        ("Unknown", "Open", False),
    ],
)
def test_status_transitions(old, new, ok):
    assert v.is_valid_status_transition(old, new) is ok


def test_role_status_moves():
    assert v.can_role_make_move("developer", "Open", "In Progress")
    assert not v.can_role_make_move("developer", "Resolved", "Closed")
    assert v.can_role_make_move("tester", "Resolved", "Closed")
    assert not v.can_role_make_move("tester", "Open", "In Progress")
    assert v.can_role_make_move("admin", "Resolved", "Closed")
    assert not v.can_role_make_move("stranger", "Open", "In Progress")


@pytest.mark.parametrize(
    "password,ok",
    [("Passw0rd1", True), ("short1", False), ("allletters", False), ("12345678", False), (None, False), (12345678, False)],
)
def test_password_rules(password, ok):
    assert v.is_valid_password(password) is ok


def test_email_and_uuid():
    assert v.is_valid_email("a@b.co") and not v.is_valid_email("nope@")
    assert v.is_valid_uuid("3fa85f64-5717-4562-b3fc-2c963f66afa6")
    assert not v.is_valid_uuid("not-a-uuid") and not v.is_valid_uuid(None)


def test_require_fields_rejects_blank_and_non_strings():
    assert v.require_fields({"a": " x ", "b": "  ", "c": 5}, ["a", "b", "c", "d"]) == ["b", "c", "d"]


def test_validate_bug_fields():
    good = {"title": " Login broken ", "description": "Button does nothing.", "severity": "Major", "priority": "High"}
    clean, err = v.validate_bug_fields(good, require_all=True)
    assert err is None and clean["title"] == "Login broken"

    _, err = v.validate_bug_fields({"title": "ab"}, only=("title",))
    assert "at least" in err
    _, err = v.validate_bug_fields({"severity": "Huge"}, only=("severity",))
    assert err == "Invalid severity value"
    _, err = v.validate_bug_fields({"title": "Only a title"}, require_all=True)
    assert err.startswith("Missing required field(s)")
    # Fields outside `only` are ignored rather than applied.
    clean, err = v.validate_bug_fields({"title": "Hacked title", "description": "A long enough note."}, only=("description",))
    assert err is None and list(clean) == ["description"]
