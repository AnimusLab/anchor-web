import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const Sparkline = ({ color }) => {
  // Generate a random-looking but static sparkline
  const seed = color.charCodeAt(1);
  const pts = Array.from({length: 15}).map((_, i) => {
    const y = 18 - (Math.sin(i + seed) * 6 + Math.cos(i * 2) * 4 + 8);
    return `${i * 8},${Math.max(2, y)}`;
  }).join(' ');
  
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" style={{ opacity: 0.8 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function ProjectInventory() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${endpoints.baseUrl}/api/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.project_health)) {
          // Map backend stats.project_health to inventory view models
          const formatted = data.project_health.map((p, idx) => ({
            id: `prj_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: p.name,
            repo: `animuslab/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            desc: `Sovereign AI mesh node enforcing active compliance gates for project ${p.name}.`,
            status: p.status || 'COMPLIANT',
            agents: p.audits || 0,
            lastAudit: p.violations > 0 ? 'incident flagged' : 'fully compliant',
            lang: 'Python',
            color: p.status === 'COMPLIANT' ? '#3572A5' : '#EF4444'
          }));
          setProjects(formatted);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Project & Agent Inventory</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Overview of all AI models, agents, and codebases governed by this Hub.</div>
        </div>
      </div>

      {/* GitHub Style List */}
      <div className="ra-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Find a repository or agent..." 
            className="ra-input"
            style={{ maxWidth: 320 }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              Loading project inventory...
            </div>
          ) : projects.map((p, i) => (
            <div key={i} style={{ padding: '24px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <a href="#" style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent-soft)', textDecoration: 'none' }}>{p.repo}</a>
                  <span className={`badge ${p.status === 'COMPLIANT' ? 'badge-green' : 'badge-red'}`} style={{ padding: '2px 10px', borderRadius: 99, border: `1px solid ${p.status === 'COMPLIANT' ? 'var(--green-soft)' : 'var(--red-soft)'}` }}>
                    {p.status}
                  </span>
                </div>
                
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, maxWidth: 600, lineHeight: 1.5 }}>
                  {p.desc}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                    {p.lang}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zM4.5 7.5a.5.5 0 000 1h5.793l-2.147 2.146a.5.5 0 00.708.708l3-3a.5.5 0 000-.708l-3-3a.5.5 0 10-.708.708L10.293 7.5H4.5z"/></svg>
                    {p.agents} Audited Decisions
                  </div>
                  
                  <div>Status: {p.lastAudit}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{p.id}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                   <Sparkline color={p.status === 'COMPLIANT' ? 'var(--green)' : 'var(--red)'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button style={{ padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    Settings
                  </button>
                  <button style={{ padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 15H2.75A1.75 1.75 0 011 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H2.75zM8 4a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 4z"/></svg>
                    Mesh Log
                  </button>
                </div>
              </div>

            </div>
          ))}
          {!loading && projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: 14, background: 'rgba(0,0,0,0.1)' }}>
              No active projects registered under this Sovereign Hub. Use your regional key to bind and push repository compliance telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
