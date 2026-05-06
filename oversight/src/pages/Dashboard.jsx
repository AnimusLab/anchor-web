import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

// ── Stat card (exact root-admin StatCard copy) ─────────────────────────────
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

// ── JSON syntax highlighter ────────────────────────────────────────────────
const highlight = (obj) => {
  if (!obj) return { __html: '' };
  const s = JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = 'color: var(--green-soft)';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'color: var(--text-muted)' : 'color: var(--cyan-soft)';
      else if (/true/.test(m))  cls = 'color: var(--green)';
      else if (/false|null/.test(m)) cls = 'color: var(--red-soft)';
      else cls = 'color: var(--text-dim)';
      return `<span style="${cls}">${m}</span>`;
    }
  );
  return { __html: s };
};

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [companies, setCompanies]       = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [ledger, setLedger]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [dialect, setDialect]           = useState('SEC');
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterMode, setFilterMode]     = useState('ALL');
  const [translatedData, setTranslatedData] = useState(null);

  /* fetch all entities */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/ledger`, {
          headers: { 'Authorization': `Bearer ${token}` }
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

  /* fetch ledger for selected entity */
  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    fetch(`${endpoints.baseUrl}/api/ledger?entity_id=${activeCompany.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setLedger)
      .finally(() => setLoading(false));
  }, [activeCompany, token]);

  /* open forensic vault */
  const handleInspect = async (entry) => {
    setSelectedAudit(entry);
    setTranslatedData(null);
    try {
      const res = await fetch(
        `${endpoints.baseUrl}/api/audit/${activeCompany.id}/entry/${entry.entry_id}?dialect=${dialect}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTranslatedData(await res.json());
    } catch (e) { console.error(e); }
  };

  const filteredLedger = useMemo(() =>
    ledger.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
      const matchFilter =
        filterMode === 'ALL' ||
        (filterMode === 'COMPLIANT'  && e.is_compliant) ||
        (filterMode === 'VIOLATIONS' && !e.is_compliant);
      return matchSearch && matchFilter;
    }),
  [ledger, searchQuery, filterMode]);

  const totalAudits     = ledger.length;
  const totalViolations = ledger.filter(l => !l.is_compliant).length;
  const complianceScore = totalAudits > 0 ? Math.round(((totalAudits - totalViolations) / totalAudits) * 100) : 100;

  const metrics = [
    { label: 'Total Audits',      value: totalAudits,       sub: 'Across all nodes',      color: 'var(--cyan)',        colorClass: 'cyan'   },
    { label: 'Provisioned Nodes', value: companies.length,  sub: 'Active enterprises',    color: 'var(--accent-soft)', colorClass: 'accent' },
    { label: 'Mesh Integrity',    value: `${complianceScore}%`, sub: 'Governance coverage', color: 'var(--green)',     colorClass: 'green'  },
    { label: 'Open Violations',   value: totalViolations,   sub: 'Require remediation',
      color: totalViolations > 0 ? 'var(--red)' : 'var(--green)',
      colorClass: totalViolations > 0 ? 'red' : 'green' },
  ];

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Authority header ── */}
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

        {/* ── Main grid: Fleet + Ledger ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Fleet Matrix */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Fleet Matrix</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>All provisioned enterprise nodes</div>
              </div>
              <span className="badge badge-cyan">LIVE</span>
            </div>
            <div style={{ overflowY: 'auto' }}>
              <table className="ra-table">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Status</th>
                    <th>Audit Cycles</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? companies.map((c, i) => (
                    <tr key={i} onClick={() => setActiveCompany(c)} style={{ cursor: 'pointer' }}>
                      <td style={{ color: activeCompany?.id === c.id ? 'var(--accent-soft)' : 'var(--text-primary)', fontWeight: 500 }}>
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
                        No nodes provisioned yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Action Ledger */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Global Action Ledger</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Recent governance events</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 99, border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: filterMode === m ? 'rgba(124,58,237,0.15)' : 'transparent',
                      color: filterMode === m ? '#a78bfa' : 'var(--text-dim)',
                      borderColor: filterMode === m ? 'rgba(124,58,237,0.3)' : 'var(--border)',
                    }}
                  >
                    {m}
                  </button>
                ))}
                <span className="badge badge-purple">ENCRYPTED</span>
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search model or decision ID..."
                className="ra-input"
                style={{ fontSize: 13 }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  Synchronizing relay...
                </div>
              ) : filteredLedger.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  No recent activity
                </div>
              ) : filteredLedger.map((entry, i) => (
                <div
                  key={i}
                  className={`log-entry slide-in ${!entry.is_compliant ? 'violation' : 'clean'}`}
                  onClick={() => handleInspect(entry)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className={`badge ${entry.is_compliant ? 'badge-green' : 'badge-red'}`}>
                      {entry.is_compliant ? 'COMPLIANT' : 'VIOLATION'}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {entry.entry_id?.slice(0, 8)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{entry.project_name}</span>
                    {' — '}audit pulse dispatched
                  </div>
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
              { label: 'Provision Auditor',    accent: 'var(--accent)' },
              { label: 'Provision Enterprise', accent: 'var(--cyan)' },
              { label: 'View Live NOC',         accent: 'var(--amber)' },
              { label: 'Fleet Inspection',      accent: 'var(--green)' },
            ].map((a, i) => (
              <button
                key={i}
                style={{
                  padding: '9px 18px', borderRadius: 6,
                  fontSize: 13, fontWeight: 600,
                  color: '#fff', background: a.accent,
                  border: 'none', cursor: 'pointer',
                  opacity: 0.9, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FORENSIC VAULT OVERLAY */}
      {selectedAudit && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 40,
        }}>
          <div style={{
            width: '100%', maxWidth: 1100,
            height: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-lit)',
            borderRadius: 8,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
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
                  Ref: {selectedAudit.entry_id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {['SEC','RBI','EU-AI','NIST'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDialect(d)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '5px 12px',
                      borderRadius: 6, border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: dialect === d ? 'var(--accent-glow)' : 'transparent',
                      color: dialect === d ? '#a78bfa' : 'var(--text-muted)',
                      borderColor: dialect === d ? 'var(--accent)' : 'var(--border)',
                    }}
                  >{d}</button>
                ))}
                <button
                  onClick={() => { setSelectedAudit(null); setTranslatedData(null); }}
                  style={{
                    marginLeft: 8, padding: '6px 14px',
                    borderRadius: 6, border: '1px solid var(--border-lit)',
                    background: 'transparent', color: 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red-soft)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-lit)'; }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Vault body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left: Translation */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {dialect} Regulatory Translation
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translatedData ? (
                    <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan-soft)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(translatedData.translation, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--text-dim)', fontSize: 13 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
                      Decrypting AI intent dialect...
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Raw payload */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Raw Decision Payload
                  </span>
                </div>
                <div
                  style={{ flex: 1, overflowY: 'auto', padding: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)}
                />
              </div>
            </div>

            {/* Vault footer */}
            <div style={{
              padding: '10px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-surface)',
            }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                Integrity: {selectedAudit.chain_hash?.slice(0, 24)}…
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Authorized Access Only
              </span>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
