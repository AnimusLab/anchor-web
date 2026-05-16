import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///d:/anchor-web/server/anchor_hub.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def heal_ids():
    db = SessionLocal()
    try:
        # 1. Fix Hub ID (ANIM-IN-UNIT01 -> AL-IN-MUM01)
        db.execute(text("UPDATE hubs SET id = 'AL-IN-MUM01', unit = 'MUM01' WHERE id = 'ANIM-IN-UNIT01'"))
        
        # 2. Fix Enterprise User (hub_id and possibly their own ID)
        # Note: Changing primary keys is tricky, but for this session we need it.
        # We'll just fix the hub_id reference first.
        db.execute(text("UPDATE enterprise_users SET hub_id = 'AL-IN-MUM01' WHERE hub_id = 'ANIM-IN-UNIT01'"))
        
        # 3. Fix User ID (OWN-ANIM-IN-### -> OWN-AL-MUM-###)
        # We'll find the user first
        user = db.execute(text("SELECT id FROM enterprise_users WHERE email = 'tan@anchorgovernance.tech'")).fetchone()
        if user:
            old_id = user[0]
            if "ANIM-IN" in old_id:
                new_id = old_id.replace("ANIM-IN", "AL-MUM")
                db.execute(text("UPDATE enterprise_users SET id = :new WHERE id = :old"), {"new": new_id, "old": old_id})
                print(f"Healed User ID: {old_id} -> {new_id}")
        
        db.commit()
        print("Sovereign ID healing complete.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    heal_ids()
