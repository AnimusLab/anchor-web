# Anchor Spoke Node — Enterprise Installation Guide
**Version:** 5.0.0 · **Est. installation time:** 5 minutes

---

## Prerequisites

| Requirement | Minimum |
| :--- | :--- |
| Docker Engine | 20.10+ |
| Docker Compose | v2.0+ |
| Outbound internet access | `api.anchorgovernance.tech:443` (WSS) |
| Disk space | 1 GB (grows with audit volume) |

Docker installation: https://docs.docker.com/engine/install/

---

## Step 1 — Receive Your Credentials

Anchor will provide you with three values during onboarding:

| Credential | Description |
| :--- | :--- |
| `ENTITY_ID` | Your unique organization identifier (e.g. `nexus_ai`) |
| `MAT` | Your 256-bit Machine Access Token |
| `HUB_PUBKEY` | Anchor's public encryption key (64 hex chars) |

---

## Step 2 — Configure the Spoke

```bash
# Download the Spoke configuration files
curl -O https://get.anchorgovernance.tech/spoke/docker-compose.spoke.yml
curl -O https://get.anchorgovernance.tech/spoke/spoke.env.template

# Copy the template and fill in your credentials
cp spoke.env.template spoke.env
nano spoke.env   # (or use any editor)
```

Fill in your `spoke.env`:

```env
ENTITY_ID=your_entity_id_here
MAT=0x_your_mat_token_here
HUB_PUBKEY=your_64_char_hub_pubkey_here
```

---

## Step 3 — Launch the Spoke

```bash
docker compose -f docker-compose.spoke.yml up -d
```

**Expected output:**
```
✔ Container anchor-spoke  Started
```

---

## Step 4 — Verify the Connection

```bash
# Check the Spoke is running and connected to the Hub
curl http://localhost:8001/api/spoke/health
```

**Expected response:**
```json
{
  "status": "SPOKE_ONLINE",
  "entity_id": "your_entity_id",
  "hub_connected": true,
  "db": "/data/anchor_spoke.db"
}
```

`hub_connected: true` confirms your Spoke is live on the Anchor Grid. ✅

---

## Step 5 — Update Your SDK

Point your existing `anchor_sdk.py` to the local Spoke instead of the Hub:

```python
# Before (direct Hub ingress):
ANCHOR_INGRESS_URL = "https://api.anchorgovernance.tech/api/ingress"

# After (local Spoke ingress):
ANCHOR_INGRESS_URL = "http://localhost:8001/api/spoke/ingest"
```

All audit telemetry now stays inside your firewall. Only cryptographic headers are shared with the Anchor Grid.

---

## Data Storage

Your forensic audit data is stored locally at:

```
Docker volume: anchor_spoke_data → /data/anchor_spoke.db
```

**Your data never leaves your infrastructure** unless an Auditor formally requests access through the Anchor Hub — and even then, only specific entries are relayed, not the full database.

---

## Updates

```bash
# Pull the latest Spoke image and restart
docker compose -f docker-compose.spoke.yml pull
docker compose -f docker-compose.spoke.yml up -d
```

---

## Firewall Requirements

Only one outbound rule is required:

| Destination | Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| `api.anchorgovernance.tech` | `443` | WSS (WebSocket over TLS) | Hub relay connection |

No inbound ports need to be opened in your firewall.

---

## Support

For enterprise support: **tan@anchorgovernance.tech**  
Documentation: **https://anchorgovernance.tech/docs**
