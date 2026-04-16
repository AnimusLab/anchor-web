import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Master Kernel Colors
const C = {
  bg: '#030305',
  card: '#0D0D14',
  amber: '#F59E0B',
  amberDim: 'rgba(245,158,11,0.05)',
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
          background: `radial-gradient(circle at 50% 50%, ${C.amberDim} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(${C.amberDim} 1px, transparent 1px),
            linear-gradient(90deg, ${C.amberDim} 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-500/10 rounded-full animate-spin-slow opacity-20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080D] flex flex-col items-center justify-center p-8 font-mono relative">
      <HexBackground />
      
      <div className="w-full max-w-xl bg-[#0D0D14] border border-[#1E1E2A] shadow-2xl relative z-10 overflow-hidden rounded-2xl">
        
        {/* Authority Header */}
        <div className="flex items-center gap-4 px-8 py-6 bg-[#08080D] border-b border-[#1E293B]">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
            <div className="w-3 h-3 bg-amber-500" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-amber-500">Master Kernel Access</div>
            <div className="text-[10px] tracking-widest uppercase text-slate-600 mt-1">Lattice Authority Link Established</div>
          </div>
        </div>

        <div className="p-12 md:p-20">
          <div className="mb-14 text-center">
            <span className="text-[12px] tracking-[0.5em] uppercase font-bold text-slate-500 border-b border-amber-500/20 pb-2">
               {stage === 'identify' ? 'Level 01 // Kernel Handshake' : 'Level 02 // Master Verify'}
            </span>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed">
              ⚠ [SYSTEM_ERROR]: {error}
            </div>
          )}

          {stage === 'identify' ? (
            <form onSubmit={handleIdentify} className="flex flex-col gap-10 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4">
                <label className="block text-[12px] tracking-[0.2em] uppercase font-bold text-slate-200">Master Admin Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-5 text-base outline-none transition-all shadow-inner tracking-tight placeholder:text-slate-500 rounded-lg"
                  placeholder="admin@anchorgovernance.tech" />
              </div>

              <div className="flex flex-col gap-4">
                <label className="block text-[12px] tracking-[0.2em] uppercase font-bold text-slate-200">Secret Key (Master Access)</label>
                <input required type="password" 
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-5 text-base outline-none transition-all shadow-inner placeholder:text-slate-500 rounded-lg"
                  placeholder="••••••••••••••••" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} 
                  className="w-full h-12 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[13px] tracking-[0.5em] uppercase transition-all duration-500 active:scale-95 rounded-lg">
                  {loading ? 'REQUESTING KERNEL ACCESS...' : 'INITIATE KERNEL HANDSHAKE'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center bg-amber-500/5 border border-amber-500/20 p-8">
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 mb-2">Master Identity</p>
                  <p className="text-amber-500 font-bold tracking-[0.4em] text-xl">{email}</p>
               </div>
               
               <div className="space-y-8 text-center">
                  <p className="text-[12px] tracking-[0.3em] uppercase text-slate-300 font-bold">Master Handover Code</p>
                  <input required maxLength={6} type="text" value={totp} onChange={e => setTotp(e.target.value)}
                    className="w-full h-20 bg-transparent border-b-2 border-amber-900 focus:border-amber-500 text-amber-500 text-center text-5xl font-bold outline-none transition-all tracking-[0.6em]"
                    placeholder="000000" autoFocus />
               </div>

               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStage('identify')}
                    className="flex-1 h-12 border border-[#1E1E2A] text-slate-600 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                    ABORT
                  </button>
                  <button type="submit" disabled={totp.length < 6 || loading}
                    className="flex-[2] h-12 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[12px] tracking-[0.4em] transition-all">
                    {loading ? 'SYNCHRONIZING...' : 'ASSERT MASTER ACCESS'}
                  </button>
               </div>
            </form>
          )}
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-[#08080D] border-t border-[#1E293B]">
          <span className="text-[9px] tracking-widest uppercase text-slate-700">root.anchorgovernance.tech</span>
          <span className="text-[9px] font-mono text-slate-700 uppercase">
            {new Date().toUTCString().toUpperCase()}
          </span>
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
