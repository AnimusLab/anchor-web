import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

export default function Dashboard() {
  const { token, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(endpoints.stats, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.status === 401) { logout(); return }
        const data = await res.json()
        setStats(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [token])

  return (
    <div className="h-full flex flex-col bg-[#030305] overflow-y-auto p-6 gap-6">
      
      {/* ── Top Level Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Audits', value: stats?.total_audits || 0, icon: 'DATA' },
          { label: 'Active Projects', value: stats?.active_projects || 0, icon: 'MESH' },
          { label: 'Compliance Rate', value: `${stats?.compliance_rate || 100}%`, icon: 'SHIELD', color: 'text-green-500' },
          { label: 'Open Violations', value: stats?.total_violations || 0, icon: 'ALERT', color: stats?.total_violations > 0 ? 'text-red-500' : 'text-cyan-400' }
        ].map((stat, i) => (
          <div key={i} className="border border-[#161B22] bg-[#08090C] p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-cyan-400/5 group-hover:border-cyan-400/20 transition-colors" />
            <div className="text-[9px] text-[#484F58] tracking-[0.3em] uppercase mb-4">{stat.label}</div>
            <div className={`text-3xl font-bold tracking-tighter ${stat.color || 'text-white'}`}>
              {loading ? '...' : stat.value}
            </div>
            <div className="mt-4 text-[8px] font-mono text-cyan-900">TYPE // {stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* ── Project Health Console ── */}
        <div className="lg:col-span-2 border border-[#161B22] bg-[#08090C] flex flex-col">
          <div className="h-10 px-6 border-b border-[#161B22] flex items-center justify-between bg-[#0E1015]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B949E] uppercase">Fleet Status Matrix</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-green-500" />
              <div className="w-1.5 h-1.5 bg-red-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#161B22]">
                  <th className="px-6 py-4 text-[9px] text-[#484F58] uppercase tracking-widest">Project Name</th>
                  <th className="px-6 py-4 text-[9px] text-[#484F58] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] text-[#484F58] uppercase tracking-widest text-center">Audits</th>
                  <th className="px-6 py-4 text-right pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161B22]">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-[10px] text-cyan-900 uppercase animate-pulse">Scanning Grid Architecture...</td></tr>
                ) : stats?.project_health?.map(p => (
                  <tr key={p.name} className="hover:bg-[#111319] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-bold text-white uppercase tracking-widest">{p.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] px-2 py-0.5 border ${p.status === 'COMPLIANT' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[11px] font-mono text-[#8B949E]">{p.audits}</span>
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <button className="text-[9px] text-[#484F58] hover:text-cyan-400 uppercase tracking-widest transition-colors">ISOLATE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Activity Stream ── */}
        <div className="border border-[#161B22] bg-[#08090C] flex flex-col h-full overflow-hidden">
          <div className="h-10 px-6 border-b border-[#161B22] bg-[#0E1015] flex items-center">
             <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B949E] uppercase">Action Ledger</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {stats?.recent?.map((r, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className={`mt-1.5 w-1.5 h-1.5 shrink-0 rotate-45 ${r.status === 'VIOLATION' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{r.project}</span>
                    <span className="text-[8px] font-mono text-[#484F58]">{r.commit}</span>
                  </div>
                  <div className="text-[9px] text-[#8B949E] flex justify-between">
                    <span className={r.status === 'VIOLATION' ? 'text-red-400' : 'text-cyan-900'}>{r.status}</span>
                    <span className="text-[8px] opacity-20">0x{r.hash}</span>
                  </div>
                </div>
              </div>
            ))}
            {!stats?.recent && <div className="text-center py-20 text-[9px] text-cyan-900/30 uppercase tracking-widest">Awaiting Pulse...</div>}
          </div>
        </div>

      </div>

    </div>
  )
}
