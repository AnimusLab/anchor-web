import json
import os
import sys
import hmac
import hashlib
import time
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
from logging.config import fileConfig
import logging
from tenacity import retry, stop_after_attempt, wait_exponential
from sqlalchemy.orm import Session
from models import Fleet, WebhookSubscription, LedgerEntry
from security import decrypt_secret

# Hardcoded path for v5.0.0 hardening mission
ANCHOR_ROOT = "d:\\Anchor"
if ANCHOR_ROOT not in sys.path:
    sys.path.insert(0, ANCHOR_ROOT)

from anchor.runtime.models import AuditEntry

# --- 1. CONFIGURE LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anchor.dispatcher")

# --- 2. HMAC SIGNING LOGIC ---
def calculate_signature(message: str, secret: str) -> str:
    """Computes HMAC-SHA256 signature for non-repudiation"""
    return hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

# --- 3. RESILIENT ASYNC DISPATCHER ---
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    before_sleep=lambda retry_state: logger.info(f"[RETRY] Dispatch failed, attempt {retry_state.attempt_number}...")
)
async def send_regional_webhook(url: str, secret: str, payload: dict):
    timestamp = str(int(time.time()))
    payload_str = json.dumps(payload)
    
    # Anchor Handshake: {timestamp}.{payload}
    signature = calculate_signature(f"{timestamp}.{payload_str}", secret)
    
    headers = {
        "Content-Type": "application/json",
        "X-Anchor-Signature": signature,
        "X-Anchor-Timestamp": timestamp,
        "User-Agent": "Anchor-Web-Dispatcher/5.0.0"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response

def _log_receipt(db: Session, parent_entry_id: str, status: str, response_body: str = None):
    """
    Forensic Proof of Notification: Logs the result of a regulatory alert dispatch
    to the SQLAlchemy ledger as a non-repudiable receipt.
    """
    receipt = LedgerEntry(
        id=f"rec_{int(time.time()*1000)}",
        entity_id=None,
        parent_entry_id=parent_entry_id,
        timestamp=datetime.utcnow().isoformat(),
        type="notification_receipt",
        payload=json.dumps({
            "status": status,
            "response_preview": response_body[:255] if response_body else None,
            "logged_at": datetime.utcnow().isoformat()
        })
    )
    db.add(receipt)
    db.commit()

async def dispatch_webhook(entity_id: str, audit_dict: dict, db: Session):
    """
    Orchestrates the Multi-Dialect "Handshake" (Phase 7).
    Translates the internal truth into regional regulatory dialects and fires signed alerts.
    """
    logger.info(f"[DISPATCH] Processing violation for {entity_id}")
    
    # 1. Fetch Fleet and ALL regional subscriptions
    fleet = db.query(Fleet).filter(Fleet.entity_id == entity_id).first()
    if not fleet or not fleet.subscriptions:
        logger.warning(f"[DISPATCH] No active subscriptions for {entity_id}")
        return

    # 2. Reconstruct AuditEntry to use the Dialect Factory
    p = audit_dict.get("primitives", {})
    entry = AuditEntry(
        action=p.get("action", "unknown"),
        object=p.get("object", "unknown"),
        context=p.get("context", "unknown"),
        authority=p.get("authority", "unknown"),
        flow=p.get("flow", "unknown"),
        entry_id=audit_dict.get("entry_id"),
        timestamp=audit_dict.get("timestamp"),
        project_name=audit_dict.get("project_name", "N/A"),
        git_commit=audit_dict.get("git_commit", "N/A"),
        status=audit_dict.get("governance_status", {}).get("status", "VIOLATION"),
        rule_id=audit_dict.get("governance_status", {}).get("rule_id"),
        findings_hash=audit_dict.get("cryptography", {}).get("findings_hash", ""),
        chain_hash=audit_dict.get("cryptography", {}).get("chain_hash", ""),
        signature=audit_dict.get("cryptography", {}).get("signature", ""),
        telemetry=audit_dict.get("telemetry", {})
    )

    # 3. Fire regional webhooks
    for sub in fleet.subscriptions:
        if not sub.is_active:
            continue
            
        logger.info(f"[DISPATCH] Target: {sub.branch_name} ({sub.dialect}) -> {sub.webhook_url}")
        
        try:
            # Decrypt regional secret from Vault
            secret = decrypt_secret(sub.webhook_secret)
            
            # Translate to regional dialect
            regional_payload = entry.to_dialect(sub.dialect)
            
            # Dispatch
            response = await send_regional_webhook(sub.webhook_url, secret, regional_payload)
            logger.info(f"[DISPATCH] Success for {sub.branch_name}")
            _log_receipt(db, audit_dict.get("entry_id"), f"DELIVERED:{sub.branch_name}", response.text)
            
        except Exception as e:
            logger.error(f"[ERROR] Final dispatch failure for {sub.branch_name}: {str(e)}")
            _log_receipt(db, audit_dict.get("entry_id"), f"FAILED:{sub.branch_name}")
