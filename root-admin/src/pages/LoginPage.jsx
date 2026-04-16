import React, { useState, useEffect } from 'react'

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
  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const t = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    t(); const id = setInterval(t, 1000); return () => clearInterval(id)
  }, [])

  const [stage, setStage] = useState('email') // 'email' or 'code'
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const apiUrl = e.target.api_url.value.trim()
    if (!apiUrl) {
      setError('ENDPOINT URL REQUIRED')
      setLoading(false)
      return
    }
    localStorage.setItem('anchor_api_url', apiUrl)

    try {
      const res = await fetch(`${apiUrl}/api/auth/admin/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setStage('code')
      } else {
        setError(data.detail || 'HANDSHAKE DISPATCH FAILED')
      }
    } catch (err) {
      setError('MASTER NODE REACHABILITY FAILURE')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const apiUrl = localStorage.getItem('anchor_api_url')

    try {
      const res = await fetch(`${apiUrl}/api/auth/admin/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: accessCode })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('root_token', data.access_token)
        localStorage.setItem('root_user', JSON.stringify(data.user))
        window.location.href = '/dashboard'
      } else {
        setError(data.detail || 'INVALID OR EXPIRED CODE')
      }
    } catch (err) {
      setError('KERNEL SYNC FAILURE')
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
               {stage === 'email' ? 'Level 01 // Identity Request' : 'Level 02 // Handshake Verification'}
            </span>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed">
              ⚠ {error}
            </div>
          )}

          {stage === 'email' ? (
            <form onSubmit={handleRequestCode} className="flex flex-col gap-8 animate-in fade-in duration-500">
              <div className="flex flex-col gap-3">
                <label className="block text-[11px] tracking-[0.2em] uppercase font-bold text-slate-400">Master Node Endpoint</label>
                <input name="api_url" type="text"
                  className="w-full h-10 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-4 text-[13px] outline-none transition-all shadow-inner tracking-tight placeholder:text-slate-700 rounded-lg"
                  placeholder="https://app.anchorgovernance.tech" defaultValue={localStorage.getItem('anchor_api_url') || ''} />
              </div>

              <div className="flex flex-col gap-3">
                <label className="block text-[11px] tracking-[0.2em] uppercase font-bold text-slate-200">ADMINISTRATOR EMAIL</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-5 text-base outline-none transition-all shadow-inner tracking-tight placeholder:text-slate-500 rounded-lg"
                  placeholder="tan@anchorgovernance.tech" autoFocus />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} 
                  className="w-full h-12 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[13px] tracking-[0.5em] uppercase transition-all duration-500 active:scale-95 rounded-lg">
                  {loading ? 'REQUESTING ACCESS...' : 'DISPATCH ACCESS CODE'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center bg-amber-500/5 border border-amber-500/20 p-6 mb-4">
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 mb-1">Target Identity</p>
                  <p className="text-amber-500 font-bold tracking-[0.2em] text-sm">{email}</p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="block text-[11px] tracking-[0.2em] uppercase font-bold text-slate-200 text-center">6-DIGIT VERIFICATION CODE</label>
                <input required maxLength={6} type="text" value={accessCode} onChange={e => setAccessCode(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-amber-900 focus:border-amber-500 text-amber-500 text-center text-5xl font-bold outline-none transition-all tracking-[0.5em] py-4"
                  placeholder="000000" autoFocus />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setStage('email')}
                  className="flex-1 h-12 border border-[#1E1E2A] text-slate-600 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                  BACK
                </button>
                <button type="submit" disabled={loading || accessCode.length < 6}
                  className="flex-[2] h-12 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[12px] tracking-[0.4em] transition-all">
                  {loading ? 'VERIFYING...' : 'ASSERT AUTHORITY'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-[9px] uppercase tracking-widest text-[#484F58] leading-normal mt-10">
            One-time codes are valid for 10 minutes.<br/> 
            Unauthorized access attempts are logged to the audit chain.
          </p>
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-[#08080D] border-t border-[#1E293B]">
          <span className="text-[9px] tracking-widest uppercase text-slate-700">root-emergency-access.auth</span>
          <span className="text-[9px] font-mono text-slate-700 uppercase">
            {time}
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
