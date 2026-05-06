import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

function StatCard({ label, value, sub, color, colorClass }) {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
        {sub}
      </div>
    </div>
  );
}

const highlight = (obj) => {
  if (!obj) return { __html: '' };
  const s = JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = 'color:var(--green-soft)';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'color:var(--text-muted)' : 'color:var(--cyan-soft)';
      else if (/true/.test(m))       cls = 'color:var(--green)';
      else if (/false|null/.test(m)) cls = 'color:var(--red-soft)';
      else                            cls = 'color:var(--text-dim)';
      return `<span style="${cls}">${m}</span>`;
    }
  );
  return { __html: s };
};

export default function Dashboard() {
  const { token, logout } = useAuth();

  const [companies,     setCompanies]     = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [ledger,        setLedger]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [dialect,       setDialect]       = useState('RBI');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterMode,    setFilterMode]    = useState('ALL');
  const [translated,    setTranslated]    = useState(null);
  const [chainResult,   setChainResult]   = useState(null);
  const [verifying,     setVerifying]     = useState(false);

  /* ── fetch entity roster ── */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/ledger`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();
        const map = {};
        data.forEach(e => {
          const id = e.entity_id || 'unknown';
          if (!map[id]) map[id] = { id, name: e.project_name || id, entries: 0, violations: 0 };
          map[id].entries++;
          if (!e.is_compliant) map[id].violations++;
        });
        const list = Object.values(map);
        setCompanies(list);
        if (list.length && !activeCompany) setActiveCompany(list[0]);
      } catch (err) { console.error(err); }
    };
    run();
  }, [token]);

  /* ── fetch decision stream for selected entity ── */
  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    fetch(`${endpoints.baseUrl}/api/ledger?entity_id=${activeCompany.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setLedger)
      .finally(() => setLoading(false));
  }, [activeCompany, token]);

  /* ── open forensic vault ── */
  const handleInspect = async (entry) => {
    setSelectedAudit(entry);
    setTranslated(null);
    setChainResult(null);
    try {
      const res = await fetch(
        `${endpoints.baseUrl}/api/audit/${activeCompany.id}/entry/${entry.entry_id}?dialect=${dialect}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTranslated(await res.json());
    } catch (e) { console.error(e); }
  };

  /* ── chain integrity verify ── */
  const handleVerifyChain = async () => {
    if (!activeCompany) return;
    setVerifying(true);
    setChainResult(null);
    try {
      const res = await fetch(
        `${endpoints.baseUrl}/api/audit/${activeCompany.id}/verify`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChainResult(await res.json());
    } catch (e) { console.error(e); }
    finally { setVerifying(false); }
  };

  const filtered = useMemo(() =>
    ledger.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchQ = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
      const matchF =
        filterMode === 'ALL' ||
        (filterMode === 'COMPLIANT'  &&  e.is_compliant) ||
        (filterMode === 'VIOLATIONS' && !e.is_compliant);
      return matchQ && matchF;
    }),
  [ledger, searchQuery, filterMode]);

  const totalDecisions  = ledger.length;
  const totalViolations = ledger.filter(l => !l.is_compliant).length;
  const integrityScore  = totalDecisions > 0
    ? Math.round(((totalDecisions - totalViolations) / totalDecisions) * 100)
    : 100;

  const metrics = [
    { label: 'AI Decisions Reviewed', value: totalDecisions,  sub: 'Across all monitored entities', color: 'var(--cyan)',        colorClass: 'cyan'   },
    { label: 'Companies Audited',      value: companies.length, sub: 'Active in jurisdiction',        color: 'var(--accent-soft)', colorClass: 'accent' },
    { label: 'Integrity Score',        value: `${integrityScore}%`, sub: 'Chain verification rate',  color: 'var(--green)',       colorClass: 'green'  },
    {
      label: 'Active Violations',
      value: totalViolations,
      sub: 'Require enforcement action',
      color: totalViolations > 0 ? 'var(--red)' : 'var(--green)',
      colorClass: totalViolations > 0 ? 'red' : 'green',
    },
  ];

  return (
    <PortalLayout activePage="overview">
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              System Overview
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Root-level view across the entire Anchor governance mesh.
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: 6,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 13, color: 'var(--green-soft)', fontWeight: 600 }}>GRID SECURE</span>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {metrics.map((m, i) => <StatCard key={i} {...m} />)}
        </div>

        {/* ── Main grid: Monitored Entities + AI Decision Stream ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Monitored Entities */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Monitored Entities</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>All companies under your jurisdiction</div>
              </div>
              <span className="badge badge-cyan">LIVE</span>
            </div>
            <div style={{ overflowY: 'auto' }}>
              <table className="ra-table">
                <thead>
                  <tr>
                    <th>Company / AI Model</th>
                    <th>Compliance</th>
                    <th>Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? companies.map((c, i) => (
                    <tr key={i} onClick={() => setActiveCompany(c)} style={{ cursor: 'pointer' }}>
                      <td style={{
                        color: activeCompany?.id === c.id ? 'var(--accent-soft)' : 'var(--text-primary)',
                        fontWeight: 500,
                      }}>
                        {c.name}
                      </td>
                      <td>
                        <span className={`badge ${c.violations > 0 ? 'badge-red' : 'badge-green'}`}>
                          {c.violations > 0 ? 'BREACH' : 'COMPLIANT'}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>{c.entries}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0', fontSize: 13 }}>
                        No entities provisioned yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Decision Stream */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>AI Decision Stream</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {activeCompany ? `Viewing: ${activeCompany.name}` : 'Select a company to begin'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {['ALL', 'COMPLIANT', 'VIOLATIONS'].map(m => (
                  <button key={m} onClick={() => setFilterMode(m)} style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px',
                    borderRadius: 99, border: '1px solid', cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: filterMode === m ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: filterMode === m ? '#a78bfa' : 'var(--text-dim)',
                    borderColor: filterMode === m ? 'rgba(124,58,237,0.3)' : 'var(--border)',
                  }}>{m}</button>
                ))}
                <span className="badge badge-purple">ENCRYPTED</span>
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by company or decision ID..."
                className="ra-input"
                style={{ fontSize: 13 }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  Synchronizing relay...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  No governance events detected
                </div>
              ) : filtered.map((entry, i) => (
                <div
                  key={i}
                  className={`log-entry slide-in ${!entry.is_compliant ? 'violation' : 'clean'}`}
                  onClick={() => handleInspect(entry)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className={`badge ${entry.is_compliant ? 'badge-green' : 'badge-red'}`}>
                      {entry.is_compliant ? 'DECISION VERIFIED' : 'COMPLIANCE BREACH'}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {entry.entry_id?.slice(0, 8)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{entry.project_name}</span>
                    {' — '}AI decision pulse dispatched
                  </div>
                  {!entry.is_compliant && entry.violations?.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--red-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
                      ↳ {entry.violations[0]?.rule_id || 'Policy violation flagged'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="ra-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Verify Chain Integrity', accent: 'var(--accent)', action: handleVerifyChain },
              { label: 'Export Decision Report', accent: 'var(--cyan)',   action: () => alert('Export coming soon') },
              { label: 'Issue Enforcement Notice', accent: 'var(--amber)', action: () => alert('Enforcement module coming soon') },
              { label: `Dialect: ${dialect}`,    accent: 'var(--green)', action: () => {
                const opts = ['RBI','SEC','EU-AI','NIST'];
                setDialect(opts[(opts.indexOf(dialect) + 1) % opts.length]);
              }},
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{
                padding: '9px 18px', borderRadius: 6,
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: a.accent, border: 'none',
                cursor: 'pointer', opacity: 0.9,
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Chain result inline */}
          {(verifying || chainResult) && (
            <div style={{
              marginTop: 16, padding: '14px 16px',
              background: 'var(--bg-void)', borderRadius: 6,
              border: `1px solid ${chainResult?.verification_rate === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {verifying ? (
                <span style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                  Verifying cryptographic chain for {activeCompany?.name}...
                </span>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={`badge ${chainResult.verification_rate === 1 ? 'badge-green' : 'badge-red'}`} style={{ marginRight: 10 }}>
                      {chainResult.verification_rate === 1 ? 'CHAIN INTACT' : 'ANOMALY DETECTED'}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {activeCompany?.name} — {chainResult.chain?.length ?? 0} entries verified
                    </span>
                  </div>
                  <button onClick={() => setChainResult(null)} style={{
                    background: 'none', border: 'none', color: 'var(--text-dim)',
                    cursor: 'pointer', fontSize: 12,
                  }}>dismiss</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FORENSIC VAULT OVERLAY                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedAudit && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
          zIndex: 100, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 40,
        }}>
          <div style={{
            width: '100%', maxWidth: 1100, height: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-lit)',
            borderRadius: 8, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}>

            {/* Vault header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-surface)',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Forensic Vault — {selectedAudit.project_name}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                  Decision ID: {selectedAudit.entry_id} &nbsp;|&nbsp; Chain: {selectedAudit.chain_hash?.slice(0, 20)}…
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Status badge */}
                <span className={`badge ${selectedAudit.is_compliant ? 'badge-green' : 'badge-red'}`}>
                  {selectedAudit.is_compliant ? 'DECISION VERIFIED' : 'COMPLIANCE BREACH'}
                </span>
                {/* Dialect switcher */}
                {['RBI','SEC','EU-AI','NIST'].map(d => (
                  <button key={d} onClick={() => { setDialect(d); handleInspect(selectedAudit); }} style={{
                    fontSize: 11, fontWeight: 600, padding: '5px 12px',
                    borderRadius: 6, border: '1px solid',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: dialect === d ? 'var(--accent-glow)' : 'transparent',
                    color: dialect === d ? '#a78bfa' : 'var(--text-muted)',
                    borderColor: dialect === d ? 'var(--accent)' : 'var(--border)',
                  }}>{d}</button>
                ))}
                <button
                  onClick={() => { setSelectedAudit(null); setTranslated(null); }}
                  style={{
                    marginLeft: 8, padding: '6px 14px', borderRadius: 6,
                    border: '1px solid var(--border-lit)', background: 'transparent',
                    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red-soft)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-lit)'; }}
                >Close</button>
              </div>
            </div>

            {/* Vault body: left = translation, right = raw payload */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

              {/* Regulatory Translation */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {dialect} Regulatory Translation
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translated ? (
                    <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan-soft)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(translated.translation, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--text-dim)', fontSize: 13 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
                      Translating AI decision to {dialect} dialect...
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Payload */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Raw Decision Payload
                  </span>
                </div>
                <div
                  style={{ flex: 1, overflowY: 'auto', padding: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={highlight(translated?.raw_payload || selectedAudit.raw_payload)}
                />
              </div>
            </div>

            {/* Vault footer */}
            <div style={{
              padding: '10px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', gap: 24 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  Integrity: {translated?.integrity?.status || 'VERIFIED'}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  Dialect: {dialect}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  Hash: {selectedAudit.chain_hash?.slice(0, 24)}…
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Authorized Regulatory Access Only
              </span>
            </div>

          </div>
        </div>
      )}

    </PortalLayout>
  );
}
