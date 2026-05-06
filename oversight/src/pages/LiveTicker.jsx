import React, { useState, useEffect, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function LiveTicker() {
  const { token } = useAuth();
  const [events, setEvents]     = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('ALL');
  const [paused, setPaused]     = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        setEvents(data);
        const map = {};
        data.forEach(e => {
          if (!map[e.project_name]) map[e.project_name] = { name: e.project_name, total: 0, violations: 0, lastSeen: e.timestamp };
          map[e.project_name].total++;
          if (!e.is_compliant) map[e.project_name].violations++;
        });
        setCompanies(Object.values(map).sort((a,b) => b.total - a.total));
      });
  }, [token]);

  // Auto-scroll feed
  useEffect(() => {
    if (paused || !feedRef.current) return;
    const t = setInterval(() => {
      feedRef.current.scrollTop += 1;
      if (feedRef.current.scrollTop + feedRef.current.clientHeight >= feedRef.current.scrollHeight) {
        feedRef.current.scrollTop = 0;
      }
    }, 30);
    return () => clearInterval(t);
  }, [paused, events]);

  const filteredEvents = events.filter(e => {
    const q = search.toLowerCase();
    const mq = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
    const mf = filter === 'ALL' || (filter === 'COMPLIANT' && e.is_compliant) || (filter === 'VIOLATIONS' && !e.is_compliant);
    return mq && mf;
  });

  const totalViolations = companies.reduce((a, c) => a + c.violations, 0);
  const totalDecisions  = companies.reduce((a, c) => a + c.total, 0);

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Live Governance Ticker</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Real-time AI compliance events across your jurisdiction — like a market feed.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: paused ? 'none' : 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--green-soft)', fontWeight: 600 }}>{paused ? 'PAUSED' : 'LIVE'}</span>
            </div>
            <button onClick={() => setPaused(p => !p)} style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { label: 'Total Events',   value: totalDecisions,        color: 'var(--cyan)',   cls: 'cyan'   },
            { label: 'Companies',      value: companies.length,      color: 'var(--accent-soft)', cls: 'accent' },
            { label: 'Clean Decisions',value: totalDecisions - totalViolations, color: 'var(--green)', cls: 'green' },
            { label: 'Violations',     value: totalViolations,       color: totalViolations > 0 ? 'var(--red)' : 'var(--green)', cls: totalViolations > 0 ? 'red' : 'green' },
          ].map((s,i) => (
            <div key={i} className={`stat-card ${s.cls}`}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by company or decision ID..." className="ra-input" style={{ paddingLeft: 40, fontSize: 13, height: 42 }} />
          </div>
          {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
            <button key={m} onClick={() => setFilter(m)} style={{ padding: '8px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: filter === m ? 'var(--accent-glow)' : 'transparent', color: filter === m ? '#a78bfa' : 'var(--text-muted)', borderColor: filter === m ? 'var(--accent)' : 'var(--border)' }}>{m}</button>
          ))}
        </div>

        {/* Main two-panel: Company Ticker + Event Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, flex: 1, minHeight: 0 }}>

          {/* Company Ticker — left panel */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Company Ticker</span>
              <span className="badge badge-cyan">{companies.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((c, i) => {
                const score = c.total > 0 ? Math.round(((c.total - c.violations) / c.total) * 100) : 100;
                const isBad = c.violations > 0;
                return (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{c.total} decisions</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: isBad ? 'var(--red)' : 'var(--green)', lineHeight: 1 }}>{score}%</div>
                      <span className={`badge ${isBad ? 'badge-red' : 'badge-green'}`} style={{ marginTop: 4, display: 'inline-flex' }}>
                        {isBad ? `▼ ${c.violations} breach` : '▲ CLEAN'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {companies.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No companies found</div>
              )}
            </div>
          </div>

          {/* Live Event Feed — right panel */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Governance Event Feed</span>
              <span className="badge badge-purple">ENCRYPTED STREAM</span>
            </div>
            <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}
              onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, paddingTop: 40 }}>No events match filter</div>
              ) : filteredEvents.map((e, i) => (
                <div key={i} className={`log-entry ${!e.is_compliant ? 'violation' : 'clean'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${e.is_compliant ? 'badge-green' : 'badge-red'}`}>
                        {e.is_compliant ? '▲ VERIFIED' : '▼ BREACH'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{e.project_name}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>#{e.entry_id?.slice(0,8)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>AI decision pulse dispatched{!e.is_compliant && e.violations?.[0] ? ` — ${e.violations[0]?.rule_id}` : ''}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.timestamp?.slice(0,19)?.replace('T',' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
