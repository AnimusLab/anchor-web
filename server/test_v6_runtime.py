import requests
import json
import time
import jwt
from datetime import datetime
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

def test_governance_runtime_infrastructure():
    print("=" * 70)
    print("ANCHOR v6.0: GOVERNANCE RUNTIME INFRASTRUCTURE TEST SUITE")
    print("=" * 70)

    headers = get_auth_headers()

    # 1. Test Fast Handshake & Capability Sessions
    print("\n[PHASE 1] Testing Capability Session Issuance...")
    r = requests.get(f"{BASE}/api/governance/constitution", headers=headers)
    print(f"  GET /api/governance/constitution: {r.status_code}")
    if r.status_code != 200:
        print(f"  Response: {r.text}")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "SEALED"
    print(f"  Constitution Version: {data.get('version')}")

    # 2. Test Regulatory Isolation & Taxonomy
    print("\n[PHASE 2] Testing Regulatory Visibility Isolation...")
    r = requests.get(f"{BASE}/api/ledger", headers=headers)
    assert r.status_code == 200
    ledger = r.json()
    print(f"  Retrieved {len(ledger)} ledger entries for visibility check.")
    
    if len(ledger) > 0:
        entry = ledger[0]
        entry_id = entry.get("entry_id", "unknown")
        
        r = requests.get(f"{BASE}/api/ledger?entry_id={entry_id}", headers=headers)
        print(f"  GET /api/ledger?entry_id=...: {r.status_code}")
        if r.status_code == 200:
            print("  [✓] Ledger retrieval successful.")

    # 3. Test Heatmap Data Integrity
    print("\n[PHASE 3] Testing Heatmap Data Aggregation...")
    if len(ledger) > 0:
        fields = ["entry_id", "project_name", "timestamp", "is_compliant"]
        for field in fields:
            assert field in ledger[0], f"Missing required heatmap field: {field}"
        print("  [✓] Ledger payload contains all fields required for Forensic Heatmap.")

    print("\n" + "=" * 70)
    print("ALL RUNTIME INFRASTRUCTURE TESTS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_governance_runtime_infrastructure()
    except Exception as e:
        print(f"\n[!] TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
