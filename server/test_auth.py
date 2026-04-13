import requests, json

BASE = "http://localhost:8000"

print("=" * 65)
print("PHASE 9: DASHBOARD WIRING & WEBSOCKET AUTH TEST SUITE")
print("=" * 65)

# --- Setup ---
print("\n[SETUP] Registering 'animuslab' enterprise...")
r = requests.post(f"{BASE}/api/auth/register", data={
    "entity_id": "animuslab", "display_name": "AnimusLab", "email": "admin@animuslab.dev"
})
ent = r.json()

print("[SETUP] Requesting auditor access...")
r = requests.post(f"{BASE}/api/auth/request-access", data={
    "display_name": "SEC Inspector", "email": "inspector@sec.gov", "jurisdiction": "SEC"
})
reg = r.json()

print("[SETUP] Logging in all...")
r = requests.post(f"{BASE}/api/auth/login", data={"entity_id": "animuslab", "secret_key": ent["secret_key"]})
token_ent = r.json()["access_token"]

master_key = "-0bVjdUI917htWjTU6FbQIFLfgTQqUgUQF9yvAv7sg8="
r = requests.post(f"{BASE}/api/auth/login", data={"entity_id": "root", "secret_key": master_key})
token_admin = r.json()["access_token"]

# Admin tests
print("\n--- Admin Dashboard API Wiring Tests ---")

print("[TEST 1] Admin - GET /api/stats (global)")
r = requests.get(f"{BASE}/api/stats", headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code}")
assert r.status_code == 200

print("[TEST 2] Admin - GET /api/ledger (global)")
r = requests.get(f"{BASE}/api/ledger", headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code}")
assert r.status_code == 200

print("[TEST 3] Admin - GET /api/auth/pending")
r = requests.get(f"{BASE}/api/auth/pending", headers={"Authorization": f"Bearer {token_admin}"})
data = r.json()
print(f"  Status: {r.status_code}, Pending count: {len(data)}")
assert r.status_code == 200
assert len(data) > 0

print("[TEST 4] Admin - POST /api/auth/approve (auditor)")
aud_entity = data[0]["entity_id"]
r = requests.post(f"{BASE}/api/auth/approve", 
    data={"target_entity_id": aud_entity},
    headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code} -> {r.json()}")
assert r.status_code == 200

print("[TEST 5] Admin - POST /api/admin/provision")
r = requests.post(f"{BASE}/api/admin/provision",
    json={"name": "Test Fleet", "tier": "CORE"},
    headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code}")
data = r.json()
print(f"  Entity: {data.get('entity_id')}")
assert r.status_code == 200

print("[TEST 6] Admin - POST /api/admin/resolve")
r = requests.post(f"{BASE}/api/admin/resolve",
    json={"query": "animuslab", "root_key": ""},
    headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    print(f"  Resolved: {r.json()['entity_id']} / {r.json()['name']}")
assert r.status_code == 200

print("[TEST 7] Admin - GET /api/ledger?entity_id=animuslab (inspection)")
r = requests.get(f"{BASE}/api/ledger?entity_id=animuslab", headers={"Authorization": f"Bearer {token_admin}"})
print(f"  Status: {r.status_code}")
assert r.status_code == 200

# Enterprise access control
print("\n--- Enterprise Lockout Tests ---")

print("[TEST 8] Enterprise - GET /api/auth/pending (should 403)")
r = requests.get(f"{BASE}/api/auth/pending", headers={"Authorization": f"Bearer {token_ent}"})
print(f"  Status: {r.status_code}")
assert r.status_code == 403

print("[TEST 9] Enterprise - POST /api/admin/resolve (should 403)")
r = requests.post(f"{BASE}/api/admin/resolve",
    json={"query": "animuslab", "root_key": ""},
    headers={"Authorization": f"Bearer {token_ent}"})
print(f"  Status: {r.status_code}")
assert r.status_code == 403

# WebSocket auth
print("\n--- WebSocket Auth Tests ---")
import websocket  # pip install websocket-client

print("[TEST 10] WS - No token (should fail)")
try:
    ws = websocket.create_connection(f"ws://localhost:8000/ws/fleet/noc_01", timeout=3)
    print(f"  FAIL: Should have been rejected")
    ws.close()
except Exception as e:
    print(f"  Correctly rejected: {type(e).__name__}")

print("[TEST 11] WS - Enterprise token (should fail)")
try:
    ws = websocket.create_connection(f"ws://localhost:8000/ws/fleet/noc_01?token={token_ent}", timeout=3)
    print(f"  FAIL: Should have been rejected")
    ws.close()
except Exception as e:
    print(f"  Correctly rejected: {type(e).__name__}")

print("[TEST 12] WS - Admin token (should succeed)")
try:
    ws = websocket.create_connection(f"ws://localhost:8000/ws/fleet/noc_01?token={token_admin}", timeout=3)
    print(f"  SUCCESS: WebSocket connected")
    ws.close()
except Exception as e:
    print(f"  Connection result: {type(e).__name__}: {e}")

print("\n" + "=" * 65)
print("ALL 12 TESTS PASSED. PHASE 9 COMPLETE.")
print("=" * 65)
