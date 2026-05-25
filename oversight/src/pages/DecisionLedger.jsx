import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { translateToRegulatory } from '../lib/RegulatoryMapper';
import { endpoints } from '../lib/api';
import { useAuditLog } from '../hooks/useAuditLog';

const DIALECTS = ['RBI','SEC','EU-AI','NIST'];

export default function DecisionLedger() {
  const { token } = useAuth();
  const log = useAuditLog();
  const [ledger, setLedger]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('ALL');
  const [dialect, setDialect]       = useState('RBI');
  const [vault, setVault]           = useState(null);
  const [translated, setTranslated] = useState(null);
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [watchlist, setWatchlist]   = useState(() => JSON.parse(localStorage.getItem('anchor_watchlist') || '[]'));

  useEffect(() => {
    localStorage.setItem('anchor_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatch = (entityId, name) => {
    setWatchlist(prev => 
      prev.some(e => e.id === entityId)
        ? prev.filter(e => e.id !== entityId)
        : [...prev, { id: entityId, name, lastSeen: new Date().toISOString() }]
    );
    log('WATCHLIST_TOGGLE', { target_id: entityId, target_name: name });
  };

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLedger).finally(() => setLoading(false));
  }, [token]);

  const openVault = async (entry) => {
    // Parse the metadata payload to check for decentralization
    let meta = {};
    try { meta = JSON.parse(entry.payload || '{}'); } catch(e) {}

    setVault({ ...entry, meta });
    
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

    log('VAULT_VIEW', { target_id: entry.entry_id, target_name: entry.project_name, detail: entry.is_compliant ? 'COMPLIANT' : 'VIOLATION' });
    
    // If it's a legacy record (or not decentralized), try the standard translation route
    if (!meta.decentralized) {
      try {
        const r = await fetch(`${endpoints.baseUrl}/api/audit/${entry.entity_id || 'unknown'}/entry/${entry.entry_id}?dialect=${dialect}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (r.ok) setTranslated(await r.json());
      } catch(e) {}
    }
  };

  const initiateRelayPull = async (entry) => {
    setLoading(true);
    log('FORENSIC_RELAY_INIT', { target_id: entry.id, target_name: entry.entity_id });
    
    try {
      const r = await fetch(`${endpoints.baseUrl}/api/forensic/relay`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entry_id: entry.id,
          entity_id: entry.entity_id
        })
      });
      
      const res = await r.json();
      if (res.status === 'FORENSIC_RETRIEVED') {
        setTranslated({ raw_payload: res.data, translation: { "note": "Relay successful. Raw data retrieved from Spoke." } });
      } else {
        alert(`Relay Failed: ${res.detail || 'Spoke offline'}`);
      }
    } catch(e) {
      alert("Relay Error: Could not reach the Sovereign Spoke.");
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => ledger.filter(e => {
    const q = search.toLowerCase();
    const mq = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
    const mf = filter === 'ALL' || (filter === 'COMPLIANT' && e.is_compliant) || (filter === 'VIOLATIONS' && !e.is_compliant);
    const ts = (e.timestamp || '').slice(0, 10);
    const mFrom = !dateFrom || ts >= dateFrom;
    const mTo   = !dateTo   || ts <= dateTo;
    return mq && mf && mFrom && mTo;
  }), [ledger, search, filter, dateFrom, dateTo]);

  const exportCSV = () => {
    const headers = ['Decision ID','Company / AI Model','Status','Violations','Timestamp'];
    const csvRows = [headers.join(',')];
    rows.forEach(e => {
      csvRows.push([
        e.entry_id || '',
        `"${(e.project_name || '').replace(/"/g, '""')}"`,
        e.is_compliant ? 'COMPLIANT' : 'VIOLATION',
        e.violations?.length || 0,
        e.timestamp || '',
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `anchor_decisions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    log('EXPORT', { target_name: 'Decision Ledger CSV', detail: `${rows.length} rows exported` });
  };

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Decision Ledger</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Complete record of every AI governance decision across your jurisdiction.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DIALECT</span>
            <select value={dialect} onChange={e => setDialect(e.target.value)} className="ra-select" style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}>
              {DIALECTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Search + Filter + Date Range + Export */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or decision ID..." className="ra-input" style={{ paddingLeft: 40, fontSize: 13, height: 42 }} />
          </div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="ra-input" style={{ width: 150, fontSize: 13, height: 42 }} title="From date"/>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>→</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="ra-input" style={{ width: 150, fontSize: 13, height: 42 }} title="To date"/>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>✕ Clear</button>
          )}
          {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
            <button key={m} onClick={() => setFilter(m)} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: filter === m ? 'var(--accent-glow)' : 'transparent', color: filter === m ? '#a78bfa' : 'var(--text-muted)', borderColor: filter === m ? 'var(--accent)' : 'var(--border)' }}>{m}</button>
          ))}
          <button onClick={exportCSV} disabled={rows.length === 0} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--green)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: rows.length > 0 ? 'pointer' : 'not-allowed', opacity: rows.length > 0 ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            Export CSV
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { label: 'Total Decisions', value: ledger.length, color: 'var(--cyan)' },
            { label: 'Compliant',       value: ledger.filter(e=>e.is_compliant).length, color: 'var(--green)' },
            { label: 'Violations',      value: ledger.filter(e=>!e.is_compliant).length, color: 'var(--red)' },
          ].map((s,i) => (
            <div key={i} className="ra-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="ra-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>All Decisions</span>
            <span className="badge badge-purple">{rows.length} RECORDS</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Loading decisions...</div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
              <table className="ra-table">
                <thead>
                  <tr><th>Entity</th><th>Decision ID</th><th>Status</th><th>Violations</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }}>No decisions found</td></tr>
                  ) : rows.map((e, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button 
                            onClick={(evt) => { evt.stopPropagation(); toggleWatch(e.entity_id || e.project_name, e.project_name); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: watchlist.some(w => w.id === (e.entity_id || e.project_name)) ? 'var(--amber)' : 'var(--text-dim)', transition: 'color 0.2s' }}
                            title="Toggle Watchlist Pin"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                          {e.project_name}
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.entry_id?.slice(0,16)}…</td>
                      <td><span className={`badge ${e.is_compliant ? 'badge-green' : 'badge-red'}`}>{e.is_compliant ? 'VERIFIED' : 'BREACH'}</span></td>
                      <td style={{ fontSize: 12, color: e.violations?.length > 0 ? 'var(--red-soft)' : 'var(--text-dim)' }}>{e.violations?.length || 0}</td>
                      <td>
                        <button onClick={() => openVault(e)} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid var(--border-lit)', background: 'transparent', color: 'var(--accent-soft)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={el => el.currentTarget.style.background = 'var(--accent-dim)'}
                          onMouseLeave={el => el.currentTarget.style.background = 'transparent'}>
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Vault overlay */}
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
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dialect} Translation</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translated ? <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--cyan-soft)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{JSON.stringify(translated.translation, null, 2)}</pre>
                    : <div style={{ color: 'var(--text-dim)', fontSize: 13, paddingTop: 20 }}>Translating...</div>}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Raw Payload</span>
                  {vault.meta?.decentralized && !translated && (
                    <button onClick={() => initiateRelayPull(vault)} className="badge badge-purple" style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                      🔓 Unlock Forensic Vault
                    </button>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {translated?.raw_payload || vault.raw_payload ? (
                    <pre style={{ fontFamily: 'JetBrains Mono', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(translated?.raw_payload || vault.raw_payload, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>Sovereign Data Protection</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 13, maxWidth: 300, margin: '0 auto' }}>
                        This evidence is stored exclusively on the Enterprise Spoke node. Click 'Unlock' above to request a secure forensic relay.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
