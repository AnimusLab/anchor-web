from database import SessionLocal, engine
from sqlalchemy import text

def check_schema():
    with engine.connect() as conn:
        try:
            res = conn.execute(text("SELECT hub_id FROM organizations LIMIT 1"))
            print("hub_id exists in organizations")
        except Exception as e:
            print(f"Error: {e}")

        try:
            res = conn.execute(text("SELECT org_id FROM regulatory_officials LIMIT 1"))
            print("org_id exists in regulatory_officials")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
