# Anchor Governance Access Control Matrix

## AUDITOR TYPES - Complete Feature Comparison

### **1. STANDARD AUDITOR (Hub-Scoped)**

**Current Example in System:** 
- (None currently active - Ready for provisioning)
- Would be assigned to single hub like `AN-IN-SOL01`

**Clearance ID Format:** `AUD-HUB-[ORG]-[NUM]`  
**Portal:** `oversight.anchorgovernance.tech` (Unified Oversight Gateway)  
**Token Scope:** `standard_auditor`  
**Surface Type:** Hub-Scoped Operational (constitutionally rendered)

#### Features:

| Feature | Status | Details |
|---------|--------|---------|
| **Visibility Boundary** | ✓ HUB_ONLY | Can only see assigned hub data |
| **Can View Violations** | ✓ YES | Hub-level violations only |
| **Can View Audit Trail** | ✓ YES | Hub operation history |
| **Can Access Governance Reports** | ✓ YES | Hub compliance reports |
| **Can Inspect Replays** | ✗ DENIED | No replay authority |
| **Can Request Replay** | ✗ DENIED | No replay capability |
| **Can Export Data** | ✓ RESTRICTED | Hub reports only |
| **Can View Agents** | ✓ YES | Hub agents only |
| **Can See Codebases** | ✗ DENIED | System codebases hidden |
| **Can Issue Notices** | ✗ NO | Observation only |
| **Can Access Cross-Hub Data** | ✗ NO | Isolated to single hub |
| **Can Access Forensic Payloads** | ✗ DENIED | Restricted |
| **Tenure** | — | Per-hub assignment (indefinite) |

**Dashboard Type:** OPERATIONAL  
**Visual Tone:** Operational focus, hub-level metrics, live dashboards

---

### **2. CROSS-HUB AUDITOR (Enterprise Governance)**

**Current Example in System:**
- (None currently active)
- Would have visibility: `['AN-IN-SOL01', 'AN-GLOBAL-HUB']`

**Clearance ID Format:** `AUD-ENT-[ORG]-[NUM]`  
**Portal:** `oversight.anchorgovernance.tech` (Unified Oversight Gateway)  
**Token Scope:** `cross_hub_auditor`  
**Surface Type:** Organization-Scoped Analytics (constitutionally rendered)

#### Features:

| Feature | Status | Details |
|---------|--------|---------|
| **Visibility Boundary** | ✓ ORG_WIDE | All org hubs visible |
| **Can View Violations** | ✓ YES | Cross-hub statistics |
| **Can View Audit Trail** | ✓ YES | Organization-wide history |
| **Can Access Governance Reports** | ✓ YES | Org-level compliance |
| **Can Inspect Replays** | ✓ REQUEST_BASED | Requires owner approval |
| **Can Request Replay** | ✓ YES | With approval gate |
| **Can Export Data** | ✓ YES | Org-wide analytics exports |
| **Can View Agents** | ✓ YES | All org agents |
| **Can See Codebases** | ✗ DENIED | Codebase repositories hidden |
| **Can Issue Notices** | ✗ NO | Observation only |
| **Can Access Cross-Hub Data** | ✓ YES | Metadata across all hubs |
| **Can Access Forensic Payloads** | ✓ RESTRICTED | Limited by policy |
| **Can View Governance Heatmap** | ✓ YES | Org-wide governance visualization |
| **Tenure** | — | Indefinite (org-wide role) |

**Dashboard Type:** OBSERVABILITY  
**Visual Tone:** Enterprise analytics, heatmaps, trend analysis, SOC-like interface

---

### **3. REGULATORY AUDITOR (System-Wide)**

**Current Example in System:** ✓ **ACTIVE**
- **Clearance ID:** `AUD-RB-INDIA-359`
- **Name:** Regulatory Official
- **Jurisdiction:** IN (India)
- **Portal:** `oversight.anchorgovernance.tech` (separate domain)
- **Token Scope:** `regulator`

**Clearance ID Format:** `AUD-[COUNTRY/REGULATOR]-[NAME]-[NUM]`  
**Portal:** `oversight.anchorgovernance.tech` (Unified Oversight Gateway)  
**Token Scope:** `regulatory_auditor`  
**Surface Type:** Jurisdiction-Scoped Forensic (constitutionally rendered)  
**Access Level:** `READ_ONLY`

#### Features:

| Feature | Status | Details |
|---------|--------|---------|
| **Visibility Boundary** | ✓ SYSTEM_WIDE | Can see all entities (with filters) |
| **Can View Violations** | ✓ YES | System-wide audit data |
| **Can View Audit Trail** | ✓ YES | Cross-system governance trail |
| **Can Access Governance Reports** | ✓ YES | Jurisdiction-specific exports |
| **Can Inspect Replays** | ✓ REQUEST_BASED | Forensic replay access |
| **Can Request Replay** | ✓ YES | Full forensic capability |
| **Can Export Data** | ✓ YES | Jurisdictional compliance exports |
| **Can View Agents** | ✓ YES | All AI agents (codebases hidden) |
| **Can See Codebases** | ✗ DENIED | Unless escalation granted |
| **Can Issue Notices** | ✓ YES | Regulatory enforcement |
| **Can Force Compliance** | ✓ YES | Issue remediation orders |
| **Can Access Forensic Payloads** | ✓ RESTRICTED | Escalation available |
| **Can Access Cross-Jurisdiction** | ✓ YES | Multi-jurisdiction visibility |
| **Dashboard Type** | — | FORENSIC/REGULATORY |
| **Tenure** | — | Investigation-scoped or indefinite |
| **Requires Escalation for** | — | Forensic payloads, codebase review |

**Dashboard Type:** FORENSIC  
**Visual Tone:** Evidentiary focus, legal documentation, compliance certification, enforcement authority

---

## ENTERPRISE ROLES - Complete Feature Comparison

### **OWNER (Hub Authority)**

**Current Example in System:** ✓ **ACTIVE**
- **Clearance ID:** `OWN-AN-SOLAPUR-999`
- **Name:** Tanishq Dasari
- **Organization:** animuslab
- **Hub:** AN-IN-SOL01
- **Jurisdiction:** India (IN)
- **Token Scope:** `owner_relay`

**Clearance ID Format:** `OWN-[ORG]-[HUB]-[NUM]`  
**Portal:** `app.anchorgovernance.tech` (Unified Enterprise Gateway)  
**Token Scope:** `owner_relay`  
**Surface Type:** Hub Management (constitutionally rendered)  
**Clearance Level:** `OWNER_ROOT`

#### Features:

| Feature | Status | Details |
|---------|--------|---------|
| **Hub Visibility** | ✓ FULL | Complete hub access |
| **Can Modify Constitution** | ✓ YES | Change governance policies |
| **Can Invite Team Members** | ✓ YES | Add developers/auditors |
| **Can Create Agents** | ✓ YES | Deploy new AI agents |
| **Can Access Replays** | ✓ YES | Full replay authority |
| **Can Export Data** | ✓ YES | Unrestricted exports |
| **Can Approve Replay Requests** | ✓ YES | Governance gatekeeper |
| **Can Manage Auditors** | ✓ YES | Assign auditor access |
| **Can Provision Spoke Nodes** | ✓ YES | Add to mesh topology |
| **Can Modify Team Permissions** | ✓ YES | Manage developer roles |
| **Can Delete/Archive Entities** | ✓ YES | Governance lifecycle |
| **Can Access Forensic Payloads** | ✓ YES | Full access |
| **Can Create Master Keys** | ✓ YES | Cryptographic authority |
| **Multi-Hub Access** | — | Limited to assigned hub |
| **Cross-Organization Visibility** | ✗ NO | Single org only |

**Portal:** Hub operational dashboard  
**Session Duration:** Verified via Sovereign Hub TOTP re-authentication periodically  
**Maximum Delegation:** Can create other owners for same hub

---

### **DEVELOPER (Operational Team)**

**Current Example in System:** ✓ **ACTIVE**
- **Clearance ID:** `DEV-AN-SOLAPUR-142`
- **Name:** Sarah Chen
- **Organization:** animuslab
- **Hub:** AN-IN-SOL01
- **Jurisdiction:** India (IN)
- **Token Scope:** `dev_member`

**Clearance ID Format:** `DEV-[ORG]-[HUB]-[NUM]`  
**Portal:** `app.anchorgovernance.tech` (Unified Enterprise Gateway)  
**Token Scope:** `dev_member`  
**Surface Type:** Operational Team (constitutionally rendered)  
**Clearance Level:** `DEV_OPERATIONAL`

#### Features:

| Feature | Status | Details |
|---------|--------|---------|
| **Hub Visibility** | ✓ MEMBER | Hub-level access only |
| **Can Modify Constitution** | ✗ NO | Read-only policy access |
| **Can Create Agents** | ✓ YES | Deploy AI agents |
| **Can Access Agent Logs** | ✓ YES | Operational debugging |
| **Can Access Replays** | ✗ NO | Restricted from replay authority |
| **Can Request Replay** | ✓ YES | Via owner approval |
| **Can Export Data** | ✗ RESTRICTED | Limited operational exports |
| **Can View Governance** | ✓ YES | Read-only view |
| **Can Manage Team** | ✗ NO | No user management |
| **Can Invite Others** | ✗ NO | Owner-only invitation |
| **Can Create Master Keys** | ✗ NO | Owner-only capability |
| **Can Access Forensic Payloads** | ✗ DENIED | Forensic access denied |
| **Can Modify Permissions** | ✗ NO | Owner-controlled |
| **Can Deploy Policies** | ✓ YES | Subject to owner approval |
| **Can Delete Agents** | ✗ NO | Owner approval required |

**Portal:** Hub operational dashboard (reduced features)  
**Session Duration:** Standard JWT expiration (24h, TOTP on next login)  
**Supervision:** All actions logged for owner review

---

## Quick Reference Comparison Table

| Capability | Standard Auditor | Cross-Hub Auditor | Regulatory Auditor | Owner | Developer |
|------------|------------------|-------------------|-------------------|-------|-----------|
| **Visibility** | HUB_ONLY | ORG_WIDE | SYSTEM_WIDE | HUB_OWNER | HUB_MEMBER |
| **Scope** | Single Hub | All Org Hubs | All Systems | Single Hub | Single Hub |
| **Can Create** | — | — | — | Agents, Policies | Agents |
| **Can Modify** | — | — | — | Constitution | Deployments |
| **Can Replay** | DENIED | REQUEST_BASED | REQUEST_BASED | YES | REQUEST_BASED |
| **Can Export** | HUB_ONLY | ORG_ANALYTICS | JURISDICTION | FULL | RESTRICTED |
| **Can Issue Notices** | NO | NO | YES | NO | NO |
| **Forensic Access** | DENIED | RESTRICTED | RESTRICTED | FULL | DENIED |
| **Portal Domain** | dashboard | dashboard | oversight | app | app |
| **Dashboard Type** | Operational | Observability | Forensic | Operational | Operational |
| **Can Manage Users** | NO | NO | NO | YES | NO |
| **Portal Domain** | oversight.* | oversight.* | oversight.* | app.* | app.* |
| **Portal Type** | Unified Oversight | Unified Oversight | Unified Oversight | Unified Enterprise | Unified Enterprise |
| **Surface Rendering** | Hub-Scoped | Org-Wide | Jurisdiction | Hub Management | Operational |

---

## Access Isolation Diagram

### **Constitutional Capability Rendering Model**

```
┌───────────────────────────────────────────────────────────────────┐
│                 UNIFIED OVERSIGHT GATEWAY                         │
│              oversight.anchorgovernance.tech                       │
│                                                                   │
│    All Auditors (Standard, Cross-Hub, Regulatory) login here      │
│                           ↓                                        │
│            Clearance Resolution Engine (Backend)                   │
│         Determines: type, scope, jurisdiction, perms              │
│                           ↓                                        │
│         Dynamic Frontend Rendering (Permission-Gated)             │
│                           ↓                                        │
│    ┌────────────┬─────────────────┬──────────────────┐            │
│    │ STANDARD   │   CROSS-HUB     │  REGULATORY      │            │
│    │ AUDITOR    │   AUDITOR       │  AUDITOR         │            │
│    │            │                 │                  │            │
│    │ HUB_ONLY   │   ORG_WIDE      │ JURISDICTIONAL   │            │
│    │ Scope      │   Scope         │ Scope            │            │
│    │            │                 │                  │            │
│    │ Features:  │ Features:       │ Features:        │            │
│    │ • Hub      │ • Federation    │ • Evidentiary    │            │
│    │   audit    │   analytics     │   UI             │            │
│    │ • Local    │ • Multi-hub     │ • Forensic       │            │
│    │   reports  │   lineage       │   replay         │            │
│    │ • Export   │ • Comparative   │ • Jurisdiction   │            │
│    │   (local)  │   metrics       │   mapping        │            │
│    │            │ • Replay req    │ • Notice issue   │            │
│    │            │   (approval)    │ • Escalation     │            │
│    └────────────┴─────────────────┴──────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                 UNIFIED ENTERPRISE GATEWAY                        │
│              app.anchorgovernance.tech                            │
│                                                                   │
│  All Enterprise Roles (Owner, Developer) login here              │
│                           ↓                                        │
│        Role + Scope Resolution Engine (Backend)                   │
│   Determines: role, hub, org, permissions, authority              │
│                           ↓                                        │
│         Dynamic Frontend Rendering (Permission-Gated)             │
│                           ↓                                        │
│    ┌──────────────────┬──────────────────┐                        │
│    │ OWNER            │  DEVELOPER       │                        │
│    │                  │                  │                        │
│    │ FULL AUTHORITY   │  OPERATIONAL     │                        │
│    │                  │                  │                        │
│    │ Features:        │ Features:        │                        │
│    │ • Policy modify  │ • Agent create   │                        │
│    │ • Team manage    │ • Agent logs     │                        │
│    │ • Agents create  │ • Governance     │                        │
│    │ • Auditor assign │   view (RO)      │                        │
│    │ • Constitution   │ • Replay req     │                        │
│    │   modify         │                  │                        │
│    │ • Key management │                  │                        │
│    └──────────────────┴──────────────────┘                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

KEY ARCHITECTURAL PRINCIPLE:
═════════════════════════════════════════════════════════════════════
NOT: Dashboard-driven governance
YES: Identity-driven constitutional rendering

Backend determines what user can see.
Frontend renders ONLY injected capabilities.
Same portal, different surfaces per clearance.
```

---

## Summary: Governance Portal Architecture

This system implements **Constitutional Capability Surfaces** — not multiple dashboards, but one unified portal per domain with backend-driven feature gating.

### **Oversight Portal Structure**

**Single Gateway:** `oversight.anchorgovernance.tech`

All auditors (Standard, Cross-Hub, Regulatory) log in here. Backend determines their clearance level and injects capabilities. Frontend renders constitutionally-allowed features only.

**Why This Is Superior:**
- One authentication gateway for all auditors
- Backend controls governance, not UI
- Same portal, dynamically materialized per identity
- Scales to N auditor types without new dashboards
- Matches institutional security architecture patterns

### **Enterprise Portal Structure**

**Single Gateway:** `app.anchorgovernance.tech`

All enterprise roles (Owner, Developer) log in here. Backend determines their role, hub, org, and permissions. Frontend renders allowed management controls only.

**Same Architectural Pattern:**
- One authentication gateway for all enterprise users
- Backend controls authority delegation
- Same portal, different permission surfaces
- Secure, scalable, professional

---

## Current System Status

### **Active Auditors:**
✓ **Regulatory Auditor:** `AUD-RB-INDIA-359`
- Name: Regulatory Official
- Type: REGULATORY_AUDITOR  
- Jurisdiction: INDIA (IN)
- Portal: oversight.anchorgovernance.tech (shared with all auditors)
- Rendered Surface: Jurisdiction-scoped forensic oversight
- Capabilities: Lineage verify, audit inspect, replay request, notice issue, compliance verify

⊘ **Standard Auditors:** None provisioned yet  
⊘ **Cross-Hub Auditors:** None provisioned yet

### **Active Enterprise Users:**
✓ **Owner:** `OWN-AN-SOLAPUR-999`
- Name: Tanishq Dasari
- Type: OWNER
- Hub: AN-IN-SOL01
- Organization: animuslab
- Portal: app.anchorgovernance.tech (shared with all enterprise roles)
- Rendered Surface: Full hub management dashboard

✓ **Developer:** `DEV-AN-SOLAPUR-142`
- Name: Sarah Chen
- Type: DEVELOPER
- Hub: AN-IN-SOL01
- Organization: animuslab
- Portal: app.anchorgovernance.tech (shared with all enterprise roles)
- Rendered Surface: Operational team controls (limited)
