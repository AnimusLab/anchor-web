import requests
import json
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

def test_v6_1_institutional_activation():
    print("=" * 70)
    print("ANCHOR v6.1: INSTITUTIONAL GOVERNANCE ACTIVATION TEST")
    print("=" * 70)

    headers = get_auth_headers()

    # 1. Request Governance Activation (The 'Intent' phase)
    print("\n[STEP 1] Auditor Requesting 'Forensic Replay' Activation...")
    request_payload = {
        "capability_id": "can_replay",
        "purpose": "incident_investigation",
        "justification": "Evaluating anomalous trade mesh execution in Project Blue-Alpha.",
        "hub_id": "MOCK-HUB-001"
    }
    r = requests.post(f"{BASE}/api/governance/request-access", json=request_payload, headers=headers)
    print(f"  POST /api/governance/request-access: {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    request_id = data["request_id"]
    print(f"  Request ID Generated: {request_id}")
    print(f"  Governance Policy Version: {data.get('policy_lineage')}")

    # 2. View Pending Queue
    print("\n[STEP 2] Admin Inspecting Activation Queue...")
    r = requests.get(f"{BASE}/api/forensic/pending", headers=headers)
    assert r.status_code == 200
    queue = r.json()
    active_req = next((item for item in queue if item["id"] == request_id), None)
    assert active_req is not None
    print(f"  Found pending request in queue. Type: {active_req['type']}")
    print(f"  Justification Verified: {active_req['justification'][:40]}...")

    # 3. Approve Activation (Delegated Authority)
    print("\n[STEP 3] Authorizing Governance Activation...")
    approve_payload = {
        "request_id": request_id,
        "status": "APPROVED"
    }
    r = requests.post(f"{BASE}/api/governance/approve-access", json=approve_payload, headers=headers)
    print(f"  POST /api/governance/approve-access: {r.status_code}")
    assert r.status_code == 200
    print("  [✓] Session successfully approved.")

    print("\n" + "=" * 70)
    print("ALL v6.1 GOVERNANCE TESTS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    test_v6_1_institutional_activation()
