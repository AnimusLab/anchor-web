---
title: Anchor
emoji: ⚓
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# Anchor Governance Engine

Anchor is an enterprise-grade AI governance and oversight platform designed to move compliance from "post-audit logging" to "real-time native constraints." This repository contains the full federated stack of the Anchor system.

## 🛰 System Architecture

The Anchor ecosystem consists of several specialized modules:

| Module | Purpose | Tech Stack |
| :--- | :--- | :--- |
| **[Landing](file:///d:/anchor-web/landing)** | High-density public-facing showcase with Bloomberg Terminal aesthetics. | React, Vite, SVG Charts |
| **[Dashboard](file:///d:/anchor-web/dashboard)** | User Control Plane for enterprise compliance monitoring and policy management. | React, Vite, Framer Motion |
| **[Oversight](file:///d:/anchor-web/oversight)** | Public/Regulator portal for high-level compliance transparency. | React, Vite |
| **[Root Admin](file:///d:/anchor-web/root-admin)** | Administrative system for managing entities, MAT tokens, and master rulebooks. | React, Vite |
| **[Server](file:///d:/anchor-web/server)** | The "Spoke Node" backend. Handles audit ingestion, WASM sandboxing, and ledger syncing. | Python, Docker, SQLite |

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Docker (for the Server/Spoke Node)
- Git

### 2. Running the Landing Page
```bash
cd landing
npm install
npm run dev
```

### 3. Running the Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### 4. Setting up the Spoke Node
Refer to the specialized [Spoke Installation Guide](file:///d:/anchor-web/server/SPOKE_INSTALL.md) for full backend setup.

## 🔒 Security Architecture (v6.3+)

- **Pure HttpOnly Session Cookies**: Authentication tokens are transmitted via `HttpOnly`, `Secure`, `SameSite=Lax` cookies across `dashboard`, `oversight`, and `root-admin` portals (no plaintext `localStorage` token storage).
- **In-Process Base64 QR Code Generation**: TOTP provisioning QR codes are rendered locally via `qrcode` as `data:image/png;base64,...` data URIs, ensuring zero plaintext secrets are leaked to external third-party services.
- **Encrypted-At-Rest Credentials**: TOTP secrets (`totp_secret`) are encrypted at rest with Fernet AES-128 key management in database models (`EnterpriseUser`, `RegulatoryOfficial`).
- **Rate-Limited & Masked Identification**: Public `/identify` endpoints obfuscate emails and names while enforcing sliding-window IP rate limiting (10 req/min/IP).

## 🗺 Roadmap
Future development (v6.0+) focuses on the **Model Context Protocol (MCP)** integration, allowing AI agents to query rulebooks natively during inference. See [ROADMAP_v6_MCP.md](file:///d:/anchor-web/DOCS/ROADMAP_v6_MCP.md) for details.

---
© 2026 AnimusLab · Empowering Ethical AI through Cryptographic Governance.
