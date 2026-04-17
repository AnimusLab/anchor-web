import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────
   Anchor Oversight — Regulatory Login Portal
   Updated to use /api/oversight/login (single-step TOTP flow)
   Backend: oversight_auth.py → OversightLoginRequest
   ───────────────────────────────────────────────────────────── */

const API_BASE = import.meta.env.VITE_API_URL || 'https://animuslab-anchor-api.hf.space'

const TOKEN = {
  bg:     '#070710',
  card:   '#0c0c18',
  border: '#1a1f2e',
  amber:  '#f59e0b',
  amberL: '#fbbf24',
  amberD: 'rgba(245,158,11,0.08)',
  red:    '#ef4444',
  green:  '#10b981',
  txt:    '#f1f5f9',
  txtS:   '#94a3b8',
  txtD:   '#374151',
  mono:   "'JetBrains Mono', 'DM Mono', monospace",
  sans:   "'Inter', sans-serif",
}

const iBase = {
  width: '100%',
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid #1a1f2e',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  color: TOKEN.txt,
  fontFamily: TOKEN.sans,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: TOKEN.txtD,
        letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: TOKEN.sans,
      }}>{label}</label>
      {children}
    </div>
  )
}

function Dot({ color = TOKEN.amber, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}` }} />
      <span style={{ fontSize: 11, fontFamily: TOKEN.mono, color, letterSpacing: '0.08em' }}>{label}</span>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ entityId: '', email: '', jurisdiction: '', totp: '' })
  const [stage, setStage] = useState('identify')   // 'identify' | 'verify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const f = (field) => ({
    ...iBase,
    borderColor: focused === field ? TOKEN.amber : TOKEN.border,
    boxShadow: focused === field ? `0 0 0 3px rgba(245,158,11,0.1)` : 'none',
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const fo = (k) => () => setFocused(k)
  const bl =  () => setFocused(null)

  /* ── Stage 1: store locally and move to TOTP entry ── */
  const handleIdentify = (e) => {
    e.preventDefault()
    if (!form.entityId || !form.email || !form.jurisdiction) return
    setError('')
    setStage('verify')
  }

  /* ── Stage 2: POST to /api/oversight/login (combined) ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/oversight/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id:    form.entityId.trim().toUpperCase(),
          jurisdiction: form.jurisdiction.trim().toUpperCase(),
          email:        form.email.trim().toLowerCase(),
          totp_code:    form.totp.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.access_token) {
        localStorage.setItem('anchor_token', data.access_token)
        localStorage.setItem('anchor_entity', data.entity_id)
        localStorage.setItem('anchor_regulator', data.regulator)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'Verification failed — check your credentials.')
      }
    } catch {
      setError('Connection to Anchor Relay failed. Please check network.')
    } finally {
      setLoading(false)
    }
  }

  const JURISDICTIONS = [
    { value: 'US',  label: 'United States  (SEC / CFPB / NIST)' },
    { value: 'IN',  label: 'India  (RBI / SEBI)' },
    { value: 'UK',  label: 'United Kingdom  (FCA)' },
    { value: 'EU',  label: 'European Union  (EU AI Act)' },
    { value: 'SG',  label: 'Singapore  (MAS)' },
    { value: 'GLO', label: 'Global  (FINOS / OWASP / NIST)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: TOKEN.bg, display: 'flex', fontFamily: TOKEN.sans, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${TOKEN.bg}; }
        @keyframes scanH { from{transform:translateY(-100%);opacity:0} 50%{opacity:0.25} to{transform:translateY(100vh);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
        .scan-beam { animation: scanH 6s linear infinite; position:absolute; left:0; right:0; top:0; height:2px; }
        select option { background: #0c0c18; color: #f1f5f9; }
      `}</style>

      {/* ── Ambient background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
        <div className="scan-beam" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.35), transparent)' }} />
      </div>

      {/* ══════════════════════ LEFT PANEL ══════════════════════ */}
      <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px', borderRight: `1px solid ${TOKEN.border}`, position: 'relative', zIndex: 1 }}>

        {/* Logo mark */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: TOKEN.amber, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="#1c1200" style={{ width: 18, height: 18 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: TOKEN.txt, letterSpacing: '-0.02em' }}>Anchor Oversight</div>
              <div style={{ fontSize: 10, color: TOKEN.amber, letterSpacing: '0.1em', fontFamily: TOKEN.mono, marginTop: 2 }}>REGULATORY PORTAL</div>
            </div>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 800, color: TOKEN.txt, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Cryptographic<br />
            <span style={{ color: TOKEN.amber }}>Audit Ledger</span><br />
            Access
          </h1>
          <p style={{ fontSize: 13, color: TOKEN.txtS, lineHeight: 1.75, marginBottom: 36 }}>
            Authorized regulators and government agencies access tamper-evident AI governance records, violation trails, and compliance timelines.
          </p>

          {/* Authority info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {[
              { label: 'Authorized Bodies',   value: 'SEC · FCA · RBI · SEBI · EU AI · CFPB · MAS' },
              { label: 'Session Security',     value: '6-digit TOTP · Cryptographic bound session' },
              { label: 'Evidence Standard',    value: 'Tamper-evident SHA-256 ledger chain' },
              { label: 'Jurisdictional Scope', value: 'Data scoped to your mandate — no cross-border' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '11px 14px', borderRadius: 8, background: TOKEN.amberD, border: `1px solid rgba(245,158,11,0.12)` }}>
                <div style={{ fontSize: 9, color: '#78716c', letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase', fontFamily: TOKEN.mono }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#d1d5db', fontFamily: TOKEN.mono, lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status footer */}
        <div>
          <Dot color={TOKEN.amber} label="REGULATORY RELAY ACTIVE" />
          <div style={{ marginTop: 10, fontSize: 10, color: TOKEN.txtD, fontFamily: TOKEN.mono }}>oversight.anchorgovernance.tech</div>
        </div>
      </div>

      {/* ══════════════════════ RIGHT PANEL ══════════════════════ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            {['Authority ID', 'TOTP Verify'].map((s, i) => {
              const active = (i === 0 && stage === 'identify') || (i === 1 && stage === 'verify')
              const done   = i === 0 && stage === 'verify'
              const col    = done ? TOKEN.green : active ? TOKEN.amber : TOKEN.txtD
              return (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? TOKEN.green : active ? TOKEN.amber : 'transparent', border: `1px solid ${col}`, fontSize: 11, fontWeight: 700, color: done || active ? '#1c1200' : TOKEN.txtD }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: col }}>{s}</span>
                  </div>
                  {i === 0 && <div style={{ flex: 1, height: 1, background: stage === 'verify' ? TOKEN.amber : TOKEN.border, maxWidth: 40, transition: 'background 0.3s' }} />}
                </React.Fragment>
              )
            })}
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, lineHeight: 1.5 }}>
              ✗ {error}
            </div>
          )}

          {/* ── Stage 1: Authority Identification ── */}
          {stage === 'identify' && (
            <form onSubmit={handleIdentify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TOKEN.txt, marginBottom: 6, letterSpacing: '-0.02em' }}>Authority Identification</div>
                <div style={{ fontSize: 14, color: TOKEN.txtS }}>Provide your regulatory credentials to proceed.</div>
              </div>

              <Field label="Agency / Entity ID">
                <input required type="text" value={form.entityId}
                  onChange={set('entityId')} onFocus={fo('entityId')} onBlur={bl}
                  placeholder="e.g. SEC-JOHNDOE-2604"
                  style={{ ...f('entityId'), fontFamily: TOKEN.mono, textTransform: 'uppercase' }}
                />
              </Field>

              <Field label="Official Email">
                <input required type="email" value={form.email}
                  onChange={set('email')} onFocus={fo('email')} onBlur={bl}
                  placeholder="auditor@regulator.gov"
                  style={f('email')}
                />
              </Field>

              <Field label="Jurisdiction">
                <select required value={form.jurisdiction}
                  onChange={set('jurisdiction')} onFocus={fo('jx')} onBlur={bl}
                  style={{ ...f('jx'), appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select your jurisdiction</option>
                  {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </Field>

              <div style={{ padding: '11px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                ⚠ All access attempts are cryptographically logged and auditable.
              </div>

              <button type="submit" style={{ width: '100%', padding: 13, borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: TOKEN.amber, color: '#1c1200', letterSpacing: '0.03em' }}>
                Proceed to TOTP Verification →
              </button>
            </form>
          )}

          {/* ── Stage 2: TOTP Verify ── */}
          {stage === 'verify' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: TOKEN.txt, marginBottom: 6, letterSpacing: '-0.02em' }}>Cryptographic TOTP</div>
                <div style={{ fontSize: 14, color: TOKEN.txtS }}>Enter the 6-digit code from your authenticator app.</div>
              </div>

              {/* Confirmed identity badge */}
              <div style={{ padding: '14px 18px', borderRadius: 8, background: TOKEN.amberD, border: `1px solid rgba(245,158,11,0.2)`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 9, color: TOKEN.amber, letterSpacing: '0.12em', marginBottom: 2, textTransform: 'uppercase', fontFamily: TOKEN.mono }}>Agency Confirmed</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TOKEN.txt, fontFamily: TOKEN.mono }}>{form.entityId.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: TOKEN.txtS }}>{form.email} · {form.jurisdiction}</div>
              </div>

              {/* Large TOTP code input */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TOKEN.txtD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontFamily: TOKEN.sans }}>6-Digit TOTP Code</div>
                <input required type="text" inputMode="numeric" maxLength={6} value={form.totp} autoFocus
                  onChange={set('totp')} onFocus={fo('totp')} onBlur={bl}
                  placeholder="000000"
                  style={{
                    ...iBase, textAlign: 'center', fontSize: 40, letterSpacing: '0.5em',
                    fontWeight: 800, fontFamily: TOKEN.mono,
                    color: TOKEN.amber, padding: '20px 16px',
                    borderColor: form.totp.length === 6 ? TOKEN.amber : focused === 'totp' ? TOKEN.amber : TOKEN.border,
                    boxShadow: form.totp.length === 6 ? `0 0 0 3px rgba(245,158,11,0.12)` : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setStage('identify'); setForm(p => ({ ...p, totp: '' })); setError('') }}
                  style={{ flex: 1, padding: 13, borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${TOKEN.border}`, cursor: 'pointer', background: 'transparent', color: TOKEN.txtS }}>
                  ← Back
                </button>
                <button type="submit" disabled={form.totp.length < 6 || loading}
                  style={{
                    flex: 2, padding: 13, borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none',
                    cursor: (form.totp.length < 6 || loading) ? 'not-allowed' : 'pointer',
                    background: form.totp.length === 6 && !loading ? TOKEN.amber : 'rgba(245,158,11,0.15)',
                    color: form.totp.length === 6 && !loading ? '#1c1200' : TOKEN.txtD,
                    transition: 'all 0.15s',
                  }}>
                  {loading ? 'Authenticating...' : 'Finalize Clearance →'}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: TOKEN.txtD, fontFamily: TOKEN.mono }}>
            ENFORCEMENT PRIORITY: 01 · All sessions are logged
          </div>
        </div>
      </div>
    </div>
  )
}
