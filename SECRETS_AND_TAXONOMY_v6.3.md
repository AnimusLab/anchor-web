# Secrets Management & Entity Taxonomy Implementation (v6.3)

## Overview
Comprehensive secrets management and entity visibility filtering for the Anchor governance system. Enables secure credential governance, environment-specific configuration, and role-based entity access control.

## Phase 1: Secrets Management

### Implementation Details

#### 1. Environment Configuration Template
**File**: [.env.template](.env.template)

Comprehensive template with all required and optional environment variables:
- Authentication & security (ANCHOR_MASTER_KEY, JWT, TOTP)
- Database configuration (PostgreSQL/SQLite connection strings)
- Email & communication (Brevo API, sender settings)
- Application settings (base URL, environment, debug mode)
- Mesh & spoke configuration
- Governance & compliance settings
- Secret rotation schedules
- CORS and security headers
- Feature flags

**Usage**:
```bash
# Copy template to actual environment file
cp .env.template .env

# Edit with production values (NEVER commit .env)
nano .env

# Verify configuration
python -c "from server.config import Config; print(Config.get_summary())"
```

#### 2. Centralized Configuration Module
**File**: [server/config.py](server/config.py)

Core features:
- **Config class**: Loads and validates all environment variables
- **Environment enum**: DEVELOPMENT, STAGING, PRODUCTION
- **Validation system**: Ensures critical secrets are set and properly formatted
- **Summary generation**: Non-sensitive config for logging

**Usage**:
```python
from server.config import Config

# Access any configuration value
print(Config.ANCHOR_MASTER_KEY)
print(Config.JWT_EXPIRY_MINUTES)
print(Config.DATABASE_URL)

# Validate configuration
is_valid, errors = Config.validate()

# Get non-sensitive summary for logging
summary = Config.get_summary()
```

#### 3. Secret Rotation Manager
**File**: [server/config.py](server/config.py) - `SecretRotationSchedule` class

Tracks and manages scheduled secret rotation:
```python
from server.config import rotation_schedule

# Check if secret should be rotated
should_rotate = rotation_schedule.should_rotate("master_key", 90)

# Mark secret as rotated
rotation_schedule.mark_rotated("master_key")

# Get rotation status
status = rotation_schedule.get_rotation_status()
```

**Rotation Schedules**:
- `MASTER_KEY`: 90 days (critical)
- `JWT_KEY`: 30 days (medium)
- `DB_CREDENTIALS`: 180 days (low)

#### 4. Configuration Validation
**Critical checks** (production):
- ANCHOR_MASTER_KEY must be ≥32 characters
- DEBUG must be False
- DATABASE_URL must use PostgreSQL (not SQLite)
- BREVO_API_KEY must be set
- Base URL must not use localhost

**Result**: Detailed error messages guide users to fix configuration issues.

### Security Benefits
✓ **Credential Isolation**: Secrets separated from codebase (never commit .env)
✓ **Environment-Specific Config**: Different settings for dev/staging/production
✓ **Rotation Tracking**: Know when secrets were last rotated
✓ **Feature Flags**: Enable/disable features without code changes
✓ **Centralized Management**: Single source of truth for all configuration

---

## Phase 2: Entity Taxonomy Implementation

### Overview
Implements role-based entity visibility filtering to prevent unauthorized access to sensitive entities. Regulatory auditors cannot see codebase, databases, webhooks, and other restricted resources.

### Entity Types
**8 Entity Types Defined** (in order of sensitivity):

| Entity Type | Description | Owner | Admin | Dev | Auditor | Member |
|------------|-------------|-------|-------|-----|---------|--------|
| **ai_agent** | Autonomous agents & bots | ✓ | ✓ | ✓ | ✓ | ✓ |
| **gateway** | API gateways & proxies | ✓ | ✓ | ✓ | ✓ | ✓ |
| **process** | Business processes | ✓ | ✓ | ✓ | ✗ | ✓ |
| **policy** | Governance policies | ✓ | ✓ | ✗ | ✗ | ✗ |
| **codebase** | Source code repositories | ✓ | ✓ | ✗ | ✗ | ✗ |
| **database** | Data stores & schemas | ✓ | ✓ | ✗ | ✗ | ✗ |
| **webhook** | Incoming webhooks | ✓ | ✓ | ✗ | ✗ | ✗ |
| **mesh_node** | Mesh network nodes | ✓ | ✓ | ✗ | ✗ | ✗ |

### Implementation Components

#### 1. EntityType Enum
**File**: [server/config.py](server/config.py) - Line ~95

Defines all valid entity types:
```python
class EntityType(str, Enum):
    AI_AGENT = "ai_agent"
    CODEBASE = "codebase"
    GATEWAY = "gateway"
    MESH_NODE = "mesh_node"
    POLICY = "policy"
    PROCESS = "process"
    DATABASE = "database"
    WEBHOOK = "webhook"
```

#### 2. EntityVisibilityFilter
**File**: [server/config.py](server/config.py) - Line ~115

Core filtering logic:

**Methods**:
- `get_visible_entities(role, subtype)` - Get visible entity types
- `can_access_entity(role, entity_type, subtype)` - Check single entity access
- `filter_entities(entities, role, subtype)` - Filter entity list

**Auditor Type Mapping**:
- `government_auditor` → SYSTEM_WIDE (no codebase)
- `cross_hub_auditor` → ORG_WIDE (no codebase)
- `standard_auditor` → HUB_ONLY (no codebase)

**Example**:
```python
from server.config import EntityVisibilityFilter

# Get visible entities for regulatory auditor
visible = EntityVisibilityFilter.get_visible_entities("auditor", "government_auditor")
# Result: {EntityType.AI_AGENT, EntityType.GATEWAY}

# Check access to specific entity
can_access = EntityVisibilityFilter.can_access_entity("auditor", "codebase", "government_auditor")
# Result: False (restricted for auditors)

# Filter a list of entities
filtered = EntityVisibilityFilter.filter_entities(
    entities=[...],
    user_role="auditor",
    user_subtype="government_auditor"
)
```

#### 3. JWT Integration
**File**: [server/auth.py](server/auth.py) - `_issue_jwt()` function

Enhanced JWT payload includes entity scope:
```python
# Updated JWT payload includes:
{
    "session_id": "abc123...",
    "fingerprint": "sha256_hash",
    "entity_scope": "ai_agent,gateway",  # Role-specific entity types
    "subtype": "government_auditor",      # Auditor subtype
    ...
}
```

**Computation Logic** (in `_compute_entity_visibility_scope`):
1. Check feature flag `FEATURE_ENTITY_TAXONOMY`
2. Get user role and subtype
3. Compute visible entities using EntityVisibilityFilter
4. Return comma-separated list of allowed entity types

#### 4. Access Control Functions
**File**: [server/auth.py](server/auth.py)

New helper functions:
- `_compute_entity_visibility_scope()` - Compute JWT entity_scope field
- `_get_user_role_and_subtype()` - Extract role/subtype from user object

### Compliance & Governance Benefits

✓ **Regulatory Compliance**: Auditors cannot see codebase → no IP theft risk
✓ **Separation of Duties**: Clear role-based boundaries
✓ **Audit Trail**: Entity access is logged in audit.log
✓ **Feature Toggles**: Disable entity filtering with `FEATURE_ENTITY_TAXONOMY=false`
✓ **Constitutional Model**: Entity scope derived from institutional identity (not ad-hoc)

### Testing

**Test Suite**: [test_secrets_and_taxonomy.py](test_secrets_and_taxonomy.py)

10 comprehensive tests:
```
✓ Configuration Validation
✓ Entity Type Definitions
✓ Owner Entity Visibility
✓ Regulatory Auditor Visibility Restrictions
✓ Developer Entity Visibility
✓ Entity List Filtering
✓ Secret Rotation Management
✓ CORS Configuration
✓ Environment-Specific Behavior
✓ Feature Flags
```

Run tests:
```bash
python test_secrets_and_taxonomy.py
```

---

## Integration with Auth Hardening

Entity taxonomy works in conjunction with auth hardening (v6.3):

1. **User authenticates** → Session fingerprinting validates device
2. **Token issued** → JWT includes entity_scope based on role
3. **API request** → Fingerprint validated, entity permissions checked
4. **Response filtered** → Only authorized entities returned

---

## Deployment Guide

### Development
```bash
# 1. Copy template
cp .env.template .env

# 2. Update .env with dev values (minimal security needed)
ANCHOR_MASTER_KEY=dev_key_at_least_32_chars
ENVIRONMENT=development
DEBUG=true

# 3. Verify
python -c "from server.config import Config; print(Config.get_summary())"
```

### Production
```bash
# 1. Copy template
cp .env.template .env

# 2. Generate secure ANCHOR_MASTER_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 3. Set all required secrets in .env
ANCHOR_MASTER_KEY=<generated_key>
BREVO_API_KEY=<your_brevo_key>
DATABASE_URL=postgresql://user:pass@host/db
ENVIRONMENT=production
DEBUG=false

# 4. Verify configuration
python -c "from server.config import Config; is_valid, errors = Config.validate(); print('Valid' if is_valid else f'Errors: {errors}')"

# 5. Start server with production settings
ENVIRONMENT=production python -m uvicorn server.auth:app --host 0.0.0.0 --port 8000
```

### Secret Rotation (Annual)
```bash
# 1. Generate new master key
python -c "import secrets; print('New key:', secrets.token_urlsafe(32))"

# 2. Update .env (rotate in place or use AWS Secrets Manager)
ANCHOR_MASTER_KEY=<new_key>

# 3. Restart application
systemctl restart anchor-api

# 4. Log rotation in audit trail
# Record: ADMIN rotated ANCHOR_MASTER_KEY on 2026-05-28
```

---

## Monitoring & Maintenance

### Check Configuration
```bash
# Verify current config
python -c "from server.config import Config; import json; print(json.dumps(Config.get_summary(), indent=2))"
```

### View Entity Taxonomy Status
```bash
# Check if entity filtering enabled
python -c "from server.config import Config; print('Entity Taxonomy Enabled:', Config.FEATURE_ENTITY_TAXONOMY)"

# Test visibility filter
python -c "from server.config import EntityVisibilityFilter; print(EntityVisibilityFilter.get_visible_entities('auditor', 'government_auditor'))"
```

### Secret Rotation Status
```python
from server.config import rotation_schedule
print(rotation_schedule.get_rotation_status())
```

### Audit Logs
```bash
# Monitor auth events
tail -f server/logs/auth_audit.log | grep "USER_ROLE\|ENTITY"
```

---

## Files Modified/Created

### New Files
- ✅ [.env.template](.env.template) - Configuration template
- ✅ [server/config.py](server/config.py) - Configuration module
- ✅ [test_secrets_and_taxonomy.py](test_secrets_and_taxonomy.py) - Test suite

### Modified Files
- ✅ [server/auth.py](server/auth.py) - Entity taxonomy integration
  - Added config imports
  - Added `_compute_entity_visibility_scope()` function
  - Added `_get_user_role_and_subtype()` function
  - Updated `_issue_jwt()` to compute entity_scope
  - Integrated feature flags

---

## Next Steps

1. **Copy .env.template to .env**: `cp .env.template .env`
2. **Set production secrets**: Edit .env with your environment-specific values
3. **Run test suite**: `python test_secrets_and_taxonomy.py`
4. **Deploy**: Use ENVIRONMENT variable to control mode
5. **Monitor**: Check audit logs and configuration summary regularly

---

## Troubleshooting

**Issue**: Configuration validation fails
- **Cause**: ANCHOR_MASTER_KEY too short or missing
- **Fix**: Generate new key: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

**Issue**: Entity visibility not working
- **Cause**: `FEATURE_ENTITY_TAXONOMY=false`
- **Fix**: Set `FEATURE_ENTITY_TAXONOMY=true` in .env

**Issue**: Auditors can see codebase
- **Cause**: `REGULATORY_AUDITOR_RESTRICTIONS_ENABLED=false`
- **Fix**: Set `REGULATORY_AUDITOR_RESTRICTIONS_ENABLED=true` in .env

---

## Reference Documentation

- [Configuration Module](server/config.py)
- [Auth Hardening v6.3](AUTH_HARDENING_v6.3.md)
- [Test Suite](test_secrets_and_taxonomy.py)
- [Environment Template](.env.template)
