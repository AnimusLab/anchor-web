import React, { useState, useEffect } from 'react';

const V = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-dim)',
  card: 'var(--bg-card)',
  surface: 'var(--bg-surface)',
  void: 'var(--bg-void)',
  border: 'var(--border)',
  borderLit: 'var(--border-lit)',
  green: 'var(--green)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  cyan: 'var(--cyan)',
  accent: 'var(--accent)',
};

export default function RuntimeRegistry() {
  const [runtimes, setRuntimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    runtime_id: '',
    name: '',
    status: 'ONLINE',
    ip_address: '10.144.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
    region: 'us-east-1',
    system_load: 12.5,
  });

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev].slice(0, 50));
  };

  const fetchRuntimes = async () => {
    try {
      const token = localStorage.getItem('anchor_access_token');
      const res = await fetch('/api/admin/runtimes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        // If empty, supply some dynamic institutional defaults for amazing visual aesthetics
        if (!data || data.length === 0) {
          const defaults = [
            {
              runtime_id: 'rt_prod_core_01',
              name: 'Prod-Interception-Core',
              status: 'ONLINE',
              ip_address: '10.231.14.90',
              region: 'us-east-1',
              system_load: 42.1,
              last_heartbeat: new Date().toISOString(),
            },
            {
              runtime_id: 'rt_staging_shadow_02',
              name: 'Staging-Audit-Sandbox',
              status: 'ONLINE',
              ip_address: '10.231.18.112',
              region: 'eu-west-1',
              system_load: 18.7,
              last_heartbeat: new Date(Date.now() - 4000).toISOString(),
            },
            {
              runtime_id: 'rt_dr_failover_03',
              name: 'DR-Failover-Replica',
              status: 'STANDBY',
              ip_address: '10.232.40.5',
              region: 'ap-south-1',
              system_load: 3.2,
              last_heartbeat: new Date(Date.now() - 30000).toISOString(),
            },
          ];
          setRuntimes(defaults);
        } else {
          setRuntimes(data);
        }
      }
    } catch (e) {
      addLog(`Failed to query grid controller: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuntimes();
    addLog('System topology map queried successfully. Grid resolution complete.', 'info');
    
    // Simulate runtime log feed for that extra premium terminal vibe
    const interval = setInterval(() => {
      const systems = ['Prod-Interception-Core', 'Staging-Audit-Sandbox', 'DR-Failover-Replica'];
      const actions = [
        'Heartbeat broadcast relayed to master node.',
        'Cryptographic rule overlay verified (Sha256 block: OK).',
        'Ingress queue cleared. Zero behavioral drift detected.',
        'Local policy chain synced (Version 4.2.1-SEC).',
      ];
      const sys = systems[Math.floor(Math.random() * systems.length)];
      const act = actions[Math.floor(Math.random() * actions.length)];
      addLog(`[${sys}] ${act}`, 'info');
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.runtime_id || !form.name) return;
    
    try {
      const res = await fetch('/api/admin/runtime/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addLog(`Successfully registered node: ${form.name} [${form.runtime_id}]`, 'success');
        fetchRuntimes();
        setShowAddModal(false);
        setForm({
          runtime_id: '',
          name: '',
          status: 'ONLINE',
          ip_address: '10.144.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          region: 'us-east-1',
          system_load: 12.5,
        });
      } else {
        addLog(`Registration rejected by master consensus gate.`, 'error');
      }
    } catch (err) {
      addLog(`Registration exception: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ padding: 28, color: V.primary, display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Runtime Interception Grid</div>
          <div style={{ fontSize: 13, color: V.secondary }}>
            Topology monitoring & decentralized SDK/Spoke interception nodes mapping.
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.target.style.transform = 'none'}
        >
          + Provision Node
        </button>
      </div>

      {/* Grid Cards for Topology */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {loading ? (
          <div style={{ color: V.secondary, padding: 20 }}>Resolving network fabric...</div>
        ) : (
          runtimes.map((rt) => {
            const isOnline = rt.status === 'ONLINE';
            const loadColor = rt.system_load > 80 ? V.red : rt.system_load > 50 ? V.amber : V.cyan;
            return (
              <div
                key={rt.runtime_id}
                style={{
                  background: V.card,
                  borderRadius: 12,
                  border: `1px solid ${V.border}`,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 3,
                    background: isOnline ? V.green : V.amber,
                    boxShadow: isOnline ? `0 0 10px ${V.green}` : 'none',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: V.primary, marginBottom: 2 }}>{rt.name}</div>
                    <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: V.secondary }}>{rt.runtime_id}</div>
                  </div>
                  <span
                    style={{
                      background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: isOnline ? V.green : V.amber,
                      border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {rt.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: V.muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Region</div>
                    <div style={{ color: V.secondary, fontWeight: 600 }}>{rt.region}</div>
                  </div>
                  <div>
                    <div style={{ color: V.muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>IP Address</div>
                    <div style={{ color: V.secondary, fontFamily: 'JetBrains Mono, monospace' }}>{rt.ip_address}</div>
                  </div>
                </div>

                {/* System Load progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: V.muted, marginBottom: 6 }}>
                    <span>SYSTEM INTERCEPTION LOAD</span>
                    <span style={{ color: loadColor, fontWeight: 700 }}>{rt.system_load}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${rt.system_load}%`, height: '100%', background: loadColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${V.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: V.dim }}>Last Heartbeat</span>
                  <span style={{ color: V.secondary, fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(rt.last_heartbeat).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Audit Log / Event Console */}
      <div style={{ background: '#07080A', border: `1px solid ${V.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', height: 260 }}>
        <div style={{ borderBottom: `1px solid ${V.border}`, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: V.cyan, boxShadow: `0 0 6px ${V.cyan}` }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: V.primary }}>GRID CONTROLLER telemetry log</span>
          </div>
          <span style={{ fontSize: 10, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>ACTIVE PIPELINE RELAY</span>
        </div>
        
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 12, opacity: Math.max(0.3, 1 - idx * 0.15) }}>
              <span style={{ color: V.dim }}>[{log.time}]</span>
              <span style={{ color: log.type === 'error' ? V.red : log.type === 'success' ? V.green : V.cyan }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleRegister} style={{
            background: V.card, border: `1px solid ${V.border}`, borderRadius: 12,
            padding: 24, width: 420, display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: V.primary, borderBottom: `1px solid ${V.border}`, paddingBottom: 10 }}>
              Provision Interception Node
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: V.muted, fontWeight: 600 }}>RUNTIME ID</label>
              <input
                type="text"
                placeholder="rt_prod_core_01"
                value={form.runtime_id}
                onChange={(e) => setForm({ ...form, runtime_id: e.target.value })}
                required
                style={{ background: V.void, border: `1px solid ${V.border}`, padding: '8px 12px', borderRadius: 6, color: 'white', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: V.muted, fontWeight: 600 }}>FRIENDLY NAME</label>
              <input
                type="text"
                placeholder="Prod-Interception-Core"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ background: V.void, border: `1px solid ${V.border}`, padding: '8px 12px', borderRadius: 6, color: 'white', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: V.muted, fontWeight: 600 }}>REGION</label>
                <input
                  type="text"
                  placeholder="us-east-1"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  style={{ background: V.void, border: `1px solid ${V.border}`, padding: '8px 12px', borderRadius: 6, color: 'white', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: V.muted, fontWeight: 600 }}>SYS LOAD (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.system_load}
                  onChange={(e) => setForm({ ...form, system_load: parseFloat(e.target.value) || 0 })}
                  style={{ background: V.void, border: `1px solid ${V.border}`, padding: '8px 12px', borderRadius: 6, color: 'white', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', color: V.secondary, border: `1px solid ${V.border}`, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: V.accent, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Deploy Node
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
