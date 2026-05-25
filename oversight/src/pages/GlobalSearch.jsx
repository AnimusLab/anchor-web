import React, { useState, useEffect, useMemo, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { translateToRegulatory } from '../lib/RegulatoryMapper';
import { endpoints } from '../lib/api';

export default function GlobalSearch() {
  const { token }   = useAuth();
  const [allData, setAllData]   = useState([]);
  const [query, setQuery]       = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [filter, setFilter]     = useState('ALL');    // ALL | COMPLIANT | VIOLATIONS
  const [sortBy, setSortBy]     = useState('recent'); // recent | company | violations
  const [loading, setLoading]   = useState(true);
  const [vault, setVault]       = useState(null);
  const [translated, setTranslated] = useState(null);
  const [dialect, setDialect]   = useState('RBI');
  const inputRef = useRef(null);

  // Load full ledger once
  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAllData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  // Debounce search query — 200ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Focus input on load
  useEffect(() => { inputRef.current?.focus(); }, []);

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
      const r = await fetch(`${endpoints.baseUrl}/api/audit/${entry.entity_id}/entry/${entry.entry_id}?dialect=${dialect}`, { headers: { Authorization: `Bearer ${token}` } });
      setTranslated(await r.json());
    } catch(e) { console.error(e); }
  };

  // Filter + search
  const results = useMemo(() => {
    if (!debouncedQ && filter === 'ALL') return [];
    const q = debouncedQ.toLowerCase();
    let rows = allData.filter(e => {
      const mq = !q ||
        e.project_name?.toLowerCase().includes(q) ||
        e.entry_id?.toLowerCase().includes(q) ||
        e.entity_id?.toLowerCase().includes(q) ||
        JSON.stringify(e.violations || []).toLowerCase().includes(q);
      const mf = filter === 'ALL' || (filter === 'COMPLIANT' && e.is_compliant) || (filter === 'VIOLATIONS' && !e.is_compliant);
      return mq && mf;
    });

    if (sortBy === 'company')    rows = [...rows].sort((a,b) => (a.project_name||'').localeCompare(b.project_name||''));
    if (sortBy === 'violations') rows = [...rows].sort((a,b) => (b.violations?.length||0) - (a.violations?.length||0));
    // 'recent' = natural order from API (already sorted by timestamp desc)
    return rows;
  }, [allData, debouncedQ, filter, sortBy]);

  // Group by entity
  const grouped = useMemo(() => {
    const map = {};
    results.forEach(e => {
      const key = e.project_name || e.entity_id || 'Unknown';
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort((a,b) => b[1].length - a[1].length);
  }, [results]);

  const totalViolations = results.filter(e => !e.is_compliant).length;

  // Highlight matching text
  const highlight = (text, q) => {
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(124,58,237,0.3)', color: 'var(--accent-soft)', borderRadius: 2 }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const DIALECTS = ['RBI','SEC','EU-AI','NIST'];

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Cross-Entity Search</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Search across ALL companies and AI models in your jurisdiction simultaneously.
          </div>
        </div>

        {/* Main Search Bar */}
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by company name, AI model, decision ID, violation rule..."
            className="ra-input"
            style={{ paddingLeft: 52, paddingRight: query ? 44 : 18, fontSize: 16, height: 54, borderRadius: 8 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>FILTER</span>
          {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
            <button key={m} onClick={() => setFilter(m)} style={{
              padding: '7px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: filter === m ? 'var(--accent-glow)' : 'transparent',
              color: filter === m ? '#a78bfa' : 'var(--text-muted)',
              borderColor: filter === m ? 'var(--accent)' : 'var(--border)',
            }}>{m}</button>
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border-lit)', margin: '0 4px' }}/>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SORT</span>
          {[['recent','Recent First'],['company','Company'],['violations','Violations']].map(([v,l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              padding: '7px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: sortBy === v ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: sortBy === v ? 'var(--cyan)' : 'var(--text-muted)',
              borderColor: sortBy === v ? 'var(--cyan)' : 'var(--border)',
            }}>{l}</button>
          ))}
        </div>

        {/* Results summary */}
        {(debouncedQ || filter !== 'ALL') && !loading && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span><strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> decisions found</span>
            <span><strong style={{ color: 'var(--cyan)' }}>{grouped.length}</strong> entities</span>
            {totalViolations > 0 && <span><strong style={{ color: 'var(--red)' }}>{totalViolations}</strong> violations</span>}
            {debouncedQ && <span style={{ color: 'var(--text-dim)' }}>matching <em style={{ color: 'var(--accent-soft)' }}>"{debouncedQ}"</em></span>}
          </div>
        )}

        {/* Empty state / idle */}
        {!debouncedQ && filter === 'ALL' && (
          <div className="ra-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Cross-Jurisdiction Search
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
              Type anything above — company name, AI model, decision ID, or a violation rule like <code style={{ color: 'var(--cyan-soft)', fontFamily: 'JetBrains Mono, monospace' }}>RBI-GOV-07</code> — to search across all entities simultaneously.
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['trade','violation','BREACH','credit','RBI'].map(s => (
                <button key={s} onClick={() => setQuery(s)} style={{ padding: '7px 14px', borderRadius: 99, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results grouped by entity */}
        {(debouncedQ || filter !== 'ALL') && (
          loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: 40 }}>Searching...</div>
          ) : grouped.length === 0 ? (
            <div className="ra-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              No results found for "{debouncedQ}"
            </div>
          ) : grouped.map(([entityName, entries]) => {
            const violations = entries.filter(e => !e.is_compliant).length;
            return (
              <div key={entityName} className="ra-card" style={{ overflow: 'hidden' }}>
                {/* Entity header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: violations > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: `1px solid ${violations > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                      {violations > 0 ? '⚠' : '✓'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {highlight(entityName, debouncedQ)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{entries[0]?.entity_id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-purple">{entries.length} results</span>
                    {violations > 0 && <span className="badge badge-red">{violations} violations</span>}
                    {violations === 0 && <span className="badge badge-green">CLEAN</span>}
                  </div>
                </div>

                {/* Entries */}
                <div>
                  {entries.slice(0, 8).map((e, i) => (
                    <div key={i} style={{ padding: '11px 18px', borderBottom: i < Math.min(entries.length, 8) - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.1s' }}
                      onMouseEnter={el => el.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={el => el.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                        <span className={`badge ${e.is_compliant ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 9 }}>
                          {e.is_compliant ? 'OK' : '!'}
                        </span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          {highlight(e.entry_id?.slice(0,16), debouncedQ)}…
                        </span>
                        {!e.is_compliant && e.violations?.[0] && (
                          <span style={{ fontSize: 11, color: 'var(--red-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
                            ↳ {highlight(e.violations[0]?.rule_id || 'breach', debouncedQ)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.timestamp?.slice(0,10)}</span>
                        <button onClick={() => openVault(e)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--accent-soft)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Inspect →
                        </button>
                      </div>
                    </div>
                  ))}
                  {entries.length > 8 && (
                    <div style={{ padding: '10px 18px', fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      +{entries.length - 8} more — refine your search to narrow results
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Forensic Vault overlay */}
      {vault && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: '100%', maxWidth: 1100, height: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-lit)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Forensic Vault — {vault.project_name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>ID: {vault.entry_id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${vault.is_compliant ? 'badge-green' : 'badge-red'}`}>{vault.is_compliant ? 'VERIFIED' : 'BREACH'}</span>
                <select value={dialect} onChange={e => { setDialect(e.target.value); openVault(vault); }} className="ra-select" style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}>
                  {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => { setVault(null); setTranslated(null); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>{dialect} Translation</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translated ? <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--cyan-soft)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{JSON.stringify(translated.translation, null, 2)}</pre>
                    : <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Translating to {dialect}...</div>}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Raw Payload</div>
                <pre style={{ flex: 1, overflowY: 'auto', padding: 20, fontFamily: 'JetBrains Mono', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(translated?.raw_payload || vault.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
