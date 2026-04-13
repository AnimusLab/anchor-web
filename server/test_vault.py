import os
import sys

# Add the server directory to the sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from security import encrypt_secret, decrypt_secret
from cryptography.fernet import Fernet
import pytest

def test_vault():
    # Setup the environment key for testing
    test_key = Fernet.generate_key().decode()
    os.environ["ANCHOR_MASTER_KEY"] = test_key
    
    print(f"\n[VAULT TEST] Using Master Key: {test_key}")
    
    # 1. Test basic encryption/decryption
    original_secret = "super-secret-webhook-key-123"
    encrypted = encrypt_secret(original_secret)
    decrypted = decrypt_secret(encrypted)
    
    assert original_secret == decrypted
    print("[PASSED] Basic Encryption/Decryption")
    
    # 2. Test tampering detection
    tampered = encrypted[:-5] + "ABCDE"
    try:
        decrypt_secret(tampered)
        print("[FAILED] Tampering detection failed")
        exit(1)
    except Exception as e:
        print(f"[PASSED] Tampering detected: {e}")
        
    # 3. Test wrong key detection
    wrong_key = Fernet.generate_key().decode()
    os.environ["ANCHOR_MASTER_KEY"] = wrong_key
    try:
        decrypt_secret(encrypted)
        print("[FAILED] Wrong key detection failed")
        exit(1)
    except Exception as e:
        print(f"[PASSED] Wrong key detected: {e}")

if __name__ == "__main__":
    try:
        test_vault()
        print("\n[SUCCESS] Vault Security Verification Complete\n")
    except Exception as e:
        print(f"\n[ERROR] Vault Verification Failed: {e}\n")
        exit(1)
