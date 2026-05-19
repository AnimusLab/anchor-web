import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function ViolationFeed() {
  const { token } = useAuth();
  const [violations, setViolations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${endpoints.baseUrl}/api/ledger`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out violations
          const filtered = data
            .filter(e => e.type === 'runtime_violation')
            .map(e => {
              const p = e.payload || {};
              return {
                id: e.id,
                project: p.project_name || p.project || 'Unknown Project',
                severity: p.severity || 'CRITICAL',
                time: e.timestamp || 'Just now',
                title: p.reason || p.message || 'Unapproved execution policy violation.',
                status: p.status || 'OPEN'
              };
            });
          setViolations(filtered);
          if (filtered.length > 0) {
            setSelected(filtered[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // Group violations by project
  const groupedViolations = violations.reduce((acc, v) => {
    if (!acc[v.project]) acc[v.project] = [];
    acc[v.project].push(v);
    return acc;
  }, {});

  const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Violation Feed & Relay</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Live incident response and secure threaded communication.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: criticalCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${criticalCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: criticalCount > 0 ? 'var(--red)' : 'var(--green)', animation: criticalCount > 0 ? 'pulse 1.5s infinite' : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: criticalCount > 0 ? 'var(--red-soft)' : 'var(--green)', letterSpacing: '0.05em' }}>
            {criticalCount} CRITICAL ALARMS
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, flex: 1, overflow: 'hidden' }}>
        
        {/* Feed List */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Active Incidents</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                Loading incidents...
              </div>
            ) : Object.keys(groupedViolations).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: 14 }}>
                No active violations or compliance incident reports recorded on this Hub. Systems operating at 100% integrity.
              </div>
            ) : Object.entries(groupedViolations).map(([project, projViolations]) => (
              <div key={project} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4 }}>
                  {project}
                </div>
                {projViolations.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelected(v)}
                    style={{ 
                      padding: 16, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                      background: selected?.id === v.id ? 'var(--bg-surface)' : 'transparent',
                      border: `1px solid ${selected?.id === v.id ? 'var(--border-lit)' : 'var(--border)'}`,
                      borderLeft: `3px solid ${v.severity === 'CRITICAL' ? 'var(--red)' : v.severity === 'WARNING' ? 'var(--amber)' : 'var(--green)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                      <span className={`badge ${v.severity === 'CRITICAL' ? 'badge-red' : 'badge-amber'}`}>{v.severity}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{v.time}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{v.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)' }}>{v.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: v.status === 'RESOLVED' ? 'var(--green)' : 'var(--text-secondary)' }}>{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Relay Chat */}
        {selected ? (
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Incident Thread: {selected.id}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.title}</div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* System message */}
              <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg-void)', padding: '4px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                Thread opened automatically by Anchor Engine
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '85%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Compliance Watchdog • Just now</div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '0 8px 8px 8px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  Telemetry reported a runtime exception or un-scrubbed PII signature pattern. Please remediate the source endpoint parameters.
                </div>
              </div>
              
            </div>

            {/* Chat Input */}
            <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Relay a message to the incident team..."
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-void)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                />
                <button style={{ padding: '0 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ra-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No incident selected.
          </div>
        )}
      </div>
    </div>
  );
}
