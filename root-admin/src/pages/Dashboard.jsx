import React, { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(endpoints.stats, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error("Stats fetch failure", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const metrics = [
    {
      label: 'Total Audits',
      value: stats?.total_audits ?? 0,
      sub: 'Across all nodes',
      color: 'var(--cyan)',
      colorClass: 'cyan',
    },
    {
      label: 'Provisioned Nodes',
      value: stats?.active_projects ?? 0,
      sub: 'Active enterprises',
      color: 'var(--accent-soft)',
      colorClass: 'accent',
    },
    {
      label: 'Mesh Integrity',
      value: `${stats?.compliance_rate ?? 100}%`,
      sub: 'Governance coverage',
      color: 'var(--green)',
      colorClass: 'green',
    },
    {
      label: 'Open Violations',
      value: stats?.total_violations ?? 0,
      sub: 'Require remediation',
      color: stats?.total_violations > 0 ? 'var(--red)' : 'var(--green)',
      colorClass: stats?.total_violations > 0 ? 'red' : 'green',
    },
  ];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Authority header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            System Overview
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Root-level view across the entire Anchor governance mesh.
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: 6,
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}/>
          <span style={{ fontSize: 13, color: 'var(--green-soft)', fontWeight: 600 }}>GRID SECURE</span>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              height: 110,
              background: 'var(--bg-card)',
              borderRadius: 6,
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.5,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {metrics.map((m, i) => <StatCard key={i} {...m} />)}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Fleet Matrix */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
                {stats?.project_health?.length > 0 ? stats.project_health.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <span className={`badge ${p.status === 'COMPLIANT' ? 'badge-green' : 'badge-red'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{p.audits}</td>
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
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Global Action Ledger</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Recent governance events</div>
            </div>
            <span className="badge badge-purple">ENCRYPTED</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.recent?.length > 0 ? stats.recent.map((e, i) => (
              <div key={i} className={`log-entry ${e.status === 'VIOLATION' ? 'violation' : 'clean'} slide-in`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className={`badge ${e.status === 'VIOLATION' ? 'badge-red' : 'badge-green'}`}>
                    {e.status}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.commit?.slice(0, 8)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.project}</span>
                  {' — '}audit pulse dispatched
                </div>
              </div>
            )) : (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-dim)', fontSize: 13,
              }}>
                No recent activity
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div className="ra-card" style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Provision Auditor', path: '/provisioning', accent: 'var(--accent)' },
            { label: 'Provision Enterprise', path: '/provisioning', accent: 'var(--cyan)' },
            { label: 'View Live NOC', path: '/noc', accent: 'var(--amber)' },
            { label: 'Fleet Inspection', path: '/fleet', accent: 'var(--green)' },
          ].map((a, i) => (
            <a key={i} href={a.path} style={{
              padding: '9px 18px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              background: a.accent,
              textDecoration: 'none',
              display: 'inline-block',
              opacity: 0.9,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
