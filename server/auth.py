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

    # 1. Search Enterprise silo
    user = db.query(EnterpriseUser).filter(EnterpriseUser.email == final_email.strip().lower()).first()
    
    # 2. Search Regulatory silo if not found
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == final_email.strip().lower()).first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY NOT FOUND")

    if user.status in ["revoked", "suspended"]:
        raise HTTPException(status_code=403, detail="ACCESS SUSPENDED")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="EMAIL NOT VERIFIED")

    # Verify password (which is the ANCHOR_MASTER_KEY for root admins)
    # Note: Regulatory officials use TOTP only for stage 2, but we verify pass if set
    if hasattr(user, 'hashed_pass') and user.hashed_pass:
        if not bcrypt.checkpw(final_pass.encode("utf-8"), user.hashed_pass.encode("utf-8")):
            raise HTTPException(status_code=401, detail="INVALID SIGNATURE")

    # Scoped Token Generation
    exp = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({
        "sub": user.id, 
        "role": user.role, 
        "org_id": user.org_id, 
        "dept": getattr(user, 'department', 'OPS'),
        "region": getattr(user, 'region', 'GLOBAL'),
        "exp": exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")
    
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    hub_id = org.hub_id if org else (user.org_id if hasattr(user, 'org_id') else "PENDING")

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "hub_id": hub_id,
            "department": getattr(user, 'department', 'OPS')
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

# --- INVITATION ENGINE ---

@auth_router.post("/invite")
def create_invite(
    email: str = Body(..., embed=True),
    department: str = Body("OPS", embed=True),
    role: str = Body("member", embed=True),
    admin: dict = Depends(get_current_org_admin),
    db: Session = Depends(get_db)
):
    """Generates a regional invitation for a new developer."""
    org = db.query(Organization).filter(Organization.id == admin["org_id"]).first()
    if not org:
        raise HTTPException(status_code=404, detail="ORG_NOT_FOUND")

    # Check for existing invite
    existing = db.query(OrgInvite).filter(OrgInvite.invited_email == email, OrgInvite.org_id == org.id).first()
    if existing and existing.status == "pending":
        return {"invite_token": existing.id, "already_exists": True}

    invite_id = str(uuid.uuid4())
    # Tactical Clearance ID generation: [DEPT]-[RANDOM-HEX]
    cid = f"{department.upper()}-{secrets.token_hex(3).upper()}"
    
    new_invite = OrgInvite(
        id=invite_id,
        org_id=org.id,
        invited_email=email.strip().lower(),
        clearance_id=cid,
        role=role,
        department=department.upper(),
        status="pending",
        created_at=datetime.utcnow().isoformat(),
        expires_at=(datetime.utcnow() + timedelta(days=7)).isoformat()
    )
    db.add(new_invite)
    db.commit()

    return {"invite_token": invite_id, "clearance_id": cid}

@auth_router.get("/invite/verify/{token}")
def verify_invite(token: str, db: Session = Depends(get_db)):
    """Verifies an invite token and returns pre-fill metadata."""
    invite = db.query(OrgInvite).filter(OrgInvite.id == token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="INVITE_INVALID_OR_EXPIRED")
    
    org = db.query(Organization).filter(Organization.id == invite.org_id).first()
    return {
        "email": invite.invited_email,
        "org_id": org.hub_id,
        "org_name": org.display_name,
        "clearance_id": invite.clearance_id,
        "department": invite.department,
        "region": org.region
    }

@auth_router.post("/register/accept-invite")
def accept_invite(
    token: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    display_name: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Finalizes developer registration via a regional invitation."""
    invite = db.query(OrgInvite).filter(OrgInvite.id == token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="INVITE_INVALID_OR_EXPIRED")

    # Hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    new_user = EnterpriseUser(
        id=invite.clearance_id,
        email=invite.invited_email,
        org_id=invite.org_id,
        display_name=display_name,
        role=invite.role,
        department=invite.department,
        hashed_pass=hashed,
        status="active",
        email_verified=True, # Verified by virtue of invite email access
        created_at=datetime.utcnow().isoformat()
    )
    
    invite.status = "accepted"
    db.add(new_user)
    db.commit()

    return {"status": "SUCCESS", "clearance_id": invite.clearance_id}

def _identify_logic(clearance_id: str, email: str, hub_id: str, allowed_roles: list, db: Session):
    """Internal shared logic for identity challenge with strict triple-factor scoping."""
    email_clean = email.strip().lower()
    
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
            
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.email == email_clean).first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY NOT FOUND")
    
    # Strictly verify Personal Clearance ID (user.id)
    # We allow a manual match or email prefix fallback for legacy accounts
    stored_clearance = user.id or user.email.split('@')[0]
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
    try:
        user = db.query(EnterpriseUser).filter(EnterpriseUser.id == cid).first()
        if user:
            org = db.query(Organization).filter(Organization.id == user.org_id).first()
            return {
                "email": getattr(user, 'email', 'UNKNOWN'),
                "hub_id": getattr(org, 'hub_id', getattr(user, 'org_id', 'PENDING')) or "PENDING",
                "display_name": getattr(user, 'display_name', 'AUTHORIZED PERSON'),
                "org_name": getattr(org, 'display_name', 'PENDING'),
                "region": getattr(org, 'region', 'GLOBAL'),
                "department": getattr(user, 'department', 'OPS')
            }
        raise HTTPException(status_code=404, detail="IDENTITY NOT FOUND")
    except Exception as e:
        import traceback
        return {
            "status": "ERROR",
            "detail": str(e),
            "trace": traceback.format_exc()
        }
        
    # 2. Search Regulatory silo
    official = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == cid).first()
    if official:
        org = db.query(Organization).filter(Organization.id == official.org_id).first()
        return {
            "email": getattr(official, 'email', 'UNKNOWN'),
            "hub_id": getattr(org, 'hub_id', official.id.split('-')[0].lower()) or "PENDING",
            "display_name": getattr(official, 'display_name', 'OVERSIGHT OFFICER'),
            "org_name": getattr(org, 'display_name', 'PENDING'),
            "region": getattr(org, 'region', 'GLOBAL'),
            "department": getattr(official, 'department', 'AUDIT')
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
    # Use the provided hub_id directly if it already has a tactical suffix, 
    # otherwise append a short 2-char entropy block.
    prefix_clean = hub_id.strip().lower()
    if '-' not in prefix_clean:
        random_suffix = secrets.token_hex(1) # 2 chars
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

    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    
    return {
        "sub":           user.id,
        "email":         getattr(user, 'email', None),
        "display_name":  getattr(user, 'display_name', 'AUTHORIZED'),
        "role":          getattr(user, 'role', 'member'),
        "status":        getattr(user, 'status', 'active'),
        "hub_id":        getattr(org, 'hub_id', 'PENDING'),
        "email_verified": getattr(user, 'email_verified', False),
        "department":    getattr(user, 'department', 'OPS'),
        "region":        getattr(org, 'region', 'GLOBAL'),
        "regional_key":  getattr(org, 'regional_key', None)
    }

@auth_router.get("/debug/db")
def debug_db_schema(db: Session = Depends(get_db)):
    """Oversight Tool: Verifies that all required tables exist in the live database."""
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    tables = inspector.get_table_names()
    
    schema_details = {}
    for table in tables:
        columns = [c["name"] for c in inspector.get_columns(table)]
        schema_details[table] = columns

    return {
        "status": "OPERATIONAL",
        "database": str(db.get_bind().url).split("@")[-1],
        "tables": tables,
        "schema": schema_details,
        "required_tables_present": all(t in tables for t in ["organizations", "enterprise_users", "regulatory_officials"])
    }
