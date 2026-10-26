"""
app/extensions.py
-------------------
Tiny accessors for objects that live on the Flask app, so route and service
code doesn't repeat `current_app.config["SUPABASE_CLIENT"]` everywhere.
"""

from flask import current_app


def get_db():
    """Return the shared Supabase client created in create_app()."""
    return current_app.config["SUPABASE_CLIENT"]
