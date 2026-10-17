---
id: P-001
title: "Anchor: A Federated Governance Engine for Secure and Compliant Agentic AI Systems"
date: 2026-06-02
updated: 2026-06-02
version: "6.0.1"
author: "Tanishq Dasari"
category: "Governance"
tags:
  - AI Safety
  - Federated Policy
  - WebAssembly
  - Cryptographic Logging
  - Static Analysis
  - Runtime Interception
doi: "10.5281/zenodo.19734724"
pdf: "/papers/anchor-deterministic-runtime-governance.pdf"
github: "https://github.com/AnimusLab/Anchor"
excerpt: "We present Anchor, a federated governance engine that unifies pre-deployment static code analysis with runtime decision auditability (anchor-audit v6.0.1) under a single cryptographically signed constitution."
---

# Anchor: A Federated Governance Engine for Secure and Compliant Agentic AI Systems

**Tanishq Dasari**  
Independent Researcher, AnimusLab, India  
[`tan@anchor.animuslab.dev`](mailto:tan@anchor.animuslab.dev)  
[`github.com/AnimusLab/anchor`](https://github.com/AnimusLab/anchor) | [`anchor.animuslab.dev`](https://anchor.animuslab.dev)  
*Submitted: April 2026 · Preprint: Zenodo*  

---

## Abstract
As agentic AI systems transition from closed-loop sandboxes to open-world execution environments, the risk of unaligned tool use, data leakage, and regulatory non-compliance increases substantially. Existing governance tools address either static code quality or narrow runtime monitoring, but none provide a unified, cryptographically verifiable enforcement layer that spans the full deployment lifecycle of an AI system. 

We present **Anchor**, a federated governance engine that enforces multi-lens compliance across heterogenous agentic architectures through two complementary mechanisms. Layer 1 (Anchor v1–v4) performs static analysis of AI-adjacent source code using Tree-sitter abstract syntax tree (AST) parsing against a `constitution.anchor` rule set—a signed Universal Constitution defining what is permitted—and a `mitigation.anchor` detection catalog defining how violations are identified. Layer 2 (AnchorRuntime, v4.3.5) intercepts live AI inference calls, hashes inputs and outputs with SHA-256, evaluates outputs against the same constitution at runtime, and writes each decision into an HMAC-signed, hash-chained append-only audit log: the Decision Audit Chain (DAC).

Central to Layer 1 enforcement is the **Diamond Cage**, a WebAssembly (WASM)-based behavioral verification sandbox built on WasmEdge. Governance integrity is maintained through a remote lockfile model (`GOVERNANCE.lock`) sealing 18 policy files via SHA-256. Layer 2 introduces a dual-mode enforcement model—Structured Mode for high-stakes decisions (mandatory JSON with `ReasonCode` and `FeatureAttribution`) and Conversational Mode for general interactions—alongside a deterministic ETH domain that replaces probabilistic bias classifiers with Governance Invariants: an Aho-Corasick trie scanning structured attribution fields against a lintable prohibited-proxy taxonomy. Regulatory output methods (`cims_payload()`, `adverse_action_reasons()`, and `eu_article12_record()`) translate a single `AuditEntry` into jurisdiction-specific dialects without separate implementations. 

We validate the system against four open-source codebases: FINOS Architecture-as-Code, HuggingFace Hub, Django, and OpenSpiel. We demonstrate that a single `constitution.anchor` file simultaneously satisfies Article 12 logging requirements of the EU AI Act (2024/1689), RBI FREE-AI Report Recommendations 7 and 14, CFPB Regulation B adverse action obligations, SEC 2026 Examination Priorities, and the NIST AI Risk Management Framework—a property we term **regulatory polyglottism**.

---

## 1. Introduction & Problem
The emergence of agentic AI systems—large language models equipped with tool-calling capabilities, persistent memory, and multi-step planning—has created a new class of governance challenge. Unlike traditional software, an agentic system does not execute a fixed program; it dynamically decides which tools to invoke, which data to access, and which actions to take based on model outputs that are inherently non-deterministic. The attack surface is correspondingly large: prompt injection, credential harvesting via environment variable access, unsandboxed subprocess execution, unvalidated LLM output consumption, and data poisoning of retrieval stores are all patterns that existing static analysis tools were not designed to detect.

This challenge is compounded by a convergent global regulatory response. The EU AI Act (2024/1689) classifies credit scoring, AML monitoring, and fraud detection as high-risk AI systems subject to mandatory conformity assessments, logging, and human oversight documentation. The Reserve Bank of India's FREE-AI Report issued 26 mandatory recommendations for AI in financial services, including per-decision audit trails reportable to the CIMS portal. The U.S. Consumer Financial Protection Bureau (CFPB) established through a $45 million enforcement action against Goldman Sachs that AI-assisted credit decisions must be explainable at the decision level. The SEC identified AI governance as the top examination priority for 2026, and the NIST AI Risk Management Framework (RMF) 1.0 establishes governance, measurement, and management functions as baseline requirements.

Against this backdrop, we identify a dual governance gap:
* **Pre-deployment gap:** No tooling verifies AI-adjacent source code against a signed constitutional rule set before it ships.
* **Runtime gap:** No unified, cryptographically verifiable record proves what an AI system decided, when, on what input, under which rules, with what ethical outcome.

Anchor closes both gaps through a single signed `constitution.anchor` that governs both layers. 

---

## 2. Current Governance Models
Existing AI safety and guardrail tools focus on either input/output filtering or alignment training:
1. **Natural Language Classifiers (e.g., LlamaGuard, NeMo Guardrails):** These systems evaluate prompts and outputs using secondary neural networks. This creates a *probabilistic dependency*: a system's safety boundary is only as reliable as the classification accuracy of the guardrail model. For high-stakes regulated decisions (e.g., credit underwriting), an 85% confidence score or an opaque classifier decision is legally insufficient. Regulators demand logical proof and deterministic explanation.
2. **Post-Inference Filtering (e.g., Guardrails AI):** Middleware that inspects an LLM's response before execution introduces significant latency, cannot prevent internal logic failures, and is easily bypassed if the output is formatted to obscure intent (e.g., base64 encoding).
3. **Container-Level Isolation:** Standard sandboxing (Docker, namespaces) isolates the host operating system but does not govern what the agent is doing inside the boundary. An agent can still exfiltrate data via whitelisted HTTPS paths or engage in infinite execution loops that exhaust resources.

---

## 3. Deterministic Alternatives
Anchor shifts the safety paradigm from probabilistic evaluation to deterministic compiler-level and runtime constraints. Instead of training models to "behave safely," we restrict their execution environment dynamically.

By combining static analysis (AST parsing) with runtime interception, we achieve:
* **Zero-trust tool execution:** The code generated by an agent is treated as untrusted script.
* **Proved-safe state transitions:** Before execution, code must pass tree-sitter syntax validation, blocking unauthorized library imports and OS calls.
* **Hardware-enforced resource limits:** Running code inside a WebAssembly sandbox ensures execution is bound by strict gas limits and virtualized directories.

---

## 4. Anchor Architecture & Connection Mesh
Anchor is split into two primary components: `anchor` (the Python-based PyPI governance package `anchor-audit`) and `anchor-web` (the sovereign mesh control plane).

```diagram-architecture
```

The system coordinates telemetry across an enterprise perimeter:
1. **Anchor SDK:** Placed directly in the developer's execution pipeline, intercepts inferences and tools, writing local cryptographically linked logs into `.anchor/runtime_chain.jsonl`.
2. **Spoke Node (On-Premise):** Receives full forensic telemetry logs locally, storing them securely in an isolated SQLite database (`anchor.db`).
3. **Hub Node (Cloud Control Plane):** Spoke nodes relay a lightweight, ~200-byte `AUDIT_HEADER` containing only the `entry_id`, `chain_hash`, and compliance status over a persistent WebSocket. Raw prompt and output payloads never leave the enterprise perimeter.
4. **Oversight Portal:** When a regulator requires audit evidence, they trigger a `FORENSIC_PULL` through the Hub. The Spoke encrypts the local database record using AES-256-GCM and relays it through the Hub's secure WebSocket tunnel.

---

## 5. Constitutional Runtime & GOVERNANCE.lock
Anchor enforces rule sets using a three-file hierarchy:
* `constitution.anchor`: The root document defining semantic laws, severities, and mapping paths to regulatory provisions.
* `mitigation.anchor`: The detection catalog mapping abstract rules to tree-sitter AST queries and context-aware regex patterns.
* `policy.anchor`: Project-local rules. Under the **Governance Floor Invariant**, local policies can only raise severities (e.g., changing a `WARNING` to a `BLOCKER`), never lower them.

### GOVERNANCE.lock
To prevent developers or adversarial code from tampering with rules, Anchor uses a remote integrity lockfile model. The `GOVERNANCE.lock` file seals all 18 policy files across domains, frameworks, and government regulations. The SHA-256 signatures are verified against the authoritative AnimusLab registry on every `anchor check` run. Any unauthorized change immediately halts the static validation scan.

### 5.2 Sovereign Relay Protocol (v5.0.4)
Telemetry data flows securely from the edge to the regulatory oversight plane according to the following sequence:

```diagram-relay
```

The protocol establishes a strict cryptographic separation of concerns between on-premise AI orchestrations and external regulatory oversight. The protocol leverages a persistent spoke-to-hub connection to relay lightweight metadata while retaining raw execution traces behind the enterprise firewall.

#### 5.2.1 Metadata Synchronization
For every decision block recorded in the local audit vault (`.anchor/runtime_chain.jsonl`), the Spoke client constructs and sends a lightweight Zero-Knowledge audit header:
$$\text{Header} = \{\text{entry\_id}, \text{timestamp}, \text{is\_compliant}, \text{status}, \text{chain\_hash}\}$$
No prompt text, model parameters, or raw responses cross the corporate perimeter during standard operations.

#### 5.2.2 Zero-Dependency Forensic Pull
When a regulator or compliance officer initiates an authorized `FORENSIC_PULL` query for a specific `entry_id` through the Hub, the request is routed down to the Spoke client. The Spoke fetches the matching audit entry, extracts the raw telemetries (prompts, features, reasoning, and verdicts), and encrypts the payload locally using a zero-dependency **SHA256-CTR symmetric stream cipher**:
$$\text{Keystream}_i = \text{SHA256}(\text{SecretKey} \mathbin{\Vert} \text{IV} \mathbin{\Vert} \text{BlockIndex}_i)$$
$$\text{Ciphertext}_i = \text{Plaintext}_i \oplus \text{Keystream}_i$$
This zero-dependency approach ensures that the client-side Spoke SDK remains extremely lightweight and highly portable, operating without heavyweight binary cryptographical packages. The encrypted payload and its generated Initialization Vector (IV) are dispatched back to the Hub, where they can only be decrypted by a regulator holding the corresponding pre-shared signing keys.

### 5.3 Context-Aware Integration Checking
Static checks in modern CI/CD pipelines often produce high rates of false positives when run against pure web frontends or non-AI directories that do not require runtime interception. To address this, Anchor v5.0.4 implements **context-aware integration checking**:
1. **AI Dependency Scan:** The static analysis engine scans code files for imports of major LLM frameworks (e.g., `openai`, `anthropic`, `cohere`, `langchain`, `llama_index`, `google.generativeai`).
2. **Interception Verification:** If AI dependencies are present, the static engine checks the application entrypoints for the instantiation of `anchor.runtime` or the presence of the `@anchor.enforce` decorator.
3. **Graceful Degradation:** If AI imports are detected but the runtime SDK is missing, static checks immediately fail with blocker violations for any active runtime policies (e.g., `EU-ART12`, `RBI-007`). If no AI dependencies are detected, the check is gracefully skipped, allowing standard frontend repositories (such as the web components of a system) to pass cleanly.

---

## 6. Capability Isolation: Diamond Cage
The **Diamond Cage** is Anchor's behavioral containment engine. Built on WasmEdge, it compiles and executes suspect Python or Javascript scripts inside an isolated WebAssembly sandbox.

### 6.1 Isolation Guarantees
* **Filesystem:** The sandbox mounts only a local `/app` directory, completely isolating the host filesystem.
* **Network:** Sockets are closed by default; external requests are blocked unless explicitly whitelisted in the constitution.
* **Environment:** System environment variables are stripped to prevent credential harvesting.
* **Timeouts:** Execution is bound by gas limits to prevent denial-of-service loops.

### 6.2 Differential Verification
During testing, the sandbox executes both the original script and any recommended code changes, generating behavior snapshots (stdout, stderr, exit codes, and resource metrics). The comparisons lead to one of four verdicts:

$$\text{Verdict} \in \{\text{PROVED\_SAFE}, \text{BEHAVIOR\_CHANGED}, \text{MALICIOUS\_HALLUCINATION}, \text{CAGE\_ERROR}\}$$

Below is the workflow showing how raw files are isolated and behavioral snapshots compared:

```diagram-sandbox
```

---

## 7. Audit Layer: Decision Audit Chain (DAC)
Every inference or tool execution intercepted by the `@anchor.enforce` wrapper produces an `AuditEntry`. These entries are cryptographically chained to construct the Decision Audit Chain.

### 7.1 Mathematical Chaining
The chain hash ($H_n$) for the current entry is computed using the previous block's hash and the SHA-256 digest of the current entry's findings:

$$H_n = \text{SHA256}(H_{n-1} \mathbin{\Vert} e_n.\text{findings\_hash})$$

where $H_0 = 0^{64}$ (the genesis hash).

Each entry additionally carries an HMAC-SHA256 signature calculated over the canonical JSON payload:

$$\text{Signature} = \text{HMAC-SHA256}(e_n.\text{canonical\_json}, \text{ANCHOR\_SECRET\_KEY})$$

The following flowchart details the hash chaining logic and telemetry split:

```diagram-chain
```

### 7.2 Regulatory Polyglottism
The `AuditEntry` class exposes polymorphic output methods that dynamically translate the underlying compliance finding into jurisdiction-specific dialects:
* `adverse_action_reasons()`: Formats explainability tokens to satisfy CFPB Regulation B.
* `cims_payload()`: Emits JSON payloads matching the RBI CIMS reporting format.
* `eu_article12_record()`: Exports tamper-evident logs compliant with Article 12 of the EU AI Act.
* `sec_item105_record()`: Formats cybersecurity materiality events for SEC Item 1.05 disclosures.

---

## 8. Case Studies & Evaluation
We evaluated Anchor v4.3.5 against four widely deployed open-source codebases, scanning them using Tree-sitter queries for AI compliance vulnerabilities:

1. **FINOS Architecture-as-Code:** 684 files scanned. Detected 11 blockers matching `[FINOS-002, OWASP-003, SEC-002]` for data poisoning, specifically uncovering unencrypted MongoDB upsert operations.
2. **HuggingFace Hub:** 164 files scanned. Found 12 blockers, including shell injection vectors `[SEC-007]` in `cli/lfs.py` and unvalidated LLM output consumption `[ALN-001]` in `inference/_client.py`.
3. **Django:** 898 files scanned. Discovered 7 blockers matching `[SEC-007]` Shell Injection across management commands and translation helper scripts.
4. **OpenSpiel:** 602 files scanned. Detected 4 blockers matching `[SEC-007]` for unsandboxed `subprocess.Popen` calls executing game engine integrations influenced by LLM parameters.

All validation runs completed with an AST evaluation overhead of **less than 2.1ms** per scan pass.

---

## 9. Conclusion
Autonomous agent deployments require deterministic security boundaries to operate safely within regulated industries. By combining static Tree-sitter AST queries, WebAssembly-based behavioral verification (Diamond Cage), and cryptographically chained logs (Decision Audit Chain), **Anchor** bridges the gap between capabilities and compliance. Anchor v4.3.5 is available as open-source software (Apache 2.0) at `github.com/AnimusLab/anchor` and on PyPI as `anchor-audit`.

---

## References
1. European Parliament and Council. Regulation (EU) 2024/1689 (Artificial Intelligence Act). *Official Journal of the European Union*, 2024.
2. Reserve Bank of India. *Framework for Responsible and Ethical Enablement of AI (FREE-AI)*. Technical report, RBI, August 2025.
3. Consumer Financial Protection Bureau. *Goldman Sachs Enforcement and Adverse Action Obligations*. CFPB Circular, October 2024.
4. U.S. Securities and Exchange Commission. *2026 Examination Priorities*. Division of Examinations, January 2026.
5. L. Kao. *Constant-size cryptographic evidence structures for regulated AI*. arXiv:2511.17118, 2025.
6. B. Schneier and J. Kelsey. *Secure audit logs to support computer forensics*. ACM TISSEC, 2(2):159–176, 1999.
7. S. Crosby and D. Wallach. *Efficient data structures for tamper-evident logging*. In *USENIX Security*, 2009.
