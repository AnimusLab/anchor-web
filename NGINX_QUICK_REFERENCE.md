# Quick Reference - NGINX Anchor Gateway

## Start/Stop NGINX

```powershell
cd D:\Games\nginx-1.30.2

# START
.\nginx.exe

# TEST CONFIG
.\nginx.exe -t

# RELOAD (after config changes)
.\nginx.exe -s reload

# STOP (graceful)
.\nginx.exe -s quit

# STOP (force)
.\nginx.exe -s stop
```

---

## Monitor Logs

```powershell
# Auth attempts
Get-Content D:\Games\nginx-1.30.2\logs\auth.log -Wait

# Governance changes
Get-Content D:\Games\nginx-1.30.2\logs\governance.log -Wait

# Replay requests
Get-Content D:\Games\nginx-1.30.2\logs\replay.log -Wait

# Errors
Get-Content D:\Games\nginx-1.30.2\logs\error.log -Wait
```

---

## Test Rate Limiting

```powershell
# Auth: Should fail on 6th attempt
for ($i=1; $i -le 10; $i++) {
    curl -s http://localhost/api/auth/login
}

# API: Should fail after 100/min
for ($i=1; $i -le 110; $i++) {
    curl -s http://localhost/api/test
}

# Replay: Should fail on 3rd attempt
for ($i=1; $i -le 5; $i++) {
    curl -s -H "X-Replay-Authorization: test" http://localhost/api/replay/start
}
```

---

## Test Endpoints

```powershell
# Health check
curl http://localhost/health

# Frontend
curl http://localhost/

# Auth
curl -X POST http://localhost/api/auth/login

# Governance
curl http://localhost/api/governance/status

# Admin (requires token)
curl -H "X-Admin-Token: test" http://localhost/api/admin/whitelist/list
```

---

## Architecture

```
Rate Limiting Zones:
├─ auth_limit:        5 req/min    (brute-force protection)
├─ api_limit:       100 req/min    (general use)
├─ oversight_limit:  20 req/min    (governance)
└─ replay_limit:      2 req/min    (highest-value surface)

Routing:
├─ / → frontend (5173)
├─ /api/auth/* → auth (8002)
├─ /api/governance/* → api (8000)
├─ /api/replay/* → replay (8003) [token required]
├─ /api/admin/* → api (8000) [token required]
└─ /health → health check

Audit Logs:
├─ auth.log          (authentication)
├─ governance.log    (governance operations)
├─ replay.log        (replay requests)
├─ admin.log         (admin actions)
├─ error.log         (NGINX errors)
└─ access.log        (general access)
```

---

## Security Headers Enabled

✓ X-Frame-Options: DENY (prevent clickjacking)
✓ X-Content-Type-Options: nosniff (prevent MIME sniffing)
✓ X-XSS-Protection: 1; mode=block
✓ Content-Security-Policy: restrict cross-origin
✓ Referrer-Policy: strict-origin

---

## Key Features

✓ Rate limiting on all endpoints
✓ Replay service extreme isolation (2 req/min + token required)
✓ Comprehensive audit logging
✓ Security headers injection
✓ Context header injection (governance tracking)
✓ Error handling (429 rate limit, 50x errors)
✓ Static file caching
✓ Gzip compression
✓ Session keepalive management

---

## Troubleshooting

```powershell
# Check if NGINX is running
Get-Process nginx

# Check port 80 in use
netstat -ano | findstr :80

# Kill process on port 80
taskkill /PID <PID> /F

# View error log
Get-Content D:\Games\nginx-1.30.2\logs\error.log
```

---

## Production Checklist (Later)

- [ ] Get SSL certificates
- [ ] Configure HTTPS (listen 443 ssl)
- [ ] Enable HSTS header
- [ ] Add mTLS for internal services
- [ ] Configure Cloudflare DNS
- [ ] Set up WAF rules
- [ ] Enable bot protection
- [ ] Configure DDoS protection
- [ ] Set up monitoring/alerting
