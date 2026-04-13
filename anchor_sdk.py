import requests
from functools import wraps
import time

class AnchorRuntime:
    def __init__(self, entity_id: str, mat: str, proxy_url: str = "http://localhost:8000"):
        self.entity_id = entity_id
        self.mat = mat
        self.proxy_url = proxy_url

    def enforce(self, project: str, rules: list):
        """Decorator that intercepts AI inferences and streams telemetry to the Mesh."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # 1. Run the actual AI function (zero latency impact)
                start_time = time.time()
                result = func(*args, **kwargs)
                
                # 2. Simulated Governance Analysis
                # In a real environment, this checks the inputs/outputs against the ruleset.
                # For our simulation: If the input text contains "MALICIOUS", we flag it.
                is_violation = "MALICIOUS" in str(args).upper()
                
                status = "VIOLATION" if is_violation else "CLEAN"
                details = f"Rule breach in {rules[0]}" if is_violation else "All constitutional checks passed."

                # 3. Fire Telemetry to the Central Brain
                payload = {
                    "entity_id": self.entity_id,
                    "mat": self.mat,
                    "actor": "AI_RUNTIME_AGENT",
                    "project": project,
                    "type": "AUTOMATED_INFERENCE",
                    "status": status,
                    "details": details
                }
                
                try:
                    # Asynchronous fire-and-forget in production
                    requests.post(f"{self.proxy_url}/api/ingress", json=payload, timeout=1)
                except Exception as e:
                    print(f"[ANCHOR WARN] Telemetry stream disconnected: {e}")
                
                return result
            return wrapper
        return decorator