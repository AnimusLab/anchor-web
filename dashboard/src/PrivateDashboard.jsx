import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';
import TacticalLattice from './components/dashboard/TacticalLattice';

export default function PrivateDashboard() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState(user?.department || 'OPS');
  const [inviteStatus, setInviteStatus] = useState('');

  const isOwner = user?.role === 'owner' || user?.role === 'root';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch(endpoints.stats(), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(endpoints.listProjects, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch (e) {
        console.error("Fetch Error", e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus('GENERATING...');
    try {
      const res = await fetch(endpoints.invite, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, department: inviteDept, role: 'member' })
      });
      if (res.ok) {
        setInviteStatus('INVITE_SENT_SUCCESS');
        setInviteEmail('');
      } else {
        setInviteStatus('ERROR_FAILED_TO_DISPATCH');
      }
    } catch (e) {
      setInviteStatus('ERROR_NETWORK_BREACH');
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#05070A] flex items-center justify-center font-mono">
      <div className="text-[10px] tracking-[0.5em] text-cyan-500 animate-pulse uppercase">SYNCING_SOVEREIGN_MESH...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E2E8F0] flex flex-col font-mono">
      
      {/* --- Tactical Header --- */}
      <header className="h-20 border-b border-white/5 px-8 flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
            <div className="w-5 h-5 bg-[#05070A]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-500">
              {isOwner ? 'Ops_Center' : 'Lattice_Deck'} // {user?.region || 'GLOBAL'}
            </h1>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{user?.org_id} // {user?.department}</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Active_Session</span>
              <span className="text-[10px] text-white font-bold">{user?.display_name}</span>
           </div>
           <button onClick={logout} className="px-4 py-2 border border-white/10 text-[9px] hover:border-cyan-500/50 hover:text-cyan-500 transition-all uppercase tracking-widest">
             Exit_Session
           </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* --- Sidebar Nav --- */}
        <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-white/[0.005]">
          <nav className="flex flex-col gap-2">
            {['Overview', 'Project_Lattice', 'Compliance_Shield', 'Security_Vault'].map((item) => (
              <button key={item} className={`text-[10px] text-left py-3 px-4 tracking-widest uppercase transition-all ${item === 'Overview' ? 'bg-cyan-500/10 text-cyan-500 border-l-2 border-cyan-500' : 'text-slate-500 hover:text-white'}`}>
                {item}
              </button>
            ))}
          </nav>

          {isOwner && (
            <div className="mt-auto border-t border-white/5 pt-6">
              <h4 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-4">Official_Invite</h4>
              <form onSubmit={handleInvite} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="DEV_EMAIL" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
                />
                <select 
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="bg-[#080B10] border border-white/10 p-2 text-[10px] focus:outline-none"
                >
                  {['AI_SAFETY', 'PAYMENTS', 'CORE_ENGINE', 'LEGAL'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button type="submit" className="bg-cyan-500 text-[#05070A] py-2 text-[9px] font-bold tracking-widest uppercase hover:bg-cyan-400 transition-all">
                  Dispatch_Invite
                </button>
                {inviteStatus && <div className="text-[8px] text-amber-500 text-center animate-pulse">{inviteStatus}</div>}
              </form>
            </div>
          )}
        </aside>

        {/* --- Content Area --- */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#080B10]/50 p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Regional Hub', value: user?.org_id?.toUpperCase(), sub: 'SOVEREIGN_GATEWAY' },
              { label: 'Active Spoke Nodes', value: projects.length, sub: 'FLEET_ENUMERATION' },
              { label: 'Compliance Health', value: '98.2%', sub: 'REAL_TIME_PARITY', high: true },
              { label: 'Regional God Key', value: '••••••••', sub: 'ENCRYPTED_VAULT', reveal: true },
            ].map((m, i) => (
              <div key={i} className="p-6 border border-white/5 bg-white/[0.01] relative group overflow-hidden">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4">{m.label}</div>
                <div className={`text-2xl font-bold tracking-tighter mb-2 ${m.high ? 'text-cyan-500' : 'text-white'}`}>{m.value}</div>
                <div className="text-[8px] text-slate-600 tracking-widest uppercase">{m.sub}</div>
                <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500/20" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* 3D Lattice Grid */}
            <div className="lg:col-span-2 border border-white/5 bg-black h-[500px] relative">
              <div className="absolute top-4 left-6 z-10">
                <h3 className="text-[10px] font-bold text-cyan-500 tracking-[0.4em] uppercase">Active_Mesh_Lattice</h3>
              </div>
              <TacticalLattice projects={projects} department={user?.department} />
            </div>

            {/* Event Ticker */}
            <div className="border border-white/5 bg-white/[0.005] flex flex-col h-[500px]">
               <div className="p-4 border-b border-white/5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  Violation_Ticker // Live
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="border-l-2 border-amber-500/30 pl-4 py-1">
                      <div className="text-[8px] text-slate-500 mb-1">2026-05-09 10:22:1{i} // SEC-042</div>
                      <div className="text-[10px] text-slate-300">RULE_BREACH: Unapproved transfer threshold exceeded on Node_0x{i}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}