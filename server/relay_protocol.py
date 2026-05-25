"""
Anchor Sovereign Relay — Message Protocol v5.0.0
─────────────────────────────────────────────────
Defines the full message schema for the Hub ↔ Spoke WebSocket channel.

Design principles:
- The Hub NEVER receives raw forensic payloads over REST.
- Raw data only travels over this brokered relay, AES-256 encrypted.
- The Hub decrypts using the Vault Key (ANCHOR_MASTER_KEY) before serving.
"""

from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel
import time
import json


class MessageType(str, Enum):
    # Spoke → Hub: Spoke announces itself on first connection
    SPOKE_REGISTER    = "SPOKE_REGISTER"
    # Spoke → Hub: New audit event committed locally on the Spoke
    AUDIT_HEADER      = "AUDIT_HEADER"
    # Hub → Spoke: Auditor is requesting the full forensic payload
    FORENSIC_PULL     = "FORENSIC_PULL"
    # Spoke → Hub: Response to a FORENSIC_PULL
    FORENSIC_RESPONSE = "FORENSIC_RESPONSE"
    # Hub → Spoke: Acknowledgement (success or rejection)
    HUB_ACK           = "HUB_ACK"
    HUB_REJECT        = "HUB_REJECT"
    # Hub → Spoke: Propagate governance state (v6.1 Institutional Persistence)
    GOVERNANCE_UPDATE = "GOVERNANCE_UPDATE"
    # Either direction: Keepalive
    PING              = "PING"
    PONG              = "PONG"


class RelayMessage(BaseModel):
    """Universal envelope for all Hub ↔ Spoke messages."""
    type:      MessageType
    hub_id:    str
    timestamp: str = ""
    payload:   Optional[Any] = None

    def __init__(self, **data):
        if not data.get("timestamp"):
            data["timestamp"] = str(int(time.time()))
        super().__init__(**data)

    def to_json(self) -> str:
        return self.model_dump_json()

    @classmethod
    def from_json(cls, raw: str) -> "RelayMessage":
        return cls.model_validate_json(raw)


# ─── Payload Shapes ──────────────────────────────────────────────────────────

class SpokeRegisterPayload(BaseModel):
    """Sent by Spoke after WebSocket connection. Hub verifies Regional Key."""
    regional_key:  str   # The Sovereign Key for this Hub Silo
    spoke_version: str = "5.0.0"


class AuditHeaderPayload(BaseModel):
    """
    Metadata-only audit record. Contains NO raw payload.
    Hub stores this in Neon (tiny — ~200 bytes per entry).
    Full forensic data stays on the Spoke's local SQLite.
    """
    entry_id:     str
    project_name: str
    type:         str           # "runtime_check" | "runtime_violation"
    is_compliant: bool
    chain_hash:   str           # 0x-prefixed 64-char hex
    signature:    str
    rule_id:      Optional[str] = None
    timestamp:    str


class ForensicPullPayload(BaseModel):
    """
    Hub → Spoke: An Auditor has requested the raw forensic payload for an entry.
    The Spoke must respond with a ForensicResponsePayload.
    """
    request_id:  str   # Unique ID to correlate the async response
    entry_id:    str   # The LedgerEntry ID the Auditor wants to inspect
    clearance_id: str  # Clearance ID of the requesting Auditor (for audit trail)


class ForensicResponsePayload(BaseModel):
    """
    Spoke → Hub: The encrypted raw payload in response to a FORENSIC_PULL.
    Hub decrypts using ANCHOR_MASTER_KEY before serving to the Auditor.
    """
    request_id:        str   # Echoes the request_id from FORENSIC_PULL
    entry_id:          str
    encrypted_payload: str   # Base64-encoded AES-256-GCM ciphertext
    nonce:             str   # Base64-encoded 96-bit GCM nonce

class GovernanceUpdatePayload(BaseModel):
    """
    Hub → Spoke: Propagates a governance policy change or an active TGT.
    """
    update_type: str  # "TGT_ISSUED", "TGT_REVOKED", "POLICY_RELOAD"
    request_id: Optional[str] = None
    capability: Optional[str] = None
    requester_id: Optional[str] = None
    expires_at: Optional[str] = None
    timestamp: str = ""


class HubAckPayload(BaseModel):
    status:  str   # "OK" | "ERROR"
    message: Optional[str] = None
