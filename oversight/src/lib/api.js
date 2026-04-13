// src/lib/api.js — Oversight portal API client

export const API_BASE = import.meta.env.VITE_API_URL || ''

export const endpoints = {
  login:    `${API_BASE}/api/oversight/login`,
  me:       `${API_BASE}/api/oversight/me`,
  logout:   `${API_BASE}/api/oversight/logout`,
  ledger:   (entityId = '') =>
    entityId
      ? `${API_BASE}/api/ledger?entity_id=${entityId}`
      : `${API_BASE}/api/ledger`,
  entry:    (entityId, entryId, dialect) =>
    `${API_BASE}/api/audit/${entityId}/entry/${entryId}?dialect=${dialect}`,
  forensic: `${API_BASE}/api/forensic/relay`,
}
