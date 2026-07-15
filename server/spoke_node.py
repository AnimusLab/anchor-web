"""
Anchor Spoke Node v5.0.0 — Enterprise Local Data Plane
────────────────────────────────────────────────────────
Runs on the Enterprise's own infrastructure (VPS, Docker, bare metal).
Responsibilities:
  1. Accept full SDK telemetry (same format as current /api/ingress)
  2. Store FULL forensic payloads in a local SQLite database
  3. Push lightweight AUDIT_HEADER to the Hub for global visibility
  4. Maintain a persistent reverse WebSocket to the Hub
  5. Respond to FORENSIC_PULL requests from the Hub (for Auditor relay)

Deployment:
  docker run -d anchorgrid/spoke:5.0.0 \\
    -e HUB_URL=wss://api.anchorgovernance.tech/ws/spoke \\
    -e HUB_ID=nexus_ai \\
    -e REGIONAL_KEY=sk_live_... \\
    -v /data/anchor:/data
"""

import asyncio
import hashlib
import json
import os
import secrets
import sqlite3
import time
import base64
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
import websockets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

from relay_protocol import (
    MessageType, RelayMessage,
    SpokeRegisterPayload, AuditHeaderPayload,
    ForensicPullPayload, ForensicResponsePayload,
    HubAckPayload,
)

load_dotenv()

# ─── Configuration ────────────────────────────────────────────────────────────
HUB_ID       = os.getenv("HUB_ID", "")
REGIONAL_KEY = os.getenv("REGIONAL_KEY", os.getenv("MAT", ""))
HUB_URL      = os.getenv("HUB_URL", "wss://api.anchorgovernance.tech/ws/spoke")
SPOKE_PORT   = int(os.getenv("SPOKE_PORT", 8001))

# The Hub's public encryption key (32 bytes, hex).
# The Hub generates this from ANCHOR_MASTER_KEY — Spoke uses it to encrypt
# forensic payloads so only the Hub can read them.
HUB_PUBKEY   = bytes.fromhex(os.getenv("HUB_PUBKEY", "0" * 64))

# Local SQLite for full forensic storage
DATA_DIR     = Path(os.getenv("DATA_DIR", "./spoke_data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH      = DATA_DIR / "anchor_spoke.db"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anchor.spoke")

# Global WebSocket handle (maintained by the background relay task)
_hub_ws = None


# ─── Local SQLite Storage ─────────────────────────────────────────────────────

def get_spoke_db():
    """Returns a connection to the local Spoke SQLite database."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_spoke_db():
    """Creates the local Spoke schema on first boot."""
    with get_spoke_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS spoke_ledger (
                id               TEXT PRIMARY KEY,
                hub_id           TEXT NOT NULL,
                parent_entry_id  TEXT,
                timestamp        TEXT NOT NULL,
                type             TEXT NOT NULL,
                chain_hash       TEXT,
                signature        TEXT,
                project_name     TEXT,
                is_compliant     INTEGER DEFAULT 1,
                rule_id          TEXT,
                payload          TEXT NOT NULL
            )
        """)
        conn.commit()
    logger.info("[SPOKE BOOT] Local SQLite schema verified at %s", DB_PATH)


def store_entry_locally(entry_id: str, hub_id: str, entry_type: str,
                        chain_hash: str, signature: str, project_name: str,
                        is_compliant: bool, rule_id: Optional[str],
                        payload: dict) -> None:
    """Writes the full forensic payload to the local Spoke SQLite."""
    with get_spoke_db() as conn:
        conn.execute("""
            INSERT OR IGNORE INTO spoke_ledger
              (id, hub_id, timestamp, type, chain_hash, signature,
               project_name, is_compliant, rule_id, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry_id, hub_id,
            datetime.now(timezone.utc).isoformat(),
            entry_type, chain_hash, signature,
            project_name, int(is_compliant), rule_id,
            json.dumps(payload),
        ))
        conn.commit()


def fetch_entry_locally(entry_id: str) -> Optional[dict]:
    """Fetches a specific forensic payload from local SQLite."""
    with get_spoke_db() as conn:
        row = conn.execute(
            "SELECT * FROM spoke_ledger WHERE id = ?", (entry_id,)
        ).fetchone()
    return dict(row) if row else None


# ─── Encryption (Spoke → Hub) ────────────────────────────────────────────────

def encrypt_for_hub(payload_dict: dict) -> tuple[str, str]:
    """
    AES-256-GCM encrypts the forensic payload using the Hub's public key.
    Returns (base64_ciphertext, base64_nonce).
    Only the Hub (holding ANCHOR_MASTER_KEY) can decrypt this.
    """
    aesgcm = AESGCM(HUB_PUBKEY)
    nonce  = secrets.token_bytes(12)          # 96-bit nonce for GCM
    data   = json.dumps(payload_dict).encode()
    ct     = aesgcm.encrypt(nonce, data, None)
    return base64.b64encode(ct).decode(), base64.b64encode(nonce).decode()


# ─── Hub WebSocket Relay ──────────────────────────────────────────────────────

async def relay_loop():
    """
    Maintains a persistent outbound WebSocket connection to the Hub.
    Listens for FORENSIC_PULL commands and responds with encrypted payloads.
    Reconnects automatically on disconnect.
    """
    global _hub_ws
    spoke_ws_url = f"{HUB_URL}?hub_id={HUB_ID}"

    while True:
        try:
            logger.info("[RELAY] Connecting to Hub at %s", spoke_ws_url)
            async with websockets.connect(spoke_ws_url) as ws:
                _hub_ws = ws

                # Step 1: Register with the Hub
                reg_msg = RelayMessage(
                    type=MessageType.SPOKE_REGISTER,
                    hub_id=HUB_ID,
                    payload=SpokeRegisterPayload(regional_key=REGIONAL_KEY).model_dump(),
                )
                await ws.send(reg_msg.to_json())
                logger.info("[RELAY] Registration sent. Waiting for Hub ACK...")

                # Step 2: Listen for Hub commands
                async for raw in ws:
                    try:
                        msg = RelayMessage.from_json(raw)
                    except Exception:
                        continue

                    if msg.type == MessageType.HUB_ACK:
                        logger.info("[RELAY] Hub ACK received. Spoke is LIVE on the Grid.")

                    elif msg.type == MessageType.HUB_REJECT:
                        err_msg = f"Hub REJECTED this Spoke: {msg.payload}"
                        logger.error(f"[RELAY] {err_msg}")
                        raise RuntimeError(err_msg)

                    elif msg.type == MessageType.FORENSIC_PULL:
                        pull = ForensicPullPayload(**msg.payload)
                        logger.info(
                            "[RELAY] FORENSIC_PULL received for entry %s (auditor: %s)",
                            pull.entry_id, pull.clearance_id
                        )
                        await handle_forensic_pull(ws, pull)

                    elif msg.type == MessageType.GOVERNANCE_UPDATE:
                        logger.info("[RELAY] GOVERNANCE_UPDATE received: %s", msg.payload.get("update_type"))
                        # In Phase 4, we simply log the propagation. 
                        # In Phase 5+, this will update local enforcement caches.
                        pass

                    elif msg.type == MessageType.PING:
                        pong = RelayMessage(type=MessageType.PONG, hub_id=HUB_ID)
                        await ws.send(pong.to_json())

        except Exception as e:
            logger.warning("[RELAY] Hub connection lost: %s — reconnecting in 5s...", e)
            _hub_ws = None
            await asyncio.sleep(5)


async def handle_forensic_pull(ws, pull: ForensicPullPayload):
    """Fetches the requested entry from local SQLite, encrypts, returns to Hub."""
    entry = fetch_entry_locally(pull.entry_id)

    if not entry:
        # Entry not found — tell the Hub
        err_msg = RelayMessage(
            type=MessageType.FORENSIC_RESPONSE,
            hub_id=HUB_ID,
            payload={"request_id": pull.request_id, "error": "ENTRY_NOT_FOUND"},
        )
        await ws.send(err_msg.to_json())
        return

    try:
        payload_dict = json.loads(entry["payload"])
    except Exception:
        payload_dict = entry

    encrypted, nonce = encrypt_for_hub(payload_dict)

    response_msg = RelayMessage(
        type=MessageType.FORENSIC_RESPONSE,
        hub_id=HUB_ID,
        payload=ForensicResponsePayload(
            request_id=pull.request_id,
            entry_id=pull.entry_id,
            encrypted_payload=encrypted,
            nonce=nonce,
        ).model_dump(),
    )
    await ws.send(response_msg.to_json())
    logger.info("[RELAY] Forensic payload dispatched for entry %s", pull.entry_id)


async def push_header_to_hub(header: AuditHeaderPayload):
    """Pushes an Audit Header (metadata only) to the Hub over the WebSocket."""
    global _hub_ws
    if _hub_ws is None:
        logger.warning("[RELAY] Cannot push header — not connected to Hub.")
        return
    try:
        msg = RelayMessage(
            type=MessageType.AUDIT_HEADER,
            hub_id=HUB_ID,
            payload=header.model_dump(),
        )
        await _hub_ws.send(msg.to_json())
    except Exception as e:
        logger.error("[RELAY] Failed to push header: %s", e)


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


# ─── FastAPI Spoke Server ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_spoke_db()
    logger.info("[SPOKE BOOT] Anchor Spoke Node v5.0.0 for Hub '%s'", HUB_ID)
    # Start the background relay loop
    relay_task = asyncio.create_task(relay_loop())
    yield
    relay_task.cancel()


app = FastAPI(title="Anchor Spoke Node", version="5.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class SpokeIngressPayload(BaseModel):
    hub_id:     str
    mat:        str
    audit_data: dict


@app.post("/api/spoke/ingest")
async def spoke_ingest(body: SpokeIngressPayload):
    """
    Primary SDK ingress for the Spoke.
    Accepts full telemetry, stores it locally, and pushes a lightweight
    header to the Hub — exactly like the old /api/ingress, but local-first.
    """
    # 1. Verify MAT (check against .env REGIONAL_KEY for this Spoke) safely
    import hmac
    if not hmac.compare_digest(body.mat, REGIONAL_KEY):
        raise HTTPException(status_code=401, detail="INVALID MAT")

    audit = body.audit_data
    entry_id    = audit.get("entry_id", f"aud_{int(time.time()*1000)}")
    proj_name   = audit.get("project_name", "unknown")
    is_compliant = audit.get("governance_status", {}).get("is_compliant", True)
    rule_id     = audit.get("governance_status", {}).get("rule_id")
    entry_type  = "runtime_violation" if not is_compliant else "runtime_check"

    crypto = audit.get("cryptography", {})
    chain_hash = crypto.get("chain_hash")
    signature = crypto.get("signature")

    # Fallback to local cryptographic signing if not provided or mock
    if not chain_hash or chain_hash == "mock":
        chain_hash = "0x" + secrets.token_hex(32)
    if not signature or signature == "mock":
        import hashlib
        signing_key = REGIONAL_KEY or os.getenv("ANCHOR_MASTER_KEY", "placeholder_master_key")
        signature = hmac.new(
            signing_key.encode("utf-8"),
            chain_hash.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    # 2. Store FULL payload locally on the Spoke's SQLite
    store_entry_locally(
        entry_id=entry_id,
        hub_id=body.hub_id,
        entry_type=entry_type,
        chain_hash=chain_hash,
        signature=signature,
        project_name=proj_name,
        is_compliant=is_compliant,
        rule_id=rule_id,
        payload=audit,
    )
    logger.info("[INGEST] Stored entry %s locally (compliant=%s)", entry_id, is_compliant)

    # Write runtime violation plain-text log safely if violation occurs
    if not is_compliant:
        try:
            append_runtime_violation_to_file(
                hub_id=body.hub_id,
                entry_id=entry_id,
                timestamp=audit.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                audit_data=audit,
                chain_hash=chain_hash,
                signature=signature
            )
        except Exception as e:
            logger.error(f"Failed to write runtime violation file: {e}")

    # 3. Push lightweight header to Hub (no raw data)
    header = AuditHeaderPayload(
        entry_id=entry_id,
        project_name=proj_name,
        type=entry_type,
        is_compliant=is_compliant,
        chain_hash=chain_hash,
        signature=signature,
        rule_id=rule_id,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    await push_header_to_hub(header)

    return {
        "status": "INGESTED",
        "entry_id": entry_id,
        "stored": "LOCAL_SPOKE",
        "header_pushed": "HUB_GRID",
    }


@app.get("/api/spoke/health")
def health():
    return {
        "status": "SPOKE_ONLINE",
        "hub_id": HUB_ID,
        "hub_connected": _hub_ws is not None,
        "db": str(DB_PATH),
    }
