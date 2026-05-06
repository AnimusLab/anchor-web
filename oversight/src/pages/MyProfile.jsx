import React from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();

  const fields = [
    { label: 'Display Name',    value: user?.name || '—' },
    { label: 'Clearance ID',    value: user?.sub  || '—', mono: true },
    { label: 'Regulator',       value: user?.regulator || '—' },
    { label: 'Access Level',    value: user?.access_level || 'READ_ONLY' },
    { label: 'Session ID',      value: user?.session_id || '—', mono: true },
    { label: 'Portal',          value: 'oversight.anchorgovernance.tech' },
    { label: 'Token Scope',     value: 'regulator' },
  ];

  return (
    <PortalLayout>
      <div style={{ padding: 28, maxWidth: 640 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>My Profile</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your regulatory clearance and session information.</div>
        </div>

        {/* Avatar + name */}
        <div className="ra-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.slice(0, 1).toUpperCase() || user?.regulator?.slice(0, 1).toUpperCase() || 'R'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name || 'Regulatory Official'}</div>
            <span className="badge badge-purple">{user?.regulator || 'REGULATOR'}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="ra-card" style={{ overflow: 'hidden' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < fields.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{f.value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(124,58,237,0.06)', borderRadius: 6, border: '1px solid rgba(124,58,237,0.15)', fontSize: 12, color: 'var(--text-dim)' }}>
          Session tokens expire after 8 hours. TOTP re-authentication required on next login.
        </div>
      </div>
    </PortalLayout>
  );
}
