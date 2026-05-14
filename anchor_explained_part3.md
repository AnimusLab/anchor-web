# Anchor — Explained Like You Built It (Part 3: The Sandbox, The Mesh, and The Full Stack)

## The Diamond Cage: Pre-Deployment Behavioral Verification

The Diamond Cage is a WASM-based sandbox that provides one specific guarantee: it can mathematically prove that a piece of code is safe to execute, or that a proposed security patch does not break existing behavior. It is not used during live conversations. It is a pre-deployment verification tool invoked by running "anchor check" with the sandbox flag.

The sandbox uses WasmEdge, a WebAssembly runtime, to execute Python code in complete isolation. When the Cage runs a file, it creates a WASM environment with four hard constraints. First, the filesystem is restricted to a single /app mount — the code cannot read or write anything outside this directory. Second, network access is completely blocked — the code cannot make HTTP requests, open sockets, or resolve DNS. Third, the host environment is stripped — no access to environment variables, no access to the parent process. Fourth, execution time is enforced — if the code runs longer than the timeout, the Cage kills the WASM process and returns an error verdict.

The most powerful feature of the Diamond Cage is differential verification, implemented in a function called verify_patch. This function takes two scripts: the original and the patched version. It runs both inside the Cage, each in their own isolated WASM process, and captures a BehaviorSnapshot for each — the stdout output, the stderr output, the exit code, and the execution timing. It then compares the two snapshots. If they are identical, the verdict is PROVED_SAFE, meaning the patch does not change the observable behavior of the code. If the stdout or exit code differs, the verdict is BEHAVIOUR_CHANGED, meaning the patch alters what the code does. If the patched code attempts to access the filesystem outside /app or tries to open network connections, the verdict is MALICIOUS_HALLUCINATION, meaning the patch is actively hostile.

This is specifically designed for the AI-assisted code repair workflow. When the Healer module generates a fix for a security violation, you do not blindly trust that the AI's suggested fix is correct. You run it through the Diamond Cage, and the Cage proves mathematically — through behavioral comparison — whether the fix preserves the original functionality. If it does not, the fix is rejected.

## The Healer: Auto-Remediation

The Healer is the module that generates fix suggestions for violations found by Layer 1. When a developer runs "anchor heal," the Healer examines each violation and attempts to produce a corrected version of the offending code. It does not silently apply changes. It suggests, and the developer reviews and accepts or rejects each suggestion. This follows the "suggest, never silently mutate" governance philosophy.

The Healer works by loading the mitigation catalog, which is a file called mitigation.anchor that maps each rule ID to a detection pattern and a corresponding fix template. For example, if the violation is SEC-007 (subprocess execution), the mitigation catalog knows that subprocess.run(cmd, shell=True) should be replaced with subprocess.run(cmd, shell=False), and that the fix should add input validation. The Healer applies these templates to the specific code context and presents the diff to the developer.

## The Verdict Engine: Architectural Drift Analysis

The Verdict Engine in verdicts.py performs a different kind of analysis than the PolicyEngine. While the PolicyEngine checks individual code patterns against rules, the Verdict Engine examines the overall architectural intent of the codebase. It looks at the git history to understand how the code has evolved, identifies patterns of architectural drift — where the codebase is slowly moving away from its original design constraints — and generates structured remediation instructions.

The output of the Verdict Engine is not a simple "violation found" message. It produces a verdict document that explains what the original architectural intent was, how the current code deviates from it, and what specific changes would bring it back into alignment. These verdicts are designed to be relayed to the developer through an AI assistant, which is why the conversation stays live even when a violation is detected — the verdict becomes part of the conversation, not a termination signal.

## The Sovereign Identity Mesh: How Organizations Connect

The Sovereign Mesh is the web platform that connects multiple organizations into a federated governance network. It is built on a Hub-and-Spoke architecture where data sovereignty is the absolute priority.

### The Hub Node

The Hub is a FastAPI application that serves as the central registry and relay point. It runs at api.anchorgovernance.tech (or whatever domain the operator configures). The Hub stores only metadata — it never stores raw forensic payloads. When the Hub starts, it requires an ANCHOR_MASTER_KEY environment variable. If this key is missing, the server prints a critical security failure message and exits immediately. This key is used to derive encryption keys for the forensic relay and to sign JWT tokens for dashboard authentication.

The Hub exposes several API surfaces. The auth router handles enterprise registration (creating organizations with a hub_id, domain, region, and user accounts), login, email verification, and team member invitations. The oversight router handles regulator authentication using TOTP-based two-factor authentication — regulators log in with their clearance ID and a Google Authenticator code, not a password. The fleet router handles project management — creating and configuring individual AI projects within an organization. The ledger router handles audit chain ingestion and querying. And the WebSocket endpoint at /ws/spoke handles the persistent relay connections from Spoke nodes.

### The Spoke Node

The Spoke node is a lightweight FastAPI application that runs on the enterprise's own infrastructure. It could be a Docker container on their VPS, a bare-metal server in their data center, or a Kubernetes pod in their private cloud. The Spoke has one job: store full forensic payloads locally and relay metadata to the Hub.

When the Anchor SDK in a developer's application sends an audit entry to the ANCHOR_LEDGER_URL, it arrives at the Spoke's /api/spoke/ingest endpoint. The Spoke authenticates the request by comparing the Machine Access Token in the request body against the MAT configured in its environment. If it matches, the Spoke writes the complete audit entry — including the full prompt text, the full response text, and all findings — to its local SQLite database. This data never leaves the enterprise's perimeter unless explicitly requested.

After storing the full payload, the Spoke constructs a lightweight AuditHeader — about 200 bytes — containing only the entry_id, the chain_hash, the is_compliant flag, the rule_id (if any), and the timestamp. It pushes this header to the Hub over a persistent WebSocket connection. The Hub stores this header in its own ledger. No raw data crosses the enterprise perimeter during normal operations.

### The Forensic Pull

When a regulator using the Oversight Dashboard wants to inspect the raw details of a specific audit entry, the system performs a forensic pull. The regulator clicks "View Details" on an entry in their dashboard. The Hub sends a FORENSIC_PULL message to the appropriate Spoke over the WebSocket, including the entry_id and the auditor's identity. The Spoke receives this message, fetches the raw payload from its local SQLite, encrypts it using AES-256-GCM with a 96-bit nonce and the Hub's public key, and sends the encrypted blob back to the Hub as a FORENSIC_RESPONSE message. The Hub decrypts the payload using the ANCHOR_MASTER_KEY and serves it to the auditor's browser.

This design means raw forensic data only travels over the brokered WebSocket relay, never over REST. It is always encrypted with AES-256-GCM. The enterprise controls their Spoke, so they control their data. The Hub can never access raw data without the Spoke's active participation in the relay. And every forensic pull is logged with the auditor's identity, creating an audit trail of who accessed what evidence and when.

### The Relay Protocol

The relay protocol defines seven message types. SPOKE_REGISTER is sent by the Spoke when it first connects to the Hub — it includes the Machine Access Token for authentication. AUDIT_HEADER is the lightweight metadata push from Spoke to Hub. FORENSIC_PULL is the Hub requesting raw data from a Spoke on behalf of an auditor. FORENSIC_RESPONSE is the Spoke's encrypted reply. HUB_ACK and HUB_REJECT are acknowledgement messages. PING and PONG are keepalives to maintain the WebSocket connection. All messages are wrapped in a RelayMessage envelope that includes the message type, the entity_id of the sender, a timestamp, and an optional payload.

The Spoke maintains the WebSocket connection in a background asyncio task called relay_loop. If the connection drops, the Spoke automatically reconnects after five seconds. This makes the system resilient to network interruptions — the Spoke keeps accumulating audit data locally, and when the connection is restored, new headers start flowing to the Hub again.

## The Database Schema

The Hub's database uses SQLAlchemy with SQLite (migrating to Neon PostgreSQL for production). There are six tables.

Organizations represent companies or regulator agencies. Each organization has a unique hub_id (a human-readable slug like "animuslab"), a display_name, a domain (like "animuslab.ai"), a region, an org_type (either "enterprise" or "regulator"), and a master_key_hash. The hub_id is what users type when logging in — it is the organizational identity.

Fleet represents individual AI projects within an organization. The entity_id is the primary key — it follows the pattern "orgname-projectname" (like "animuslab-marcus"). Each project has its own Machine Access Token hash (key_hash) for SDK authentication, a tier, and a provisioned_by field that tracks which manager created it.

Users are personal identities linked to organizations. Each user has an email, a role (owner, admin, lead, member, or regulator), and optionally a TOTP secret for two-factor authentication and a clearance_id for regulatory identity (like "SEC-JHONDOC-2604"). User status starts as "pending" and moves to "active" after email verification.

LedgerEntry stores the audit chain headers received from Spokes. Each entry has a chain_hash, a signature, a type (runtime_check or runtime_violation), and a payload field for the full JSON when the Hub has it. Entries link to each other through the parent_entry_id field, enabling chain traversal.

WebhookSubscription defines where and how to deliver audit events. Each subscription has a dialect (RBI, SEC, or EU) that determines which regulatory translation to apply, a webhook_url for delivery, and a webhook_secret for authenticating the delivery.

OrgInvite manages team member invitations. When a manager invites a new team member, an invite token is created with an expiration date, a target project, and a role. The invitee receives an email with a registration link that pre-fills their organization membership.

## The Frontend Portals

There are five frontend surfaces in the Sovereign Mesh.

The Landing Page is a static HTML site that serves as the public face of Anchor. It explains what the product does and provides links to the other portals.

The Enterprise Portal is a React application built with Vite. Its entry point is AuthPortal.jsx, which handles both login and registration. During registration, the user provides their company name, domain, email, password, and region. The backend creates an Organization, provisions the first User with the "owner" role, and sends a verification email through the Resend API. After login, the portal loads PrivateDashboard.jsx, which shows the organization's compliance scores, fleet status, and audit chain. The Ledger page displays the full audit trail with chain verification status. The Connect page shows developers how to integrate the Anchor SDK into their projects. The Profile page shows organization settings.

The Oversight Portal is a separate React application for regulators. Its LoginPage.jsx uses TOTP-based authentication — the regulator enters their clearance ID and a six-digit code from Google Authenticator. After login, the Dashboard shows the evidence vault — all audit headers from organizations in the regulator's jurisdiction, with the ability to trigger forensic pulls for detailed inspection.

The Root Admin Portal is a React application for system administrators. It provides org approval workflows, user management, and system-wide configuration.

The Mesh Globe is a standalone HTML page using Globe.gl to render a 3D hexagonal grid showing active Spoke nodes, relay connections, and real-time audit event flow across the network.

## Integrity Verification: How The System Protects Itself

Anchor protects its own governance files from tampering through three mechanisms. The first is SHA-256 seals on individual .anchor files. Each domain, framework, and regulator file can have a "seal" field in its YAML header that contains the expected SHA-256 hash of the file content. When the loader reads the file, it recomputes the hash and compares. If they do not match, the file has been tampered with, and the loader throws an error. During development, the seal is set to "sha256:PENDING" which bypasses the check, but in production releases, the seals are finalized.

The second mechanism is the GOVERNANCE.lock file. This is a file hosted in the Anchor GitHub repository that contains the SHA-256 hashes of every governance file in the domains, frameworks, and government directories. When "anchor check" runs, the loader downloads this lockfile, compares every local file's hash against the remote hash, and throws an INTEGRITY VIOLATION error if any file has been modified. The lockfile is cached locally as .anchor.lock for offline use, but the remote version takes priority when available.

The third mechanism is the hardcoded constitution hash in constitution.py. The SHA-256 hash of the official constitution.anchor file is baked into the Python package at release time. Even if someone overrides the constitution URL to point to a different server, the downloaded file's hash must match the hardcoded value. This means the only way to change the constitutional rules is to release a new version of the package — which requires publishing to PyPI, which has its own authentication and audit trail.

These three layers of integrity verification ensure that no one — not a developer, not an administrator, not even the organization's owner — can weaken the governance rules without the change being immediately detectable. The governance floor is truly immutable.
