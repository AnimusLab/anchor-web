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

  const handleMasterBypass = async (e) => {
    e.preventDefault()
    setError('')
    
    // The 'Bypass' token IS the Master Key itself.
    // We save it to 'root_token' (which AuthContext uses).
    const masterKey = e.target.master_key.value.trim()
    const apiUrl = e.target.api_url.value.trim() || 'http://localhost:8000'
    
    if (!masterKey) {
      setError('MASTER KEY REQUIRED')
      return
    }

    localStorage.setItem('anchor_api_url', apiUrl)
    localStorage.setItem('root_token', masterKey)
    localStorage.setItem('root_user', JSON.stringify({ 
      id: 'root-001', 
      email: 'tan@anchorgovernance.tech', 
      role: 'root', 
      display_name: 'Lead Manager (Direct Access)' 
    }))
    
    // Force a small delay for dramatic UX effect
    setLoading(true)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
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
               Root Handshake Matrix // v5.1
            </span>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleMasterBypass} className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-3">
              <label className="block text-[11px] tracking-[0.2em] uppercase font-bold text-slate-400">Master Node Endpoint</label>
              <input name="api_url" type="text"
                className="w-full h-10 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-4 text-[13px] outline-none transition-all shadow-inner tracking-tight placeholder:text-slate-700 rounded-lg"
                placeholder="http://localhost:8000" defaultValue="http://localhost:8000" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-[11px] tracking-[0.2em] uppercase font-bold text-slate-200">MASTER ACCESS KEY</label>
              <input required name="master_key" type="password"
                className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-amber-500/50 text-white px-5 text-base outline-none transition-all shadow-inner tracking-tight placeholder:text-slate-500 rounded-lg"
                placeholder="PROMPT_HIDDEN" autoFocus />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} 
                className="w-full h-12 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[13px] tracking-[0.5em] uppercase transition-all duration-500 active:scale-95 rounded-lg">
                {loading ? 'SYNCHRONIZING WITH LATTICE...' : 'INITIATE KERNEL HANDSHAKE'}
              </button>
            </div>

            <p className="text-center text-[9px] uppercase tracking-widest text-[#484F58] leading-normal">
              Entering the Master Key bypasses identity verification.<br/> 
              This session will be recorded in the immutable ledger.
            </p>
          </form>
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-[#08080D] border-t border-[#1E293B]">
          <span className="text-[9px] tracking-widest uppercase text-slate-700">root-emergency-access.auth</span>
          <span className="text-[9px] font-mono text-slate-700 uppercase">
            {new Date().toUTCString().toUpperCase()}
          </span>
        </div>
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
