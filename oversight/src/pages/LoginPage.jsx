import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Regulatory Colors
const C = {
  bg: '#06060A',
  card: '#0C0C12',
  amber: '#C9A84C',
  amberDim: 'rgba(201,168,76,0.1)',
  border: '#1E1E2E',
  txt: '#E2E8F0',
  txtS: '#94A3B8',
  txtD: '#475569'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [entityId, setEntityId] = useState('')
  const [totp, setTotp] = useState('')
  const [stage, setStage] = useState('identify') // identify -> verify
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [intentToken, setIntentToken] = useState(null)
  
  const entityRef = useRef(null)

  const handleIdentify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/auth/oversight/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, org_id: entityId })
      })
      const data = await res.json()
      if (res.ok) {
        setIntentToken(data.intent_token)
        setStage('verify')
      } else {
        setError(data.detail || 'IDENTITY NOT RECOGNIZED BY HUB')
      }
    } catch {
      setError('HUB CONNECTION TIMEOUT')
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
      if (res.ok) {
        localStorage.setItem('anchor_token', data.access_token)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'VERIFICATION FAILED')
      }
    } catch {
      setError('SECURITY HANDSHAKE FAILED')
    } finally {
      setLoading(false)
    }
  }

  function RadarBackground() {
    return (
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${C.amberDim} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(transparent 99%, ${C.amber} 100%), linear-gradient(90deg, transparent 99%, ${C.amber} 100%)`,
          backgroundSize: '80px 80px',
        }} />
        {/* Radar Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500/30 animate-scan" style={{
            boxShadow: '0 0 20px #C9A84C'
        }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06060A] flex flex-col items-center justify-center p-8 font-mono relative overflow-hidden">
      <RadarBackground />
      
      <div className="w-full max-w-xl bg-[#0C0C12] border border-[#1E1E2E] shadow-2xl relative z-10 overflow-hidden">
        
        {/* Authority Header */}
        <div className="flex items-center gap-5 px-10 py-8 bg-[#030305] border-b border-[#1E1E2E]">
          <div className="w-10 h-10 flex items-center justify-center border border-amber-500/40 bg-amber-500/5">
            <div className="w-4 h-4 bg-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-[14px] font-bold tracking-[0.3em] uppercase text-amber-500">Authority Access</div>
            <div className="text-[10px] tracking-widest uppercase text-slate-600 mt-1">Regulatory Node Handshake Initiated</div>
          </div>
        </div>

        <div className="p-20">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-slate-500">
               {stage === 'identify' ? '01 // IDENTITY CHALLENGE' : '02 // CRYPTOGRAPHIC VERIFY'}
            </span>
          </div>

          {error && (
            <div className="mb-10 p-6 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase leading-relaxed">
              ⚠ [HANDSHAKE_ERROR]: {error}
            </div>
          )}

          {stage === 'identify' ? (
            <form onSubmit={handleIdentify} className="space-y-16 animate-in fade-in duration-500">
              <div className="space-y-6">
                <label className="block text-[11px] tracking-[0.4em] uppercase font-bold text-slate-500">Entity ID / Jurisdiction</label>
                <input required type="text" value={entityId} onChange={e => setEntityId(e.target.value.toUpperCase())}
                  className="w-full h-16 bg-black border border-[#1E1E2E] focus:border-amber-500/50 text-amber-500 px-6 text-sm outline-none transition-all shadow-inner tracking-widest font-bold"
                  placeholder="EX: SEC / RBI / SEBI" />
              </div>

              <div className="space-y-6">
                <label className="block text-[11px] tracking-[0.4em] uppercase font-bold text-slate-500">Official Auditor Mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-16 bg-black border border-[#1E1E2E] focus:border-amber-500/50 text-amber-500 px-6 text-sm outline-none transition-all shadow-inner"
                  placeholder="auditor@regulator.gov" />
              </div>

              <button type="submit" disabled={loading} 
                className="w-full h-16 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-black font-bold text-[12px] tracking-[0.4em] uppercase transition-all duration-300">
                {loading ? 'ANALYZING CLEARANCE...' : 'INITIATE REGULATORY HANDSHAKE'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-16 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center bg-amber-500/5 border border-amber-500/20 p-12">
                  <p className="text-[11px] tracking-widest uppercase text-slate-500 mb-2">Authenticated Agency</p>
                  <p className="text-amber-500 font-bold tracking-[0.5em] text-2xl">{entityId}</p>
               </div>
               
               <div className="space-y-6 text-center">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-slate-500">Secondary Verify Code</p>
                  <input required maxLength={6} type="text" value={totp} onChange={e => setTotp(e.target.value)}
                    className="w-full h-24 bg-transparent border-b-2 border-amber-900 focus:border-amber-500 text-amber-500 text-center text-5xl font-bold outline-none transition-all tracking-[0.6em]"
                    placeholder="000000" autoFocus />
               </div>

               <div className="flex gap-6">
                  <button type="button" onClick={() => setStage('identify')}
                    className="flex-1 h-14 border border-[#1E1E2E] text-slate-500 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                    ABORT
                  </button>
                  <button type="submit" disabled={totp.length < 6 || loading}
                    className="flex-[2] h-14 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-black font-bold text-[12px] tracking-[0.4em] transition-all">
                    {loading ? 'ESTABLISHING...' : 'FINALIZE ACCESS'}
                  </button>
               </div>
            </form>
          )}
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-[#030305] border-t border-[#1E1E2E]">
           <span className="text-[10px] tracking-widest uppercase text-slate-700">oversight.anchorgovernance.tech</span>
           <span className="text-[10px] font-mono text-slate-700 uppercase">Enforcement Priority: 01</span>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  )
}
