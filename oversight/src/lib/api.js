// src/lib/api.js — Oversight portal API client
export const API_BASE = import.meta.env.VITE_API_URL || 'https://animuslab-anchor.hf.space'

export const endpoints = {
  baseUrl: API_BASE,
  identifyFirst: `${API_BASE}/api/auth/identify-first`,
  // Isolated Auth
  identify: `${API_BASE}/api/auth/oversight/identify`,
  verifyTotp: `${API_BASE}/api/auth/oversight/verify-totp`,
  
  me:       `${API_BASE}/api/auth/me`,
  logout:   `${API_BASE}/api/auth/me`, // Placeholder for session wipe
  
  ledger:   (hubId = '') =>
    hubId
      ? `${API_BASE}/api/ledger?hub_id=${hubId}`
      : `${API_BASE}/api/ledger`,
  entry:    (hubId, entryId, dialect) =>
    `${API_BASE}/api/audit/${hubId}/entry/${entryId}?dialect=${dialect}`,
  forensic: `${API_BASE}/api/forensic/relay`,
}
