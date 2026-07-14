import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.hashes import SHA256
from fastapi import HTTPException

# Global cached keys
_fernet_key = None
_jwt_key = None
_last_master_key = None

def _init_keys():
    global _fernet_key, _jwt_key, _last_master_key
    master_key = os.getenv("ANCHOR_MASTER_KEY")
    if not master_key:
        raise RuntimeError("CRITICAL: ANCHOR_MASTER_KEY is required and not set.")
    
    if _fernet_key is None or master_key != _last_master_key:
        _last_master_key = master_key
        master_bytes = master_key.encode("utf-8")
        
        # Derive Fernet key (must be urlsafe base64 encoded 32 bytes)
        fernet_hkdf = HKDF(
            algorithm=SHA256(),
            length=32,
            salt=b"anchor-key-separation",
            info=b"fernet-encryption-key",
        )
        _fernet_key = base64.urlsafe_b64encode(fernet_hkdf.derive(master_bytes))
        
        # Derive JWT HMAC key (binary key for HMAC)
        jwt_hkdf = HKDF(
            algorithm=SHA256(),
            length=32,
            salt=b"anchor-key-separation",
            info=b"jwt-signing-key",
        )
        _jwt_key = jwt_hkdf.derive(master_bytes)

def get_fernet_key() -> bytes:
    _init_keys()
    return _fernet_key

def get_jwt_key() -> bytes:
    _init_keys()
    return _jwt_key

def get_cipher():
    return Fernet(get_fernet_key())

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

