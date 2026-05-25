import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';
import { translateToRegulatory } from '../lib/RegulatoryMapper';

const V = {
  primary: 'var(--text-primary)', secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)', dim: 'var(--text-dim)',
  card: 'var(--bg-card)', surface: 'var(--bg-surface)', void: 'var(--bg-void)',
  border: 'var(--border)', borderLit: 'var(--border-lit)',
  green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)',
  accent: 'var(--accent)', cyan: 'var(--cyan)',
};

function StatCard({ label, value, sub, color, colorClass }) {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div style={{ fontSize: 12, fontWeight: 600, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>
    </div>
  );
}

const hl = (obj) => {
  if (!obj) return { __html: '' };
  return { __html: JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => `<span style="color:${/^"/.test(m) ? (/:$/.test(m) ? 'var(--text-muted)' : 'var(--cyan-soft)') : /true/.test(m) ? 'var(--green)' : /false|null/.test(m) ? 'var(--red-soft)' : 'var(--text-dim)'}">${m}</span>`
  )};
};

const DIALECTS = ['RBI', 'SEC', 'EU-AI', 'NIST'];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies]       = useState([]);
  const [active, setActive]             = useState(null);
  const [ledger, setLedger]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [vault, setVault]               = useState(null);
  const [translated, setTranslated]     = useState(null);
  const [dialect, setDialect]           = useState('RBI');
  const [globalSearch, setGlobalSearch] = useState('');
  const [streamSearch, setStreamSearch] = useState('');
  const [filter, setFilter]             = useState('ALL');
  const [chainResult, setChainResult]   = useState(null);
  const [verifying, setVerifying]       = useState(false);
  const [tickerItems, setTickerItems]   = useState([]);

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) logout(); return r.json(); })
      .then(data => {
        const map = {};
        data.forEach(e => {
          const id = e.entity_id || 'unknown';
          if (!map[id]) map[id] = { id, name: e.project_name || id, entries: 0, violations: 0, last: e.timestamp };
          map[id].entries++;
          if (!e.is_compliant) map[id].violations++;
        });
        const list = Object.values(map);
        setCompanies(list);
        if (list.length) setActive(list[0]);
        // Build ticker from recent entries
        setTickerItems(data.slice(0, 40).map(e => ({
          name: e.project_name || '?',
          ok: e.is_compliant,
          id: e.entry_id?.slice(0, 8),
        })));
      }).catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    fetch(`${endpoints.baseUrl}/api/ledger?entity_id=${active.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLedger).finally(() => setLoading(false));
  }, [active, token]);

  const openVault = async (entry) => {
    setVault(entry); 
    
    // Immediate local mapping to avoid generic "Translating..."
    const localMap = translateToRegulatory(entry.action_type || 'unknown', dialect);
    setTranslated({ 
      translation: { 
        "deterministic_mapping": localMap.clause,
        "dialect": localMap.dialectName,
        "status": "AWAITING_LIVE_VERIFICATION",
        "timestamp": localMap.timestamp
      } 
    });

    try {
      const r = await fetch(`${endpoints.baseUrl}/api/audit/${active.id}/entry/${entry.entry_id}?dialect=${dialect}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setTranslated(data);
    } catch (e) { console.error(e); }
  };

  const verifyChain = async () => {
    if (!active) return;
    setVerifying(true); setChainResult(null);
    try {
      const r = await fetch(`${endpoints.baseUrl}/api/audit/${active.id}/verify`, { headers: { Authorization: `Bearer ${token}` } });
      setChainResult(await r.json());
    } catch (e) { console.error(e); } finally { setVerifying(false); }
  };

  const filteredCompanies = useMemo(() =>
    companies.filter(c => c.name.toLowerCase().includes(globalSearch.toLowerCase())),
    [companies, globalSearch]);

  const filteredStream = useMemo(() =>
    ledger.filter(e => {
      const q = streamSearch.toLowerCase();
      const mq = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
      const mf = filter === 'ALL' || (filter === 'COMPLIANT' && e.is_compliant) || (filter === 'VIOLATIONS' && !e.is_compliant);
      return mq && mf;
    }), [ledger, streamSearch, filter]);

  const total = ledger.length;
  const viols = ledger.filter(l => !l.is_compliant).length;
  const score = total > 0 ? Math.round(((total - viols) / total) * 100) : 100;

  const metrics = [
    { label: 'AI Decisions Reviewed', value: total,             sub: 'Across all monitored entities', color: 'var(--cyan)',        colorClass: 'cyan'   },
    { label: 'Companies Audited',      value: companies.length, sub: 'Active in jurisdiction',         color: 'var(--accent-soft)', colorClass: 'accent' },
    { label: 'Integrity Score',        value: `${score}%`,      sub: 'Chain verification rate',        color: V.green,              colorClass: 'green'  },
    { label: 'Active Violations',      value: viols,            sub: 'Require enforcement action',     color: viols > 0 ? V.red : V.green, colorClass: viols > 0 ? 'red' : 'green' },
  ];

  // Build double ticker for seamless loop
  const tickerDouble = [...tickerItems, ...tickerItems];

  return (
    <PortalLayout activePage="overview">
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: V.primary, marginBottom: 6 }}>System Overview</div>
            <div style={{ fontSize: 14, color: V.secondary }}>Root-level view across the entire Anchor governance mesh.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: V.green, boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 13, color: 'var(--green-soft)', fontWeight: 600 }}>GRID SECURE</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: V.muted, pointerEvents: 'none' }}>
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search companies, AI models, or decision IDs across your jurisdiction..."
            className="ra-input"
            style={{ paddingLeft: 40, fontSize: 14, height: 46 }}
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {metrics.map((m, i) => <StatCard key={i} {...m} />)}
        </div>

        {/* Live Governance Ticker */}
        {tickerItems.length > 0 && (
          <div className="ra-card" style={{ overflow: 'hidden', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
              <div style={{ flexShrink: 0, padding: '0 16px', borderRight: '1px solid var(--border)', marginRight: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: V.accent, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>LIVE</span>
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="ticker-track">
                  {tickerDouble.map((t, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 48, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.ok ? V.green : V.red, flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ color: V.primary, fontWeight: 500 }}>{t.name}</span>
                      <span style={{ color: t.ok ? 'var(--green-soft)' : 'var(--red-soft)' }}>{t.ok ? '▲ COMPLIANT' : '▼ BREACH'}</span>
                      <span style={{ color: V.dim }}>#{t.id}</span>
                      <span style={{ color: 'var(--border-lit)', paddingLeft: 16 }}>|</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Grid + Decision Stream */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Marketplace */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.primary }}>AI Entity Exchange</div>
                <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>Select an entity to begin auditing</div>
              </div>
              <span className="badge badge-cyan">{filteredCompanies.length} LISTED</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
              {filteredCompanies.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: V.dim, fontSize: 13, padding: '40px 0' }}>No entities found</div>
              ) : filteredCompanies.map((c, i) => {
                const pct = c.entries > 0 ? Math.round(((c.entries - c.violations) / c.entries) * 100) : 100;
                const isSelected = active?.id === c.id;
                const isBreach = c.violations > 0;
                return (
                  <div key={i} className={`entity-card ${isBreach ? 'breach' : 'clean'} ${isSelected ? 'selected' : ''}`} onClick={() => setActive(c)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.primary, lineHeight: 1.3 }}>{c.name}</div>
                      <span className={`badge ${isBreach ? 'badge-red' : 'badge-green'}`}>{isBreach ? 'BREACH' : 'CLEAN'}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: isBreach ? V.red : V.green, lineHeight: 1, marginBottom: 8 }}>{pct}%</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span>{c.entries} decisions</span>
                      <span>{c.violations} violations</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setActive(c); }}
                      style={{ marginTop: 12, width: '100%', padding: '7px', borderRadius: 4, background: isSelected ? 'var(--accent)' : 'transparent', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-lit)'}`, color: isSelected ? '#fff' : V.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {isSelected ? '✓ Auditing' : 'Audit →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Decision Stream */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.primary }}>AI Decision Stream</div>
                <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>{active ? `Viewing: ${active.name}` : 'Select an entity'}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
                  <button key={m} onClick={() => setFilter(m)} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: filter === m ? 'rgba(124,58,237,0.15)' : 'transparent', color: filter === m ? '#a78bfa' : V.dim, borderColor: filter === m ? 'rgba(124,58,237,0.3)' : V.border }}>{m}</button>
                ))}
                <span className="badge badge-purple">ENC</span>
              </div>
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <input value={streamSearch} onChange={e => setStreamSearch(e.target.value)} placeholder="Search decisions..." className="ra-input" style={{ fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: V.dim, fontSize: 13, paddingTop: 40 }}>Syncing relay...</div>
              ) : filteredStream.length === 0 ? (
                <div style={{ textAlign: 'center', color: V.dim, fontSize: 13, paddingTop: 40 }}>No decisions found</div>
              ) : filteredStream.map((e, i) => (
                <div key={i} className={`log-entry slide-in ${!e.is_compliant ? 'violation' : 'clean'}`} onClick={() => openVault(e)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className={`badge ${e.is_compliant ? 'badge-green' : 'badge-red'}`}>{e.is_compliant ? 'VERIFIED' : 'BREACH'}</span>
                    <span className="mono" style={{ fontSize: 11, color: V.dim }}>{e.entry_id?.slice(0, 8)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: V.secondary }}>
                    <span style={{ color: V.primary, fontWeight: 500 }}>{e.project_name}</span> — AI decision pulse
                  </div>
                  {!e.is_compliant && e.violations?.[0] && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--red-soft)', fontFamily: 'JetBrains Mono, monospace' }}>↳ {e.violations[0]?.rule_id || 'Policy violation'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ra-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: V.primary, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Verify Chain Integrity',  bg: 'var(--accent)', action: verifyChain },
              { label: 'View Decision Ledger',     bg: 'var(--cyan)',   action: () => navigate('/ledger') },
              { label: 'Issue Enforcement Notice', bg: 'var(--amber)',  action: () => navigate('/enforce') },
              { label: 'Live Gov Ticker',          bg: 'var(--green)',  action: () => navigate('/live-ticker') },
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{ padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: a.bg, border: 'none', cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}>
                {a.label}
              </button>
            ))}
            {/* Dialect dropdown */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: V.muted, fontWeight: 600 }}>DIALECT</span>
              <select value={dialect} onChange={e => setDialect(e.target.value)} className="ra-select" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
                {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {(verifying || chainResult) && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: V.void, borderRadius: 6, border: `1px solid ${chainResult?.verification_rate === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {verifying ? (
                <span style={{ fontSize: 13, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>Verifying chain for {active?.name}...</span>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${chainResult.verification_rate === 1 ? 'badge-green' : 'badge-red'}`} style={{ marginRight: 10 }}>
                    {chainResult.verification_rate === 1 ? 'CHAIN INTACT' : 'ANOMALY DETECTED'}
                  </span>
                  <span style={{ fontSize: 13, color: V.secondary }}>{active?.name} — {chainResult.chain?.length ?? 0} entries verified</span>
                  <button onClick={() => setChainResult(null)} style={{ background: 'none', border: 'none', color: V.dim, cursor: 'pointer', fontSize: 12 }}>dismiss</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Forensic Vault */}
      {vault && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: '100%', maxWidth: 1100, height: '100%', background: V.card, border: `1px solid ${V.borderLit}`, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${V.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: V.surface }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.primary }}>Forensic Vault — {vault.project_name}</div>
                <div className="mono" style={{ fontSize: 11, color: V.dim, marginTop: 4 }}>ID: {vault.entry_id} | Hash: {vault.chain_hash?.slice(0, 24)}…</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${vault.is_compliant ? 'badge-green' : 'badge-red'}`}>{vault.is_compliant ? 'VERIFIED' : 'BREACH'}</span>
                <select value={dialect} onChange={e => { setDialect(e.target.value); openVault(vault); }} className="ra-select" style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}>
                  {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => { setVault(null); setTranslated(null); }} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${V.borderLit}`, background: 'transparent', color: V.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--red-soft)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = V.secondary; e.currentTarget.style.borderColor = V.borderLit; }}>Close</button>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${V.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${V.border}`, background: V.surface }}>
                  <span style={{ fontSize: 11, color: V.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dialect} Regulatory Translation</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translated
                    ? <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan-soft)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{JSON.stringify(translated.translation, null, 2)}</pre>
                    : <div style={{ color: V.dim, fontSize: 13, paddingTop: 20 }}>Translating to {dialect}...</div>}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${V.border}`, background: V.surface }}>
                  <span style={{ fontSize: 11, color: V.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Raw Decision Payload</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7 }} dangerouslySetInnerHTML={hl(translated?.raw_payload || vault.raw_payload)} />
              </div>
            </div>
            <div style={{ padding: '10px 24px', borderTop: `1px solid ${V.border}`, display: 'flex', justifyContent: 'space-between', background: V.surface }}>
              <span className="mono" style={{ fontSize: 11, color: V.dim }}>Integrity: {translated?.integrity?.status || 'VERIFIED'} | Dialect: {dialect}</span>
              <span style={{ fontSize: 11, color: V.dim, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Authorized Regulatory Access Only</span>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
