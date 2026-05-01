import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function PendingApprovals() {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'regulator' | 'enterprise'

  const fetchPending = async () => {
    try {
      const res = await fetch(endpoints.pending, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPending(await res.json());
    } catch (e) { console.error('Pending fetch error', e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const handleApprove = async (entityId, displayName) => {
    setApproving(entityId);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('target_entity_id', entityId);
      const res = await fetch(endpoints.approve, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setMessage({ type: 'SUCCESS', text: `Access approved for ${displayName}. Credentials dispatched via Sovereign Gatekeeper.` });
        fetchPending();
      } else {
        const err = await res.json();
        setMessage({ type: 'ERROR', text: err.detail || 'Approval failed.' });
      }
    } catch {
      setMessage({ type: 'ERROR', text: 'Network error during approval.' });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (entityId, displayName) => {
    if (!window.confirm(`Reject access request from ${displayName}? This action cannot be undone.`)) return;
    setApproving(entityId);
    try {
      const formData = new FormData();
      formData.append('target_entity_id', entityId);
      const res = await fetch(`${endpoints.baseUrl}/api/auth/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setMessage({ type: 'SUCCESS', text: `Request from ${displayName} rejected.` });
        fetchPending();
      } else {
        const err = await res.json();
        setMessage({ type: 'ERROR', text: err.detail || 'Rejection failed.' });
      }
    } catch {
      setMessage({ type: 'ERROR', text: 'Network error during rejection.' });
    } finally {
      setApproving(null);
    }
  };

  // Categorize
  const regulators = pending.filter(p => p.role === 'regulator');
  const enterprises = pending.filter(p => p.role !== 'regulator');
  const filtered = filter === 'all' ? pending
    : filter === 'regulator' ? regulators
    : enterprises;

  const getRoleBadge = (role) => {
    if (role === 'regulator') return { cls: 'badge-amber', label: 'REGULATOR' };
    if (role === 'owner') return { cls: 'badge-cyan', label: 'ENTERPRISE OWNER' };
    return { cls: 'badge-purple', label: (role || 'UNKNOWN').toUpperCase() };
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Pending Approvals
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Self-service onboarding requests from the Enterprise and Oversight portals. Review and approve access.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pending.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 6,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)',
                boxShadow: '0 0 8px var(--amber)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-soft)' }}>
                {pending.length} AWAITING
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Pending', value: pending.length, color: 'var(--accent-soft)', cls: 'accent' },
          { label: 'Regulators', value: regulators.length, color: 'var(--amber-soft)', cls: 'amber' },
          { label: 'Enterprises', value: enterprises.length, color: 'var(--cyan-soft)', cls: 'cyan' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Response message */}
      {message && (
        <div style={{
          padding: '14px 20px', borderRadius: 6,
          border: `1px solid ${message.type === 'SUCCESS' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          background: message.type === 'SUCCESS' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
        }} className="slide-in">
          <div style={{
            fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: message.type === 'SUCCESS' ? 'var(--green-soft)' : 'var(--red-soft)',
          }}>
            {message.type === 'SUCCESS' ? '✓ Action Complete' : '✗ Error'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message.text}</div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 4, alignSelf: 'flex-start',
      }}>
        {[
          { key: 'all', label: `All (${pending.length})` },
          { key: 'regulator', label: `🏛 Regulators (${regulators.length})` },
          { key: 'enterprise', label: `🏢 Enterprises (${enterprises.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '7px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: filter === tab.key ? 'var(--accent)' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div className="ra-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
            Loading pending requests...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 36 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green-soft)' }}>Queue Clear</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 450, lineHeight: 1.7 }}>
              {filter === 'all'
                ? 'No pending access requests. When users submit onboarding requests from the Enterprise or Oversight portals, they will appear here for review.'
                : `No pending ${filter} requests.`}
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: 520 }}>
            <table className="ra-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Email Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const badge = getRoleBadge(p.role);
                  const id = p.entity_id || p.clearance_id || p.id;
                  return (
                    <tr key={id || i} className="slide-in">
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.display_name}</div>
                        <div style={{
                          fontSize: 10, color: 'var(--text-dim)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {id || '—'}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.email}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td>
                        {p.email_verified ? (
                          <span className="badge badge-green">VERIFIED</span>
                        ) : (
                          <span className="badge badge-red">UNVERIFIED</span>
                        )}
                      </td>
                      <td style={{
                        fontSize: 12, color: 'var(--text-dim)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApprove(id, p.display_name)}
                            disabled={approving === id}
                            style={{
                              padding: '6px 14px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                              border: '1px solid rgba(16,185,129,0.3)',
                              background: 'rgba(16,185,129,0.08)',
                              color: 'var(--green-soft)', cursor: 'pointer',
                              opacity: approving === id ? 0.4 : 1,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
                          >
                            {approving === id ? 'PROCESSING...' : '✓ APPROVE'}
                          </button>
                          <button
                            onClick={() => handleReject(id, p.display_name)}
                            disabled={approving === id}
                            style={{
                              padding: '6px 14px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                              border: '1px solid rgba(239,68,68,0.2)',
                              background: 'transparent',
                              color: 'var(--text-dim)', cursor: 'pointer',
                              opacity: approving === id ? 0.4 : 1,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red-soft)'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            REJECT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
