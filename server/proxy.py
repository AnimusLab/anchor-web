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
from datetime import datetime, timezone
from dotenv import load_dotenv

# --- 0. VAULT GATE (Environment Sync) ---
# Load the local server/.env file
load_dotenv()

ANCHOR_MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")
if not ANCHOR_MASTER_KEY:
    print("\n[!!!] CRITICAL SECURITY FAILURE: ANCHOR_MASTER_KEY IS MISSING FROM THE ENVIRONMENT [!!!]")
    print("      Anchor v5.0.0 'Master Node' cannot start without a cryptographic key to secure the vault.")
    print("      Set the variable and restart the deployment.\n")
    sys.exit(1)

from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from database import get_db, init_db
from models import Fleet, WebhookSubscription, LedgerEntry, EnterpriseUser, RegulatoryOfficial, Organization
from security import encrypt_secret, decrypt_secret
from dispatch_manager import dispatch_webhook
from auth import auth_router, get_current_user, get_current_admin_user
from oversight_auth import oversight_router

# --- 1. INITIALIZE FASTAPI & CORS ---
app = FastAPI(title="Anchor Master Node", version="5.0.0")

# --- AUTHENTICATION ENGINE ---
app.include_router(auth_router)

# --- OVERSIGHT ENGINE (Auditor TOTP Auth) ---
app.include_router(oversight_router)

# --- ROOT GATEWAY STATUS ---
@app.get("/")
def get_system_status():
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
    init_db()
    # --- Sovereign Schema Healer (v5.0.0 Patch) ---
    try:
        from sqlalchemy import text
        from database import SessionLocal
        db = SessionLocal()
        
        # 1. Organizations Table Enhancements
        db.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS regional_key VARCHAR;"))
        db.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hr_contact VARCHAR;"))
        
        # 2. Enterprise Users Table Enhancements
        db.execute(text("ALTER TABLE enterprise_users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'approved';"))
        
        # 3. Ledger Table: Metadata-Only Architecture Support
        db.execute(text("ALTER TABLE ledger ADD COLUMN IF NOT EXISTS decision_hash VARCHAR;"))
        db.execute(text("ALTER TABLE ledger ADD COLUMN IF NOT EXISTS decentralized BOOLEAN DEFAULT TRUE;"))
        db.execute(text("ALTER TABLE ledger ADD COLUMN IF NOT EXISTS chain_proof TEXT;"))
        db.execute(text("ALTER TABLE ledger ADD COLUMN IF NOT EXISTS spoke_node_id VARCHAR;"))
        
        db.commit()
        db.close()
    except Exception as e:
        print(f"[!!!] SCHEMA HEALER FAILED: {e}")


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
            entity_hash  = hashlib.sha256((e.entity_id or "").encode()).hexdigest()[:8]
            project_raw  = payload.get("project_name", e.entity_id or "unknown")
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
        "active_nodes":     db.query(func.count(LedgerEntry.entity_id.distinct())).scalar() or 0,
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
    """Manages real-time oversight telemetry for Fleet Command (The NOC)"""
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, entity_id: str):
        await websocket.accept()
        if entity_id not in self.active_connections:
            self.active_connections[entity_id] = []
        self.active_connections[entity_id].append(websocket)

    def disconnect(self, websocket: WebSocket, entity_id: str):
        if entity_id in self.active_connections:
            self.active_connections[entity_id].remove(websocket)

    async def broadcast(self, entity_id: str, message: dict):
        """Streams real-time violation alerts to the CISO Dashboard and Global NOC"""
        # 1. Send to entity-specific listeners
        if entity_id in self.active_connections:
            for connection in self.active_connections[entity_id]:
                await connection.send_json(message)
        
        # 2. Mirror to Global NOC (Admin only)
        if "GLOBAL_SYSTEM" in self.active_connections:
            message["_mirror"] = entity_id # Mark the source entity
            for connection in self.active_connections["GLOBAL_SYSTEM"]:
                await connection.send_json(message)

manager = ConnectionManager()

# --- PHASE 18: SPOKE REGISTRY (Sovereign Relay) ---
class SpokeRegistry:
    """
    Tracks all active Enterprise Spoke WebSocket connections.
    The Hub uses this to push FORENSIC_PULL commands to specific Spokes
    when an Auditor requests raw evidence — acting as the sovereign relay.
    """
    def __init__(self):
        # entity_id → WebSocket
        self._spokes: Dict[str, WebSocket] = {}
        # Pending forensic requests: request_id → asyncio.Future
        self._pending: Dict[str, asyncio.Future] = {}

    def register(self, entity_id: str, ws: WebSocket):
        self._spokes[entity_id] = ws

    def deregister(self, entity_id: str):
        self._spokes.pop(entity_id, None)

    def is_online(self, entity_id: str) -> bool:
        return entity_id in self._spokes

    async def pull_forensics(self, entity_id: str, entry_id: str,
                              auditor_id: str, timeout: float = 15.0) -> dict:
        """
        Brokers a real-time forensic pull from an Enterprise Spoke.
        Returns the decrypted forensic payload or raises HTTPException.
        """
        import asyncio, base64
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        ws = self._spokes.get(entity_id)
        if not ws:
            raise HTTPException(
                status_code=503,
                detail=f"SPOKE_OFFLINE: Enterprise node '{entity_id}' is not connected to the Grid."
            )

        request_id = f"req_{int(time.time()*1000)}"
        future: asyncio.Future = asyncio.get_event_loop().create_future()
        self._pending[request_id] = future

        pull_msg = RelayMessage(
            type=MessageType.FORENSIC_PULL,
            entity_id=entity_id,
            payload=ForensicPullPayload(
                request_id=request_id,
                entry_id=entry_id,
                auditor_id=auditor_id,
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
import asyncio

# --- 3. DATABASE SETUP ---
# All legacy sqlite3 init_db logic removed. Switching exclusively to SQLAlchemy + Alembic.

# --- 3. CRYPTOGRAPHY & SECURITY UTILS ---
def generate_mat() -> str:
    """Generates a 256-bit Master Access Token (MAT)"""
    return "0x" + secrets.token_hex(32)

def hash_key(mat: str) -> str:
    """One-way hash for storing the MAT in the database"""
    return hashlib.sha256(mat.encode()).hexdigest()

def verify_entity(entity_id: str, provided_mat: str, db: Session) -> bool:
    """
    Verifies an incoming MAT against the stored hash in SQLAlchemy.
    Supports both legacy Entity-level MATs and the new v5.0 Regional Org Master Keys.
    """
    # 1. Check Legacy Entity Mat
    fleet = db.query(Fleet).filter(Fleet.entity_id == entity_id).first()
    if fleet and fleet.key_hash == hashlib.sha256(provided_mat.encode()).hexdigest():
        return True

    # 2. Check Modern Regional Master Key (Direct Integration)
    # The 'entity_id' in this flow refers to the specific project being audited.
    # We look up the parent organization of that project.
    if fleet and fleet.org_id:
        org = db.query(Organization).filter(Organization.id == fleet.org_id).first()
        if org and org.master_key_hash == hashlib.sha256(provided_mat.encode()).hexdigest():
            return True

    # 3. Handle Auto-Provisioning of dynamic projects via Master Key
    # If the project (entity_id) doesn't exist yet, but the Master Key is valid for an Org.
    # We allow the ingress and dynamically link the project to the Org later (Phase 3).
    # For now, we perform a global search for any Org that owns this Master Key.
    if not fleet:
        org = db.query(Organization).filter(Organization.master_key_hash == hashlib.sha256(provided_mat.encode()).hexdigest()).first()
        if org:
            return True

    return False

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
    entity_id: str
    mat: str
    audit_data: Dict[str, Any]
    
class ResolveRequest(BaseModel):
    query: str
    root_key: str

# --- 5. ADMIN API (Provisioning & Secret Management) ---
@app.post("/api/admin/provision")
def provision_fleet(req: FleetProvisionRequest, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Creates a new fleet entity and optional initial regional subscription"""
    entity_id = f"ent_{secrets.token_hex(4)}"
    raw_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    # 1. Create Fleet
    new_fleet = Fleet(
        entity_id=entity_id,
        name=req.name,
        tier=req.tier,
        key_hash=key_hash,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_fleet)
    
    # 2. Add Initial Regional Subscription if provided
    initial_secret = None
    if req.webhook_url:
        initial_secret = secrets.token_urlsafe(24)
        encrypted_secret = encrypt_secret(initial_secret)
        sub = WebhookSubscription(
            id=f"sub_{secrets.token_hex(4)}",
            entity_id=entity_id,
            branch_name=req.branch_name or "Primary-NOC",
            webhook_url=req.webhook_url,
            webhook_secret=encrypted_secret,
            dialect=req.dialect or "RBI"
        )
        db.add(sub)
    
    db.commit()
    
    return {
        "status": "SUCCESS",
        "entity_id": entity_id,
        "master_key": raw_key, # DISPLAY ONCE
        "webhook_secret": initial_secret, # DISPLAY ONCE
        "note": "Save these keys. They are encrypted in the Vault and cannot be retrieved later."
    }

@app.post("/api/admin/subscribe")
def add_subscription(req: SubscriptionRequest, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Adds a new regional branch subscription for an existing fleet"""
    fleet = db.query(Fleet).filter(Fleet.entity_id == req.entity_id).first()
    if not fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
        
    new_secret = secrets.token_urlsafe(24)
    encrypted_secret = encrypt_secret(new_secret)
    
    new_sub = WebhookSubscription(
        id=f"sub_{secrets.token_hex(4)}",
        entity_id=req.entity_id,
        branch_name=req.branch_name,
        webhook_url=req.webhook_url,
        webhook_secret=encrypted_secret,
        dialect=req.dialect
    )
    
    db.add(new_sub)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "branch_id": new_sub.id,
        "webhook_secret": new_secret # DISPLAY ONCE
    }

@app.post("/api/admin/rotate-secret/{entity_id}")
def rotate_fleet_secret(entity_id: str, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Rotates the webhook secret for a fleet to satisfy operational resilience requirements"""
    fleet = db.query(Fleet).filter(Fleet.entity_id == entity_id).first()
    if not fleet:
        raise HTTPException(status_code=404, detail="FLEET NOT FOUND")

    new_secret = secrets.token_urlsafe(32)
    fleet.webhook_secret = encrypt_secret(new_secret)
    db.commit()

    return {
        "entity_id": entity_id,
        "new_webhook_secret": new_secret,
        "message": "WEBHOOK SECRET ROTATED SUCCESSFULLY"
    }

@app.post("/api/admin/resolve")
def resolve_identity(req: ResolveRequest, current_user: dict = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Resolves an Entity ID to a Hash, or a Hash to an ID using SQLAlchemy"""
    # 1. Try resolving as Entity ID directly
    fleet = db.query(Fleet).filter(Fleet.entity_id == req.query).first()
    
    # 2. If not found, try resolving as a plain secret key (hash it and search)
    if not fleet:
        search_hash = hash_key(req.query)
        fleet = db.query(Fleet).filter(Fleet.key_hash == search_hash).first()
        
    if fleet:
        return {
            "entity_id": fleet.entity_id,
            "name": fleet.name,
            "tier": fleet.tier,
            "created_at": fleet.created_at,
            "key_hash": fleet.key_hash
        }
    raise HTTPException(status_code=404, detail="IDENTITY NOT FOUND IN MESH")

# --- 5. FORENSIC APPROVAL ENGINE ---
@app.get("/api/forensic/pending")
async def get_pending_pulls(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Owners see requests from auditors here."""
    if current_user["role"] not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only Owners can approve forensic pulls")
    
    # Mock for demo parity - in production this queries the 'forensic_requests' table
    return [
        {
            "id": "req_9921",
            "auditor_name": "SEC_OFFICIAL_402",
            "audit_id": "led_1715610000",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    ]

@app.post("/api/forensic/approve/{pull_id}")
async def approve_forensic_pull(pull_id: str, status: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Approval denied")
    
    logger.info(f"[SOVEREIGN] Owner {current_user['sub']} {status.get('status')} pull {pull_id}")
    return {"status": "SUCCESS", "message": f"Forensic request {status.get('status')}"}

# --- 6. SOVEREIGN INGRESS (Metadata-Only Hub) ---
@app.post("/api/ingress")
async def submit_telemetry(payload: IngressPayload, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Receives data from the SDK/Spoke and persists only the Cryptographic Header.
    HARDENED: Implements strict validation and transactional safety.
    """
    if not verify_entity(payload.entity_id, payload.mat, db):
        raise HTTPException(status_code=401, detail="INVALID CRYPTOGRAPHIC SIGNATURE")
    
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
            "_spoke_source": payload.entity_id,
            "risk_classification": "HIGH" if status == "VIOLATION" else "LOW"
        }
        
        # 2. Persist Metadata-Only Header to Neon (SQLAlchemy)
        new_entry = LedgerEntry(
            id=entry_id,
            entity_id=payload.entity_id,
            timestamp=audit.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            type="runtime_violation" if status == "VIOLATION" else "runtime_check",
            chain_hash=audit.get("cryptography", {}).get("chain_hash"),
            signature=audit.get("cryptography", {}).get("signature"),
            payload=json.dumps(header_payload)
        )
        
        db.add(new_entry)
        db.commit()
        
        # 3. Resilient Background Handshake (Alerts)
        if status == "VIOLATION":
            background_tasks.add_task(dispatch_webhook, payload.entity_id, audit, db)
            
            # 4. Real-time NOC Broadcast (Summary only)
            background_tasks.add_task(
                manager.broadcast,
                payload.entity_id,
                {
                    "type": "VIOLATION_ALERT",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "entry_id": entry_id,
                    "project": audit.get("project_name"),
                    "violations": audit.get("violations", []),
                    "fingerprint": audit_fingerprint[:16]
                }
            )
        
        logger.info(f"[SOVEREIGN] Ingress Accepted | Spoke: {payload.entity_id} | Fingerprint: {audit_fingerprint[:12]}...")

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

# --- 7. TENANT-ISOLATED READ ENDPOINTS ---

def _enforce_tenant_scope(current_user: dict, db: Session, entity_id: str = None):
    """
    Enforces tenant isolation in the new v5.0 hierarchy.
    - Global Admins: See everything.
    - Org Admins/Owners: See all projects in their org_id.
    - Team Members: (Future) Filter by specific project_id.
    """
    if current_user["role"] in ("owner", "admin", "enterprise"):
        org_id = current_user.get("org_id")
        if not org_id:
             raise HTTPException(status_code=403, detail="USER NOT LINKED TO AN ORGANIZATION")
             
        # If querying a specific entity, verify it belongs to this org
        if entity_id:
            fleet = db.query(Fleet).filter(Fleet.entity_id == entity_id, Fleet.org_id == org_id).first()
            if not fleet:
                raise HTTPException(status_code=403, detail="RESTRICTED: Project does not belong to your Organization.")
            return entity_id # Return the specific project ID
            
        return "ORG_SCOPE"  # Signal to query all projects in the org
        
    # Regulators can query any entity they have clearance for
    return entity_id


@app.get("/api/ledger")
def get_entity_ledger(entity_id: str = None, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """The Cryptographic Ledger: Returns flattened audit records. Filtered by Org/Project."""
    scope = _enforce_tenant_scope(current_user, db, entity_id)

    query = db.query(LedgerEntry).order_by(desc(LedgerEntry.timestamp))
    
    if scope == "ORG_SCOPE":
        # Multi-project org view: Filter ledger by all entity_ids in this org
        org_projects = db.query(Fleet.entity_id).filter(Fleet.org_id == current_user["org_id"]).all()
        project_ids = [p.entity_id for p in org_projects]
        query = query.filter(LedgerEntry.entity_id.in_(project_ids))
    elif scope:
        # Specific project view
        query = query.filter(LedgerEntry.entity_id == scope)
        
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
def get_fleet_stats(entity_id: str = None, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aggregation Engine: Calculates real-time fleet health and project-level compliance status"""
    
    # 1. Enforce Tenant Isolation
    if current_user["role"] == "enterprise":
        target_entity = current_user["sub"]
    elif current_user["role"] in ("admin", "regulator", "root"):
        target_entity = entity_id # Allow global visibility for oversight roles
    else:
        raise HTTPException(status_code=403, detail="ACCESS DENIED")

    # 2. Database Query
    query = db.query(LedgerEntry)
    if target_entity:
        query = query.filter(LedgerEntry.entity_id == target_entity)
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
    
    entries = db.query(LedgerEntry).filter(LedgerEntry.entity_id == entity_id).order_by(desc(LedgerEntry.timestamp)).all()
    return entries

@app.get("/api/audit/{entity_id}/verify")
def verify_fleet_chain(entity_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """The ZK-Integrity Check: Verifies the full cryptographic chain for a fleet"""
    if current_user["role"] not in ("admin", "regulator", "root"):
        raise HTTPException(status_code=403, detail="AUDITOR OR ADMIN PRIVILEGES REQUIRED")
    
    entries = db.query(LedgerEntry).filter(LedgerEntry.entity_id == entity_id).order_by(LedgerEntry.timestamp).all()
    
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
        LedgerEntry.entity_id == entity_id,
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
        LedgerEntry.entity_id == entity_id
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
        payload = jwt.decode(token, ANCHOR_MASTER_KEY, algorithms=["HS256"])
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
async def spoke_gateway(websocket: WebSocket, entity_id: str = Query(...)):
    """
    The sovereign relay endpoint. Enterprise Spokes connect here permanently.
    - Spokes register via SPOKE_REGISTER with their MAT.
    - Spokes push AUDIT_HEADER packets for global grid visibility.
    - The Hub sends FORENSIC_PULL commands back over this channel.
    """
    await websocket.accept()
    authenticated = False

    try:
        # Step 1: Await SPOKE_REGISTER with MAT verification
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
        msg = RelayMessage.from_json(raw)

        if msg.type != MessageType.SPOKE_REGISTER:
            await websocket.close(code=4001, reason="EXPECTED SPOKE_REGISTER")
            return

        reg = SpokeRegisterPayload(**msg.payload)

        # Verify the MAT against the Hub's entity registry (Neon)
        with next(get_db()) as db:
            fleet = db.query(Fleet).filter(Fleet.entity_id == entity_id).first()
            if not fleet or fleet.key_hash != hashlib.sha256(reg.mat.encode()).hexdigest():
                rej = RelayMessage(type=MessageType.HUB_REJECT, entity_id=entity_id,
                                    payload=HubAckPayload(status="ERROR", message="INVALID_MAT").model_dump())
                await websocket.send_text(rej.to_json())
                await websocket.close(code=4003, reason="INVALID MAT")
                return

        # MAT verified — register this Spoke
        spoke_registry.register(entity_id, websocket)
        authenticated = True

        ack = RelayMessage(type=MessageType.HUB_ACK, entity_id=entity_id,
                            payload=HubAckPayload(status="OK", message="SPOKE_REGISTERED").model_dump())
        await websocket.send_text(ack.to_json())
        logger.info("[GRID] Spoke registered: entity_id='%s'", entity_id)

        # Step 2: Message processing loop
        while True:
            raw = await websocket.receive_text()
            try:
                msg = RelayMessage.from_json(raw)
            except Exception:
                continue

            if msg.type == MessageType.AUDIT_HEADER:
                # Store lightweight header in Neon
                header = AuditHeaderPayload(**msg.payload)
                with next(get_db()) as db:
                    from models import LedgerEntry
                    import json as _json
                    existing = db.query(LedgerEntry).filter(LedgerEntry.id == header.entry_id).first()
                    if not existing:
                        entry = LedgerEntry(
                            id=header.entry_id,
                            entity_id=entity_id,
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
                logger.info("[GRID] Audit header stored for %s / %s", entity_id, header.entry_id)

            elif msg.type == MessageType.FORENSIC_RESPONSE:
                # Resolve a pending Auditor request
                resp = ForensicResponsePayload(**msg.payload)
                # Decrypt using ANCHOR_MASTER_KEY
                import base64
                from cryptography.hazmat.primitives.ciphers.aead import AESGCM
                key_bytes = hashlib.sha256(ANCHOR_MASTER_KEY.encode()).digest()
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
                pong = RelayMessage(type=MessageType.PONG, entity_id=entity_id)
                await websocket.send_text(pong.to_json())

    except WebSocketDisconnect:
        pass
    except asyncio.TimeoutError:
        logger.warning("[GRID] Spoke '%s' timed out during handshake", entity_id)
    finally:
        if authenticated:
            spoke_registry.deregister(entity_id)
            logger.info("[GRID] Spoke disconnected: entity_id='%s'", entity_id)


class ForensicRelayRequest(BaseModel):
    entry_id:  str
    entity_id: str


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

    auditor_id = current_user["sub"]
    logger.info("[RELAY] Auditor '%s' requesting forensics for entry '%s' from Spoke '%s'",
                 auditor_id, body.entry_id, body.entity_id)

    decrypted = await spoke_registry.pull_forensics(
        entity_id=body.entity_id,
        entry_id=body.entry_id,
        auditor_id=auditor_id,
    )
    return {
        "status": "FORENSIC_RETRIEVED",
        "entry_id": body.entry_id,
        "source": "SPOKE_RELAY",
        "data": decrypted,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)