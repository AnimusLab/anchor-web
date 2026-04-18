// src/lib/api.js — Root Admin portal API client
// Production: HuggingFace Space. Override via VITE_API_URL env var or localStorage.
export const API_BASE = localStorage.getItem('anchor_api_url')
  || import.meta.env.VITE_API_URL
  || 'https://animuslab-anchor.hf.space'

export const endpoints = {
  // Expose raw base for components that build paths manually
  baseUrl: API_BASE,

  // Root Admin Auth (isolated two-step)
  identify:   `${API_BASE}/api/auth/admin/identify`,
  verifyTotp: `${API_BASE}/api/auth/admin/verify-totp`,
  me:         `${API_BASE}/api/auth/me`,

  // Fleet Provisioning
  provisionAuditor:    `${API_BASE}/api/auth/admin/provision/auditor`,
  provisionEnterprise: `${API_BASE}/api/auth/admin/provision/enterprise`,

  // Oversight Admin (auditor management)
  auditors: `${API_BASE}/api/oversight/admin/auditors`,
  revoke:   `${API_BASE}/api/oversight/admin/revoke`,

  // Analytics & Ledger
  stats:  `${API_BASE}/api/stats`,
  ledger: (entityId = '') =>
    entityId ? `${API_BASE}/api/ledger?entity_id=${entityId}` : `${API_BASE}/api/ledger`,

  // Real-time (WebSocket) — route through CF tunnel or direct HF
  wsFleet: (entityId, token) => {
    const wsBase = API_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws')
    return `${wsBase}/ws/fleet/${entityId}?token=${token}`
  },
}
