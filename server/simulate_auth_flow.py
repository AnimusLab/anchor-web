import pyotp
import requests
import json

BASE_URL = "http://localhost:8000"

def simulate():
    print("--- SIMULATING AUTHENTICATION FLOW ---")
    
    # 1. Identify
    print("\n1. Calling /api/auth/oversight/identify...")
    payload_identify = {
        "clearance_id": "AUD-RB-INDIA-359",
        "hub_id": "rbi",
        "email": "artisianecho@gmail.com"
    }
    r = requests.post(f"{BASE_URL}/api/auth/oversight/identify", json=payload_identify)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    if r.status_code != 200:
        return
    data_identify = r.json()
    
    # Generate TOTP code
    totp = pyotp.TOTP("G6PVJWRA63J7JDUJIBQSCKV4N6MYVTCY")
    totp_code = totp.now()
    print(f"\nGenerated TOTP Code: {totp_code}")
    
    # 2. Verify TOTP
    print("\n2. Calling /api/auth/oversight/verify-totp...")
    payload_verify = {
        "clearance_id": "AUD-RB-INDIA-359",
        "hub_id": "rbi",
        "email": "artisianecho@gmail.com",
        "totp_code": totp_code,
        "intent_token": data_identify.get("intent_token")
    }
    r = requests.post(f"{BASE_URL}/api/auth/oversight/verify-totp", json=payload_verify)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    if r.status_code != 200:
        return
    data_verify = r.json()
    token = data_verify.get("access_token")
    
    # 3. Call /api/auth/me
    print("\n3. Calling /api/auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    # 4. Call /api/ledger
    print("\n4. Calling /api/ledger...")
    r = requests.get(f"{BASE_URL}/api/ledger", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")

if __name__ == "__main__":
    simulate()
