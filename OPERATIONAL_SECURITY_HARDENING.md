# Operational Security Hardening Checklist

## Overview

Shift from architecture mode to **infrastructure defense mode**.

Your governance system is now a high-value target for:
- Automated scanners
- Botnets and credential stuffing
- Session hijacking
- Auth surface enumeration
- Replay endpoint attacks
- Origin probing

This checklist ensures Anchor is production-hardened.

---

## IMMEDIATE PRIORITY (This Week)

### 1. Secure Cookie Configuration

**Current Risk:** Sessions vulnerable to XSS, CSRF, and interception.

**Fix:** Implement secure cookie settings in all backend services.

**Express/Node (auth.py equivalent):**
```javascript
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,      // ✓ Prevent XSS theft
    secure: true,        // ✓ HTTPS only
    sameSite: 'strict',  // ✓ Prevent CSRF
    maxAge: 1000 * 60 * 30, // 30 minutes
    domain: 'anchorgovernance.tech'
  },
  resave: false,
  saveUninitialized: false
};

app.use(session(sessionConfig));
```

**FastAPI (Python backend):**
```python
from fastapi.responses import JSONResponse
from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.session_verifier import SessionVerifier

session_data = {}

class BasicVerifier(SessionVerifier):
    def verify_session(self, model: SessionModel) -> bool:
        return model.session_id in session_data

@app.post("/login")
async def login(request: Request):
    # After successful auth...
    response = JSONResponse({"status": "authenticated"})
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,           # ✓ No JS access
        secure=True,             # ✓ HTTPS only
        samesite="strict",       # ✓ CSRF protection
        max_age=1800,            # 30 minutes
        domain="anchorgovernance.tech"
    )
    return response
```

**Django (if applicable):**
```python
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_AGE = 1800
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
```

### 2. Rate Limiting on Auth Endpoints

**Current Risk:** Brute-force attacks, credential stuffing.

**Fix:** Implement progressive rate limiting.

**Express Example:**
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 5,                      // 5 attempts
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for successful requests with valid TOTP
    return req.user && req.user.totp_verified;
  },
  handler: (req, res) => {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      retry_after: 900  // seconds
    });
  }
});

app.post('/login', authLimiter, async (req, res) => {
  // Login logic
});
```

### 3. HTTPS Enforcement

**Current Risk:** Man-in-the-middle attacks, session hijacking.

**Fix:** Redirect all HTTP → HTTPS, enable HSTS.

**Express:**
```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
```

### 4. CSRF Protection

**Current Risk:** Replay endpoints triggerable cross-origin.

**Fix:** Implement CSRF token validation.

**Express:**
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: false }));

// Return CSRF token to client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Validate CSRF on state-changing requests
app.post('/api/replay/request', (req, res) => {
  // CSRF middleware automatically validates
  // If invalid, returns 403
});
```

### 5. Helmet.js Security Headers

**Current Risk:** XSS, clickjacking, MIME type sniffing.

**Fix:** Deploy Helmet for automatic header injection.

**Express:**
```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.anchorgovernance.tech"],
    frameAncestors: ["'none'"]
  }
}));
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
```

### 6. Disable Stack Traces in Production

**Current Risk:** Information leakage, framework fingerprinting.

**Fix:** Generic error responses.

**Express:**
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err);  // Log internally
    res.status(500).json({
      error: 'Internal server error',
      // NEVER include: err.message, err.stack, err.toString()
    });
  });
}
```

---

## HIGH PRIORITY (Next 1-2 Weeks)

### 7. Session Rotation

**Current Risk:** Session fixation attacks.

**Fix:** Regenerate session IDs after login and privilege escalation.

**Express:**
```javascript
app.post('/login', async (req, res) => {
  // Validate credentials...
  
  // Rotate session ID
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Auth failed' });
    
    req.session.user_id = user.id;
    req.session.auditor_type = user.auditor_type;
    
    res.json({ success: true });
  });
});
```

### 8. Session Fingerprinting

**Current Risk:** Session hijacking from stolen cookies.

**Fix:** Bind sessions to device/browser fingerprint.

**Implementation:**
```javascript
// On login, store session fingerprint
const crypto = require('crypto');

function getSessionFingerprint(req) {
  const factors = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.ip
  ];
  return crypto
    .createHash('sha256')
    .update(factors.join('|'))
    .digest('hex');
}

app.post('/login', (req, res) => {
  // Validate credentials...
  
  req.session.fingerprint = getSessionFingerprint(req);
  req.session.created_at = Date.now();
  req.session.created_ip = req.ip;
  
  res.json({ success: true });
});

// On every request, verify fingerprint
app.use((req, res, next) => {
  if (req.session.user_id) {
    const currentFingerprint = getSessionFingerprint(req);
    
    if (currentFingerprint !== req.session.fingerprint) {
      console.warn(`[SECURITY] Session fingerprint mismatch for ${req.ip}`);
      req.session.destroy();
      return res.status(401).json({ error: 'Session invalid' });
    }
    
    // Warn if IP changed significantly (geo-anomaly)
    if (req.ip !== req.session.created_ip) {
      console.warn(`[SECURITY] IP changed from ${req.session.created_ip} to ${req.ip}`);
      // Could require re-authentication for regulatory users
    }
  }
  
  next();
});
```

### 9. Replay Endpoint Elevation

**Current Risk:** Replay endpoints casually accessible, high-value target.

**Fix:** Require TOTP revalidation for replay requests.

**Express:**
```javascript
const totpElevation = async (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user has replay access
  const hasReplayAuth = req.session.permissions.includes('replay.request');
  if (!hasReplayAuth) {
    return res.status(403).json({ error: 'No replay authority' });
  }
  
  // Check TOTP verification timestamp
  const totp_verified_at = req.session.totp_verified_at || 0;
  const now = Date.now();
  const TOTP_ELEVATION_WINDOW = 5 * 60 * 1000;  // 5 minutes
  
  if (now - totp_verified_at > TOTP_ELEVATION_WINDOW) {
    return res.status(401).json({
      error: 'TOTP re-verification required for replay access',
      require_totp: true
    });
  }
  
  next();
};

app.post('/api/replay/request', totpElevation, async (req, res) => {
  // Elevated replay endpoint
  console.log(`[AUDIT] Replay request from ${req.session.user_id}`);
  // Handle replay...
});
```

### 10. Comprehensive Audit Logging

**Current Risk:** No forensic trail of security events.

**Fix:** Log all auth, replay, and governance events.

**Winston Logger Setup:**
```javascript
const winston = require('winston');

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'audit.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
});

// Login events
auditLogger.info({
  type: 'LOGIN_SUCCESS',
  user_id: req.session.user_id,
  timestamp: new Date().toISOString(),
  ip: req.ip,
  user_agent: req.headers['user-agent']
});

// Failed auth
auditLogger.warn({
  type: 'LOGIN_FAILED',
  email: req.body.email,
  reason: 'Invalid credentials',
  ip: req.ip,
  timestamp: new Date().toISOString()
});

// Replay request
auditLogger.info({
  type: 'REPLAY_REQUEST',
  user_id: req.session.user_id,
  target_block: req.body.block_hash,
  timestamp: new Date().toISOString(),
  ip: req.ip
});

// Governance change
auditLogger.info({
  type: 'GOVERNANCE_CHANGE',
  user_id: req.session.user_id,
  change_type: 'POLICY_MODIFIED',
  policy_id: req.body.policy_id,
  timestamp: new Date().toISOString()
});
```

---

## MEDIUM PRIORITY (Next Month)

### 11. WebAuthn / FIDO2 Support (Optional)

For highest-value users (regulatory auditors, owners):

```javascript
const fido2 = require('@simplewebauthn/server');

// Registration flow
app.post('/api/webauthn/register', async (req, res) => {
  // Generate challenge
  const attestationOptions = await fido2.generateAttestationOptions({
    rpID: 'anchorgovernance.tech',
    rpName: 'Anchor Governance',
    userID: Buffer.from(req.session.user_id),
    userName: req.session.email
  });
  
  req.session.challenge = attestationOptions.challenge;
  res.json(attestationOptions);
});

// Authentication flow
app.post('/api/webauthn/authenticate', async (req, res) => {
  const assertion = req.body;
  
  const verified = await fido2.verifyAssertionResponse({
    assertion,
    expectedChallenge: req.session.challenge,
    expectedOrigin: 'https://anchorgovernance.tech',
    expectedRPID: 'anchorgovernance.tech',
    credential: storedCredential
  });
  
  if (verified) {
    req.session.webauthn_verified = true;
  }
});
```

### 12. Threat Intelligence Integration

Monitor for:
- Repeated failed login attempts
- IP reputation
- Suspicious geographic patterns
- Botnet patterns

```javascript
const geoip = require('geoip-lite');

app.use((req, res, next) => {
  const geo = geoip.lookup(req.ip);
  
  // Check if IP is flagged
  if (isSuspiciousIP(req.ip)) {
    auditLogger.warn({
      type: 'SUSPICIOUS_IP',
      ip: req.ip,
      country: geo?.country,
      timestamp: new Date().toISOString()
    });
    
    // Could implement CAPTCHA here
  }
  
  next();
});
```

---

## IMPLEMENTATION ROADMAP

```
Week 1:
  ☐ Secure cookies (httpOnly, secure, sameSite)
  ☐ Rate limiting
  ☐ HTTPS enforcement
  ☐ CSRF tokens
  ☐ Helmet.js headers

Week 2:
  ☐ Session rotation
  ☐ Session fingerprinting
  ☐ Replay endpoint elevation
  ☐ Audit logging
  ☐ NGINX deployment

Week 3-4:
  ☐ WebAuthn (optional)
  ☐ Threat intel
  ☐ Security testing
  ☐ Incident response procedures

Ongoing:
  ☐ Log monitoring
  ☐ Vulnerability scanning
  ☐ Penetration testing
  ☐ Security updates
```

---

## Testing Checklist

After implementing each item:

```bash
# Test secure cookies
curl -I https://app.anchorgovernance.tech/
grep -i "set-cookie" response.headers
# Should show: httponly; secure; samesite=strict

# Test rate limiting
for i in {1..10}; do 
  curl https://app.anchorgovernance.tech/api/login
done
# Should return 429 after limit

# Test CSRF
curl -X POST https://app.anchorgovernance.tech/api/governance/ \
  -H "Origin: https://evil.com"
# Should return 403

# Test session fingerprint
# Login from IP A, then request from IP B
# Should return 401 or re-prompt TOTP

# Test replay elevation
curl -X POST https://app.anchorgovernance.tech/api/replay/request
# Should return 401 requiring TOTP re-verification

# Test headers
curl -I https://app.anchorgovernance.tech/
# Should show: HSTS, X-Frame-Options, X-Content-Type-Options, CSP
```

---

## Monitoring & Alerting

```bash
# Real-time auth monitoring
tail -f audit.log | grep LOGIN

# Replay request monitoring
tail -f audit.log | grep REPLAY_REQUEST

# Rate limit violations
tail -f /var/log/nginx/error.log | grep limit_req

# Governance audit trail
tail -f audit.log | grep GOVERNANCE_CHANGE

# Set up alerts
# - >5 failed logins from same IP → block
# - >2 replay requests in 5 min → escalate
# - Session from unexpected geography → re-auth
# - CSRF token validation failures → log incident
```

---

## Summary

**You've built strong governance architecture.**

**Now protect it operationally.**

This checklist transforms Anchor from:
> Architecturally sound but operationally exposed

to:
> Institutionally credible infrastructure

Deploy NGINX first.
Then secure cookies, rate limiting, and CSRF.

Everything else follows.
