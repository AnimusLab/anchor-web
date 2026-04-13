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
    """Genesis Seeder — Injects the root admin identity if none exists."""
    from models import User

    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        print(f"[BOOT] Root admin already exists: entity_id='{existing_admin.entity_id}'")
        return

    master_key = os.getenv("ANCHOR_MASTER_KEY")
    if not master_key:
        print("[WARNING] ANCHOR_MASTER_KEY not found. Root admin NOT seeded.")
        return

    # Hash the master key with bcrypt — never store plaintext
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(master_key.encode("utf-8"), salt).decode("utf-8")

    admin = User(
        id="usr_root_001",
        entity_id="root",
        display_name="Master Node Admin",
        role="admin",
        hashed_key=hashed,
        status="approved",
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(admin)
    db.commit()
    print("[SYSTEM] Root admin identity seeded into the mesh. entity_id='root'")

