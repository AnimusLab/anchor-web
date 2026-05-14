import React, { useState, useEffect, Component } from 'react';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';
import TacticalLattice from './components/dashboard/TacticalLattice';

// --- Error Boundary ---
class DashboardErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[#05070A] flex flex-col items-center justify-center font-mono gap-4">
          <div className="text-red-500 text-xs tracking-widest uppercase">DASHBOARD_RENDER_ERROR</div>
          <div className="text-slate-500 text-[10px] max-w-md text-center">{this.state.error?.message}</div>
          <button onClick={() => window.location.reload()} className="px-6 py-3 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest">
            Reload Console
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardInner() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('AI_SAFETY');
  const [inviteStatus, setInviteStatus] = useState('');
  const [pendingPulls, setPendingPulls] = useState([]);

  const isOwner = user?.role === 'owner' || user?.role === 'root' || user?.role === 'admin';

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, projectsRes] = await Promise.all([
          fetch(endpoints.stats(), { headers }),
          fetch(endpoints.listProjects, { headers }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());

        if (isOwner) {
          const pullsRes = await fetch(`${endpoints.baseUrl}/api/forensic/pending`, { headers });
          if (pullsRes.ok) setPendingPulls(await pullsRes.json());
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, isOwner]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus('DISPATCHING...');
    try {
      const res = await fetch(endpoints.createInvite, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, department: inviteDept, role: 'member' })
      });
      if (res.ok) {
        setInviteStatus('SENT');
        setInviteEmail('');
        setTimeout(() => setInviteStatus(''), 3000);
      } else {
        setInviteStatus('FAILED');
      }
    } catch { setInviteStatus('ERROR'); }
  };

  const handleApproval = async (pullId, status) => {
    try {
      await fetch(`${endpoints.baseUrl}/api/forensic/approve/${pullId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      setPendingPulls(prev => prev.filter(p => p.id !== pullId));
    } catch (e) { console.error('Approval failed:', e); }
  };

  if (loading) return (
    <div className="h-screen bg-[#05070A] flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <div className="text-[10px] tracking-[0.5em] text-cyan-500 animate-pulse uppercase">INITIALIZING_SECURE_RELAY</div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#05070A] text-[#F1F1F5] flex overflow-hidden font-sans relative">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-white/5 bg-[#080B10] flex flex-col z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight">Anchor Enterprise</div>
            <div className="text-[9px] text-cyan-500/70 font-bold uppercase tracking-widest">Sovereign Node</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="section-label">Fleet Operations</div>
          {[
            { id: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'Lattice_Mesh', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
            { id: 'Compliance_Vault', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { id: 'Forensic_Audit', icon: 'M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`nav-link w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
              {item.id.replace('_', ' ')}
            </button>
          ))}

          {isOwner && pendingPulls.length > 0 && (
            <>
              <div className="section-label">Forensic Actions</div>
              <div className="px-3">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Pending Access</span>
                    <span className="w-5 h-5 flex items-center justify-center bg-cyan-500 text-black text-[10px] font-bold rounded-full">{pendingPulls.length}</span>
                  </div>
                  {pendingPulls.slice(0,2).map(pull => (
                    <div key={pull.id} className="text-[10px] border-t border-white/5 pt-3">
                      <div className="text-white font-medium mb-1 truncate">{pull.auditor_name}</div>
                      <div className="text-slate-500 text-[9px] mb-3">Ref: {pull.audit_id?.slice(0, 12)}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleApproval(pull.id, 'APPROVED')} className="py-1.5 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 transition-all uppercase tracking-tighter">Grant</button>
                        <button onClick={() => handleApproval(pull.id, 'REJECTED')} className="py-1.5 border border-white/10 text-white font-bold rounded-md hover:bg-white/5 transition-all uppercase tracking-tighter">Deny</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {isOwner && (
            <div className="mt-auto px-3 pt-8 pb-4">
               <div className="section-label px-0">Regional Invite</div>
               <form onSubmit={handleInvite} className="space-y-2">
                 <input 
                   type="email" 
                   placeholder="Developer Email" 
                   value={inviteEmail}
                   onChange={e => setInviteEmail(e.target.value)}
                   className="w-full bg-[#05070A] border border-white/10 rounded-lg p-2.5 text-[11px] focus:outline-none focus:border-cyan-500/50 transition-all"
                 />
                 <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold py-2.5 rounded-lg transition-all uppercase tracking-widest">
                   {inviteStatus || 'Dispatch Invite'}
                 </button>
               </form>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#05070A]/50">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             Terminate Session
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative z-10 bg-grid">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-10 flex justify-between items-center backdrop-blur-md bg-[#05070A]/60">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">{activeTab.replace('_', ' ')}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Node Connected // {user?.region || 'GLOBAL'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user?.display_name || user?.email}</div>
              <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.2em]">{user?.role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-xs shadow-lg">
              {(user?.display_name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Action Bar (Standardized) */}
        <div className="px-10 py-6 border-b border-white/5 flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { label: 'Provision Spoke', color: 'bg-cyan-500 text-black' },
            { label: 'Generate Regional Key', color: 'bg-white/5 border border-white/10' },
            { label: 'Export Ledger', color: 'bg-white/5 border border-white/10' },
            { label: 'Audit Handshake', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' },
            { label: `Hub: ${user?.org_id || 'LOCAL'}`, color: 'bg-green-500/10 text-green-500 border border-green-500/20' }
          ].map((act, i) => (
            <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${act.color}`}>
              {act.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Tactical Hub ID', value: user?.org_id?.toUpperCase() || '—', sub: 'SOVEREIGN_NODE', type: 'accent' },
              { label: 'Active Spoke Nodes', value: projects.length, sub: 'FLEET_ENUMERATION', type: 'accent' },
              { label: 'Integrity Rating', value: stats?.integrity_score || '100%', sub: 'MESH_CONSENSUS', type: 'green' },
              { label: 'System Health', value: 'OPTIMAL', sub: 'REGIONAL_LATTICE', type: 'green' },
            ].map((m, i) => (
              <div key={i} className={`stat-card ${m.type}`}>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">{m.label}</div>
                <div className="text-3xl font-bold tracking-tight text-white mb-2">{m.value}</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Mesh Lattice */}
            <div className="lg:col-span-2 glass-card overflow-hidden h-[540px] relative">
              <div className="absolute top-6 left-8 z-10">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold text-cyan-500 tracking-[0.3em] uppercase">Active Mesh Lattice</h3>
                  <div className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[8px] font-bold tracking-widest">LIVE_TELEMETRY</div>
                </div>
              </div>
              <div className="w-full h-full p-4">
                 <TacticalLattice projects={projects} department={user?.department} />
              </div>
            </div>

            {/* Violation Feed */}
            <div className="glass-card flex flex-col h-[540px]">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                 <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Violation_Ticker</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-mono">NODE_01</span>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {projects.flatMap(p => p.recent_violations || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase">No Threats Detected</div>
                  </div>
                ) : projects.flatMap(p => p.recent_violations || []).map((v, i) => (
                  <div key={i} className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-[8px] text-slate-500 font-mono tracking-tighter">{v.timestamp}</div>
                       <span className="text-[8px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">CRITICAL</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium mb-3">{v.summary}</div>
                    <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">Investigate_Relay →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spoke Node Inventory */}
          <div>
             <div className="flex justify-between items-center mb-8">
               <h4 className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase">Spoke Node Inventory</h4>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{projects.length} Nodes Provisioned</div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="glass-card p-6 relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-base font-bold text-white group-hover:text-cyan-500 transition-all">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">{p.id}</div>
                      </div>
                      <div className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                        {p.status || 'ACTIVE'}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Compliance Rate</span>
                          <span className="text-xs font-bold text-white">{p.compliance_rate || '100%'}</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: p.compliance_rate || '100%' }} />
                       </div>
                    </div>
                    
                    <button className="w-full py-3 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                       Enter Node Console
                    </button>
                    
                    {/* Background Decorative element */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {/* Empty State / Add Node */}
                {projects.length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3 h-64 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-cyan-500 transition-all">
                       <svg className="w-6 h-6 text-slate-500 group-hover:text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="text-[11px] font-bold tracking-widest uppercase">Provision First Spoke Node</div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PrivateDashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardInner />
    </DashboardErrorBoundary>
  );
}