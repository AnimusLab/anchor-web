import sqlite3
import os

DB_PATH = "d:/anchor-web/server/anchor.db"

def patch_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Checking for missing columns...")
    
    # 1. Organizations table
    cursor.execute("PRAGMA table_info(organizations)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "regional_key" not in columns:
        print("Adding 'regional_key' to organizations...")
        cursor.execute("ALTER TABLE organizations ADD COLUMN regional_key TEXT")
    
    # 2. Enterprise Users table
    cursor.execute("PRAGMA table_info(enterprise_users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "department" not in columns:
        print("Adding 'department' to enterprise_users...")
        cursor.execute("ALTER TABLE enterprise_users ADD COLUMN department TEXT")

    # 3. Org Invites table
    cursor.execute("PRAGMA table_info(org_invites)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "department" not in columns:
        print("Adding 'department' to org_invites...")
        cursor.execute("ALTER TABLE org_invites ADD COLUMN department TEXT")

    conn.commit()
    conn.close()
    print("Database patch complete.")

if __name__ == "__main__":
    patch_db()
