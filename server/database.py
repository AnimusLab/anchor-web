from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os
import bcrypt
from datetime import datetime

# Always load .env regardless of call context (proxy.py, scripts, or direct calls)
load_dotenv()

# 1. Pull the URL from the environment, fallback to local SQLite for safety
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./anchor.db")

# 2. Fix for SQLite/Postgres compatibility
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use standard PostgreSQL engine for cloud deployments (Render, Supabase, Neon)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Creates all tables and seeds the root admin identity on first boot."""
    # Import models so Base.metadata knows about all tables
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    print("[BOOT] Database tables verified.")

    # Seed the root admin
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


def seed_admin(db):
    """Genesis Seeder — Injects the root admin identities if none exist."""
    from models import User

    # List of authorized emails for the Anchor Root
    root_emails = ["tan@anchorgovernance.tech", "artisianecho@gmail.com"]
    
    master_key = os.getenv("ANCHOR_MASTER_KEY")
    if not master_key:
        print("[WARNING] ANCHOR_MASTER_KEY not found. Root admins NOT seeded.")
        return

    # Hash the master key with bcrypt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(master_key.encode("utf-8"), salt).decode("utf-8")

    for email in root_emails:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            admin = User(
                id=f"usr_root_{email.split('@')[0]}",
                email=email,
                display_name=f"Admin ({email.split('@')[0]})",
                role="admin",
                hashed_pass=hashed,
                status="approved",
                email_verified=True,
                created_at=datetime.utcnow().isoformat(),
            )
            db.add(admin)
            print(f"[SYSTEM] Root admin identity seeded: email='{email}'")
        else:
            print(f"[BOOT] Admin identity already verified: email='{email}'")
    
    db.commit()

