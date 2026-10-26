"""
app/utils/request.py
----------------------
Small helpers for reading request input safely.
"""

from flask import request

from app.errors import BadRequestError, NotFoundError


def json_body():
    """
    Return the request's JSON body as a dict.

    A missing or unparsable body becomes {} (so the caller reports which
    fields are missing). A body that parses but isn't an object - e.g. a list
    such as `["x"]` - is rejected with 400. Previously it reached `.get()`
    calls and crashed the request with a 500.
    """
    data = request.get_json(silent=True)
    if data is None:
        return {}
    if not isinstance(data, dict):
        raise BadRequestError("Request body must be a JSON object")
    return data


def first_row(result, message="Resource not found"):
    """
    First row of a Supabase result, or 404.

    Guards `.execute().data[0]`, which raised IndexError (a 500) when the row
    had been deleted between the read and the write.
    """
    if not result.data:
        raise NotFoundError(message)
    return result.data[0]
