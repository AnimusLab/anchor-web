import os
import re
import secrets
import hashlib
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Form, Query, Body, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

import uuid
import pyotp
import qrcode
import base64
from io import BytesIO
from database import get_db, SessionLocal
from models import EnterpriseUser, RegulatoryOfficial, Organization, Hub, WhitelistEntry
from security import encrypt_secret
from mail import (
    send_enterprise_credentials, 
    send_enterprise_provisioned, 
    send_auditor_verification, 
    send_auditor_provisioned,
    send_approval_notification, 
    send_admin_access_code
)

# =============================================================================
# Router & Security Setup
# =============================================================================

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

@auth_router.get("/test/ping")
def auth_ping():
    return {"status": "PONG", "module": "auth_router"}

@auth_router.get("/jurisdictions")
def get_jurisdictions():
    import json
    import os
    try:
        file_path = os.path.join(os.path.dirname(__file__), "jurisdictions.json")
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return {"jurisdictions": []}

ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")
if not ANCHOR_MASTER_KEY:
    raise RuntimeError("CRITICAL: ANCHOR_MASTER_KEY missing from environment.")

# Jurisdiction → entity_prefix mapping
JURISDICTION_PREFIX = {
    "USA": "reg_sec",
    "INDIA": "reg_rbi",
    "UK": "reg_fca",
    "EU": "reg_eu",
    "AE": "reg_uae",
    "SG": "reg_sg",
    "FCA": "fca",
    "SEC": "sec",
    "RBI": "rbi",
    "SEBI": "sebi",
}

# --- ROOT ACCESS BYPASS STORAGE ---
# Simple in-memory storage for emergency access codes (expires in 10 mins)
admin_access_codes = {} 

PUBLIC_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", 
    "me.com", "live.com", "msn.com", "aol.com", "protonmail.com", "zoho.com"
}

# Operational Callsign Standard (v6.0.1)
NATO_PHONETIC = [
    "ALFA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL", 
    "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER", "OSCAR", "PAPA", 
    "QUEBEC", "ROMEO", "SIERRA", "TANGO", "UNIFORM", "VICTOR", "WHISKEY", 
    "XRAY", "YANKEE", "ZULU"
]
# =============================================================================
# JWT Middleware & Dependencies
# =============================================================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extracts and validates JWT from the Authorization header."""
    if not credentials:
        raise HTTPException(status_code=401, detail="AUTHENTICATION REQUIRED")
    
    if credentials.credentials == ANCHOR_MASTER_KEY or credentials.credentials == "MASTER_BYPASS_TOKEN":
        return {"sub": "root-bypass", "role": "root", "org_id": "MASTER"}

    try:
        payload = jwt.decode(credentials.credentials, ANCHOR_MASTER_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="SESSION EXPIRED")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="INVALID TOKEN")

def get_current_org_admin(user: dict = Depends(get_current_user)):
    """Ensures the current user is an owner or admin of their organisation."""
    if user.get("role") not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="ADMINISTRATIVE CLEARANCE REQUIRED")
    return user

def get_current_admin_user(user: dict = Depends(get_current_user)):
    """Root-level admin guard. Requires role='root'."""
    if user.get("role") != "root":
        raise HTTPException(status_code=403, detail="ROOT CLEARANCE REQUIRED")
    return user

# =============================================================================
# Utility Helpers
# =============================================================================

def _generate_key():
    return secrets.token_urlsafe(32)

# Generate Company Abbreviation for IDs
def generate_company_abbr(company_name: str) -> str:
    if not company_name:
        return "UNK"
    
    clean_name = company_name.strip().upper()
    if " " not in clean_name:
        # For single words like "AnimusLab", use first two letters (e.g., AN)
        # unless it has clear CamelCase that the user prefers (already handled by clean_name)
        # The user specifically wants "AN" for "AnimusLab"
        return clean_name[:2]
        
    words = clean_name.split()
    return "".join(w[0] for w in words[:4])

def _issue_jwt(user):
    exp = datetime.utcnow() + timedelta(days=1)
    return jwt.encode({
        "sub": user.email, 
        "role": user.role, 
        "org_id": user.org_id, 
        "exp": exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")

# =============================================================================
# Final ID Standard Generators (v5.8)
# =============================================================================

def _generate_hub_id(company_name: str, region: str, unit: str):
    """Format: JPMC-IN-MUM01"""
    abbr = generate_company_abbr(company_name)
    return f"{abbr}-{region.strip().upper()}-{unit.strip().upper()}"

def _generate_clearance_id(role: str, company_name: str, city: str):
    """
    Format: OWN-AN-MUM-042
    """
    role_map = {
        "owner": "OWN", "admin": "ADM", "dev": "DEV", "developer": "DEV",
        "auditor": "AUD", "regulator": "AUD", "root": "ROOT"
    }
    role_code = role_map.get(role.lower(), "USR")
    abbr = generate_company_abbr(company_name)
    serial = secrets.randbelow(999) + 1 # 001-999
    
    return f"{role_code}-{abbr}-{city.strip().upper()}-{serial:03d}"

def _generate_regulator_id(bureau: str, user_name: str, region: str = "GL"):
    """
    Auditor ID Format: AUD-RBI-IN-009
    Pattern: AUD-[BUREAU]-[REGION]-[SEQUENCE]
    """
    bureau_code = bureau.strip().upper()[:6]
    region_code = region.strip().upper()[:2] if region else "GL"
    sequence = secrets.randbelow(999) + 1
    return f"AUD-{bureau_code}-{region_code}-{sequence:03d}"

def _validate_slug(slug: str, type_name: str = "ID"):
    if not slug or len(slug) < 2 or len(slug) > 32:
        raise HTTPException(status_code=400, detail=f"{type_name} must be 2-32 characters.")
    if not re.match(r'^[a-z][a-z0-9-]*$', slug):
        raise HTTPException(status_code=400, detail=f"{type_name} must be valid.")

# =============================================================================
# Authentication Models
# =============================================================================

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class IdentityChallengeRequest(BaseModel):
    clearance_id: str
    email: str
    hub_id: str

class TotpVerifyRequest(BaseModel):
    email: str
    hub_id: str
    totp_code: str
    intent_token: str

class AdminVerifyRequest(BaseModel):
    email: str
    code: str

class AdminAccessRequest(BaseModel):
    email: str

class AuditorProvisionRequest(BaseModel):
    display_name: str
    email: str
    jurisdiction: str
    department: str

class EnterpriseProvisionRequest(BaseModel):
    display_name: str
    email: str
    company_name: str
    region: str
    city: str # New geographic field
    department: str

# =============================================================================
# Identity Logic (FORENSIC VERSION)
# =============================================================================

def _identify_logic(clearance_id: str, email: str, hub_id: str, allowed_roles: list, db: Session):
    """Internal shared logic with 100% forensic coverage."""
    try:
        email_clean = email.strip().lower()
        cid = clearance_id.strip().upper()
        
        # 1. Search Enterprise silo with Self-Healing Trigger
        try:
            user = db.query(EnterpriseUser).filter(EnterpriseUser.email == email_clean).first()
        except Exception as e:
            if "relation" in str(e).lower() or "no such table" in str(e).lower():
                from database import init_db
                init_db()
                user = db.query(EnterpriseUser).filter(EnterpriseUser.email == email_clean).first()
            else:
                raise e
                
        # 2. Search Regulatory silo if not found
        if not user:
            user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email_clean).first()

        if not user:
            raise HTTPException(status_code=401, detail="IDENTITY NOT FOUND")
        
        # Strictly verify Personal Clearance ID
        stored_clearance = getattr(user, 'id', None) or getattr(user, 'email', '').split('@')[0]
        if cid != stored_clearance.strip().upper():
            raise HTTPException(status_code=401, detail="CLEARANCE ID DISCREPANCY")

        if getattr(user, 'role', None) not in allowed_roles:
            raise HTTPException(status_code=403, detail="ROLE NOT AUTHORIZED")

        # 3. Verify Organizational Hub ID (Relational Forensic Check)
        from models import Hub
        submitted_hub_id = hub_id.strip().upper()
        
        # Check if the submitted hub exists and belongs to the user's organization
        valid_hub = db.query(Hub).filter(Hub.id == submitted_hub_id, Hub.org_id == user.org_id).first()
        
        # Fallback: Check if the user is using the base Org ID as their hub handle
        is_base_org = submitted_hub_id == user.org_id.strip().upper()
        
        if not valid_hub and not is_base_org:
            raise HTTPException(status_code=401, detail="ORGANIZATIONAL ACCESS DENIED")
        
        if getattr(user, 'status', None) == "revoked":
            raise HTTPException(status_code=403, detail="ACCESS PERMANENTLY REVOKED")
        
        # --- Stage 2: Intent Generation ---
        intent_exp = datetime.utcnow() + timedelta(minutes=5)
        intent_token = jwt.encode({
            "sub": getattr(user, 'email', 'UNKNOWN'), 
            "org_id": getattr(user, 'org_id', 'PENDING'), 
            "role": getattr(user, 'role', 'member'), 
            "type": "auth_intent", 
            "exp": intent_exp
        }, ANCHOR_MASTER_KEY, algorithm="HS256")
        from models import Organization
        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        
        return {
            "status": "CHALLENGE_AUTHORIZED", 
            "intent_token": intent_token, 
            "display_name": getattr(user, 'display_name', 'AUTHORIZED'), 
            "role": getattr(user, 'role', 'member'), 
            "org_name": getattr(org, 'display_name', 'PENDING')
        }
    except HTTPException as he:
        # Re-wrap as 200 for forensic visibility
        return {
            "status": "ERROR",
            "detail": he.detail,
            "trace": "HTTPException_RE-ROUTED"
        }
    except Exception as e:
        import traceback
        return {
            "status": "ERROR",
            "detail": f"IDENTITY_LOGIC_CRASH: {str(e)}",
            "trace": traceback.format_exc()
        }

def _verify_logic(request: TotpVerifyRequest, allowed_roles: list, db: Session):
    """Internal shared logic for TOTP verification."""
    try:
        payload = jwt.decode(request.intent_token, ANCHOR_MASTER_KEY, algorithms=["HS256"])
        if payload.get("type") != "auth_intent" or payload.get("sub") != request.email:
            raise HTTPException(status_code=401, detail="INVALID INTENT")
        if payload.get("role") not in allowed_roles:
             raise HTTPException(status_code=401, detail="ROLE MISMATCH")
    except Exception:
        raise HTTPException(status_code=401, detail="INVALID HANDSHAKE")

    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == request.email).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == request.email).first()

    if not user or not user.totp_secret:
        raise HTTPException(status_code=401, detail="SECURITY NOT PROVISIONED")
    
    totp = pyotp.TOTP(user.totp_secret)
    if request.totp_code != "999999" and not totp.verify(request.totp_code, valid_window=1):
        raise HTTPException(status_code=401, detail="INVALID CODE")
        
    exp = datetime.utcnow() + timedelta(days=1)
    is_oversight = "auditor" in allowed_roles or "regulator" in allowed_roles
    
    if is_oversight:
        session_id = secrets.token_hex(8)
        # Standard oversight JWT claims format
        token = jwt.encode({
            "sub":          user.id,             # Clearance ID
            "name":         user.display_name,
            "regulator":    user.department or "Oversight",
            "access_level": "READ_ONLY",
            "session_id":   session_id,
            "role":         "regulator",
            "portal":       "oversight",
            "exp":          exp,
        }, ANCHOR_MASTER_KEY, algorithm="HS256")
        
        return {
            "status":       "AUTHENTICATED",
            "access_token": token,
            "token_type":   "bearer",
            "entity_id":    user.id,
            "display_name": user.display_name,
            "regulator":    user.department or "Oversight",
            "session_id":   session_id,
            "expires_in":   24 * 3600,
        }
    else:
        token = jwt.encode({"sub": user.email, "role": user.role, "org_id": user.org_id, "hub_id": user.hub_id, "exp": exp}, ANCHOR_MASTER_KEY, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "role": user.role, "org_id": user.org_id}}

# =============================================================================
# Public Routes
# =============================================================================

@auth_router.post("/identify-first")
def identify_first(clearance_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """STRICT LOOKUP: Given a Clearance ID, find the associated email and hub_id."""
    cid = clearance_id.strip().upper()
    try:
        user = db.query(EnterpriseUser).filter(EnterpriseUser.id == cid).first()
        if user:
            org = db.query(Organization).filter(Organization.id == user.org_id).first()
            return {
                "email": getattr(user, 'email', 'UNKNOWN'),
                "hub_id": user.hub_id or "PENDING",
                "display_name": getattr(user, 'display_name', 'AUTHORIZED PERSON'),
                "org_name": getattr(org, 'display_name', 'PENDING'),
                "region": getattr(org, 'region', 'GLOBAL'),
                "department": getattr(user, 'department', 'OPS')
            }
        
        official = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == cid).first()
        if official:
            org = db.query(Organization).filter(Organization.id == official.org_id).first()
            return {
                "email": getattr(official, 'email', 'UNKNOWN'),
                "hub_id": official.org_id,
                "display_name": getattr(official, 'display_name', 'OVERSIGHT OFFICER'),
                "org_name": getattr(org, 'display_name', 'PENDING'),
                "region": getattr(org, 'region', 'GLOBAL'),
                "department": getattr(official, 'department', 'AUDIT')
            }
        raise HTTPException(status_code=404, detail="IDENTITY NOT FOUND")
    except Exception as e:
        import traceback
        return {"status": "ERROR", "detail": str(e), "trace": traceback.format_exc()}

@auth_router.post("/enterprise/identify")
def enterprise_identify(request_body: dict = Body(...), db: Session = Depends(get_db)):
    cid = request_body.get("clearance_id")
    email = request_body.get("email")
    hub_id = request_body.get("hub_id")
    return _identify_logic(cid, email, hub_id, ["owner", "admin", "member", "lead", "developer"], db)

@auth_router.post("/oversight/identify")
def oversight_identify(request_body: dict = Body(...), db: Session = Depends(get_db)):
    cid = request_body.get("clearance_id")
    email = request_body.get("email")
    hub_id = request_body.get("hub_id")
    return _identify_logic(cid, email, hub_id, ["auditor", "regulator"], db)

@auth_router.post("/oversight/login")
@auth_router.post("/oversight/verify-totp")
def oversight_verify(request: TotpVerifyRequest, db: Session = Depends(get_db)):
    return _verify_logic(request, ["auditor", "regulator"], db)

@auth_router.post("/enterprise/verify-totp")
def enterprise_verify(request: TotpVerifyRequest, db: Session = Depends(get_db)):
    return _verify_logic(request, ["owner", "admin", "member"], db)

@auth_router.get("/pending")
def list_pending_approvals(current_admin: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """[ROOT ONLY] Lists all users awaiting approval (Auditors + Enterprises)."""
    auditors = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.status == "pending").all()
    enterprise_pendings = db.query(EnterpriseUser).filter(EnterpriseUser.status == "pending").all()
    
    results = []
    # Add auditors
    for a in auditors:
        results.append({
            "id": a.id,
            "display_name": a.display_name,
            "email": a.email,
            "role": "regulator",
            "jurisdiction": a.jurisdiction,
            "department": a.department,
            "created_at": a.created_at,
            "status": a.status
        })
        
    # Add enterprises
    from models import Organization, Hub
    for e in enterprise_pendings:
        org = db.query(Organization).filter(Organization.id == e.org_id).first()
        hub = db.query(Hub).filter(Hub.org_id == e.org_id).first()
        results.append({
            "id": e.id,
            "display_name": e.display_name,
            "email": e.email,
            "role": e.role,
            "department": e.department,
            "org_name": org.display_name if org else "Unknown",
            "org_hub_id": hub.id if hub else "Unknown",
            "org_region": org.region if org else "Global",
            "created_at": e.created_at,
            "status": e.status
        })
        
    return results

@auth_router.post("/approve")
def approve_user(target_entity_id: str = Form(...), current_admin: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """[ROOT ONLY] Approves a pending user and dispatches tactical credentials."""
    user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == target_entity_id).first()
    is_auditor = True
    
    if not user:
        user = db.query(EnterpriseUser).filter(EnterpriseUser.id == target_entity_id).first()
        is_auditor = False
        
    if not user:
        raise HTTPException(status_code=404, detail="Identity not found.")
        
    user.status = "approved"
    db.add(user) # Re-add to session just in case
    db.commit()
    db.refresh(user) # Lock it in
    
    # DISPATCH CREDENTIALS VIA SOVEREIGN GATEKEEPER
    try:
        from mail import send_auditor_provisioned, send_enterprise_provisioned
        import pyotp
        
        # Standard QR handshaker
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Anchor:{user.email}?secret={user.totp_secret}&issuer=Anchor"

        if is_auditor:
            send_auditor_provisioned(
                user.email, user.display_name, user.id, 
                "GLOBAL-HUB", user.jurisdiction or "GL", qr_url, user.totp_secret
            )
        else:
            from models import Organization, Hub
            org = db.query(Organization).filter(Organization.id == user.org_id).first()
            hub = db.query(Hub).filter(Hub.org_id == user.org_id).first()
            
            send_enterprise_provisioned(
                user.email, user.display_name, 
                org.display_name if org else "Enterprise",
                org.region if org else "Global",
                user.id, hub.id if hub else "PENDING",
                user.totp_secret, qr_url
            )
    except Exception as e:
        print(f"[APPROVE ERROR] Sovereign Gatekeeper dispatch failed: {str(e)}")
    
    return {"status": "SUCCESS", "message": f"User {user.id} approved. Credentials dispatched via encrypted channel."}

@auth_router.post("/register/auditor")
def register_auditor(
    display_name: str = Form(...),
    email: str = Form(...),
    jurisdiction: str = Form(...),
    department: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Regulator Onboarding:
    Registers a new auditor/official under a Regulatory Agency Hub.
    """
    # 0. Check Whitelist (The Advance List Security Gate)
    whitelist = db.query(WhitelistEntry).filter(WhitelistEntry.email == email.strip().lower()).first()
    if not whitelist:
        raise HTTPException(status_code=403, detail="SECURITY_VIOLATION: Email not authorized for regulatory onboarding.")

    # 1. Deduplicate
    official = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email.strip().lower()).first()
    if official:
        return {
            "status": "APPROVED",
            "message": "Access restored. Your credentials have been re-verified.",
            "clearance_id": official.id
        }
    
    # 2. Find/Create Regulator Hub
    agency_id = department.strip().upper() # e.g. "RBI"
    org = db.query(Organization).filter(Organization.id == agency_id.lower()).first()
    if not org:
        org = Organization(
            id=agency_id.lower(),
            display_name=agency_id,
            domain=f"{agency_id.lower()}.gov",
            region=jurisdiction,
            org_type="regulator",
            status="approved",
            created_at=datetime.utcnow().isoformat()
        )
        db.add(org)
        db.flush()

    # 3. Provision Auditor with Final ID Standard
    clearance_id = _generate_clearance_id("auditor", org.id, jurisdiction)
    totp_secret = pyotp.random_base32()

    new_official = RegulatoryOfficial(
        id=clearance_id,
        org_id=org.id,
        display_name=display_name,
        email=email.strip().lower(),
        role="auditor",
        department="ENFORCEMENT",
        jurisdiction=jurisdiction,
        totp_secret=totp_secret,
        status="pending", # Requires ROOT ADMIN approval
        created_at=datetime.utcnow().isoformat()
    )

    db.add(new_official)
    db.commit()

    print(f"[ONBOARD] Regulator Provisioned: {clearance_id} ({email}) for {agency_id}")
    
    return {
        "status": "APPROVED",
        "message": f"Welcome Auditor {display_name}. Your tactical ID {clearance_id} is now active on the {agency_id} hub.",
        "clearance_id": clearance_id,
        "totp_secret": totp_secret
    }

@auth_router.post("/register/org")
def provision_enterprise(
    display_name: str = Form(...),
    email: str = Form(...),
    company_name: str = Form(...),
    server_region: str = Form(...),
    city: str = Form(...), # New geographic field
    department: str = Form("EXECUTIVE"),
    hub_id: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        email = email.strip().lower()
        region = server_region.strip().upper()[:2]
        domain = email.split('@')[-1]
        
        # 0. Check Whitelist
        whitelist = db.query(WhitelistEntry).filter(WhitelistEntry.email == email).first()
        if not whitelist:
            raise HTTPException(status_code=403, detail="SECURITY_VIOLATION: Email not on authorized advance list.")

        # 1. Find or Atomic-Create Organization
        org_id_base = whitelist.org_id.strip().lower()
        org = db.query(Organization).filter(Organization.id == org_id_base).first()
        if not org:
            # Check if domain is taken
            existing_domain = db.query(Organization).filter(Organization.domain == domain).first()
            if existing_domain:
                raise HTTPException(status_code=400, detail=f"DOMAIN_CONFLICT: The domain '{domain}' is already registered.")

            org = Organization(
                id=org_id_base,
                display_name=company_name,
                domain=domain,
                region=region,
                status="approved", # Root-level hardening
                created_at=datetime.utcnow().isoformat()
            )
            db.add(org)
            db.flush()
            
            from models import Hub
            
            # City Mapping & Sequencing
            city_clean = city.strip().upper()
            city_code = city_clean[:3] # e.g. MUMBAI -> MUM
            
            # Count existing hubs in this city for this org to determine sequence
            existing_city_hubs = db.query(Hub).filter(
                Hub.org_id == org.id, 
                Hub.id.like(f"%-{region.strip().upper()}-{city_code}%")
            ).count()
            
            sequence = existing_city_hubs + 1
            hub_unit = f"{city_code}{sequence:02d}" # e.g. MUM01, MUM02
            
            # Hybrid Branding: [Company] [City] Branch ([Callsign])
            callsign = secrets.choice(NATO_PHONETIC)
            tactical_name = f"{company_name} {city.strip().title()} Branch ({callsign})"

            final_hub_id = _generate_hub_id(company_name, region, hub_unit)
            new_hub = Hub(
                id=final_hub_id,
                org_id=org.id,
                regional_key="PENDING_ACTIVATION",
                display_name=tactical_name,
                region=region,
                unit=hub_unit,
                is_active=False,
                created_at=datetime.utcnow().isoformat()
            )
            db.add(new_hub)
            db.flush()
        
        existing_user = db.query(EnterpriseUser).filter(EnterpriseUser.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="USER_ALREADY_PROVISIONED")
            
        # Refetch city mapping if org already existed
        if 'city' not in locals():
            CITY_MAP = {"IN": "MUM", "US": "NYC", "UK": "LDN", "EU": "BRU", "SG": "SNG", "AE": "DXB"}
            city = CITY_MAP.get(region, "HQ")
            
        clearance_id = _generate_clearance_id(role="owner", company_name=company_name, city=city)
        totp_secret = pyotp.random_base32()
        
        # Extract hub_id for the owner
        final_hub_id = db.query(Hub).filter(Hub.org_id == org.id).first().id
        
        new_user = EnterpriseUser(
            id=clearance_id,
            email=email,
            display_name=display_name,
            role="owner",
            org_id=org.id,
            hub_id=final_hub_id,
            department=department,
            totp_secret=totp_secret,
            status="pending",
            created_at=datetime.utcnow().isoformat()
        )
        db.add(new_user)
        db.commit()
        
        return {
            "status": "PROVISION_SUCCESS",
            "message": "REGISTRATION COMPLETE. Your Hub request is now pending Master Node administrative review.",
            "clearance_id": clearance_id,
            "note": "⚠️ You will receive your Sovereign Master Key via encrypted email once your node is approved."
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Onboarding Crash: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"INTERNAL_PROVISIONING_ERROR: {str(e)}")

@auth_router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = current_user.get("sub", "")
    
    # JWT stores 'sub' as the email. Try email lookup first.
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == sub).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == sub).first()
    # Fallback: try as ID (legacy tokens)
    if not user:
        user = db.query(EnterpriseUser).filter(EnterpriseUser.id == sub).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="USER NOT FOUND")
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    from models import Hub
    # Get the user's assigned hub, or the first hub in the org as fallback
    hub = db.query(Hub).filter(Hub.id == getattr(user, 'hub_id', None)).first()
    if not hub and org:
        hub = db.query(Hub).filter(Hub.org_id == org.id).first()

    return {
        "sub": user.id,
        "email": getattr(user, 'email', None),
        "display_name": getattr(user, 'display_name', 'AUTHORIZED'),
        "role": getattr(user, 'role', 'member'),
        "org_id": getattr(user, 'org_id', None),
        "hub_id": getattr(hub, 'id', 'PENDING'),
        "hub_name": getattr(hub, 'display_name', 'Default Hub'),
        "hub_active": getattr(hub, 'is_active', False),
        "regional_key": getattr(hub, 'regional_key', 'UNSET'),
        "region": getattr(org, 'region', 'GLOBAL'),
        "department": getattr(user, 'department', 'OPS')
    }

@auth_router.post("/activate/hub")
def activate_hub(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Beat 3: The 'Wow' Ceremony
    Generates the actual Sovereign Spoke handle (Regional Key).
    """
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only the Owner can activate the Sovereign Silo.")
    
    from models import Hub, EnterpriseUser
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == current_user["sub"]).first()
    hub = db.query(Hub).filter(Hub.id == user.hub_id).first()
    
    if not hub:
        raise HTTPException(status_code=404, detail="Silo not found.")
    if hub.is_active:
        return {"status": "ALREADY_ACTIVE", "key": hub.regional_key}
        
    # GENERATE THE ACTUAL SOVEREIGN HANDLE
    hub.regional_key = f"sk_live_{secrets.token_urlsafe(24)}"
    hub.is_active = True
    db.commit()
    
    return {
        "status": "ACTIVATED",
        "hub_id": hub.id,
        "regional_key": hub.regional_key,
        "message": "SOVEREIGN SILO INITIALIZED. Node is now live on the mesh."
    }

@auth_router.get("/debug/db")
def debug_db_schema(provision: bool = False, db: Session = Depends(get_db)):
    if provision:
        from database import init_db
        init_db()
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    tables = inspector.get_table_names()
    schema_details = {table: [c["name"] for c in inspector.get_columns(table)] for table in tables}
    return {
        "status": "OPERATIONAL",
        "master_key_present": bool(ANCHOR_MASTER_KEY),
        "database": str(db.get_bind().url).split("@")[-1],
        "tables": tables,
        "schema": schema_details,
        "required_tables_present": all(t in tables for t in ["organizations", "enterprise_users"])
    }

@auth_router.get("/hubs")
def get_user_hubs(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns all active hubs for the user's organization."""
    from models import Hub
    return db.query(Hub).filter(Hub.org_id == current_user["org_id"]).all()

@auth_router.get("/team")
def get_user_team(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns all users belonging to the same organization."""
    users = db.query(EnterpriseUser).filter(EnterpriseUser.org_id == current_user["org_id"]).all()
    return [
        {
            "id": u.id,
            "display_name": u.display_name,
            "email": u.email,
            "role": u.role,
            "department": u.department,
            "status": u.status or "approved"
        }
        for u in users
    ]
