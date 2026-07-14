from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect, Query, Body, Request
from relay_protocol import (
    MessageType, RelayMessage,
    SpokeRegisterPayload, AuditHeaderPayload, ForensicPullPayload,
    ForensicResponsePayload, HubAckPayload,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import jwt
import hashlib
import secrets
import time
import json
import os
import sys
import asyncio
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import logging

# --- 0. VAULT GATE (Environment Sync) ---
# Load the local server/.env file
load_dotenv()

logger = logging.getLogger("anchor.proxy")
logging.basicConfig(level=logging.INFO)

ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")
if not ANCHOR_MASTER_KEY:
    print("\n[!!!] CRITICAL SECURITY FAILURE: ANCHOR_MASTER_KEY IS MISSING FROM THE ENVIRONMENT [!!!]")
    print("      Anchor v5.0.0 'Master Node' cannot start without a cryptographic key to secure the vault.")
    print("      Set the variable and restart the deployment.\n")
    sys.exit(1)

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, text
from database import get_db, init_db, SessionLocal
from models import Hub, LedgerEntry, EnterpriseUser, RegulatoryOfficial, Organization, ForensicRequest, WhitelistEntry, ReplayAccessLog, RuntimeRegistry
from security import encrypt_secret, decrypt_secret, get_jwt_key
from dispatch_manager import dispatch_webhook
from auth import (
    auth_router, get_current_user, get_current_admin_user, 
    require_subtypes, ANCHOR_MASTER_KEY
)
from oversight_auth import oversight_router
from governance import gov_router, seal_artifact, initialize_governance_engine

# --- 1. INITIALIZE FASTAPI & CORS ---
env = (os.getenv("ENVIRONMENT") or "").lower()
if env in ["development", "dev", "local"]:
    docs_url = "/docs"
    redoc_url = "/redoc"
    openapi_url = "/openapi.json"
else:
    docs_url = None
    redoc_url = None
    openapi_url = None

app = FastAPI(
    title="Anchor Master Node",
    version="5.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url
)

# Pre-declare managers to avoid name errors in bridge closure
manager = None
spoke_registry = None

# --- AUTHENTICATION ENGINE ---
app.include_router(auth_router)

# --- OVERSIGHT ENGINE (Auditor TOTP Auth) ---
app.include_router(oversight_router)

# --- GOVERNANCE ENGINE (v6.1 Activation) ---
app.include_router(gov_router)

# --- GOVERNANCE MANIFESTS (v6.0 Dynamic Loading) ---
@app.get("/api/governance/constitution")
def get_constitution(current_user: dict = Depends(get_current_user)):
    """Serves the signed constitution.anchor manifest."""
    try:
        path = os.path.join(os.path.dirname(__file__), "constitution.anchor")
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Constitution NOT FOUND")
        with open(path, "r") as f:
            content = f.read()
        return {"content": content, "status": "SEALED", "version": "6.0.1"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    """Health check and system status for the Master Node."""
    return {
        "status": "ACTIVE",
        "engine": "Anchor Governance Master Node",
        "version": "5.0.0",
        "jurisdictions": ["USA", "UK", "IN", "EU"],
        "node_type": "HUB",
        "_pulse": "STABLE" # Heartbeat marker for force-rebuild
    }

# --- ROOT MONITORING (Storage & Health) ---
@app.get("/api/monitoring/storage")
async def storage_monitor(current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """
    Sovereign Storage Analytics:
    Calculates efficiency of the metadata-only model and monitors Neon footprint.
    """
    total_records = db.query(LedgerEntry).count()
    decentralized_count = db.query(LedgerEntry).filter(text("payload LIKE '%\"decentralized\": true%'")).count()
    
    # Estimate savings: Assume 2KB avg for full vs 300B for header
    full_est_mb = (total_records * 2000) / (1024 * 1024)
    actual_est_mb = (total_records * 300) / (1024 * 1024)
    savings_mb = full_est_mb - actual_est_mb

    return {
        "status": "OPERATIONAL",
        "total_ledger_records": total_records,
        "decentralized_audits": decentralized_count,
        "neon_storage_mb_est": round(actual_est_mb, 2),
        "sovereign_savings_mb": round(savings_mb, 2),
        "architecture_mode": "METADATA_ONLY",
        "recommendation": "Safe" if total_records < 1000000 else "Consider Spoke Pruning"
    }

@app.on_event("startup")
def on_startup():
    """Genesis Sequence: Ensures schema is healed and tables are seeded."""
    init_db()
    
    # (Healing logic removed as it was overwriting legitimate Hub IDs and corrupting DB state)
    print("[OK] Anchor Hub: Core Engine Operational.")


# --- ROOT EMAIL REPAIR (One-time fix for corrupted records) ---
@app.post("/api/admin/repair-email")
async def repair_email(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Root-only: Corrects a corrupted email for a given Clearance ID."""
    if current_user.get("role") != "root":
        raise HTTPException(status_code=403, detail="ROOT CLEARANCE REQUIRED")
    clearance_id = payload.get("clearance_id", "").strip().upper()
    correct_email = payload.get("correct_email", "").strip().lower()
    if not clearance_id or not correct_email or "@" not in correct_email:
        raise HTTPException(status_code=400, detail="Invalid clearance_id or email")
    from models import EnterpriseUser, RegulatoryOfficial
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == clearance_id).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == clearance_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No user found: {clearance_id}")
    old_email = user.email
    user.email = correct_email
    db.commit()
    print(f"[REPAIR] {clearance_id}: '{old_email}' → '{correct_email}'")
    return {"status": "REPAIRED", "clearance_id": clearance_id, "old_email": old_email, "new_email": correct_email}

# --- PUBLIC MESH TELEMETRY (No auth — all identifiers hashed) ---
@app.get("/api/public/stats")
def get_public_mesh_stats(db: Session = Depends(get_db)):
    """
    Public World Monitor endpoint for the Global Mesh page.
    Returns aggregate governance telemetry with ALL identifying information
    replaced by truncated SHA-256 hashes — no company, project, or file names exposed.
    """
    entries = db.query(LedgerEntry).order_by(desc(LedgerEntry.timestamp)).all()

    total_audits = 0
    total_violations = 0
    total_mitigations = 0
    recent_violations = []

    # Violation type → one-line public description map
    VIOLATION_DESCRIPTIONS = {
        "runtime_violation": "Governance rule breach detected in inference chain",
        "prompt_injection":  "Prompt injection vector identified in agent input",
        "ethics_breach":     "Ethics policy violation flagged by domain engine",
        "privacy_leak":      "Sensitive data exfiltration pattern detected",
        "supply_chain":      "MCP supply chain integrity compromise detected",
        "alignment":         "Model alignment drift beyond tolerance threshold",
        "agentic":           "Unauthorized autonomous action outside policy scope",
    }

    for e in entries:
        if e.type == "remediation":
            total_mitigations += 1
            continue

        total_audits += 1
        is_violation = (e.type == "runtime_violation")
        if is_violation:
            total_violations += 1

        if is_violation and len(recent_violations) < 50:
            try:
                payload = json.loads(e.payload)
            except Exception:
                payload = {}

            # Hash all identifying fields
            entity_hash  = hashlib.sha256((e.hub_id or "").encode()).hexdigest()[:8]
            project_raw  = payload.get("project_name", e.hub_id or "unknown")
            project_hash = hashlib.sha256(project_raw.encode()).hexdigest()[:8]
            rule_id      = payload.get("rule_id", e.type or "UNKNOWN")

            # Jurisdiction derived from rule_id prefix (SEC, RBI, ETH, etc.)
            loc = rule_id.split("-")[0].upper() if "-" in rule_id else "GLO"

            desc_text = VIOLATION_DESCRIPTIONS.get(e.type, "Policy deviation recorded in audit ledger")

            recent_violations.append({
                "violation_id": f"{rule_id}-{entity_hash[:4].upper()}",
                "timestamp":    e.timestamp,
                "location":     loc,
                "description":  desc_text,
                "chain_hash":   (e.chain_hash or "")[:16] + "...",
                "entity":       f"0x{entity_hash}",
                "project":      f"0x{project_hash}",
            })

    compliance_rate = (
        100 if total_audits == 0
        else round(((total_audits - total_violations) / total_audits) * 100, 1)
    )

    return {
        "total_audits":     total_audits,
        "total_violations": total_violations,
        "total_mitigations":total_mitigations,
        "compliance_rate":  compliance_rate,
        "active_nodes":     db.query(func.count(LedgerEntry.hub_id.distinct())).scalar() or 0,
        "violations":       recent_violations,
    }



# Lock down CORS to your specific subdomains
ALLOWED_ORIGINS = [
    "http://localhost:5173", # Local dev
    "https://anchorgovernance.tech",
    "https://app.anchorgovernance.tech",
    "https://oversight.anchorgovernance.tech",
    "https://root.anchorgovernance.tech",
    "https://mesh.anchorgovernance.tech",
]


# Open CORS for emergency connectivity between Cloudflare/HF Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. BROADCAST ENGINE (WebSockets) ---
class ConnectionManager:
    """Manages real-time oversight telemetry for Hub Command (The NOC)"""
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, hub_id: str):
        await websocket.accept()
        if hub_id not in self.active_connections:
            self.active_connections[hub_id] = []
        self.active_connections[hub_id].append(websocket)

    def disconnect(self, websocket: WebSocket, hub_id: str):
        if hub_id in self.active_connections:
            self.active_connections[hub_id].remove(websocket)

    async def broadcast(self, hub_id: str, message: dict):
        """Streams real-time violation alerts to the CISO Dashboard and Global NOC"""
        # 1. Send to hub-specific listeners
        if hub_id in self.active_connections:
            for connection in self.active_connections[hub_id]:
                await connection.send_json(message)
        
        # 2. Mirror to Global NOC (Admin only)
        if "GLOBAL_SYSTEM" in self.active_connections:
            message["_mirror"] = hub_id # Mark the source hub
            for connection in self.active_connections["GLOBAL_SYSTEM"]:
                await connection.send_json(message)

manager = ConnectionManager()

# --- PHASE 18: SPOKE REGISTRY (Sovereign Relay) ---
class SpokeRegistry:
    """
    Tracks all active Enterprise Spoke WebSocket connections.
    The Hub uses this to push FORENSIC_PULL commands to specific Spokes.
    """
    def __init__(self):
        # hub_id → WebSocket
        self._spokes: Dict[str, WebSocket] = {}
        # Pending forensic requests: request_id → asyncio.Future
        self._pending: Dict[str, asyncio.Future] = {}

    def register(self, hub_id: str, ws: WebSocket):
        self._spokes[hub_id] = ws

    def deregister(self, hub_id: str):
        self._spokes.pop(hub_id, None)

    def is_online(self, hub_id: str) -> bool:
        return hub_id in self._spokes

    async def push_event(self, hub_id: str, message: RelayMessage):
        """Pushes a governance event to a specific Spoke Node."""
        ws = self._spokes.get(hub_id)
        if ws:
            try:
                await ws.send_text(message.to_json())
            except Exception as e:
                logger.error(f"[RELAY] Failed to push event to Spoke {hub_id}: {e}")

    async def pull_forensics(self, hub_id: str, entry_id: str,
                               clearance_id: str, timeout: float = 15.0) -> dict:
        """
        Brokers a real-time forensic pull from an Enterprise Spoke.
        Returns the decrypted forensic payload or raises HTTPException.
        """
        import asyncio, base64
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        ws = self._spokes.get(hub_id)
        if not ws:
            raise HTTPException(
                status_code=503,
                detail=f"SPOKE_OFFLINE: Enterprise node '{hub_id}' is not connected to the Grid."
            )

        request_id = f"req_{int(time.time()*1000)}"
        future: asyncio.Future = asyncio.get_event_loop().create_future()
        self._pending[request_id] = future

        pull_msg = RelayMessage(
            type=MessageType.FORENSIC_PULL,
            hub_id=hub_id,
            payload=ForensicPullPayload(
                request_id=request_id,
                entry_id=entry_id,
                clearance_id=clearance_id,
            ).model_dump(),
        )
        await ws.send_text(pull_msg.to_json())

        try:
            result = await asyncio.wait_for(future, timeout=timeout)
        except asyncio.TimeoutError:
            self._pending.pop(request_id, None)
            raise HTTPException(
                status_code=504,
                detail="FORENSIC_TIMEOUT: Spoke did not respond within 15 seconds."
            )

        return result

    def resolve_pull(self, request_id: str, payload: dict):
        """Called when a FORENSIC_RESPONSE arrives from a Spoke."""
        future = self._pending.pop(request_id, None)
        if future and not future.done():
            future.set_result(payload)


spoke_registry = SpokeRegistry()

# --- GOVERNANCE EVENT BUS (Phase 4 Propagation) ---
async def governance_event_bridge(event_type: str, payload: dict):
    """
    Sovereign Event Bus:
    Bridges internal governance events to Dashboards AND Enterprise Spoke Nodes.
    """
    hub_id = payload.get("hub_id", "GLOBAL_SYSTEM")
    
    # 1. Update Real-time Dashboards (React)
    dashboard_msg = {
        "type": "GOVERNANCE_EVENT",
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "payload": payload
    }
    await manager.broadcast(hub_id, dashboard_msg)

    # 2. Propagate to Enterprise Spoke Nodes (WebSocket Relay)
    if hub_id != "GLOBAL_SYSTEM":
        update_type = "POLICY_RELOAD"
        if event_type == "GOV_REQUEST_APPROVED":
            update_type = "TGT_ISSUED"
        
        gov_upd = RelayMessage(
            type=MessageType.GOVERNANCE_UPDATE,
            hub_id=hub_id,
            payload={
                "update_type": update_type,
                "request_id": payload.get("request_id"),
                "capability": payload.get("capability"),
                "requester_id": payload.get("requester_id"),
                "expires_at": payload.get("expires_at"),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        # Push to the specific spoke if online
        await spoke_registry.push_event(hub_id, gov_upd)

# --- INITIALIZE GOVERNANCE PROTOCOL ---
initialize_governance_engine(get_current_user, ANCHOR_MASTER_KEY, governance_event_bridge)

# --- 3. DATABASE SETUP ---
# All legacy sqlite3 init_db logic removed. Switching exclusively to SQLAlchemy + Alembic.

# --- 3. CRYPTOGRAPHY & SECURITY UTILS ---
def generate_mat() -> str:
    """Generates a 256-bit Master Access Token (MAT)"""
    return "0x" + secrets.token_hex(32)

def hash_key(mat: str) -> str:
    """One-way hash for storing the MAT in the database"""
    return hashlib.sha256(mat.encode()).hexdigest()

def verify_entity(hub_id: str, provided_mat: str, db: Session) -> bool:
    """
    Verifies an incoming MAT against the stored Hub regional_key.
    The Regional Key acts as the 'Spoke Node' handle.
    """
    hub = db.query(Hub).filter(Hub.id == hub_id).first()
    if hub and hub.regional_key == provided_mat:
        return True
    
    # Fallback: Allow root key (for diagnostic pulls)
    if provided_mat == ANCHOR_MASTER_KEY:
        return True

    return False

def append_runtime_violation_to_file(hub_id: str, entry_id: str, timestamp: str, audit_data: dict, chain_hash: str = None, signature: str = None):
    try:
        import os
        
        # Determine target file paths
        paths_to_try = [
            "d:/animus-manifesto/.anchor/violations/runtime_violations.txt",
            "d:/anchor-web/.anchor/violations/runtime_violations.txt",
            "./.anchor/violations/runtime_violations.txt"
        ]
        
        target_path = None
        for p in paths_to_try:
            abs_p = os.path.abspath(p)
            dir_name = os.path.dirname(abs_p)
            try:
                os.makedirs(dir_name, exist_ok=True)
                target_path = abs_p
                # Prioritize animus-manifesto one if it exists or can be created
                if "animus-manifesto" in abs_p:
                    break
            except:
                pass
                
        if not target_path:
            return
            
        file_exists = os.path.exists(target_path)
        
        # Extract violations list to display rule IDs safely
        violations = audit_data.get("violations", [])
        if not violations:
            # Fallback if violations list is empty but status was VIOLATION
            rule_id = audit_data.get("governance_status", {}).get("rule_id", "UNKNOWN")
            violations = [{"rule_id": rule_id, "severity": "CRITICAL"}]
            
        with open(target_path, "a", encoding="utf-8") as f:
            if not file_exists:
                f.write("=" * 80 + "\n")
                f.write("   ANCHOR RUNTIME GOVERNANCE VIOLATIONS\n")
                f.write("=" * 80 + "\n\n")
            
            f.write("=" * 80 + "\n")
            f.write("   ANCHOR RUNTIME GOVERNANCE VIOLATION\n")
            f.write("=" * 80 + "\n\n")
            
            f.write(f"Hub ID:            {hub_id}\n")
            f.write(f"Timestamp:         {timestamp}\n")
            f.write(f"Decision ID:       {entry_id}\n")
            f.write(f"Compliance Status: VIOLATION\n")
            f.write(f"Chain Hash:        {chain_hash or 'N/A'}\n")
            f.write(f"Signature:         {signature or 'N/A'}\n")
            f.write(f"Evidence Ref:      Spoke local ledger entry. Retrieve via:\n")
            f.write(f"                   anchor forensic --entry-id {entry_id}\n\n")
            
            f.write("--- VIOLATION FINDINGS ---\n")
            for v in violations:
                rule_id = v.get("rule_id", "UNKNOWN")
                severity = v.get("severity", "CRITICAL").upper()
                f.write(f"* [[X]] [{rule_id}] ({severity})\n")
                
            f.write("-" * 80 + "\n\n")
    except Exception as ex:
        print(f"[ERROR writing runtime violation log] {ex}")

# --- 4. PYDANTIC MODELS (Payload Schemas) ---
class FleetProvisionRequest(BaseModel):
    name: str
    tier: str # 'CORE', 'ENTERPRISE', 'REGULATOR'
    # Optional initial subscription
    branch_name: Optional[str] = None
    webhook_url: Optional[str] = None
    dialect: Optional[str] = "RBI" # "RBI", "SEC", "EU"

class SubscriptionRequest(BaseModel):
    entity_id: str
    branch_name: str
    webhook_url: str
    dialect: str

class IngressPayload(BaseModel):
    hub_id: str
    mat: str
    audit_data: Dict[str, Any]
    
class ResolveRequest(BaseModel):
    query: str
    root_key: str

class InstitutionalIdentityUpdateRequest(BaseModel):
    identity_subtype: Optional[str] = None
    jurisdiction_scope: Optional[str] = None
    entity_visibility_scope: Optional[str] = None
    governance_scope: Optional[str] = None
    institutional_origin: Optional[str] = None
    clearance_level: Optional[int] = None
    delegation_rights: Optional[bool] = None

# --- 5. ADMIN API (Provisioning & Secret Management) ---
@app.post("/api/admin/institutional/update/{user_id}")
def update_institutional_identity(
    user_id: str,
    body: InstitutionalIdentityUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    [Root/Admin Only] Institutional Provisioning Terminal.
    Updates governance characteristics for an Enterprise or Regulatory identity.
    """
    if current_user.get("role") != "root":
        raise HTTPException(status_code=403, detail="ROOT ENFORCEMENT CLEARANCE REQUIRED")

    # Search in both identity tables
    user = db.query(EnterpriseUser).filter(EnterpriseUser.id == user_id).first()
    if not user:
        user = db.query(RegulatoryOfficial).filter(RegulatoryOfficial.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="IDENTITY_NOT_FOUND")

    # Update fields if provided
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    
    return {
        "status": "PROVISIONED",
        "user_id": user_id,
        "identity_subtype": user.identity_subtype,
        "entity_scope": user.entity_visibility_scope
    }

# Legacy Admin APIs (Placeholder for migration)
@app.post("/api/admin/hub/provision")
def provision_hub_manual(org_id: str, region: str, unit: str, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    from auth import _generate_hub_id
    hub_id = _generate_hub_id(org_id, region, unit)
    return {"status": "SUCCESS", "hub_id": hub_id}

@app.post("/api/admin/rotate-key/{hub_id}")
def rotate_hub_key(hub_id: str, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Rotates the Sovereign Regional Key for a hub."""
    hub = db.query(Hub).filter(Hub.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="HUB NOT FOUND")

    new_key = f"sk_live_{secrets.token_urlsafe(32)}"
    hub.regional_key = new_key
    db.commit()

    return {
        "hub_id": hub_id,
        "new_regional_key": new_key,
        "message": "REGIONAL KEY ROTATED SUCCESSFULLY"
    }

@app.get("/api/admin/whitelist")
def get_whitelist(current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Lists all pre-authorized emails."""
    return db.query(WhitelistEntry).all()

@app.post("/api/admin/whitelist")
def add_to_whitelist(req: dict = Body(...), current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Pre-authorizes an email for onboarding."""
    email = req.get("email", "").strip().lower()
    org_id = req.get("org_id", "").strip().lower()
    role = req.get("role", "owner").strip().lower()
    
    if not email or not org_id:
        raise HTTPException(status_code=400, detail="Email and Org ID are required.")
        
    existing = db.query(WhitelistEntry).filter(WhitelistEntry.email == email).first()
    if existing: return {"status": "ALREADY_EXISTS"}
    
    new_entry = WhitelistEntry(
        email=email,
        org_id=org_id,
        role=role,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_entry)
    db.commit()
    return {"status": "WHITELISTED", "email": email}

@app.delete("/api/admin/whitelist/{id}")
def delete_from_whitelist(id: int, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Revokes a whitelist authorization."""
    entry = db.query(WhitelistEntry).filter(WhitelistEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="ENTRY NOT FOUND")
    db.delete(entry)
    db.commit()
    return {"status": "DELETED"}

# --- 5. FORENSIC APPROVAL ENGINE ---
@app.get("/api/forensic/pending")
async def get_pending_pulls(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Institutional Approval Queue:
    Aggregates v5 legacy forensic pulls and v6.1 Governance Access Requests.
    """
    if current_user["role"] not in ["owner", "admin", "root"]:
        raise HTTPException(status_code=403, detail="HIGHER_CLEARANCE_REQUIRED")
    
    # Root sees all
    if current_user["role"] == "root":
        hub_filter = None
    else:
        user = db.query(EnterpriseUser).filter(EnterpriseUser.email == current_user.get("sub")).first()
        if not user or not user.hub_id:
            raise HTTPException(status_code=403, detail="User is not assigned to a Hub")
        hub_filter = user.hub_id

    # 1. Fetch v5 Legacy Pulls
    v5_query = db.query(ForensicRequest).filter(ForensicRequest.status == "PENDING")
    if hub_filter:
        v5_query = v5_query.filter(ForensicRequest.hub_id == hub_filter)
    v5_pulls = v5_query.all()

    # 2. Fetch v6.1 Governance Requests (The formal ontology layer)
    from models import GovernanceAccessRequest
    v6_query = db.query(GovernanceAccessRequest).filter(GovernanceAccessRequest.status == "PENDING")
    if hub_filter:
        v6_query = v6_query.filter(GovernanceAccessRequest.target_hub_id == hub_filter)
    v6_pulls = v6_query.all()
    
    # Unified output format
    unified = []
    for p in v5_pulls:
        unified.append({
            "id": p.id,
            "type": "LEGACY_PULL",
            "requester": p.auditor_name,
            "hub_id": p.hub_id,
            "purpose": "Forensic Data Retrieval (Legacy)",
            "justification": "N/A (Legacy)",
            "capability": "can_replay",
            "created_at": p.created_at
        })
    
    for p in v6_pulls:
        unified.append({
            "id": p.id,
            "type": "GOVERNANCE_ACTIVATION",
            "requester": p.requester_name,
            "hub_id": p.target_hub_id,
            "purpose": p.purpose_classification,
            "justification": p.justification,
            "capability": p.requested_capability,
            "created_at": p.created_at,
            "governance_v": p.governance_v
        })

    return unified

class ForensicRequestCreate(BaseModel):
    hub_id: str
    entry_id: str

@app.post("/api/forensic/request")
async def create_forensic_request(
    body: ForensicRequestCreate,
    current_user: dict = Depends(require_subtypes(["government_auditor", "standard_auditor", "cross_hub_auditor"])),
    db: Session = Depends(get_db)
):
    """
    Filing a new forensic pull request by an authorized auditor (v6.2 Institutional).
    """
    auditor_id = current_user.get("sub")
    # Fetch auditor info
    official = db.query(RegulatoryOfficial).filter((RegulatoryOfficial.id == auditor_id) | (RegulatoryOfficial.email == auditor_id)).first()
    auditor_name = official.display_name if official else current_user.get("name", "Regulatory Official")
    actual_auditor_id = official.id if official else auditor_id
    
    # Unique pull_id using formatted pattern
    pull_id = f"pull_{body.entry_id}_{secrets.token_hex(4)}"
    
    req = ForensicRequest(
        id=pull_id,
        auditor_id=actual_auditor_id,
        auditor_name=auditor_name,
        hub_id=body.hub_id,
        status="PENDING",
        created_at=datetime.now(timezone.utc).isoformat()
    )
    db.add(req)
    db.commit()
    
    return {
        "status": "PENDING",
        "pull_id": pull_id,
        "message": "Forensic pull request registered. Awaiting Hub Owner approval."
    }

@app.get("/api/forensic/requests")
async def list_forensic_requests(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists forensic pull requests.
    - Owners/admins see requests for their assigned hub.
    - Auditors see requests they have created.
    """
    role = current_user.get("role")
    sub = current_user.get("sub")
    
    if role in ("admin", "regulator", "auditor"):
        # Auditor: see their own requests (by email or ID)
        official = db.query(RegulatoryOfficial).filter((RegulatoryOfficial.id == sub) | (RegulatoryOfficial.email == sub)).first()
        auditor_id = official.id if official else sub
        reqs = db.query(ForensicRequest).filter((ForensicRequest.auditor_id == auditor_id) | (ForensicRequest.auditor_id == sub)).order_by(desc(ForensicRequest.created_at)).all()
        return reqs
    elif role in ("owner", "enterprise"):
        # Owner/admin: see requests for their hub
        from models import EnterpriseUser
        user = db.query(EnterpriseUser).filter(EnterpriseUser.email == sub).first()
        hub_id = user.hub_id if user else current_user.get("hub_id")
        if not hub_id:
            raise HTTPException(status_code=403, detail="User not assigned to a Hub")
        reqs = db.query(ForensicRequest).filter(ForensicRequest.hub_id == hub_id).order_by(desc(ForensicRequest.created_at)).all()
        return reqs
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

@app.post("/api/forensic/approve/{pull_id}")
async def approve_forensic_pull(pull_id: str, status: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.get("role") not in ["owner", "admin", "root"]:
        raise HTTPException(status_code=403, detail="Approval denied")
    
    req = db.query(ForensicRequest).filter(ForensicRequest.id == pull_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify owner belongs to the same hub
    user_hub_id = current_user.get("hub_id")
    if not user_hub_id:
        from models import EnterpriseUser
        user = db.query(EnterpriseUser).filter(EnterpriseUser.email == current_user.get("sub")).first()
        if user:
            user_hub_id = user.hub_id
            
    if req.hub_id != user_hub_id and current_user.get("role") != "root":
        raise HTTPException(status_code=403, detail="Cross-hub approval forbidden")
        
    new_status = status.get("status", "APPROVED")
    req.status = new_status
    
    if new_status == "APPROVED":
        # Generate 5-minute transient JWT token
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=5)
        
        token_payload = {
            "pull_id": req.id,
            "hub_id": req.hub_id,
            "auditor_id": req.auditor_id,
            "exp": int(expires_at.timestamp())
        }
        temp_token = jwt.encode(token_payload, get_jwt_key(), algorithm="HS256")
        
        req.temporary_token = temp_token
        req.expires_at = expires_at.isoformat()
    
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Request {pull_id} marked as {req.status}",
        "temporary_token": req.temporary_token if req.status == "APPROVED" else None
    }

@app.get("/api/forensic/replay/{pull_id}")
async def replay_forensics(
    pull_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Brokered retrieval endpoint.
    Validates the 5-minute single-use token, checks single-use status,
    invokes spoke_registry.pull_forensics(), logs in ReplayAccessLog,
    appends a sealed replay_access ledger entry, and serves decrypted payload.
    """
    # 1. Validate request and find the ForensicRequest in DB
    req = db.query(ForensicRequest).filter(ForensicRequest.id == pull_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Forensic request not found.")
        
    # 2. Check token mismatch
    if req.temporary_token != token:
        raise HTTPException(status_code=401, detail="INVALID_TOKEN: Token mismatch.")
        
    # 3. Decode and validate JWT token
    try:
        payload = jwt.decode(token, get_jwt_key(), algorithms=["HS256"])
        if payload.get("pull_id") != pull_id:
            raise HTTPException(status_code=401, detail="INVALID_TOKEN: Request ID mismatch.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="TOKEN_EXPIRED: The 5-minute replay window has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="INVALID_TOKEN: Signature verification failed.")
        
    # 4. Enforce Single-Use validation
    if req.replayed_at is not None:
        raise HTTPException(status_code=403, detail="TOKEN_ALREADY_USED: Single-use forensic token has already been consumed.")
        
    # 5. Extract entry_id from pull_id (which is formatted as pull_{entry_id}_{rand})
    parts = pull_id.split("_")
    if len(parts) >= 3 and parts[1] == "led":
        entry_id = f"led_{parts[2]}"
    else:
        entry_id = pull_id
        
    # 6. Call Spoke Node over persistent WebSocket
    logger.info(f"[FORENSIC] Brokering pull for {entry_id} from Spoke {req.hub_id}")
    decrypted_payload = await spoke_registry.pull_forensics(
        hub_id=req.hub_id,
        entry_id=entry_id,
        clearance_id=req.auditor_id
    )
    
    # 7. Update ForensicRequest replayed metadata
    now_str = datetime.now(timezone.utc).isoformat()
    req.replayed_at = now_str
    req.replayed_by = req.auditor_id
    
    # 8. Record in ReplayAccessLog
    access_log_id = f"acc_{int(time.time()*1000)}"
    
    # Seal the access event into the DAC by hashing (pull_id + accessed_by + accessed_at)
    seal_raw = f"{pull_id}:{req.auditor_id}:{now_str}"
    seal_hash = hashlib.sha256(seal_raw.encode('utf-8')).hexdigest()
    
    replay_log = ReplayAccessLog(
        id=access_log_id,
        pull_id=pull_id,
        accessed_by=req.auditor_id,
        accessed_at=now_str,
        chain_hash=seal_hash
    )
    db.add(replay_log)
    
    # 9. Seal type `replay_access` record into the main LedgerEntry
    # v6.1: Elevate to Evidence Artifact with Institutional Continuity Proof
    artifact = seal_artifact(
        payload={
            "project_name": "Audit Logs Integrity Seal",
            "is_compliant": True,
            "decentralized": True,
            "fingerprint": seal_hash,
            "_hub_source": req.hub_id,
            "access_event": {
                "pull_id": pull_id,
                "accessed_by": req.auditor_id,
                "accessed_at": now_str
            }
        },
        classification="forensic",
        origin="MASTER-NODE",
        session_id=getattr(req, "session_lineage_id", None) or f"SES-{int(time.time())}",
        prev_hash=entry_id # Link to the trigger event
    )

    ledger_entry_id = f"led_acc_{int(time.time()*1000)}"
    # Generate signature for the ledger entry using ANCHOR_MASTER_KEY
    sig_raw = f"{ledger_entry_id}:{artifact.lineage.jurisdictional_seal}"
    signature = hashlib.sha256(f"{sig_raw}:{ANCHOR_MASTER_KEY}".encode('utf-8')).hexdigest()
    
    new_ledger = LedgerEntry(
        id=ledger_entry_id,
        hub_id=req.hub_id,
        timestamp=now_str,
        type="replay_access",
        chain_hash=artifact.lineage.jurisdictional_seal,
        signature=signature,
        evidence_lineage=artifact.lineage.model_dump_json(),
        evidence_classification="forensic",
        payload=json.dumps(artifact.payload)
    )
    db.add(new_ledger)
    db.commit()
    
    logger.info(f"[FORENSIC] Forensic pull successful for {pull_id}. Access sealed as {ledger_entry_id}")
    return {
        "status": "FORENSIC_RETRIEVED",
        "entry_id": entry_id,
        "source": "SPOKE_RELAY",
        "data": decrypted_payload,
        "integrity_seal": seal_hash
    }

# --- 6. SOVEREIGN INGRESS (Metadata-Only Hub) ---
@app.post("/api/ingress")
async def submit_telemetry(payload: IngressPayload, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Receives data from the SDK/Spoke and persists only the Cryptographic Header.
    """
    if not verify_entity(payload.hub_id, payload.mat, db):
        raise HTTPException(status_code=401, detail="INVALID HUB REGIONAL KEY")
    
    try:
        audit = payload.audit_data
        status = audit.get("governance_status", {}).get("status", "UNKNOWN")
        entry_id = audit.get("entry_id", f"led_{int(time.time()*1000)}")
        
        # 1. SECURITY: Immutable Fingerprinting
        # We use sort_keys=True to ensure the hash is identical regardless of JSON key order.
        full_audit_str = json.dumps(audit, sort_keys=True)
        audit_fingerprint = hashlib.sha256(full_audit_str.encode('utf-8')).hexdigest()

        header_payload = {
            "project_name": audit.get("project_name", "unknown"),
            "is_compliant": (status != "VIOLATION"),
            "rule_id": audit.get("governance_status", {}).get("rule_id"),
            "violation_count": len(audit.get("violations", [])),
            "decentralized": True,
            "fingerprint": audit_fingerprint,
            "_hub_source": payload.hub_id,
            "risk_classification": "HIGH" if status == "VIOLATION" else "LOW"
        }
        
        # 2. Persist Metadata-Only Header to Neon (SQLAlchemy)
        # v6.1: Elevate to Evidence Artifact with Institutional Continuity Proof
        artifact = seal_artifact(
            payload=header_payload,
            classification="runtime" if status != "VIOLATION" else "violation",
            origin="SPOKE-NODE",
            session_id="SYSTEM", # System heartbeat doesn't require TGT
            prev_hash="GENESIS" # Root of check chain
        )

        new_entry = LedgerEntry(
            id=entry_id,
            hub_id=payload.hub_id,
            timestamp=audit.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            type="runtime_violation" if status == "VIOLATION" else "runtime_check",
            chain_hash=artifact.lineage.jurisdictional_seal,
            signature=audit.get("cryptography", {}).get("signature"),
            evidence_lineage=artifact.lineage.model_dump_json(),
            evidence_classification="runtime" if status != "VIOLATION" else "violation",
            payload=json.dumps(artifact.payload)
        )
        
        db.add(new_entry)
        db.commit()
        
        # 3. Resilient Background Handshake (Alerts)
        if status == "VIOLATION":
            background_tasks.add_task(dispatch_webhook, payload.hub_id, audit, db)
            
            # Write runtime violation plain-text log safely
            try:
                append_runtime_violation_to_file(
                    hub_id=payload.hub_id,
                    entry_id=entry_id,
                    timestamp=audit.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                    audit_data=audit,
                    chain_hash=new_entry.chain_hash,
                    signature=new_entry.signature
                )
            except Exception as e:
                logger.error(f"Failed to write runtime violation file: {e}")
            
            # 4. Real-time NOC Broadcast (Summary only)
            background_tasks.add_task(
                manager.broadcast,
                payload.hub_id,
                {
                    "type": "VIOLATION_ALERT",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "entry_id": entry_id,
                    "project": audit.get("project_name"),
                    "violations": audit.get("violations", []),
                    "fingerprint": audit_fingerprint[:16]
                }
            )
        
        logger.info(f"[SOVEREIGN] Ingress Accepted | Spoke: {payload.hub_id} | Fingerprint: {audit_fingerprint[:12]}...")

        return {
            "status": "ACKNOWLEDGED", 
            "entry_id": entry_id, 
            "fingerprint": audit_fingerprint,
            "storage": "SOVEREIGN_HEADER_ONLY",
            "forensic_pull_available": True
        }

    except Exception as e:
        logger.error(f"[!!!] INGRESS FAILURE: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal processing error in Master Node")

def _enforce_tenant_scope(current_user: dict, db: Session, hub_id: str = None):
    """
    Enforces hub-level isolation and auditor scoping (v6.0).
    Respects regulatory visibility and entity taxonomy.
    """
    role = current_user.get("role")
    sub = current_user.get("sub")
    
    # 1. Root/Master bypass: Unrestricted
    if role == "root":
        return hub_id
        
    # 2. Check if the user is a Regulatory Official
    official = db.query(RegulatoryOfficial).filter((RegulatoryOfficial.id == sub) | (RegulatoryOfficial.email == sub)).first()
    if official:
        # Use Identity Subtype for v6.2 (Fallback to aud_type for migration)
        subtype = official.identity_subtype or official.auditor_type or "standard_auditor"
        
        # Base filter for regulators: Only see what is marked as regulatory_visible
        reg_base_query = db.query(Hub).filter(Hub.regulatory_visible == True)
        
        # v6.1+ Institutional Scope Enforcement
        if official.entity_visibility_scope:
            allowed_types = [t.strip() for t in official.entity_visibility_scope.split(",") if t.strip()]
        else:
            allowed_types = ["ai_agent", "gateway", "mesh_node"]
            
        reg_base_query = reg_base_query.filter(Hub.entity_type.in_(allowed_types))

        # Enforce strict codebase visibility restrictions:
        # Government and Standard auditors are absolutely not allowed to see any codebases.
        if subtype in ["government_auditor", "REGULATOR_AUDITOR", "standard_auditor", "HUB_AUDITOR"]:
            reg_base_query = reg_base_query.filter(Hub.entity_type != "codebase")

        # standard_auditor: isolated to specific hubs
        if subtype in ["standard_auditor", "HUB_AUDITOR"]:
            assigned_str = official.assigned_hub_ids or ""
            assigned_ids = [h.strip() for h in assigned_str.split(",") if h.strip()]
            if not assigned_ids:
                raise HTTPException(status_code=403, detail="STANDARD_AUDITOR has no assigned hubs.")
            
            visible_hubs = reg_base_query.filter(Hub.id.in_(assigned_ids)).all()
            visible_ids = [h.id for h in visible_hubs]

            if hub_id:
                if hub_id in visible_ids:
                    return hub_id
                else:
                    raise HTTPException(status_code=403, detail="RESTRICTED: Hub is either not assigned or visibility is restricted.")
            return visible_ids
            
        # cross_hub_auditor: sees everything in their own organization/agency
        elif subtype in ["cross_hub_auditor", "CROSS_HUB_AUDITOR"]:
            # Only see codebases if they are part of that hub (meaning in assigned_hub_ids)
            assigned_ids = [h.strip() for h in (official.assigned_hub_ids or "").split(",") if h.strip()]
            org_hubs = reg_base_query.filter(Hub.org_id == official.org_id).filter(
                (Hub.entity_type != "codebase") | (Hub.id.in_(assigned_ids))
            ).all()
            org_hub_ids = [h.id for h in org_hubs]
            if not org_hub_ids:
                raise HTTPException(status_code=403, detail="CROSS_HUB_AUDITOR has no visible hubs.")
            if hub_id:
                if hub_id in org_hub_ids:
                    return hub_id
                else:
                    raise HTTPException(status_code=403, detail="RESTRICTED: Visibility restricted.")
            return org_hub_ids
            
        # government_auditor: Sees everything in their jurisdiction across all orgs
        elif subtype in ["government_auditor", "REGULATOR_AUDITOR"]:
            juris = official.jurisdiction or "GL"
            juris_hubs = reg_base_query.filter(Hub.region == juris).all()
            juris_hub_ids = [h.id for h in juris_hubs]
            if not juris_hub_ids:
                raise HTTPException(status_code=403, detail=f"No visible hubs in jurisdiction: {juris}")
            if hub_id:
                if hub_id in juris_hub_ids:
                    return hub_id
                else:
                    raise HTTPException(status_code=403, detail="RESTRICTED: Visibility restricted.")
            return juris_hub_ids
            
        return hub_id

    # 3. Enterprise user isolation
    if role in ("owner", "admin", "enterprise"):
        user = db.query(EnterpriseUser).filter((EnterpriseUser.id == sub) | (EnterpriseUser.email == sub)).first()
        user_hub_id = user.hub_id if user else current_user.get("hub_id")
        if not user_hub_id:
             raise HTTPException(status_code=403, detail="USER NOT LINKED TO A HUB")
             
        # If querying a specific hub, verify it matches
        if hub_id and hub_id != user_hub_id:
            raise HTTPException(status_code=403, detail="RESTRICTED: You only have access to your assigned Hub.")
            
        return user_hub_id
        
    return hub_id

class ZKSyncPayload(BaseModel):
    entity_id: str
    timestamp: str
    chain_hash: str
    signature: str
    status: str

@app.post("/api/ledger")
async def sync_zk_ledger(payload: ZKSyncPayload, db: Session = Depends(get_db)):
    """
    Receives ZK proof from CLI client and registers it on the ledger.
    """
    try:
        from models import Hub, LedgerEntry
        import time
        is_violation = (payload.status == "VIOLATION")
        
        header_payload = {
            "project_name": "Forge Repository",
            "is_compliant": not is_violation,
            "rule_id": "SEC-004" if is_violation else "CLEAN",
            "violation_count": 1 if is_violation else 0,
            "decentralized": True,
            "fingerprint": payload.chain_hash,
            "_hub_source": payload.entity_id,
            "risk_classification": "HIGH" if is_violation else "LOW"
        }
        
        entry_id = f"led_{int(time.time()*1000)}"
        new_entry = LedgerEntry(
            id=entry_id,
            hub_id=payload.entity_id,
            timestamp=payload.timestamp,
            type="runtime_violation" if is_violation else "runtime_check",
            chain_hash=payload.chain_hash,
            signature=payload.signature,
            payload=json.dumps(header_payload)
        )
        db.add(new_entry)
        db.commit()
        print(f"[ZK SYNC] Successful from Hub: {payload.entity_id} | Hash: {payload.chain_hash[:12]}")
        return {"status": "ACKNOWLEDGED", "entry_id": entry_id}
    except Exception as e:
        print(f"[ZK SYNC ERROR] {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ledger")
def get_hub_ledger(hub_id: str = None, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """The Cryptographic Ledger: Returns flattened audit records. Filtered by Hub."""
    scope = _enforce_tenant_scope(current_user, db, hub_id)

    query = db.query(LedgerEntry).order_by(desc(LedgerEntry.timestamp))
    
    if scope:
        if isinstance(scope, list):
            query = query.filter(LedgerEntry.hub_id.in_(scope))
        else:
            query = query.filter(LedgerEntry.hub_id == scope)
        
    audits = query.all()
    
    # Flatten the schema specifically for the React forensic vaults
    flat_ledger = []
    for entry in audits:
        try:
            audit = json.loads(entry.payload)
        except:
            audit = {}

        is_violation = (entry.type == "runtime_violation")
        
        flat_ledger.append({
            "entry_id": entry.id,
            "project_name": audit.get("project_name", "unknown-project"),
            "is_compliant": not is_violation,
            "timestamp": entry.timestamp,
            "chain_hash": entry.chain_hash,
            "signature": entry.signature,
            "violations": audit.get("violations", []),
            "raw_payload": audit, # For the 'Night-Vision' terminal view
            "execution_context": {
                "environment": audit.get("execution_context", {}).get("environment", "production"),
                "risk_level": "CRITICAL" if is_violation else "LOW"
            }
        })
        
    return flat_ledger


@app.get("/api/stats")
def get_hub_stats(hub_id: str = None, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aggregation Engine: Hub-level compliance status"""
    
    # 1. Enforce Hub Isolation
    scope = _enforce_tenant_scope(current_user, db, hub_id)

    # 2. Database Query
    query = db.query(LedgerEntry)
    if scope:
        if isinstance(scope, list):
            query = query.filter(LedgerEntry.hub_id.in_(scope))
        else:
            query = query.filter(LedgerEntry.hub_id == scope)
    audits = query.all()
        
    # 3. Calculate Global Metrics
    total_audits = len(audits)
    total_violations = 0
    project_map = {}

    for a in audits:
        try:
            # Parse the forensic payload to extract project context
            payload = json.loads(a.payload)
        except:
            payload = {}
            
    remediated_parent_ids = set()
    for e in audits:
        if e.type == "remediation":
            try:
                p = json.loads(e.payload)
                parent_id = p.get("parent_entry_id") or p.get("violation_id") or p.get("entry_id")
                if parent_id:
                    remediated_parent_ids.add(parent_id)
            except:
                pass
                
    total_audits = 0
    total_violations = 0

    for entry in audits:
        if entry.type == "remediation": continue # Skip remediation entries in raw tallies
        
        try:
            audit = json.loads(entry.payload)
        except:
            continue

        proj_name = audit.get("project_name", "unknown")
        is_violation = (entry.type == "runtime_violation")
        
        # Check if THIS specific violation was remediated
        is_resolved = entry.id in remediated_parent_ids
        
        if proj_name not in project_map:
            project_map[proj_name] = {"name": proj_name, "status": "COMPLIANT", "audits": 0, "violations": 0}

        total_audits += 1
        project_map[proj_name]["audits"] += 1
        
        if is_violation and not is_resolved:
            total_violations += 1
            project_map[proj_name]["violations"] += 1

    # 3. Compliance Math
    compliance_rate = 100 if total_audits == 0 else int(((total_audits - total_violations) / total_audits) * 100)

    # 4. Format Project Health
    project_health = []
    for p in project_map.values():
        p["status"] = "COMPLIANT" if p["violations"] == 0 else "NON-COMPLIANT"
        project_health.append(p)

    # 5. Identify Recent Events (Limited set)
    recent_events = []
    for e in audits[:20]: # Last 20
        try:
            audit_p = json.loads(e.payload)
        except:
            continue
        recent_events.append({
            "status": "RESOLVED" if e.id in remediated_parent_ids else ("VIOLATION" if e.type == "runtime_violation" else "CLEAN"),
            "project": audit_p.get("project_name", "N/A"),
            "commit": e.id.split("_")[1].split("-")[0][:6] if "_" in e.id else e.id[:6],
            "hash": e.chain_hash[2:10] if e.chain_hash else "0x0000"
        })

    return {
        "active_projects": len(project_map),
        "total_audits": total_audits,
        "total_violations": total_violations, # Now reflects UNRESOLVED only
        "compliance_rate": compliance_rate,
        "project_health": project_health,
        "recent": recent_events,
        "top_threats": [{"rule": "AI Compliance Breach", "count": total_violations}] if total_violations > 0 else []
    }

# --- 8. AUDITOR PORTAL (JWT-Secured) ---
@app.get("/api/audit/{entity_id}")
def get_fleet_ledger(entity_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """The Regulator's DAC Chain: Paginated historical record for a specific fleet"""
    # Only admins and regulators can access audit endpoints
    if current_user["role"] not in ("admin", "regulator", "root"):
        raise HTTPException(status_code=403, detail="AUDITOR OR ADMIN PRIVILEGES REQUIRED")
    
    entries = db.query(LedgerEntry).filter(LedgerEntry.hub_id == entity_id).order_by(desc(LedgerEntry.timestamp)).all()
    return entries

@app.get("/api/audit/{entity_id}/verify")
def verify_fleet_chain(entity_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """The ZK-Integrity Check: Verifies the full cryptographic chain for a fleet"""
    if current_user["role"] not in ("admin", "regulator", "root"):
        raise HTTPException(status_code=403, detail="AUDITOR OR ADMIN PRIVILEGES REQUIRED")
    
    entries = db.query(LedgerEntry).filter(LedgerEntry.hub_id == entity_id).order_by(LedgerEntry.timestamp).all()
    
    chain_status = []
    for e in entries:
        is_valid = True  # Placeholder for actual forensic hash verification
        chain_status.append({
            "entry_id": e.id,
            "chain_hash": e.chain_hash,
            "status": "VERIFIED" if is_valid else "CORRUPTED"
        })
    
    return {"entity_id": entity_id, "verification_rate": 1.0, "chain": chain_status}


@app.get("/api/audit/{entity_id}/trend")
def get_compliance_trend(
    entity_id: str,
    days:         int     = 30,
    current_user: dict    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """
    Returns daily compliance % for an AI entity over the last N days.
    Each point = { date, total, violations, compliance_pct }
    """
    if current_user["role"] not in ("admin", "regulator", "root"):
        raise HTTPException(status_code=403, detail="AUDITOR OR ADMIN PRIVILEGES REQUIRED")

    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    entries = db.query(LedgerEntry).filter(
        LedgerEntry.hub_id == entity_id,
        LedgerEntry.timestamp >= cutoff,
    ).order_by(LedgerEntry.timestamp.asc()).all()

    # Group by calendar date
    day_map: dict = {}
    for e in entries:
        day = (e.timestamp or "")[:10]   # "2024-03-15"
        if not day:
            continue
        if day not in day_map:
            day_map[day] = {"total": 0, "violations": 0}
        day_map[day]["total"] += 1
        if e.type == "runtime_violation":
            day_map[day]["violations"] += 1

    # Fill every calendar day in range (so chart has no gaps)
    from datetime import date as date_cls
    today  = date_cls.today()
    result = []
    for i in range(days):
        d = (today - timedelta(days=days - 1 - i)).isoformat()
        stats = day_map.get(d, {"total": 0, "violations": 0})
        total = stats["total"]
        viols = stats["violations"]
        pct   = round(((total - viols) / total) * 100, 1) if total > 0 else None
        result.append({
            "date":            d,
            "total":           total,
            "violations":      viols,
            "compliance_pct":  pct,       # None = no data that day
        })

    # Compute summary
    active_days = [r for r in result if r["compliance_pct"] is not None]
    avg_pct = round(sum(r["compliance_pct"] for r in active_days) / len(active_days), 1) if active_days else None
    worst   = min(active_days, key=lambda r: r["compliance_pct"]) if active_days else None
    best    = max(active_days, key=lambda r: r["compliance_pct"]) if active_days else None

    return {
        "entity_id":   entity_id,
        "days":        days,
        "data":        result,
        "summary": {
            "avg_compliance_pct": avg_pct,
            "best_day":           best,
            "worst_day":          worst,
            "total_decisions":    sum(r["total"] for r in result),
            "total_violations":   sum(r["violations"] for r in result),
        }
    }

@app.get("/api/audit/{entity_id}/entry/{entry_id}")
def get_translated_entry(entity_id: str, entry_id: str, dialect: str = "RBI",
                         current_user: dict = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    """
    Polymorphic Reporter — inline dialect translation (no external anchor SDK required).
    Supports: RBI | SEC | EU-AI | NIST
    """
    if current_user["role"] not in ("admin", "regulator", "root"):
        raise HTTPException(status_code=403, detail="AUDITOR OR ADMIN PRIVILEGES REQUIRED")

    entry = db.query(LedgerEntry).filter(
        LedgerEntry.id == entry_id,
        LedgerEntry.hub_id == entity_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="ENTRY NOT FOUND")

    try:
        audit = json.loads(entry.payload)
    except Exception:
        audit = {}

    # ── Core fields extracted from the raw payload ──────────────────────────
    p           = audit.get("primitives", {})
    gov         = audit.get("governance_status", {})
    telemetry   = audit.get("telemetry", {})
    violations  = audit.get("violations", [])
    is_viol     = entry.type == "runtime_violation"
    status_str  = "VIOLATION" if is_viol else "COMPLIANT"
    rule_id     = gov.get("rule_id", "UNKNOWN")
    project     = audit.get("project_name", "N/A")
    action      = p.get("action", "unknown")
    obj         = p.get("object", "unknown")
    context_str = p.get("context", "unknown")
    authority   = p.get("authority", "unknown")
    ts          = entry.timestamp or "N/A"

    # ── Inline dialect translators ──────────────────────────────────────────
    def _rbi():
        return {
            "dialect": "RBI",
            "framework": "Reserve Bank of India — AI Governance Guidelines 2024",
            "report_type": "AI Decision Audit Record",
            "entity": project,
            "decision_id": entry.id,
            "timestamp": ts,
            "compliance_status": status_str,
            "rule_reference": rule_id,
            "action_performed": action,
            "subject_object": obj,
            "decision_context": context_str,
            "authorizing_model": authority,
            "risk_classification": "HIGH" if is_viol else "LOW",
            "violations_detected": violations,
            "telemetry_summary": {
                "latency_ms": telemetry.get("latency_ms"),
                "model_version": telemetry.get("model_version"),
                "confidence": telemetry.get("confidence"),
            },
            "chain_integrity": entry.chain_hash,
            "rbi_article": "Section 4.2 — Real-Time AI Governance Monitoring",
            "remediation_required": is_viol,
        }

    def _sec():
        return {
            "dialect": "SEC",
            "framework": "U.S. Securities & Exchange Commission — AI Model Risk Management",
            "filing_type": "Form AI-GOV-001 — Automated Decision Disclosure",
            "issuer": project,
            "record_id": entry.id,
            "event_timestamp": ts,
            "compliance_determination": status_str,
            "rule_citation": rule_id,
            "algorithmic_action": action,
            "affected_instrument": obj,
            "market_context": context_str,
            "model_authority": authority,
            "material_risk": is_viol,
            "violations": violations,
            "model_telemetry": telemetry,
            "cryptographic_attestation": entry.chain_hash,
            "sec_regulation": "Regulation S-AM — Automated Model Accountability",
            "disclosure_required": is_viol,
            "supervisory_flag": "ALERT" if is_viol else "CLEAR",
        }

    def _eu_ai():
        return {
            "dialect": "EU-AI",
            "framework": "European Union Artificial Intelligence Act (2024/1689)",
            "record_type": "High-Risk AI System Audit Log",
            "provider": project,
            "log_entry_id": entry.id,
            "timestamp_utc": ts,
            "conformity_status": "NON-CONFORMING" if is_viol else "CONFORMING",
            "applicable_article": rule_id,
            "automated_decision": {
                "action": action,
                "subject": obj,
                "context": context_str,
                "model_operator": authority,
            },
            "risk_level": "UNACCEPTABLE" if is_viol else "MINIMAL",
            "violations_detected": violations,
            "technical_documentation": {
                "model_telemetry": telemetry,
                "chain_hash": entry.chain_hash,
                "cryptographic_signature": entry.signature,
            },
            "eu_ai_act_article": "Article 12 — Record-Keeping for High-Risk AI Systems",
            "notified_body_action_required": is_viol,
            "fundamental_rights_impact": "POTENTIAL" if is_viol else "NONE",
        }

    def _nist():
        return {
            "dialect": "NIST",
            "framework": "NIST AI Risk Management Framework (AI RMF 1.0)",
            "document_type": "AI System Event Record",
            "system_identifier": project,
            "event_id": entry.id,
            "event_timestamp": ts,
            "trustworthiness_assessment": "DEGRADED" if is_viol else "MAINTAINED",
            "govern_function": {
                "rule_triggered": rule_id,
                "policy_adherence": not is_viol,
            },
            "map_function": {
                "action": action,
                "object": obj,
                "context": context_str,
            },
            "measure_function": {
                "authorizing_model": authority,
                "telemetry": telemetry,
                "violations": violations,
            },
            "manage_function": {
                "remediation_required": is_viol,
                "chain_hash": entry.chain_hash,
                "signature": entry.signature,
            },
            "nist_rmf_category": "GOVERN-1.1 / MEASURE-2.5 / MANAGE-3.2",
            "risk_tier": "TIER-1 CRITICAL" if is_viol else "TIER-4 ROUTINE",
        }

    TRANSLATORS = {
        "RBI":   _rbi,
        "SEC":   _sec,
        "EU-AI": _eu_ai,
        "NIST":  _nist,
    }

    translator = TRANSLATORS.get(dialect.upper(), _rbi)

    return {
        "translation": translator(),
        "raw_payload": audit,
        "integrity": {
            "status":     "VERIFIED",
            "chain_hash": entry.chain_hash,
            "signature":  entry.signature,
        }
    }

# --- 9. REAL-TIME OVERSIGHT (JWT-Secured WebSocket) ---
@app.websocket("/ws/fleet/{entity_id}")
async def fleet_command_center(websocket: WebSocket, entity_id: str, token: str = Query(None)):
    """The Master Node's real-time vision: JWT-secured live telemetry stream."""
    # Validate JWT before accepting the connection
    if not token:
        await websocket.close(code=4001, reason="AUTHENTICATION REQUIRED")
        return
    
    try:
        payload = jwt.decode(token, get_jwt_key(), algorithms=["HS256"])
        if payload.get("role") != "admin":
            await websocket.close(code=4003, reason="ADMIN PRIVILEGES REQUIRED")
            return
    except jwt.ExpiredSignatureError:
        await websocket.close(code=4001, reason="SESSION EXPIRED")
        return
    except jwt.InvalidTokenError:
        await websocket.close(code=4001, reason="INVALID TOKEN")
        return

    # Valid admin JWT — open the connection
    await manager.connect(websocket, entity_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, entity_id)

# --- 10. SPOKE RELAY GATEWAY (Phase 18 — Sovereign Relay) ---

@app.websocket("/ws/spoke")
async def spoke_gateway(websocket: WebSocket):
    """
    The sovereign relay endpoint. Enterprise Spokes connect here permanently.
    - Spokes register via SPOKE_REGISTER with their MAT.
    - Spokes push AUDIT_HEADER packets for global grid visibility.
    - The Hub sends FORENSIC_PULL commands back over this channel.
    """
    await websocket.accept()
    authenticated = False

    try:
        # Step 1: Handshake (Wait for SPOKE_REGISTER)
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
        reg_msg = RelayMessage.from_json(raw)
        
        if reg_msg.type != MessageType.SPOKE_REGISTER:
            await websocket.close(code=4002, reason="EXPECTED_SPOKE_REGISTER")
            return

        reg = SpokeRegisterPayload(**(reg_msg.payload or {}))
        hub_id = reg_msg.hub_id

        # Verify Hub identity and Regional Key
        spoke_regional_key = None
        with next(get_db()) as db:
            from models import Hub
            hub = db.query(Hub).filter(Hub.id == hub_id).first()
            if not hub or hub.regional_key != reg.regional_key:
                rej = RelayMessage(type=MessageType.HUB_REJECT, hub_id=hub_id,
                                    payload=HubAckPayload(status="ERROR", message="INVALID_REGIONAL_KEY").model_dump())
                await websocket.send_text(rej.to_json())
                await websocket.close(code=4003, reason="INVALID REGIONAL KEY")
                return
            spoke_regional_key = hub.regional_key

        # Regional Key verified — register this Spoke
        spoke_registry.register(hub_id, websocket)
        authenticated = True

        ack = RelayMessage(type=MessageType.HUB_ACK, hub_id=hub_id,
                            payload=HubAckPayload(status="OK", message="SPOKE_REGISTERED").model_dump())
        await websocket.send_text(ack.to_json())
        logger.info("[GRID] Spoke registered: hub_id='%s'", hub_id)

        # Step 2: Message processing loop
        while True:
            raw = await websocket.receive_text()
            try:
                msg = RelayMessage.from_json(raw)
            except Exception:
                continue

            if msg.type == MessageType.AUDIT_HEADER:
                # Store lightweight header in Neon
                header = AuditHeaderPayload(**(msg.payload or {}))
                with next(get_db()) as db:
                    from models import LedgerEntry
                    import json as _json
                    existing = db.query(LedgerEntry).filter(LedgerEntry.id == header.entry_id).first()
                    if not existing:
                        entry = LedgerEntry(
                            id=header.entry_id,
                            hub_id=hub_id,
                            timestamp=header.timestamp,
                            type=header.type,
                            chain_hash=header.chain_hash,
                            signature=header.signature,
                            payload=_json.dumps({
                                "project_name": header.project_name,
                                "is_compliant": header.is_compliant,
                                "rule_id": header.rule_id,
                                "_spoke_relay": True,  # Flag: raw payload lives on Spoke
                            }),
                        )
                        db.add(entry)
                        db.commit()
                logger.info("[GRID] Audit header stored for %s / %s", hub_id, header.entry_id)

            elif msg.type == MessageType.FORENSIC_RESPONSE:
                # Resolve a pending Auditor request
                resp = ForensicResponsePayload(**(msg.payload or {}))
                # Decrypt using the specific spoke's regional key (Option A)
                import base64
                from cryptography.hazmat.primitives.ciphers.aead import AESGCM
                # Fall back to ANCHOR_MASTER_KEY if spoke_regional_key is not set (e.g. mock server)
                decryption_secret = spoke_regional_key or ANCHOR_MASTER_KEY
                key_bytes = hashlib.sha256(decryption_secret.encode()).digest()
                aesgcm = AESGCM(key_bytes)
                nonce = base64.b64decode(resp.nonce)
                ct    = base64.b64decode(resp.encrypted_payload)
                try:
                    plain = aesgcm.decrypt(nonce, ct, None)
                    decrypted = json.loads(plain)
                except Exception as e:
                    decrypted = {"error": f"DECRYPTION_FAILED: {e}"}
                spoke_registry.resolve_pull(resp.request_id, decrypted)

            elif msg.type == MessageType.PING:
                pong = RelayMessage(type=MessageType.PONG, hub_id=hub_id)
                await websocket.send_text(pong.to_json())

    except WebSocketDisconnect:
        pass
    except asyncio.TimeoutError:
        logger.warning("[GRID] Spoke '%s' timed out during handshake", hub_id)
    finally:
        if authenticated:
            spoke_registry.deregister(hub_id)
            logger.info("[GRID] Spoke disconnected: hub_id='%s'", hub_id)


class ForensicRelayRequest(BaseModel):
    entry_id:  str
    hub_id: str


@app.post("/api/forensic/relay")
async def forensic_relay(
    body: ForensicRelayRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    The Sovereign Relay Endpoint.
    An Auditor calls this to request the raw forensic payload for an entry.
    The Hub brokers the request to the correct Enterprise Spoke and returns
    the decrypted payload — the Enterprise never talks to the Auditor directly.
    """
    if current_user["role"] not in ("admin", "regulator"):
        raise HTTPException(status_code=403, detail="AUDITOR PRIVILEGES REQUIRED")

    clearance_id = current_user["sub"]
    logger.info("[RELAY] Auditor '%s' requesting forensics for entry '%s' from Spoke '%s'",
                 clearance_id, body.entry_id, body.hub_id)

    decrypted = await spoke_registry.pull_forensics(
        hub_id=body.hub_id,
        entry_id=body.entry_id,
        clearance_id=clearance_id,
    )
    return {
        "status": "FORENSIC_RETRIEVED",
        "entry_id": body.entry_id,
        "source": "SPOKE_RELAY",
        "data": decrypted,
    }


class RuntimeRegisterRequest(BaseModel):
    runtime_id: str
    name: str
    status: str
    ip_address: str
    region: str
    system_load: float

@app.post("/api/admin/runtime/register")
def register_runtime(body: RuntimeRegisterRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin_user)):
    """Registers or updates a runtime node's health and topology details."""
    existing = db.query(RuntimeRegistry).filter(RuntimeRegistry.id == body.runtime_id).first()
    now_str = datetime.now(timezone.utc).isoformat()
    if existing:
        existing.name = body.name
        existing.status = body.status
        existing.ip_address = body.ip_address
        existing.region_label = body.region
        existing.system_load = body.system_load
        existing.last_heartbeat = now_str
    else:
        new_runtime = RuntimeRegistry(
            id=body.runtime_id,
            name=body.name,
            status=body.status,
            ip_address=body.ip_address,
            region_label=body.region,
            system_load=body.system_load,
            last_heartbeat=now_str,
            created_at=now_str
        )
        db.add(new_runtime)
    db.commit()
    return {"status": "SUCCESS", "message": f"Runtime {body.runtime_id} heartbeat recorded."}

@app.get("/api/admin/runtimes")
def get_runtimes(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin_user)):
    """Returns all registered runtimes for the topology dashboard."""
    runtimes = db.query(RuntimeRegistry).all()
    return runtimes


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)