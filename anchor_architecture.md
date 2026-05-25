# Anchor — System Architecture

> **`anchor`** = Python governance engine (PyPI)
> **`anchor-web`** = Sovereign Identity Mesh (web platform)

---

## 01. System Overview

```mermaid
graph TD
    A["🔬 Layer 1: Static Engine\n(AST Scanning)"]
    B["🛡️ Layer 2: Runtime\n(Live Interceptor)"]
    C["💎 Diamond Cage\n(WASM Sandbox)"]
    D["📜 Governance\n(9 Domains · 6 Regulators)"]
    E["🔶 Spoke Node\n(Enterprise Data Plane)"]
    F["🔷 Hub Node\n(Master Control)"]
    G["💻 Frontend Portals\n(4 React Apps)"]

    A --> D
    B --> D
    C --> A
    B -->|"audit chain"| E
    E -->|"WebSocket"| F
    F -->|"REST"| G

    style A fill:#1e293b,stroke:#06b6d4,color:#e2e8f0
    style B fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style C fill:#1e293b,stroke:#a855f7,color:#e2e8f0
    style D fill:#0f172a,stroke:#10b981,color:#e2e8f0
    style E fill:#0f172a,stroke:#f97316,color:#e2e8f0
    style F fill:#0f172a,stroke:#3b82f6,color:#e2e8f0
    style G fill:#0f172a,stroke:#ec4899,color:#e2e8f0
```

---

## 02. Repo: `anchor` (Python Package)

```
anchor/
├── cli.py                       # anchor init / check / heal / sync
├── core/
│   ├── engine.py                # PolicyEngine (AST + regex scan)
│   ├── loader.py                # Federation loader
│   ├── constitution.py          # Remote SHA-256 integrity
│   ├── crypto.py                # HMAC-SHA256 signing
│   ├── sandbox.py               # Diamond Cage (WASM)
│   ├── healer.py                # Auto-fix suggestions
│   ├── verdicts.py              # Architectural drift
│   ├── model_auditor.py         # ML weight auditing
│   └── policy_loader.py         # policy.anchor merge
├── runtime/
│   ├── __init__.py              # activate() / enforce()
│   ├── guard.py                 # AnchorGuard API
│   ├── decision_auditor.py      # Crypto audit chain
│   ├── models.py                # AuditEntry (RBI/SEC/EU dialects)
│   └── interceptors/
│       ├── framework.py         # 9 SDK patches (wrapt)
│       ├── http_backstop.py     # requests/httpx catch-all
│       ├── output_scanner.py    # Response scanner
│       └── provider_registry.py # 30+ AI API domains
├── adapters/                    # tree-sitter (Py/TS/Rust/Go/Java)
├── plugins/                     # safetensors / gguf / huggingface
└── governance/
    ├── constitution.anchor      # Root manifest
    ├── mitigation.anchor        # Detection patterns
    ├── domains/ (9)             # SEC·ETH·PRV·ALN·AGT·LEG·OPS·SUP·SHR
    ├── frameworks/ (3)          # FINOS · OWASP · NIST
    └── government/ (6)          # RBI · EU · SEC · SEBI · CFPB · FCA
```

---

## 03. Repo: `anchor-web` (Sovereign Mesh)

### v6.2 Institutional Identity Infrastructure
Anchor v6.2 pivots from a hierarchical clearance model to a deterministic **Institutional Identity** model. This ensures that governance authority is derived from operational reality rather than "security levels."

| Layer | Component | Purpose |
| :--- | :--- | :--- |
| **Identity Subtype** | `government_auditor`, `standard_auditor` | Defines the institutional persona and baseline capabilities. |
| **Capability Manifest** | `can_replay`, `can_export`, `can_issue_notice` | Explicitly provisioned flags with **audit reasoning** and **temporal expiry**. |
| **Visibility Scope** | `jurisdiction_wide`, `assigned_hubs` | Deterministically filters which entities an auditor can see. |
| **Enforcement Layer** | `require_subtypes()` | Backend gating that ensures institutional authority is valid at the runtime level. |

```python
# v6.2 Structured Capability Manifest
{
  "capability": "can_replay",
  "granted_by": "root_admin",
  "reason": "Regulatory investigation #882",
  "expires_at": "2026-06-01T00:00:00Z"
}
```

```python
# Backend Subtype Gating (v6.2 Enforced Runtime)
@app.post("/api/forensic/request")
async def create_forensic_request(
    current_user: dict = Depends(require_subtypes(["government_auditor", "cross_hub_auditor"]))
):
    ...
```

### File Structure
```
anchor-web/
├── server/
│   ├── proxy.py                 # Hub API & visibility enforcement
│   ├── auth.py                  # Identity provider & capability compiler
│   ├── oversight_auth.py        # Regulator gateway
│   ├── models.py                # Institutional Schema (Identity Subtypes)
│   ├── governance/
│   │   └── registry_engine.py   # Deterministic capability registry
...
```

---

## 04. Layer 1 — Static Engine

```mermaid
graph TD
    A["git commit"] --> B["Pre-Commit Hook"]
    B --> C["tree-sitter\nAST Parser"]
    C --> D["5 Language Adapters\nPy · TS · Rust · Go · Java"]
    D --> E["Rule Evaluation"]
    F["constitution.anchor\n+ 9 Domains"] --> E
    G["policy.anchor\n⬆️ Raise Only"] -->|"merge"| E
    H["mitigation.anchor\nDetection Patterns"] --> E
    E --> I["ID Aggregation\nSEC + OWASP + EU"]
    I --> J["violations.txt\n+ anchor-report.json"]

    style G fill:#422006,stroke:#f59e0b,color:#fef3c7
    style F fill:#0c4a6e,stroke:#06b6d4,color:#e0f2fe
```

> [!NOTE]
> **`policy.anchor`** lets each client add private rules and raise severity thresholds — but can **never lower** the constitutional floor. The governance baseline is absolute. (`enforce_raise_only: true`)

---

## 05. Layer 2 — SDK Interception

```mermaid
graph TD
    A["Developer's App\nimport anchor.runtime"] --> B
    B["SDK Patches\n(9 providers via wrapt)"]
    B --> C["Prompt Scanner"]
    A --> D["HTTP Backstop\nrequests · httpx"]
    D --> E["Provider Registry\n30+ AI API domains"]
    E --> C

    C -->|"blocker/error"| F["🔴 BLOCK\nAnchorViolationError"]
    C -->|"warning"| G["🟡 WARN\nlog + pass through"]
    C -->|"any"| H["🟢 AUDIT\nsilent record"]

    style F fill:#7f1d1d,stroke:#ef4444,color:#fecaca
    style G fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style H fill:#14532d,stroke:#22c55e,color:#dcfce7
```

**Patched SDKs:** OpenAI · Anthropic · Google Gemini · LangChain · Ollama · Groq · Cohere · Mistral · HuggingFace

> [!IMPORTANT]
> **BLOCK does NOT kill the session.** It raises a catchable `AnchorViolationError` — blocks the specific payload but keeps the application alive. The developer catches the exception and substitutes a safe response.

---

## 06. Layer 2 — Audit Chain

```mermaid
graph TD
    A["Response Scanner\nSecrets · Shell · SQL · PII"]
    A --> B["ETH Compliance\nAho-Corasick proxies\nExplainability check"]
    B --> C["DecisionAuditor"]
    C --> D["SHA-256\nfindings_hash + prev_hash\n→ chain_hash"]
    D --> E["HMAC-SHA256\nSigned with\nANCHOR_SECRET_KEY"]
    E --> F["Local JSONL Ledger"]
    E --> G["ANCHOR_LEDGER_URL\n(Spoke webhook)"]

    C --> H["Dialect Translation"]
    H --> I["RBI\nSeven Sutras"]
    H --> J["SEC\n8-K Materiality"]
    H --> K["EU\nArt. 12 Logging"]

    style E fill:#0c4a6e,stroke:#06b6d4,color:#e0f2fe
```

---

## 07. Diamond Cage (WASM Sandbox)

```mermaid
graph TD
    A["anchor check --sandbox"] --> B["DiamondCage\nWasmEdge + Python WASM"]
    B --> C["Isolation\nFS: /app only\nNetwork: Blocked\nEnv: Stripped"]
    B --> D["Run Original\n→ Snapshot A"]
    B --> E["Run Patched\n→ Snapshot B"]
    D --> F["Compare\nstdout · stderr\nexit code · timing"]
    E --> F
    F --> G["✅ PROVED_SAFE"]
    F --> H["⚠️ CHANGED"]
    F --> I["🔴 MALICIOUS"]

    style G fill:#14532d,stroke:#22c55e,color:#dcfce7
    style I fill:#7f1d1d,stroke:#ef4444,color:#fecaca
```

---

## 08. Hub ↔ Spoke — Data Sovereignty

```mermaid
sequenceDiagram
    participant SDK as SDK
    participant SP as Spoke
    participant HUB as Hub
    participant AUD as Auditor

    SDK->>SP: POST /ingest (full payload)
    SP->>SP: Store in local SQLite
    SP->>HUB: WS: AUDIT_HEADER (~200B)
    Note right of SP: No raw data crosses perimeter

    AUD->>HUB: Request forensic detail
    HUB->>SP: WS: FORENSIC_PULL
    SP->>SP: Encrypt (AES-256-GCM)
    SP->>HUB: WS: FORENSIC_RESPONSE
    HUB->>AUD: Serve decrypted payload
```

> [!IMPORTANT]
> **Data Sovereignty:** Raw forensic payloads NEVER leave the enterprise perimeter via REST. They only travel over the brokered WebSocket relay, AES-256-GCM encrypted, on auditor demand.

---

## 09. Database Schema

```mermaid
erDiagram
    Organization ||--o{ Fleet : "has"
    Organization ||--o{ User : "has"
    Fleet ||--o{ LedgerEntry : "has"
    Fleet ||--o{ WebhookSubscription : "has"

    Organization {
        string hub_id "animuslab"
        string display_name "Animus Global"
        string domain "animuslab.ai"
        string org_type "enterprise | regulator"
    }

    Fleet {
        string entity_id "animuslab-marcus"
        string name "Marcus Trading Bot"
        string key_hash "SDK MAT hash"
    }

    User {
        string email "user@company.com"
        string role "owner | admin | member"
        string clearance_id "SEC-JHONDOC-2604"
    }

    LedgerEntry {
        string chain_hash "0x..."
        string signature "HMAC-SHA256"
        string type "check | violation"
    }

    WebhookSubscription {
        string dialect "RBI | SEC | EU"
        string webhook_url "https://..."
    }
```

---

## 10. Frontend Portals

```mermaid
graph TD
    A["🌐 Landing Page\nlanding/"] --> B["🔐 Enterprise Portal\ndashboard/"]
    A --> C["🔐 Oversight Portal\noversight/"]

    B --> D["AuthPortal.jsx\nhub_id registration"]
    B --> E["Ledger.jsx\nAudit chain viewer"]
    B --> F["Connect.jsx\nSDK setup"]

    C --> G["LoginPage.jsx\nTOTP login"]
    C --> H["Dashboard.jsx\nEvidence Vault"]

    I["⚡ Root Admin\nroot-admin/"] --> J["Org approval\nUser management"]
    K["🌍 Mesh Globe\nmesh/"] --> L["Terminal hex-grid\nNode status"]

    style B fill:#1e293b,stroke:#06b6d4,color:#e2e8f0
    style C fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style I fill:#1e293b,stroke:#ef4444,color:#e2e8f0
    style K fill:#1e293b,stroke:#a855f7,color:#e2e8f0
```

---

## How `anchor` ↔ `anchor-web` Connect

```mermaid
graph TD
    A["Developer Machine\nimport anchor.runtime"] -->|"1. audit()"| B["Local JSONL\n.anchor/runtime_chain"]
    A -->|"2. LEDGER_URL"| C["Spoke Node\n(Enterprise Docker)"]
    C -->|"3. WS: header only"| D["Hub Node\n(Cloud)"]
    D -->|"4. REST API"| E["Enterprise Portal"]
    D -->|"5. REST API"| F["Oversight Portal"]
    D -->|"6. Feed"| G["Mesh Globe"]

    style A fill:#1e293b,stroke:#06b6d4,color:#e2e8f0
    style C fill:#422006,stroke:#f97316,color:#fed7aa
    style D fill:#0c4a6e,stroke:#3b82f6,color:#bfdbfe
```

| Step | What Happens |
|---|---|
| **1** | `DecisionAuditor.audit()` writes to local JSONL with HMAC chain |
| **2** | Full payload POST'd to enterprise Spoke (`ANCHOR_LEDGER_URL`) |
| **3** | Spoke pushes ~200B `AUDIT_HEADER` to Hub (no raw data) |
| **4** | Enterprise users see compliance scores via Dashboard |
| **5** | Regulators see metadata, can trigger `FORENSIC_PULL` |
| **6** | Mesh globe shows live node status |

---

## Key Principles

| Principle | How |
|---|---|
| **Constitutional Floor** | `policy.anchor` can only RAISE severity, never lower |
| **Federated ID** | SEC-007 → OWASP-LLM-02 → EU-ART-15 via alias chains |
| **Data Sovereignty** | Raw data stays on Spoke. Hub gets metadata only. |
| **Surgical Containment** | `AnchorViolationError` blocks payload, keeps session alive |
| **Multi-Dialect** | One AuditEntry → RBI Sutras / SEC 8-K / EU Art.12 |
| **Zero-Knowledge** | Regulators verify via `chain_hash` without raw access |

---

> *v4.3.5 (engine) · v5.1.1 (mesh) · 2026-04-27*
