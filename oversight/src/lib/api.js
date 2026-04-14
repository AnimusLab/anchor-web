// src/lib/api.js — Oversight portal API client
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const endpoints = {
  // Isolated Auth
  identify: `${API_BASE}/api/auth/oversight/identify`,
  verifyTotp: `${API_BASE}/api/auth/oversight/verify-totp`,
  
  me:       `${API_BASE}/api/auth/me`,
  logout:   `${API_BASE}/api/auth/me`, // Placeholder for session wipe
  
  ledger:   (entityId = '') =>
    entityId
      ? `${API_BASE}/api/ledger?entity_id=${entityId}`
      : `${API_BASE}/api/ledger`,
  entry:    (entityId, entryId, dialect) =>
    `${API_BASE}/api/audit/${entityId}/entry/${entryId}?dialect=${dialect}`,
  forensic: `${API_BASE}/api/forensic/relay`,
}
