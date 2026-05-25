import os
from sqlalchemy import text
from database import engine, init_db

def patch_db_postgres():
    print("Connecting to PostgreSQL database to apply patches...")
    
    with engine.connect() as conn:
        # 1. Patch regulatory_officials table
        print("Checking regulatory_officials table...")
        # Check if columns already exist by attempting to select them
        try:
            conn.execute(text("SELECT auditor_type FROM regulatory_officials LIMIT 1"))
            print("  Column 'auditor_type' already exists in regulatory_officials.")
        except Exception:
            conn.rollback()
            print("  Adding 'auditor_type' to regulatory_officials...")
            conn.execute(text("ALTER TABLE regulatory_officials ADD COLUMN auditor_type VARCHAR(255) DEFAULT 'HUB_AUDITOR'"))
            conn.commit()

        try:
            conn.execute(text("SELECT assigned_hub_ids FROM regulatory_officials LIMIT 1"))
            print("  Column 'assigned_hub_ids' already exists in regulatory_officials.")
        except Exception:
            conn.rollback()
            print("  Adding 'assigned_hub_ids' to regulatory_officials...")
            conn.execute(text("ALTER TABLE regulatory_officials ADD COLUMN assigned_hub_ids TEXT"))
            conn.commit()

        # 2. Patch forensic_requests table
        print("Checking forensic_requests table...")
        try:
            conn.execute(text("SELECT temporary_token FROM forensic_requests LIMIT 1"))
            print("  Column 'temporary_token' already exists in forensic_requests.")
        except Exception:
            conn.rollback()
            print("  Adding 'temporary_token' to forensic_requests...")
            conn.execute(text("ALTER TABLE forensic_requests ADD COLUMN temporary_token TEXT"))
            conn.commit()

        try:
            conn.execute(text("SELECT expires_at FROM forensic_requests LIMIT 1"))
            print("  Column 'expires_at' already exists in forensic_requests.")
        except Exception:
            conn.rollback()
            print("  Adding 'expires_at' to forensic_requests...")
            conn.execute(text("ALTER TABLE forensic_requests ADD COLUMN expires_at VARCHAR(255)"))
            conn.commit()

        try:
            conn.execute(text("SELECT replayed_at FROM forensic_requests LIMIT 1"))
            print("  Column 'replayed_at' already exists in forensic_requests.")
        except Exception:
            conn.rollback()
            print("  Adding 'replayed_at' to forensic_requests...")
            conn.execute(text("ALTER TABLE forensic_requests ADD COLUMN replayed_at VARCHAR(255)"))
            conn.commit()

        try:
            conn.execute(text("SELECT replayed_by FROM forensic_requests LIMIT 1"))
            print("  Column 'replayed_by' already exists in forensic_requests.")
        except Exception:
            conn.rollback()
            print("  Adding 'replayed_by' to forensic_requests...")
            conn.execute(text("ALTER TABLE forensic_requests ADD COLUMN replayed_by VARCHAR(255)"))
            conn.commit()

    print("Running init_db() to create runtime_registry and replay_access_log tables if they don't exist...")
    init_db()
    print("Database patch complete.")

if __name__ == "__main__":
    patch_db_postgres()
