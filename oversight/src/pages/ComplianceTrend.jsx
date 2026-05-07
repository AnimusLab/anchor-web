import React, { useState, useEffect, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const RANGES = [
  { label: '7D',  days: 7  },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

// ── Pure SVG line + area chart ──────────────────────────────────────────────
function TrendChart({ data, days }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef  = useRef(null);
  const W = 800, H = 260, PX = 48, PY = 20, PB = 40;
  const innerW  = W - PX * 2;
  const innerH  = H - PY - PB;

  // Only points with actual data
  const active = data.filter(d => d.compliance_pct !== null);
  if (active.length === 0) return (
    <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
      No decision data in this period
    </div>
  );

  const n = data.length;
  const xOf = i => PX + (i / (n - 1)) * innerW;
  const yOf = pct => PY + innerH - (pct / 100) * innerH;

  // Build path only through active points
  const pts = data
    .map((d, i) => d.compliance_pct !== null ? { x: xOf(i), y: yOf(d.compliance_pct), d } : null)
    .filter(Boolean);

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length-1].x.toFixed(1)},${(PY+innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PY+innerH).toFixed(1)} Z`;

  // Y-axis labels
  const yTicks = [0, 25, 50, 75, 100];
  // X-axis: show ~6 dates
  const step = Math.max(1, Math.floor(n / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === n - 1);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const idx = Math.round(((mx - PX) / innerW) * (n - 1));
    const clamped = Math.max(0, Math.min(n - 1, idx));
    setTooltip({ idx: clamped, x: xOf(clamped), d: data[clamped] });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01"/>
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7c3aed"/>
            <stop offset="50%"  stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(t => (
          <g key={t}>
            <line x1={PX} x2={W - PX} y1={yOf(t)} y2={yOf(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <text x={PX - 8} y={yOf(t) + 4} textAnchor="end" fontSize="10" fill="#4b5563">{t}%</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)"/>

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Dots on active points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3"
            fill={p.d.compliance_pct >= 80 ? '#10b981' : p.d.compliance_pct >= 50 ? '#f59e0b' : '#ef4444'}
            stroke="var(--bg-card)" strokeWidth="2"/>
        ))}

        {/* Tooltip crosshair */}
        {tooltip && tooltip.d.compliance_pct !== null && (
          <>
            <line x1={tooltip.x} x2={tooltip.x} y1={PY} y2={PY + innerH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
            <circle cx={tooltip.x} cy={yOf(tooltip.d.compliance_pct)} r="5"
              fill={tooltip.d.compliance_pct >= 80 ? '#10b981' : tooltip.d.compliance_pct >= 50 ? '#f59e0b' : '#ef4444'}
              stroke="white" strokeWidth="2"/>
          </>
        )}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={xOf(idx)} y={H - 8} textAnchor="middle" fontSize="10" fill="#4b5563">
              {d.date.slice(5)} {/* MM-DD */}
            </text>
          );
        })}

        {/* X axis line */}
        <line x1={PX} x2={W - PX} y1={PY + innerH} y2={PY + innerH} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--border-lit)',
          borderRadius: 6, padding: '8px 14px', pointerEvents: 'none',
          display: 'flex', gap: 20, alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.d.date}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: tooltip.d.compliance_pct >= 80 ? 'var(--green)' : tooltip.d.compliance_pct >= 50 ? 'var(--amber)' : 'var(--red)' }}>
            {tooltip.d.compliance_pct !== null ? `${tooltip.d.compliance_pct}%` : 'No data'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{tooltip.d.total} decisions · {tooltip.d.violations} violations</span>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ComplianceTrend() {
  const { token } = useAuth();
  const [companies, setCompanies]   = useState([]);
  const [selected, setSelected]     = useState(null);
  const [days, setDays]             = useState(30);
  const [trend, setTrend]           = useState(null);
  const [loading, setLoading]       = useState(false);

  // Load entity roster
  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const map = {};
        data.forEach(e => {
          if (!map[e.entity_id]) map[e.entity_id] = { id: e.entity_id, name: e.project_name || e.entity_id };
        });
        const list = Object.values(map);
        setCompanies(list);
        if (list.length) setSelected(list[0]);
      }).catch(console.error);
  }, [token]);

  // Fetch trend when entity or range changes
  useEffect(() => {
    if (!selected) return;
    setLoading(true); setTrend(null);
    fetch(`${endpoints.baseUrl}/api/audit/${selected.id}/trend?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setTrend)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected, days, token]);

  const summary = trend?.summary;
  const trendDir = (() => {
    if (!trend?.data) return null;
    const pts = trend.data.filter(d => d.compliance_pct !== null);
    if (pts.length < 2) return null;
    const half = Math.floor(pts.length / 2);
    const firstHalf = pts.slice(0, half).reduce((a, d) => a + d.compliance_pct, 0) / half;
    const lastHalf  = pts.slice(-half).reduce((a, d) => a + d.compliance_pct, 0) / half;
    return lastHalf - firstHalf;  // positive = improving
  })();

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>AI Compliance Trend</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Track how an AI model's compliance rate changes over time — day by day.
            </div>
          </div>
          {trendDir !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              background: trendDir >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              borderRadius: 6,
              border: `1px solid ${trendDir >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <span style={{ fontSize: 18 }}>{trendDir >= 0 ? '▲' : '▼'}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: trendDir >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {trendDir >= 0 ? 'IMPROVING' : 'DEGRADING'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  {Math.abs(trendDir).toFixed(1)}% vs first half
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={selected?.id || ''} onChange={e => setSelected(companies.find(c => c.id === e.target.value))}
            className="ra-select" style={{ flex: 1 }}>
            <option value="">— Select AI Entity —</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            {RANGES.map(r => (
              <button key={r.days} onClick={() => setDays(r.days)} style={{
                padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                background: days === r.days ? 'var(--accent-glow)' : 'transparent',
                color: days === r.days ? '#a78bfa' : 'var(--text-muted)',
                borderColor: days === r.days ? 'var(--accent)' : 'var(--border)',
              }}>{r.label}</button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
            {[
              { label: 'Avg Compliance',   value: summary.avg_compliance_pct != null ? `${summary.avg_compliance_pct}%` : '—', color: summary.avg_compliance_pct >= 80 ? 'var(--green)' : summary.avg_compliance_pct >= 50 ? 'var(--amber)' : 'var(--red)' },
              { label: 'Total Decisions',  value: summary.total_decisions,   color: 'var(--cyan)' },
              { label: 'Total Violations', value: summary.total_violations,  color: summary.total_violations > 0 ? 'var(--red)' : 'var(--green)' },
              { label: 'Best Day',         value: summary.best_day?.date?.slice(5) || '—',  color: 'var(--green)',   sub: summary.best_day ? `${summary.best_day.compliance_pct}%` : '' },
              { label: 'Worst Day',        value: summary.worst_day?.date?.slice(5) || '—', color: 'var(--red)',     sub: summary.worst_day ? `${summary.worst_day.compliance_pct}%` : '' },
            ].map((s, i) => (
              <div key={i} className="ra-card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="ra-card" style={{ padding: '20px 24px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {selected?.name || 'Select an entity'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Daily compliance rate — last {days} days
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-dim)' }}>
              {[['#10b981','≥ 80% Compliant'], ['#f59e0b','50–79%'], ['#ef4444','< 50%']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }}/>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              Loading trend data...
            </div>
          ) : trend?.data ? (
            <TrendChart data={trend.data} days={days}/>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              Select an AI entity to view compliance trend
            </div>
          )}
        </div>

        {/* Day-by-day table */}
        {trend?.data && (
          <div className="ra-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Day-by-Day Breakdown</span>
              <span className="badge badge-purple">{days} DAYS</span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 320 }}>
              <table className="ra-table">
                <thead>
                  <tr><th>Date</th><th>Decisions</th><th>Violations</th><th>Compliance %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {[...trend.data].reverse().map((d, i) => (
                    <tr key={i} style={{ opacity: d.total === 0 ? 0.4 : 1 }}>
                      <td className="mono" style={{ fontSize: 12 }}>{d.date}</td>
                      <td style={{ fontSize: 13 }}>{d.total || '—'}</td>
                      <td style={{ color: d.violations > 0 ? 'var(--red-soft)' : 'var(--text-dim)', fontSize: 13 }}>{d.violations || '—'}</td>
                      <td style={{ fontWeight: 700, color: d.compliance_pct >= 80 ? 'var(--green)' : d.compliance_pct >= 50 ? 'var(--amber)' : d.compliance_pct !== null ? 'var(--red)' : 'var(--text-dim)' }}>
                        {d.compliance_pct !== null ? `${d.compliance_pct}%` : 'No data'}
                      </td>
                      <td>
                        {d.total > 0 && (
                          <span className={`badge ${d.compliance_pct >= 80 ? 'badge-green' : d.compliance_pct >= 50 ? 'badge-amber' : 'badge-red'}`}>
                            {d.compliance_pct >= 80 ? 'HEALTHY' : d.compliance_pct >= 50 ? 'WARNING' : 'CRITICAL'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
