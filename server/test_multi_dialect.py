import json
import time
import hmac
import hashlib
import asyncio
import os
import sys
from unittest.mock import MagicMock, patch

# Add both repo roots to sys.path
anchor_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Anchor"))
server_root = os.path.abspath(os.path.dirname(__file__))

print(f"[DEBUG] Anchor Root: {anchor_root}")
print(f"[DEBUG] Server Root: {server_root}")

sys.path.append(anchor_root)
sys.path.append(server_root)

print(f"[DEBUG] sys.path: {sys.path}")

from dispatch_manager import dispatch_webhook
from security import encrypt_secret
class WebhookSubscription:
    def __init__(self, id, branch_name, webhook_url, webhook_secret, dialect, is_active=True):
        self.id = id
        self.branch_name = branch_name
        self.webhook_url = webhook_url
        self.webhook_secret = webhook_secret
        self.dialect = dialect
        self.is_active = is_active

class Fleet:
    def __init__(self, entity_id, name, webhook_url=None, webhook_secret=None, subscriptions=None):
        self.entity_id = entity_id
        self.name = name
        self.webhook_url = webhook_url
        self.webhook_secret = webhook_secret
        self.subscriptions = subscriptions or []

async def test_multi_dialect_logic():
    print("\n[PHASE 7 TEST] Universal Regulatory Translator Verification")
    
    # 1. Setup Mock Database
    entity_id = "ent_gs_global"
    
    # Mumbai Subscription (RBI Dialect)
    mumbai_secret = "mumbai-top-secret-789"
    mumbai_sub = WebhookSubscription(
        id="sub_mumbai",
        branch_name="Mumbai-NOC",
        webhook_url="https://rbi.internal/inbox",
        webhook_secret=encrypt_secret(mumbai_secret),
        dialect="RBI",
        is_active=True
    )
    
    # NYC Subscription (SEC Dialect)
    nyc_secret = "nyc-private-key-456"
    nyc_sub = WebhookSubscription(
        id="sub_nyc",
        branch_name="NYC-Compliane",
        webhook_url="https://sec.internal/edgar",
        webhook_secret=encrypt_secret(nyc_secret),
        dialect="SEC",
        is_active=True
    )
    
    mock_fleet = Fleet(
        entity_id=entity_id,
        name="Goldman Global",
        subscriptions=[mumbai_sub, nyc_sub]
    )
    
    mock_db = MagicMock()
    mock_db.query().filter().first.return_value = mock_fleet
    
    # 2. Mock Ingress Payload (The "Internal Truth")
    audit_dict = {
        "entry_id": "led_999",
        "timestamp": "2026-04-02T10:00:00Z",
        "project_name": "Credit-AI-v4",
        "git_commit": "abc1234",
        "primitives": {
            "action": "deny_credit",
            "object": "retail_loan_app",
            "context": "high_net_worth_india",
            "authority": "bias_interceptor_v2",
            "flow": "automated_decision_pipe"
        },
        "governance_status": {
            "status": "VIOLATION",
            "rule_id": "ETH-001"
        },
        "cryptography": {
            "findings_hash": "f67...",
            "chain_hash": "c8e...",
            "signature": "s1a..."
        },
        "telemetry": {"prompt_preview": "User zip code is 400001..."}
    }

    # 3. Intercept HTTPX calls to verify translated payloads
    dispatched_payloads = {}
    
    async def mock_post(url, json=None, headers=None, timeout=None):
        dispatched_payloads[url] = {
            "json": json,
            "headers": headers
        }
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "Success"
        return mock_resp

    print("[STEP 1] Orchestrating Multi-Dialect Dispatch...")
    
    with patch("httpx.AsyncClient.post", side_effect=mock_post):
        await dispatch_webhook(entity_id, audit_dict, mock_db)

    # 4. Verification
    print("\n[STEP 2] Verifying Regional Translation Accuracy")
    
    # Verify Mumbai (RBI)
    mumbai_data = dispatched_payloads["https://rbi.internal/inbox"]["json"]
    print(f" -> Mumbai Received: {mumbai_data['regulatory_body']} {mumbai_data['sutra_alignment']}")
    assert mumbai_data["regulatory_body"] == "RBI"
    assert "Sutra 4" in mumbai_data["sutra_alignment"]
    
    # Verify NYC (SEC)
    nyc_data = dispatched_payloads["https://sec.internal/edgar"]["json"]
    print(f" -> NYC Received: {nyc_data['regulator']} {nyc_data['form_type']}")
    assert nyc_data["regulator"] == "U.S. Securities and Exchange Commission"
    assert "8-K" in nyc_data["form_type"]

    print("\n[STEP 3] Verifying Cryptographic Non-Repudiation (HMAC Signature)")
    
    def verify_sig(payload, signature, timestamp, secret):
        msg = f"{timestamp}.{json.dumps(payload)}"
        expected = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

    # Verify Mumbai Signature
    m_head = dispatched_payloads["https://rbi.internal/inbox"]["headers"]
    m_valid = verify_sig(mumbai_data, m_head["X-Anchor-Signature"], m_head["X-Anchor-Timestamp"], mumbai_secret)
    print(f" -> Mumbai Signature: {'VALID' if m_valid else 'INVALID'}")
    
    # Verify NYC Signature
    n_head = dispatched_payloads["https://sec.internal/edgar"]["headers"]
    n_valid = verify_sig(nyc_data, n_head["X-Anchor-Signature"], n_head["X-Anchor-Timestamp"], nyc_secret)
    print(f" -> NYC Signature: {'VALID' if n_valid else 'INVALID'}")

    assert m_valid and n_valid
    print("\n[SUCCESS] Phase 7 Multi-Dialect Logic Fully Verified\n")

if __name__ == "__main__":
    import os
    os.environ["ANCHOR_MASTER_KEY"] = "W8XbtVQjzcH16o8Ay5spbNhgWcMZLgsVKC6hM5h1i_Y="
    asyncio.run(test_multi_dialect_logic())
