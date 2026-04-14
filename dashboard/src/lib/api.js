export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE = API_BASE.replace('https', 'wss').replace('http', 'ws');

export const endpoints = {
    // Auth
    login: `${API_BASE}/api/auth/login`,
    registerOrg: `${API_BASE}/api/auth/register/org`,
    checkDomain: (domain) => `${API_BASE}/api/auth/check-domain/${domain}`,
    requestAccess: `${API_BASE}/api/auth/request-access`,
    approve: `${API_BASE}/api/auth/approve`,
    revoke: `${API_BASE}/api/auth/revoke`,
    pending: `${API_BASE}/api/auth/pending`,
    me: `${API_BASE}/api/auth/me`,
    identify: `${API_BASE}/api/auth/enterprise/identify`,
    verifyTotp: `${API_BASE}/api/auth/enterprise/verify-totp`,

    // Projects (Multi-Project Support)
    createProject: `${API_BASE}/api/auth/projects/create`,
    listProjects: `${API_BASE}/api/auth/projects`,
    
    // Invites
    createInvite: `${API_BASE}/api/auth/invite`,
    verifyInvite: (token) => `${API_BASE}/api/auth/invite/verify/${token}`,
    acceptInvite: `${API_BASE}/api/auth/register/accept-invite`,

    // Data
    ledger: (entityId) => `${API_BASE}/api/ledger${entityId ? `?entity_id=${entityId}` : ''}`,
    stats: (entityId) => `${API_BASE}/api/stats${entityId ? `?entity_id=${entityId}` : ''}`,

    // Audit
    audit: (entityId) => `${API_BASE}/api/audit/${entityId}`,
    translate: (entityId, entryId, dialect) =>
        `${API_BASE}/api/audit/${entityId}/translate?entry_id=${entryId}&dialect=${dialect}`,

    // Phase 18: Sovereign Relay
    // Auditor calls this to pull raw forensic data brokered from the Enterprise Spoke
    forensicRelay: `${API_BASE}/api/forensic/relay`,

    // WebSocket
    fleet: (entityId, token) => `${WS_BASE}/ws/fleet/${entityId}?token=${token}`,

    // Admin (Root)
    provision: `${API_BASE}/api/admin/provision`,
    resolve: `${API_BASE}/api/admin/resolve`,
    adminOrgs: `${API_BASE}/api/auth/admin/orgs`,
};
