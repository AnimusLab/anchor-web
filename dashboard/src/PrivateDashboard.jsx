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
        <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center font-mono gap-4">
          <div className="text-red-500 text-xs tracking-widest uppercase">DASHBOARD_CRITICAL_FAILURE</div>
          <div className="text-slate-600 text-[10px] max-w-md text-center">{this.state.error?.message}</div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest">
            Reload System
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
        body: JSON.stringify({ email: inviteEmail, department: 'AI_SAFETY', role: 'member' })
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
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
        <div className="text-[9px] tracking-[0.4em] text-slate-500 animate-pulse uppercase">Syncing Sovereign Node</div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0a0a0f] text-[#f1f1f5] flex overflow-hidden font-sans">
      
      {/* --- Sidebar (Oversight Style) --- */}
      <aside className="w-64 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col z-20">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Anchor Enterprise</div>
              <div className="text-[9px] text-cyan-500/80 font-bold uppercase tracking-widest">Sovereign Mode</div>
            </div>
          </div>

          <div className="p-3 bg-[#16161f] border border-[#1e1e2e] rounded-lg">
            <div className="text-[10px] font-bold text-[#555570] uppercase tracking-widest mb-1">Privilege: Owner</div>
            <div className="text-[11px] text-[#9898b0] truncate font-medium">{user?.org_id || 'LOCAL_NODE'}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="section-label">Operations</div>
          {[
            { id: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'Lattice Mesh', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
            { id: 'Compliance Shield', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { id: 'Forensic Vault', icon: 'M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`nav-link w-full ${activeTab === item.id ? 'active' : ''}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
              {item.id}
            </button>
          ))}

          {isOwner && (
            <>
              <div className="section-label">Enforcement Queue</div>
              <div className="px-1">
                {pendingPulls.length > 0 ? (
                  <div className="p-3 bg-[#1c1c28] border border-cyan-500/20 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Pending Pulls</span>
                      <span className="bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingPulls.length}</span>
                    </div>
                    {pendingPulls.slice(0, 1).map(pull => (
                      <div key={pull.id} className="text-[10px]">
                        <div className="text-white font-medium truncate mb-1">{pull.auditor_name}</div>
                        <div className="text-[#555570] font-mono mb-3 uppercase tracking-tighter">{pull.audit_id?.slice(0, 12)}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleApproval(pull.id, 'APPROVED')} className="py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all uppercase tracking-tighter">Grant</button>
                          <button onClick={() => handleApproval(pull.id, 'REJECTED')} className="py-1.5 bg-[#16161f] text-[#9898b0] border border-[#2a2a3e] font-bold rounded hover:bg-[#1c1c28] transition-all uppercase tracking-tighter">Deny</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-[#1e1e2e] rounded-lg text-center">
                    <div className="text-[9px] text-[#35354a] font-bold uppercase tracking-widest">No Active Requests</div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#1e1e2e] bg-[#0a0a0f]/50">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold text-[#555570] hover:text-white transition-all uppercase tracking-widest">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             Terminate Session
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative z-10">
        
        {/* Header (Oversight Style) */}
        <header className="h-16 border-b border-[#1e1e2e] px-8 flex justify-between items-center bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-bold text-white tracking-tight uppercase">{activeTab}</h2>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-[#555570] font-bold uppercase tracking-widest">Silo Protected // {user?.region || 'GLOBAL'}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user?.display_name || user?.email}</div>
              <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest">Operator</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1c1c28] to-[#0a0a0f] border border-[#2a2a3e] flex items-center justify-center font-bold text-white text-xs">
              {(user?.display_name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Action Bar (Refined) */}
        <div className="px-8 py-5 border-b border-[#1e1e2e] flex gap-3">
          <button className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-bold rounded-md hover:bg-cyan-400 transition-all uppercase tracking-widest">Provision Spoke</button>
          <button className="px-4 py-2 bg-[#1c1c28] text-white border border-[#2a2a3e] text-[10px] font-bold rounded-md hover:bg-[#1e1e2e] transition-all uppercase tracking-widest">Regional Key</button>
          <button className="px-4 py-2 bg-[#1c1c28] text-white border border-[#2a2a3e] text-[10px] font-bold rounded-md hover:bg-[#1e1e2e] transition-all uppercase tracking-widest">Export Ledger</button>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-md">
             <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Hub Secure:</span>
             <span className="text-[10px] font-mono text-green-400">{user?.org_id || 'TANI-09-05-26'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Stats Row (Premium Oversight Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: 'Tactical Hub ID', value: user?.org_id?.toUpperCase() || 'TANI-NODE', sub: 'SOVEREIGN_NODE', type: 'accent' },
              { label: 'Active Spoke Nodes', value: projects.length, sub: 'FLEET_ENUMERATION', type: 'accent' },
              { label: 'Integrity Score', value: '100%', sub: 'MESH_CONSENSUS', type: 'green' },
              { label: 'Access Level', value: 'OWNER', sub: 'REGIONAL_GATE', type: 'amber' },
            ].map((m, i) => (
              <div key={i} className={`stat-card ${m.type} slide-in`}>
                <div className="text-[10px] text-[#555570] uppercase tracking-widest font-bold mb-4">{m.label}</div>
                <div className="text-2xl font-bold tracking-tight text-white mb-1">{m.value}</div>
                <div className="text-[9px] text-[#35354a] font-bold uppercase tracking-widest">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mesh Lattice */}
            <div className="lg:col-span-2 ra-card overflow-hidden h-[500px] relative">
              <div className="absolute top-6 left-8 z-10">
                 <div className="text-[10px] font-bold text-cyan-500 tracking-[0.3em] uppercase mb-1">Active Mesh Lattice</div>
                 <div className="text-[9px] text-[#555570] font-medium">REAL_TIME_NODE_TELEMETRY</div>
              </div>
              <div className="w-full h-full p-4">
                 <TacticalLattice projects={projects} department={user?.department} />
              </div>
            </div>

            {/* Violation Feed */}
            <div className="ra-card flex flex-col h-[500px]">
              <div className="p-4 border-b border-[#1e1e2e] flex justify-between items-center">
                 <span className="text-[10px] font-bold tracking-widest text-[#555570] uppercase">Violation Ticker</span>
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {projects.flatMap(p => p.recent_violations || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <div className="text-[9px] font-bold tracking-[0.4em] uppercase">No Grid Breaches</div>
                  </div>
                ) : (
                  projects.flatMap(p => p.recent_violations || []).map((v, i) => (
                    <div key={i} className="p-3 bg-[#1c1c28] border-l-2 border-red-500 rounded-r-lg group cursor-pointer hover:bg-[#252535] transition-all">
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-[8px] text-red-500 font-bold uppercase">Critical Violation</span>
                         <span className="text-[8px] text-[#35354a] font-mono">{v.timestamp?.slice(11, 19)}</span>
                      </div>
                      <div className="text-[11px] text-white font-medium mb-2">{v.summary}</div>
                      <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze Branch →</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Spoke Node Inventory (Refined Grid) */}
          <div>
             <div className="flex justify-between items-center mb-6">
               <h4 className="text-[11px] font-bold text-[#555570] tracking-[0.2em] uppercase">Spoke Node Inventory</h4>
               <div className="px-3 py-1 bg-[#16161f] border border-[#1e1e2e] rounded text-[9px] font-bold text-[#9898b0] uppercase">{projects.length} Provisioned</div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="ra-card p-6 group cursor-pointer hover:bg-[#1c1c28] transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-500 transition-colors">{p.name}</div>
                        <div className="text-[9px] text-[#35354a] font-mono mt-0.5">{p.id}</div>
                      </div>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{p.status || 'ACTIVE'}</span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                       <div className="flex justify-between text-[9px] font-bold text-[#555570] uppercase">
                          <span>Compliance Rate</span>
                          <span className="text-white">{p.compliance_rate || '100%'}</span>
                       </div>
                       <div className="w-full h-1 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: p.compliance_rate || '100%' }} />
                       </div>
                    </div>
                    
                    <button className="w-full py-2 bg-[#1c1c28] group-hover:bg-cyan-500 group-hover:text-black border border-[#2a2a3e] group-hover:border-cyan-500 rounded text-[9px] font-bold uppercase tracking-widest transition-all">
                       Initialize Console
                    </button>
                    
                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {projects.length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3 h-48 border border-dashed border-[#1e1e2e] rounded-xl flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full border border-[#1e1e2e] flex items-center justify-center mb-3 group-hover:border-cyan-500">
                       <svg className="w-5 h-5 text-[#35354a] group-hover:text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <div className="text-[10px] font-bold tracking-widest uppercase">Provision First Spoke Node</div>
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