from database import engine, SessionLocal, init_db
from models import Organization, Hub, EnterpriseUser, RegulatoryOfficial, LedgerEntry, ForensicRequest, EnforcementNotice, AuditTrailEntry, WhitelistEntry
from sqlalchemy import text

def wipe_data():
    print("[RESET] Starting Deep Sovereign Mesh Purge...")
    
    from database import Base, engine
    with engine.connect() as conn:
        if str(engine.url).startswith("sqlite"):
            conn.execute(text("PRAGMA foreign_keys = OFF;"))
        
        # Deep Clean: Drop all tables to clear legacy columns (like hub_id in organizations)
        print("[RESET] Dropping all tables for schema sync...")
        Base.metadata.drop_all(bind=engine)
        conn.commit()
        print("[RESET] Deep Purge Complete.")

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
