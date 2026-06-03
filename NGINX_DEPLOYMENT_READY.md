# NGINX Anchor Deployment - D:\Games\nginx-1.30.2

## Configuration Deployed ✓

Your institutional governance infrastructure is now configured and ready.

---

## Step 1: Verify Configuration

```powershell
cd D:\Games\nginx-1.30.2

# Test NGINX configuration syntax
.\nginx.exe -t

# Should show:
# nginx: the configuration file D:\Games\nginx-1.30.2\conf\nginx.conf syntax is ok
# nginx: configuration file D:\Games\nginx-1.30.2\conf\nginx.conf test is successful
```

---

## Step 2: Start NGINX

```powershell
cd D:\Games\nginx-1.30.2

# Start NGINX
.\nginx.exe

# Verify it's listening on port 80
netstat -ano | findstr :80

# Should show:
# TCP    0.0.0.0:80    0.0.0.0:0    LISTENING    <PID>
```

---

## Step 3: Start Your Backend Services

Open additional PowerShell terminals and start:

**Terminal 2 - Frontend (Vite React):**
```bash
cd d:\anchor-web\dashboard
npm run dev
# Should run on http://localhost:5173
```

**Terminal 3 - Backend API:**
```bash
cd d:\anchor-web\server
python -m uvicorn main:app --reload --port 8000
# Should run on http://localhost:8000
```

**Terminal 4 - Auth Service (if separate):**
```bash
cd d:\anchor-web\server
python -m uvicorn auth:app --reload --port 8002
# Should run on http://localhost:8002
```

**Terminal 5 - Replay Service (internal):**
```bash
cd d:\anchor-web\server
python -m uvicorn replay:app --reload --port 8003
# Should run on http://localhost:8003
```

---

## Step 4: Test NGINX Gateway

```powershell
# Test basic gateway (should return frontend)
curl http://localhost/

# Test health check
curl http://localhost/health
# Should return: governance_infrastructure_operational

# Test auth rate limiting
for ($i=1; $i -le 10; $i++) {
    $response = curl -s -w "%{http_code}" http://localhost/api/auth/login
    Write-Host "Attempt $i: $response"
}
# Attempts 1-5 should work, attempt 6-10 should return 429 (Too Many Requests)

# Test API endpoint
curl -H "X-Real-IP: 192.168.1.1" http://localhost/api/status
```

---

## Step 5: Monitor Logs

Open additional terminals to monitor:

**Monitor Auth Attempts:**
```powershell
# Real-time monitoring of authentication attempts
Get-Content D:\Games\nginx-1.30.2\logs\auth.log -Wait
```

**Monitor Governance Changes:**
```powershell
# Audit trail for governance operations
Get-Content D:\Games\nginx-1.30.2\logs\governance.log -Wait
```

**Monitor Replay Access:**
```powershell
# High-value forensic trail
Get-Content D:\Games\nginx-1.30.2\logs\replay.log -Wait
```

**Monitor Errors:**
```powershell
# NGINX errors and issues
Get-Content D:\Games\nginx-1.30.2\logs\error.log -Wait
```

---

## NGINX Configuration Architecture

Your deployment now includes:

### Rate Limiting Zones (Constitutional Infrastructure)
- **Auth**: 5 requests/min per IP (brute-force protection)
- **API**: 100 requests/min per IP (general use)
- **Oversight**: 20 requests/min per IP (governance)
- **Replay**: 2 requests/min per IP (highest-value surface)

### Security Headers (Institutional Defense)
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME sniffing)
- X-XSS-Protection: enabled
- CSP: Content Security Policy with 'self' restriction
- Referrer-Policy: strict-origin

### Isolated Endpoints (Governance Surfaces)
- **`/api/auth/*`** → Auth service (8002) - Strictest rate limiting
- **`/api/oversight/*`** → Governance oversight - Moderate limiting
- **`/api/governance/*`** → Governance audit trail - Comprehensive logging
- **`/api/replay/*`** → Replay service (8003) - EXTREME rate limiting + token validation
- **`/api/admin/whitelist/*`** → Admin endpoints - Require admin token

### Audit Logging (Forensic Trail)
- **`logs/auth.log`** - All authentication attempts
- **`logs/governance.log`** - All governance changes
- **`logs/replay.log`** - All replay requests
- **`logs/admin.log`** - All admin actions
- **`logs/error.log`** - NGINX errors
- **`logs/access.log`** - General access log

### Context Injection (Traceability)
Every request gets injected headers:
- `X-Governance-Context`: Type of operation (auth/api/governance/replay/admin)
- `X-Request-Start`: Request timestamp for performance monitoring
- `X-Real-IP`: Original client IP
- `X-Forwarded-For`: Proxy chain
- `X-Forwarded-Proto`: Protocol (http/https)

---

## Development Workflow

```powershell
# Terminal 1: NGINX gateway
cd D:\Games\nginx-1.30.2
.\nginx.exe

# Terminal 2: Frontend (Vite React)
cd d:\anchor-web\dashboard
npm run dev

# Terminal 3: Backend API
cd d:\anchor-web\server
python -m uvicorn main:app --reload --port 8000

# Terminal 4: Monitor NGINX logs
Get-Content D:\Games\nginx-1.30.2\logs\error.log -Wait

# Access your app at http://localhost
# NGINX routes:
#   / → frontend (5173)
#   /api/auth/* → auth service (8002)
#   /api/governance/* → backend (8000)
#   /api/replay/* → replay service (8003) [rate limited 2/min]
```

---

## Common NGINX Commands

```powershell
cd D:\Games\nginx-1.30.2

# Reload configuration (no downtime)
.\nginx.exe -s reload

# Graceful shutdown
.\nginx.exe -s quit

# Force stop
.\nginx.exe -s stop

# Check configuration syntax
.\nginx.exe -t

# Show version
.\nginx.exe -v

# View running processes
Get-Process nginx
```

---

## Stopping NGINX

```powershell
cd D:\Games\nginx-1.30.2

# Graceful stop
.\nginx.exe -s stop

# Or force quit
taskkill /F /IM nginx.exe

# Verify stopped
Get-Process nginx -ErrorAction SilentlyContinue
# Should return nothing if successful
```

---

## What Your Gateway Now Does

**Ingress Control:**
- All traffic flows through NGINX reverse proxy
- Applications never directly exposed to clients
- Single point of security enforcement

**Rate Limiting:**
- Brute-force protection on auth (5 attempts/min)
- API rate limiting (100 req/min)
- Replay extreme isolation (2 req/min)

**Governance Audit:**
- Every governance change logged
- Every replay access recorded
- Every auth attempt tracked
- Identity fingerprinting enabled

**Constitutional Enforcement:**
- Replay requires elevated token
- Admin endpoints protected
- All contexts injected for traceability

**Institutional Defense:**
- Security headers preventing XSS/clickjacking
- MIME type sniffing prevention
- CSP restricting script sources
- Hidden server version

---

## Architecture Flow

```
http://localhost/
       ↓
    NGINX
    (rate limiting, headers, logging)
       ↓
   ┌─────────────────────────────────┐
   │  / → frontend (5173)            │
   │  /api/auth/ → auth (8002)       │
   │  /api/governance/ → api (8000)  │
   │  /api/replay/ → replay (8003)   │
   │  /api/admin/* → api (8000)      │
   └─────────────────────────────────┘
       ↓
   Audit Logging
   - auth.log
   - governance.log
   - replay.log
   - error.log
```

---

## Success Indicators

Your NGINX deployment is working correctly when:

✓ `http://localhost` loads your frontend  
✓ `http://localhost/health` returns "governance_infrastructure_operational"  
✓ First 5 auth attempts work, 6th returns 429 (rate limit)  
✓ `logs/auth.log` shows all login attempts  
✓ `logs/governance.log` shows governance operations  
✓ `logs/replay.log` shows replay requests (when they happen)  
✓ `/api/replay/*` without auth token returns 403  
✓ All responses include security headers (X-Frame-Options, CSP, etc.)  

---

## Next Steps

1. ✓ NGINX installed and configured
2. ✓ Rate limiting enabled
3. ✓ Audit logging configured
4. Start your backend services (Terminals 2-5)
5. Test all endpoints
6. Monitor logs for 24 hours
7. Validate rate limiting works
8. Deploy secure cookies in backend
9. Add session rotation
10. Implement session fingerprinting

You now have **constitutional ingress infrastructure** for Anchor! 🏛️
