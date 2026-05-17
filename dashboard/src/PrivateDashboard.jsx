import React, { useState, useEffect, useMemo, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';
import TacticalLattice from './components/dashboard/TacticalLattice';

const V = {
  primary: 'var(--text-primary)', secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)', dim: 'var(--text-dim)',
  card: 'var(--bg-card)', surface: 'var(--bg-surface)', void: 'var(--bg-void)',
  border: 'var(--border)', borderLit: 'var(--border-lit)',
  green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)',
  accent: 'var(--accent)', 'accent-soft': 'var(--accent-soft)',
  cyan: 'var(--cyan)', 'cyan-soft': 'var(--cyan-soft)',
};

// --- E-DUX ACTIVATION CEREMONY ---
function HubActivation({ user, token, onActivated }) {
  const [step, setStep] = useState('initial'); // initial, booting, generating, complete
  const [logs, setLogs] = useState([]);
  const [key, setKey] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const bootLogs = [
    "INITIALIZING_SOVEREIGN_RELAY_V5.8...",
    "HANDSHAKE: [HUB_SECURE_LATTICE] ... OK",
    "VERIFYING_CLEARANCE_ID: [" + user?.sub + "] ... VERIFIED",
    "ESTABLISHING_ISOLATED_SPOKE_CHANNEL...",
    "GENERATING_GENESIS_BLOCK_HASH...",
    "AWAITING_OWNER_HANDSHAKE..."
  ];

  useEffect(() => {
    if (step === 'booting') {
      let i = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, bootLogs[i]]);
        i++;
        if (i >= bootLogs.length) {
          clearInterval(interval);
          setTimeout(() => setStep('ready'), 500);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleActivate = async () => {
    setStep('generating');
    try {
      // Setup a timeout controller to prevent infinite hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const res = await fetch(`${endpoints.baseUrl}/api/auth/activate/hub`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (res.ok && (data.status === 'ACTIVATED' || data.status === 'ALREADY_ACTIVE')) {
        setTimeout(() => {
          setKey(data.regional_key || data.key);
          setStep('complete');
        }, 1500); // Small artificial delay for the premium feel
      } else {
        throw new Error(data.detail || "Activation rejected");
      }
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, `CRITICAL_ERROR: ${e.name === 'AbortError' ? 'TIMEOUT' : 'ACTIVATION_FAILED'}`]);
      setStep('ready'); // Fallback to ready instead of initial so they can try again
    }
  };

  // Progress animation state for the generating step
  const [progressMsg, setProgressMsg] = useState("ESTABLISHING_SECURE_TUNNEL...");
  useEffect(() => {
    if (step === 'generating') {
      const messages = [
        "ESTABLISHING_SECURE_TUNNEL...",
        "NEGOTIATING_CRYPTOGRAPHIC_HANDSHAKE...",
        "GENERATING_SPOKE_RSA_KEYPAIR...",
        "ANCHORING_TO_SOVEREIGN_MESH..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setProgressMsg(messages[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: `radial-gradient(circle at 50% 50%, ${V.accent}, transparent)` }} />
      
      <div style={{ width: '100%', maxWidth: 500, padding: 40, position: 'relative' }}>
        
        {step === 'initial' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: V.accent, letterSpacing: '0.4em', marginBottom: 20 }}>SOVEREIGN_HUB_INIT</div>
            <h1 style={{ fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 12 }}>Activate Your Silo</h1>
            <p style={{ fontSize: 13, color: V.muted, lineHeight: 1.6, marginBottom: 32 }}>Your identity has been verified by the Root Admin. You must now activate your Sovereign Hub to generate your unique Spoke handle.</p>
            <button onClick={() => setStep('booting')} style={{ padding: '14px 40px', background: V.accent, border: 'none', color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4 }}>BEGIN_HANDSHAKE</button>
          </div>
        )}

        {(step === 'booting' || step === 'ready') && (
          <div className="fade-in">
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${V.border}`, borderRadius: 8, padding: 24, height: 240, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ fontSize: 11, color: log?.includes('OK') ? V.green : V.muted }}>
                  {">"} {log || "..."}
                </div>
              ))}
              {step === 'ready' && (
                <div className="blink" style={{ marginTop: 20, textAlign: 'center' }}>
                   <button onClick={handleActivate} style={{ padding: '10px 24px', background: 'transparent', border: `1px solid ${V.accent}`, color: V.accent, fontWeight: 700, fontSize: 11, cursor: 'pointer', borderRadius: 4 }}>ACTIVATE_REGIONAL_HUB</button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="fade-in" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: `1px solid ${V.border}`, padding: '40px 20px', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
               <div className="loader-bar" style={{ animationDelay: '0s' }} />
               <div className="loader-bar" style={{ animationDelay: '0.2s' }} />
               <div className="loader-bar" style={{ animationDelay: '0.4s' }} />
            </div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8 }}>ASSEMBLING_SOVEREIGN_KEY</div>
            <div style={{ fontSize: 10, color: V.accent, letterSpacing: '0.05em', height: 14 }}>{progressMsg}</div>
          </div>
        )}

        {step === 'complete' && (
          <div className="scale-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: V.green, letterSpacing: '0.4em', marginBottom: 16 }}>SYSTEM_LIVE</div>
            <h2 style={{ fontSize: 20, color: '#fff', marginBottom: 24 }}>Silo Activated</h2>
            
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: 24, borderRadius: 8, marginBottom: 32 }}>
               <div style={{ fontSize: 9, color: V.green, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>YOUR_SPOKE_HANDLE (REGIONAL_KEY)</div>
               <div style={{ fontSize: 14, color: '#fff', fontFamily: 'JetBrains Mono', wordBreak: 'break-all', marginBottom: 20 }}>{key}</div>
               <button onClick={() => { navigator.clipboard.writeText(key); setIsCopied(true); }} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, borderRadius: 4, cursor: 'pointer' }}>
                 {isCopied ? 'COPIED_TO_CLIPBOARD' : 'COPY_KEY'}
               </button>
            </div>

            <div style={{ fontSize: 11, color: V.amber, marginBottom: 24 }}>⚠️ Store this key securely. It is the only handle to your Sovereign Spoke.</div>
            
            <button onClick={() => window.location.reload()} style={{ padding: '14px 40px', background: V.accent, border: 'none', color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4 }}>ENTER_GOVERNANCE_PORTAL</button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0.5; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fade-in { animation: fadeIn 0.8s ease-out; }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .blink { animation: blink 1.5s infinite; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .loader-bar { width: 4px; height: 24px; background: ${V.accent}; border-radius: 2px; animation: bounce 1s ease-in-out infinite; }
        @keyframes bounce { 0%, 100% { transform: scaleY(0.5); opacity: 0.5; } 50% { transform: scaleY(1.5); opacity: 1; } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub, color, colorClass }) {
  // Dynamically scale font size for long cryptographic keys so they don't break the sleek layout
  const isLong = typeof value === 'string' && value.length > 15;
  const valueSize = isLong ? 18 : 32;
  
  return (
    <div className={`stat-card ${colorClass}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px', minHeight: 110 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{label}</div>
        <div style={{ fontSize: valueSize, fontWeight: 700, color, lineHeight: 1.2, marginBottom: 12, wordBreak: 'break-all' }}>{value}</div>
      </div>
      <div style={{ fontSize: 11, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>
    </div>
  );
}

const Icon = {
  overview: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  lattice:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>,
  vault:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
  audit:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>,
  logout:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>,
};

class DashboardErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', background: V.void, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'JetBrains Mono, monospace' }}>
          <div style={{ fontSize: 11, color: V.red, letterSpacing: '0.2em', fontWeight: 700 }}>DASHBOARD_CRITICAL_FAILURE</div>
          <div style={{ fontSize: 10, color: V.muted, maxWidth: 400, textAlign: 'center' }}>{this.state.error?.message}</div>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: V.red, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em' }}>RELOAD_SYSTEM</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardInner() {
  const { user, token } = useAuth();
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const hubsRes = await fetch(`${endpoints.baseUrl}/api/auth/hubs`, { headers });
        if (hubsRes.ok) setHubs(await hubsRes.json());
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return (
    <div style={{ height: '100vh', background: V.void, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.05)', borderTopColor: V.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: 9, letterSpacing: '0.4em', color: V.muted, textTransform: 'uppercase' }}>Synchronizing Sovereign Mesh</div>
    </div>
  );

  // INTERCEPT: If Hub is not active, force the Ceremony
  if (user?.role === 'owner' && !user?.hub_active) {
    return <HubActivation user={user} token={token} />;
  }

  const orgId = user?.org_id || 'PENDING_ORG';
  const clearanceId = user?.sub || 'PENDING_ID';
  const hubId = user?.hub_id || 'PENDING_HUB';
  const regionalKey = user?.regional_key || 'UNSET';

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
         <StatCard label="Spoke Node Handle" value={regionalKey} sub="REGIONAL_ACTIVATION_KEY" color={V.accent} colorClass="accent" />
         <StatCard label="Active Hub Identity" value={hubId} sub="SOVEREIGN_UNIT_ENUM" color={V.accent} colorClass="accent" />
         <StatCard label="Integrity Score" value="100%" sub="MESH_CONSENSUS" color={V.green} colorClass="green" />
         <StatCard label="Access Level" value={user?.role?.toUpperCase()} sub="GATEKEEPER_STATUS" color={V.amber} colorClass="amber" />
      </div>

      {/* Main Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>
        <div className="ra-card" style={{ height: 500, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: V.accent, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Silo Lattice Mesh</div>
            <div style={{ fontSize: 10, color: V.muted, marginTop: 4 }}>REAL_TIME_HUB_TELEMETRY</div>
          </div>
          <div style={{ width: '100%', height: '100%', padding: '20px' }}>
            <TacticalLattice projects={hubs} department={user?.department} />
          </div>
        </div>
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <div style={{ padding: '16px 20px', borderBottom: `1px solid ${V.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ fontSize: 15, fontWeight: 600, color: V.primary }}>Violation Ticker</div>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: V.red, animation: 'pulse 2s infinite' }} />
           </div>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', opacity: 0.15, paddingTop: 100 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 64, height: 64, marginBottom: 16 }}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase' }}>No Hub Breaches</div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function PrivateDashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardInner />
    </DashboardErrorBoundary>
  );
}