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

# 2. Fix for SQLite/Postgres compatibility + Clean URL for HF Spaces
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Strip problematic params that some libpq versions don't support (e.g. channel_binding)
    cleaned_url = DATABASE_URL.split("?")[0]
    if "sslmode" in DATABASE_URL:
        cleaned_url += "?sslmode=require"
    
    engine = create_engine(
        cleaned_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
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
    SQLAlchemy models but are absent from the live database table."""
    from sqlalchemy import text
    
    # Cross-compatible Whitelist creation
    is_sqlite = DATABASE_URL.startswith("sqlite")
    pk_type = "INTEGER PRIMARY KEY AUTOINCREMENT" if is_sqlite else "SERIAL PRIMARY KEY"
    
    migrations = [
        f"CREATE TABLE IF NOT EXISTS whitelist (id {pk_type}, email VARCHAR UNIQUE, org_id VARCHAR, role VARCHAR, created_at VARCHAR)",
        "ALTER TABLE hubs ADD COLUMN region VARCHAR",
        "ALTER TABLE hubs ADD COLUMN unit VARCHAR",
        "ALTER TABLE hubs ADD COLUMN is_active BOOLEAN DEFAULT FALSE",
        "ALTER TABLE organizations ADD COLUMN domain VARCHAR",
        "ALTER TABLE regulatory_officials ADD COLUMN status VARCHAR DEFAULT 'pending'",
        "ALTER TABLE enterprise_users ADD COLUMN status VARCHAR DEFAULT 'pending'",
    ]

    with engine.connect() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                # Column already exists or table already exists
                pass
    print("[BOOT] Schema migrations verified.")

def init_db():
    """Creates all tables and seeds the sovereign mesh identities on first boot."""
    import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("[BOOT] Sovereign Mesh — Tables Verified.")

    # Apply any missing column migrations before seeding
    run_migrations()

    # Seeding is now disabled to prevent deleted records from returning on restart.
    # db = SessionLocal()
    # try:
    #     seed_mesh_identities(db)
    # finally:
    #     db.close()


def seed_mesh_identities(db):
    """Genesis Seeder — Injects regulatory bodies and primary identities."""
    from models import EnterpriseUser, RegulatoryOfficial, Organization

    # 1. Seed Organizations
    org_configs = [
        {"id": "SEC_26-10-04", "prefix": "sec", "name": "Securities & Exchange Commission", "type": "regulator"},
        {"id": "RBI_26-10-04", "prefix": "rbi", "name": "Reserve Bank of India", "type": "regulator"},
        {"id": "ALab_26-10-04", "prefix": "alab", "name": "Animus Global", "type": "enterprise"},
    ]

    for cfg in org_configs:
        existing = db.query(Organization).filter(Organization.id == cfg["id"]).first()
        if not existing:
            org = Organization(
                id=cfg["prefix"], # e.g. "sec"
                display_name=cfg["name"],
                org_type=cfg["type"],
                domain=f"{cfg['prefix']}.gov" if cfg["type"] == "regulator" else "animuslab.ai",
                created_at=datetime.utcnow().isoformat()
            )
            db.add(org)
            # Seed a default hub using the new format: [ORG]-[REGION]-[UNIT]
            from models import Hub
            hub_id = f"{cfg['prefix'].upper()}-GL-UNIT01"
            hub = Hub(
                id=hub_id,
                org_id=org.id,
                regional_key=secrets.token_hex(16),
                display_name=f"{cfg['name']} Global Hub",
                region="GL",
                unit="UNIT01",
                is_active=True,
                created_at=datetime.utcnow().isoformat()
            )
            db.add(hub)
            print(f"[SYSTEM] Mesh Node + Hub Seeded: {hub_id}")

    db.commit()

    # 2. Seed Primary Identities (Passwordless Role Models)
    test_secret = "JBSWY3DPEHPK3PXP" 
    
    ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")
    hashed_master = bcrypt.hashpw(ANCHOR_MASTER_KEY.encode(), bcrypt.gensalt()).decode() if ANCHOR_MASTER_KEY else None

    # Seed an auditor
    auditor_email = "artisianecho@gmail.com"
    auditor = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == auditor_email).first()
    if not auditor:
        auditor = RegulatoryOfficial(
            id="SEC_AE_26-10-04",
            email=auditor_email,
            display_name="Audit Echo",
            role="regulator",
            org_id="SEC_26-10-04",
            totp_secret=test_secret,
            status="approved",
            email_verified=True,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(auditor)
    
    if hashed_master:
        # Regulatory officials don't usually use passwords, but we'll sync if needed
        pass 
            
    print(f"[SYSTEM] Identity Synchronized: {auditor_email} (regulator)")
    
    db.commit()
    print("[BOOT] Sovereign Mesh — Genesis Seeding Complete.")
