from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import jwt
import os

from database import get_db
from models import GovernanceAccessRequest, EnterpriseUser, RegulatoryOfficial
from .registry_engine import GOVERNANCE_REGISTRY, GOVERNANCE_PROTOCOL_VERSION

# We will inject the dependencies and master key at runtime or use a internal reference
# to avoid circular imports.
_get_current_user: Any = None
_ANCHOR_MASTER_KEY: str = os.getenv("ANCHOR_MASTER_KEY", "")
_EVENT_CALLBACK: Any = None

security = HTTPBearer(auto_error=False)

def get_current_user_governance(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if _get_current_user is None:
        raise HTTPException(status_code=500, detail="GOVERNANCE_ENGINE_NOT_INITIALIZED")
    return _get_current_user(credentials)

def initialize_governance_engine(get_user_dep, master_key, event_callback=None):
    global _get_current_user, _ANCHOR_MASTER_KEY, _EVENT_CALLBACK
    _get_current_user = get_user_dep
    _ANCHOR_MASTER_KEY = master_key
    _EVENT_CALLBACK = event_callback

def emit_governance_event(event_type: str, payload: dict):
    """Propagates governance events across the system bus."""
    if _EVENT_CALLBACK:
        try:
            # Check if callback is async
            import asyncio
            if asyncio.iscoroutinefunction(_EVENT_CALLBACK):
                asyncio.create_task(_EVENT_CALLBACK(event_type, payload))
            else:
                _EVENT_CALLBACK(event_type, payload)
        except Exception as e:
            print(f"[GOV_BUS] Propagation failure for {event_type}: {e}")

gov_router = APIRouter(prefix="/api/governance", tags=["Institutional Governance"])

@gov_router.post("/request-access")
async def request_governance_access(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user_governance),
    db: Session = Depends(get_db)
):
    """
    Submits a formal request for a privileged governance capability.
    Mandatory fields: capability_id, purpose, justification.
    """
    cap_id = payload.get("capability_id")
    purpose = payload.get("purpose")
    justification = payload.get("justification")
    hub_id = payload.get("hub_id")
    
    if not all([cap_id, purpose, justification, hub_id]):
        raise HTTPException(status_code=400, detail="MISSING_MANDATORY_EVIDENCE_CONTEXT")

    if cap_id not in GOVERNANCE_REGISTRY:
        raise HTTPException(status_code=400, detail="INVALID_CAPABILITY_ID")

    cap_def = GOVERNANCE_REGISTRY[cap_id]
    
    # Create the request record
    request_id = f"REQ-{secrets.token_hex(4).upper()}"
    new_request = GovernanceAccessRequest(
        id=request_id,
        requester_id=current_user.get("sub"),
        requester_name=current_user.get("name", "Unknown Official"),
        purpose_classification=purpose,
        investigation_reference=payload.get("investigation_id"),
        justification=justification,
        requested_capability=cap_id,
        target_hub_id=hub_id,
        status="PENDING",
        session_lineage_id=f"LIN-{secrets.token_hex(6).upper()}",
        governance_v=GOVERNANCE_PROTOCOL_VERSION,
        created_at=datetime.utcnow().isoformat()
    )
    
    db.add(new_request)
    db.commit()
    
    emit_governance_event("GOV_REQUEST_CREATED", {
        "request_id": request_id,
        "requester": new_request.requester_name,
        "capability": cap_id,
        "hub_id": hub_id
    })
    
    return {
        "status": "REQUESTED",
        "request_id": request_id,
        "policy_lineage": GOVERNANCE_PROTOCOL_VERSION
    }

@gov_router.post("/approve-access")
async def approve_governance_access(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user_governance),
    db: Session = Depends(get_db)
):
    """
    Activation of institutional authority by a superior clearance level.
    """
    request_id = payload.get("request_id")
    if current_user.get("role") not in ["owner", "admin", "root"]:
        raise HTTPException(status_code=403, detail="HIGHER_CLEARANCE_REQUIRED")

    req = db.query(GovernanceAccessRequest).filter(GovernanceAccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="REQUEST_NOT_FOUND")

    if req.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"REQUEST_ALREADY_{req.status}")

    # Activate
    duration = req.requested_duration_sec
    expires_at = datetime.utcnow() + timedelta(seconds=duration)
    
    # Issue Temporary Governance Token (TGT)
    # This token ONLY contains the specific capability approved.
    tgt_payload = {
        "sub": req.requester_id,
        "type": "TGT",
        "capability": req.requested_capability,
        "scope": req.target_hub_id,
        "request_id": req.id,
        "exp": expires_at
    }
    from security import get_jwt_key
    tgt_token = jwt.encode(tgt_payload, get_jwt_key(), algorithm="HS256")
    
    req.status = "APPROVED"
    req.approving_authority = current_user.get("sub")
    req.temporary_token = tgt_token
    req.activated_at = datetime.utcnow().isoformat()
    req.expires_at = expires_at.isoformat()
    
    db.commit()
    
    emit_governance_event("GOV_REQUEST_APPROVED", {
        "request_id": req.id,
        "requester": req.requester_name,
        "approver": current_user.get("name"),
        "capability": req.requested_capability,
        "hub_id": req.target_hub_id
    })
    
    return {
        "status": "ACTIVATED",
        "token": tgt_token,
        "expires_at": req.expires_at
    }

@gov_router.get("/active-sessions")
async def list_active_sessions(
    current_user: dict = Depends(get_current_user_governance),
    db: Session = Depends(get_db)
):
    """List current active governance sessions."""
    now = datetime.utcnow().isoformat()
    sessions = db.query(GovernanceAccessRequest).filter(
        GovernanceAccessRequest.status == "APPROVED",
        GovernanceAccessRequest.expires_at > now
    ).all()
    
    return sessions

@gov_router.get("/session-timeline/{session_id}")
async def get_session_timeline(
    session_id: str,
    current_user: dict = Depends(get_current_user_governance),
    db: Session = Depends(get_db)
):
    """
    Institutional Session Timeline (Audit of Audits).
    Retrieves all evidentiary artifacts generated under a specific Governance Session.
    """
    from models import LedgerEntry
    import json

    # 1. Fetch all entries that HAVE a lineage seal
    # (In Production: Use JSONB indexing/contains operator)
    entries = db.query(LedgerEntry).filter(
        LedgerEntry.evidence_lineage.is_not(None)
    ).all()

    timeline = []
    for entry in entries:
        try:
            lineage = json.loads(entry.evidence_lineage)
            if lineage.get("session_id") == session_id:
                timeline.append({
                    "event_id": entry.id,
                    "timestamp": entry.timestamp,
                    "type": entry.type,
                    "classification": entry.evidence_classification,
                    "proof": lineage
                })
        except:
            continue

    return {
        "session_id": session_id,
        "event_count": len(timeline),
        "timeline": sorted(timeline, key=lambda x: x["timestamp"])
    }

def require_governance_capability(capability_id: str):
    """
    Institutional Dependency Engine.
    Ensures the request is backed by an active Governance Session (TGT).
    """
    async def dependency(
        current_user: dict = Depends(get_current_user_governance),
        db: Session = Depends(get_db)
    ):
        # 1. Check if the capability is present in the main session (non-provisional)
        caps = current_user.get("capabilities", {})
        if caps.get(capability_id) and not caps.get("is_provisional"):
            return current_user

        # 2. Check for an active TGT in the Authorization header (or session)
        # For simplicity in this phase, we check if the user HAS an active approved request
        now = datetime.utcnow().isoformat()
        active_req = db.query(GovernanceAccessRequest).filter(
            GovernanceAccessRequest.requester_id == current_user.get("sub"),
            GovernanceAccessRequest.requested_capability == capability_id,
            GovernanceAccessRequest.status == "APPROVED",
            GovernanceAccessRequest.expires_at > now
        ).first()

        if not active_req:
            raise HTTPException(
                status_code=403, 
                detail={
                    "error": "GOVERNANCE_ACTIVATION_REQUIRED",
                    "capability": capability_id,
                    "policy_registry": "v6.1"
                }
            )
        
        return current_user

    return dependency
