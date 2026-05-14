import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Mock environment for DB access
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///d:/anchor-web/server/anchor_hub.db")
DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_to_pending():
    db = SessionLocal()
    try:
        # Reset any approved owners who haven't activated yet
        result = db.execute(text("UPDATE enterprise_users SET status = 'pending' WHERE status = 'approved' AND email = 'tan@anchorgovernance.tech'"))
        db.commit()
        print(f"Handled {result.rowcount} records.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_to_pending()
