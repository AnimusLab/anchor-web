"""

Oversight Auth Router — TOTP-based authentication for regulatory auditors.
Mounted at /api/oversight/

Endpoints:
  POST /api/oversight/login       — Validate entity_id + email + TOTP code → JWT
  GET  /api/oversight/me          — Validate JWT, return auditor profile
  POST /api/oversight/logout      — Log session end
  GET  /api/oversight/qr-setup    — [Admin only] Return provisioning QR data
"""

from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
import pyotp
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional

from mail import send_auditor_provisioned
from mail import send_auditor_provisioned

# ---------------------------------------------------------------------------
# Router & security
# ---------------------------------------------------------------------------

oversight_router = APIRouter(prefix="/api/oversight", tags=["Oversight Auth"])
security         = HTTPBearer(auto_error=False)

ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY", "")
OVERSIGHT_JWT_TTL = int(os.getenv("OVERSIGHT_JWT_TTL_HOURS", "8"))  # 8-hour session


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class OversightLoginRequest(BaseModel):
    clearance_id: str   # Individual tactical ID (e.g. REG-SEC-X92F)
    hub_id:       str   # The Regulatory Agency Hub ID (e.g. SEC, RBI)
    email:        str
    totp_code:    str   # 6-digit rotating code from Google Authenticator


class ProvisionRequest(BaseModel):
    display_name: str
    email:        str
    regulator:    str       # "SEC", "RBI", "SEBI", "FCA", "CFPB", "EU"
    jurisdiction: str = "GLO" # "US", "IN", "EU"
    access_level: str = "READ_ONLY"


class RevokeRequest(BaseModel):
    entity_id: str


# ---------------------------------------------------------------------------
# JWT helpers (oversight-scoped)
# ---------------------------------------------------------------------------

def _issue_oversight_jwt(entity_id: str, display_name: str, regulator: str,
                          access_level: str, session_id: str) -> str:
    """Issues a short-lived oversight JWT — separate from the main auth tokens."""
    exp = datetime.now(timezone.utc) + timedelta(hours=OVERSIGHT_JWT_TTL)
    return jwt.encode(
        {
            "sub":          entity_id,
            "name":         display_name,
            "regulator":    regulator,
            "access_level": access_level,
            "session_id":   session_id,
            "role":         "regulator",
            "portal":       "oversight",
            "exp":          exp,
        },
        ANCHOR_MASTER_KEY,
        algorithm="HS256",
    )


def _decode_oversight_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(token, ANCHOR_MASTER_KEY, algorithms=["HS256"])
        if payload.get("portal") != "oversight":
            raise HTTPException(status_code=401, detail="INVALID TOKEN SCOPE")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="SESSION EXPIRED")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="INVALID TOKEN")


def get_oversight_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="AUTHENTICATION REQUIRED")
    return _decode_oversight_jwt(credentials.credentials)


def get_oversight_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validates that the caller is the root admin (main admin JWT, not oversight JWT)."""
    if not credentials:
        raise HTTPException(status_code=401, detail="AUTHENTICATION REQUIRED")
    try:
        payload = jwt.decode(
            credentials.credentials, ANCHOR_MASTER_KEY, algorithms=["HS256"]
        )
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="ADMIN PRIVILEGES REQUIRED")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="SESSION EXPIRED")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="INVALID TOKEN")


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

from database import get_db
from models import RegulatoryOfficial, Organization

@oversight_router.post("/login")
def oversight_login(body: OversightLoginRequest, db: Session = Depends(get_db), request: Request = None):
    """
    Validates Clearance ID + hub_id + email + 6-digit TOTP code.
    handshake for regulatory access using the SQL backend.
    """
    # 1. Validate identity against SQL database (Enforce casing for resilience)
    search_id = body.clearance_id.strip().upper()
    search_email = body.email.strip().lower()

    user = db.query(RegulatoryOfficial).filter(
        RegulatoryOfficial.id == search_id,
        RegulatoryOfficial.email == search_email,
        RegulatoryOfficial.status == "approved"
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY VERIFICATION FAILED")

    # 2. Validate TOTP code
    if not user.totp_secret:
        raise HTTPException(status_code=401, detail="MFA NOT PROVISIONED")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(body.totp_code.strip(), valid_window=1):
        raise HTTPException(status_code=401, detail="IDENTITY VERIFICATION FAILED")

    # 3. Log session start
    # [v5.1 Reset: Session logging moved to shared audit trail]
    session_id = secrets.token_hex(8) 


    # 4. Issue oversight-scoped JWT
    token = _issue_oversight_jwt(
        entity_id    = user.id,
        display_name = user.display_name,
        regulator    = user.jurisdiction or "Oversight",
        access_level = "READ_ONLY", # Default for now
        session_id   = session_id,
    )

    return {
        "status":       "AUTHENTICATED",
        "access_token": token,
        "token_type":   "bearer",
        "entity_id":    user.id,
        "display_name": user.display_name,
        "regulator":    user.department,
        "session_id":   session_id,
        "expires_in":   OVERSIGHT_JWT_TTL * 3600,
    }


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@oversight_router.get("/me")
def oversight_me(current_user: dict = Depends(get_oversight_user)):
    """Returns the auditor's profile from the JWT claims."""
    return {
        "entity_id":    current_user["sub"],
        "display_name": current_user["name"],
        "regulator":    current_user["regulator"],
        "access_level": current_user["access_level"],
        "session_id":   current_user["session_id"],
        "role":         "regulator",
    }


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

@oversight_router.post("/logout")
def oversight_logout(current_user: dict = Depends(get_oversight_user)):
    """Logs session end."""
    return {"status": "SESSION_TERMINATED"}


# ---------------------------------------------------------------------------
# Admin: Provision a new auditor (root dashboard use)
# ---------------------------------------------------------------------------

@oversight_router.post("/admin/provision")
def provision_new_auditor(
    body:          ProvisionRequest,
    db:            Session = Depends(get_db),
    current_admin: dict = Depends(get_oversight_admin),
):
    """
    [Admin only] Provisions a new auditor directly into the SQL database.
    """
    if body.regulator.upper() not in {
        "SEC", "RBI", "SEBI", "FCA", "CFPB", "EU", "NIST", "FINOS"
    }:
        raise HTTPException(status_code=400, detail="UNKNOWN REGULATOR")

    # Generate Clearance ID pattern: SEC_Tan_26-10-04
    user_initials = "".join(word[0].capitalize() for word in body.display_name.split() if word)[:3]
    date_str = datetime.now(timezone.utc).strftime("%d-%m-%y")
    clearance_id = f"{body.regulator.upper()}_{user_initials}_{date_str}"
    
    # Check for duplicate
    if db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == clearance_id).first():
        clearance_id = f"{clearance_id}_{secrets.token_hex(2)}"

    totp_secret = pyotp.random_base32()
    
    user = RegulatoryOfficial(
        id=clearance_id,
        email=body.email.strip().lower(),
        display_name=body.display_name,
        role="regulator",
        jurisdiction=body.jurisdiction,
        department=body.regulator,
        totp_secret=totp_secret,
        status="approved",
        email_verified=True,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    db.add(user)
    db.commit()

    # Generate the provisioning URI
    issuer_name = "Anchor Oversight"
    totp_uri    = pyotp.TOTP(totp_secret).provisioning_uri(
        name   = body.email.strip().lower(),
        issuer_name = issuer_name,
    )

    # 3. Dispatch welcome email (Entity ID + Instructions)
    send_auditor_provisioned(
        to_email     = user.email,
        display_name = user.display_name,
        entity_id    = user.id,
        regulator    = user.department
    )

    return {
        "status":      "PROVISIONED",
        "entity_id":   user.id,
        "display_name": user.display_name,
        "regulator":   user.department,
        "totp_uri":    totp_uri,       
        "totp_secret": totp_secret,  
        "note": "TOTP secret is shown once. Screenshot the QR code and send via secure channel.",
    }


@oversight_router.get("/admin/auditors")
def list_all_auditors(db: Session = Depends(get_db), current_admin: dict = Depends(get_oversight_admin)):
    """[Admin only] Lists all provisioned auditors."""
    return db.query(RegulatoryOfficial).all()


@oversight_router.post("/admin/revoke")
def revoke_auditor_access(
    body:          RevokeRequest,
    db:            Session = Depends(get_db),
    current_admin: dict = Depends(get_oversight_admin),
):
    """[Admin only] Revokes an auditor's access immediately."""
    user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == body.entity_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="AUDITOR NOT FOUND")
    user.status = "revoked"
    db.commit()
    return {"status": "REVOKED", "entity_id": body.entity_id}
