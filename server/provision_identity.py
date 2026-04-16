"""
Anchor Governance Mesh — Identity Provisioning Utility
This script allows administrators to add authorized Auditors and HR Managers 
to the encrypted Master Config registry.

Usage:
    1. Set ANCHOR_MASTER_KEY in your environment.
    2. Edit the identities list below.
    3. Run: python provision_identity.py
"""

import os
import sys
from master_config import provision_auditor, list_auditors

# --- INITIALIZATION ---
def check_environment():
    if not os.getenv("ANCHOR_MASTER_KEY"):
        print("❌ ERROR: ANCHOR_MASTER_KEY not found in environment.")
        print("Please run: $env:ANCHOR_MASTER_KEY='your-key-here' (PowerShell)")
        sys.exit(1)

def main():
    check_environment()
    
    print("⚓ ANCHOR IDENTITY PROVISIONING SYSTEM")
    print("-" * 40)

    # --- ADD NEW IDENTITIES HERE ---
    identities_to_provision = [
        # {
        #     "display_name": "Name Here",
        #     "email": "email@example.com",
        #     "regulator": "SEC",           # Use 'INTERNAL' for Enterprise Managers
        #     "jurisdiction": "US",         # Use 'GLO' for Global
        #     "access_level": "READ_ONLY"   # Use 'OWNER' for Managers
        # },
    ]

    for person in identities_to_provision:
        try:
            print(f"⌛ Provisioning: {person['display_name']} ({person['regulator']})...")
            record = provision_auditor(
                display_name=person['display_name'],
                email=person['email'],
                regulator=person['regulator'],
                jurisdiction=person['jurisdiction'],
                access_level=person['access_level']
            )
            print(f"✅ SUCCESS")
            print(f"   - Entity ID:    {record['entity_id']}")
            print(f"   - TOTP Secret:  {record['totp_secret']} (⚠️ SAVE THIS FOR QR CODE)")
            print("-" * 40)
        except Exception as e:
            print(f"❌ FAILED: {e}")

    # Final Summary
    print("\nCURRENT REGISTRY STATUS:")
    current = list_auditors()
    for user in current:
        print(f" • [{user['status']}] {user['entity_id']} | {user['display_name']} | {user['jurisdiction']}")

if __name__ == "__main__":
    main()
