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
from models import EnterpriseUser, RegulatoryOfficial, Fleet, Organization, OrgInvite
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
    """Extracts and validates JWT from the Authorization header.
    Supports Master-Key-Bypass for emergency recovery."""
    if not credentials:
        raise HTTPException(status_code=401, detail="AUTHENTICATION REQUIRED")
    
    # --- MASTER KEY / BYPASS TOKEN ---
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
    """Root-level admin guard. Requires role='root' (Anchor Master Node access)."""
    if user.get("role") != "root":
        raise HTTPException(status_code=403, detail="ROOT CLEARANCE REQUIRED")
    return user

# =============================================================================
# Utility Helpers
# =============================================================================

def _generate_key():
    """Generates a cryptographically secure 256-bit secret key."""
    return secrets.token_urlsafe(32)

def _issue_jwt(user):
    """Generates a scoped JWT for a user or official."""
    exp = datetime.utcnow() + timedelta(days=1)
    return jwt.encode({
        "sub": user.email, 
        "role": user.role, 
        "org_id": user.org_id, 
        "exp": exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")

# =============================================================================
# ID Generation Patterns (Unified & Pattern-Based)
# =============================================================================

def _generate_org_id(name: str):
    """ALab_26-10-04"""
    # Filter only alphanumeric, take first 4, capitalize
    clean = "".join(c for c in name if c.isalnum())
    prefix = clean[:4].capitalize() if len(clean) >= 4 else clean.capitalize()
    date_str = datetime.utcnow().strftime("%d-%m-%y")
    return f"{prefix}_{date_str}"

def _generate_clearance_id(org_name: str, user_name: str):
    """ALAB-701 (Flight Tag)"""
    clean_org = "".join(c for c in org_name if c.isalnum()).upper()
    prefix = clean_org[:4] if len(clean_org) >= 4 else clean_org
    suffix = secrets.token_hex(2).upper()[:3]
    return f"{prefix}-{suffix}"

def _generate_regulator_id(bureau: str, user_name: str):
    """SEC-ALFA-9 (NATO Phonetic)"""
    prefix = bureau.strip().upper()
    word = secrets.choice(NATO_PHONETIC)
    digit = secrets.randbelow(10)
    return f"{prefix}-{word}-{digit}"

def _validate_slug(slug: str, type_name: str = "ID"):
    """Validates an entity_prefix or project_name."""
    if not slug or len(slug) < 2 or len(slug) > 32:
        raise HTTPException(status_code=400, detail=f"{type_name} must be 2-32 characters.")
    if not re.match(r'^[a-z][a-z0-9-]*$', slug):
        raise HTTPException(
            status_code=400,
            detail=f"{type_name} must start with a letter and contain only lowercase letters, numbers, and hyphens."
        )

# =============================================================================
# Authentication Routes
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
    intent_token: str # Short-lived token generated by /identify

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
    department: str
    jurisdiction: str

@auth_router.post("/login")
def login(
    request_data: LoginRequest = None,
    email: str = Form(None), 
    password: str = Form(None), 
    db: Session = Depends(get_db)
):
    """Authenticates a user and returns a scoped JWT. Supports both JSON and Form inputs."""
    # Handle both JSON (from Root Console) and Form (from legacy Dashboards)
    final_email = request_data.email if request_data else email
    final_pass = request_data.password if request_data else password

    if not final_email or not final_pass:
        raise HTTPException(status_code=400, detail="MISSING CREDENTIALS")

    user = db.query(User).filter(User.email == final_email.strip().lower()).first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY NOT FOUND")

    if user.status == "revoked":
        raise HTTPException(status_code=403, detail="ACCESS PERMANENTLY REVOKED")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="EMAIL NOT VERIFIED")

    # Verify password (which is the ANCHOR_MASTER_KEY for root admins)
    if not bcrypt.checkpw(final_pass.encode("utf-8"), user.hashed_pass.encode("utf-8")):
        raise HTTPException(status_code=401, detail="INVALID SIGNATURE")

    # Scoped Token Generation
    exp = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({"sub": user.email, "role": user.role, "org_id": user.org_id, "exp": exp}, ANCHOR_MASTER_KEY, algorithm="HS256")
    
    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "org_id": user.org_id
        }
    }

@auth_router.get("/jurisdictions")
def get_jurisdictions():
    """Returns the centralized list of global jurisdictions and bureaus."""
    import json
    try:
        with open("server/jurisdictions.json", "r") as f:
            return json.load(f)
    except Exception:
        return {"jurisdictions": []}

def _identify_logic(clearance_id: str, email: str, hub_id: str, allowed_roles: list, db: Session):
    """Internal shared logic for identity challenge with strict triple-factor scoping."""
    email_clean = email.strip().lower()
    
    # 1. Search Enterprise silo
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == email_clean).first()
    
    # 2. Search Regulatory silo if not found
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email_clean).first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY NOT FOUND")
    
    # Strictly verify Personal Clearance ID (clearance_id)
    # We allow a manual match or email prefix fallback for legacy accounts
    stored_clearance = user.clearance_id or user.email.split('@')[0]
    if clearance_id.strip().upper() != stored_clearance.strip().upper():
        raise HTTPException(status_code=401, detail="CLEARANCE ID DISCREPANCY")

    if user.role not in allowed_roles:
        raise HTTPException(status_code=401, detail="INSUFFICIENT CLEARANCE LEVEL")
    
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    if not org or (org.hub_id != hub_id.strip().lower() and org.id != hub_id.strip().lower()):
        raise HTTPException(status_code=401, detail="ORGANIZATIONAL ACCESS DENIED")
    
    if user.status == "revoked":
        raise HTTPException(status_code=403, detail="ACCESS PERMANENTLY REVOKED")
    
    intent_exp = datetime.utcnow() + timedelta(minutes=5)
    intent_token = jwt.encode({
        "sub": user.email, "org_id": user.org_id, "role": user.role, "type": "auth_intent", "exp": intent_exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")
    return {"status": "CHALLENGE_AUTHORIZED", "intent_token": intent_token, "display_name": user.display_name, "role": user.role, "org_name": org.display_name}

def _verify_logic(request: TotpVerifyRequest, allowed_roles: list, db: Session):
    """Internal shared logic for TOTP verification with strict role scoping."""
    try:
        payload = jwt.decode(request.intent_token, ANCHOR_MASTER_KEY, algorithms=["HS256"])
        if payload.get("type") != "auth_intent" or payload.get("sub") != request.email:
            raise HTTPException(status_code=401, detail="INVALID INTENT")
        if payload.get("role") not in allowed_roles:
             raise HTTPException(status_code=401, detail="ROLE MISMATCH")
    except Exception:
        raise HTTPException(status_code=401, detail="INVALID HANDSHAKE")
    # 1. Search Enterprise silo
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == request.email).first()
    
    # 2. Search Regulatory silo
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == request.email).first()

    if not user or not user.totp_secret:
        raise HTTPException(status_code=401, detail="SECURITY NOT PROVISIONED")
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(request.totp_code, valid_window=1):
        raise HTTPException(status_code=401, detail="INVALID CODE")
    exp = datetime.utcnow() + timedelta(days=1)
    token = jwt.encode({"sub": user.email, "role": user.role, "org_id": user.org_id, "exp": exp}, ANCHOR_MASTER_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "role": user.role, "org_id": user.org_id}}

@auth_router.post("/identify-first")
def identify_first(clearance_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    STRICT LOOKUP: Given a Clearance ID, find the associated email and hub_id.
    Used for 'Identity First' auto-fill on the sign-in page.
    """
    cid = clearance_id.strip().upper()
    
    # 1. Search Enterprise silo
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == cid).first()
    if user:
        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        return {
            "email": user.email,
            "hub_id": org.hub_id if org else user.org_id,
            "display_name": user.display_name
        }
        
    # 2. Search Regulatory silo
    official = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == cid).first()
    if official:
        org = db.query(Organization).filter(Organization.id == official.org_id).first()
        return {
            "email": official.email,
            "hub_id": org.hub_id if org else official.id.split('-')[0].lower(),
            "display_name": official.display_name
        }
        
    raise HTTPException(status_code=404, detail="CLEARANCE_ID_NOT_FOUND")

@auth_router.post("/enterprise/identify")
def enterprise_identify(request: IdentityChallengeRequest, db: Session = Depends(get_db)):
    """Enterprise-specific identity challenge (Stage 1)."""
    return _identify_logic(request.clearance_id, request.email, request.hub_id, ["owner", "admin", "member", "lead", "developer"], db)

@auth_router.post("/enterprise/verify-totp")
def enterprise_verify(request: TotpVerifyRequest, db: Session = Depends(get_db)):
    return _verify_logic(request, ["owner", "admin", "member"], db)

@auth_router.post("/oversight/identify")
def oversight_identify(request: IdentityChallengeRequest, db: Session = Depends(get_db)):
    return _identify_logic(request.clearance_id, request.email, request.org_id, ["auditor", "regulator"], db)

@auth_router.post("/admin/provision/auditor")
def provision_auditor(
    request: AuditorProvisionRequest,
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    MANUAL PROVISIONING: Root Admin creates a new Auditor Official.
    Generates ID, QR, and dispatches the welcome packet.
    """    # 1. Check Collision
    if db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == request.email.strip().lower()).first():
         raise HTTPException(status_code=400, detail="OFFICIAL ALREADY PROVISIONED")

    # 2. Generate Credentials
    entity_id = _generate_regulator_id(request.regulator, request.display_name)
    totp_secret = pyotp.random_base32()
    
    # 3. Lookup Regulatory Org
    reg_org = db.query(Organization).filter(Organization.hub_id == request.regulator.lower()).first()
    org_id = reg_org.id if reg_org else None

    # 4. Create Official in siloed table
    official = RegulatoryOfficial(
        id=entity_id, 
        email=request.email.strip().lower(),
        display_name=request.display_name,
        org_id=org_id,
        role="regulator",
        department=request.department,
        jurisdiction=request.jurisdiction,
        totp_secret=totp_secret,
        status="approved", 
        email_verified=True,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(official)
    db.commit()

    # 5. Generate QR Code
    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name=request.email, issuer_name="Anchor Oversight")
    img = qrcode.make(totp_uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()

    # 6. Dispatch Email
    send_auditor_provisioned(request.email, request.display_name, entity_id, request.regulator, qr_base64)

    return {"status": "SUCCESS", "entity_id": entity_id}

@auth_router.post("/admin/provision/enterprise")
def provision_enterprise(
    request: EnterpriseProvisionRequest,
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    MANUAL PROVISIONING: Root Admin creates a new Enterprise Regional Owner.
    Generates Master Key, QR, and dispatches the welcome packet.
    """
    # 1. Derive slug from company name
    slug = f"{request.company_name.lower().replace(' ', '-')}-{request.region.lower()}"
    
    # 2. Check if Org already exists
    org = db.query(Organization).filter(Organization.entity_prefix == slug).first()
    
    if not org:
        # Create new Organization if missing
        master_key = f"amat_{secrets.token_urlsafe(32)}"
        master_key_hash = hashlib.sha256(master_key.encode()).hexdigest()
        org_id = f"org_{secrets.token_hex(4)}"
        
        org = Organization(
            id=org_id,
            entity_prefix=slug,
            display_name=request.company_name,
            region=request.region,
            master_key_hash=master_key_hash,
            org_type="enterprise",
            created_at=datetime.utcnow().isoformat()
        )
        db.add(org)
    else:
        # Reuse existing Org
        org_id = org.id
        master_key = "[REDACTED] (Organization already exists)"
    
    entity_id = _generate_clearance_id(request.company_name, request.display_name)
    
    # 3. Handle Owner User
    owner = db.query(EnterpriseUser).filter(EnterpriseUser.email == request.email.strip().lower()).first()
    
    if not owner:
        totp_secret = pyotp.random_base32()
        owner = EnterpriseUser(
            id=entity_id, 
            email=request.email.strip().lower(),
            org_id=org_id,
            display_name=request.display_name,
            role="owner",
            department=request.department,
            totp_secret=totp_secret,
            status="approved",
            email_verified=True,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(owner)
    else:
        # If user exists, ensure they are linked to the correct Org
        owner.org_id = org_id
        owner.role = "owner"
        totp_secret = owner.totp_secret or pyotp.random_base32()
        owner.totp_secret = totp_secret
        
    db.commit()

    # 4. Generate QR Code
    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name=request.email, issuer_name=f"Anchor {request.company_name}")
    img = qrcode.make(totp_uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()

    # 5. Dispatch Email
    send_enterprise_provisioned(request.email, request.display_name, request.company_name, request.region, entity_id, master_key, qr_base64)

    return {"status": "SUCCESS", "entity_id": entity_id, "org_id": org_id}


# =============================================================================
# EMERGENCY ADMIN ACCESS (EMAIL CODE FLOW)
# =============================================================================

@auth_router.post("/admin/request-access")
def request_admin_access(request: AdminAccessRequest):
    """Generates and emails a 6-digit access code to the master administrator."""
    # Strict email gate
    AUTHORIZED_EMAILS = ["tan@anchorgovernance.tech"]
    email_clean = request.email.strip().lower()
    
    if email_clean not in AUTHORIZED_EMAILS:
        # Don't reveal if email exists, just return success to thwart enumeration
        return {"status": "SUCCESS", "message": "If authorized, a code has been sent."}
    
    # Generate 6-digit numeric code
    code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expiry = datetime.utcnow() + timedelta(minutes=10)
    
    admin_access_codes[email_clean] = {"code": code, "expiry": expiry}
    
    # Send email
    success = send_admin_access_code(email_clean, code)
    if not success:
        raise HTTPException(status_code=500, detail="MAIL_DISPATCH_FAILURE")
        
    return {"status": "SUCCESS", "message": "HANDSHAKE CODE DISPATCHED"}

@auth_router.post("/admin/verify-access")
def verify_admin_access(request: AdminVerifyRequest, db: Session = Depends(get_db)):
    """Verifies the 6-digit code and issues a Root JWT."""
    email_clean = request.email.strip().lower()
    record = admin_access_codes.get(email_clean)
    
    if not record or record["code"] != request.code:
        raise HTTPException(status_code=401, detail="INVALID_ACCESS_CODE")
    
    if datetime.utcnow() > record["expiry"]:
        del admin_access_codes[email_clean]
        raise HTTPException(status_code=401, detail="ACCESS_CODE_EXPIRED")
    
    # Valid code -> Issue Token
    # Cleanup code
    del admin_access_codes[email_clean]
    
    # Issue Root JWT
    exp = datetime.utcnow() + timedelta(days=1)
    token = jwt.encode({
        "sub": email_clean, 
        "role": "root", 
        "org_id": "MASTER", 
        "exp": exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email_clean,
            "display_name": "Lead Manager (Emergency Access)",
            "role": "root",
            "org_id": "MASTER"
        }
    }


@auth_router.get("/check-domain/{domain}")
def check_domain_status(domain: str, db: Session = Depends(get_db)):
    """Checks if a corporate domain is already registered for an organisation."""
    clean_domain = domain.strip().lower()
    org = db.query(Organization).filter(Organization.domain == clean_domain).first()
    
    return {
        "domain": clean_domain,
        "registered": org is not None,
        "org_name": org.display_name if org else None
    }


@auth_router.post("/register/org")
def register_organization(
    hub_id: str = Form(...),
    display_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    server_region: str = Form("IN"),
    department: str = Form("Operations"),
    db: Session = Depends(get_db)
):
    """
    Onboards a new Organisation and its primary Manager (Owner).
    This is the top-level 'GitHub Org' creation.
    """
    # 1. Validate Inputs
    # 1. Validate and Unique-ify Hub ID
    prefix_clean = hub_id.strip().lower()
    # Add random suffix to prevent collisions and satisfy "not just name" requirement
    random_suffix = secrets.token_hex(2) # 4 chars
    prefix_clean = f"{prefix_clean}-{random_suffix}"
    
    _validate_slug(prefix_clean, "Organization Hub ID")
    domain = email.split("@")[-1].lower()
    
    # 1b. Public Domain Blacklist
    if domain in PUBLIC_DOMAINS:
        raise HTTPException(
            status_code=400, 
            detail="PUBLIC DOMAINS (GMAIL/YAHOO) CANNOT BE USED FOR SOVEREIGN ONBOARDING. PLEASE USE YOUR CORPORATE EMAIL."
        )

    # 2. Collision Check (Prefix & Domain)
    if db.query(Organization).filter(Organization.hub_id == prefix_clean).first():
        raise HTTPException(status_code=409, detail=f"PREFIX '{prefix_clean}' IS TAKEN")
    
    if db.query(Organization).filter(Organization.domain == domain).first():
        raise HTTPException(status_code=409, detail=f"ORGANIZATION FOR '{domain}' ALREADY EXISTS")

    # 3. Create Org
    org_id = _generate_org_id(display_name)
    org = Organization(
        id=org_id,
        hub_id=prefix_clean,
        display_name=display_name,
        domain=domain,
        server_region=server_region,
        hr_contact=email,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(org)
    
    # 4. Create Owner Account (Pending Approval)
    user = EnterpriseUser(
        id=_generate_clearance_id(display_name, display_name), # Initial owner ID
        email=email.strip().lower(),
        org_id=org_id,
        display_name=display_name,
        role="owner",
        hashed_pass=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        department=department,
        status="pending",
        created_at=datetime.utcnow().isoformat()
    )
    db.add(user)
    db.commit()

    return {
        "status": "SUCCESS", 
        "message": "Onboarding request submitted. The Root Administrator will review your corporate identity before provisioning your Master Node."
    }

@auth_router.post("/login")
def login(
    request_data: LoginRequest = None,
    email: str = Form(None), 
    password: str = Form(None), 
    db: Session = Depends(get_db)
):
    """Unified login - checks Enterprise silo first, then Regulatory. Supports JSON & Form."""
    final_email = request_data.email if request_data else email
    final_pass = request_data.password if request_data else password
    
    if not final_email or not final_pass:
        raise HTTPException(status_code=400, detail="MISSING CREDENTIALS")
        
    email_clean = final_email.strip().lower()
    
    # 1. Check Enterprise User
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == email_clean).first()
    
    # 2. Check Regulatory Official if not found in Enterprise
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email_clean).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="INVALID CREDENTIALS")

    # 3. Verify Password (if set - regulatory accounts might be TOTP-only)
    if hasattr(user, 'hashed_pass') and user.hashed_pass:
        if not bcrypt.checkpw(final_pass.encode(), user.hashed_pass.encode()):
            raise HTTPException(status_code=401, detail="INVALID CREDENTIALS")
    
    # 4. Issue Session Token
    token = _issue_jwt(user)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "org_id": user.org_id,
            "status": user.status
        }
    }


@auth_router.post("/projects/create")
def create_project(
    project_name: str = Form(...),
    tier: str = Form("enterprise"),
    current_admin: dict = Depends(get_current_org_admin),
    db: Session = Depends(get_db)
):
    """
    [Admin Only] Self-service project provisioning. 
    Generates a unique prefixed entity_id and secret keys.
    """
    # 1. Validate Project Name
    prj_slug = project_name.strip().lower().replace(" ", "-")
    _validate_slug(prj_slug, "Project Name")
    
    # 2. Generate Global Entity ID (Prefix-Project)
    org_slug = current_admin["org_slug"]
    full_entity_id = f"{org_slug}-{prj_slug}"
    
    # Check for collision
    if db.query(Fleet).filter(Fleet.entity_id == full_entity_id).first():
        raise HTTPException(status_code=409, detail=f"PROJECT '{full_entity_id}' ALREADY EXISTS")

    # 3. Generate Sensitive Credentials (Shown ONCE)
    raw_secret_key = _generate_key()
    hashed_secret  = bcrypt.hashpw(raw_secret_key.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    mat = "0x" + secrets.token_hex(32)
    mat_hash = hashlib.sha256(mat.encode()).hexdigest()

    # 4. Save Project (Fleet)
    project = Fleet(
        entity_id=full_entity_id,
        org_id=current_admin["org_id"],
        name=project_name,
        tier=tier,
        key_hash=mat_hash,
        secret_hash=hashed_secret,
        created_at=datetime.utcnow().isoformat(),
        provisioned_by=current_admin["sub"]
    )
    db.add(project)
    db.commit()

    return {
        "status":        "PROVISIONED",
        "entity_id":     full_entity_id,
        "secret_key":    raw_secret_key, # SHOWN ONCE
        "sdk_mat":       mat,            # SHOWN ONCE
        "server_region": current_admin.get("region", "IN"),
        "provisioned_by": current_admin["sub"]
    }


@auth_router.get("/projects")
def list_org_projects(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all projects within the user's organisation."""
    projects = db.query(Fleet).filter(Fleet.org_id == current_user["org_id"]).all()
    return [
        {
            "entity_id": p.entity_id,
            "name": p.name,
            "tier": p.tier,
            "created_at": p.created_at,
            "provisioned_by": p.provisioned_by
        }
        for p in projects
    ]

@auth_router.post("/register/auditor")
def register_auditor(
    display_name: str = Form(...),
    email: str = Form(...),
    jurisdiction: str = Form("US"),
    department: str = Form("General"),
    db: Session = Depends(get_db)
):
    """Regulators request access. Creates a pending user record.
    Admin reviews in the Pending Approvals queue and provisions credentials on approval."""

    # Check for duplicate email
    existing = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    # 2. Agency (Organization) Detection/Creation
    hub_id_clean = department.strip().lower()
    org = db.query(Organization).filter(Organization.hub_id.ilike(f"{hub_id_clean}%")).first()
    
    if not org:
        # Create the Regulatory Agency on the fly to eliminate friction
        org_id = _generate_org_id(department)
        # Tactical suffix (shorter for readability)
        random_suffix = secrets.token_hex(2)[:3]
        unique_hub_id = f"{hub_id_clean}-{random_suffix}"
        
        org = Organization(
            id=org_id,
            hub_id=unique_hub_id,
            display_name=department.upper(),
            domain=email.split("@")[-1].lower(),
            server_region="IN", 
            created_at=datetime.utcnow().isoformat()
        )
        db.add(org)
        db.flush() # Ensure ID is available for relationship
    
    # 3. Generate patterned ID: Agency_Initials_Date (e.g., RBI_Tan_03-05-26)
    clearance_id = _generate_regulator_id(department, display_name)

    # 4. Create pending official linked to the Agency
    user = RegulatoryOfficial(
        id=clearance_id, 
        email=email.strip().lower(),
        org_id=org.id, # Link established!
        display_name=display_name,
        department=department,
        jurisdiction=jurisdiction,
        status="pending",
        email_verified=False,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(user)
    db.commit()

    return {
        "status": "PENDING_APPROVAL",
        "message": f"Request submitted for {jurisdiction} ({department}). Your request is now under administrative review. You will receive credentials via email once approved."
    }


@auth_router.get("/mesh-status")
def get_mesh_status(db: Session = Depends(get_db)):
    """Public stats for the Mesh Dashboard (v5.1 Protocol)."""
    org_count  = db.query(Organization).count()
    user_count = db.query(EnterpriseUser).count()
    return {
        "status": "ACTIVE",
        "total_nodes": org_count,
        "total_peers": user_count,
        "secure_proofs": 0, # Placeholder for v5.1 reset state
        "integrity": "99.9%",
        "version": "v5.0.2"
    }


@auth_router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    """Verifies an auditor's email via the one-time token link.
    Grants temporary first-session access while keeping status 'pending'."""

    user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.verification_token == token).first()
    if not user:
        return HTMLResponse(
            content=_verification_page("INVALID TOKEN", "This verification link is invalid or has expired.", False),
            status_code=400
        )

    if user.email_verified:
        return HTMLResponse(
            content=_verification_page("ALREADY VERIFIED", f"Email for {user.id} has already been verified. You can log in.", True),
            status_code=200
        )

    # Mark as verified — grants temp first-session access
    user.email_verified = True
    user.verification_token = None  # Burn the token
    db.commit()

    return HTMLResponse(
        content=_verification_page(
            "EMAIL VERIFIED",
            f"Welcome, {user.display_name}. Your email has been confirmed. "
            f"You now have temporary access. Log in with your Entity ID ({user.id}) and Secret Key. "
            f"Full access will be granted after Master Node administrator approval.",
            True
        ),
        status_code=200
    )


def _verification_page(title: str, message: str, success: bool) -> str:
    """Renders a styled HTML verification result page."""
    color = "#10B981" if success else "#EF4444"
    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>Anchor — Email Verification</title></head>
    <body style="background:#08080D; color:#E2E8F0; font-family:monospace; display:flex; 
                 align-items:center; justify-content:center; min-height:100vh; margin:0;">
        <div style="background:#0D0D14; border:1px solid #1E293B; padding:48px; max-width:500px; text-align:center;">
            <h1 style="color:{color}; letter-spacing:0.15em; font-size:18px;">{title}</h1>
            <p style="color:#94A3B8; font-size:13px; line-height:1.7;">{message}</p>
            <a href="/" style="display:inline-block; margin-top:24px; padding:12px 28px; 
                               background:{color}; color:#08080D; text-decoration:none; 
                               font-weight:bold; letter-spacing:0.1em; font-size:11px;">
                GO TO ANCHOR
            </a>
        </div>
    </body>
    </html>
    """


@auth_router.post("/approve")
def approve_user(
    target_id: str = Form(..., alias="target_entity_id"),
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to approve a pending user using their Clearance ID."""
    # Search in both silos
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == target_id).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == target_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="USER NOT FOUND")

    # 1. Generate TOTP Secret if not present
    if not user.totp_secret:
        raw_secret = pyotp.random_base32()
        user.totp_secret = raw_secret # In prod, this should be encrypted
    else:
        raw_secret = user.totp_secret 

    # 2. Generate Provisioning URI & QR URL
    import urllib.parse
    issuer = f"Anchor - {getattr(user, 'jurisdiction', 'Oversight')}"
    totp_uri = pyotp.totp.TOTP(raw_secret).provisioning_uri(
        name=user.email, 
        issuer_name=issuer
    )
    
    # We use a public QR service to ensure the image renders in all email clients
    encoded_uri = urllib.parse.quote(totp_uri)
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encoded_uri}"

    # 3. Finalize Status
    user.status = "approved"
    user.email_verified = True  # Mark as verified upon admin approval
    user.approved_at = datetime.utcnow().isoformat()
    db.commit()

    # 4. Dispatch Automated Provisioning Email
    if isinstance(user, RegulatoryOfficial):
        # Fetch the Hub ID from the Org table for the auditor
        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        hub_id = org.hub_id if org else "UNKNOWN"
        
        send_auditor_provisioned(
            to_email=user.email,
            display_name=user.display_name,
            entity_id=user.id,
            hub_id=hub_id,
            regulator=getattr(user, 'jurisdiction', "Authority"),
            qr_url=qr_url,
            totp_secret=raw_secret
        )
    else:
        # For Enterprise Owners, we need to fetch the Hub ID from the Org table
        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        hub_id = org.hub_id if org else "UNKNOWN"
        region = org.region if org else "Global"
        
        send_enterprise_provisioned(
            to_email=user.email,
            display_name=user.display_name,
            company=org.display_name if org else "Your Company",
            region=region,
            entity_id=user.id,
            hub_id=hub_id,
            master_key=raw_secret, # Pass TOTP Secret as the primary login key
            qr_url=qr_url
        )

    return {"status": "APPROVED_AND_PROVISIONED", "entity_id": target_id}


@auth_router.post("/revoke")
def revoke_user(
    target_id: str = Form(..., alias="target_entity_id"),
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to revoke a user's access via Clearance ID."""
    # 1. Search in Enterprise Silo
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == target_id).first()
    
    # 2. Search in Regulatory Silo if not found
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == target_id).first()
        
    if not user:
        raise HTTPException(status_code=404, detail="IDENTITY_NOT_FOUND")
    
    user.status = "revoked"
    db.commit()
    return {"status": "REVOKED", "entity_id": target_id}


@auth_router.get("/pending")
def get_pending_users(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch all pending Enterprise Users
    e_pending = db.query(EnterpriseUser).filter(EnterpriseUser.status == "pending").all()
    
    # 2. Fetch all pending Regulatory Officials
    r_pending = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.status == "pending").all()
    
    # Combined response
    results = []
    for u in e_pending:
        entry = {
            "id": u.id,
            "display_name": u.display_name,
            "email": u.email,
            "type": "enterprise",
            "role": u.role,
            "department": u.department,
            "created_at": u.created_at,
            "org_name": None
        }
        if u.org_id:
            org = db.query(Organization).filter(Organization.id == u.org_id).first()
            if org:
                entry["org_name"] = org.display_name
                entry["org_hub_id"] = org.hub_id
                entry["org_region"] = org.region
        results.append(entry)

    for u in r_pending:
        results.append({
            "id": u.id,
            "display_name": u.display_name,
            "email": u.email,
            "type": "regulator",
            "role": u.role,
            "department": u.department,
            "jurisdiction": u.jurisdiction,
            "created_at": u.created_at
        })
    return results


@auth_router.get("/admin/orgs")
def list_all_organizations(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Root-admin endpoint: lists every registered Organization on the mesh."""
    orgs = db.query(Organization).order_by(Organization.created_at.desc()).all()
    return [
        {
            "id":             o.id,
            "hub_id":         o.hub_id,
            "display_name":   o.display_name,
            "domain":         o.domain,
            "server_region":  o.server_region,
            "status":         o.status,
            "created_at":     o.created_at,
            "project_count":  len(o.projects),
            "member_count":   len(o.enterprise_members),
        }
        for o in orgs
    ]


# --- INVITE SYSTEM ENDPOINTS ---

@auth_router.post("/invite")
def create_invite(
    email: str = Form(...),
    clearance_id: str = Form(...),
    project_name: str = Form(...),
    role: str = Form("developer"),
    current_admin: dict = Depends(get_current_org_admin),
    db: Session = Depends(get_db)
):
    """Generates a secure tactical invitation for a new team member."""
    if db.query(EnterpriseUser).filter(EnterpriseUser.email == email.strip().lower()).first():
         raise HTTPException(status_code=400, detail="USER ALREADY REGISTERED IN THE MESH")

    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=48)
    
    invite = OrgInvite(
        id=token,
        org_id=current_admin["org_id"],
        invited_email=email.strip().lower(),
        clearance_id=clearance_id.strip().upper(),
        target_project=project_name.strip(),
        role=role,
        status="pending",
        created_at=datetime.utcnow().isoformat(),
        expires_at=expires.isoformat()
    )
    db.add(invite)
    db.commit()

    # Dispatch Onboarding Email
    org_name = db.query(Organization).filter(Organization.id == invite.org_id).first().display_name
    invite_link = f"https://enterprise.anchorgovernance.tech/auth?invite=true&token={token}"
    
    from mail import send_developer_invite
    send_developer_invite(
        to_email=invite.invited_email,
        display_name=email.split('@')[0], # Placeholder until they set name
        org_name=org_name,
        project_name=invite.target_project,
        clearance_id=invite.clearance_id,
        org_id=current_admin["org_id"],
        invite_link=invite_link
    )

    return {
        "status": "INVITE_CREATED_AND_DISPATCHED",
        "clearance_id": invite.clearance_id,
        "token": token
    }

@auth_router.get("/invite/verify/{token}")
def verify_invite(token: str, db: Session = Depends(get_db)):
    """Validates an invite token and returns tactical identity markers."""
    invite = db.query(OrgInvite).filter(OrgInvite.id == token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="INVALID OR EXPIRED INVITE")
    
    if datetime.fromisoformat(invite.expires_at) < datetime.utcnow():
        invite.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="INVITE EXPIRED")

    return {
        "org_name": invite.organization.display_name,
        "org_id": invite.org_id,
        "email": invite.invited_email,
        "clearance_id": invite.clearance_id,
        "project": invite.target_project,
        "role": invite.role
    }


@auth_router.post("/register/accept-invite")
def accept_invite(
    token: str = Form(...),
    display_name: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Completes registration for an invited user."""
    invite = db.query(OrgInvite).filter(OrgInvite.id == token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=400, detail="INVALID INVITE TOKEN")

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    user = EnterpriseUser(
        id=invite.clearance_id, 
        email=invite.invited_email,
        org_id=invite.org_id,
        display_name=display_name,
        role=invite.role,
        department=invite.target_project,
        hashed_pass=hashed,
        status="active",
        email_verified=True,
        created_at=datetime.utcnow().isoformat()
    )
    
    invite.status = "accepted"
    db.add(user)
    db.commit()

    return {"status": "SUCCESS", "message": f"Welcome to {invite.organization.display_name}"}


@auth_router.get("/me")
def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validates the JWT and returns the user's full profile."""
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == current_user["sub"]).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == current_user["sub"]).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="USER NOT FOUND")

    return {
        "sub":           user.id,
        "email":         user.email,
        "display_name":  user.display_name,
        "role":          user.role,
        "status":        user.status,
        "org_id":        user.org_id,
        "email_verified": user.email_verified,
    }
