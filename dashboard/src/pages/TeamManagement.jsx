import React, { useState } from 'react';

const MOCK_TEAM = [
  { id: 'usr_8f92a', name: 'Dr. Evelyn Vance', role: 'owner', email: 'vance@animus.dev', status: 'ACTIVE' },
  { id: 'usr_2b11c', name: 'Marcus Chen', role: 'lead', email: 'mchen@animus.dev', status: 'ACTIVE' },
  { id: 'usr_7x991', name: 'Sarah Connor', role: 'developer', email: 'sconnor@animus.dev', status: 'PENDING' },
];

export default function TeamManagement() {
  const [team] = useState(MOCK_TEAM);
  const [inviteRole, setInviteRole] = useState('developer');

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Team Management & Invites</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Manage role-based access control (RBAC) across your Enterprise Hub.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        
        {/* Team Table */}
        <div className="ra-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Access Control Ledger</div>
            <span className="badge badge-purple">RBAC ENFORCED</span>
          </div>
          
          <table className="ra-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Identity</th>
                <th>Clearance Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{member.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${member.role === 'owner' ? 'badge-cyan' : member.role === 'lead' ? 'badge-amber' : 'badge-green'}`} style={{ textTransform: 'uppercase' }}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 700, color: member.status === 'ACTIVE' ? 'var(--green)' : 'var(--amber)', letterSpacing: '0.05em' }}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Panel */}
        <div className="ra-card" style={{ padding: 20, height: 'fit-content' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Provision Identity</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assign Role
              </label>
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              >
                <option value="owner">Owner (Full Node Control)</option>
                <option value="lead">Lead (Project Admin)</option>
                <option value="developer">Developer (Mesh Contributor)</option>
              </select>
            </div>
            
            <button style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              Generate Sovereign Invite
            </button>

            <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Invites are cryptographically signed and expire in 24 hours. The new identity will be bound to this Hub.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
