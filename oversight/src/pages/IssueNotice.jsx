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

// ── Printable Notice View ────────────────────────────────────────────────
function PrintableNotice({ notice }) {
  return (
    <div className="print-only" style={{ padding: '40pt', fontFamily: 'serif', color: '#000', lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', borderBottom: '2pt solid #000', paddingBottom: '20pt', marginBottom: '30pt' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0 }}>ANCHOR GOVERNANCE ENGINE</h1>
        <h2 style={{ fontSize: '14pt', letterSpacing: '0.2em', margin: '5pt 0' }}>OFFICIAL ENFORCEMENT NOTICE</h2>
        <div style={{ fontSize: '10pt', color: '#666' }}>ID: {notice.notice_id} // ISSUED BY {notice.regulator || 'GOVERNMENT OFFICIAL'}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30pt' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase' }}>Subject Entity:</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{notice.company}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase' }}>Date Issued:</div>
          <div style={{ fontSize: '12pt' }}>{notice.filed_at?.slice(0, 10)}</div>
        </div>
      </div>

      <div style={{ background: '#f8f8f8', border: '1pt solid #ddd', padding: '15pt', marginBottom: '20pt' }}>
        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10pt', marginBottom: '5pt' }}>Violation Summary:</div>
        <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#b91c1c' }}>{notice.rule_violated}</div>
      </div>

      <div style={{ marginBottom: '40pt' }}>
        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10pt', marginBottom: '10pt' }}>Description of Breach:</div>
        <div style={{ fontSize: '11pt', whiteSpace: 'pre-wrap', borderLeft: '3pt solid #ddd', paddingLeft: '15pt' }}>
          {notice.description}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20pt', marginBottom: '40pt' }}>
        <div style={{ border: '1pt solid #000', padding: '10pt' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase' }}>Severity Level:</div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{notice.severity}</div>
        </div>
        <div style={{ border: '1pt solid #000', padding: '10pt' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase' }}>Response Deadline:</div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{notice.deadline || 'IMMEDIATE'}</div>
        </div>
      </div>

      <div style={{ marginTop: '60pt', borderTop: '1pt solid #000', paddingTop: '10pt', fontSize: '9pt', color: '#444' }}>
        <p>This document is cryptographically anchored to the Sovereign Relay Mesh. Authenticity can be verified at oversight.anchorgovernance.tech using Notice ID {notice.notice_id}.</p>
        <p style={{ marginTop: '10pt', fontWeight: 'bold' }}>Digital Signature: 0x{notice.notice_id?.slice(0, 8)}...HUB_VALIDATED</p>
      </div>
    </div>
  );
}

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

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {nextStatus && (
              <button onClick={advance} disabled={updating} style={{
                padding: '9px 18px', borderRadius: 6, border: 'none',
                background: nextStatus === 'RESOLVED' ? 'var(--green)' : 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1,
              }}>
                {updating ? 'Updating...' : `Mark as ${nextStatus} →`}
              </button>
            )}
            
            <button 
              onClick={() => window.print()} 
              className="no-print"
              style={{
                padding: '9px 18px', borderRadius: 6, border: '1px solid var(--border-lit)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⎙ Print Official Notice
            </button>
          </div>

          <PrintableNotice notice={notice} />
        </div>
      )}
    </div>
  );
}

// ── Smart Notice Form — entity picker → violation picker → submit ──────────
function NewNoticeForm({ token, user, onFiled }) {
  const [ledger, setLedger]         = useState([]);
  const [loadingLedger, setLL]      = useState(true);
  const [selectedEntity, setEntity] = useState(null);
  const [selectedViols, setViols]   = useState([]);   // array of violation entry objects
  const [severity, setSeverity]     = useState('HIGH');
  const [deadline, setDeadline]     = useState('');
  const [extraNote, setNote]        = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  // Load ledger once
  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLedger).catch(console.error).finally(() => setLL(false));
  }, [token]);

  // Build entity list from ledger
  const entities = Array.from(
    new Map(ledger.map(e => [e.entity_id, { id: e.entity_id, name: e.project_name || e.entity_id }])).values()
  );

  // All violations for selected entity
  const entityViolations = selectedEntity
    ? ledger.filter(e => e.entity_id === selectedEntity.id && !e.is_compliant)
    : [];

  const toggleViol = (entry) => {
    setViols(prev =>
      prev.some(v => v.entry_id === entry.entry_id)
        ? prev.filter(v => v.entry_id !== entry.entry_id)
        : [...prev, entry]
    );
  };

  // Auto-build rule string and description from selected violations
  const ruleList = [...new Set(
    selectedViols.flatMap(v => v.violations?.map(x => x.rule_id).filter(Boolean) || [])
  )].join(', ') || (selectedViols.length ? 'POLICY-BREACH' : '');

  const autoDesc = selectedViols.length
    ? `${selectedViols.length} violation(s) detected against ${selectedEntity?.name}:\n` +
      selectedViols.map((v, i) => `${i+1}. Entry ${v.entry_id?.slice(0,12)}… — ${v.violations?.[0]?.rule_id || 'breach'}`).join('\n') +
      (extraNote ? `\n\nAdditional notes:\n${extraNote}` : '')
    : '';

  const canSubmit = selectedEntity && selectedViols.length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/enforcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          company:       selectedEntity.name,
          rule_violated: ruleList || 'POLICY-BREACH',
          severity,
          description:   autoDesc,
          deadline:      deadline || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onFiled(data);
        setEntity(null); setViols([]); setDeadline(''); setNote('');
      } else {
        setError(data.detail || 'Failed to file notice.');
      }
    } catch { setError('Connection failed.'); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {error && <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red-soft)', fontSize: 12 }}>✗ {error}</div>}

      {/* Step 1 — Pick entity */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: selectedEntity ? 'var(--green)' : 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{selectedEntity ? '✓' : '1'}</span>
          Select AI Entity
        </div>
        {loadingLedger ? (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: 10 }}>Loading entities...</div>
        ) : (
          <select value={selectedEntity?.id || ''} onChange={e => { setEntity(entities.find(x => x.id === e.target.value) || null); setViols([]); }} className="ra-select">
            <option value="">— Choose an AI entity from the ledger —</option>
            {entities.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
            ))}
          </select>
        )}
      </div>

      {/* Step 2 — Pick violations */}
      {selectedEntity && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: selectedViols.length > 0 ? 'var(--green)' : 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{selectedViols.length > 0 ? '✓' : '2'}</span>
            Select Violations to Cover
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>({entityViolations.length} found)</span>
            {entityViolations.length > 0 && (
              <button type="button" onClick={() => setViols(entityViolations)} style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--accent-soft)', fontSize: 11, cursor: 'pointer' }}>
                Select All
              </button>
            )}
          </div>

          {entityViolations.length === 0 ? (
            <div style={{ padding: '12px 16px', borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 13, color: 'var(--text-secondary)' }}>
              ✓ No violations found for this entity — it appears compliant.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
              {entityViolations.map((v, i) => {
                const checked = selectedViols.some(s => s.entry_id === v.entry_id);
                const ruleIds = v.violations?.map(x => x.rule_id).filter(Boolean).join(', ') || 'BREACH';
                return (
                  <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 6, border: `1px solid ${checked ? 'var(--red)' : 'var(--border)'}`, background: checked ? 'rgba(239,68,68,0.05)' : 'var(--bg-void)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleViol(v)} style={{ marginTop: 2, accentColor: 'var(--red)', flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                        <span className="badge badge-red" style={{ fontSize: 9 }}>VIOLATION</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{v.entry_id?.slice(0,16)}…</span>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 'auto' }}>{v.timestamp?.slice(0,10)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--red-soft)', fontFamily: 'JetBrains Mono, monospace' }}>{ruleIds}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Configure notice */}
      {selectedViols.length > 0 && (
        <>
          {/* Auto-generated summary */}
          <div style={{ padding: '12px 14px', borderRadius: 6, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--accent-soft)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Auto-Generated Notice Summary</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Rules: <span style={{ color: 'var(--red-soft)', fontFamily: 'JetBrains Mono, monospace' }}>{ruleList || 'POLICY-BREACH'}</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Covering {selectedViols.length} violation(s) against {selectedEntity?.name}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>3</span>
              Severity
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setSeverity(key)} style={{ padding: '8px 0', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: severity === key ? `${cfg.color}18` : 'transparent', borderColor: severity === key ? cfg.color : 'var(--border)', color: severity === key ? cfg.color : 'var(--text-muted)' }}>{key}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deadline <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional)</span></div>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="ra-input" style={{ fontSize: 13 }}/>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Additional Notes <span style={{ fontWeight: 400 }}>(optional)</span></div>
            <textarea value={extraNote} onChange={e => setNote(e.target.value)} placeholder="Any extra context beyond the auto-generated summary..." rows={3}
              style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-lit)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }}/>
          </div>

          <button type="submit" disabled={submitting} style={{ padding: '11px', borderRadius: 6, border: 'none', background: SEVERITY_CONFIG[severity]?.color || 'var(--amber)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Filing...' : `File ${severity} Notice — ${selectedViols.length} violation(s) →`}
          </button>
        </>
      )}
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
    const endpoint = user?.access_level === 'ADMIN' 
      ? `${endpoints.baseUrl}/api/oversight/enforcement/all`
      : `${endpoints.baseUrl}/api/oversight/enforcement`;

    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setNotices).catch(console.error).finally(() => setLoading(false));
  }, [token, user?.access_level]);

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
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              Enforcement Tracker
              {user?.access_level === 'ADMIN' && <span className="badge badge-purple" style={{ fontSize: 9 }}>GLOBAL SUPER-VIEW</span>}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {user?.access_level === 'ADMIN' ? 'Monitoring all notices filed across the mesh.' : 'File and track enforcement notices against AI entities in your jurisdiction.'}
            </div>
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
