from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os
import bcrypt
import secrets
from datetime import datetime

# Always load .env regardless of call context
load_dotenv()

# 1. Pull the URL from the environment, fallback to local SQLite for safety
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./anchor.db")

# 2. Fix for SQLite/Postgres compatibility
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,    # Test connection before use — handles Neon idle timeouts
        pool_recycle=300,      # Recycle connections every 5 min (Neon drops idle at ~5 min)
        pool_size=5,           # Keep 5 connections in pool
        max_overflow=10,       # Allow up to 10 extra connections under load
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_migrations():
    """Idempotent schema migration — safely adds any columns that exist in the
    SQLAlchemy models but are absent from the live database table.
    Uses IF NOT EXISTS so it is safe to run on every startup."""
    from sqlalchemy import text
    migrations = [
        # organizations table — columns added after initial deploy
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hub_id VARCHAR;",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS region VARCHAR;",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain VARCHAR;",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS master_key_hash VARCHAR;",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS server_region VARCHAR DEFAULT 'IN';",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hr_contact VARCHAR;",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';",
        "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS org_type VARCHAR DEFAULT 'enterprise';",
        # users table — columns added after initial deploy
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS clearance_id VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_pass VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR;",
    ]

    # Only run ALTER TABLE on Postgres (SQLite doesn't support IF NOT EXISTS)
    if not DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            for stmt in migrations:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception as e:
                    print(f"[MIGRATION] Skipped (already exists?): {stmt.split('ADD COLUMN')[1].strip()[:40]} — {e}")
        print("[BOOT] Schema migrations applied.")

def init_db():
    """Creates all tables and seeds the sovereign mesh identities on first boot."""
    import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("[BOOT] Sovereign Mesh — Tables Verified.")

    # Apply any missing column migrations before seeding
    run_migrations()

    db = SessionLocal()
    try:
        seed_mesh_identities(db)
    finally:
        db.close()


def seed_mesh_identities(db):
    """Genesis Seeder — Injects regulatory bodies and primary identities."""
    from models import User, Organization

    # 1. Seed Organizations
    org_configs = [
        {"id": "org_sec_master", "prefix": "sec", "name": "Securities & Exchange Commission", "type": "regulator"},
        {"id": "org_rbi_master", "prefix": "rbi", "name": "Reserve Bank of India", "type": "regulator"},
    ]

    for cfg in org_configs:
        existing = db.query(Organization).filter(Organization.id == cfg["id"]).first()
        if not existing:
            org = Organization(
                id=cfg["id"],
                hub_id=cfg["prefix"],
                display_name=cfg["name"],
                org_type=cfg["type"],
                domain=f"{cfg['prefix']}.gov" if cfg["type"] == "regulator" else "animuslab.ai",
                created_at=datetime.utcnow().isoformat()
            )
            db.add(org)
            print(f"[SYSTEM] Mesh Node Seeded: {cfg['prefix'].upper()}")

    db.commit()

    # 2. Seed Primary Identities (Passwordless Role Models)
    # Fixed TOTP Secret: "JBSWY3DPEHPK3PXP" (Enter this in Authenticator for testing)
    test_secret = "JBSWY3DPEHPK3PXP" 
    
    # Root admin password is the ANCHOR_MASTER_KEY from .env
    ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")
    hashed_master = bcrypt.hashpw(ANCHOR_MASTER_KEY.encode(), bcrypt.gensalt()).decode() if ANCHOR_MASTER_KEY else None

    users_to_seed = [
        {
            "email": "artisianecho@gmail.com", 
            "name": "Audit Echo", 
            "role": "regulator", 
            "org_id": "org_sec_master",
            "oid": "SEC-AUDITOR-99",
            "pass": hashed_master
        }
    ]

    for u_cfg in users_to_seed:
        user = db.query(User).filter(User.email == u_cfg["email"]).first()
        if not user:
            user = User(
                id=u_cfg["oid"], # Clearance ID is the primary ID
                email=u_cfg["email"],
                display_name=u_cfg["name"],
                role=u_cfg["role"],
                org_id=u_cfg["org_id"],
                totp_secret=test_secret,
                status="approved",
                email_verified=True,
                created_at=datetime.utcnow().isoformat()
            )
            db.add(user)
        
        # Always ensure the password/hash is synchronized with the latest .env
        if u_cfg["pass"]:
            user.hashed_pass = u_cfg["pass"]
            
        print(f"[SYSTEM] Identity Synchronized: {u_cfg['email']} ({u_cfg['role']})")
    
    db.commit()
    print("[BOOT] Sovereign Mesh — Genesis Seeding Complete.")
