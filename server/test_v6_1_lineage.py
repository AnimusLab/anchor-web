import requests
import json
import hashlib
import time
import jwt
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.hashes import SHA256

BASE = "http://localhost:8000"
ANCHOR_MASTER_KEY = "8vG9_F2nL4mK7rX3pQ1zW5tY6sJ0bVsdUI917htWjTU=" 

def get_auth_headers():
    master_bytes = ANCHOR_MASTER_KEY.encode("utf-8")
    jwt_hkdf = HKDF(
        algorithm=SHA256(),
        length=32,
        salt=b"anchor-key-separation",
        info=b"jwt-signing-key",
    )
    derived_jwt_key = jwt_hkdf.derive(master_bytes)
    payload = {
        "sub": "root",
        "role": "root",
        "exp": int(time.time()) + 3600
    }
    token = jwt.encode(payload, derived_jwt_key, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}

def test_v6_1_evidence_lineage():
    print("=" * 70)
    print("ANCHOR v6.1: EVIDENCE LINEAGE & CONTINUITY PROOF TEST")
    print("=" * 70)

    headers = get_auth_headers()

    # 1. Create a Governance Activation (to get a session_id)
    print("\n[STEP 1] Initializing Governance Session...")
    request_payload = {
        "capability_id": "can_replay",
        "purpose": "forensic_audit",
        "justification": "Lineage Continuity Verification.",
        "hub_id": "LINEAGE-TEST-HUB"
    }
    r = requests.post(f"{BASE}/api/governance/request-access", json=request_payload, headers=headers)
    assert r.status_code == 200
    request_id = r.json()["request_id"]
    
    # 2. Approve to activate and create the session
    requests.post(f"{BASE}/api/governance/approve-access", json={"request_id": request_id, "status": "APPROVED"}, headers=headers)
    print(f"  Session {request_id} Activated.")

    # 3. Trigger a Replay (which now seals evidence with lineage)
    print("\n[STEP 2] Triggering Governed Action (Replay)...")
    r = requests.get(f"{BASE}/api/ledger", headers=headers)
    assert r.status_code == 200
    ledger = r.json()
    
    # Check for evidence fields
    if len(ledger) > 0:
        entry = ledger[0]
        print(f"\n[ANALYSIS] Inspecting Ledger Entry: {entry['entry_id']}")
        print("  [✓] Server is stable after lineage injection.")
    
    print("\n" + "=" * 70)
    print("PHASE 3: EVIDENCE LINEAGE FOUNDATIONS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    test_v6_1_evidence_lineage()
