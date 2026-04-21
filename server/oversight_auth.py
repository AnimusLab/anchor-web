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

from master_config import (
    lookup_auditor,
    log_session_start,
    log_session_end,
    provision_auditor,
    list_auditors,
    revoke_auditor,
    get_auditor,
)
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
    agency_id:    str   # The Regulatory Agency (e.g. SEC, RBI)
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

@oversight_router.post("/login")
def oversight_login(body: OversightLoginRequest, request: Request):
    """
    Validates clearance_id + agency_id + email + 6-digit TOTP code.
    Multi-parameter identity handshake for regulatory access.
    """
    # 1. Validate identity triple against master config
    auditor = lookup_auditor(
        body.clearance_id.strip().upper(), 
        body.agency_id.strip().upper(), 
        body.email.strip()
    )
    if not auditor:
        raise HTTPException(status_code=401, detail="IDENTITY VERIFICATION FAILED")

    # 2. Validate TOTP code
    totp = pyotp.TOTP(auditor["totp_secret"])
    if not totp.verify(body.totp_code.strip(), valid_window=1):
        raise HTTPException(status_code=401, detail="IDENTITY VERIFICATION FAILED")

    # 3. Log session start with IP + User-Agent
    ip         = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    session_id = log_session_start(body.clearance_id.strip().upper(), ip, user_agent)

    # 4. Issue oversight-scoped JWT
    token = _issue_oversight_jwt(
        entity_id    = auditor["entity_id"],
        display_name = auditor["display_name"],
        regulator    = auditor["regulator"],
        access_level = auditor["access_level"],
        session_id   = session_id,
    )

    return {
        "status":       "AUTHENTICATED",
        "access_token": token,
        "token_type":   "bearer",
        "entity_id":    auditor["entity_id"],
        "display_name": auditor["display_name"],
        "regulator":    auditor["regulator"],
        "access_level": auditor["access_level"],
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
    """Logs session end to the digital footprint trail."""
    session_id = current_user.get("session_id")
    if session_id:
        log_session_end(session_id)
    return {"status": "SESSION_TERMINATED", "session_id": session_id}


# ---------------------------------------------------------------------------
# Admin: Provision a new auditor (root dashboard use)
# ---------------------------------------------------------------------------

@oversight_router.post("/admin/provision")
def provision_new_auditor(
    body:          ProvisionRequest,
    current_admin: dict = Depends(get_oversight_admin),
):
    """
    [Admin only] Provisions a new auditor into master_config.
    Returns the entity_id + TOTP provisioning URI for QR code display.
    The TOTP secret is stored encrypted — this is the ONLY time it's shown.
    """
    if body.regulator.upper() not in {
        "SEC", "RBI", "SEBI", "FCA", "CFPB", "EU", "NIST", "FINOS"
    }:
        raise HTTPException(status_code=400, detail="UNKNOWN REGULATOR")

    record = provision_auditor(
        display_name   = body.display_name,
        email          = body.email,
        regulator      = body.regulator,
        jurisdiction   = body.jurisdiction,
        access_level   = body.access_level,
        provisioned_by = current_admin["sub"],
    )

    # Generate the provisioning URI (for QR code in root dashboard)
    totp        = pyotp.TOTP(record["totp_secret"])
    issuer_name = "Anchor Oversight"
    totp_uri    = totp.provisioning_uri(
        name   = record["email_hash"][:8],  # Don't embed plain email in URI
        issuer_name = issuer_name,
    )

    # 3. Dispatch welcome email (Entity ID + Instructions)
    # Note: TOTP secret is NOT in this email for security.
    send_auditor_provisioned(
        to_email     = body.email,
        display_name = body.display_name,
        entity_id    = record["entity_id"],
        regulator    = record["regulator"]
    )

    return {
        "status":      "PROVISIONED",
        "entity_id":   record["entity_id"],
        "display_name": record["display_name"],
        "regulator":   record["regulator"],
        "access_level": record["access_level"],
        "totp_uri":    totp_uri,       # Render as QR code in root dashboard
        "totp_secret": record["totp_secret"],  # Show once — admin screenshots/sends securely
        "provisioned_at": record["provisioned_at"],
        "note": "TOTP secret is shown once. Screenshot the QR code and send via secure channel.",
    }


@oversight_router.get("/admin/auditors")
def list_all_auditors(current_admin: dict = Depends(get_oversight_admin)):
    """[Admin only] Lists all provisioned auditors (without TOTP secrets)."""
    return list_auditors()


@oversight_router.post("/admin/revoke")
def revoke_auditor_access(
    body:          RevokeRequest,
    current_admin: dict = Depends(get_oversight_admin),
):
    """[Admin only] Revokes an auditor's access immediately."""
    ok = revoke_auditor(body.entity_id)
    if not ok:
        raise HTTPException(status_code=404, detail="AUDITOR NOT FOUND")
    return {"status": "REVOKED", "entity_id": body.entity_id}
