// src/lib/api.js — Root Admin portal API client
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const endpoints = {
  // Isolated Master Auth
  identify: `${API_BASE}/api/auth/admin/identify`,
  verifyTotp: `${API_BASE}/api/auth/admin/verify-totp`,
  
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
