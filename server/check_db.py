import sys
import os
from sqlalchemy import text
from database import engine, SessionLocal
from models import Organization, User

def check_db():
    print("\n--- ANCHOR DATABASE INSPECTION ---\n")
    db = SessionLocal()
    try:
        # 1. Check Organizations
        print("[ORGANIZATIONS]")
        orgs = db.query(Organization).all()
        if not orgs:
            print("  No organizations found.")
        for org in orgs:
            print(f"  - ID: {org.id} | Prefix: {org.entity_prefix} | Name: {org.display_name} | Region: {org.region}")

        # 2. Check Users
        print("\n[USERS]")
        users = db.query(User).all()
        if not users:
            print("  No users found.")
        for user in users:
            print(f"  - Email: {user.email} | Role: {user.role} | Organization ID: {user.org_id} | Status: {user.status}")

        print("\n----------------------------------")
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
