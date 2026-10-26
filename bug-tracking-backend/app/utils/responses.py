"""
app/utils/responses.py
------------------------
Helpers so every endpoint returns JSON in exactly the same shape:
  {"success": true,  "message": "...", "data": {...}}
  {"success": false, "message": "...", "errors": {...}}
"""

from flask import jsonify


def success_response(message="Success", data=None, status_code=200):
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code


def error_response(message="An error occurred", status_code=400, errors=None):
    body = {"success": False, "message": message}
    if errors is not None:
        body["errors"] = errors
    return jsonify(body), status_code
