import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Styles ── */
const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid #1f2d3d',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  color: '#f1f5f9',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{
        fontSize: 11, fontWeight: 600,
        color: '#64748b', letterSpacing: '0.1em',
        textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
      }}>{label}</label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [entityId, setEntityId] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [totp, setTotp] = useState('')
  const [stage, setStage] = useState('identify')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [intentToken, setIntentToken] = useState(null)
  const [focused, setFocused] = useState(null)

  const focusStyle = (field) => ({
    borderColor: focused === field ? '#f59e0b' : '#1f2d3d',
    boxShadow: focused === field ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
  })

  const handleIdentify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/auth/oversight/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: 'REGULATOR_NODE', email, org_id: entityId, jurisdiction })
      })
      const data = await res.json()
      if (res.ok) { setIntentToken(data.intent_token); setStage('verify') }
      else setError(data.detail || 'Identity not recognized by Hub')
    } catch {
      setError('Hub connection timeout — check network.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/auth/oversight/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, org_id: entityId, totp_code: totp, intent_token: intentToken })
      })
      const data = await res.json()
      if (res.ok) { localStorage.setItem('anchor_token', data.access_token); navigate('/dashboard') }
      else setError(data.detail || 'Verification failed')
    } catch {
      setError('Security handshake failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#070710',
      display: 'flex', fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Injected keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes scanH { from { transform: translateY(-100%); opacity: 0; } 50% { opacity: 0.3; } to { transform: translateY(100vh); opacity: 0; } }
        .scan-beam { animation: scanH 5s linear infinite; }
        body { margin: 0; }
      `}</style>

      {/* Grid + ambient bg */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.05) 0%, transparent 55%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
        {/* Scan beam */}
        <div className="scan-beam" style={{
          position: 'absolute', left: 0, right: 0, top: 0,
          height: 2, background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
        }} />
      </div>

      {/* ── Left briefing panel ── */}
      <div style={{
        width: 400, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 40px',
        borderRight: '1px solid #111827',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, background: '#f59e0b', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 20 20" fill="#1c1200" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Anchor Oversight</div>
              <div style={{ fontSize: 11, color: '#f59e0b', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>REGULATORY PORTAL</div>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 16 }}>
              Cryptographic<br />
              <span style={{ color: '#f59e0b' }}>Audit Ledger</span><br />
              Access
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
              Secure clearance portal for regulatory officials and authorized auditors. All sessions are cryptographically logged.
            </p>
          </div>

          {/* Authority info blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Authorized Regulators', value: 'SEC / FCA / RBI / SEBI / EU-AI / CFPB' },
              { label: 'Session Security', value: 'TOTP + Cryptographic Intent Token' },
              { label: 'Evidence Standard', value: 'Tamper-evident audit chain (SHA-256)' },
              { label: 'Data Visibility', value: 'Jurisdictional scope — no cross-border' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)',
              }}>
                <div style={{ fontSize: 10, color: '#78716c', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#d1d5db', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer status */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#f59e0b',
              boxShadow: '0 0 6px #f59e0b',
            }} />
            <span style={{ fontSize: 11, color: '#f59e0b', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
              REGULATORY RELAY ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>
            oversight.anchorgovernance.tech
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Stage indicator */}
          <div style={{ marginBottom: 28, display: 'flex', gap: 8 }}>
            {['identify', 'verify'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: stage === s || (s === 'identify' && stage === 'verify') ? '#f59e0b' : 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  fontSize: 11, fontWeight: 700,
                  color: stage === s || (s === 'identify' && stage === 'verify') ? '#1c1200' : '#78716c',
                }}>
                  {s === 'identify' && stage === 'verify' ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: stage === s ? '#f59e0b' : '#4b5563',
                }}>
                  {s === 'identify' ? 'Identity Challenge' : 'TOTP Verification'}
                </span>
                {i === 0 && <div style={{ width: 32, height: 1, background: '#1f2937' }} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 13, lineHeight: 1.5,
            }}>
              ✗ {error}
            </div>
          )}

          {/* ── Stage 1: Identify ── */}
          {stage === 'identify' && (
            <form onSubmit={handleIdentify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Authority Identification</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Present your regulatory credentials to proceed.</div>
              </div>

              <Field label="Entity / Agency ID">
                <input required type="text" value={entityId}
                  onChange={e => setEntityId(e.target.value)}
                  placeholder="e.g. sec-johndoe-2604"
                  style={{ ...inputStyle, ...focusStyle('entity'), fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}
                  onFocus={() => setFocused('entity')} onBlur={() => setFocused(null)}
                />
              </Field>

              <Field label="Official Email">
                <input required type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="auditor@regulator.gov"
                  style={{ ...inputStyle, ...focusStyle('email') }}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                />
              </Field>

              <Field label="Jurisdiction">
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                  style={{ ...inputStyle, ...focusStyle('jx'), appearance: 'none', cursor: 'pointer' }}
                  onFocus={() => setFocused('jx')} onBlur={() => setFocused(null)}
                >
                  <option value="">Select Jurisdiction</option>
                  <option value="US">United States (SEC / CFPB)</option>
                  <option value="UK">United Kingdom (FCA)</option>
                  <option value="IN">India (RBI / SEBI)</option>
                  <option value="EU">European Union (EU AI Act)</option>
                  <option value="SG">Singapore (MAS)</option>
                </select>
              </Field>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 8, fontSize: 14,
                fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: '#f59e0b', color: '#1c1200', opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.15s', letterSpacing: '0.03em',
              }}>
                {loading ? 'Verifying Authority...' : 'Initiate Security Handshake →'}
              </button>
            </form>
          )}

          {/* ── Stage 2: Verify ── */}
          {stage === 'verify' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Cryptographic TOTP</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Enter the 6-digit code from your authenticator app.</div>
              </div>

              {/* Confirmed identity badge */}
              <div style={{
                padding: '16px 20px', borderRadius: 8,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <div style={{ fontSize: 10, color: '#d97706', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>Agency Identified</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace' }}>{entityId.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>{email}</div>
              </div>

              {/* Large TOTP input */}
              <input required type="text" maxLength={6} value={totp}
                onChange={e => setTotp(e.target.value)} autoFocus
                placeholder="000000"
                style={{
                  ...inputStyle, textAlign: 'center', fontSize: 40, letterSpacing: '0.5em',
                  fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b',
                  borderColor: totp.length === 6 ? '#f59e0b' : focused === 'totp' ? '#f59e0b' : '#1f2d3d',
                  boxShadow: totp.length === 6 ? '0 0 0 3px rgba(245,158,11,0.12)' : 'none',
                  padding: '20px 16px',
                }}
                onFocus={() => setFocused('totp')} onBlur={() => setFocused(null)}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setStage('identify'); setTotp(''); setError(''); }} style={{
                  flex: 1, padding: '13px', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, border: '1px solid #1f2937', cursor: 'pointer',
                  background: 'transparent', color: '#64748b',
                }}>
                  ← Back
                </button>
                <button type="submit" disabled={totp.length < 6 || loading} style={{
                  flex: 2, padding: '13px', borderRadius: 8, fontSize: 14,
                  fontWeight: 700, border: 'none',
                  cursor: (totp.length < 6 || loading) ? 'not-allowed' : 'pointer',
                  background: totp.length === 6 && !loading ? '#f59e0b' : 'rgba(245,158,11,0.15)',
                  color: totp.length === 6 && !loading ? '#1c1200' : '#78716c',
                  transition: 'all 0.15s',
                }}>
                  {loading ? 'Establishing Access...' : 'Finalize Clearance →'}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#374151' }}>
            Enforcement Priority: 01 · All access is logged and auditable
          </div>
        </div>
      </div>
    </div>
  )
}
