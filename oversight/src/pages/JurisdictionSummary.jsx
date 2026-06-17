import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

// ── Region flag map ───────────────────────────────────────────────────────
const REGION_META = {
  'India':          { flag: '🇮🇳', code: 'IN'  },
  'USA':            { flag: '🇺🇸', code: 'US'  },
  'United States':  { flag: '🇺🇸', code: 'US'  },
  'UK':             { flag: '🇬🇧', code: 'GB'  },
  'United Kingdom': { flag: '🇬🇧', code: 'GB'  },
  'European Union': { flag: '🇪🇺', code: 'EU'  },
  'EU':             { flag: '🇪🇺', code: 'EU'  },
  'UAE':            { flag: '🇦🇪', code: 'AE'  },
  'Singapore':      { flag: '🇸🇬', code: 'SG'  },
  'China':          { flag: '🇨🇳', code: 'CN'  },
  'Japan':          { flag: '🇯🇵', code: 'JP'  },
  'Australia':      { flag: '🇦🇺', code: 'AU'  },
  'Canada':         { flag: '🇨🇦', code: 'CA'  },
  'Unknown':        { flag: '🌐', code: '??' },
};

const regionMeta = (r) => REGION_META[r] || { flag: '🌐', code: r?.slice(0,2).toUpperCase() || '??' };

const pctColor = (pct) => {
  if (pct >= 90) return 'var(--green)';
  if (pct >= 70) return 'var(--cyan)';
  if (pct >= 50) return 'var(--amber)';
  return 'var(--red)';
};
const pctBadge = (pct) => {
  if (pct >= 90) return 'badge-green';
  if (pct >= 70) return 'badge-cyan';
  if (pct >= 50) return 'badge-amber';
  return 'badge-red';
};

// ── Horizontal compliance bar ─────────────────────────────────────────────
function ComplianceBar({ pct, animated = true }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!animated) { setWidth(pct); return; }
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct, animated]);

  return (
    <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-void)', overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', borderRadius: 99,
        background: pct >= 90 ? 'var(--green)' : pct >= 70 ? 'var(--cyan)' : pct >= 50 ? 'var(--amber)' : 'var(--red)',
        width: `${width}%`,
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 0 8px ${pctColor(pct)}44`,
      }}/>
    </div>
  );
}

// ── Region Card ───────────────────────────────────────────────────────────
function RegionCard({ r, rank }) {
  const [hovered, setHovered] = useState(false);
  const meta = regionMeta(r.region);
  const isCritical = r.compliance_pct < 50;
  const isHealthy  = r.compliance_pct >= 90;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? (isCritical ? 'rgba(239,68,68,0.4)' : 'var(--border-lit)') : 'var(--border)'}`,
        borderRadius: 8,
        padding: '20px 22px',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rank badge */}
      <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
        #{rank}
      </div>

      {/* Glow for critical regions */}
      {isCritical && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.05) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 32, lineHeight: 1 }}>{meta.flag}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{r.region}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className={`badge ${pctBadge(r.compliance_pct)}`}>{r.compliance_pct}% compliant</span>
            {isCritical && <span className="badge badge-red">⚠ CRITICAL</span>}
            {isHealthy  && <span className="badge badge-green">✓ HEALTHY</span>}
          </div>
        </div>
      </div>

      {/* Compliance bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>COMPLIANCE RATE</span>
          <span style={{ color: pctColor(r.compliance_pct), fontFamily: 'JetBrains Mono, monospace' }}>{r.compliance_pct}%</span>
        </div>
        <ComplianceBar pct={r.compliance_pct}/>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Decisions',  value: r.total_decisions,  color: 'var(--cyan)'   },
          { label: 'Violations', value: r.violations,       color: r.violations > 0 ? 'var(--red)' : 'var(--green)' },
          { label: 'AI Entities',value: r.entity_count,     color: 'var(--accent-soft)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-void)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Worst entity */}
      {r.worst_entity && (
        <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--red-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Top Violator</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{r.worst_entity}</div>
          </div>
          <span className="badge badge-red">{r.worst_entity_viols} breaches</span>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function JurisdictionSummary() {
  const { token } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('worst'); // worst | best | decisions | entities
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/oversight/jurisdiction-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(setData)
      .catch(e => {
        console.error("Jurisdiction Summary failed to load:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const sorted = (() => {
    if (!data?.by_region) return [];
    const d = [...data.by_region];
    if (sortBy === 'worst')     return d.sort((a,b) => a.compliance_pct - b.compliance_pct);
    if (sortBy === 'best')      return d.sort((a,b) => b.compliance_pct - a.compliance_pct);
    if (sortBy === 'decisions') return d.sort((a,b) => b.total_decisions - a.total_decisions);
    if (sortBy === 'entities')  return d.sort((a,b) => b.entity_count - a.entity_count);
    return d;
  })();

  const s = data?.summary;

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Jurisdiction Summary</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              AI compliance status grouped by nation-state — ready for ministry reporting.
            </div>
          </div>
          {s && (
            <div style={{ padding: '8px 16px', background: s.global_compliance_pct >= 80 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 6, border: `1px solid ${s.global_compliance_pct >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Global Compliance</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: pctColor(s.global_compliance_pct) }}>{s.global_compliance_pct}%</div>
            </div>
          )}
        </div>

        {/* Global stats */}
        {s && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {[
              { label: 'Total Decisions',    value: s.total_decisions,    color: 'var(--cyan)'        },
              { label: 'Total Violations',   value: s.total_violations,   color: s.total_violations > 0 ? 'var(--red)' : 'var(--green)' },
              { label: 'AI Entities',        value: s.total_entities,     color: 'var(--accent-soft)' },
              { label: 'Jurisdictions',      value: s.total_regions,      color: 'var(--amber)'       },
              { label: 'Compliant',          value: s.total_decisions - s.total_violations, color: 'var(--green)' },
            ].map((st, i) => (
              <div key={i} className="ra-card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{st.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: st.color }}>{st.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Global compliance bar */}
        {s && (
          <div className="ra-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Global AI Governance Compliance Rate</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(s.global_compliance_pct), fontFamily: 'JetBrains Mono, monospace' }}>{s.global_compliance_pct}%</span>
            </div>
            <ComplianceBar pct={s.global_compliance_pct}/>
            <div style={{ marginTop: 10, display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-dim)' }}>
              <span>🟢 {s.total_decisions - s.total_violations} clean decisions</span>
              <span>🔴 {s.total_violations} violations across {s.total_regions} jurisdictions</span>
            </div>
          </div>
        )}

        {/* Sort controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SORT BY</span>
          {[
            ['worst',     'Worst First'],
            ['best',      'Best First'],
            ['decisions', 'Most Active'],
            ['entities',  'Most Entities'],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: sortBy === v ? 'var(--accent-glow)' : 'transparent',
              color: sortBy === v ? '#a78bfa' : 'var(--text-muted)',
              borderColor: sortBy === v ? 'var(--accent)' : 'var(--border)',
            }}>{l}</button>
          ))}
        </div>

        {/* Region cards grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)', fontSize: 13 }}>
            Loading jurisdiction data...
          </div>
        ) : error ? (
          <div className="ra-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No jurisdiction data available</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              No entities registered in this jurisdiction.
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="ra-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No jurisdiction data yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Jurisdiction data appears once organizations with region tags submit AI decisions to the ledger.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {sorted.map((r, i) => <RegionCard key={r.region} r={r} rank={i + 1}/>)}
          </div>
        )}

        {/* Compact table — for reporting */}
        {sorted.length > 0 && (
          <div className="ra-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ministry Report Table</span>
              <button onClick={() => {
                const rows = [['Jurisdiction','Decisions','Violations','Compliance %','AI Entities','Top Violator']];
                sorted.forEach(r => rows.push([r.region, r.total_decisions, r.violations, `${r.compliance_pct}%`, r.entity_count, r.worst_entity || 'N/A']));
                const csv  = rows.map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = `anchor_jurisdiction_${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); URL.revokeObjectURL(url);
              }} style={{ padding: '7px 16px', borderRadius: 6, background: 'var(--green)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                Export CSV
              </button>
            </div>
            <table className="ra-table">
              <thead>
                <tr>
                  <th>#</th><th>Jurisdiction</th><th>AI Entities</th>
                  <th>Decisions</th><th>Violations</th><th>Compliance</th><th>Top Violator</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={r.region}>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{i+1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{regionMeta(r.region).flag}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.region}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-soft)' }}>{r.entity_count}</td>
                    <td>{r.total_decisions}</td>
                    <td style={{ color: r.violations > 0 ? 'var(--red-soft)' : 'var(--text-dim)' }}>{r.violations || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ComplianceBar pct={r.compliance_pct} animated={false}/>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(r.compliance_pct), fontFamily: 'JetBrains Mono, monospace', minWidth: 40 }}>{r.compliance_pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: r.worst_entity ? 'var(--red-soft)' : 'var(--text-dim)' }}>
                      {r.worst_entity || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
