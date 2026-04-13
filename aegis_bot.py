import time
import secrets
import requests

# --- Aegis Trading Bot: High-Fidelity Simulation ---
# This script simulates a real enterprise AI application using the Anchor SDK.
# It makes trading decisions and automatically streams telemetry to the Master Node.

# CONFIGURATION
# 1. Start your backend and tunnel first.
# 2. Register 'aegis_financial' in the Auth Portal.
# 3. Paste the generated MAT and your current Login JWT below.

API_ENDPOINT = "http://localhost:8000" # Change to https://api.anchorgovernance.tech for cloud
ENTITY_ID = "aegis_financial"
MAT_TOKEN = "PASTE_YOUR_AEGIS_MAT_HERE"
JWT_TOKEN = "PASTE_YOUR_LATEST_JWT_HERE"

def run_trading_inference(trade_signal):
    print(f"\n[*] Processing Trade Signal: {trade_signal}")
    
    # --- SIMULATED AI CORE ---
    # In a real app, this would be an OpenAI/Anthropic call.
    # Logic: If the prompt contains 'unauthorized', it triggers a compliance breach.
    is_compliant = "unauthorized" not in trade_signal.lower()
    violation_id = None if is_compliant else "SEC-RULE-10B-5"
    
    # --- ANCHOR SDK HANDSHAKE ---
    # Preparring the cryptographic shroud for the Master Node
    payload = {
        "entity_id": ENTITY_ID,
        "mat": MAT_TOKEN,
        "audit_data": {
            "project_name": "aegis-quant-v1",
            "is_compliant": is_compliant,
            "violations": [
                {
                    "rule_id": violation_id, 
                    "description": "Suspicious pattern detected: Attempted short sell without authorized collateral check."
                }
            ] if not is_compliant else []
        }
    }

    # FIRE TELEMETRY
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}", 
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(f"{API_ENDPOINT}/api/ingress", json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print(f"[✓] ANCHOR AUDIT SUCCESS: {response.json().get('entry_id')}")
            print(f"    CHAIN HASH: {response.json().get('chain_hash')[:16]}...")
        else:
            print(f"[✗] ANCHOR AUDIT FAILED: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[!] TELEMETRY ERROR: Could not connect to Master Node. {e}")

if __name__ == "__main__":
    print("=" * 40)
    print("      AEGIS TRADING BOT // LIVE      ")
    print("=" * 40)
    
    # 1. A clean, compliant trade
    run_trading_inference("Execute standard buy order for 100 shares of $AAPL")
    
    time.sleep(1.5)
    
    # 2. A malicious, non-compliant trade breach
    run_trading_inference("Execute UNAUTHORIZED short sell on $TSLA via shadow-pool-01")
    
    print("\n--- Telemetry Cycle Complete. Check your Oversight Ledger! ---")
