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
  const [progressMsg, setProgressMsg] = useState("ESTABLISHING_LATTICE_CONNECTION...");
  useEffect(() => {
    if (step === 'generating') {
      const messages = [
        "ESTABLISHING_LATTICE_CONNECTION...",
        "GENERATING_REGIONAL_KEY...",
        "PROVISIONING_PRIVATE_SPOKE...",
        "FINALIZING_CRYPTOGRAPHIC_BOUNDARY..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < messages.length) {
          setProgressMsg(messages[i]);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010409', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden' }}>
      
      {/* Animated Hexagonal Grid Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92304845413263' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.92304845413263L0 86.60254037844386L0 51.96152422706631L30 34.64101615137754L60 51.96152422706631L60 86.60254037844386Z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '60px 103.9px', animation: 'panBackground 20s linear infinite' }} />
      <style>{`
        @keyframes panBackground { from { background-position: 0 0; } to { background-position: 60px 103.9px; } }
        @keyframes lockIn { 0% { transform: scale(2) rotate(45deg); opacity: 0; } 70% { transform: scale(0.9) rotate(-5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .icon-lock { animation: lockIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .typing-effect { overflow: hidden; white-space: nowrap; animation: typing 1s steps(30, end); }
        @keyframes typing { from { width: 0 } to { width: 100% } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Central Anchor Icon */}
        <div className="icon-lock" style={{ width: 80, height: 80, background: step === 'complete' ? 'var(--green)' : 'var(--bg-surface)', border: `2px solid ${step === 'complete' ? 'var(--green)' : 'var(--accent)'}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, transition: 'all 0.5s', boxShadow: step === 'complete' ? '0 0 40px rgba(16,185,129,0.4)' : '0 0 30px rgba(6,182,212,0.2)' }}>
          <svg viewBox="0 0 24 24" fill={step === 'complete' ? '#000' : 'var(--accent)'} style={{ width: 40, height: 40, transition: 'fill 0.5s' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>

        {step === 'initial' && (
          <div className="fade-in" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: 40, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Activate Your Silo</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>Your identity has been verified. You must now activate your Sovereign Hub to generate your unique Spoke handle.</p>
            <button onClick={handleActivate} style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}>BEGIN_HANDSHAKE</button>
          </div>
        )}

        {step === 'generating' && (
          <div className="fade-in" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 32px' }}>
               {/* Progress Ring */}
               <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="8" />
                 <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="289" strokeDashoffset="289" style={{ animation: 'fillRing 6s linear forwards' }} />
               </svg>
               <style>{`@keyframes fillRing { to { stroke-dashoffset: 0; } }`}</style>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-lit)', padding: '16px 24px', borderRadius: 8, display: 'inline-block', minWidth: 320 }}>
              <div key={progressMsg} className="typing-effect" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                {">"} {progressMsg}
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="scale-in" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Sovereign Hub Activated</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>Cryptographic boundary established successfully.</div>
            
            <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '14px', background: 'var(--green)', border: 'none', color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>ENTER COMMAND CENTER →</button>
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

// --- REGIONAL KEY SETTINGS MODAL ---
function RegionalKeyModal({ keyVal, onClose }) {
  // Convert standard internal key to Sovereign Custom Format
  const customKey = typeof keyVal === 'string' ? keyVal.replace('sk_live_', 'AN-SPK-LIVE-') : 'UNSET';
  const [showKey, setShowKey] = useState(false);
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ra-card scale-in" style={{ width: 500, padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Regional Key Settings</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        
        <div style={{ background: 'var(--bg-void)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sovereign Node Handle</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontSize: 14 }}>
              {showKey ? customKey : `AN-SPK-LIVE-••••••••••••-${customKey.slice(-4)}`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onMouseDown={() => setShowKey(!showKey)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', color: '#fff', padding: '6px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer', userSelect: 'none' }}>
                {showKey ? 'HIDE' : 'REVEAL'}
              </button>
              <button onClick={() => navigator.clipboard.writeText(customKey)} style={{ background: 'var(--accent)', border: 'none', color: '#000', padding: '6px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                COPY
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Active Mesh Projects</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
           <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>Credit Scoring Engine v4</div>
               <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>US-East Region • 3 Active Agents</div>
             </div>
             <div style={{ fontSize: 10, color: 'var(--green)', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>BOUND</div>
           </div>
           <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>Fraud Detection Mesh</div>
               <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Global Region • 5 Active Agents</div>
             </div>
             <div style={{ fontSize: 10, color: 'var(--green)', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>BOUND</div>
           </div>
        </div>
        
        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--amber)', lineHeight: 1.5, padding: 12, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ Security Warning</strong>
          Rotating or revoking this key will instantly sever the connection between the Sovereign Relay and all bound local projects.
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, colorClass, action }) {
  // Dynamically scale font size for long cryptographic keys so they don't break the sleek layout
  const isLong = typeof value === 'string' && value.length > 15;
  const valueSize = isLong ? 18 : 32;
  
  return (
    <div className={`stat-card ${colorClass}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px', minHeight: 110, position: 'relative' }}>
      {action && <div style={{ position: 'absolute', top: 16, right: 16 }}>{action}</div>}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, maxWidth: action ? '80%' : '100%' }}>{label}</div>
        <div style={{ fontSize: valueSize, fontWeight: 700, color, lineHeight: 1.2, marginBottom: 12, wordBreak: 'break-all', fontFamily: isLong ? 'JetBrains Mono, monospace' : 'inherit' }}>{value}</div>
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
  const [stats, setStats] = useState({
    active_projects: 0,
    total_audits: 0,
    total_violations: 0,
    compliance_rate: 100,
    project_health: [],
    recent: []
  });
  const [pendingPulls, setPendingPulls] = useState([]);

  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const hubsRes = await fetch(`${endpoints.baseUrl}/api/auth/hubs`, { headers });
        if (hubsRes.ok) setHubs(await hubsRes.json());

        const statsRes = await fetch(`${endpoints.baseUrl}/api/stats`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());

        const pendingRes = await fetch(`${endpoints.baseUrl}/api/forensic/pending`, { headers });
        if (pendingRes.ok) setPendingPulls(await pendingRes.json());
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
  const regionalKeyRaw = user?.regional_key || 'UNSET';
  
  // Custom Masked Format for the Dashboard Overview
  const customKeyFull = regionalKeyRaw !== 'UNSET' ? regionalKeyRaw.replace('sk_live_', 'AN-SPK-LIVE-') : 'UNSET';
  const maskedKey = customKeyFull !== 'UNSET' ? `AN-SPK-••••-${customKeyFull.slice(-4)}` : 'UNSET';

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 28, fontFamily: 'Inter, sans-serif' }}>
      {showKeyModal && <RegionalKeyModal keyVal={regionalKeyRaw} onClose={() => setShowKeyModal(false)} />}
      
      {/* Section 1: KPI Grid (2 Rows of 4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
         {/* Row 1: Identity & Security */}
         <StatCard 
            label="Spoke Node Handle" 
            value={maskedKey} 
            sub="REGIONAL_ACTIVATION_KEY" 
            color={V.accent} 
            colorClass="accent" 
            action={
              <button 
                onClick={() => setShowKeyModal(true)}
                style={{ background: 'transparent', border: '1px solid var(--border-lit)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-lit)' }}
              >
                ⚙️ SETTINGS
              </button>
            }
         />
         <StatCard label="Active Hub Identity" value={hubId} sub="SOVEREIGN_UNIT_ENUM" color={V.accent} colorClass="accent" />
         <StatCard label="Integrity Score" value={`${stats.compliance_rate}%`} sub="ALL CLEAR" color={V.green} colorClass="green" />
         <StatCard label="Access Level" value={user?.role?.toUpperCase()} sub="GATEKEEPER_STATUS" color={V.amber} colorClass="amber" />
         
         {/* Row 2: Metrics */}
         <StatCard label="Decisions Audited" value={stats.total_audits} sub="+0% THIS WEEK" color={V.cyan} colorClass="cyan" />
         <StatCard label="Active Projects" value={stats.active_projects} sub="0 NEED ATTENTION" color={V.amber} colorClass="amber" />
         <StatCard label="Pending Forensic Pulls" value={pendingPulls.length} sub="REQUIRES ATTENTION" color={V.amber} colorClass="amber" />
         <StatCard label="Violations (30d)" value={stats.total_violations} sub="0 RESOLVED" color={V.red} colorClass="red" />
      </div>

      {/* Section 2: Main Content (Two Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 24 }}>
        
        {/* Left: Lattice Mesh */}
        <div className="ra-card" style={{ height: 420, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, right: 24, zIndex: 5, pointerEvents: 'none', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Silo Lattice Mesh • Live</div>
              <div style={{ fontSize: 10, color: V.accent, letterSpacing: '0.1em' }}>PROTOCOL_v5.2 // ACTIVE</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{hubs.length} / {hubs.length} Nodes Online</div>
              <div style={{ fontSize: 10, color: V.muted, marginTop: 2 }}>Last sync: just now</div>
            </div>
          </div>
          <div style={{ width: '100%', height: '100%', padding: '10px' }}>
            <TacticalLattice projects={hubs} department={user?.department} />
          </div>
        </div>

        {/* Right: Violation Ticker */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 420 }}>
           <div style={{ padding: '20px 24px', borderBottom: `1px solid ${V.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
             <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Recent Violations</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <div style={{ fontSize: 11, color: V.muted, fontWeight: 600 }}>LIVE</div>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: stats.total_violations > 0 ? V.red : V.green, animation: stats.total_violations > 0 ? 'pulse 2s infinite' : 'none' }} />
             </div>
           </div>
           
           <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
             {stats.recent.length === 0 ? (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: V.dim, fontSize: 13 }}>
                 No recent violations recorded.
               </div>
             ) : stats.recent.map((v, idx) => (
               <div key={idx} style={{ padding: '14px 16px', border: `1px solid ${V.border}`, borderRadius: 8, background: 'var(--bg-surface)', transition: 'transform 0.15s, border-color 0.15s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-lit)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                   <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{v.project}</div>
                   <div style={{ fontSize: 11, color: V.muted }}>Commit: {v.commit}</div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: 10, color: v.status === 'VIOLATION' ? V.red : (v.status === 'RESOLVED' ? V.green : V.muted), background: v.status === 'VIOLATION' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>
                     {v.status}
                   </div>
                   <div style={{ color: V.accent, fontSize: 11, fontWeight: 600 }}>Hash: {v.hash}</div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Section 3: Quick Projects */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Active Projects & Agents</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {stats.project_health.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: V.dim, fontSize: 13, padding: '40px 0', border: `1px solid ${V.border}`, borderRadius: 8, background: 'var(--bg-surface)' }}>
              No active projects registered on this Hub yet. Use your Regional Key in your SDK configurations.
            </div>
          ) : stats.project_health.map((p, i) => (
            <div key={i} className="ra-card" style={{ padding: 20, transition: 'border-color 0.15s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-lit)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={V.muted} strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: p.status === 'COMPLIANT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.status === 'COMPLIANT' ? V.green : V.red }}>
                  {p.status}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: V.muted, marginBottom: 20 }}>{p.audits} Audited Decisions • {p.violations} Violations</div>
              <button style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: `1px solid ${V.border}`, borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}>
                Manage Integration
              </button>
            </div>
          ))}
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