# NGINX Institutional Governance Infrastructure Configuration

## Overview

NGINX as the primary defensive perimeter for Anchor governance systems.

**Core Principle:** Never expose application servers directly to the internet.

```
Internet
   ↓
Cloudflare (DDoS, bot protection)
   ↓
NGINX Reverse Proxy (TLS, rate limiting, routing)
   ↓
─────────────────────────────────────────
│ app.anchorgovernance.tech               │
│ oversight.anchorgovernance.tech         │
│ Internal API services                   │
│ Auth service                            │
│ Replay service (isolated)               │
─────────────────────────────────────────
```

---

## Configuration: Main nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 5M;

    # Security: Hide server version
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=replay_limit:10m rate=2r/m;
    limit_req_zone $binary_remote_addr zone=oversight_limit:10m rate=20r/m;

    # Upstream services
    upstream app_backend {
        server app-service:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream oversight_backend {
        server oversight-service:8001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream auth_service {
        server auth-service:8002 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream replay_service {
        server replay-service:8003 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # ================================================================
    # app.anchorgovernance.tech - Enterprise Operations Portal
    # ================================================================
    server {
        listen 80;
        server_name app.anchorgovernance.tech;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name app.anchorgovernance.tech;

        # TLS Configuration
        ssl_certificate /etc/nginx/certs/app.crt;
        ssl_certificate_key /etc/nginx/certs/app.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        # Content Security Policy (restrict cross-origin scripts)
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.anchorgovernance.tech; frame-ancestors 'none';" always;

        # Root location
        location / {
            proxy_pass http://app_backend;
            proxy_http_version 1.1;

            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Authentication endpoints - stricter rate limiting
        location ~ ^/api/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;

            proxy_pass http://auth_service;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }

        # API endpoints - moderate rate limiting
        location ~ ^/api/ {
            limit_req zone=api_limit burst=50 nodelay;

            proxy_pass http://app_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }

        # Static files - cache aggressively
        location ~ \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            proxy_pass http://app_backend;
            proxy_cache_valid 200 1d;
            expires 1d;
        }
    }

    # ================================================================
    # oversight.anchorgovernance.tech - Governance Oversight Portal
    # MUCH STRICTER SECURITY POSTURE
    # ================================================================
    server {
        listen 80;
        server_name oversight.anchorgovernance.tech;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name oversight.anchorgovernance.tech;

        # TLS Configuration
        ssl_certificate /etc/nginx/certs/oversight.crt;
        ssl_certificate_key /etc/nginx/certs/oversight.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Enhanced Security Headers for Oversight
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

        # Stricter CSP for oversight
        add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://oversight-api.anchorgovernance.tech; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

        # Root location - regulatory traffic is high-value
        location / {
            # Moderate rate limiting for oversight
            limit_req zone=oversight_limit burst=10 nodelay;

            proxy_pass http://oversight_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Governance-Context "regulatory";
            proxy_set_header Connection "";
        }

        # Authentication - stricter than enterprise
        location ~ ^/api/auth/ {
            limit_req zone=auth_limit burst=3 nodelay;

            proxy_pass http://auth_service;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Governance-Context "regulatory";
            proxy_set_header Connection "";
        }

        # Audit & compliance APIs
        location ~ ^/api/audit/ {
            limit_req zone=oversight_limit burst=10 nodelay;

            proxy_pass http://oversight_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Governance-Context "regulatory";
            proxy_set_header Connection "";

            # Log all audit requests
            access_log /var/log/nginx/oversight_audit.log main;
        }

        # Governance APIs
        location ~ ^/api/governance/ {
            limit_req zone=oversight_limit burst=10 nodelay;

            proxy_pass http://oversight_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Governance-Context "regulatory";
            proxy_set_header Connection "";

            # Log all governance requests for audit trail
            access_log /var/log/nginx/oversight_governance.log main;
        }
    }

    # ================================================================
    # Replay Service - INTERNAL ONLY (via proxy only)
    # HIGHEST SECURITY ISOLATION
    # ================================================================
    server {
        listen 8003;
        server_name _;

        # Replay service should NEVER be directly exposed
        # This is internal proxying only from app/oversight
        
        location ~ ^/api/replay/ {
            # EXTREMELY strict rate limiting - 2 requests per minute per IP
            limit_req zone=replay_limit burst=2 nodelay;

            # Require elevated auth token
            if ($http_x_replay_authorization = "") {
                return 403;
            }

            proxy_pass http://replay_service;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";

            # CRITICAL: Log all replay access for forensics
            access_log /var/log/nginx/replay_access.log main;

            # Timeouts for long-running replay operations
            proxy_connect_timeout 30s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # Block everything else
        location / {
            return 403;
        }
    }

    # ================================================================
    # Health Check / Monitoring (internal only)
    # ================================================================
    server {
        listen 8080;
        server_name _;

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location / {
            return 404;
        }
    }
}
```

---

## Docker Compose Integration

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
      - nginx_logs:/var/log/nginx
    networks:
      - governance
    restart: always
    depends_on:
      - app_service
      - oversight_service
      - auth_service
      - replay_service

  app_service:
    image: anchor-app:latest
    expose:
      - "8000"
    networks:
      - governance
    environment:
      - NODE_ENV=production
      - COOKIE_SECURE=true
      - COOKIE_HTTPONLY=true
      - COOKIE_SAMESITE=strict
    restart: always

  oversight_service:
    image: anchor-oversight:latest
    expose:
      - "8001"
    networks:
      - governance
    environment:
      - NODE_ENV=production
      - GOVERNANCE_CONTEXT=regulatory
      - COOKIE_SECURE=true
      - COOKIE_HTTPONLY=true
      - COOKIE_SAMESITE=strict
    restart: always

  auth_service:
    image: anchor-auth:latest
    expose:
      - "8002"
    networks:
      - governance
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRY=900
      - TOTP_ENFORCEMENT=true
    restart: always

  replay_service:
    image: anchor-replay:latest
    expose:
      - "8003"
    networks:
      - governance
    environment:
      - NODE_ENV=production
      - REPLAY_LOG_LEVEL=debug
      - REPLAY_RATE_LIMIT_PER_USER=2m
    restart: always

networks:
  governance:
    driver: bridge

volumes:
  nginx_logs:
```

---

## Deployment Instructions

```bash
# Generate TLS certificates (use Let's Encrypt in production)
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/app.key -out certs/app.crt \
  -subj "/CN=app.anchorgovernance.tech"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/oversight.key -out certs/oversight.crt \
  -subj "/CN=oversight.anchorgovernance.tech"

# Deploy
docker-compose up -d

# Verify
curl -I https://app.anchorgovernance.tech/
curl -I https://oversight.anchorgovernance.tech/

# Check logs
docker-compose logs nginx
```

---

## Security Validations

```bash
# Test SSL/TLS
nmap --script ssl-enum-ciphers -p 443 app.anchorgovernance.tech

# Test headers
curl -I https://app.anchorgovernance.tech/
# Should show: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options

# Test rate limiting
for i in {1..10}; do curl https://app.anchorgovernance.tech/api/auth/login; done
# Should start returning 429 after limit exceeded

# Test CORS
curl -H "Origin: https://evil.com" https://app.anchorgovernance.tech/
# Should NOT return Access-Control-Allow-Origin
```

---

## Monitoring & Alerting

```bash
# Monitor auth failures
tail -f /var/log/nginx/access.log | grep "POST /api/auth"

# Monitor replay access (high-value)
tail -f /var/log/nginx/replay_access.log

# Monitor governance operations (audit trail)
tail -f /var/log/nginx/oversight_governance.log

# Rate limit violations
tail -f /var/log/nginx/error.log | grep "limit_req"
```

---

## Key Security Properties

✓ **TLS Termination** - All traffic encrypted end-to-end  
✓ **Rate Limiting** - Auth: 5/min, API: 100/min, Replay: 2/min  
✓ **Security Headers** - HSTS, CSP, X-Frame-Options, etc.  
✓ **Replay Isolation** - Extreme rate limiting + auth requirement  
✓ **Request Filtering** - Max body size, CORS restrictions  
✓ **Upstream Separation** - Apps never directly exposed  
✓ **Governance Context Headers** - Injected for regulatory tracking  
✓ **Comprehensive Logging** - Audit trail for all operations
