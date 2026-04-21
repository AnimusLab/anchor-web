
import os
import sys

# Ensure d:\anchor-web\server is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine, init_db

def reset_database():
    print("WARNING: Starting Total Database Reset...")
    try:
        # 1. Drop all tables
        print("[-] Dropping existing Sovereign Mesh tables...")
        Base.metadata.drop_all(bind=engine)
        
        # 2. Re-create and re-seed
        print("[+] Initializing clean schema and re-seeding identities...")
        init_db()
        
        print("SUCCESS: The database has been purged and re-initialized.")
        print("Genesis identities (tan@anchorgovernance.tech) are now ready.")
    except Exception as e:
        print(f"ERROR: Database reset failed: {e}")

if __name__ == "__main__":
    reset_database()
