# Anchor Guarantee Taxonomy v1.0
## How Constitutional Invariants Translate To Testable Guarantees

**Date:** May 28, 2026
**Relates To:** ANCHOR_CONSTITUTIONAL_INVARIANTS_v1.md
**Purpose:** Define what tests MUST verify (guarantees) and what tests MUST NOT verify (implementation)

---

## Preamble

This document defines the boundary between:
- **Implementation Details** (can change freely)
- **Constitutional Guarantees** (must be protected by tests)

This distinction determines whether Anchor remains evolvable or becomes brittle.

---

## The Principle: Tests Protect Guarantees, Not Implementation

### ❌ Implementation-Coupled Tests (Wrong)
```python
# ❌ WRONG - Implementation detail
assert len(fingerprint) == 64  # SHA256 specific

# ❌ WRONG - Implementation detail
assert payload["session_id"] == "abc123def456"  # Field name coupled

# ❌ WRONG - Implementation detail
assert masked == "sec**************"  # Masking strategy coupled

# ❌ WRONG - Implementation detail
assert policy_name == "visibility.v6"  # Version format coupled
```

### ✅ Guarantee-Based Tests (Right)
```python
# ✅ RIGHT - Guarantee
"Same device (UA+IP) always produces same decision"

# ✅ RIGHT - Guarantee
"Different devices produce different decisions"

# ✅ RIGHT - Guarantee
"Auditor cannot access codebase through any path"

# ✅ RIGHT - Guarantee
"Policy version is immutable once set"

# ✅ RIGHT - Guarantee
"Every decision is replayable with same result"
```

---

## The Eight Guarantees (From Constitutional Invariants)

### Guarantee 1: Self-Escalation Is Impossible

**Constitutional Source:** Invariant 1 (Auditor Cannot Elevate Own Scope)

**Guarantee Statement:**
```
For any identity with role=REGULATORY_AUDITOR,
there exists no sequence of API calls, capabilities, 
or request patterns that results in that identity
gaining access to restricted entities.

This is provably true.
```

**What This Prevents:**
- Auditor modifying their own role
- Auditor requesting elevated scope
- Auditor gaining access through delegation
- Auditor escalating through any indirect path

**How to Test (Correct Approach):**
```python
def test_auditor_cannot_escalate():
    """Prove auditor cannot gain access to codebase"""
    identity = make_auditor_identity()
    
    # Try every possible access pattern
    patterns = [
        ("direct_access", "codebase"),
        ("through_process", "process→codebase"),
        ("through_policy", "policy→codebase"),
        ("through_webhook", "webhook→codebase"),
        ("request_grant", "request_access"),
        ("request_elevation", "request_role_change"),
    ]
    
    for pattern_name, pattern in patterns:
        decision = resolve_visibility(identity, pattern)
        assert decision == "DENY", f"Pattern {pattern_name} should be denied"
```

**What NOT to Test:**
- ❌ Don't test specific field names in database
- ❌ Don't test exact error message format
- ❌ Don't test HTTP status codes (those can vary)
- ❌ Don't test API endpoint structure

---

### Guarantee 2: Visibility Decisions Are Deterministic

**Constitutional Source:** Invariant 2 (Visibility Decisions Are Deterministic)

**Guarantee Statement:**
```
Given identical inputs (identity, entity, jurisdiction, scopes),
the visibility decision is ALWAYS identical.

Not "usually" identical.
Not "probably" identical.

ALWAYS identical, across all executions.

This is mathematically provable.
```

**What This Prevents:**
- Non-deterministic randomness in decisions
- Environmental factors affecting decisions
- Time-dependent decision changes
- Cache state causing inconsistencies

**How to Test (Correct Approach):**
```python
def test_visibility_deterministic():
    """Prove same inputs always produce same output"""
    identity = make_identity(...)
    entity = "ai_agent"
    jurisdiction = "EU_GDPR"
    scopes = make_scopes(...)
    
    # Call resolution 1000 times with identical inputs
    results = []
    for _ in range(1000):
        decision = resolve_visibility(
            identity, entity, jurisdiction, scopes
        )
        results.append(decision)
    
    # All results must be identical
    assert len(set(results)) == 1, "Decision must be deterministic"
    
    # Verify it's always the same decision
    expected = results[0]
    for result in results:
        assert result == expected, "All results must match first result"
```

**What NOT to Test:**
- ❌ Don't test how long decision takes (performance can vary)
- ❌ Don't test exact timestamp (time can vary)
- ❌ Don't test internal cache state
- ❌ Don't test specific code path taken

---

### Guarantee 3: Restricted Entities Are Unreachable

**Constitutional Source:** Invariant 3 (Restricted Entities Unreachable Indirectly)

**Guarantee Statement:**
```
If an identity cannot directly access entity_type X,
then that identity cannot infer, derive, or access 
X's existence or properties through any path.

Not "most paths."
Not "obvious paths."

ANY path.

This is provably true.
```

**What This Prevents:**
- Accessing codebase through process logs
- Inferring database structure through policy descriptions
- Deriving webhook URLs through telemetry
- Accessing restricted data indirectly

**How to Test (Correct Approach):**
```python
def test_restricted_entities_unreachable():
    """Prove auditor cannot access codebase through any path"""
    identity = make_auditor_identity()
    
    # Define all possible access paths
    paths = [
        ("direct", "codebase"),
        ("via_process", ["process", "codebase"]),
        ("via_policy", ["policy", "codebase"]),
        ("via_gateway", ["gateway", "codebase"]),
        ("multi_hop", ["process", "policy", "codebase"]),
    ]
    
    # Test each path
    for path_name, path in paths:
        if isinstance(path, str):
            # Direct access
            decision = resolve_visibility(identity, path)
        else:
            # Indirect access through hops
            decision = resolve_visibility_transitive(identity, path)
        
        assert decision == "DENY", f"Path {path_name} should be blocked"
```

**What NOT to Test:**
- ❌ Don't test specific log field names
- ❌ Don't test exact JSON structure
- ❌ Don't test database queries
- ❌ Don't test cache implementation

---

### Guarantee 4: Jurisdiction Boundaries Are Immutable

**Constitutional Source:** Invariant 4 (Jurisdiction Boundaries Are Immutable)

**Guarantee Statement:**
```
A user with jurisdiction=EU_GDPR cannot see data 
with jurisdiction=US_HIPAA.

Not "usually blocked."
Not "admin can override."

Never crossed.

This is a hard boundary.
```

**What This Prevents:**
- EU user seeing US data
- Temporary jurisdiction bypass
- Jurisdiction collapse
- Jurisdiction override

**How to Test (Correct Approach):**
```python
def test_jurisdiction_immutable():
    """Prove jurisdiction boundaries cannot be crossed"""
    # Create identities in different jurisdictions
    eu_user = make_identity(jurisdiction="EU_GDPR")
    us_user = make_identity(jurisdiction="US_HIPAA")
    
    # Try to access cross-jurisdiction data
    eu_accessing_us = resolve_visibility(
        eu_user, 
        entity="user_data",
        jurisdiction="US_HIPAA"
    )
    
    us_accessing_eu = resolve_visibility(
        us_user,
        entity="user_data", 
        jurisdiction="EU_GDPR"
    )
    
    # Both must be DENY
    assert eu_accessing_us == "DENY"
    assert us_accessing_eu == "DENY"
```

**What NOT to Test:**
- ❌ Don't test jurisdiction string format ("EU_GDPR" vs "eu-gdpr")
- ❌ Don't test how jurisdiction is stored
- ❌ Don't test API error codes for boundary violations
- ❌ Don't test jurisdiction lookup performance

---

### Guarantee 5: Capability Derives From Identity

**Constitutional Source:** Invariant 5 (Capability Derives From Identity, Not Endpoints)

**Guarantee Statement:**
```
Visibility decisions depend ONLY on:
- identity lineage
- entity type
- jurisdiction
- governance scopes

NOT on:
- HTTP endpoint called
- API version used
- Frontend vs API
- Request source
- Infrastructure routing

Same identity accessing same entity → always same permission,
regardless of which code path was taken.
```

**What This Prevents:**
- Admin dashboard granting different access than API
- /admin/bypass endpoint giving different permissions
- GraphQL API giving different permissions than REST
- Different microservices making different decisions

**How to Test (Correct Approach):**
```python
def test_capability_independent_of_endpoint():
    """Prove capability doesn't depend on request route"""
    identity = make_identity(...)
    entity = "gateway"
    
    # Call resolution through different "code paths"
    results = [
        ("api_rest", resolve_visibility(identity, entity, via="rest")),
        ("api_graphql", resolve_visibility(identity, entity, via="graphql")),
        ("dashboard", resolve_visibility(identity, entity, via="dashboard")),
        ("direct", resolve_visibility(identity, entity)),
    ]
    
    # All must produce identical decisions
    decisions = [r[1] for r in results]
    assert len(set(decisions)) == 1, "Decision must not depend on endpoint"
    
    for route_name, decision in results:
        assert decision == decisions[0], f"{route_name} must match"
```

**What NOT to Test:**
- ❌ Don't test HTTP status codes (can vary by endpoint)
- ❌ Don't test response serialization format
- ❌ Don't test API endpoint behavior
- ❌ Don't test which microservice handled request

---

### Guarantee 6: Resolution Is Side-Effect Free

**Constitutional Source:** Invariant 6 (Governance Resolution Is Side-Effect Free)

**Guarantee Statement:**
```
Calling resolve_visibility() does NOT:
- modify identity
- mutate permissions
- update flags
- change audit records
- call external systems
- write to databases
- produce side effects of any kind

The function is PURE.
Same input → same output, always.
No state is changed.
```

**What This Prevents:**
- Resolution accidentally updating a database
- Decision engine creating implicit state
- Calls to resolution causing cascading failures
- Governance logic coupled to infrastructure state

**How to Test (Correct Approach):**
```python
def test_resolution_side_effect_free():
    """Prove resolution_visibility() is pure"""
    identity = make_identity(...)
    
    # Capture initial state
    initial_state = capture_all_system_state()
    
    # Call resolution 100 times
    for i in range(100):
        resolve_visibility(identity, "ai_agent", "EU_GDPR", scopes)
    
    # Capture final state
    final_state = capture_all_system_state()
    
    # No state should have changed
    assert initial_state == final_state, (
        "Resolution must not change any system state"
    )
    
    # Verify:
    # - No database writes
    # - No flag modifications
    # - No session changes
    # - No audit log entries
    # - No cache mutations
```

**What NOT to Test:**
- ❌ Don't test speed (can vary)
- ❌ Don't test memory allocation
- ❌ Don't test internal function calls
- ❌ Don't test variable names inside engine

---

### Guarantee 7: Policy Version Is Pinned

**Constitutional Source:** Invariant 7 (Policy Version Must Be Pinned)

**Guarantee Statement:**
```
Every visibility decision is associated with an immutable 
policy version identifier.

That version:
- is recorded at time of decision
- never changes after decision
- can be used to replay decision at future time
- against that exact historical policy state

The same decision resolved under policy.v5 vs policy.v6 
should be auditable and comparable.
```

**What This Prevents:**
- Policy changes affecting historical decisions
- "We changed the rules retroactively"
- Ambiguity about which rules applied when
- Loss of historical governance state

**How to Test (Correct Approach):**
```python
def test_policy_version_pinned():
    """Prove policy version is recorded and immutable"""
    identity = make_identity(...)
    
    # Resolve decision under policy v6
    decision_v6, trace_v6 = resolve_visibility(
        identity, "codebase", 
        policy_version="visibility.constitutional.v6"
    )
    
    # Policy version must be in trace
    assert trace_v6["policy_version"] == "visibility.constitutional.v6"
    
    # Simulate policy change to v7
    # Resolve same decision under v7
    decision_v7, trace_v7 = resolve_visibility(
        identity, "codebase",
        policy_version="visibility.constitutional.v7"
    )
    
    # Trace must record which policy was used
    assert trace_v7["policy_version"] == "visibility.constitutional.v7"
    
    # Decisions should be comparable
    # (may differ if policy changed, but that's the point)
    assert trace_v6["policy_version"] != trace_v7["policy_version"]
```

**What NOT to Test:**
- ❌ Don't test version string format
- ❌ Don't test how version is stored
- ❌ Don't test version comparison logic
- ❌ Don't test internal version numbering

---

### Guarantee 8: Decisions Are Explainable

**Constitutional Source:** Invariant 8 (Audit Decisions Are Constitutionally Explainable)

**Guarantee Statement:**
```
Every visibility decision produces an explanation containing:
- the decision (ALLOW / DENY)
- why decision was made (rule reference)
- under which policy (policy_version)
- with which identity (identity_lineage)
- in which jurisdiction (jurisdiction)
- with sufficient detail to reconstruct decision

An external auditor can read the explanation and verify
the decision was made correctly.
```

**What This Prevents:**
- Decisions without explanations
- Incomplete explanations
- Explanations that are vague
- Audit findings without rationale

**How to Test (Correct Approach):**
```python
def test_decisions_explainable():
    """Prove every decision can be explained"""
    identity = make_identity(...)
    
    decision, trace = resolve_visibility(
        identity, "codebase", "EU_GDPR", scopes
    )
    
    # Trace must contain all required fields
    required_fields = {
        "decision": ["ALLOW", "DENY"],
        "policy_version": str,
        "identity_lineage": str,
        "jurisdiction": str,
        "reason": list,  # Why decision was made
        "timestamp": str,
    }
    
    for field, expected_type in required_fields.items():
        assert field in trace, f"Trace missing {field}"
        if isinstance(expected_type, list):
            assert trace[field] in expected_type
        else:
            assert isinstance(trace[field], expected_type)
    
    # Explanation must be sufficient to reconstruct decision
    # (auditor should understand why)
    assert len(trace["reason"]) > 0, "Reason must be provided"
```

**What NOT to Test:**
- ❌ Don't test exact trace format
- ❌ Don't test specific reason phrases
- ❌ Don't test JSON serialization
- ❌ Don't test trace field order

---

## Test Categories

### Category A: Guarantee Tests (Required)
These tests verify constitutional guarantees. They are:
- ✅ Implementation-independent
- ✅ Focused on outcomes
- ✅ Replayable (can run anytime)
- ✅ Auditable (explain what they verify)

### Category B: Contract Tests (Required)
These tests verify behavioral contracts. They are:
- ✅ Interface-focused (not implementation)
- ✅ Outcome-focused (not code paths)
- ✅ Resilient to refactoring
- ✅ Enforceable by specification

### Category C: Integration Tests (Supplementary)
These tests verify components work together. They are:
- ⚠️ Can depend on structure
- ⚠️ Must stay implementation-aware
- ⚠️ Should not drive architecture
- ⚠️ Use for verification, not specification

### Category D: Implementation Tests (Avoid)
These tests lock onto implementation details. They are:
- ❌ Brittle (break on refactoring)
- ❌ Implementation-coupled
- ❌ Hard to maintain
- ❌ Should not exist in guarantee suite

---

## Test Suite Structure

```
tests/
├── guarantees/               # Category A (Required)
│   ├── test_guarantee_1_no_self_escalation.py
│   ├── test_guarantee_2_deterministic.py
│   ├── test_guarantee_3_no_indirect_access.py
│   ├── test_guarantee_4_jurisdiction_immutable.py
│   ├── test_guarantee_5_identity_derived.py
│   ├── test_guarantee_6_side_effect_free.py
│   ├── test_guarantee_7_policy_pinned.py
│   └── test_guarantee_8_explainable.py
│
├── contracts/               # Category B (Required)
│   ├── test_contract_engine_interface.py
│   ├── test_contract_trace_schema.py
│   └── test_contract_replay.py
│
└── integration/             # Category C (Supplementary)
    └── test_integration_*.py
```

---

## How to Write A Guarantee Test

### Template

```python
def test_guarantee_GUARANTEE_NAME():
    """
    Guarantee: [State the guarantee clearly]
    
    Constitutional Source: Invariant [N]
    
    Prevents: [What bad thing does this stop?]
    
    Proof Strategy: [How will we prove this?]
    """
    
    # Setup: Create identities, entities, contexts
    identity = make_identity(...)
    entity = "..."
    
    # Execution: Run the scenario
    result = resolve_visibility(identity, entity, ...)
    
    # Verification: Assert the guarantee
    assert result satisfies guarantee, "Guarantee must hold"
```

### Example

```python
def test_guarantee_auditor_cannot_escalate():
    """
    Guarantee: Auditor cannot gain access to restricted entities.
    
    Constitutional Source: Invariant 1
    
    Prevents: Regulatory auditor escalating own permissions.
    
    Proof Strategy: Try all known escalation patterns, verify none work.
    """
    
    # Setup
    auditor = make_auditor_identity()
    restricted_entities = ["codebase", "database", "webhook"]
    
    # Execution & Verification
    for entity in restricted_entities:
        decision = resolve_visibility(auditor, entity)
        assert decision == "DENY", (
            f"Auditor must not access {entity}"
        )
```

---

## How to Recognize Bad Tests

### ❌ Bad Test Pattern 1: Implementation Coupling
```python
# ❌ WRONG
assert fingerprint == hashlib.sha256(...).hexdigest()
# Couples test to SHA256 implementation
```

**Fix:** Test the guarantee, not the implementation
```python
# ✅ RIGHT
assert same_device_always_same_fingerprint()
```

### ❌ Bad Test Pattern 2: Serialization Specificity
```python
# ❌ WRONG
assert response.json()["session_id"] == "abc123def456"
# Couples test to JSON field names
```

**Fix:** Test the behavior, not the serialization
```python
# ✅ RIGHT
assert session_is_unique_and_valid()
```

### ❌ Bad Test Pattern 3: Exact Structure Matching
```python
# ❌ WRONG
assert trace["reason"][0] == "entity_type=codebase"
# Couples test to trace structure
```

**Fix:** Test the guarantee, not the trace format
```python
# ✅ RIGHT
assert trace_contains_sufficient_explanation()
```

---

## Guarantee Testing Checklist

For each guarantee test, verify:

- [ ] Test name starts with `test_guarantee_`
- [ ] Test has docstring explaining guarantee
- [ ] Test references constitutional invariant
- [ ] Test is implementation-independent
- [ ] Test focuses on outcome, not code path
- [ ] Test is deterministic (can run 1000x)
- [ ] Test does not mutate state
- [ ] Test can run in any order
- [ ] Test can run on refactored code
- [ ] Test explains what happens if it fails

---

## Future: Policy-Specific Guarantees

As Anchor evolves to policy-as-code, guarantees become:

```python
def test_guarantee_policy_rule_N_enforced():
    """
    Guarantee: EU GDPR policy rule #N is enforced.
    
    Policy: visibility.constitutional.eu-gdpr.v1
    Rule: "Regulatory auditors cannot access codebase"
    """
    # Test that specific policy rule is enforced
```

This enables:
- Per-jurisdiction policy testing
- Temporal policy testing (test with policy from date T)
- Policy evolution tracking
- Governance audit trails

---

**END OF GUARANTEE TAXONOMY v1.0**

---

*This document defines the boundary between:*
- *What can change freely (implementation)*
- *What must never change (guarantees)*

*This boundary determines whether Anchor remains evolvable.*
