"""
app/errors.py
---------------
Global error handlers so *every* failure returns the same JSON envelope the
frontend expects, instead of Flask's default HTML error pages.
"""

from flask import current_app
from werkzeug.exceptions import HTTPException

from app.utils.responses import error_response

_HTTP_MESSAGES = {
    400: "Bad request",
    404: "Resource not found",
    405: "Method not allowed on this endpoint",
    413: "Request body is too large",
}


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(exc):
        message = _HTTP_MESSAGES.get(exc.code, exc.description or "Request failed")
        return error_response(message, exc.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_exception(exc):
        # Log the real cause for developers; never leak internals to clients.
        current_app.logger.exception("Unhandled error: %s", exc)
        return error_response("Internal server error", 500)
