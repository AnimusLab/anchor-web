import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# --- DATABASE PING TOOL // v5.1 PRODUCTION-READY ---
# Reads DATABASE_URL directly from server/.env — no manual env setting needed.
load_dotenv()

db_url = os.getenv("DATABASE_URL")

print("=" * 40)
print("      DATABASE CONNECTIVITY CHECK      ")
print("=" * 40)

if not db_url or db_url.startswith("sqlite"):
    print("[!] WARNING: DATABASE_URL not set or using SQLite.")
    print(f"    CURRENT URL: {db_url}")
    print("    Expected: postgresql://user:password@host:port/dbname")
else:
    print(f"[*] Attempting connection to: {db_url.split('@')[-1]}")
    try:
        # 1. Initialize Engine
        engine = create_engine(db_url)
        
        # 2. Try to connect
        with engine.connect() as connection:
            print("🟢 SUCCESS: Cloud connectivity verified.")
            print("    PostgreSQL is reachable and the tunnel is clear.")
            
    except Exception as e:
        print("🔴 ERROR: Connection failed!")
        print(f"    DETAIL: {e}")
        print("\n[HINT] Ensure your IP is whitelisted in your Cloud Postgres dashboard (Supabase/Neon).")

print("=" * 40)
