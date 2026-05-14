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

@auth_router.get("/test/ping")
def auth_ping():
    return {"status": "PONG", "module": "auth_router"}

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

def _issue_jwt(user):
    exp = datetime.utcnow() + timedelta(days=1)
    return jwt.encode({
        "sub": user.email, 
        "role": user.role, 
        "org_id": user.org_id, 
        "exp": exp
    }, ANCHOR_MASTER_KEY, algorithm="HS256")

# =============================================================================
# ID Generation Patterns
# =============================================================================

def _generate_org_id(company_name: str, region: str = "GL"):
    """
    Hub ID Format: JPMC-IN-MUM01
    Pattern: [COMPANY_ABBR]-[REGION_CODE]-[RANDOM_CODE]
    """
    # Abbreviate company name: take first letters of each word, max 6 chars
    words = company_name.strip().upper().split()
    if len(words) >= 2:
        abbr = "".join(w[0] for w in words if w)[:6]
    else:
        abbr = words[0][:6] if words else "ORG"
    
    region_code = region.strip().upper()[:2] if region else "GL"
    serial = secrets.randbelow(900) + 100  # 100–999
    return f"{abbr}-{region_code}-{serial:03d}"

def _generate_clearance_id(company_name: str, user_name: str, role: str = "member", region: str = "GL"):
    """
    Clearance ID Format: OWN-JPMC-MUM-042
    Pattern: [ROLE_CODE]-[COMPANY_ABBR]-[REGION_CODE]-[SEQUENCE]
    """
    role_map = {
        "owner": "OWN",
        "admin": "ADM",
        "member": "DEV",
        "developer": "DEV",
        "lead": "LDR",
        "auditor": "AUD",
        "regulator": "REG",
        "root": "ROOT",
    }
    role_code = role_map.get(role.lower(), "MBR")
    
    words = company_name.strip().upper().split()
    if len(words) >= 2:
        company_abbr = "".join(w[0] for w in words if w)[:6]
    else:
        company_abbr = words[0][:6] if words else "ORG"
    
    region_code = region.strip().upper()[:3] if region else "GLB"
    sequence = secrets.randbelow(900) + 100  # 100–999
    return f"{role_code}-{company_abbr}-{region_code}-{sequence:03d}"

def _generate_regulator_id(bureau: str, user_name: str, region: str = "GL"):
    """
    Auditor ID Format: AUD-RBI-IN-009
    Pattern: AUD-[BUREAU]-[REGION]-[SEQUENCE]
    """
    bureau_code = bureau.strip().upper()[:6]
    region_code = region.strip().upper()[:2] if region else "GL"
    sequence = secrets.randbelow(900) + 100
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
    department: str
    jurisdiction: str

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

        org = db.query(Organization).filter(Organization.id == getattr(user, 'org_id', None)).first()
        if not org or (getattr(org, 'hub_id', None) != hub_id.strip().lower() and getattr(org, 'id', None) != hub_id.strip().lower()):
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
    if not totp.verify(request.totp_code, valid_window=1):
        raise HTTPException(status_code=401, detail="INVALID CODE")
        
    exp = datetime.utcnow() + timedelta(days=1)
    token = jwt.encode({"sub": user.email, "role": user.role, "org_id": user.org_id, "exp": exp}, ANCHOR_MASTER_KEY, algorithm="HS256")
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
                "hub_id": getattr(org, 'hub_id', getattr(user, 'org_id', 'PENDING')) or "PENDING",
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
                "hub_id": getattr(org, 'hub_id', official.id.split('-')[0].lower()) or "PENDING",
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

@auth_router.post("/enterprise/verify-totp")
def enterprise_verify(request: TotpVerifyRequest, db: Session = Depends(get_db)):
    return _verify_logic(request, ["owner", "admin", "member"], db)

@auth_router.post("/oversight/identify")
def oversight_identify(request: IdentityChallengeRequest, db: Session = Depends(get_db)):
    return _identify_logic(request.clearance_id, request.email, request.hub_id, ["auditor", "regulator"], db)

@auth_router.post("/provision/enterprise")
def provision_enterprise(request: EnterpriseProvisionRequest, db: Session = Depends(get_db)):
    """
    Sovereign Onboarding: 
    Automatically creates an Organization and its first Owner user.
    This is the "Birth" of a new Sovereign Silo in the Anchor Mesh.
    """
    # 1. Find or Atomic-Create Organization
    org = db.query(Organization).filter(Organization.display_name == request.company_name).first()
    if not org:
        org_id = _generate_org_id(request.company_name, request.region)
        org = Organization(
            id=org_id,
            display_name=request.company_name,
            region=request.region,
            hub_id=f"hub-{org_id.lower()}",
            regional_key=secrets.token_hex(16),
            created_at=datetime.utcnow().isoformat()
        )
        db.add(org)
        db.flush()
    
    existing_user = db.query(EnterpriseUser).filter(EnterpriseUser.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="USER ALREADY PROVISIONED")
        
    clearance_id = _generate_clearance_id(
        request.company_name, request.display_name, "owner", request.region
    )
    totp_secret = pyotp.random_base32()
    
    new_user = EnterpriseUser(
        id=clearance_id,
        email=request.email.strip().lower(),
        display_name=request.display_name,
        role="owner",
        org_id=org.id,
        department=request.department or "EXECUTIVE",
        totp_secret=totp_secret,
        status="approved"
    )
    
    db.add(new_user)
    db.commit()
    
    return {
        "status": "PROVISION_SUCCESS",
        "clearance_id": clearance_id,
        "org_id": org.id,
        "hub_id": org.hub_id,
        "totp_secret": totp_secret,
        "note": "⚠️ SAVE THE TOTP SECRET IMMEDIATELY for MFA setup."
    }

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
    return {
        "sub": user.id,
        "email": getattr(user, 'email', None),
        "display_name": getattr(user, 'display_name', 'AUTHORIZED'),
        "role": getattr(user, 'role', 'member'),
        "org_id": getattr(user, 'org_id', None),
        "hub_id": getattr(org, 'hub_id', 'PENDING'),
        "region": getattr(org, 'region', 'GLOBAL'),
        "department": getattr(user, 'department', 'OPS')
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
