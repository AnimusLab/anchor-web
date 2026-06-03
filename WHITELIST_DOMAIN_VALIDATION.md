# Whitelist Domain Validation Security Pattern

## Overview

**Domain-Based Email Spoofing Prevention**

The Access Whitelist now implements mandatory organization domain validation to prevent fraudulent email authorization attempts.

---

## Security Problem: Email Spoofing

### Attack Scenario

Without domain validation, an attacker could:

1. **Register email:** `attacker@gmail.com`
2. **Whitelist it claiming:** org_domain = `animuslab.dev`
3. **Authenticate as:** Someone from animuslab.dev
4. **Result:** Unauthorized access to organizational infrastructure

### Why This Matters

- Email addresses alone are not sufficient proof of organizational membership
- An attacker could register ANY email and falsely claim it belongs to YOUR organization
- Trust boundaries collapse without domain verification

---

## Solution: Mandatory Domain Matching

### The Security Rule

```
✓ ALLOWED:
  Email: user@animuslab.dev
  Org Domain: animuslab.dev
  ↳ Email domain matches org domain → AUTHORIZED

✗ REJECTED:
  Email: user@gmail.com
  Org Domain: animuslab.dev
  ↳ Email domain (gmail.com) does NOT match org domain (animuslab.dev) → BLOCKED
```

### Implementation Pattern

```
┌─────────────────────────────────────────────┐
│   Entry Whitelist Authorization             │
│   (Frontend: AccessWhitelist.jsx)            │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Extract Email Domain                      │
│   user@animuslab.dev → animuslab.dev        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Compare with Org Domain                   │
│   animuslab.dev == animuslab.dev?           │
│   YES → Continue                            │
│   NO → REJECT with error                    │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Store Entry with domain_verified flag     │
│   {                                         │
│     email: user@animuslab.dev,              │
│     org_domain: animuslab.dev,              │
│     domain_verified: true                   │
│   }                                         │
└─────────────────────────────────────────────┘
```

---

## Implementation Details

### Frontend (AccessWhitelist.jsx)

```jsx
// Extract domain from email
const extractEmailDomain = (email) => {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : '';
};

// Validate domain match
const validateEmailDomain = (email, orgDomain) => {
  const emailDomain = extractEmailDomain(email);
  return emailDomain.toLowerCase() === orgDomain.toLowerCase();
};

// Auto-fill org domain when email entered
if (name === 'email') {
  const domain = extractEmailDomain(value);
  if (domain) {
    setFormData(prev => ({
      ...prev,
      org_domain: domain  // Auto-populate
    }));
  }
}
```

**User Experience:**
1. User enters email: `user@animuslab.dev`
2. Org domain auto-fills: `animuslab.dev`
3. System shows: "✓ Email domain matches org domain"
4. User submits → Entry stored with `domain_verified: true`

### Backend (whitelist_validator.py)

```python
@staticmethod
def validate_domain_match(email: str, org_domain: str) -> Tuple[bool, str]:
    """
    Verify email domain matches organization domain.
    
    This is the CRITICAL security check that prevents spoofing.
    """
    email_domain = WhitelistValidator.extract_email_domain(email)
    org_domain_lower = org_domain.lower()

    if email_domain != org_domain_lower:
        return (
            False,
            f"Email domain '{email_domain}' does not match org domain '{org_domain_lower}'. "
            f"Possible spoofing attempt."
        )

    return True, None
```

### Runtime Authentication Flow

```python
def verify_authentication_domain(
    database_connection,
    email: str,
    incoming_domain: str
) -> Tuple[bool, str]:
    """
    When user authenticates, verify email's org domain matches whitelist.
    """
    email_domain = extract_email_domain(email)
    
    if email_domain != incoming_domain.lower():
        return (
            False,
            f"Domain mismatch. Possible spoofing attempt."
        )

    return True, "Domain verified"
```

---

## Validation Checklist

All entries go through multi-step validation:

- [ ] Email format valid (regex: `user@domain.ext`)
- [ ] Domain format valid (regex: `domain.com`)
- [ ] Organization slug valid (lowercase alphanumeric, min 2 chars)
- [ ] Access role valid (OWNER, DEVELOPER, AUDITOR, REGULATORY)
- [ ] **CRITICAL:** Email domain matches org domain exactly
- [ ] Entry stored with `domain_verified: true`

---

## Attack Prevention Scenarios

### Scenario 1: Fake Company Domain

**Attacker attempt:**
```
Email: hacker@animuslab-fake.dev
Org Domain: animuslab.dev
```

**Result:** ✗ BLOCKED
```
Error: Email domain 'animuslab-fake.dev' does not match org domain 'animuslab.dev'
```

### Scenario 2: Typosquatting

**Attacker attempt:**
```
Email: user@animuslab.co        (typo: should be .dev)
Org Domain: animuslab.dev
```

**Result:** ✗ BLOCKED
```
Error: Email domain 'animuslab.co' does not match org domain 'animuslab.dev'
```

### Scenario 3: Free Email Abuse

**Attacker attempt:**
```
Email: attacker@gmail.com
Org Domain: animuslab.dev
```

**Result:** ✗ BLOCKED
```
Error: Email domain 'gmail.com' does not match org domain 'animuslab.dev'
```

### Scenario 4: Legitimate Entry

**Owner intent:**
```
Email: alice@animuslab.dev
Org Domain: animuslab.dev
Role: OWNER
```

**Result:** ✓ AUTHORIZED
```
Entry stored:
{
  email: alice@animuslab.dev,
  org_domain: animuslab.dev,
  domain_verified: true,
  access_role: OWNER
}
```

---

## Error Messages (User-Facing)

| Scenario | Error Message |
|----------|---------------|
| Invalid email format | "Valid email required" |
| Missing org domain | "Organization domain required" |
| Invalid domain format | "Invalid domain format (e.g., animuslab.dev)" |
| Domain mismatch | "Email domain `xxx` does not match org domain `yyy`" |
| Invalid slug | "Slug must be lowercase alphanumeric with hyphens" |
| Invalid role | "Invalid role. Must be one of: OWNER, DEVELOPER, AUDITOR, REGULATORY" |

---

## Database Schema

```json
{
  "_id": "ObjectId",
  "entry_id": "ent_1717123456789",
  "email": "user@animuslab.dev",
  "email_domain": "animuslab.dev",
  "org_domain": "animuslab.dev",
  "org_slug": "animuslab",
  "access_role": "OWNER",
  "domain_verified": true,
  "created_at": "2026-05-28T14:30:00Z",
  "created_by": "admin_user_id",
  "status": "VERIFIED"
}
```

**Key fields:**
- `email_domain`: Extracted from email for quick lookups
- `org_domain`: Registered organization domain
- `domain_verified`: Boolean flag indicating verification passed
- `status`: VERIFIED (passed domain check), PENDING (awaiting confirmation), REVOKED (disabled)

---

## Integration Checklist

- [ ] **Frontend:** AccessWhitelist.jsx deployed with domain validation UI
- [ ] **Backend:** whitelist_validator.py integrated into auth.py
- [ ] **Database:** Schema includes `email_domain` and `domain_verified` fields
- [ ] **API Endpoint:** `POST /api/admin/whitelist/authorize` validates entries
- [ ] **Auth Flow:** `POST /api/auth/verify` checks domain at login
- [ ] **Logging:** Rejected entries logged with reason ("Domain mismatch")
- [ ] **Documentation:** Team trained on domain validation requirement
- [ ] **Testing:** Test all attack scenarios above

---

## Security Best Practices

1. **Never Trust Email Alone**
   - Always verify email domain against registered organization domain
   - Email addresses can be spoofed; domain verification provides proof of organizational membership

2. **Domain Matching is Case-Insensitive**
   - `User@AnimusLab.dev` == `user@animuslab.dev`
   - System normalizes to lowercase for comparison

3. **Reject on Mismatch, Not on Warning**
   - If domain doesn't match, entry is REJECTED (not warned)
   - No "allow anyway" bypass option

4. **Log All Rejections**
   - Store attempted spoofing attempts for audit trail
   - Alert admins of repeated domain mismatch attempts

5. **Runtime Verification**
   - Domain check happens again at authentication time
   - Prevents tampering with stored whitelist entries

---

## UI/UX Notes

### Auto-Fill Behavior

When user enters email with domain:
```
User types:     alice@animuslab.dev
System shows:   Domain: animuslab.dev (auto-filled)
User sees:      ✓ Email domain matches org domain
```

This reduces friction for legitimate entries while catching spoofing attempts.

### Visual Indicators

- ✓ Green checkmark: Domain match verified
- ✗ Red alert: Domain mismatch (entry blocked)
- 🔒 Lock icon: Domain verified entry
- ⚠️  Warning: Suspicious domain pattern detected

---

## Example Whitelist Entries

```
VALID ENTRIES:
✓ tan@anchorgovernance.tech          (org: anchorgovernance.tech)
✓ alice@animuslab.dev                (org: animuslab.dev)
✓ security@company.internal          (org: company.internal)

INVALID ENTRIES (Would be rejected):
✗ attacker@gmail.com                 (org: animuslab.dev) → Mismatch
✗ user@company.dev                   (org: company.com)   → Mismatch
✗ fake@animuslab-evil.dev            (org: animuslab.dev) → Mismatch
✗ @@invalid                          (invalid format)
✗ user@                              (incomplete email)
```

---

## Escalation & Review

If admin believes entry should bypass domain validation:

1. **Create exception request** with business justification
2. **Security review** (must confirm legitimacy)
3. **Dual approval** (CEO + Security Officer)
4. **Audit log entry** documenting exception
5. **Time-limited** (exception expires after 30 days)
6. **Requires re-verification** to make permanent

This prevents casual bypasses while allowing for exceptional cases with full audit trail.
