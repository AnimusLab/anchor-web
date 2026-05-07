import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

// ── Action metadata ───────────────────────────────────────────────────────
const ACTION_META = {
  LOGIN:          { icon: '🔐', label: 'Session Login',          color: 'var(--accent-soft)', badge: 'badge-purple' },
  VAULT_VIEW:     { icon: '🔍', label: 'Forensic Vault Opened',  color: 'var(--cyan)',         badge: 'badge-cyan'   },
  CHAIN_VERIFY:   { icon: '🔗', label: 'Chain Verified',         color: 'var(--green)',        badge: 'badge-green'  },
  EXPORT:         { icon: '📥', label: 'Data Exported',          color: 'var(--amber)',        badge: 'badge-amber'  },
  NOTICE_FILED:   { icon: '⚠️',  label: 'Notice Filed',          color: 'var(--red)',          badge: 'badge-red'    },
  NOTICE_UPDATED: { icon: '📋', label: 'Notice Status Updated',  color: 'var(--amber)',        badge: 'badge-amber'  },
  SEARCH:         { icon: '🔎', label: 'Cross-Entity Search',    color: 'var(--cyan)',         badge: 'badge-cyan'   },
  JURISDICTION:   { icon: '🌐', label: 'Jurisdiction View',      color: 'var(--accent-soft)', badge: 'badge-purple' },
};
const meta = (a) => ACTION_META[a] || { icon: '📌', label: a, color: 'var(--text-dim)', badge: 'badge-gray' };

// ── Relative timestamp ────────────────────────────────────────────────────
function relTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Timeline entry ────────────────────────────────────────────────────────
function TrailEntry({ entry, isLast }) {
  const m = meta(entry.action);
  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
      {/* Vertical line */}
      {!isLast && (
        <div style={{ position: 'absolute', left: 19, top: 40, bottom: -12, width: 2, background: 'var(--border)', zIndex: 0 }}/>
      )}

      {/* Icon dot */}
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', border: `2px solid var(--border-lit)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, zIndex: 1 }}>
        {m.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${m.badge}`}>{entry.action}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{relTime(entry.timestamp)}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{entry.timestamp?.slice(0,19).replace('T', ' ')}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-void)', borderRadius: 6, padding: '10px 14px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {entry.target_name && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Target</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{entry.target_name}</div>
            </div>
          )}
          {entry.target_id && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>ID</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{entry.target_id.slice(0,20)}{entry.target_id.length > 20 ? '…' : ''}</div>
            </div>
          )}
          {entry.detail && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Detail</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.detail}</div>
            </div>
          )}
          {entry.ip_address && (
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>IP</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{entry.ip_address}</div>
            </div>
          )}
          <div style={{ marginLeft: entry.ip_address ? 0 : 'auto' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Trail ID</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{entry.trail_id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AuditTrail() {
  const { token, user } = useAuth();
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterAction, setFilter] = useState('ALL');
  const [limit, setLimit]         = useState(50);

  useEffect(() => {
    setLoading(true);
    fetch(`${endpoints.baseUrl}/api/oversight/audit-trail?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json()).then(setEntries).catch(console.error).finally(() => setLoading(false));
  }, [token, limit]);

  const filtered = filterAction === 'ALL'
    ? entries
    : entries.filter(e => e.action === filterAction);

  const actionTypes = ['ALL', ...Array.from(new Set(entries.map(e => e.action)))];

  const exportTrailCSV = () => {
    const rows = [['Trail ID','Action','Target Name','Target ID','Detail','IP','Timestamp']];
    filtered.forEach(e => rows.push([e.trail_id, e.action, e.target_name || '', e.target_id || '', e.detail || '', e.ip_address || '', e.timestamp || '']));
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit_trail_${user?.sub}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Stats
  const counts = {};
  entries.forEach(e => { counts[e.action] = (counts[e.action] || 0) + 1; });

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>My Audit Trail</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Immutable record of every regulatory action you have taken — legally defensible.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setLimit(l => Math.min(l + 50, 500))} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Load More
            </button>
            <button onClick={exportTrailCSV} disabled={filtered.length === 0} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: filtered.length ? 1 : 0.5 }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              Export Trail CSV
            </button>
          </div>
        </div>

        {/* Auditor identity bar */}
        <div className="ra-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(user?.name?.slice(0,1) || 'R').toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'Regulatory Official'}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user?.sub}</div>
          </div>
          <span className="badge badge-purple">{user?.regulator}</span>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entries.length}</div>
            <div style={{ color: 'var(--text-dim)' }}>total actions</div>
          </div>
        </div>

        {/* Activity breakdown */}
        {entries.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {Object.entries(counts).map(([action, count]) => {
              const m = meta(action);
              return (
                <div key={action} className="ra-card" style={{ padding: '12px 14px', cursor: 'pointer', border: filterAction === action ? `1px solid ${m.color}` : '1px solid var(--border)', transition: 'all 0.15s' }}
                  onClick={() => setFilter(f => f === action ? 'ALL' : action)}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{count}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>FILTER</span>
          {actionTypes.map(a => (
            <button key={a} onClick={() => setFilter(a)} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: filterAction === a ? 'var(--accent-glow)' : 'transparent',
              color: filterAction === a ? '#a78bfa' : 'var(--text-muted)',
              borderColor: filterAction === a ? 'var(--accent)' : 'var(--border)',
            }}>
              {a === 'ALL' ? `ALL (${entries.length})` : `${meta(a).icon} ${a} (${counts[a] || 0})`}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="ra-card" style={{ padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>Loading audit trail...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No actions recorded yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Your audit trail grows as you use the portal — viewing decisions, verifying chains, filing notices, and exporting data all appear here.
              </div>
            </div>
          ) : (
            <div>
              {filtered.map((entry, i) => (
                <TrailEntry key={entry.trail_id} entry={entry} isLast={i === filtered.length - 1}/>
              ))}
              {filtered.length >= limit && (
                <div style={{ textAlign: 'center', paddingTop: 16 }}>
                  <button onClick={() => setLimit(l => l + 50)} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                    Load older entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
