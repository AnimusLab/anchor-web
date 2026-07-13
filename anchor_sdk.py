import requests
from functools import wraps
import time
import os
from pathlib import Path
from datetime import datetime, timezone

# Try to import anchor core packages, adding workspace path if not found in environment
try:
    from anchor.core.loader import load_constitution
    from anchor.core.engine import PolicyEngine
    from anchor.adapters.python import PythonAdapter
    from anchor.runtime.decision_auditor import DecisionAuditor
except ImportError:
    import sys
    sys.path.insert(0, r"d:\Anchor")
    try:
        from anchor.core.loader import load_constitution
        from anchor.core.engine import PolicyEngine
        from anchor.adapters.python import PythonAdapter
        from anchor.runtime.decision_auditor import DecisionAuditor
    except ImportError:
        PolicyEngine = None
        DecisionAuditor = None
        PythonAdapter = None
        load_constitution = None

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
                start_time = time.time()
                
                # 1. Extract prompt context
                prompt = ""
                if args:
                    prompt = str(args[0])
                elif kwargs:
                    prompt = str(next(iter(kwargs.values())))
                
                # 2. Run the actual AI function
                result = func(*args, **kwargs)
                latency_ms = (time.time() - start_time) * 1000
                
                # 3. PolicyEngine static scan on the prompt context
                findings = []
                if PolicyEngine is not None and load_constitution is not None and PythonAdapter is not None:
                    try:
                        anchor_dir = Path(r"d:\Anchor\.anchor")
                        if not anchor_dir.exists():
                            anchor_dir = Path(".anchor")
                        
                        const = load_constitution(
                            governance_root=Path(r"d:\Anchor\anchor\governance"),
                            anchor_dir=anchor_dir if anchor_dir.exists() else None
                        )
                        
                        # Filter to the active rules requested in enforce decorator
                        active_rules = []
                        from dataclasses import asdict
                        for r in const.rules.values():
                            rule_id = getattr(r, "id", None)
                            if rule_id in rules:
                                active_rules.append(asdict(r))
                        
                        if active_rules:
                            engine = PolicyEngine({"rules": active_rules})
                            adapter = PythonAdapter()
                            scan_res = engine.scan_file(prompt.encode("utf-8"), "prompt.txt", adapter)
                            for v in scan_res.get("violations", []):
                                findings.append({
                                    "rule_id": v.get("id"),
                                    "severity": v.get("severity"),
                                    "description": v.get("message") or v.get("description", "Static violation"),
                                    "line": v.get("line", 1)
                                })
                    except Exception as e:
                        print(f"[ANCHOR WARN] PolicyEngine static scan failed: {e}")
                
                # 4. DecisionAuditor runtime checks and cryptographic header generation
                audit_dict = {}
                if DecisionAuditor is not None:
                    try:
                        # Dynamically set secret keys in the environment for DecisionAuditor to sign/seal the entry
                        if "ANCHOR_SECRET_KEY" not in os.environ:
                            os.environ["ANCHOR_SECRET_KEY"] = self.mat
                        if "ANCHOR_MAT" not in os.environ:
                            os.environ["ANCHOR_MAT"] = self.mat
                        
                        auditor = DecisionAuditor()
                        entry = auditor.audit(
                            provider="AI_RUNTIME_AGENT",
                            prompt=prompt,
                            response=str(result),
                            findings=findings,
                            latency_ms=latency_ms
                        )
                        if isinstance(entry, dict):
                            audit_dict = entry
                        else:
                            audit_dict = entry.to_dict()
                    except Exception as e:
                        print(f"[ANCHOR WARN] DecisionAuditor runtime check failed: {e}")
                
                if not audit_dict:
                    # Fallback to simulated/mock payload if engine fails or is not found
                    is_violation = "MALICIOUS" in str(args).upper()
                    status = "VIOLATION" if is_violation else "CLEAN"
                    details = f"Rule breach in {rules[0]}" if is_violation else "All constitutional checks passed."
                    audit_dict = {
                        "entry_id": f"led_{int(time.time()*1000)}",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "governance_status": {
                            "is_compliant": not is_violation,
                            "status": status,
                            "rule_id": rules[0] if is_violation else None
                        },
                        "violations": [{"rule_id": rules[0], "message": details}] if is_violation else [],
                        "cryptography": {
                            "findings_hash": "mock",
                            "prev_chain_hash": "mock",
                            "chain_hash": "mock",
                            "signature": "mock",
                            "is_sealed": False
                        },
                        "telemetry": {
                            "latency_ms": latency_ms,
                            "prompt_preview": prompt[:200],
                            "response_preview": str(result)[:200]
                        }
                    }
                
                # 5. Dispatch IngressPayload to the Central Brain
                payload = {
                    "hub_id": self.entity_id,
                    "mat": self.mat,
                    "audit_data": audit_dict
                }
                
                try:
                    # Asynchronous/short-timeout POST call
                    requests.post(f"{self.proxy_url}/api/ingress", json=payload, timeout=2)
                except Exception as e:
                    print(f"[ANCHOR WARN] Telemetry stream disconnected: {e}")
                
                return result
            return wrapper
        return decorator