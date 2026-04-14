import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Master Kernel Colors
const C = {
  bg: '#030305',
  card: '#0D0D14',
  indigo: '#4F46E5', // Indigo-600
  indigoDim: 'rgba(79,70,229,0.05)',
  border: '#1E1E2A',
  txt: '#E2E8F0',
  txtS: '#94A3B8',
  txtD: '#484F58'
}

export default function LoginPage() {
  const navigate = useNavigate()
  
  // Auth State
  const [email, setEmail] = useState('')
  const [orgId, setOrgId] = useState('MASTER')
  const [totp, setTotp] = useState('')
  const [stage, setStage] = useState('identify')
  const [intentToken, setIntentToken] = useState(null)
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const t = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    t(); const id = setInterval(t, 1000); return () => clearInterval(id)
  }, [])

  const handleIdentify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/auth/admin/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, org_id: orgId })
      })
      const data = await res.json()
      if (res.ok) {
        setIntentToken(data.intent_token)
        setStage('verify')
      } else {
        setError(data.detail || 'KERNEL ACCESS DENIED')
      }
    } catch {
      setError('MASTER NODE UNAVAILABLE')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/auth/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, org_id: orgId, totp_code: totp, intent_token: intentToken })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('anchor_token', data.access_token)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'AUTHENTICATION FAILED')
      }
    } catch {
      setError('MASTER HANDSHAKE FAILED')
    } finally {
      setLoading(false)
    }
  }

  function HexBackground() {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${C.indigoDim} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(${C.indigoDim} 1px, transparent 1px),
            linear-gradient(90deg, ${C.indigoDim} 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-indigo-500/10 rounded-full animate-spin-slow opacity-20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center p-8 font-mono relative">
      <HexBackground />
      
      <div className="w-full max-w-xl bg-[#0D0D14] border border-[#1E1E2A] shadow-2xl relative z-10 overflow-hidden">
        
        {/* Kernel Header */}
        <div className="flex items-center gap-5 px-10 py-8 bg-black border-b border-[#1E1E2A]">
          <div className="w-10 h-10 flex items-center justify-center border border-indigo-500/40 bg-indigo-500/5">
            <div className="w-4 h-4 bg-indigo-500" />
          </div>
          <div>
            <div className="text-[14px] font-bold tracking-[0.4em] uppercase text-indigo-500">Master Kernel Access</div>
            <div className="text-[10px] tracking-widest uppercase text-slate-700 mt-1">Lattice Authority Link Established</div>
          </div>
        </div>

        <div className="p-20">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-slate-500">
               {stage === 'identify' ? '01 // KERNEL HANDSHAKE' : '02 // MASTER VERIFICATION'}
            </span>
          </div>

          {error && (
            <div className="mb-10 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase text-center">
              ⚠ [SYSTEM_ERROR]: {error}
            </div>
          )}

          {stage === 'identify' ? (
            <form onSubmit={handleIdentify} className="space-y-16 animate-in fade-in duration-500">
              <div className="space-y-6">
                <label className="block text-[11px] tracking-[0.4em] uppercase font-bold text-slate-600">Root Admin Mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-16 bg-[#08080A] border border-[#1E1E2A] focus:border-indigo-500/50 text-indigo-500 px-6 text-sm outline-none transition-all shadow-inner tracking-tight"
                  placeholder="admin@anchorgovernance.tech" />
              </div>

              <button type="submit" disabled={loading} 
                className="w-full h-16 bg-indigo-500/10 border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500 hover:text-white font-bold text-[12px] tracking-[0.5em] uppercase transition-all duration-500 active:scale-95">
                {loading ? 'REQUESTING KERNEL ACCESS...' : 'INITIATE MASTER HANDSHAKE'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-16 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center bg-indigo-500/5 border border-indigo-500/20 p-12">
                  <p className="text-[11px] tracking-widest uppercase text-slate-600 mb-2">Master Identity</p>
                  <p className="text-indigo-500 font-bold tracking-[0.4em] text-2xl">{email}</p>
               </div>
               
               <div className="space-y-6 text-center">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-slate-600">Master Handover Code</p>
                  <input required maxLength={6} type="text" value={totp} onChange={e => setTotp(e.target.value)}
                    className="w-full h-24 bg-transparent border-b-2 border-indigo-900 focus:border-indigo-500 text-indigo-500 text-center text-5xl font-bold outline-none transition-all tracking-[0.6em]"
                    placeholder="000000" autoFocus />
               </div>

               <div className="flex gap-6">
                  <button type="button" onClick={() => setStage('identify')}
                    className="flex-1 h-14 border border-[#1E1E2A] text-slate-600 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                    ABORT
                  </button>
                  <button type="submit" disabled={totp.length < 6 || loading}
                    className="flex-[2] h-14 bg-indigo-500/10 border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500 hover:text-white font-bold text-[12px] tracking-[0.4em] transition-all">
                    {loading ? 'SYNCHRONIZING...' : 'ASSERT MASTER ACCESS'}
                  </button>
               </div>
            </form>
          )}
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-black border-t border-[#1E1E2A]">
           <span className="text-[10px] tracking-widest uppercase text-slate-800">root.anchorgovernance.tech</span>
           <span className="text-[10px] font-mono text-slate-800 uppercase">{time}</span>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
      `}</style>
    </div>
  )
}
