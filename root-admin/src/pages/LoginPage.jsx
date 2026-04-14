import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const t = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    t(); const id = setInterval(t, 1000); return () => clearInterval(id)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user.role !== 'admin') {
          setError('ACCESS DENIED: INSUFFICIENT CLEARANCE')
          setLoading(false)
          return
        }
        login(data.access_token, data.user)
        navigate('/dashboard')
      } else {
        setError('AUTHENTICATION FAILED')
      }
    } catch {
      setError('NETWORK ERROR')
    } finally {
      setLoading(false)
    }
  }

  function GridBackground() {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Subtle cyan vignette at center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.03) 0%, transparent 70%)',
        }} />
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#030305] flex flex-col items-center justify-center p-6 relative">
      <GridBackground />
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-2 h-2 bg-cyan-400 rounded-sm animate-pulse" />
        <span className="text-[10px] tracking-[0.4em] text-cyan-400 uppercase font-bold">Anchor Root Console</span>
      </div>
      <div className="absolute top-8 right-8 text-[#484F58] text-[10px] font-mono whitespace-pre italic">
        {time}
      </div>

      <div className="w-full max-w-lg border border-[#161B22] bg-[#08090C] overflow-hidden animate-slide-up shadow-2xl relative z-10">
        <div className="h-1 bg-cyan-400/20">
          <div className={`h-full bg-cyan-400 transition-all duration-1000 ${loading ? 'w-full' : 'w-0'}`} />
        </div>
        
        <form onSubmit={handleLogin} className="p-12 space-y-10">
          <div className="text-center mb-6">
            <h2 className="text-xs tracking-[0.4em] text-[#8B949E] uppercase font-bold">Admin Clearance</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-[9px] text-[#484F58] uppercase tracking-widest mb-2 ml-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0E1015] border border-[#212830] h-10 px-4 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-400/50 transition-colors"
                placeholder="admin@anchorgovernance.tech"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] text-[#484F58] uppercase tracking-widest mb-2 ml-1">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0E1015] border border-[#212830] h-10 px-4 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-400/50 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="text-[10px] text-red-500 font-mono text-center tracking-widest bg-red-500/10 py-2 border border-red-500/20">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-cyan-400 text-[#030305] text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? 'VERIFYING...' : 'INITIATE ACCESS'}
          </button>
        </form>

        <div className="bg-[#0E1015] border-t border-[#161B22] p-4 text-center">
          <p className="text-[9px] text-[#484F58] tracking-widest leading-relaxed">
            RESTRICTED GOVERNMENT CLOUD GATEWAY<br/>
            ALL TRANSMISSIONS ARE ENCRYPTED AND LOGGED.
          </p>
        </div>
      </div>
    </div>
  )
}
