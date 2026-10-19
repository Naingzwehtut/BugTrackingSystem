import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print("URL:", url)
print("KEY loaded:", bool(key))

supabase = create_client(url, key)

try:
    result = supabase.table("users").select("id").limit(1).execute()
    print("✅ Supabase connected!")
    print("Users table is accessible.")
    print("Result:", result.data)

except Exception as e:
    print("❌ Supabase connection/table test failed:")
    print(e)