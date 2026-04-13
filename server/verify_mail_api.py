import requests

# Test data for Enterprise Registration (triggers mail)
data = {
    "entity_id": "animus_test_mail",
    "display_name": "Animus Mail Verification Test",
    "email": "tanishqsharma.animus@gmail.com" # Using a real email to verify dispatch
}

try:
    print(f"[TEST] Registering entity to trigger Brevo API...")
    res = requests.post("http://localhost:8000/api/auth/register", data=data)
    if res.status_code == 200:
        print(f"[SUCCESS] Registration endpoint returned 200.")
        print(f"Server response: {res.json()}")
    else:
        print(f"[FAILED] Status Code {res.status_code}: {res.text}")
except Exception as e:
    print(f"[ERROR] Connection failure: {e}")
