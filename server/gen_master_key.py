from cryptography.fernet import Fernet
import os

def generate_key():
    key = Fernet.generate_key()
    print("\n[ANCHOR SECURITY] New Master Encryption Key Generated")
    print("-" * 50)
    print(f"Key: {key.decode()}")
    print("-" * 50)
    print("SET THIS AS AN ENVIRONMENT VARIABLE: ANCHOR_MASTER_KEY\n")

if __name__ == "__main__":
    generate_key()
