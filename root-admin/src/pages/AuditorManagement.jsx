import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

export default function AuditorManagement() {
  const { token, logout } = useAuth()
  const [auditors, setAuditors] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Provisioning Form
  const [form, setForm] = useState({ display_name: '', email: '', regulator: 'SEC' })
  const [provisioning, setProvisioning] = useState(false)
  const [newAuditor, setNewAuditor] = useState(null) // Stores the result with QR code
  const [error, setError] = useState('')

  const fetchAuditors = async () => {
    setLoading(true)
    try {
      const res = await fetch(endpoints.auditors, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setAuditors(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAuditors() }, [])

  const handleProvision = async (e) => {
    e.preventDefault()
    setProvisioning(true)
    setError('')
    try {
      const res = await fetch(endpoints.provision, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const data = await res.json()
        setNewAuditor(data)
        setForm({ display_name: '', email: '', regulator: 'SEC' })
        fetchAuditors()
      } else {
        const err = await res.json()
        setError(err.detail || 'PROVISIONING FAILED')
      }
    } catch {
      setError('NETWORK ERROR')
    } finally {
      setProvisioning(false)
    }
  }

  const handleRevoke = async (entity_id) => {
    if (!window.confirm(`REVOKE ALL ACCESS FOR ${entity_id}?`)) return
    try {
      await fetch(endpoints.revoke, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entity_id })
      })
      fetchAuditors()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#030305] p-6 gap-6 overflow-hidden">
      
      {/* ── LEFT: Provisioning Form ── */}
      <div className="w-full md:w-96 flex flex-col gap-6">
        <div className="border border-[#161B22] bg-[#08090C] flex flex-col">
          <div className="h-10 px-4 border-b border-[#161B22] flex items-center justify-between bg-[#0E1015]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">New Provisioning</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-cyan-400" />
              <div className="w-1 h-1 bg-cyan-900" />
            </div>
          </div>
          
          <form onSubmit={handleProvision} className="p-6 space-y-4">
            <div>
              <label className="block text-[9px] text-[#484F58] uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={e => setForm({...form, display_name: e.target.value})}
                className="w-full bg-[#0E1015] border border-[#212830] h-9 px-3 text-[11px] font-mono text-cyan-400 outline-none focus:border-cyan-400/30"
                placeholder="JOHN DOE"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] text-[#484F58] uppercase tracking-widest mb-2">Government Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-[#0E1015] border border-[#212830] h-9 px-3 text-[11px] font-mono text-white outline-none focus:border-cyan-400/30"
                placeholder="j.doe@sec.gov"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] text-[#484F58] uppercase tracking-widest mb-2">Regulator Body</label>
              <select
                value={form.regulator}
                onChange={e => setForm({...form, regulator: e.target.value})}
                className="w-full bg-[#0E1015] border border-[#212830] h-9 px-3 text-[11px] font-mono text-cyan-400 outline-none focus:border-cyan-400/30 appearance-none"
              >
                {['SEC', 'RBI', 'SEBI', 'FCA', 'CFPB', 'EU', 'NIST', 'FINOS'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            {error && <div className="text-[9px] text-red-500 font-mono tracking-widest text-center py-2 bg-red-500/10">{error}</div>}
            
            <button
              type="submit"
              disabled={provisioning}
              className="w-full h-10 bg-cyan-400 text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-cyan-300 disabled:opacity-30 transition-all"
            >
              {provisioning ? 'UPLOADING...' : 'SAVE & GENERATE QR'}
            </button>
          </form>
        </div>

        <div className="flex-1 border border-[#161B22] bg-[#0E1015] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-cyan-400/10" />
          <h3 className="text-[9px] text-[#484F58] tracking-widest mb-4 uppercase">System Log</h3>
          <div className="space-y-2 font-mono text-[9px] text-cyan-900 leading-relaxed uppercase">
            <div>READY FOR PROVISIONING...</div>
            <div>WAITING FOR ADMIN INPUT...</div>
            <div>ENCRYPTION: AES-256 ACTIVE</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Registry Table ── */}
      <div className="flex-1 border border-[#161B22] bg-[#08090C] flex flex-col overflow-hidden">
        <div className="h-10 px-6 border-b border-[#161B22] flex items-center justify-between bg-[#0E1015]">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B949E] uppercase">Auditor Registry</span>
          <span className="text-[9px] text-[#484F58] font-mono uppercase">{auditors.length} RECORDED ENTITIES</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0E1015] z-10">
              <tr className="border-b border-[#161B22]">
                <th className="px-6 py-3 text-[9px] text-[#484F58] uppercase tracking-[0.2em]">Entity ID</th>
                <th className="px-6 py-3 text-[9px] text-[#484F58] uppercase tracking-[0.2em]">Profile</th>
                <th className="px-6 py-3 text-[9px] text-[#484F58] uppercase tracking-[0.2em]">Authority</th>
                <th className="px-6 py-3 text-[9px] text-[#484F58] uppercase tracking-[0.2em]">Provisioned</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B22]">
              {loading && auditors.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-[10px] text-[#484F58] animate-pulse">SYNCHRONISING CRYPTOGRAPHIC VAULT...</td></tr>
              ) : auditors.map(a => (
                <tr key={a.entity_id} className="hover:bg-[#111319] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-mono text-cyan-400">{a.entity_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-bold text-white">{a.display_name}</div>
                    <div className="text-[9px] text-[#484F58] font-mono uppercase mt-0.5">{a.email_hash.slice(0, 12)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] px-2 py-0.5 border border-cyan-900 text-cyan-400 bg-cyan-400/5">{a.regulator}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-[#8B949E]">{new Date(a.provisioned_at).toLocaleDateString()}</div>
                    <div className="text-[8px] text-[#484F58]">{a.provisioned_by}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRevoke(a.entity_id)}
                      className="text-[9px] text-[#484F58] hover:text-red-500 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100"
                    >
                      REVOKE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SUCCESS MODAL (QR CODE) ── */}
      {newAuditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setNewAuditor(null)} />
          <div className="relative w-full max-w-md bg-[#08090C] border border-cyan-400/30 animate-rotate-in overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            <div className="h-1 bg-cyan-400" />
            <div className="p-8 flex flex-col items-center">
              <div className="mb-6 text-center">
                <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2">Access Provisioned</h3>
                <p className="text-[10px] text-[#484F58] tracking-widest">SCREENSHOT AND SEND TO AUDITOR</p>
              </div>
              
              <div className="qr-container mb-6 shadow-xl animate-cyan-pulse">
                <QRCodeSVG 
                  value={newAuditor.totp_uri} 
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              
              <div className="w-full bg-[#0E1015] border border-[#212830] p-4 text-center mb-6">
                <div className="text-[9px] text-[#484F58] uppercase tracking-widest mb-1">Entity ID</div>
                <div className="text-[13px] font-mono text-cyan-400 font-bold tracking-widest">{newAuditor.entity_id}</div>
              </div>

              <div className="grid grid-cols-2 w-full gap-4 mb-8">
                <div className="bg-[#0E1015]/50 p-3 border border-[#161B22]">
                  <div className="text-[7px] text-[#484F58] uppercase mb-1">Regulator</div>
                  <div className="text-[10px] text-white grow-1">{newAuditor.regulator}</div>
                </div>
                <div className="bg-[#0E1015]/50 p-3 border border-[#161B22]">
                  <div className="text-[7px] text-[#484F58] uppercase mb-1">Authority</div>
                  <div className="text-[10px] text-white">LEVEL_1_OVERSIGHT</div>
                </div>
              </div>

              <button 
                onClick={() => setNewAuditor(null)}
                className="w-full h-11 border border-[#212830] text-[10px] text-[#8B949E] hover:text-white uppercase tracking-[0.3em] transition-all"
              >
                CLOSE TERMINAL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
