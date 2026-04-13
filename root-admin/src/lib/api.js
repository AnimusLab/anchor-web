// src/lib/api.js

export const API_BASE = import.meta.env.VITE_API_URL || ''

export const endpoints = {
  // Admin Auth (reusing existing system admin login)
  login: `${API_BASE}/api/auth/login`, 
  me:    `${API_BASE}/api/auth/me`,

  // Oversight Admin
  provision: `${API_BASE}/api/admin/provision`,
  auditors:  `${API_BASE}/api/oversight/admin/auditors`,
  revoke:    `${API_BASE}/api/oversight/admin/revoke`,
  
  // Analytics & Ledger
  stats:    `${API_BASE}/api/stats`,
  ledger:   (entityId = '') => 
    entityId ? `${API_BASE}/api/ledger?entity_id=${entityId}` : `${API_BASE}/api/ledger`,
  
  // Real-time (WebSocket)
  wsFleet: (entityId, token) => 
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/fleet/${entityId}?token=${token}`
}
