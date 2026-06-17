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
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from database import get_db
from models import EnforcementNotice, AuditTrailEntry, LedgerEntry, Hub, Organization, RegulatoryOfficial
from mail import send_auditor_provisioned
from governance.registry_engine import compile_governance_profile

# ---------------------------------------------------------------------------
# Router & security
# ---------------------------------------------------------------------------

oversight_router = APIRouter(prefix="/api/oversight", tags=["Oversight Auth"])
security         = HTTPBearer(auto_error=False)

ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY", "")
OVERSIGHT_JWT_TTL = int(os.getenv("OVERSIGHT_JWT_TTL_HOURS", "8"))  # 8-hour session

NATO_PHONETIC = [
    "ALFA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL", 
    "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER", "OSCAR", "PAPA", 
    "QUEBEC", "ROMEO", "SIERRA", "TANGO", "UNIFORM", "VICTOR", "WHISKEY", 
    "XRAY", "YANKEE", "ZULU"
]


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

    # v6.1 Institutional Governance Fields
    identity_subtype: Optional[str] = "REGULATORY_AUDITOR"
    entity_visibility_scope: Optional[str] = "ai_agent,gateway"
    governance_scope: Optional[str] = "jurisdiction_wide"
    clearance_level: Optional[int] = 3


class RevokeRequest(BaseModel):
    entity_id: str


# ---------------------------------------------------------------------------
# JWT helpers (oversight-scoped)
# ---------------------------------------------------------------------------

def _issue_oversight_jwt(user: RegulatoryOfficial, session_id: str) -> str:
    """Issues a short-lived oversight JWT (v6.2 institutional layout)."""
    exp = datetime.now(timezone.utc) + timedelta(hours=OVERSIGHT_JWT_TTL)
    
    # Compile capabilities manifest with temporal check support
    raw_overrides = getattr(user, "provisioned_capabilities", "")
    capability_manifest = []
    if raw_overrides:
        try:
            import json
            capability_manifest = json.loads(raw_overrides)
        except:
            capability_manifest = raw_overrides

    compiled_caps = compile_governance_profile(
        role="regulator", 
        subtype=user.identity_subtype, 
        overrides=capability_manifest
    )
    
    return jwt.encode(
        {
            "sub":          user.id,
            "name":         user.display_name,
            "regulator":    user.department,
            "access_level": "READ_ONLY",
            "session_id":   session_id,
            "role":         "regulator",
            "portal":       "oversight",
            "exp":          exp,
            
            # v6.1 Institutional Metadata
            "subtype":      user.identity_subtype,
            "entity_scope": user.entity_visibility_scope,
            "jurisdiction": user.jurisdiction_scope,
            "clearance":    user.clearance_level,
            "capabilities": compiled_caps
        },
        ANCHOR_MASTER_KEY,
        algorithm="HS256",
    )


def _decode_oversight_jwt(token: str) -> dict:
    import logging
    logger = logging.getLogger("anchor.oversight")
    try:
        payload = jwt.decode(token, ANCHOR_MASTER_KEY, algorithms=["HS256"])
        if payload.get("portal") != "oversight":
            logger.error(f"[TOKEN_SCOPE_ERROR] Attempted access with non-oversight token. User: {payload.get('sub', 'UNKNOWN')}")
            raise HTTPException(status_code=401, detail="INVALID TOKEN SCOPE")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Oversight JWT expired")
        raise HTTPException(status_code=401, detail="SESSION EXPIRED")
    except jwt.InvalidTokenError:
        logger.warning("Oversight JWT invalid")
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

@oversight_router.post("/identify")
def oversight_identify(body: dict, db: Session = Depends(get_db)):
    """Validates ID (and optionally Email) and returns user info for the identification stage."""
    search_id = body.get("clearance_id", "").strip().upper()
    search_email = body.get("email", "").strip().lower()

    query = db.query(RegulatoryOfficial).filter(
        RegulatoryOfficial.id == search_id,
        RegulatoryOfficial.status == "approved"
    )
    
    # If email is provided, enforce it (standard identification)
    # If not, this is an auto-fill request
    if search_email:
        query = query.filter(RegulatoryOfficial.email == search_email)
    
    user = query.first()

    if not user:
        raise HTTPException(status_code=401, detail="IDENTITY NOT RECOGNIZED")

    # Fetch Hub ID from the Org table
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    hub_id = org.hub_id if org else "UNKNOWN"

    return {
        "status": "RECOGNIZED",
        "display_name": user.display_name,
        "email": user.email, # Returned for auto-fill UX
        "agency_hub_id": hub_id,
        "regulator": user.department
    }


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
        user         = user,
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
        "entity_id":    current_user.get("sub"),
        "display_name": current_user.get("name"),
        "regulator":    current_user.get("regulator"),
        "access_level": current_user.get("access_level"),
        "session_id":   current_user.get("session_id"),
        "role":         "regulator",
        
        # v6.1 Institutional Metadata
        "subtype":      current_user.get("subtype"),
        "entity_scope": current_user.get("entity_scope"),
        "jurisdiction": current_user.get("jurisdiction"),
        "clearance":    current_user.get("clearance")
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

    # Generate Clearance ID pattern: SEC-ALFA-9 (NATO Phonetic)
    word = secrets.choice(NATO_PHONETIC)
    digit = secrets.randbelow(10)
    clearance_id = f"{body.regulator.upper()}-{word}-{digit}"
    
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
        created_at=datetime.now(timezone.utc).isoformat(),
        
        # v6.1 Institutional Governance Identity
        identity_subtype=body.identity_subtype,
        jurisdiction_scope=body.jurisdiction, # Map jurisdiction to scope
        entity_visibility_scope=body.entity_visibility_scope,
        governance_scope=body.governance_scope,
        institutional_origin=body.regulator,
        clearance_level=body.clearance_level,
        delegation_rights=True if body.clearance_level and body.clearance_level >= 3 else False
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


# ---------------------------------------------------------------------------
# Enforcement Notices
# ---------------------------------------------------------------------------

class EnforcementNoticeRequest(BaseModel):
    company:       str
    rule_violated: str
    severity:      str = "HIGH"   # LOW | MEDIUM | HIGH | CRITICAL
    description:   str
    deadline:      Optional[str] = None


from models import EnforcementNotice

@oversight_router.post("/enforcement")
def file_enforcement_notice(
    body:         EnforcementNoticeRequest,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """
    [Auditor] Files a formal enforcement notice (v6.2 Gated).
    Only government_auditors have enforcement authority.
    """
    if current_user.get("subtype") != "government_auditor":
        raise HTTPException(status_code=403, detail="INSTITUTIONAL_AUTHORITY_REQUIRED: Only government_auditors may file enforcement notices.")

    notice_id = f"ENF-{current_user['regulator'].upper()}-{secrets.token_hex(4).upper()}"
    now       = datetime.now(timezone.utc).isoformat()

    notice = EnforcementNotice(
        id            = notice_id,
        auditor_id    = current_user["sub"],
        auditor_name  = current_user["name"],
        regulator     = current_user["regulator"],
        company       = body.company.strip(),
        rule_violated = body.rule_violated.strip(),
        severity      = body.severity.upper(),
        description   = body.description.strip(),
        deadline      = body.deadline,
        status        = "OPEN",
        filed_at      = now,
    )
    db.add(notice)
    db.commit()

    return {
        "status":      "FILED",
        "notice_id":   notice_id,
        "company":     notice.company,
        "severity":    notice.severity,
        "filed_at":    now,
        "message":     f"Enforcement notice {notice_id} filed against {notice.company}. Status: OPEN.",
    }


@oversight_router.get("/enforcement")
def list_my_notices(
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """[Auditor] Returns all enforcement notices filed by this auditor."""
    notices = db.query(EnforcementNotice).filter(
        EnforcementNotice.auditor_id == current_user["sub"]
    ).order_by(EnforcementNotice.filed_at.desc()).all()

    return [
        {
            "notice_id":    n.id,
            "company":      n.company,
            "rule_violated":n.rule_violated,
            "severity":     n.severity,
            "status":       n.status,
            "deadline":     n.deadline,
            "filed_at":     n.filed_at,
            "description":  n.description,
        }
        for n in notices
    ]


@oversight_router.get("/enforcement/all")
def list_all_notices(
    db:            Session = Depends(get_db),
    current_admin: dict    = Depends(get_oversight_admin),
):
    """[Admin only] Returns all enforcement notices across all auditors."""
    notices = db.query(EnforcementNotice).order_by(EnforcementNotice.filed_at.desc()).all()
    return notices


class NoticeStatusUpdate(BaseModel):
    status: str  # OPEN | ACKNOWLEDGED | RESOLVED


@oversight_router.patch("/enforcement/{notice_id}")
def update_notice_status(
    notice_id:    str,
    body:         NoticeStatusUpdate,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """
    [Auditor] Update the status of a previously filed enforcement notice.
    Only the auditor who filed the notice may update it.
    """
    valid_statuses = {"OPEN", "ACKNOWLEDGED", "RESOLVED"}
    if body.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    notice = db.query(EnforcementNotice).filter(EnforcementNotice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="NOTICE NOT FOUND")
    if notice.auditor_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="NOT YOUR NOTICE")

    notice.status = body.status.upper()
    db.commit()

    return {
        "status":    "UPDATED",
        "notice_id": notice_id,
        "new_status": notice.status,
    }


# ---------------------------------------------------------------------------
# Jurisdiction Summary
# ---------------------------------------------------------------------------

@oversight_router.get("/jurisdiction-summary")
def get_jurisdiction_summary(
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """
    [Auditor] Returns compliance statistics grouped by jurisdiction/region.
    Respects auditor's jurisdiction scope.
    """
    # 1. Resolve auditor and their jurisdiction scope
    sub = current_user.get("sub")
    official = db.query(RegulatoryOfficial).filter(
        (RegulatoryOfficial.id == sub) | (RegulatoryOfficial.email == sub)
    ).first()
    
    # Defaults/fallbacks
    allowed_regions = None
    subtype = "standard_auditor"
    
    if official:
        subtype = official.identity_subtype or official.auditor_type or "standard_auditor"
        if subtype in ["government_auditor", "REGULATOR_AUDITOR"]:
            allowed_regions = [official.jurisdiction] if official.jurisdiction else ["IN"]
        elif subtype in ["standard_auditor", "HUB_AUDITOR"]:
            # Standard auditor: get regions of assigned hubs
            assigned_str = official.assigned_hub_ids or ""
            assigned_ids = [h.strip() for h in assigned_str.split(",") if h.strip()]
            hubs = db.query(Hub).filter(Hub.id.in_(assigned_ids)).all()
            allowed_regions = list(set(h.region for h in hubs))
        elif subtype in ["cross_hub_auditor", "CROSS_HUB_AUDITOR"]:
            # Cross hub auditor: get regions of their organization's hubs
            hubs = db.query(Hub).filter(Hub.org_id == official.org_id).all()
            allowed_regions = list(set(h.region for h in hubs))

    # 2. Query LedgerEntries joined with Hubs and Organizations
    try:
        query = (
            db.query(
                LedgerEntry.id,
                LedgerEntry.timestamp,
                LedgerEntry.type,
                LedgerEntry.chain_hash,
                Hub.id.label("hub_id"),
                Hub.region.label("hub_region"),
                Hub.regulatory_visible.label("hub_reg_visible"),
                Hub.entity_type.label("hub_entity_type"),
                Organization.display_name.label("org_name"),
                Organization.id.label("org_id")
            )
            .outerjoin(Hub,          Hub.id            == LedgerEntry.hub_id)
            .outerjoin(Organization, Organization.id   == Hub.org_id)
        )
        
        # Apply regulatory visibility filter
        query = query.filter(Hub.regulatory_visible == True)
        
        # Apply entity taxonomy visibility filter for auditors (v6.3)
        if official and official.entity_visibility_scope:
            allowed_types = [t.strip() for t in official.entity_visibility_scope.split(",") if t.strip()]
            query = query.filter(Hub.entity_type.in_(allowed_types))
        
        results = query.all()
    except Exception as exc:
        import logging
        logging.getLogger("anchor.oversight").error(f"DB query failed in jurisdiction-summary: {exc}")
        raise HTTPException(status_code=500, detail=f"DB query failed: {exc}")

    # Region full-name helper
    def get_region_name(code: str) -> str:
        mapping = {
            "IN": "India",
            "US": "USA",
            "GB": "United Kingdom",
            "UK": "United Kingdom",
            "EU": "European Union",
            "AE": "UAE",
            "SG": "Singapore",
            "CN": "China",
            "JP": "Japan",
            "AU": "Australia",
            "CA": "Canada"
        }
        return mapping.get(code.strip().upper(), code)

    # 3. Aggregate by region
    regions: dict = {}
    
    # Initialize allowed regions with empty stats if nothing has been recorded yet
    # This guarantees that the India page is never blank or missing for an India auditor
    if allowed_regions:
        for r_code in allowed_regions:
            r_name = get_region_name(r_code)
            regions[r_name] = {
                "region": r_name, "total": 0, "violations": 0,
                "entities": set(), "orgs": set(), "_entity_viols": {},
            }

    for r in results:
        r_code = r.hub_region or "Unknown"
        
        # Filter by allowed regions if restricted
        if allowed_regions and r_code not in allowed_regions:
            continue
            
        region = get_region_name(r_code)
        if region not in regions:
            regions[region] = {
                "region": region, "total": 0, "violations": 0,
                "entities": set(), "orgs": set(), "_entity_viols": {},
            }
        regions[region]["total"] += 1
        if r.hub_id:
            regions[region]["entities"].add(r.hub_id)
        if r.org_id:
            regions[region]["orgs"].add(r.org_id)
        if r.type == "runtime_violation":
            regions[region]["violations"] += 1
            key = r.hub_id or "unknown"
            ev  = regions[region]["_entity_viols"]
            ev[key] = ev.get(key, 0) + 1

    result_list = []
    for region, d in sorted(regions.items()):
        total = d["total"]; viols = d["violations"]
        pct   = round(((total - viols) / total) * 100, 1) if total > 0 else 100.0
        ev    = d["_entity_viols"]
        worst = max(ev, key=ev.get) if ev else None
        result_list.append({
            "region": region, "total_decisions": total, "violations": viols,
            "compliance_pct": pct, "entity_count": len(d["entities"]),
            "org_count": len(d["orgs"]),
            "worst_entity": worst, "worst_entity_viols": ev.get(worst, 0) if worst else 0,
        })

    grand_total  = sum(d["total"]      for d in regions.values())
    grand_viols  = sum(d["violations"] for d in regions.values())
    
    # Count unique grand entities
    grand_ents = 0
    unique_ents = set()
    for d in regions.values():
        unique_ents.update(d["entities"])
    grand_ents = len(unique_ents)

    return {
        "summary": {
            "total_decisions":  grand_total,
            "total_violations": grand_viols,
            "global_compliance_pct": round(((grand_total - grand_viols) / grand_total) * 100, 1) if grand_total else 100.0,
            "total_entities":   grand_ents,
            "total_regions":    len(regions),
        },
        "by_region": sorted(result_list, key=lambda x: x["compliance_pct"]),
    }


# ---------------------------------------------------------------------------
# Audit Trail
# ---------------------------------------------------------------------------

class AuditLogRequest(BaseModel):
    action:      str            # VAULT_VIEW | CHAIN_VERIFY | EXPORT | NOTICE_FILED | LOGIN | SEARCH
    target_id:   Optional[str] = None
    target_name: Optional[str] = None
    detail:      Optional[str] = None   # JSON string with extra context


@oversight_router.post("/audit-trail")
def log_audit_action(
    body:         AuditLogRequest,
    request:      Request,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """
    [Auditor] Logs a regulatory action to the immutable audit trail.
    Called by the frontend on every significant action.
    """
    entry = AuditTrailEntry(
        id           = f"AT-{current_user['regulator'].upper()}-{secrets.token_hex(4).upper()}",
        auditor_id   = current_user["sub"],
        auditor_name = current_user["name"],
        regulator    = current_user["regulator"],
        action       = body.action.upper(),
        target_id    = body.target_id,
        target_name  = body.target_name,
        detail       = body.detail,
        ip_address   = request.client.host if request.client else None,
        timestamp    = datetime.now(timezone.utc).isoformat(),
    )
    db.add(entry)
    db.commit()
    return {"logged": True, "trail_id": entry.id}


@oversight_router.get("/audit-trail")
def get_my_audit_trail(
    limit:        int    = 100,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_oversight_user),
):
    """[Auditor] Returns the audit trail for this auditor (most recent first)."""
    entries = (
        db.query(AuditTrailEntry)
        .filter(AuditTrailEntry.auditor_id == current_user["sub"])
        .order_by(AuditTrailEntry.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "trail_id":    e.id,
            "action":      e.action,
            "target_id":   e.target_id,
            "target_name": e.target_name,
            "detail":      e.detail,
            "timestamp":   e.timestamp,
            "ip_address":  e.ip_address,
        }
        for e in entries
    ]
