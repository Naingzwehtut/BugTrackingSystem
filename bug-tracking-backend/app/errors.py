"""
app/errors.py
---------------
API exceptions and the global error handlers that turn *every* failure into
the same JSON envelope the frontend expects:

    {"success": false, "message": "...", "errors": {...}}

Route and service code raises an exception instead of returning an error
tuple, so a helper like `get_viewable_bug()` can stop a request from any depth:

    bug = get_viewable_bug(bug_id)      # raises NotFoundError / ForbiddenError
    if not text:
        raise BadRequestError("A non-empty 'comment' field is required")
"""

from flask import current_app
from werkzeug.exceptions import HTTPException

from app.utils.responses import error_response


class ApiError(Exception):
    """An expected failure with a message that is safe to show the client."""

    status_code = 400

    def __init__(self, message, status_code=None, errors=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.errors = errors


class BadRequestError(ApiError):
    status_code = 400


class UnauthorizedError(ApiError):
    status_code = 401


class ForbiddenError(ApiError):
    status_code = 403

    def __init__(self, message="You do not have permission to perform this action", **kwargs):
        super().__init__(message, **kwargs)


class NotFoundError(ApiError):
    status_code = 404


class ConflictError(ApiError):
    status_code = 409


_HTTP_MESSAGES = {
    400: "Bad request",
    404: "Resource not found",
    405: "Method not allowed on this endpoint",
    413: "Request body is too large",
}


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(exc):
        return error_response(exc.message, exc.status_code, exc.errors)

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc):
        message = _HTTP_MESSAGES.get(exc.code, exc.description or "Request failed")
        return error_response(message, exc.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_exception(exc):
        # Log the real cause for developers; never leak internals to clients.
        current_app.logger.exception("Unhandled error: %s", exc)
        return error_response("Internal server error", 500)
