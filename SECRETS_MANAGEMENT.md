# Environment Security & Secrets Management

## Critical Principle

**Never expose secrets, API keys, JWT secrets, or database credentials in code.**

Your governance infrastructure handles sensitive data. Secrets management is non-negotiable.

---

## 1. Environment Variables - Never in Git

### ✗ WRONG:

```javascript
// ❌ NEVER DO THIS
const JWT_SECRET = "super-secret-key-hardcoded";
const DB_PASSWORD = "password123";
const REPLAY_API_KEY = "abc123xyz";
```

```python
# ❌ NEVER DO THIS
JWT_SECRET = "super-secret-key-hardcoded"
DB_PASSWORD = "password123"
REPLAY_API_KEY = "abc123xyz"
```

### ✓ RIGHT:

```javascript
// ✅ DO THIS
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required');
}
```

```python
# ✅ DO THIS
import os

JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError('JWT_SECRET environment variable is required')

DB_PASSWORD = os.getenv('DB_PASSWORD')
if not DB_PASSWORD:
    raise ValueError('DB_PASSWORD environment variable is required')
```

---

## 2. .env Files (Development Only)

### Create `.env.template` (no secrets):

```env
# .env.template - COMMIT THIS TO GIT
# Copy to .env and fill with actual values

# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=anchor_user
DB_PASSWORD=<generate-strong-password>
DB_NAME=anchor_db

# Authentication
JWT_SECRET=<generate-random-secret>
JWT_EXPIRY=900
SESSION_SECRET=<generate-random-secret>
TOTP_ENFORCEMENT=true

# Governance
GOVERNANCE_DOMAIN=anchorgovernance.tech
APP_DOMAIN=app.anchorgovernance.tech
OVERSIGHT_DOMAIN=oversight.anchorgovernance.tech

# Replay
REPLAY_API_KEY=<generate-api-key>
REPLAY_RATE_LIMIT=2/minute

# HTTPS
SSL_CERT_PATH=/etc/nginx/certs/app.crt
SSL_KEY_PATH=/etc/nginx/certs/app.key

# Monitoring
LOG_LEVEL=info
AUDIT_LOG_PATH=./logs/audit.log
```

### Create `.env` (development - never commit):

```env
# .env - DO NOT COMMIT
# Generated locally from .env.template

NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=anchor_user
DB_PASSWORD=super-secure-local-password-12345!
DB_NAME=anchor_db

JWT_SECRET=dev-jwt-secret-change-in-production-aq7k8x9m2n3
JWT_EXPIRY=900
SESSION_SECRET=dev-session-secret-change-in-production-lp0r9s8t7u

GOVERNANCE_DOMAIN=anchorgovernance.tech
APP_DOMAIN=app.anchorgovernance.tech
OVERSIGHT_DOMAIN=oversight.anchorgovernance.tech

REPLAY_API_KEY=dev-replay-key-local-only-xyz123abc
REPLAY_RATE_LIMIT=2/minute

SSL_CERT_PATH=/etc/nginx/certs/app.crt
SSL_KEY_PATH=/etc/nginx/certs/app.key

LOG_LEVEL=debug
AUDIT_LOG_PATH=./logs/audit.log
```

### Add to `.gitignore`:

```gitignore
# Environment & Secrets
.env
.env.local
.env.*.local
.env.production
*.key
*.pem
secrets/
config/*.secrets.js
config/*.secrets.py

# Logs
logs/
*.log
audit.log

# Credentials
credentials.json
service-account-key.json
credentials/
```

---

## 3. Production Secrets - Never in Code

### Option A: Docker Secrets (Recommended for Docker Swarm)

```yaml
services:
  app:
    image: anchor-app:latest
    secrets:
      - jwt_secret
      - db_password
      - replay_api_key
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password
      REPLAY_API_KEY_FILE: /run/secrets/replay_api_key

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
  replay_api_key:
    external: true
```

Load from file in application:

```javascript
const JWT_SECRET = fs.readFileSync(
  process.env.JWT_SECRET_FILE || '.secret/jwt_secret',
  'utf8'
).trim();
```

### Option B: HashiCorp Vault (Enterprise)

```javascript
const vault = require('node-vault');

const vaultClient = new vault({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getSecrets() {
  try {
    const secret = await vaultClient.read('secret/data/anchor/production');
    return {
      JWT_SECRET: secret.data.data.jwt_secret,
      DB_PASSWORD: secret.data.data.db_password,
      REPLAY_API_KEY: secret.data.data.replay_api_key
    };
  } catch (err) {
    console.error('Failed to retrieve secrets from Vault');
    process.exit(1);
  }
}

const secrets = await getSecrets();
```

### Option C: Environment-Specific Deployment

AWS Secrets Manager:

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({
      SecretId: secretName
    }).promise();
    
    if ('SecretString' in data) {
      return JSON.parse(data.SecretString);
    }
  } catch (err) {
    console.error(`Failed to retrieve ${secretName}`);
    throw err;
  }
}

const secrets = await getSecret('anchor/production/secrets');
const JWT_SECRET = secrets.jwt_secret;
const DB_PASSWORD = secrets.db_password;
```

---

## 4. Secret Rotation

### Implement automatic rotation:

```javascript
// Rotate JWT secret every 30 days
const ROTATION_INTERVAL = 30 * 24 * 60 * 60 * 1000;  // 30 days

async function rotateJWTSecret() {
  const newSecret = crypto.randomBytes(32).toString('hex');
  
  // Store new secret in vault/secrets manager
  await updateSecretInVault('jwt_secret', newSecret);
  
  // Update application (graceful restart)
  console.log('[SECURITY] JWT secret rotated');
  
  // Schedule next rotation
  setTimeout(rotateJWTSecret, ROTATION_INTERVAL);
}

rotateJWTSecret();
```

### Database credentials rotation:

```python
import boto3
import json
from datetime import datetime, timedelta

secrets_client = boto3.client('secretsmanager')

def rotate_db_credentials():
    """Rotate database credentials every 60 days"""
    
    secret_name = 'anchor/db/credentials'
    
    try:
        # Get current credentials
        current = secrets_client.get_secret_value(SecretId=secret_name)
        creds = json.loads(current['SecretString'])
        
        # Generate new password
        new_password = generate_secure_password()
        
        # Update database user
        db.update_user_password(creds['user'], new_password)
        
        # Update secret in vault
        new_creds = {
            'username': creds['user'],
            'password': new_password,
            'host': creds['host'],
            'port': creds['port'],
            'rotated_at': datetime.now().isoformat()
        }
        
        secrets_client.put_secret_value(
            SecretId=secret_name,
            SecretString=json.dumps(new_creds)
        )
        
        print('[SECURITY] Database credentials rotated')
        
    except Exception as e:
        print(f'[ERROR] Failed to rotate credentials: {e}')
        raise

# Schedule rotation
scheduler.add_job(rotate_db_credentials, 'cron', days=60)
```

---

## 5. API Keys & Tokens

### Generate strong API keys:

```javascript
const crypto = require('crypto');

function generateAPIKey() {
  // Generate 32 bytes of random data
  const randomBytes = crypto.randomBytes(32);
  
  // Encode as base64url (safe for URLs)
  const apiKey = randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return apiKey;
}

// Generate replay API key
const REPLAY_API_KEY = generateAPIKey();
console.log('Store this in secrets:', REPLAY_API_KEY);
```

### Manage API key access:

```javascript
// Store hashed API keys in database
const crypto = require('crypto');

function hashAPIKey(apiKey) {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

// On key generation
const apiKey = generateAPIKey();
const hashedKey = hashAPIKey(apiKey);

await db.apiKeys.insert({
  id: 'key_' + Date.now(),
  hashed_key: hashedKey,
  service: 'replay',
  created_at: new Date(),
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
});

// Return to user (only show once!)
return {
  message: 'API key created. Store it safely!',
  api_key: apiKey
};

// On request validation
function validateAPIKey(incomingKey) {
  const hashedIncoming = hashAPIKey(incomingKey);
  return db.apiKeys.findOne({ hashed_key: hashedIncoming });
}
```

---

## 6. Production Checklist

Before deploying to production:

- [ ] No secrets in source code
- [ ] `.env` not in Git
- [ ] All `.env.template` variables have production values
- [ ] JWT_SECRET is 32+ random bytes
- [ ] DB_PASSWORD is 16+ characters with mixed case/numbers/symbols
- [ ] HTTPS certificates are valid and from trusted CA
- [ ] Session secrets are unique per environment
- [ ] API keys are stored as hashes
- [ ] Secret rotation schedule is defined
- [ ] Vault/secrets manager access is restricted
- [ ] All secrets are encrypted at rest
- [ ] Audit logging includes all secret access
- [ ] Incident response plan covers secret compromise

---

## 7. Secret Compromise Procedure

If a secret is exposed:

### Immediate (Within 5 minutes):

```bash
# 1. Alert team
alert_security_team("Secret compromise detected")

# 2. Revoke old secret
revoke_secret("jwt_secret")
revoke_secret("db_password")
revoke_secret("api_keys")

# 3. Generate new secrets
new_jwt_secret = generate_secret()
new_db_password = generate_secret()
new_api_keys = [generate_api_key() for _ in range(3)]
```

### Short-term (Within 1 hour):

```javascript
// Deploy new secrets
deploy_new_secrets({
  JWT_SECRET: new_jwt_secret,
  DB_PASSWORD: new_db_password
});

// Invalidate all existing sessions
db.sessions.deleteMany({});

// Require re-authentication for all users
notify_users("Security incident: please log in again");
```

### Long-term (Within 1 day):

- [ ] Audit logs for secret exposure window
- [ ] Check for unauthorized access
- [ ] Update incident response procedures
- [ ] Review secret management process
- [ ] Conduct security training

---

## 8. Local Development Best Practices

```bash
# Generate development secrets
openssl rand -hex 32  # For JWT_SECRET

# Create .env locally (not in git)
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

# Load from .env in application
require('dotenv').config();  // Node
load_dotenv()  # Python

# Never print secrets
console.log(process.env.JWT_SECRET)  # ❌ WRONG
console.log('JWT loaded from env')   # ✅ RIGHT

# Never commit .env
git add .env  # ❌ WRONG
git add .env.template  # ✅ RIGHT
```

---

## 9. CI/CD Pipeline Secrets

### GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to production
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          REPLAY_API_KEY: ${{ secrets.REPLAY_API_KEY }}
        run: |
          ./deploy.sh
```

### GitLab CI:

```yaml
deploy:
  stage: deploy
  script:
    - export JWT_SECRET=$CI_JWT_SECRET
    - export DB_PASSWORD=$CI_DB_PASSWORD
    - ./deploy.sh
  only:
    - main
  environment: production
```

---

## 10. Audit Trail for Secret Access

```python
# Log all secret reads
import logging

logger = logging.getLogger('secrets_audit')

def get_secret(secret_name, requester_id):
    """Get secret and log access"""
    
    # Retrieve secret
    secret_value = vault.read(secret_name)
    
    # Log access
    logger.info({
        'timestamp': datetime.now().isoformat(),
        'event': 'SECRET_ACCESS',
        'secret_name': secret_name,
        'requester_id': requester_id,
        'ip_address': get_requester_ip(),
        'success': True
    })
    
    return secret_value

# Monitor for suspicious access patterns
# Alert if:
# - Secret accessed from unexpected location
# - Multiple failed attempts
# - Access outside business hours (for production)
# - Unauthorized principal accessing secrets
```

---

## Summary

**Secrets Management Hierarchy:**

```
Development
  ↓
.env (local only, never git)
  
Staging
  ↓
Environment variables (CI/CD secrets)
  
Production
  ↓
Vault/Secrets Manager (encrypted, rotated, audited)
```

**Key Rules:**

1. Never hardcode secrets
2. Never commit `.env`
3. Use `.env.template` for documentation
4. Rotate secrets regularly
5. Encrypt secrets at rest
6. Audit all secret access
7. Have incident response for compromise
8. Different secrets per environment

**This is non-negotiable for institutional infrastructure.**

Anchor handles governance decisions. Secrets compromise means governance compromise.

Treat it accordingly.
