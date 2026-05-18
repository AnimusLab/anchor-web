import React, { useState } from 'react';

const MOCK_VIOLATIONS = [
  { id: 'v_9921', project: 'Retail Customer Chatbot', severity: 'CRITICAL', time: '2026-05-18 14:02:11 UTC', title: 'Unapproved PII Access Pattern detected in Chat Handler.', status: 'OPEN' },
  { id: 'v_9918', project: 'Credit Scoring Engine v4', severity: 'WARNING', time: '2026-05-18 11:45:00 UTC', title: 'Model drift threshold exceeded on bias metric.', status: 'ACKNOWLEDGED' },
  { id: 'v_9850', project: 'Fraud Detection Mesh', severity: 'CRITICAL', time: '2026-05-17 09:12:33 UTC', title: 'Cryptographic signature mismatch on node sync.', status: 'RESOLVED' },
  { id: 'v_9841', project: 'Retail Customer Chatbot', severity: 'WARNING', time: '2026-05-16 16:20:00 UTC', title: 'Latency spike in sentiment analysis module.', status: 'RESOLVED' },
];

export default function ViolationFeed() {
  const [violations] = useState(MOCK_VIOLATIONS);
  const [selected, setSelected] = useState(MOCK_VIOLATIONS[0]);
  const [chatMsg, setChatMsg] = useState('');

  // Group violations by project
  const groupedViolations = violations.reduce((acc, v) => {
    if (!acc[v.project]) acc[v.project] = [];
    acc[v.project].push(v);
    return acc;
  }, {});

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Violation Feed & Relay</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Live incident response and secure threaded communication.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red-soft)', letterSpacing: '0.05em' }}>1 CRITICAL ALARM</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, flex: 1, overflow: 'hidden' }}>
        
        {/* Feed List */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Active Incidents</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(groupedViolations).map(([project, projViolations]) => (
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
              
              {/* Fake message from Auditor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '85%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>M. Chen (Auditor) • 10 mins ago</div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '0 8px 8px 8px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  The chatbot is routing customer prompts directly to the un-sanitized LLM endpoint. We need to implement the PII scrubber middleware ASAP before this triggers a GDPR violation.
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
            Select an incident to view relay thread.
          </div>
        )}
      </div>
    </div>
  );
}
