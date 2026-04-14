import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTP_LEN = 6

function StatusBar({ time }) {
  return (
    <div className="fixed top-0 inset-x-0 h-9 flex items-center justify-between px-6 z-50 shadow-sm"
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

  return (
    <div className="flex gap-4 justify-center">
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
          onFocus={e => e.target.select()}
          className="w-12 h-16 text-center text-3xl font-bold outline-none transition-all duration-300 rounded-lg shadow-inner disabled:opacity-40"
          style={{
            background: digits[idx] ? 'rgba(201,168,76,0.1)' : '#0C0C12',
            border:     digits[idx] ? '2px solid rgba(201,168,76,0.8)' : '2px solid #1E1E2E',
            color:      '#C9A84C',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [entityId,  setEntityId]  = useState('')
  const [email,     setEmail]     = useState('')
  const [totp,      setTotp]      = useState('')
  const [stage,     setStage]     = useState('credentials') 
  const [intentToken, setIntentToken] = useState(null)
  const [error,     setError]     = useState('')
  const [shake,     setShake]     = useState(false)
  const [time,      setTime]      = useState('')
  const entityRef = useRef(null)

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { entityRef.current?.focus() }, [])

  const triggerShake = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  const handleCredentialsNext = async (e) => {
    e.preventDefault()
    const id = entityId.trim().toUpperCase()
    const em = email.trim().toLowerCase()
    if (!id || id.length < 3) { triggerShake('ENTITY ID REQUIRED'); return }
    if (!em.includes('@'))    { triggerShake('VALID EMAIL REQUIRED'); return }
    
    setStage('loading')
    setError('')
    
    try {
      const res = await fetch(endpoints.identify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, org_id: id })
      })
      const data = await res.json()
      
      if (res.ok) {
        setIntentToken(data.intent_token)
        setStage('totp')
      } else {
        triggerShake(data.detail || 'IDENTITY NOT RECOGNISED')
        setStage('credentials')
      }
    } catch (err) {
      triggerShake('CONNECTION ERROR')
      setStage('credentials')
    }
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (totp.length < TOTP_LEN) { triggerShake('ENTER ALL 6 DIGITS'); return }

    setStage('authenticating')
    setError('')

    try {
      const res = await fetch(endpoints.verifyTotp, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          org_id:    entityId.trim().toUpperCase(),
          email:     email.trim().toLowerCase(),
          totp_code: totp,
          intent_token: intentToken
        }),
      })

      if (res.ok) {
        const data = await res.json()
        login(data.access_token, {
          entity_id:    data.user.org_id,
          display_name: data.user.display_name,
          role:         data.user.role,
        })
        navigate('/dashboard', { replace: true })
      } else {
        const err = await res.json().catch(() => ({}))
        setTotp('')
        setStage('totp')
        triggerShake(err.detail || 'SECURITY HANDSHAKE FAILED')
      }
    } catch {
      setTotp('')
      setStage('totp')
      triggerShake('NETWORK ERROR — RETRY')
    }
  }

  // Auto-submit
  useEffect(() => {
    if (stage === 'totp' && totp.length === TOTP_LEN) handleLogin()
  }, [totp])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#06060A]">
      <StatusBar time={time} />
      <GridBackground />

      <div className={`relative z-10 w-full max-w-xl mt-12 transition-all ${shake ? 'animate-shake' : ''}`}>
        
        {/* Header Strip */}
        <div className="flex items-center gap-4 px-8 py-6 bg-[#0C0C12] border-t border-x border-[#1E1E2E]">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
            <div className="w-3 h-3 bg-amber-500" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-amber-500">Security Clearance</div>
            <div className="text-[9px] tracking-widest uppercase text-slate-600 mt-1">Oversight Identity Node Established</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] tracking-widest uppercase text-slate-700">Auth Priority</div>
            <div className="text-[10px] font-mono text-slate-500 font-bold">LEVEL-01</div>
          </div>
        </div>

        {/* Dynamic Progress */}
        <div className="h-1.5 bg-[#1E1E2E]">
          <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-700" 
            style={{ width: stage === 'credentials' ? '33%' : stage === 'totp' ? '66%' : '100%' }} />
        </div>

        {/* Main Form Body */}
        <div className="bg-[#0C0C12] border-x border-b border-[#1E1E2E] p-12 shadow-2xl">
          
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-500">
               {stage === 'credentials' ? '01 // IDENTITY HANDSHAKE' : 
                stage === 'totp' ? '02 // CRYPTOGRAPHIC CHALLENGE' : 
                '03 // ESTABLISHING SESSION'}
            </span>
            {(stage === 'loading' || stage === 'authenticating') && <div className="w-2 h-2 bg-amber-500 animate-ping rounded-full" />}
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              ⚠ [HANDSHAKE ERR] {error}
            </div>
          )}

          {stage === 'credentials' ? (
            <form onSubmit={handleCredentialsNext} className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-4">
                <label className="block text-[11px] tracking-[0.3em] uppercase font-bold text-[#8B949E]">Regulator ID / Prefix</label>
                <input ref={entityRef} type="text" value={entityId} onChange={e => setEntityId(e.target.value.toUpperCase())}
                  placeholder="e.g. SEC, RBI" className="w-full h-14 px-5 bg-black border border-[#1E1E2E] focus:border-amber-500/50 text-amber-500 text-sm font-mono outline-none transition-all shadow-inner tracking-widest" />
              </div>
              <div className="space-y-4">
                <label className="block text-[11px] tracking-[0.3em] uppercase font-bold text-[#8B949E]">Official Agent Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="agent@authority.gov" className="w-full h-14 px-5 bg-black border border-[#1E1E2E] focus:border-amber-500/50 text-slate-200 text-sm font-mono outline-none transition-all shadow-inner" />
              </div>
              <button type="submit" disabled={stage === 'loading'} className="w-full h-14 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/50 font-bold text-[11px] tracking-[0.3em] uppercase transition-all duration-300">
                {stage === 'loading' ? 'LOCATING IDENTITY...' : 'INITIATE HANDSHAKE →'}
              </button>
            </form>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center bg-amber-500/5 border border-amber-500/20 p-6 rounded-lg">
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 mb-1">Authenticating Agency</p>
                  <p className="text-amber-500 font-bold tracking-widest text-lg">{entityId}</p>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-center text-slate-500">Input 6-Digit Secondary Verify Code</p>
                  <TotpInput value={totp} onChange={setTotp} disabled={stage === 'authenticating'} />
               </div>

               <div className="flex gap-4">
                  <button onClick={() => { setStage('credentials'); setTotp(''); setError('') }}
                    className="flex-1 h-14 border border-[#1E1E2E] text-slate-500 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                    BACK
                  </button>
                  <button onClick={handleLogin} disabled={totp.length < TOTP_LEN || stage === 'authenticating'}
                    className="flex-[2] h-14 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/50 font-bold text-[11px] tracking-[0.3em] transition-all">
                    {stage === 'authenticating' ? 'VERIFYING...' : 'FINALIZE ACCESS'}
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#080810] border-x border-b border-[#1E1E2E] rounded-b-lg">
           <span className="text-[9px] tracking-widest uppercase text-[#2A2A3E]">oversight.anchorgovernance.tech</span>
           <span className="text-[9px] font-mono text-[#2A2A3E]">DECRYPTED VIA MASTER KEY</span>
        </div>
      </div>
    </div>
  )
}
