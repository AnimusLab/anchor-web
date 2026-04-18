from sqlalchemy import text
from database import engine

def reset_db():
    # Order to satisfy foreign key constraints
    tables = [
        "org_invites",
        "ledger",
        "webhook_subscriptions",
        "entities",
        "users",
        "organizations"
    ]
    
    with engine.connect() as conn:
        print("[RESET] Starting database cleanup...")
        
        for table in tables:
            try:
                print(f"[RESET] Deleting from {table}...")
                conn.execute(text(f"DELETE FROM {table};"))
                conn.commit()
            except Exception as e:
                # If table doesn't exist yet, we can skip
                if "does not exist" in str(e).lower() or "no such table" in str(e).lower():
                    print(f"[RESET] Table {table} does not exist, skipping.")
                else:
                    print(f"[RESET] Error on {table}: {e}")
            
        conn.commit()
    print("[RESET] Database cleared successfully.")

if __name__ == "__main__":
    reset_db()
