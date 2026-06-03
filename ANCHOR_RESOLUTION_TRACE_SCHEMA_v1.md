# Anchor Resolution Trace Schema v1.0
## The Constitutional Explainability Standard

**Date:** May 28, 2026
**Relates To:** 
- ANCHOR_CONSTITUTIONAL_INVARIANTS_v1.md (Invariant 8)
- ANCHOR_GUARANTEE_TAXONOMY_v1.md (Guarantee 8)
**Purpose:** Define what makes a governance decision "constitutionally explainable"

---

## Preamble

Every visibility decision must produce a trace that answers:
- **WHAT** decision was made? (ALLOW / DENY)
- **WHY** was it made? (Which rule applied?)
- **UNDER WHICH POLICY?** (Policy version)
- **FOR WHICH IDENTITY?** (Identity lineage)
- **IN WHICH CONTEXT?** (Jurisdiction, scopes)
- **WITH WHAT CONFIDENCE?** (Reason depth)

This trace is not:
- A log entry (those capture events)
- An audit record (those capture history)
- A debug output (those capture internals)

This trace is: **constitutional evidence** that a decision was made correctly and can be explained to regulators.

---

## The Resolution Trace Structure

### Required Fields

Every trace MUST contain these fields:

```json
{
  "trace_id": "string (UUID)",
  "timestamp": "string (ISO8601)",
  "decision": "enum (ALLOW | DENY | CONDITIONAL)",
  "policy_version": "string",
  "identity_lineage": "object",
  "entity": {
    "type": "string",
    "identifier": "string"
  },
  "jurisdiction": "string",
  "governance_scope": "object",
  "reason": {
    "decision_rule": "string",
    "matching_conditions": ["string"],
    "applied_constraints": ["string"]
  },
  "replay_hash": "string (SHA256)"
}
```

### Field Specifications

#### trace_id
```
Type: String (UUID v4)
Immutable: Yes
Purpose: Unique identifier for this decision trace
Encoding: RFC 4122 UUID format
Example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

#### timestamp
```
Type: String (ISO 8601)
Immutable: Yes
Purpose: When decision was made
Format: YYYY-MM-DDTHH:MM:SS.sssZ (UTC)
Example: "2026-05-28T14:35:22.123Z"
Cannot be changed after creation
```

#### decision
```
Type: Enum (ALLOW | DENY | CONDITIONAL)
Immutable: Yes
Purpose: What was decided
Values:
  ALLOW          - Access granted
  DENY           - Access denied
  CONDITIONAL    - Granted with conditions (future)
```

#### policy_version
```
Type: String (Semantic versioning)
Immutable: Yes
Purpose: Which policy version made this decision
Format: namespace.context.version
Example: "visibility.constitutional.v6"
         "visibility.eu-gdpr.v2"
         "visibility.us-hipaa.v1"

This enables:
- Replayability (use exact policy version)
- Audit (which rules applied)
- Evolution (track policy changes)
```

#### identity_lineage
```
Type: Object
Immutable: Yes
Purpose: Complete identity information
Contains:
  {
    "user_id": "string",
    "role": "string (OWNER|ADMIN|DEVELOPER|AUDITOR|MEMBER)",
    "org_id": "string",
    "jurisdiction": "string",
    "effective_date": "ISO8601",
    "lineage_hash": "SHA256 of identity at time of decision"
  }

The lineage_hash proves this specific identity state
was used for the decision (immutable proof).
```

#### entity
```
Type: Object
Purpose: What was being accessed
Contains:
  {
    "type": "string (ai_agent|codebase|gateway|...)",
    "identifier": "string (unique entity ID)",
    "jurisdiction": "string (where entity resides)"
  }
```

#### jurisdiction
```
Type: String
Immutable: Yes
Purpose: Regulatory context of decision
Values: EU_GDPR, US_HIPAA, etc.
Validates: Decision respects jurisdiction boundaries
```

#### governance_scope
```
Type: Object
Purpose: Rules that applied to this decision
Contains:
  {
    "org_scope": "string",
    "regulatory_scope": "string",
    "effective_rules": ["string"]
  }
```

#### reason
```
Type: Object
Purpose: Explain WHY decision was made
Contains:
  {
    "decision_rule": "string",
    "matching_conditions": ["string"],
    "applied_constraints": ["string"],
    "exception_rules": ["string (if any)"]
  }

Example DENY reason:
  {
    "decision_rule": "auditor_cannot_access_restricted_entities",
    "matching_conditions": [
      "role == REGULATORY_AUDITOR",
      "entity_type == codebase"
    ],
    "applied_constraints": [
      "constitutional_invariant_1_enforced",
      "separation_of_oversight_and_control"
    ]
  }

Example ALLOW reason:
  {
    "decision_rule": "role_has_entity_visibility",
    "matching_conditions": [
      "role == OWNER",
      "entity_type == ai_agent",
      "jurisdiction == EU_GDPR"
    ],
    "applied_constraints": [
      "jurisdiction_immutable_constraint_passed",
      "policy_version_v6_applied"
    ]
  }
```

#### replay_hash
```
Type: String (SHA256)
Purpose: Prove determinism
Calculation: SHA256(
  identity_lineage_hash +
  entity +
  jurisdiction +
  governance_scope +
  policy_version
)

This hash can be recalculated at any future time.
If it matches → decision is deterministic proof.
If it differs → something is non-deterministic (error).
```

---

## Trace Schema in JSON Schema Format

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://anchor.dev/schemas/resolution-trace/v1.json",
  "title": "Anchor Resolution Trace",
  "description": "Constitutional evidence of a visibility decision",
  "type": "object",
  "required": [
    "trace_id",
    "timestamp",
    "decision",
    "policy_version",
    "identity_lineage",
    "entity",
    "jurisdiction",
    "reason",
    "replay_hash"
  ],
  "properties": {
    "trace_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique trace identifier"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Decision timestamp (ISO 8601 UTC)"
    },
    "decision": {
      "type": "string",
      "enum": ["ALLOW", "DENY", "CONDITIONAL"],
      "description": "The decision made"
    },
    "policy_version": {
      "type": "string",
      "pattern": "^[a-z]+\\.[a-z-]+\\.v\\d+$",
      "description": "Policy version used"
    },
    "identity_lineage": {
      "type": "object",
      "required": ["user_id", "role", "org_id", "lineage_hash"],
      "properties": {
        "user_id": { "type": "string" },
        "role": { 
          "type": "string",
          "enum": ["OWNER", "ADMIN", "DEVELOPER", "AUDITOR", "MEMBER"]
        },
        "org_id": { "type": "string" },
        "jurisdiction": { "type": "string" },
        "effective_date": { "type": "string", "format": "date-time" },
        "lineage_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
      }
    },
    "entity": {
      "type": "object",
      "required": ["type", "identifier"],
      "properties": {
        "type": { 
          "type": "string",
          "enum": [
            "ai_agent", "codebase", "gateway", "mesh_node",
            "policy", "process", "database", "webhook"
          ]
        },
        "identifier": { "type": "string" },
        "jurisdiction": { "type": "string" }
      }
    },
    "jurisdiction": {
      "type": "string",
      "description": "Regulatory jurisdiction"
    },
    "governance_scope": {
      "type": "object",
      "properties": {
        "org_scope": { "type": "string" },
        "regulatory_scope": { "type": "string" },
        "effective_rules": { 
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "reason": {
      "type": "object",
      "required": ["decision_rule", "matching_conditions"],
      "properties": {
        "decision_rule": { "type": "string" },
        "matching_conditions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "applied_constraints": {
          "type": "array",
          "items": { "type": "string" }
        },
        "exception_rules": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "replay_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$",
      "description": "SHA256 hash for determinism verification"
    }
  }
}
```

---

## Trace Examples

### Example 1: Auditor Denied Access to Codebase

```json
{
  "trace_id": "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
  "timestamp": "2026-05-28T14:35:22.123Z",
  "decision": "DENY",
  "policy_version": "visibility.constitutional.v6",
  "identity_lineage": {
    "user_id": "regulatory-auditor-001",
    "role": "AUDITOR",
    "org_id": "financial-regulator",
    "jurisdiction": "EU_GDPR",
    "effective_date": "2026-05-28T00:00:00Z",
    "lineage_hash": "abc123def456abc123def456abc123def456abc123def456abc123def456ab"
  },
  "entity": {
    "type": "codebase",
    "identifier": "backend-repo",
    "jurisdiction": "EU_GDPR"
  },
  "jurisdiction": "EU_GDPR",
  "governance_scope": {
    "org_scope": "global",
    "regulatory_scope": "EU_GDPR",
    "effective_rules": [
      "constitutional_invariant_1",
      "auditor_cannot_escalate",
      "separation_of_oversight_and_control"
    ]
  },
  "reason": {
    "decision_rule": "auditor_cannot_access_restricted_entities",
    "matching_conditions": [
      "role == AUDITOR",
      "entity_type == codebase",
      "entity_in_restricted_set"
    ],
    "applied_constraints": [
      "constitutional_invariant_1_auditor_cannot_escalate",
      "separation_of_oversight_and_control",
      "policy.v6.rule.auditor_restriction"
    ]
  },
  "replay_hash": "def456abc123def456abc123def456abc123def456abc123def456abc123def4"
}
```

### Example 2: Owner Allowed Access to All Entities

```json
{
  "trace_id": "b2c3d4e5-f6a7-4890-b1c2-d3e4f5a6b7c8",
  "timestamp": "2026-05-28T14:36:15.456Z",
  "decision": "ALLOW",
  "policy_version": "visibility.constitutional.v6",
  "identity_lineage": {
    "user_id": "alice@acme.com",
    "role": "OWNER",
    "org_id": "acme",
    "jurisdiction": "US_HIPAA",
    "effective_date": "2026-01-15T00:00:00Z",
    "lineage_hash": "xyz789uvw012xyz789uvw012xyz789uvw012xyz789uvw012xyz789uvw012xy"
  },
  "entity": {
    "type": "ai_agent",
    "identifier": "compliance-bot",
    "jurisdiction": "US_HIPAA"
  },
  "jurisdiction": "US_HIPAA",
  "governance_scope": {
    "org_scope": "acme",
    "regulatory_scope": "US_HIPAA",
    "effective_rules": [
      "owner_can_access_all_entities",
      "us_hipaa_rules"
    ]
  },
  "reason": {
    "decision_rule": "owner_has_full_entity_access",
    "matching_conditions": [
      "role == OWNER",
      "entity_type == ai_agent",
      "jurisdiction_matches"
    ],
    "applied_constraints": [
      "jurisdiction_immutable_constraint_passed",
      "policy_version_v6_applied"
    ]
  },
  "replay_hash": "012xyz789uvw012xyz789uvw012xyz789uvw012xyz789uvw012xyz789uvw012z"
}
```

### Example 3: Developer Denied Access to Database

```json
{
  "trace_id": "c3d4e5f6-a7b8-4901-c2d3-e4f5a6b7c8d9",
  "timestamp": "2026-05-28T14:37:08.789Z",
  "decision": "DENY",
  "policy_version": "visibility.constitutional.v6",
  "identity_lineage": {
    "user_id": "bob@acme.dev",
    "role": "DEVELOPER",
    "org_id": "acme",
    "jurisdiction": "US_HIPAA",
    "effective_date": "2026-03-01T00:00:00Z",
    "lineage_hash": "lmn456opq789lmn456opq789lmn456opq789lmn456opq789lmn456opq789lmn"
  },
  "entity": {
    "type": "database",
    "identifier": "patient-records-db",
    "jurisdiction": "US_HIPAA"
  },
  "jurisdiction": "US_HIPAA",
  "governance_scope": {
    "org_scope": "acme",
    "regulatory_scope": "US_HIPAA",
    "effective_rules": [
      "developer_restricted_entities",
      "database_access_owner_only"
    ]
  },
  "reason": {
    "decision_rule": "developer_cannot_access_database",
    "matching_conditions": [
      "role == DEVELOPER",
      "entity_type == database",
      "entity_in_restricted_set"
    ],
    "applied_constraints": [
      "developer_scope_constraint",
      "database_restricted_to_owner",
      "policy.v6.rule.developer_restriction"
    ]
  },
  "replay_hash": "stu012vwx345stu012vwx345stu012vwx345stu012vwx345stu012vwx345stu"
}
```

---

## Trace Immutability Guarantees

Once created, a trace:

✅ **Cannot be modified** (immutable record)
✅ **Can be queried** (for audit purposes)
✅ **Can be replayed** (to verify determinism)
✅ **Can be explained** (human-readable reason)
✅ **Can be verified** (hash validation)

### Trace Storage Requirements

```
- Store in immutable audit log
- Never update (only create new traces)
- Retention: Indefinite (governance archaeology)
- Access: Auditors + compliance + legal
- Integrity: Cryptographic signature (later)
```

---

## Trace Verification

### 1. Signature Verification (Future)
```python
def verify_trace_signature(trace: dict, public_key: str) -> bool:
    """Verify trace was created by authorized engine"""
    # Reconstruct signature from trace fields
    # Compare against stored signature
    # Prove trace has not been tampered with
```

### 2. Determinism Verification
```python
def verify_trace_determinism(trace: dict) -> bool:
    """Verify decision would be identical if replayed"""
    # Extract: identity, entity, jurisdiction, scopes, policy_version
    # Call: resolve_visibility(..., policy_version=trace.policy_version)
    # Verify: new decision == original decision
    # Verify: new replay_hash == original replay_hash
```

### 3. Completeness Verification
```python
def verify_trace_completeness(trace: dict) -> bool:
    """Verify trace contains all required fields"""
    required = {
        "trace_id", "timestamp", "decision",
        "policy_version", "identity_lineage",
        "entity", "jurisdiction", "reason", "replay_hash"
    }
    # Verify all required fields present
    # Verify all fields are non-empty
    # Verify field types match schema
```

---

## Future: Trace Evolution

As Anchor evolves, traces may gain fields:

```json
{
  // Current fields (v1)
  "trace_id": "...",
  "timestamp": "...",
  
  // Future additions (v2+)
  "signature": "...",              // Cryptographic proof
  "temporal_context": "...",       // Time-dependent rules
  "exception_override": "...",     // If exception was applied
  "auditor_notes": "...",          // Manual audit notes
  "regulatory_filing": "..."       // Associated compliance doc
}
```

But core fields remain unchanged → backwards compatible.

---

## Governance Archaeology Application

Future governance archaeologists will query traces:

```sql
-- "Show me all decisions denying auditor access"
SELECT * FROM traces
WHERE role = 'AUDITOR'
AND decision = 'DENY'

-- "Show me how policy changed over time"
SELECT DISTINCT policy_version
FROM traces
ORDER BY timestamp

-- "Show me the oldest trace"
SELECT * FROM traces
ORDER BY timestamp ASC
LIMIT 1
```

Traces become:
- **Proof** of institutional governance
- **Memory** of decision reasoning
- **Evidence** for audits
- **Foundation** for future evolution

---

**END OF RESOLUTION TRACE SCHEMA v1.0**

---

*This schema defines what makes a governance decision "constitutionally explainable."*

*Every trace is both:*
- *Evidence that a decision was made correctly*
- *A permanent record of what this institution valued about governance*
