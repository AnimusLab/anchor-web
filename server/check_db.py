import sys
import os
from sqlalchemy import text
from database import engine, SessionLocal
from models import Organization, EnterpriseUser, RegulatoryOfficial

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
            print(f"  - ID: {org.id} | Name: {org.display_name} | Region: {org.region}")

        # 2. Check Enterprise Users
        print("\n[ENTERPRISE USERS]")
        users = db.query(EnterpriseUser).all()
        if not users:
            print("  No enterprise users found.")
        for user in users:
            print(f"  - ID: {user.id} | Email: {user.email} | Role: {user.role} | Org: {user.org_id}")

        # 3. Check Regulatory Officials
        print("\n[REGULATORY OFFICIALS]")
        regs = db.query(RegulatoryOfficial).all()
        if not regs:
            print("  No regulatory officials found.")
        for reg in regs:
            print(f"  - ID: {reg.id} | Email: {reg.email} | Org: {reg.org_id}")

        print("\n----------------------------------")
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
