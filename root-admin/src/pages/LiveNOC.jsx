import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function LiveNOC() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('OFFLINE');
  const scrollRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      setStatus('CONNECTING');
      const url = endpoints.wsFleet('GLOBAL_SYSTEM', token);
      ws.current = new WebSocket(url);
      ws.current.onopen = () => setStatus('ONLINE');
      ws.current.onclose = () => {
        setStatus('OFFLINE');
        setTimeout(connect, 5000);
      };
      ws.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setLogs(prev => [msg, ...prev].slice(0, 100));
      };
    };
    connect();
    return () => ws.current?.close();
  }, [token]);

  const statusColor = {
    ONLINE: 'var(--green)',
    CONNECTING: 'var(--amber)',
    OFFLINE: 'var(--red)',
  }[status] || 'var(--red)';

  return (
    <div style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Live NOC
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Real-time telemetry stream across the global governance mesh.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: statusColor }}>{status}</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Global Compliance', value: '98.4%', color: 'var(--green)' },
          { label: 'Active Remediations', value: '12', color: 'var(--amber)' },
          { label: 'Auditor Sessions', value: '06', color: 'var(--cyan)' },
          { label: 'Grid Latency', value: '14ms', color: 'var(--accent-soft)' },
        ].map((s, i) => (
          <div key={i} className="ra-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="ra-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Secure Telemetry Feed
            </span>
            <span className="badge badge-purple">AES-256</span>
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>AUTH: MASTER_ADMIN</span>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {logs.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.4 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Scanning mesh frequency...</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', maxWidth: 360 }}>
                Awaiting initial handshake pulses from enterprise spokes.
              </div>
            </div>
          ) : logs.map((log, i) => (
            <div key={i} className={`log-entry slide-in ${log.violations?.length > 0 ? 'violation' : 'clean'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${log.type === 'VIOLATION_ALERT' ? 'badge-red' : 'badge-green'}`}>
                    {log.type}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {log.project}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {log.chain_hash?.slice(0, 10)}...
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {log.violations?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {log.violations.map((v, j) => (
                    <div key={j} style={{
                      padding: '8px 12px',
                      background: 'rgba(239,68,68,0.08)',
                      borderRadius: 4,
                      fontSize: 13,
                      color: 'var(--red-soft)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      ⚠ {v.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Boot log seed */}
          {logs.length > 0 && (
            <div className="mono" style={{
              fontSize: 11, color: 'var(--text-dim)', opacity: 0.4,
              padding: '16px 0 8px',
              borderTop: '1px solid var(--border)',
              marginTop: 8,
              lineHeight: 2,
            }}>
              [BOOT] ANCHOR V5.0.2 MASTER NODE ONLINE // CLEARANCE: ROOT<br />
              [AUTH] SECURE CHANNEL ESTABLISHED WITH CLOUD-GATEWAY-1<br />
              [GRID] MAPPING REGULATORY STATUTES TO ACTIVE TELEMETRY STREAMS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
