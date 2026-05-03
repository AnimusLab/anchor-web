import os
import sys
from sqlalchemy import text

# Ensure d:\anchor-web\server is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, init_db, Base

def reset_database():
    print("WARNING: Starting NUCLEAR Database Reset...")
    try:
        # 1. Aggressive Purge for Postgres/Neon
        with engine.connect() as conn:
            print("[-] Terminating active connections and dropping public schema...")
            # For Postgres, dropping schema public is the cleanest way to wipe everything
            conn.execute(text("DROP SCHEMA public CASCADE;"))
            conn.execute(text("CREATE SCHEMA public;"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            conn.execute(text("COMMENT ON SCHEMA public IS 'standard public schema';"))
            conn.commit()
        
        # 2. Re-create and re-seed
        print("[+] Initializing clean schema from scratch...")
        # Now create all tables
        Base.metadata.create_all(bind=engine)
        
        # Seed
        init_db()
        
        print("SUCCESS: The database has been purged and re-initialized with the unified schema.")
        print("All redundant columns are now gone.")
    except Exception as e:
        print(f"ERROR: Database reset failed: {e}")
        # Fallback to standard drop_all if Postgres specific fails (e.g. if running on SQLite)
        try:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            init_db()
        except:
            pass

if __name__ == "__main__":
    reset_database()
