import sqlite3
import os
from database import init_db

DB_PATH = "d:/anchor-web/server/anchor.db"

def patch_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Checking for missing columns and tables...")
    
    # 1. Extend regulatory_officials
    cursor.execute("PRAGMA table_info(regulatory_officials)")
    columns = [col[1] for col in cursor.fetchall()]
    if "auditor_type" not in columns:
        print("Adding 'auditor_type' to regulatory_officials...")
        cursor.execute("ALTER TABLE regulatory_officials ADD COLUMN auditor_type TEXT DEFAULT 'HUB_AUDITOR'")
    if "assigned_hub_ids" not in columns:
        print("Adding 'assigned_hub_ids' to regulatory_officials...")
        cursor.execute("ALTER TABLE regulatory_officials ADD COLUMN assigned_hub_ids TEXT")

    # 2. Extend forensic_requests
    cursor.execute("PRAGMA table_info(forensic_requests)")
    columns = [col[1] for col in cursor.fetchall()]
    if "temporary_token" not in columns:
        print("Adding 'temporary_token' to forensic_requests...")
        cursor.execute("ALTER TABLE forensic_requests ADD COLUMN temporary_token TEXT")
    if "expires_at" not in columns:
        print("Adding 'expires_at' to forensic_requests...")
        cursor.execute("ALTER TABLE forensic_requests ADD COLUMN expires_at TEXT")
    if "replayed_at" not in columns:
        print("Adding 'replayed_at' to forensic_requests...")
        cursor.execute("ALTER TABLE forensic_requests ADD COLUMN replayed_at TEXT")
    if "replayed_by" not in columns:
        print("Adding 'replayed_by' to forensic_requests...")
        cursor.execute("ALTER TABLE forensic_requests ADD COLUMN replayed_by TEXT")

    conn.commit()
    conn.close()
    print("Direct column patching complete.")

    # 3. Create the new tables (RuntimeRegistry, ReplayAccessLog) via SQLAlchemy
    print("Running SQLAlchemy init_db to create new tables...")
    init_db()
    print("Database patch complete.")

if __name__ == "__main__":
    patch_db()
