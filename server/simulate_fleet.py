import urllib.request
import json
import time
import random
import hashlib
import uuid
from datetime import datetime

# Synthetic global projects
PROJECTS = ["finos-core", "rbi-agent-mesh", "eu-compliance-bot", "anchor-engine", "trading-algo-v4", "vault-sync"]
RULES = ["FINOS-014", "SEC-007", "RBI-018", "EU-AI-002", "OWASP-LLM-01"]

def generate_hash():
    return hashlib.sha256(uuid.uuid4().bytes).hexdigest()

def send_audit():
    project = random.choice(PROJECTS)
    
    # 70% chance to pass, 30% chance to fail
    is_compliant = random.random() > 0.3
    
    violations = []
    suppressed = []
    
    if not is_compliant:
        # Generate 1 to 3 random violations
        for _ in range(random.randint(1, 3)):
            violations.append({
                "rule_id": random.choice(RULES),
                "severity": "CRITICAL",
                "description": "Synthetic violation detected by global mesh.",
                "file_path": f"src/{random.choice(['agent.py', 'model.py', 'auth.ts'])}",
                "line_number": random.randint(10, 150),
                "statute_ref": "ISO-27001"
            })
    else:
        # 20% chance a clean run has a suppressed exception
        if random.random() > 0.8:
            suppressed.append({"rule_id": "FINOS-014"})

    payload = {
        "entry_id": f"aud_{generate_hash()[:16]}",           # <-- FIX: Added missing ID
        "timestamp": datetime.utcnow().isoformat() + "Z",    # <-- FIX: Added missing Timestamp
        "execution_context": {
            "project_name": project,
            "git_commit": generate_hash()[:7],
            "environment": random.choice(["production", "ci_pipeline", "staging"])
        },
        "cryptography": {
            "input_hash": generate_hash(),
            "output_hash": generate_hash(),
            "chain_hash": generate_hash()
        },
        "governance_status": {
            "is_compliant": is_compliant,
            "risk_level": "CLEAN" if is_compliant else "CRITICAL",
            "total_violations": len(violations)
        },
        "violations": violations,
        "suppressed": suppressed
    }

    ingress_payload = {
        "entity_id": "master_noc_01",
        "mat": "ANCHOR-ROOT-GOD-MODE", # Simulating the root access for the NOC
        "audit_data": payload
    }

    try:
        req = urllib.request.Request(
            'http://localhost:8000/api/ingress', 
            data=json.dumps(ingress_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=2)
        print(f"[{'PASS' if is_compliant else 'FAIL'}] Sent telemetry for {project}")
    except Exception as e:
        print(f"Failed to send to ingress: {e}")

print("Initiating Global Fleet Simulation... (Press Ctrl+C to stop)")
try:
    while True:
        send_audit()
        # Fire a new audit every 1 to 4 seconds randomly
        time.sleep(random.uniform(1.0, 4.0))
except KeyboardInterrupt:
    print("\nSimulation Terminated.")