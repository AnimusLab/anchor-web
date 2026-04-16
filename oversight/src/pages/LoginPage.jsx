import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Regulatory Colors
const C = {
  bg: '#06060A',
  card: '#0C0C12',
  emerald: '#10B981',
  emeraldDim: 'rgba(16,185,129,0.1)',
  border: '#1E1E2E',
  txt: '#E2E8F0',
  txtS: '#94A3B8',
  txtD: '#475569'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [entityId, setEntityId] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
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
        body: JSON.stringify({ display_name: "REGULATOR_NODE", email, org_id: entityId, jurisdiction }) // display_name is internal for intent
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
          background: `radial-gradient(circle at 50% 50%, ${C.emeraldDim} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(transparent 99%, ${C.emerald} 100%), linear-gradient(90deg, transparent 99%, ${C.emerald} 100%)`,
          backgroundSize: '80px 80px',
        }} />
        {/* Radar Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/30 animate-scan" style={{
            boxShadow: '0 0 20px #10B981'
        }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080D] flex flex-col items-center justify-center p-8 font-mono relative overflow-hidden">
      <RadarBackground />
      
      <div className="w-full max-w-xl bg-[#0C0C12] border border-[#1E1E2E] shadow-2xl relative z-10 overflow-hidden rounded-2xl">
        
        {/* Authority Header */}
        <div className="flex items-center gap-4 px-8 py-6 bg-[#08080D] border-b border-[#1E293B]">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-3 h-3 bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-emerald-500">Authority Access</div>
            <div className="text-[10px] tracking-widest uppercase text-slate-600 mt-1">Regulatory Node Handshake Initiated</div>
          </div>
        </div>

        <div className="p-12 md:p-20">
          <div className="mb-14 text-center">
            <span className="text-[12px] tracking-[0.5em] uppercase font-bold text-slate-500 border-b border-emerald-500/20 pb-2">
               {stage === 'identify' ? 'Level 01 // Identity Challenge' : 'Level 02 // Security Verify'}
            </span>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed">
              ⚠ [HANDSHAKE_ERROR]: {error}
            </div>
          )}

          {stage === 'identify' ? (
            <form onSubmit={handleIdentify} className="flex flex-col gap-10 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4">
                <label className="block text-[12px] tracking-[0.2em] uppercase font-bold text-slate-200">Entity Identification Code</label>
                <input required type="text" value={entityId} onChange={e => setEntityId(e.target.value.toUpperCase())}
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-emerald-500/50 text-white px-5 text-base outline-none transition-all shadow-inner tracking-widest font-bold placeholder:text-slate-500 rounded-lg"
                  placeholder="e.g. SEC-JOHNDOE-2604" />
              </div>

              <div className="flex flex-col gap-4">
                <label className="block text-[12px] tracking-[0.2em] uppercase font-bold text-slate-200">Legal Jurisdiction</label>
                <input required type="text" value={jurisdiction} onChange={e => setJurisdiction(e.target.value.toUpperCase())}
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-emerald-500/50 text-white px-5 text-base outline-none transition-all shadow-inner tracking-widest font-bold placeholder:text-slate-500 rounded-lg"
                  placeholder="e.g. US / EU / IN" />
              </div>

              <div className="flex flex-col gap-4">
                <label className="block text-[12px] tracking-[0.2em] uppercase font-bold text-slate-200">Official Regulator Mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#08080D]/50 border border-[#1E293B] focus:border-emerald-500/50 text-white px-5 text-base outline-none transition-all shadow-inner placeholder:text-slate-500 rounded-lg"
                  placeholder="auditor@regulator.gov" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} 
                  className="w-full h-12 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-[13px] tracking-[0.4em] uppercase transition-all duration-300 rounded-lg">
                  {loading ? 'ANALYZING CLEARANCE...' : 'INITIATE HANDSHAKE'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center bg-emerald-500/5 border border-emerald-500/10 p-8">
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 mb-2">Agency Identified</p>
                  <p className="text-emerald-500 font-bold tracking-[0.4em] text-xl">{entityId}</p>
               </div>
               
               <div className="space-y-8 text-center">
                  <p className="text-[12px] tracking-[0.3em] uppercase text-slate-300 font-bold">Cryptographic TOTP</p>
                  <input required maxLength={6} type="text" value={totp} onChange={e => setTotp(e.target.value)}
                    className="w-full h-20 bg-transparent border-b-2 border-emerald-900 focus:border-emerald-500 text-emerald-500 text-center text-5xl font-bold outline-none transition-all tracking-[0.6em]"
                    placeholder="000000" autoFocus />
               </div>

               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStage('identify')}
                    className="flex-1 h-12 border border-[#1E1E2E] text-slate-600 hover:text-white text-[10px] font-bold tracking-widest transition-all">
                    ABORT
                  </button>
                  <button type="submit" disabled={totp.length < 6 || loading}
                    className="flex-[2] h-12 bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold text-[12px] tracking-[0.3em] transition-all">
                    {loading ? 'ESTABLISHING...' : 'FINALIZE ACCESS'}
                  </button>
               </div>
            </form>
          )}
        </div>

        {/* System Bar */}
        <div className="flex items-center justify-between px-10 py-5 bg-[#08080D] border-t border-[#1E293B]">
          <span className="text-[9px] tracking-widest uppercase text-slate-700">oversight.anchorgovernance.tech</span>
          <span className="text-[9px] font-mono text-slate-700 uppercase">Enforcement Priority: 01</span>
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
