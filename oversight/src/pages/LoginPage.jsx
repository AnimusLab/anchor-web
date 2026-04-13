import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTP_LEN = 6

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBar({ time }) {
  return (
    <div className="fixed top-0 inset-x-0 h-9 flex items-center justify-between px-6 z-50"
      style={{ background: '#06060A', borderBottom: '1px solid #1E1E2E' }}>
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase">
          Anchor Oversight
        </span>
        <span className="text-[9px] tracking-widest uppercase"
          style={{ color: '#4A5568', borderLeft: '1px solid #1E1E2E', paddingLeft: '12px' }}>
          Regulatory Access Terminal
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[9px] tracking-widest" style={{ color: '#4A5568' }}>
          SECURE CHANNEL · TLS 1.3
        </span>
        <span className="text-[9px] font-mono" style={{ color: '#4A5568' }}>
          {time}
        </span>
      </div>
    </div>
  )
}

function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Subtle amber vignette at center */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)',
      }} />
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />
    </div>
  )
}

function TotpInput({ value, onChange, disabled }) {
  const inputRefs = useRef([])

  const digits = value.padEnd(TOTP_LEN, '').split('').slice(0, TOTP_LEN)

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, -1)
      onChange(next)
      if (idx > 0 && value.length <= idx) inputRefs.current[idx - 1]?.focus()
      return
    }
    if (e.key === 'ArrowLeft' && idx > 0) { inputRefs.current[idx - 1]?.focus(); return }
    if (e.key === 'ArrowRight' && idx < TOTP_LEN - 1) { inputRefs.current[idx + 1]?.focus(); return }
  }

  const handleChange = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const arr  = value.padEnd(TOTP_LEN, '').split('')
    arr[idx]   = char
    const next = arr.join('').slice(0, TOTP_LEN)
    onChange(next)
    if (idx < TOTP_LEN - 1) inputRefs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOTP_LEN)
    if (pasted) { onChange(pasted); inputRefs.current[Math.min(pasted.length, TOTP_LEN - 1)]?.focus() }
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: TOTP_LEN }).map((_, idx) => (
        <input
          key={idx}
          ref={el => inputRefs.current[idx] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          disabled={disabled}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKey(e, idx)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className="w-11 h-14 text-center text-xl font-bold outline-none transition-all duration-150 disabled:opacity-40"
          style={{
            background: digits[idx] ? 'rgba(201,168,76,0.08)' : '#0C0C12',
            border:     digits[idx] ? '1px solid rgba(201,168,76,0.6)' : '1px solid #1E1E2E',
            color:      '#C9A84C',
            fontFamily: "'JetBrains Mono', monospace",
            caretColor: '#C9A84C',
          }}
        />
      ))}
    </div>
  )
}

// ─── Main LoginPage ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [entityId,  setEntityId]  = useState('')
  const [email,     setEmail]     = useState('')
  const [totp,      setTotp]      = useState('')
  const [stage,     setStage]     = useState('credentials') // 'credentials' | 'totp' | 'loading'
  const [error,     setError]     = useState('')
  const [shake,     setShake]     = useState(false)
  const [time,      setTime]      = useState('')
  const entityRef = useRef(null)

  // Live clock for status bar
  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-focus entity ID on mount
  useEffect(() => { entityRef.current?.focus() }, [])

  const triggerShake = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  const handleCredentialsNext = (e) => {
    e.preventDefault()
    const id = entityId.trim().toUpperCase()
    const em = email.trim().toLowerCase()
    if (!id || id.length < 5) { triggerShake('ENTITY ID REQUIRED'); return }
    if (!em.includes('@'))    { triggerShake('VALID EMAIL REQUIRED'); return }
    setError('')
    setStage('totp')
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (totp.length < TOTP_LEN) { triggerShake('ENTER ALL 6 DIGITS'); return }

    setStage('loading')
    setError('')

    try {
      const res  = await fetch(endpoints.login, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          entity_id: entityId.trim().toUpperCase(),
          email:     email.trim().toLowerCase(),
          totp_code: totp,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        login(data.access_token, {
          entity_id:    data.entity_id,
          display_name: data.display_name,
          regulator:    data.regulator,
          access_level: data.access_level,
          session_id:   data.session_id,
        })
        navigate('/dashboard', { replace: true })
      } else {
        const err = await res.json().catch(() => ({}))
        setTotp('')
        setStage('totp')
        triggerShake(err.detail || 'IDENTITY VERIFICATION FAILED')
      }
    } catch {
      setTotp('')
      setStage('totp')
      triggerShake('NETWORK ERROR — RETRY')
    }
  }

  // Auto-submit when all 6 TOTP digits are entered
  useEffect(() => {
    if (stage === 'totp' && totp.length === TOTP_LEN) handleLogin()
  }, [totp])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative"
      style={{ background: '#06060A' }}>

      <StatusBar time={time} />
      <GridBackground />

      {/* ── Card ── */}
      <div
        className={`relative z-10 w-full max-w-md mt-9 animate-fade-in ${shake ? 'animate-shake' : ''}`}
        style={{ padding: '0 16px' }}
      >
        {/* Card header — authority seal */}
        <div className="mb-0 flex items-center gap-3 px-6 py-4"
          style={{
            background:   '#0C0C12',
            border:       '1px solid #1E1E2E',
            borderBottom: 'none',
          }}>
          <div style={{
            width: 32, height: 32, border: '1px solid rgba(201,168,76,0.4)',
            background: 'rgba(201,168,76,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 10, height: 10, background: '#C9A84C' }} />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
              Regulatory Oversight System
            </div>
            <div className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: '#4A5568' }}>
              Authorised Personnel Only
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] tracking-widest uppercase" style={{ color: '#4A5568' }}>Node</div>
            <div className="text-[10px] font-mono" style={{ color: '#2A2A3E' }}>PRIMARY-01</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: '#1E1E2E' }}>
          <div style={{
            height: '100%',
            width:  stage === 'credentials' ? '33%' : stage === 'totp' ? '66%' : '100%',
            background: 'linear-gradient(90deg, #92702A, #C9A84C)',
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Card body */}
        <div style={{
          background: '#0C0C12',
          border:     '1px solid #1E1E2E',
          borderTop:  'none',
          padding:    '32px 32px 28px',
        }}>

          {/* Stage label */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[9px] tracking-[0.25em] uppercase font-bold"
              style={{ color: stage === 'loading' ? '#C9A84C' : '#4A5568' }}>
              {stage === 'credentials' ? '01 / IDENTITY' :
               stage === 'totp'        ? '02 / VERIFICATION' :
                                         '03 / AUTHENTICATING'}
            </span>
            {stage === 'loading' && (
              <div className="flex gap-1 ml-1">
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, background: '#C9A84C', borderRadius: '50%',
                    animation: `blink 1s step-end ${i * 0.33}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* ── Stage 1: Credentials ── */}
          {stage === 'credentials' && (
            <form onSubmit={handleCredentialsNext} className="space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: '#4A5568' }}>
                  Entity ID
                </label>
                <input
                  ref={entityRef}
                  type="text"
                  value={entityId}
                  onChange={e => setEntityId(e.target.value.toUpperCase())}
                  placeholder="SEC-JOHNDOE-2604"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-11 px-4 text-sm font-mono outline-none transition-all duration-150"
                  style={{
                    background:  '#111118',
                    border:      '1px solid #1E1E2E',
                    color:       '#C9A84C',
                    letterSpacing: '0.1em',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e  => e.target.style.borderColor = '#1E1E2E'}
                />
              </div>

              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: '#4A5568' }}>
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="auditor@sec.gov"
                  autoComplete="email"
                  className="w-full h-11 px-4 text-sm font-mono outline-none transition-all duration-150"
                  style={{
                    background: '#111118',
                    border:     '1px solid #1E1E2E',
                    color:      '#E2E8F0',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e  => e.target.style.borderColor = '#1E1E2E'}
                />
              </div>

              {error && (
                <div className="text-[10px] tracking-widest uppercase animate-fade-in"
                  style={{ color: '#EF4444', letterSpacing: '0.15em' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" className="w-full h-11 font-bold text-[11px] tracking-[0.25em] uppercase transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, #92702A, #C9A84C)',
                  color:      '#06060A',
                  marginTop:  8,
                }}
                onMouseEnter={e => e.target.style.opacity = '0.88'}
                onMouseLeave={e => e.target.style.opacity = '1'}>
                CONTINUE →
              </button>
            </form>
          )}

          {/* ── Stage 2: TOTP ── */}
          {(stage === 'totp' || stage === 'loading') && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="text-[10px] tracking-widest uppercase" style={{ color: '#4A5568' }}>
                  Authenticating as
                </div>
                <div className="text-sm font-bold tracking-widest" style={{ color: '#C9A84C' }}>
                  {entityId}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[9px] tracking-[0.2em] uppercase text-center" style={{ color: '#4A5568' }}>
                  Enter code from Google Authenticator
                </div>
                <TotpInput value={totp} onChange={setTotp} disabled={stage === 'loading'} />
              </div>

              {error && (
                <div className="text-[10px] tracking-widest uppercase text-center animate-fade-in"
                  style={{ color: '#EF4444' }}>
                  ⚠ {error}
                </div>
              )}

              {stage === 'loading' ? (
                <div className="text-center text-[10px] tracking-[0.2em] uppercase animate-fade-in"
                  style={{ color: '#C9A84C' }}>
                  Verifying cryptographic identity...
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setStage('credentials'); setTotp(''); setError('') }}
                    className="flex-1 h-10 text-[10px] tracking-widest uppercase transition-all duration-150"
                    style={{ border: '1px solid #1E1E2E', color: '#4A5568' }}
                    onMouseEnter={e => e.target.style.borderColor = '#2A2A3E'}
                    onMouseLeave={e => e.target.style.borderColor = '#1E1E2E'}>
                    ← BACK
                  </button>
                  <button
                    onClick={handleLogin}
                    disabled={totp.length < TOTP_LEN}
                    className="flex-[2] h-10 font-bold text-[11px] tracking-[0.25em] uppercase transition-all duration-150 disabled:opacity-30"
                    style={{
                      background: 'linear-gradient(135deg, #92702A, #C9A84C)',
                      color:      '#06060A',
                    }}>
                    AUTHENTICATE
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Card footer */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{
            background:    '#080810',
            border:        '1px solid #1E1E2E',
            borderTop:     '1px solid #111118',
          }}>
          <span className="text-[9px] tracking-widest uppercase" style={{ color: '#2A2A3E' }}>
            oversight.anchorgovernance.tech
          </span>
          <span className="text-[9px] font-mono" style={{ color: '#2A2A3E' }}>
            Sessions logged · Legally admissible
          </span>
        </div>
      </div>

      {/* Warning strip */}
      <div className="relative z-10 mt-6 text-center max-w-sm px-4">
        <p className="text-[9px] tracking-widest uppercase leading-relaxed" style={{ color: '#2A2A3E' }}>
          Unauthorised access is a criminal offence. All sessions are cryptographically
          recorded and constitutionally admissible as evidence.
        </p>
      </div>
    </div>
  )
}
