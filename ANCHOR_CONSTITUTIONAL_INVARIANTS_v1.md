# Anchor Constitutional Invariants v1.0
## Inviolable Guarantees That Define Institutional Trust

**Date:** May 28, 2026
**Status:** Foundational
**Scope:** Anchor Governance System Core
**Audience:** Architects, Auditors, Maintainers, Future Developers

---

## Preamble

This document codifies the **inviolable guarantees** that Anchor must maintain to preserve institutional trust and constitutional integrity.

These are not configuration options. They are not implementation details. They are **constitutional guarantees** that, if violated, would undermine the entire system's legitimacy.

This document will be referenced in every architectural decision, test suite, and audit trail from this point forward.

It is also **governance archaeology**—a record of what this institution considered sacred about how it makes decisions about visibility, capability, and trust.

---

## The Eight Constitutional Invariants

### 1. Auditor Cannot Elevate Own Scope

**Statement:**
```
A regulatory auditor identity cannot grant themselves access to 
restricted entities (codebase, database, webhook, policy).
```

**Why It Matters:**
- Preserves separation of oversight and operational control
- Prevents self-dealing in governance decisions
- Maintains evidentiary legitimacy of audit findings
- Required for SOC2, ISO 27001, and regulatory compliance

**What This Prevents:**
- Auditor cannot modify their own role
- Auditor cannot access their own capabilities
- Auditor cannot request or receive elevated permissions
- No escalation path exists (visible or hidden)

**Enforcement Points:**
- Identity cannot self-modify capability
- Capability resolution cannot accept self-referential requests
- Audit log must record any escalation attempt with CRITICAL severity

**Violation Severity:** CRITICAL
**Recovery:** Manual intervention by institutional oversight

---

### 2. Visibility Decisions Are Deterministic

**Statement:**
```
Given identical inputs at time T:
  identity_lineage → same
  entity_type → same
  jurisdiction → same
  org_scope → same
  governance_scope → same

The visibility decision is ALWAYS identical.
```

**Why It Matters:**
- Enables replayability (prove historical decisions)
- Enables auditability (explain why decision was made)
- Enables forensics (reconstruct decision path)
- Creates mathematical certainty in governance

**What This Prevents:**
- Non-deterministic random decisions
- Environmental-dependent visibility
- Cached state affecting decisions
- Time-dependent visibility changes

**Enforcement Points:**
- Engine has no randomness
- Engine has no external state dependencies
- Engine has no mutable global state
- Test suite verifies: same inputs → same output across 1000 runs

**Violation Severity:** CRITICAL
**Recovery:** Rollback to last known-good policy version

---

### 3. Restricted Entities Unreachable Indirectly

**Statement:**
```
If an identity cannot directly access entity_type X,
then that identity cannot infer, derive, or access X's 
existence or properties through any indirect path
(processes, policies, webhooks, logs, or any other entity).
```

**Why It Matters:**
- Prevents information leakage through side channels
- Preserves restricted entity secrecy
- Prevents auditors from accessing codebase via process logs
- Maintains constitutional separation

**What This Prevents:**
- Accessing codebase through process audit logs
- Inferring database structure through policy descriptions
- Deriving webhook URLs through process telemetry
- Any transitive access to restricted entities

**Enforcement Points:**
- Resolution engine checks transitive reachability
- Entity relationships are validated for permission preservation
- Audit log checks show no restricted entity references
- Test suite includes multi-hop access attempts

**Violation Severity:** CRITICAL
**Recovery:** Entity relationship audit + visibility audit

---

### 4. Jurisdiction Boundaries Are Immutable

**Statement:**
```
Jurisdiction boundaries (EU_GDPR, US_HIPAA, etc.) cannot be:
- crossed by any role,
- collapsed into a single scope,
- temporarily suspended,
- or overridden by operational necessity.
```

**Why It Matters:**
- Preserves regulatory compliance
- Prevents accidental data localization violations
- Maintains institutional accountability
- Proves jurisdiction separation to regulators

**What This Prevents:**
- EU user seeing US-only data
- Temporary jurisdiction bypass for "emergency access"
- Jurisdiction field modification
- Jurisdiction inference from location alone

**Enforcement Points:**
- Jurisdiction is immutable once set in identity
- Resolution engine enforces jurisdiction boundaries as hard stops
- Cross-jurisdiction decisions are rejected (not allowed)
- Audit log shows every jurisdiction boundary check

**Violation Severity:** CRITICAL
**Recovery:** Immediate incident escalation to compliance

---

### 5. Capability Derives From Identity, Not Endpoints

**Statement:**
```
Visibility decisions derive exclusively from identity lineage,
governance scope, and jurisdictional context.

Capability does NOT derive from:
- which HTTP endpoint is called,
- which microservice processes the request,
- whether request came through UI or API,
- or any infrastructure routing decision.
```

**Why It Matters:**
- Prevents endpoint abuse and route inconsistencies
- Makes security architecture auditable (not fragmented)
- Prevents hidden escalation through alternate routes
- Centralizes truth about permissions

**What This Prevents:**
- Calling /admin/bypass and getting different permissions
- Accessing data through different API versions
- Using GraphQL queries to access restricted fields
- Admin dashboard granting access not in API

**Enforcement Points:**
- All visibility decisions route through single engine
- Engine is the single source of truth
- Infrastructure does not make permission decisions
- Tests verify identical capability from all endpoints

**Violation Severity:** CRITICAL
**Recovery:** Audit all endpoint implementations for permission inconsistency

---

### 6. Governance Resolution Is Side-Effect Free

**Statement:**
```
The resolve_visibility() function must be pure:

- Input: identity, entity, jurisdiction, scopes
- Output: (decision, trace)
- Side effects: NONE

This means:
- Cannot modify identity
- Cannot mutate permissions
- Cannot update flags or state
- Cannot change audit records
- Cannot trigger external systems
```

**Why It Matters:**
- Enables replayability (can call resolution at any time)
- Enables testing (no global state to mock)
- Enables mathematical reasoning about governance
- Prevents cascading failures in decision logic

**What This Prevents:**
- Resolving visibility and accidentally updating a flag
- Calling resolution and having side effect on audit logs
- Decision engine creating implicit state changes
- Governance logic coupled to infrastructure state

**Enforcement Points:**
- Engine has no @property mutations
- Engine makes no database queries (queries in other layer)
- Engine makes no external API calls
- Engine has no write access to any state
- Tests call engine 1000x in sequence, verify no state change

**Violation Severity:** CRITICAL
**Recovery:** Refactor engine to pure logic

---

### 7. Policy Version Must Be Pinned

**Statement:**
```
Every visibility decision must resolve against an immutable 
policy version identifier.

That identifier must be recorded in:
- audit logs,
- JWT claims (policy_version field),
- decision traces,
- and replay artifacts.

Policy versions are:
- immutable (never changed after creation),
- timestamped (creation date recorded),
- superseded (can reference prior version),
- and replayable (can resolve against historical versions).
```

**Why It Matters:**
- Enables replayability against historical policies
- Preserves audit trail legitimacy (which rules applied?)
- Enables policy drift detection (when did rules change?)
- Allows forensic reconstruction (what would have happened under v5?)

**What This Prevents:**
- "We changed the rules retroactively"
- Policy interpretation ambiguity
- "Different audit of same decision produces different result"
- Silent policy updates affecting historical decisions

**Enforcement Points:**
- Policy version embedded in JWT at issuance
- Audit logs include policy_version field
- Decision traces reference policy_version
- Replayer accepts policy_version parameter
- Old policy versions retained indefinitely
- Tests verify: same decision with different policy versions

**Violation Severity:** CRITICAL
**Recovery:** Policy version audit + decision re-evaluation

---

### 8. Audit Decisions Are Constitutionally Explainable

**Statement:**
```
Every visibility decision must produce a decision trace explaining:

- WHAT decision was made (ALLOW / DENY)
- WHY decision was made (rule number, policy constraint)
- UNDER WHICH POLICY (policy_version)
- WITH WHICH IDENTITY (identity_lineage)
- IN WHICH JURISDICTION (jurisdiction context)
- WITH WHAT CONFIDENCE (reason depth)

That trace must be:
- immutable (recorded once, never changed),
- comprehensive (sufficient to reconstruct decision),
- auditable (reviewable by compliance),
- and provable (mathematically sound).
```

**Why It Matters:**
- Enables regulatory compliance reporting
- Provides evidence in dispute resolution
- Creates institutional memory of decision rationale
- Enables explainability to stakeholders

**What This Prevents:**
- "We denied access but forgot why"
- Decisions without explanation
- Explanations that are incomplete or vague
- Audit findings without decision rationale

**Enforcement Points:**
- Decision trace schema is mandatory
- Traces include all required fields
- Traces are cryptographically signed
- Traces are immutable (stored as records)
- Compliance dashboards can retrieve traces
- Tests verify trace completeness

**Violation Severity:** HIGH
**Recovery:** Audit log forensics + decision reconstruction

---

## Corollary Invariants (Derived From The Eight)

### 8a. Replayability Guaranteed
If invariants 2, 6, and 7 are maintained, then:
```
Any visibility decision can be replayed at any future time
using the same identity, entity, and policy version.
The result will be identical.
```

### 8b. Auditability Guaranteed
If invariants 8 and 8a are maintained, then:
```
Every visibility decision is auditable.
The decision can be explained, traced, and verified
by compliance officers, regulators, and institutional auditors.
```

### 8c. Forensic Reconstruction Guaranteed
If invariants 2, 7, and 8 are maintained, then:
```
Historical decisions can be reconstructed and explained.
If a decision was made on 2026-05-28 under policy.v6,
we can prove what the decision was and why.
```

---

## What Depends On These Invariants

### Architectural Decisions That Depend On These Invariants
- **Capability Resolution Engine** — depends on invariants 2, 6, 7
- **Policy Version Management** — depends on invariant 7
- **Audit Trace System** — depends on invariants 8, 8a, 8b
- **Replay Infrastructure** — depends on invariants 2, 6, 7
- **Forensic Analysis Tools** — depends on invariants 2, 7, 8c

### External Commitments That Depend On These Invariants
- **SOC2 Type II Compliance** — depends on invariants 1, 8, 8b
- **ISO 27001 Certification** — depends on invariants 1, 4
- **Regulatory Audit Responses** — depends on invariants 8, 8a, 8c
- **Customer Trust Documentation** — depends on invariants 1, 3, 5

### Future Features That Can Only Work If These Invariants Hold
- Temporal governance (governance at time T)
- Multi-jurisdiction support
- Policy versioning and rollback
- Explainable AI compliance
- Forensic auditing
- Governance replays

---

## How These Invariants Shape Implementation

### What The Engine MUST Do
- ✅ Accept identity, entity, jurisdiction, scopes
- ✅ Produce decision + trace
- ✅ Be deterministic
- ✅ Be side-effect free
- ✅ Record policy version
- ✅ Explain reasoning
- ✅ Check jurisdiction boundaries
- ✅ Verify no self-escalation

### What The Engine MUST NOT Do
- ❌ Make database queries (other layer)
- ❌ Call external APIs (other layer)
- ❌ Modify state (stay pure)
- ❌ Use randomness (must be deterministic)
- ❌ Depend on time (policy version is the time marker)
- ❌ Access infrastructure details (HTTP, frameworks, etc.)
- ❌ Know about React, FastAPI, or JWT structure
- ❌ Make decisions based on source of request

### What The Test Suite MUST Verify
- Determinism across 1000 runs with same inputs
- No state mutation after decision
- Transitive access prevention
- Jurisdiction boundary enforcement
- Auditor self-escalation prevention
- Policy version recording
- Trace completeness
- Replayability (same inputs → same output)

---

## Change Management For These Invariants

### How These Invariants Can Change

**Never, unless:**
1. This document is updated explicitly
2. Change is dated and versioned
3. Rationale is documented
4. All dependent systems are notified
5. Regulatory implications are assessed

**Process for adding an invariant:**
1. Identify what must NEVER become false
2. Write the invariant statement
3. Explain why it matters
4. Identify enforcement points
5. Build tests that verify it
6. Update this document
7. Notify all stakeholders

**Process for modifying an invariant:**
1. Document the change reason
2. Assess regulatory impact
3. Plan for retroactive implications
4. Version all related artifacts
5. Update audit trail
6. Notify compliance

**Process for removing an invariant:**
Never happens in practice. This indicates something went catastrophically wrong.

---

## Constitutional Archaeology Record

**Document Created:** 2026-05-28
**By:** Architectural Review (Identity-Derived Governance Initiative)
**Motivation:** Transition from RBAC to Constitutional Infrastructure
**Next Review Date:** 2026-11-28 (6 months)
**Review Cadence:** Quarterly thereafter

**Version History:**
| Version | Date | Change | Rationale |
|---------|------|--------|-----------|
| v1.0 | 2026-05-28 | Initial codification | Foundation for Capability Resolution Engine |

---

## Appendix A: Why These Invariants Matter For Coherence

### The Coherence Crisis This Prevents

Most governance systems fragment because:

```
auth logic → endpoint1
permission checks → endpoint2
audit logging → endpoint3
visibility rules → endpoint4
→ inconsistency → escalation paths exist
```

These invariants prevent fragmentation by:
1. **Invariant 5** forces all visibility through one engine
2. **Invariant 6** prevents fragmentation of logic
3. **Invariant 2** makes fragmentation detectable
4. **Invariant 8** makes fragmentation auditable

### Why Coherence Is Worth Protecting

- Systems with coherent governance are 10x easier to audit
- Systems with fragmented governance eventually collapse
- These eight invariants are the difference between those outcomes

---

## Appendix B: For Future Developers

When you are asked to:
- Add a new role
- Support a new entity type
- Implement a feature
- Change permission logic
- Add an exception
- Create a bypass

**Ask yourself:**

> Does this decision still preserve all eight invariants?

If the answer is "no" or "maybe," then the decision cannot be made without:
1. Updating these invariants explicitly
2. Assessing regulatory impact
3. Notifying all stakeholders
4. Documenting the change archaeology

This document is your constitution.

---

## Appendix C: Regulatory Alignment

### SOC2 Type II (Access Control)
- Invariant 1: Prevents unauthorized escalation
- Invariant 8: Provides audit evidence
- Invariant 8b: Supports compliance reporting

### ISO 27001 (Information Security)
- Invariant 4: Protects data localization
- Invariant 5: Centralizes security architecture
- Invariant 3: Prevents unauthorized disclosure

### GDPR (Data Protection)
- Invariant 4: Supports geographic protection
- Invariant 8a: Enables data subject access requests
- Invariant 8c: Supports audit response

---

**END OF CONSTITUTIONAL INVARIANTS v1.0**

---

*This document is a governance artifact. It will be preserved indefinitely as evidence of what this institution considered sacred about how it makes decisions.*

*Future governance archaeologists will look at this document and understand: what did Anchor protect most fiercely, and why?*

*The answer is: coherence, trust, and the impossibility of hidden escalation.*
