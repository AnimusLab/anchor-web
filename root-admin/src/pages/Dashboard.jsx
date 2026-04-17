import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Stats Fetch Failure", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return (
    <div className="h-full bg-[#030305] flex items-center justify-center">
      <div className="text-[10px] tracking-[0.5em] text-cyan-400 animate-pulse uppercase">INITIALIZING_GRID_METRICS...</div>
    </div>
  );

  return (
    <div className="h-full bg-[#030305] flex flex-col p-10 gap-10 overflow-y-auto">
      
      {/* --- Authority Header Block --- */}
      <div className="flex justify-between items-end border-b border-[#161B22] pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 bg-cyan-400 p-[3px]">
               <div className="w-full h-full bg-[#030305]" />
             </div>
             <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-[#F0F6FC]">System_Root // Lead_Authority</h2>
          </div>
          <div className="flex gap-8 text-[10px] font-mono">
            <div className="flex flex-col">
              <span className="text-[#484F58] uppercase">Global_ID</span>
              <span className="text-cyan-400">0x00001_MASTER</span>
            </div>
            <div className="flex flex-col border-l border-[#161B22] pl-8">
              <span className="text-[#484F58] uppercase">Authorization</span>
              <span className="text-cyan-400">LEVEL_ROOT_CLEARANCE</span>
            </div>
            <div className="flex flex-col border-l border-[#161B22] pl-8">
              <span className="text-[#484F58] uppercase">Status</span>
              <span className="text-green-500">GRID_SECURE // NOMINAL</span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-[#484F58] uppercase mb-1">Grid_Uptime</div>
           <div className="text-xs font-mono text-cyan-400/50">99.9997% // NO_DRIFT</div>
        </div>
      </div>

      {/* --- Summary Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Audits', value: stats?.total_audits || 0, sub: 'LOG_TYPE // KERNEL', color: 'text-cyan-400' },
          { label: 'Provisioned Nodes', value: stats?.active_projects || 0, sub: 'LOG_TYPE // LATTICE', color: 'text-cyan-400' },
          { label: 'Mesh Integrity', value: `${stats?.compliance_rate || 100}%`, sub: 'LOG_TYPE // SHIELD', color: 'text-green-500' },
          { label: 'Resolved Threats', value: stats?.total_violations || 0, sub: 'LOG_TYPE // ALPHA', color: 'text-amber-500' }
        ].map((m, i) => (
          <div key={i} className="group p-6 border border-[#161B22] bg-[#0D1117]/50 hover:bg-cyan-400/5 transition-all relative">
            <div className="absolute top-0 right-0 w-8 h-8 opacity-10 font-mono text-cyan-400 text-xs p-2">0{i+1}</div>
            <div className="text-[10px] text-[#484F58] uppercase tracking-widest mb-4 font-bold group-hover:text-cyan-400/50">{m.label}</div>
            <div className={`text-3xl font-bold tracking-tighter mb-2 ${m.color}`}>{m.value}</div>
            <div className="text-[9px] text-[#2A2A3E] font-mono tracking-widest">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* --- Main Operational Grid --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[500px]">
        
        {/* --- Fleet Matrix --- */}
        <div className="border border-[#161B22] bg-[#08090C] flex flex-col overflow-hidden relative group">
          <div className="h-12 px-6 border-b border-[#161B22] flex items-center justify-between">
            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">System_Fleet_Matrix</span>
            <span className="text-[9px] text-[#484F58] font-mono">LATENCY: 12MS</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] text-[#484F58] uppercase tracking-widest border-b border-[#161B22]">
                  <th className="pb-4 font-normal">Node Identity</th>
                  <th className="pb-4 font-normal">Integrity Level</th>
                  <th className="pb-4 font-normal">Audit Cycle</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-mono">
                {stats?.project_health?.length > 0 ? stats.project_health.map((p, i) => (
                  <tr key={i} className="border-b border-[#161B22]/50 hover:bg-white/[0.02] transition-colors group/row">
                    <td className="py-4 text-[#8B949E] group-hover/row:text-white">{p.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] ${p.status === 'COMPLIANT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#484F58]">{p.audits} PULSES</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-20 text-center text-[#2A2A3E] text-[10px] tracking-widest">AWAITING_NODE_HANDSHAKE...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Global Action Ledger --- */}
        <div className="border border-[#161B22] bg-[#08090C] flex flex-col overflow-hidden relative">
           <div className="h-12 px-6 border-b border-[#161B22] flex items-center">
            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Global_Action_Ledger</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {stats?.recent?.map((e, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-[#0D1117] border-l-2 border-cyan-500/30 hover:border-cyan-400 transition-all">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-bold tracking-widest ${e.status === 'VIOLATION' ? 'text-red-500' : (e.status === 'RESOLVED' ? 'text-green-500' : 'text-cyan-900')}`}>
                    [{e.status}]
                  </span>
                  <span className="text-[9px] text-[#484F58] font-mono">COMMIT: {e.commit}</span>
                </div>
                <div className="text-[11px] text-[#8B949E]">
                   PROJECT {e.project} DISPATCHED AUDIT PULSE // HASH: {e.hash}
                </div>
              </div>
            ))}
            {!stats?.recent?.length && (
               <div className="h-full flex items-center justify-center text-[#2A2A3E] text-[10px] tracking-widest">NO_RECENT_ACTIVITY</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
