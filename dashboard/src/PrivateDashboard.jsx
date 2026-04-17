import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { API_BASE, endpoints } from './lib/api';

export default function PrivateDashboard() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fleet');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch(endpoints.stats(), { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(endpoints.listProjects, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch (e) {
        console.error("Fetch Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return (
    <div className="h-screen bg-[#05070A] flex items-center justify-center font-mono">
      <div className="text-[10px] tracking-[0.5em] text-amber-500 animate-pulse uppercase">SYNCING_ENTERPRISE_OPS...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E2E8F0] p-10 flex flex-col gap-10 overflow-y-auto">
      
      {/* --- Ops Center Header --- */}
      <div className="flex justify-between items-end border-b border-amber-500/20 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 bg-amber-500 p-[3px]">
               <div className="w-full h-full bg-[#05070A]" />
             </div>
             <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-amber-500">Ops_Center // {user?.company_name || 'Enterprise_Node'}</h2>
          </div>
          <div className="flex gap-8 text-[10px] font-mono">
            <div className="flex flex-col">
              <span className="text-slate-500 uppercase">Principal_Owner</span>
              <span className="text-white">{user?.display_name}</span>
            </div>
            <div className="flex flex-col border-l border-white/5 pl-8">
              <span className="text-slate-500 uppercase">Regional_Scope</span>
              <span className="text-amber-500">{user?.region || 'Global'} // {user?.department || 'Main'}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors tracking-widest uppercase">BYPASS_ADMIN_EXIT</button>
      </div>

      {/* --- Performance Grids --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Managed Assets', value: stats?.active_projects || 0, sub: 'TOTAL_PROJECT_NODES' },
          { label: 'Audit Handshakes', value: stats?.total_audits || 0, sub: 'REAL_TIME_TELEMETRY' },
          { label: 'Compliance Health', value: `${stats?.compliance_rate || 100}%`, sub: 'REGIONAL_PARITY', high: true },
          { label: 'Open Remediations', value: stats?.total_violations || 0, sub: 'ATTENTION_REQUIRED', warn: (stats?.total_violations > 0) }
        ].map((m, i) => (
          <div key={i} className="p-6 border border-white/5 bg-white/[0.02] hover:bg-amber-500/[0.03] transition-all relative group">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 font-bold">{m.label}</div>
            <div className={`text-3xl font-bold tracking-tighter mb-2 ${m.high ? 'text-emerald-500' : (m.warn ? 'text-amber-500' : 'text-white')}`}>{m.value}</div>
            <div className="text-[8px] text-slate-600 font-mono tracking-widest uppercase">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* --- Main Workspace --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Project Registry */}
        <div className="lg:col-span-2 border border-white/5 bg-[#080B10] flex flex-col overflow-hidden relative">
          <div className="h-12 px-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">Project_Lattice_Registry</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] text-slate-600 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 font-normal">Project Identity</th>
                  <th className="pb-4 font-normal">Governance Status</th>
                  <th className="pb-4 font-normal text-right">Audit Frequency</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-mono">
                {stats?.project_health?.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                    <td className="py-4 text-slate-400 group-hover/row:text-white uppercase tracking-wider">{p.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold ${p.status === 'COMPLIANT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-600 italic">{p.audits} PULSES</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6">
          <div className="p-6 border border-white/5 bg-[#080B10]">
             <h4 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase mb-4 font-mono">Regional_Governance</h4>
             <div className="space-y-4">
                {['Security Framework v2.1', 'Data Sovereignty Act', 'Audit Interval: 5s'].map((f, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">{f}</span>
                    <span className="text-emerald-500/50">[ACTIVE]</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-6 border border-white/5 bg-[#080B10]">
             <h4 className="text-[10px] font-bold text-slate-300 tracking-widest uppercase mb-4 font-mono">Invite_Team_Official</h4>
             <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">Add secondary owners or compliance leads to this regional branch.</p>
             <button className="w-full border border-amber-500/30 text-amber-500 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-amber-500 hover:text-[#05070A] transition-all">
                Generate_Access_Link
             </button>
          </div>
        </div>

      </div>

    </div>
  );
}