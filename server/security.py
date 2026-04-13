import os
from cryptography.fernet import Fernet
from fastapi import HTTPException

# Load the key from the environment
# Reminder: This key should be a base64-encoded 32-byte string
MASTER_KEY = os.getenv("ANCHOR_MASTER_KEY")

# For initial setup, we provide a fallback logic or a hard error if missing
if not MASTER_KEY:
    # In production, this should be a hard RuntimeError
    # For initial bridging, we will look for a local .env or key file
    pass

def get_cipher():
    key = os.getenv("ANCHOR_MASTER_KEY")
    if not key:
        raise RuntimeError("ANCHOR_MASTER_KEY not found in environment variables.")
    return Fernet(key.encode())

def encrypt_secret(plain_text: str) -> str:
    """Encrypts a string and returns a UTF-8 string of the ciphertext."""
    cipher = get_cipher()
    return cipher.encrypt(plain_text.encode()).decode()

def decrypt_secret(cipher_text: str) -> str:
    """Decrypts a ciphertext string and returns the original plain text."""
    cipher = get_cipher()
    try:
        return cipher.decrypt(cipher_text.encode()).decode()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decrypt secure credential. Check ANCHOR_MASTER_KEY.")
