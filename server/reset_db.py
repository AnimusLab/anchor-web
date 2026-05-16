from database import engine, SessionLocal, init_db
from models import Organization, Hub, EnterpriseUser, RegulatoryOfficial, LedgerEntry, ForensicRequest, EnforcementNotice, AuditTrailEntry, WhitelistEntry
from sqlalchemy import text

def wipe_data():
    print("[RESET] Starting Sovereign Mesh Data Purge...")
    
    with engine.connect() as conn:
        # Disable foreign key checks for the wipe
        if str(engine.url).startswith("sqlite"):
            conn.execute(text("PRAGMA foreign_keys = OFF;"))
        
        tables = [
            "ledger", "forensic_requests", "enforcement_notices", 
            "auditor_trail", "enterprise_users", "regulatory_officials", 
            "hubs", "organizations", "whitelist"
        ]
        
        for table in tables:
            try:
                print(f"[RESET] Truncating {table}...")
                conn.execute(text(f"DELETE FROM {table};"))
            except Exception as e:
                print(f"[RESET] Skip {table}: {e}")
        
        conn.commit()
        print("[RESET] Data Purge Complete.")

def seed_whitelist():
    db = SessionLocal()
    try:
        print("[SEED] Provisioning Whitelist Gatekeepers...")
        # Add your email to the whitelist for the fresh test
        entries = [
            WhitelistEntry(email="tan@anchorgovernance.tech", org_id="animuslab", role="owner", created_at="2026-05-16T00:00:00Z"),
            WhitelistEntry(email="artisianecho@gmail.com", org_id="sec", role="auditor", created_at="2026-05-16T00:00:00Z")
        ]
        for entry in entries:
            db.add(entry)
        db.commit()
        print("[SEED] Whitelist Active.")
    finally:
        db.close()

if __name__ == "__main__":
    wipe_data()
    init_db() # Re-verify schema
    seed_whitelist()
    print("\n[SUCCESS] Sovereign Mesh has been factory reset.")
    print("You can now perform a fresh 'Perfect Onboarding' at /auth")
