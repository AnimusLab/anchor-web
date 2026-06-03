# NGINX on Windows - Anchor Setup Guide

## 1. Verify NGINX Installation

Open PowerShell and navigate to your NGINX directory:

```powershell
# Find NGINX installation (typical locations)
ls "C:\nginx"
ls "C:\Program Files\nginx"
ls "C:\Program Files (x86)\nginx"

# Should show:
# - conf/
# - html/
# - logs/
# - nginx.exe
```

If you don't see NGINX, check where it was installed:

```powershell
# Search for nginx.exe
Get-ChildItem -Path C:\ -Filter nginx.exe -Recurse -ErrorAction SilentlyContinue
```

---

## 2. Start NGINX

Navigate to your NGINX directory and start it:

```powershell
# Navigate to NGINX directory (example)
cd "C:\nginx"

# Start NGINX
.\nginx.exe

# Verify it's running
netstat -ano | findstr :80
netstat -ano | findstr :443
```

You should see:
```
LISTENING    <PID>
```

---

## 3. Verify NGINX is Running

```powershell
# Check if process is running
Get-Process nginx

# Should show:
# Handles  NPM(K)    PM(K)      WS(K) VM(M)   CPU(s)     Id ProcessName
#    ...     ...      ...        ...  ...      ...     ... nginx
```

Or test via browser:

```powershell
# Open browser to http://localhost
start http://localhost

# Should see: "Welcome to nginx!"
```

---

## 4. Configuration Location

On Windows, NGINX configuration is at:

```
C:\nginx\conf\nginx.conf
```

Or wherever you installed it:

```powershell
# Find nginx.conf
Get-ChildItem -Path C:\nginx -Filter nginx.conf -Recurse
```

---

## 5. Basic Configuration for Anchor (Windows)

Open `C:\nginx\conf\nginx.conf` and replace with this:

```nginx
worker_processes auto;
error_log logs/error.log warn;
pid logs/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log logs/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 5M;

    server_tokens off;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

    # ================================================================
    # app.anchorgovernance.tech - Local Development
    # ================================================================
    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }

        location ~ ^/api/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://localhost:8000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }

        location ~ ^/api/ {
            limit_req zone=api_limit burst=50 nodelay;
            proxy_pass http://localhost:8000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }
    }

    # Health check endpoint
    server {
        listen 8080;
        server_name _;

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 6. Test Configuration

After editing `nginx.conf`:

```powershell
cd C:\nginx

# Test configuration syntax
.\nginx.exe -t

# Should show:
# nginx: the configuration file C:\nginx\conf\nginx.conf syntax is ok
# nginx: configuration file C:\nginx\conf\nginx.conf test is successful
```

---

## 7. Reload Configuration

After making changes to `nginx.conf`:

```powershell
cd C:\nginx

# Reload configuration WITHOUT restarting
.\nginx.exe -s reload

# Or restart
.\nginx.exe -s stop
.\nginx.exe
```

---

## 8. Common NGINX Commands on Windows

```powershell
cd C:\nginx

# Start NGINX
.\nginx.exe

# Stop NGINX gracefully
.\nginx.exe -s stop

# Reload configuration
.\nginx.exe -s reload

# Quick reload (HUP signal)
.\nginx.exe -s reload

# Reopen log files
.\nginx.exe -s reopen

# Check configuration
.\nginx.exe -t

# Show NGINX version
.\nginx.exe -v

# Show configuration settings
.\nginx.exe -V
```

---

## 9. Running NGINX as Windows Service (Optional)

To run NGINX automatically on startup:

### Option A: Use NSSM (Non-Sucking Service Manager)

```powershell
# Download NSSM: https://nssm.cc/download
# Extract to C:\nssm

cd C:\nssm

# Install as service
.\nssm.exe install nginx "C:\nginx\nginx.exe"

# Start service
.\nssm.exe start nginx

# Check service status
.\nssm.exe status nginx

# Remove service
.\nssm.exe remove nginx confirm
```

### Option B: Use Windows Task Scheduler

1. Open Task Scheduler (Win + R → taskschd.msc)
2. Create Basic Task → Name: "NGINX"
3. Trigger: "At startup"
4. Action: Start a program
5. Program: `C:\nginx\nginx.exe`
6. Click OK

---

## 10. Logs Location

```powershell
# Access logs
C:\nginx\logs\access.log

# Error logs
C:\nginx\logs\error.log

# View in real-time
Get-Content -Path C:\nginx\logs\error.log -Wait
Get-Content -Path C:\nginx\logs\access.log -Wait
```

---

## 11. Testing Anchor Configuration

After starting NGINX and your backend services:

```powershell
# Test auth endpoint (rate limited)
for ($i=1; $i -le 10; $i++) {
    Invoke-WebRequest -Uri "http://localhost/api/auth/login" -Method POST
}

# After 5 attempts, should return 429 (Too Many Requests)

# Test API endpoint
Invoke-WebRequest -Uri "http://localhost/api/status" -Headers @{"X-Forwarded-For"="192.168.1.1"}

# Test health check
Invoke-WebRequest -Uri "http://localhost:8080/health"

# Should return: healthy
```

---

## 12. Frontend Development Server

Make sure your frontend is running on the port NGINX expects:

### React (Vite):
```bash
cd d:\anchor-web\dashboard
npm run dev
# Runs on http://localhost:5173
```

Update NGINX config to proxy to 5173:
```nginx
location / {
    proxy_pass http://localhost:5173;
}
```

### Node.js Backend:
```bash
cd d:\anchor-web
npm start
# Runs on http://localhost:3000
```

---

## 13. Development Workflow

```powershell
# Terminal 1: Start NGINX
cd C:\nginx
.\nginx.exe

# Terminal 2: Start backend (if needed)
cd d:\anchor-web\server
python -m uvicorn main:app --reload --port 8000

# Terminal 3: Start frontend
cd d:\anchor-web\dashboard
npm run dev

# Terminal 4: Monitor NGINX logs
Get-Content -Path C:\nginx\logs\error.log -Wait
```

Then access: `http://localhost` (NGINX reverse proxy)

---

## 14. Troubleshooting

### NGINX won't start
```powershell
# Check if port 80 is already in use
netstat -ano | findstr :80

# Kill process using port 80
taskkill /PID <PID> /F

# Try starting again
cd C:\nginx
.\nginx.exe
```

### Configuration error
```powershell
# Test configuration syntax
cd C:\nginx
.\nginx.exe -t

# Shows: syntax is ok / test is successful
```

### Can't access localhost
```powershell
# Verify NGINX is running
Get-Process nginx

# Check ports
netstat -ano | findstr :80
netstat -ano | findstr :443

# Check firewall
Get-NetFirewallRule -DisplayName "*nginx*"
```

### Proxy not working
```powershell
# Check backend is running
Get-Process node    # If Node.js backend
Get-Process python  # If Python backend

# Verify port numbers match
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :8000  # Backend
```

---

## 15. Production Setup (Later)

When moving to production:

1. **Get SSL certificates** (Let's Encrypt)
   - Install Certbot for Windows
   - Generate certs for your domains
   - Update NGINX config with SSL

2. **Configure for your actual domains**
   ```nginx
   server_name app.anchorgovernance.tech;
   ssl_certificate /path/to/cert.crt;
   ssl_certificate_key /path/to/key.key;
   ```

3. **Deploy behind cloud provider**
   - AWS (ELB + EC2)
   - Azure (Application Gateway + VMs)
   - DigitalOcean (Droplets)
   - Cloudflare (DNS + WAF)

4. **Enable monitoring**
   - Monitor NGINX logs
   - Set up alerts
   - Track rate limiting events

---

## Quick Start

```powershell
# 1. Start NGINX
cd C:\nginx
.\nginx.exe

# 2. Verify running
netstat -ano | findstr :80

# 3. Test in browser
start http://localhost

# 4. Check logs
Get-Content C:\nginx\logs\error.log

# 5. Reload config after changes
.\nginx.exe -s reload

# 6. Stop NGINX
.\nginx.exe -s stop
```

---

## Next Steps

1. ✓ Install NGINX (done)
2. Start NGINX (now: `.\nginx.exe`)
3. Update configuration for Anchor
4. Start backend services (Python, Node)
5. Test rate limiting
6. Verify logs
7. Test all endpoints
8. Monitor for 24 hours

You're now ready for **operational hardening phase** of Anchor!
