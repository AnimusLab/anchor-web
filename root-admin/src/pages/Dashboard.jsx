import PortalLayout from '../components/PortalLayout';

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
    <PortalLayout>
      <div className="flex flex-col h-[calc(100vh-160px)] gap-8 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* ── Authority Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Network Audits', value: stats?.total_audits || 0, icon: 'KERNEL' },
            { label: 'Provisioned Nodes', value: stats?.active_projects || 0, icon: 'LATTICE' },
            { label: 'Mesh Integrity', value: `${stats?.compliance_rate || 100}%`, icon: 'SHIELD', color: 'text-amber-500' },
            { label: 'Resolved Threats', value: stats?.total_violations || 0, icon: 'ALPHA', color: stats?.total_violations > 0 ? 'text-rose-500' : 'text-amber-400' }
          ].map((stat, i) => (
            <div key={i} className="border border-[#161B22] bg-[#08090C] p-6 relative group overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-20 h-20 border-r border-t border-amber-500/5 group-hover:border-amber-500/20 transition-all duration-500" />
              <div className="text-[10px] text-[#484F58] tracking-[0.4em] uppercase mb-4 font-bold">{stat.label}</div>
              <div className={`text-3xl font-bold tracking-tighter ${stat.color || 'text-slate-100'}`}>
                {loading ? '---' : stat.value}
              </div>
              <div className="mt-6 text-[9px] font-mono text-amber-900 tracking-widest">LOG_TYPE // {stat.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          
          {/* ── Fleet Status Matrix ── */}
          <div className="lg:col-span-2 border border-[#161B22] bg-[#08090C] flex flex-col shadow-xl">
            <div className="h-12 px-8 border-b border-[#161B22] flex items-center justify-between bg-[#0E1015]">
              <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 animate-amber-pulse" />
                  <span className="text-[11px] font-bold tracking-[0.3em] text-[#8B949E] uppercase">System Fleet Matrix</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[9px] text-slate-700 tracking-widest uppercase font-bold">Latency: 12ms</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#161B22] bg-[#06060A]/50">
                    <th className="px-8 py-5 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">Node Identity</th>
                    <th className="px-8 py-5 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">Integrity Level</th>
                    <th className="px-8 py-5 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold text-center">Audit_Cycle</th>
                    <th className="px-8 py-5 text-right pr-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161B22]">
                  {loading ? (
                    <tr><td colSpan="4" className="px-8 py-16 text-center text-[11px] text-amber-900 uppercase tracking-[0.5em] animate-pulse">Syncing Lattice Sensors...</td></tr>
                  ) : stats?.project_health?.map((p, i) => (
                    <tr key={p.name} className="hover:bg-[#111319] transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="text-[12px] font-bold text-slate-200 uppercase tracking-widest group-hover:text-amber-400 transition-colors">{p.name}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] px-3 py-1 border font-bold tracking-widest ${p.status === 'COMPLIANT' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-rose-500/20 text-rose-500 bg-rose-500/5'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[12px] font-mono text-slate-500 font-bold">{p.audits}</span>
                      </td>
                      <td className="px-8 py-5 text-right pr-8">
                        <button className="text-[10px] text-slate-700 hover:text-amber-500 uppercase tracking-[0.3em] font-bold transition-all border border-transparent hover:border-amber-500/30 px-4 py-2">MANAGE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Action Ledger ── */}
          <div className="border border-[#161B22] bg-[#08090C] flex flex-col h-full overflow-hidden shadow-xl">
            <div className="h-12 px-8 border-b border-[#161B22] bg-[#0E1015] flex items-center">
               <span className="text-[11px] font-bold tracking-[0.3em] text-[#8B949E] uppercase">Global Action Ledger</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {stats?.recent?.map((r, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className={`mt-2 w-2 h-2 shrink-0 ${r.status === 'VIOLATION' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                  <div className="flex-1 border-b border-[#161B22]/50 pb-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">{r.project}</span>
                      <span className="text-[9px] font-mono text-slate-700 uppercase tracking-tighter">REF_{r.commit}</span>
                    </div>
                    <div className="text-[10px] flex justify-between font-bold">
                      <span className={r.status === 'VIOLATION' ? 'text-rose-400' : 'text-amber-900 tracking-widest'}>{r.status}</span>
                      <span className="text-[9px] text-slate-800 font-mono">HASH::{r.hash}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!stats?.recent && <div className="text-center py-20 text-[11px] text-amber-900/30 uppercase tracking-[0.5em] font-bold">Awaiting Authority Pulse...</div>}
            </div>
          </div>

        </div>

      </div>
    </PortalLayout>
  )
}
