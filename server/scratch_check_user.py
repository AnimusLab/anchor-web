from database import SessionLocal
from models import EnterpriseUser, Organization, Hub

db = SessionLocal()
user = db.query(EnterpriseUser).filter(EnterpriseUser.id == 'OWN-AN-MUM-772').first()
if user:
    print(f"User: {user.email}, Role: {user.role}, Org: {user.org_id}, Hub: {user.hub_id}")
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    if org:
        print(f"Org: {org.display_name}, Region: {org.region}")
    hub = db.query(Hub).filter(Hub.org_id == user.org_id).first()
    if hub:
        print(f"Hub: {hub.id}, Active: {hub.is_active}")
else:
    print("User not found")
db.close()
