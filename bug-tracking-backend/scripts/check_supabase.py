"""
scripts/check_supabase.py
---------------------------
Quick connectivity check (formerly test_supabase.py in the project root).

    python scripts/check_supabase.py

Confirms your .env is loaded and the `users` table is reachable. It never
prints the key itself.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import Config, create_supabase_client  # noqa: E402


def main():
    print("SUPABASE_URL:", Config.SUPABASE_URL)
    print("SUPABASE_KEY loaded:", bool(Config.SUPABASE_KEY))
    try:
        client = create_supabase_client()
        result = client.table("users").select("id").limit(1).execute()
        print("OK: Supabase connected and the users table is accessible.")
        print("Sample rows:", result.data)
    except Exception as exc:  # noqa: BLE001 - diagnostic script, show anything
        print("FAILED: Supabase connection/table test failed:")
        print(exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
