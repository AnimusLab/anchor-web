"""
anchor-web/server/master_config.py

Master Config — Auditor registry backed by an AES-256-GCM encrypted JSON file.

Schema:
  {
    "auditors": {
      "SEC-JOHNDOE-2604": {
        "entity_id":      "SEC-JOHNDOE-2604",
        "display_name":   "John Doe",
        "email_hash":     "sha256(lowercase email)",
        "regulator":      "SEC",
        "access_level":   "READ_ONLY",
        "totp_secret":    "base32-encoded TOTP secret (encrypted at rest)",
        "provisioned_at": "2026-04-13T00:00:00Z",
        "provisioned_by": "root",
        "status":         "ACTIVE",
        "last_login":     null,
        "session_count":  0
      }
    },
    "_meta": {
      "version": 1,
      "last_modified": "2026-04-13T00:00:00Z"
    }
  }

The file is AES-256-GCM encrypted at rest.
The ANCHOR_MASTER_KEY env var is used as the key (SHA-256 derived to 32 bytes).
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import secrets
from datetime import datetime, timezone
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "master_config.enc")
_MASTER_KEY  = os.getenv("ANCHOR_MASTER_KEY", "")


def _derive_key() -> bytes:
    """Derives a 32-byte AES key from ANCHOR_MASTER_KEY via SHA-256."""
    if not _MASTER_KEY:
        raise RuntimeError("ANCHOR_MASTER_KEY is not set in environment.")
    return hashlib.sha256(_MASTER_KEY.encode()).digest()


# ---------------------------------------------------------------------------
# Encryption / Decryption
# ---------------------------------------------------------------------------

def _encrypt(plaintext: bytes) -> bytes:
    """AES-256-GCM encrypt. Returns nonce (12 bytes) + ciphertext."""
    key    = _derive_key()
    nonce  = secrets.token_bytes(12)
    aesgcm = AESGCM(key)
    ct     = aesgcm.encrypt(nonce, plaintext, None)
    return base64.b64encode(nonce + ct)


def _decrypt(data: bytes) -> bytes:
    """AES-256-GCM decrypt. Expects base64(nonce + ciphertext)."""
    key    = _derive_key()
    raw    = base64.b64decode(data)
    nonce  = raw[:12]
    ct     = raw[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ct, None)


# ---------------------------------------------------------------------------
# Load / Save
# ---------------------------------------------------------------------------

def _empty_config() -> dict:
    return {
        "auditors": {},
        "_meta": {
            "version": 1,
            "last_modified": _now(),
        },
    }


def load_config() -> dict:
    """Reads and decrypts master_config.enc. Returns {} skeleton if missing."""
    if not os.path.exists(_CONFIG_PATH):
        return _empty_config()
    try:
        with open(_CONFIG_PATH, "rb") as f:
            raw = f.read()
        plain = _decrypt(raw)
        return json.loads(plain)
    except Exception as e:
        raise RuntimeError(f"[MasterConfig] Failed to load config: {e}")


def save_config(config: dict) -> None:
    """Encrypts and writes master_config.enc."""
    config["_meta"]["last_modified"] = _now()
    plain = json.dumps(config, indent=2).encode()
    encrypted = _encrypt(plain)
    with open(_CONFIG_PATH, "wb") as f:
        f.write(encrypted)


# ---------------------------------------------------------------------------
# Entity ID Generation
# ---------------------------------------------------------------------------

REGULATORS = {"SEC", "RBI", "SEBI", "FCA", "CFPB", "EU", "NIST", "FINOS"}


def generate_entity_id(display_name: str, regulator: str, config: dict) -> str:
    """
    Generates a human-readable, collision-safe entity ID.
    Format: {REGULATOR}-{FIRSTNAMELASTNAME}-{DDMM}
    e.g.  SEC-JOHNDOE-2604
    """
    reg    = regulator.upper().replace(" ", "")
    parts  = display_name.strip().upper().split()
    name   = "".join(p for p in parts if p.isalpha())[:12]  # max 12 chars
    ddmm   = datetime.now(timezone.utc).strftime("%d%m")
    base   = f"{reg}-{name}-{ddmm}"

    existing_ids = set(config.get("auditors", {}).keys())
    candidate    = base
    counter      = 2
    while candidate in existing_ids:
        candidate = f"{base}-{counter}"
        counter  += 1
    return candidate


# ---------------------------------------------------------------------------
# Auditor CRUD
# ---------------------------------------------------------------------------

def email_hash(email: str) -> str:
    """SHA-256 of normalised email. Never store raw email."""
    return hashlib.sha256(email.strip().lower().encode()).hexdigest()


def provision_auditor(
    display_name: str,
    email: str,
    regulator: str,
    access_level: str = "READ_ONLY",
    provisioned_by: str = "root",
) -> dict:
    """
    Provisions a new auditor. Generates entity_id + TOTP secret.
    Returns the full auditor record INCLUDING the raw TOTP secret
    (shown once to admin for QR code display, then never again).
    """
    import pyotp  # lazy import — not needed at server startup

    config     = load_config()
    entity_id  = generate_entity_id(display_name, regulator, config)
    raw_secret = pyotp.random_base32()   # TOTP secret — shown once, not stored raw

    record = {
        "entity_id":      entity_id,
        "display_name":   display_name,
        "email_hash":     email_hash(email),
        "regulator":      regulator.upper(),
        "access_level":   access_level,
        "totp_secret":    raw_secret,    # encrypted implicitly by save_config
        "provisioned_at": _now(),
        "provisioned_by": provisioned_by,
        "status":         "ACTIVE",
        "last_login":     None,
        "session_count":  0,
    }

    config["auditors"][entity_id] = record
    save_config(config)

    # Return a copy with the raw secret for QR display (caller discards after showing)
    return dict(record)


def lookup_auditor(entity_id: str, provided_email: str) -> Optional[dict]:
    """
    Looks up an auditor by entity_id + email hash.
    Returns the auditor record if found and ACTIVE, else None.
    """
    config  = load_config()
    record  = config.get("auditors", {}).get(entity_id)
    if not record:
        return None
    if record.get("status") != "ACTIVE":
        return None
    if record.get("email_hash") != email_hash(provided_email):
        return None
    return record


def get_auditor(entity_id: str) -> Optional[dict]:
    """Returns an auditor record by entity_id only (admin use)."""
    config = load_config()
    return config.get("auditors", {}).get(entity_id)


def revoke_auditor(entity_id: str) -> bool:
    """Sets an auditor's status to REVOKED."""
    config = load_config()
    if entity_id not in config.get("auditors", {}):
        return False
    config["auditors"][entity_id]["status"] = "REVOKED"
    save_config(config)
    return True


def list_auditors() -> list[dict]:
    """Returns all auditor records (without totp_secret for safety)."""
    config = load_config()
    result = []
    for record in config.get("auditors", {}).values():
        safe = {k: v for k, v in record.items() if k != "totp_secret"}
        result.append(safe)
    return result


# ---------------------------------------------------------------------------
# Session Logging (append-only digital footprint)
# ---------------------------------------------------------------------------

_SESSION_LOG = os.path.join(os.path.dirname(__file__), "session_log.jsonl")


def log_session_start(entity_id: str, ip: str, user_agent: str) -> str:
    """Creates a new session log entry. Returns the session_id."""
    session_id = f"sess_{secrets.token_hex(8)}"
    entry = {
        "session_id":   session_id,
        "entity_id":    entity_id,
        "approved_at":  _now(),
        "ip":           ip,
        "user_agent":   user_agent,
        "terminated_at": None,
        "duration_min":  None,
    }
    _append_log(entry)

    # Update last_login + session_count in config
    try:
        config = load_config()
        if entity_id in config.get("auditors", {}):
            config["auditors"][entity_id]["last_login"]    = _now()
            config["auditors"][entity_id]["session_count"] = \
                config["auditors"][entity_id].get("session_count", 0) + 1
            save_config(config)
    except Exception:
        pass

    return session_id


def log_session_end(session_id: str) -> None:
    """Marks a session as terminated (best-effort — log is append-only)."""
    entry = {
        "session_id":    session_id,
        "terminated_at": _now(),
        "_event":        "SESSION_END",
    }
    _append_log(entry)


def _append_log(entry: dict) -> None:
    with open(_SESSION_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
