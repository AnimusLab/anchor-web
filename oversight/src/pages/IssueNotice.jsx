import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const SEVERITY_CONFIG = {
  LOW:      { color: 'var(--green)',  badge: 'badge-green'  },
  MEDIUM:   { color: 'var(--cyan)',   badge: 'badge-cyan'   },
  HIGH:     { color: 'var(--amber)',  badge: 'badge-amber'  },
  CRITICAL: { color: 'var(--red)',    badge: 'badge-red'    },
};

const STATUS_FLOW = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];
const STATUS_STYLE = {
  OPEN:         { badge: 'badge-red',    next: 'ACKNOWLEDGED' },
  ACKNOWLEDGED: { badge: 'badge-amber',  next: 'RESOLVED'     },
  RESOLVED:     { badge: 'badge-green',  next: null           },
};

// ── Filed Notice Card ─────────────────────────────────────────────────────
function NoticeCard({ notice, token, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cfg     = STATUS_STYLE[notice.status] || STATUS_STYLE.OPEN;
  const nextStatus = cfg.next;

  const advance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/enforcement/${notice.notice_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) onUpdate(notice.notice_id, nextStatus);
    } catch(e) { console.error(e); }
    finally { setUpdating(false); }
  };

  return (
    <div className="ra-card" style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      {/* Header row */}
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <span className={`badge ${SEVERITY_CONFIG[notice.severity]?.badge || 'badge-amber'}`}>{notice.severity}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notice.company}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{notice.rule_violated}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span className={`badge ${cfg.badge}`}>{notice.status}</span>
          <span style={{ fontSize: 16, color: 'var(--text-dim)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Status timeline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STATUS_FLOW.map((s, i) => {
              const idx = STATUS_FLOW.indexOf(notice.status);
              const done = i <= idx;
              return (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: done ? 'var(--accent)' : 'var(--bg-surface)', border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`, color: done ? '#fff' : 'var(--text-dim)' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: done ? 'var(--accent-soft)' : 'var(--text-dim)', fontWeight: 600 }}>{s}</div>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: STATUS_FLOW.indexOf(notice.status) > i ? 'var(--accent)' : 'var(--border)', margin: '-14px 4px 0' }}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-void)', borderRadius: 6 }}>
            {notice.description}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
            {[
              { label: 'Notice ID',  value: notice.notice_id, mono: true },
              { label: 'Filed',      value: notice.filed_at?.slice(0, 10) },
              { label: 'Deadline',   value: notice.deadline || '—' },
              { label: 'Regulator',  value: notice.regulator || '—' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-void)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{f.label}</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit', fontSize: f.mono ? 11 : 13 }}>{f.value}</div>
              </div>
            ))}
          </div>

          {nextStatus && (
            <button onClick={advance} disabled={updating} style={{
              padding: '9px 18px', borderRadius: 6, border: 'none',
              background: nextStatus === 'RESOLVED' ? 'var(--green)' : 'var(--accent)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1,
              alignSelf: 'flex-start',
            }}>
              {updating ? 'Updating...' : `Mark as ${nextStatus} →`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── New Notice Form ────────────────────────────────────────────────────────
function NewNoticeForm({ token, user, onFiled }) {
  const [form, setForm] = useState({ company: '', rule_violated: '', severity: 'HIGH', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/enforcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, deadline: form.deadline || null }),
      });
      const data = await res.json();
      if (res.ok) {
        onFiled(data);
        setForm({ company: '', rule_violated: '', severity: 'HIGH', description: '', deadline: '' });
      } else {
        setError(data.detail || 'Failed to file notice.');
      }
    } catch { setError('Connection failed.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red-soft)', fontSize: 12 }}>✗ {error}</div>}

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company / AI Entity</div>
        <input required value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. OpenAI GPT-4 Production" className="ra-input" style={{ fontSize: 13 }}/>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rule / Policy Violated</div>
        <input required value={form.rule_violated} onChange={e => set('rule_violated', e.target.value)} placeholder="e.g. RBI/AI-GOV-2024-07" className="ra-input" style={{ fontSize: 13 }}/>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Severity</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => set('severity', key)} style={{
              padding: '8px 0', borderRadius: 6, border: '1px solid', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, textAlign: 'center',
              background: form.severity === key ? `${cfg.color}18` : 'transparent',
              borderColor: form.severity === key ? cfg.color : 'var(--border)',
              color: form.severity === key ? cfg.color : 'var(--text-muted)',
            }}>{key}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deadline <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional)</span></div>
          <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="ra-input" style={{ fontSize: 13 }}/>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</div>
        <textarea required value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Describe the compliance breach in detail..." rows={4}
          style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-lit)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }}/>
      </div>

      <button type="submit" disabled={loading} style={{
        padding: '11px', borderRadius: 6, border: 'none',
        background: SEVERITY_CONFIG[form.severity]?.color || 'var(--amber)',
        color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
      }}>
        {loading ? 'Filing...' : `File ${form.severity} Notice →`}
      </button>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function IssueNotice() {
  const { token, user } = useAuth();
  const [notices, setNotices]       = useState([]);
  const [loadingHistory, setLoading] = useState(true);
  const [filedBanner, setFiledBanner] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tab, setTab] = useState('tracker'); // 'tracker' | 'new'

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/oversight/enforcement`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setNotices).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const handleFiled = (data) => {
    setFiledBanner(data);
    setTimeout(() => setFiledBanner(null), 4000);
    // Prepend to list optimistically
    setNotices(prev => [{
      notice_id: data.notice_id, company: data.company,
      severity: data.severity, status: 'OPEN',
      filed_at: data.filed_at, rule_violated: '—', description: '—',
    }, ...prev]);
    setTab('tracker');
  };

  const handleUpdate = (noticeId, newStatus) => {
    setNotices(prev => prev.map(n => n.notice_id === noticeId ? { ...n, status: newStatus } : n));
  };

  const filtered = notices.filter(n => statusFilter === 'ALL' || n.status === statusFilter);
  const counts = { OPEN: notices.filter(n=>n.status==='OPEN').length, ACKNOWLEDGED: notices.filter(n=>n.status==='ACKNOWLEDGED').length, RESOLVED: notices.filter(n=>n.status==='RESOLVED').length };

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Enforcement Tracker</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>File and track enforcement notices against AI entities in your jurisdiction.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['tracker','new'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                borderColor: tab === t ? 'var(--accent)' : 'var(--border)',
              }}>
                {t === 'tracker' ? `📋 My Notices (${notices.length})` : '＋ File New Notice'}
              </button>
            ))}
          </div>
        </div>

        {/* Filed banner */}
        {filedBanner && (
          <div style={{ padding: '14px 18px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-green" style={{ marginRight: 10 }}>FILED</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{filedBanner.notice_id}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>— {filedBanner.message}</span>
            </div>
            <button onClick={() => setFiledBanner(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {tab === 'new' ? (
          <div className="ra-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              New Enforcement Notice — {user?.name || user?.regulator}
            </div>
            <NewNoticeForm token={token} user={user} onFiled={handleFiled}/>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[
                { label: 'Total Filed',    value: notices.length,        color: 'var(--cyan)'  },
                { label: 'Open',           value: counts.OPEN,           color: 'var(--red)'   },
                { label: 'Acknowledged',   value: counts.ACKNOWLEDGED,   color: 'var(--amber)' },
                { label: 'Resolved',       value: counts.RESOLVED,       color: 'var(--green)' },
              ].map((s, i) => (
                <div key={i} className="ra-card" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL','OPEN','ACKNOWLEDGED','RESOLVED'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                  background: statusFilter === s ? 'var(--accent-glow)' : 'transparent',
                  color: statusFilter === s ? '#a78bfa' : 'var(--text-muted)',
                  borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                }}>{s} {s !== 'ALL' && `(${counts[s] ?? notices.length})`}</button>
              ))}
            </div>

            {/* Notice list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>Loading notices...</div>
              ) : filtered.length === 0 ? (
                <div className="ra-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  {notices.length === 0 ? 'No enforcement notices filed yet.' : 'No notices match this filter.'}
                </div>
              ) : filtered.map((n, i) => (
                <NoticeCard key={n.notice_id || i} notice={n} token={token} onUpdate={handleUpdate}/>
              ))}
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
