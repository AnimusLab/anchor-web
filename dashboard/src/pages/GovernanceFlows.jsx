import React, { useState } from 'react';

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

export default function GovernanceFlows() {
  const [activeStep, setActiveStep] = useState(0);

  const flows = [
    {
      title: '1. Runtime Interception Sequence',
      description: 'Captures raw downstream transaction execution vectors asynchronously, verifying integrity via the local Spoke overlay.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes pulseLine {
              0% { stroke-dashoffset: 24; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes bounceNode {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .pulse-path { stroke-dasharray: 8, 4; animation: pulseLine 2s linear infinite; }
            .glow-node { transform-origin: center; animation: bounceNode 3s ease-in-out infinite; }
          `}</style>
          {/* Grid lines */}
          <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Connection Lines */}
          <path d="M 60 90 L 200 90" stroke={V.cyan} strokeWidth="2" className="pulse-path" />
          <path d="M 200 90 L 340 90" stroke={V.green} strokeWidth="2" className="pulse-path" />

          {/* Spoke node (Interception point) */}
          <circle cx="200" cy="90" r="28" fill="#111827" stroke={V.cyan} strokeWidth="3" className="glow-node" />
          <circle cx="200" cy="90" r="18" fill="rgba(6,182,212,0.1)" />
          <text x="200" y="94" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">SPOKE</text>

          {/* Source node */}
          <rect x="20" y="70" width="80" height="40" rx="6" fill="#1F2937" stroke={V.border} strokeWidth="1.5" />
          <text x="60" y="94" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">Runtime</text>

          {/* Destination */}
          <rect x="300" y="70" width="80" height="40" rx="6" fill="#1F2937" stroke={V.border} strokeWidth="1.5" />
          <text x="340" y="94" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">Execution</text>

          {/* Info Labels */}
          <text x="200" y="30" fill={V.cyan} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">INLINE INTERCEPTION GATE</text>
          <text x="130" y="115" fill={V.secondary} fontSize="9" textAnchor="middle" fontFamily="sans-serif">1. Intercept Payload</text>
          <text x="270" y="115" fill={V.green} fontSize="9" textAnchor="middle" fontFamily="sans-serif">2. Safe Relayed</text>
        </svg>
      ),
    },
    {
      title: '2. Behavioral Drift Dial',
      description: 'Compares real-time model output distributions against established organizational policy thresholds to flag semantic drift.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes swingNeedle {
              0%, 100% { transform: rotate(-30deg); }
              50% { transform: rotate(45deg); }
            }
            .needle { transform-origin: 200px 140px; animation: swingNeedle 6s ease-in-out infinite; }
          `}</style>
          {/* Dial Arc */}
          <path d="M 100 140 A 100 100 0 0 1 300 140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" strokeLinecap="round" />
          {/* Warning Arc */}
          <path d="M 240 50 A 100 100 0 0 1 300 140" fill="none" stroke={V.amber} strokeWidth="16" strokeLinecap="round" opacity="0.4" />
          {/* Alert Arc */}
          <path d="M 275 69 A 100 100 0 0 1 300 140" fill="none" stroke={V.red} strokeWidth="16" strokeLinecap="round" />

          {/* Dial center pin */}
          <circle cx="200" cy="140" r="10" fill="#1F2937" stroke={V.border} strokeWidth="2" />
          <circle cx="200" cy="140" r="4" fill={V.cyan} />

          {/* Needle */}
          <line x1="200" y1="140" x2="200" y2="60" stroke={V.cyan} strokeWidth="4" strokeLinecap="round" className="needle" />

          <text x="200" y="30" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">SEMANTIC DRIFT INDEX</text>
          <text x="120" y="160" fill={V.green} fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">SAFE</text>
          <text x="200" y="160" fill={V.amber} fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">DRIFTING</text>
          <text x="280" y="160" fill={V.red} fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">CRITICAL</text>
        </svg>
      ),
    },
    {
      title: '3. Cryptographic Hashing Chain',
      description: 'Every local spoke transaction hashes context sequentially, locking the audit log so no record can be backdated or pruned.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes chainFlow {
              0% { stroke-dashoffset: 30; }
              100% { stroke-dashoffset: 0; }
            }
            .chain-link { stroke-dasharray: 6, 3; animation: chainFlow 3s linear infinite; }
          `}</style>
          {/* Block 1 */}
          <rect x="30" y="60" width="80" height="60" rx="8" fill="#111827" stroke={V.cyan} strokeWidth="2" />
          <text x="70" y="85" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">BLOCK #01</text>
          <text x="70" y="105" fill={V.cyan} fontSize="9" fontFamily="monospace" textAnchor="middle">0x8a3c...d9f</text>

          {/* Connection */}
          <path d="M 110 90 L 160 90" stroke={V.cyan} strokeWidth="2" className="chain-link" />

          {/* Block 2 */}
          <rect x="160" y="60" width="80" height="60" rx="8" fill="#111827" stroke={V.green} strokeWidth="2" />
          <text x="200" y="85" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">BLOCK #02</text>
          <text x="200" y="105" fill={V.green} fontSize="9" fontFamily="monospace" textAnchor="middle">0x12b4...8ef</text>

          {/* Connection */}
          <path d="M 240 90 L 290 90" stroke={V.green} strokeWidth="2" className="chain-link" />

          {/* Block 3 */}
          <rect x="290" y="60" width="80" height="60" rx="8" fill="#111827" stroke={V.amber} strokeWidth="2" />
          <text x="330" y="85" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">BLOCK #03</text>
          <text x="330" y="105" fill={V.amber} fontSize="9" fontFamily="monospace" textAnchor="middle">0xf9a3...44b</text>

          <text x="200" y="30" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">DECENTRALIZED ANCHOR CHAIN</text>
        </svg>
      ),
    },
    {
      title: '4. Forensic pull & Transient token',
      description: 'Brokers single-use, 5-minute transient tokens generated by the Hub and signed with regional keys to access raw payloads.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes floatToken {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(3deg); }
            }
            .token-card { transform-origin: center; animation: floatToken 4s ease-in-out infinite; }
          `}</style>
          {/* Keycard Token layout */}
          <g className="token-card">
            <rect x="110" y="40" width="180" height="100" rx="10" fill="#1F2937" stroke={V.amber} strokeWidth="2.5" />
            <rect x="125" y="55" width="28" height="20" rx="3" fill="#F59E0B" opacity="0.8" />
            <text x="165" y="69" fill="white" fontSize="11" fontWeight="700" fontFamily="monospace">TRANSIENT KEY</text>
            <text x="130" y="100" fill={V.amber} fontSize="10" fontFamily="monospace">TTL: 299s (5-MIN)</text>
            <text x="130" y="118" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">ID: pull_req_729a</text>
            <circle cx="260" cy="90" r="14" fill="rgba(245,158,11,0.15)" stroke={V.amber} strokeWidth="1.5" />
            <path d="M 256 90 L 264 90" stroke={V.amber} strokeWidth="2" />
            <path d="M 260 86 L 260 94" stroke={V.amber} strokeWidth="2" />
          </g>
          <text x="200" y="24" fill={V.amber} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">SINGLE-USE SECURE HANDSHAKE</text>
        </svg>
      ),
    },
    {
      title: '5. WSS Sovereign Relay',
      description: 'Persistent duplex WebSocket relay tunnels metadata securely while excluding raw prompt payloads from the central control plane ledger.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes flowLeftRight {
              0% { stroke-dashoffset: 40; }
              100% { stroke-dashoffset: 0; }
            }
            .flow-line { stroke-dasharray: 10, 5; animation: flowLeftRight 4s linear infinite; }
          `}</style>
          {/* Left Spoke */}
          <rect x="30" y="60" width="90" height="50" rx="6" fill="#111827" stroke={V.border} strokeWidth="1.5" />
          <text x="75" y="85" fill="white" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Enterprise Spoke</text>
          <text x="75" y="98" fill={V.cyan} fontSize="9" fontFamily="monospace" textAnchor="middle">Local Storage</text>

          {/* Secure Tunnel */}
          <path d="M 120 85 L 280 85" stroke={V.cyan} strokeWidth="2" className="flow-line" />
          <text x="200" y="75" fill="white" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">WSS TECTONIC TUNNEL</text>

          {/* Right Hub */}
          <rect x="280" y="60" width="90" height="50" rx="6" fill="#111827" stroke={V.border} strokeWidth="1.5" />
          <text x="325" y="85" fill="white" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Anchor Hub</text>
          <text x="325" y="98" fill={V.green} fontSize="9" fontFamily="monospace" textAnchor="middle">Metadata Ledger</text>

          <text x="200" y="30" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">SOVEREIGN FORENSIC DECOUPLING</text>
        </svg>
      ),
    },
    {
      title: '6. Global CISOs Mesh Topology',
      description: 'Distributed ledger configuration allowing master regulators, regional compliance officers, and internal CISOs partitioned oversight access.',
      svg: (
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', background: '#080C14', borderRadius: 8 }}>
          <style>{`
            @keyframes pulseMesh {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.8; }
            }
            .mesh-link { animation: pulseMesh 3s ease-in-out infinite; }
          `}</style>
          {/* Nodes */}
          <circle cx="200" cy="90" r="16" fill="#111827" stroke={V.cyan} strokeWidth="2" />
          <text x="200" y="125" fill="white" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">Master CISO Hub</text>

          <circle cx="80" cy="50" r="12" fill="#111827" stroke={V.green} strokeWidth="1.5" />
          <text x="80" y="78" fill="white" fontSize="9" textAnchor="middle" fontFamily="sans-serif">US-East Node</text>

          <circle cx="320" cy="50" r="12" fill="#111827" stroke={V.green} strokeWidth="1.5" />
          <text x="320" y="78" fill="white" fontSize="9" textAnchor="middle" fontFamily="sans-serif">EU-West Node</text>

          <circle cx="120" cy="140" r="10" fill="#111827" stroke={V.amber} strokeWidth="1.5" />
          <circle cx="280" cy="140" r="10" fill="#111827" stroke={V.amber} strokeWidth="1.5" />

          {/* Intersections */}
          <line x1="200" y1="90" x2="80" y2="50" stroke={V.cyan} strokeWidth="1.5" className="mesh-link" />
          <line x1="200" y1="90" x2="320" y2="50" stroke={V.cyan} strokeWidth="1.5" className="mesh-link" />
          <line x1="200" y1="90" x2="120" y2="140" stroke={V.cyan} strokeWidth="1.5" className="mesh-link" />
          <line x1="200" y1="90" x2="280" y2="140" stroke={V.cyan} strokeWidth="1.5" className="mesh-link" />
          <line x1="80" y1="50" x2="320" y2="50" stroke={V.green} strokeWidth="1" strokeDasharray="3,3" />

          <text x="200" y="24" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">DECENTRALIZED REGULATORY GRID</text>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ padding: 28, color: V.primary, display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Governance Flow Architectures</div>
        <div style={{ fontSize: 13, color: V.secondary }}>
          Explore interactive, high-fidelity visual diagrams detailing the decentralized coordination layers.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {flows.map((flow, index) => (
          <div
            key={index}
            style={{
              background: V.card,
              border: `1px solid ${V.border}`,
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: V.primary, marginBottom: 4 }}>{flow.title}</div>
              <div style={{ fontSize: 12, color: V.secondary, lineHeight: '1.4' }}>{flow.description}</div>
            </div>

            <div style={{ flex: 1, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {flow.svg}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
