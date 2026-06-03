# Governance Portal Architecture: Constitutional Capability Surfaces

## Executive Summary

**One unified portal per domain** with **backend-driven capability injection**.

Not multiple dashboards.  
Not dashboard-driven governance.

Instead: **Identity-driven constitutional rendering**.

---

## Portal Domains

### **DOMAIN 1: Oversight Infrastructure**
**Portal:** `oversight.anchorgovernance.tech`  
**Role Boundary:** ALL AUDITORS  
**Auth Pattern:** Unified governance gateway

### **DOMAIN 2: Enterprise Operations**
**Portal:** `app.anchorgovernance.tech`  
**Role Boundary:** ALL ENTERPRISE ROLES (Owner, Developer)  
**Auth Pattern:** Unified operational gateway

---

## UNIFIED OVERSIGHT PORTAL ARCHITECTURE

### **Single Portal, Multiple Clearance Surfaces**

```
┌──────────────────────────────────────────────────────────────┐
│         oversight.anchorgovernance.tech                       │
│                                                              │
│    ┌─────────────────────────────────────────────────────┐  │
│    │  Governance Authentication Gateway                   │  │
│    │                                                      │  │
│    │  1. Identity verification (OAuth/SAML/MFA)         │  │
│    │  2. Auditor type resolution                        │  │
│    │  3. Clearance level lookup                         │  │
│    │  4. Jurisdiction mapping                           │  │
│    └──────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│    ┌──────────────────▼──────────────────┐                  │
│    │  Clearance Resolution Engine         │                  │
│    │                                      │                  │
│    │  Backend Determines:                 │                  │
│    │  • auditor_type                      │                  │
│    │  • visibility_scope (HUB/ORG/SYSTEM) │                  │
│    │  • assigned_jurisdictions            │                  │
│    │  • replay_authority                  │                  │
│    │  • forensic_permissions              │                  │
│    │  • escalation_privileges             │                  │
│    │  • hub_assignments (if applicable)   │                  │
│    └──────────────────┬──────────────────┘                  │
│                       │                                      │
│    ┌──────────────────▼──────────────────────┐              │
│    │  Dynamic Frontend Surface Rendering     │              │
│    │                                         │              │
│    │  Injects capability token:              │              │
│    │  {                                      │              │
│    │    role: "STANDARD_AUDITOR",            │              │
│    │    scope: "HUB_ONLY",                   │              │
│    │    hub_id: "AN-IN-SOL01",              │              │
│    │    permissions: [                       │              │
│    │      "audit.view",                      │              │
│    │      "violations.read",                 │              │
│    │      "reports.export"                   │              │
│    │    ]                                    │              │
│    │  }                                      │              │
│    └──────────────────┬──────────────────────┘              │
│                       │                                      │
│    ┌──────────────────▼────────────┐                        │
│    │  Constitutional Dashboard      │                        │
│    │  (Capability-Gated UI)         │                        │
│    │                                │                        │
│    │  Renders only:                 │                        │
│    │  • Permitted navigation items  │                        │
│    │  • Allowed data views          │                        │
│    │  • Accessible features         │                        │
│    │  • Authorized actions          │                        │
│    └────────────────────────────────┘                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## AUDITOR SURFACES (All via `oversight.anchorgovernance.tech`)

### **Surface 1: STANDARD AUDITOR**

**Injected Clearance:**
```json
{
  "type": "STANDARD_AUDITOR",
  "scope": "HUB_ONLY",
  "assigned_hub": "AN-IN-SOL01",
  "permissions": [
    "audit.read",
    "violations.read",
    "reports.export_hub",
    "governance.view"
  ],
  "denied_actions": [
    "replay.request",
    "forensic.access",
    "cross_hub.view",
    "escalation.request"
  ]
}
```

**Frontend Renders:**
- Single hub dashboard
- Operational audit chains
- Local violation summaries
- Hub-level governance reports
- Export button (hub data only)

**Frontend Hides:**
- Federation analytics
- Cross-hub lineage
- Forensic panels
- Escalation tools
- Regulatory jurisdiction pickers

**UI Tone:** Lightweight, operational, focused

---

### **Surface 2: CROSS-HUB AUDITOR**

**Injected Clearance:**
```json
{
  "type": "CROSS_HUB_AUDITOR",
  "scope": "ORG_WIDE",
  "assigned_org": "animuslab",
  "assigned_hubs": ["AN-IN-SOL01", "AN-GLOBAL-HUB", "AN-EU-BCEU"],
  "permissions": [
    "audit.read",
    "violations.read",
    "reports.export_org",
    "governance.view",
    "federation.analytics",
    "lineage.inspect",
    "replay.request_approval",
    "forensic.restricted"
  ],
  "denied_actions": [
    "replay.direct",
    "forensic.full_access",
    "escalation.issue",
    "system_wide.view"
  ]
}
```

**Frontend Renders:**
- Multi-hub federation view
- Cross-hub governance analytics
- Organizational heatmaps
- Comparative governance metrics
- Fleet inspection dashboards
- Replay request interface (with approval gate)
- Limited forensic visibility

**Frontend Hides:**
- Regulatory enforcement tools
- System-wide controls
- Escalation panels
- Regulatory notices
- Raw source code access

**UI Tone:** Enterprise analytics, federation-focused, SOC-like

---

### **Surface 3: REGULATORY AUDITOR**

**Injected Clearance (Example: `AUD-RB-INDIA-359`):**
```json
{
  "type": "REGULATORY_AUDITOR",
  "scope": "JURISDICTIONAL",
  "jurisdiction": "INDIA",
  "access_level": "READ_ONLY",
  "permissions": [
    "audit.read",
    "violations.read",
    "reports.export_jurisdiction",
    "governance.view",
    "lineage.verify",
    "replay.request",
    "forensic.restricted",
    "escalation.request",
    "notices.issue",
    "compliance.verify"
  ],
  "escalation_available": [
    "forensic.payloads",
    "source_review",
    "enforcement_authority"
  ]
}
```

**Frontend Renders:**
- Jurisdiction-filtered oversight
- Constitutional audit chains
- Governance lineage explorer
- Compliance verification dashboard
- Replay request system
- Notice issuance interface
- Escalation request panel
- Evidentiary export tools
- Jurisdiction mapping interface
- Cross-enterprise visibility (filtered)

**Frontend Hides:**
- Raw execution internals
- Sensitive sovereign operations (until escalated)
- Proprietary business logic
- Non-compliant jurisdictions

**UI Tone:** Evidentiary, legal focus, enforcement-ready, jurisdictional

---

## UNIFIED ENTERPRISE PORTAL ARCHITECTURE

### **DOMAIN: `app.anchorgovernance.tech`**

```
┌──────────────────────────────────────────────────────────────┐
│         app.anchorgovernance.tech                             │
│                                                              │
│    ┌─────────────────────────────────────────────────────┐  │
│    │  Enterprise Authentication Gateway                   │  │
│    │                                                      │  │
│    │  1. Identity verification (OAuth/SAML/MFA)         │  │
│    │  2. Role resolution (Owner/Developer/Admin)        │  │
│    │  3. Hub + Org scope lookup                         │  │
│    │  4. Sovereignty authority check                    │  │
│    └──────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│    ┌──────────────────▼──────────────────────────────────┐  │
│    │  Role + Scope Resolution Engine                    │  │
│    │                                                     │  │
│    │  Backend Determines:                                │  │
│    │  • role_type (OWNER/DEVELOPER/etc)                │  │
│    │  • assigned_hub                                    │  │
│    │  • assigned_org                                    │  │
│    │  • sovereign_authority_level                       │  │
│    │  • policy_modification_rights                      │  │
│    │  • team_management_rights                          │  │
│    │  • agent_creation_authority                        │  │
│    │  • escalation_privileges                           │  │
│    └──────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│    ┌──────────────────▼────────────────────────────────┐    │
│    │  Dynamic Frontend Surface Rendering               │    │
│    │                                                   │    │
│    │  Injects role token:                              │    │
│    │  {                                                │    │
│    │    role: "OWNER",                                 │    │
│    │    hub: "AN-IN-SOL01",                           │    │
│    │    org: "animuslab",                             │    │
│    │    permissions: [                                 │    │
│    │      "policy.modify",                             │    │
│    │      "team.manage",                               │    │
│    │      "agents.create",                             │    │
│    │      "replays.approve",                           │    │
│    │      "auditors.assign"                            │    │
│    │    ]                                              │    │
│    │  }                                                │    │
│    └──────────────────┬────────────────────────────────┘    │
│                       │                                      │
│    ┌──────────────────▼────────────┐                        │
│    │  Constitutional Dashboard      │                        │
│    │  (Role-Gated Operational UI)   │                        │
│    │                                │                        │
│    │  Renders only:                 │                        │
│    │  • Permitted hub/org scope     │                        │
│    │  • Authorized operations       │                        │
│    │  • Relevant management panels  │                        │
│    │  • Available actions           │                        │
│    └────────────────────────────────┘                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Surface 1: OWNER**

**Injected Clearance:**
```json
{
  "role": "OWNER",
  "hub": "AN-IN-SOL01",
  "org": "animuslab",
  "jurisdiction": "INDIA",
  "permissions": [
    "policy.modify",
    "policy.view",
    "agents.create",
    "agents.modify",
    "team.manage",
    "auditors.assign",
    "replays.approve",
    "constitution.modify",
    "keys.create",
    "escalation.handle"
  ]
}
```

**Frontend Renders:**
- Full hub management dashboard
- Policy editor
- Agent deployment interface
- Team management panel
- Auditor assignment controls
- Replay approval queue
- Constitution modification tools
- Key management interface
- Governance statistics

---

### **Surface 2: DEVELOPER**

**Injected Clearance:**
```json
{
  "role": "DEVELOPER",
  "hub": "AN-IN-SOL01",
  "org": "animuslab",
  "permissions": [
    "agents.create",
    "agents.view",
    "governance.view",
    "replays.request",
    "logs.access"
  ],
  "denied_actions": [
    "policy.modify",
    "team.manage",
    "auditors.assign",
    "keys.manage",
    "constitution.modify"
  ]
}
```

**Frontend Renders:**
- Agent deployment (limited)
- Agent logs and monitoring
- Governance view (read-only)
- Replay request interface
- Team roster (read-only)

**Frontend Hides:**
- Policy editor
- Team management
- Auditor controls
- Key management
- Constitution editor

---

## Backend Implementation Pattern

### **Standard Clearance Resolution Flow**

```python
# In server/auth.py or similar

def resolve_auditor_clearance(user_id, auditor_type, jurisdiction):
    """
    Backend determines complete capability surface.
    Frontend receives ONLY the injected permissions.
    """
    if auditor_type == "STANDARD_AUDITOR":
        return {
            "type": "STANDARD_AUDITOR",
            "scope": "HUB_ONLY",
            "assigned_hub": get_auditor_hub_assignment(user_id),
            "permissions": [
                "audit.read",
                "violations.read",
                "reports.export_hub",
                "governance.view"
            ]
        }
    
    elif auditor_type == "CROSS_HUB_AUDITOR":
        return {
            "type": "CROSS_HUB_AUDITOR",
            "scope": "ORG_WIDE",
            "assigned_hubs": get_auditor_org_hubs(user_id),
            "permissions": [
                "audit.read",
                "violations.read",
                "reports.export_org",
                "governance.view",
                "federation.analytics",
                "lineage.inspect",
                "replay.request_approval",
                "forensic.restricted"
            ]
        }
    
    elif auditor_type == "REGULATORY_AUDITOR":
        return {
            "type": "REGULATORY_AUDITOR",
            "scope": "JURISDICTIONAL",
            "jurisdiction": jurisdiction,
            "access_level": "READ_ONLY",
            "permissions": [
                "audit.read",
                "violations.read",
                "reports.export_jurisdiction",
                "governance.view",
                "lineage.verify",
                "replay.request",
                "forensic.restricted",
                "escalation.request",
                "notices.issue",
                "compliance.verify"
            ],
            "escalation_available": [
                "forensic.payloads",
                "source_review",
                "enforcement_authority"
            ]
        }
```

### **Frontend Rendering Pattern**

```jsx
// In oversight app components

export function OversightDashboard({ capabilities }) {
  return (
    <div>
      {/* Only render if permission exists */}
      {capabilities.permissions.includes("federation.analytics") && (
        <FederationAnalyticsPanel />
      )}
      
      {capabilities.permissions.includes("forensic.restricted") && (
        <ForensicPanel restricted={true} />
      )}
      
      {capabilities.permissions.includes("replay.request_approval") && (
        <ReplayApprovalQueue />
      )}
      
      {/* Escalation only for regulators */}
      {capabilities.escalation_available?.includes("forensic.payloads") && (
        <EscalationPanel />
      )}
      
      {/* Always visible */}
      <AuditChainViewer scope={capabilities.scope} />
    </div>
  );
}
```

---

## Why This Architecture Is Superior

### **1. Identity-Driven, Not Dashboard-Driven**
- Backend determines who you are and what you can see
- Frontend is purely a rendering engine
- No governance logic in UI

### **2. Constitutional Rendering**
- Same UI surface, dynamically materialized per identity
- Professional institutional architecture
- Scales to N auditor types without new dashboards

### **3. Security Isolation**
- No conditional logic in frontend determining permissions
- Backend maintains authoritative truth
- Frontend only renders injected capabilities

### **4. Alignment with Anchor Philosophy**
- **Sovereign execution** + **Constitutional visibility** + **Identity-gated operational surfaces**
- Matches military/intelligence/institutional systems patterns
- Demonstrates maturity

### **5. Extensibility**
- Adding new auditor types = backend change only
- New capabilities = no frontend scaffolding needed
- Scaling to system-wide vs jurisdictional = permission token change

---

## Current System Status (Corrected Model)

✓ **Regulatory Auditor Active:** `AUD-RB-INDIA-359`
- TYPE: REGULATORY_AUDITOR
- SCOPE: JURISDICTIONAL
- JURISDICTION: INDIA
- PORTAL: oversight.anchorgovernance.tech
- LOGIN: Same gateway as all other auditors
- RENDERED SURFACE: Jurisdiction-filtered forensic oversight

✓ **Owner Active:** `OWN-AN-SOLAPUR-999` (Tanishq Dasari)
- ROLE: OWNER
- PORTAL: app.anchorgovernance.tech
- HUB: AN-IN-SOL01
- ORG: animuslab

✓ **Developer Active:** `DEV-AN-SOLAPUR-142` (Sarah Chen)
- ROLE: DEVELOPER
- PORTAL: app.anchorgovernance.tech
- HUB: AN-IN-SOL01
- ORG: animuslab

⊘ **Standard Auditors:** None provisioned yet  
⊘ **Cross-Hub Auditors:** None provisioned yet

---

## Implementation Checklist

- [ ] **Backend (server/auth.py):** Implement `resolve_auditor_clearance()` function
- [ ] **Backend:** Add permission injection to JWT payload
- [ ] **Backend:** Create `/api/capabilities` endpoint that returns injected permissions
- [ ] **Frontend (oversight):** Create PermissionGate component wrapper
- [ ] **Frontend (oversight):** Refactor dashboard to use permission tokens
- [ ] **Frontend (app):** Same pattern for enterprise roles
- [ ] **Database:** Ensure auditor_type and scope fields are populated
- [ ] **Testing:** Verify permission matrices for each auditor type
- [ ] **Documentation:** Update API contracts with capability token format

---

## Transition Plan

1. **Phase 1:** Implement backend clearance resolution
2. **Phase 2:** Add capability injection to auth tokens
3. **Phase 3:** Refactor frontend components to use permission gates
4. **Phase 4:** Test with all 5 role types
5. **Phase 5:** Remove hardcoded role checks in frontend
