import React, { useState, useEffect, Component } from 'react';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';
import TacticalLattice from './components/dashboard/TacticalLattice';

// --- Error Boundary to prevent black page ---
class DashboardErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[#05070A] flex flex-col items-center justify-center font-mono gap-4">
          <div className="text-red-500 text-xs tracking-widest uppercase">DASHBOARD_RENDER_ERROR</div>
          <div className="text-slate-500 text-[10px] max-w-md text-center">{this.state.error?.message}</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest">
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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('OPS');
  const [inviteStatus, setInviteStatus] = useState('');
  const [pendingPulls, setPendingPulls] = useState([]);

  const isOwner = user?.role === 'owner' || user?.role === 'root' || user?.role === 'admin';

  // --- Data Fetch ---
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
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, isOwner]);

  // --- Invite Handler ---
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
        setInviteStatus('INVITE_SENT');
        setInviteEmail('');
      } else {
        setInviteStatus('DISPATCH_FAILED');
      }
    } catch {
      setInviteStatus('NETWORK_ERROR');
    }
    setTimeout(() => setInviteStatus(''), 3000);
  };

  // --- Forensic Approval Handler ---
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
      <div className="text-[10px] tracking-[0.5em] text-cyan-500 animate-pulse uppercase">SYNCING_SOVEREIGN_MESH...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E2E8F0] flex flex-col font-mono">

      {/* --- Header --- */}
      <header className="h-20 border-b border-white/5 px-8 flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
            <div className="w-5 h-5 bg-[#05070A]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-500">
              {isOwner ? 'HUB_COMMAND' : 'LATTICE_DECK'} // {user?.region || 'GLOBAL'}
            </h1>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">
              {user?.hub_id || 'ANCHOR-MASTER-01'} // {user?.department || 'OPS'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Operator</span>
            <span className="text-[10px] text-white font-bold">
              {user?.display_name || user?.email} // <span className="text-cyan-500">{user?.role?.toUpperCase()}</span>
            </span>
          </div>
          <button onClick={logout} className="px-4 py-2 border border-white/10 text-[9px] hover:border-cyan-500/50 hover:text-cyan-500 transition-all uppercase tracking-widest">
            Exit_Session
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">

        {/* --- Sidebar --- */}
        <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-6 bg-white/[0.005]">
          <nav className="flex flex-col gap-2">
            {['Overview', 'Project_Lattice', 'Compliance_Shield', 'Forensic_Vault'].map((item) => (
              <button key={item} className={`text-[10px] text-left py-3 px-4 tracking-widest uppercase transition-all ${item === 'Overview' ? 'bg-cyan-500/10 text-cyan-500 border-l-2 border-cyan-500' : 'text-slate-500 hover:text-white'}`}>
                {item}
              </button>
            ))}
          </nav>

          {/* Pending Forensic Pulls (Owner only) */}
          {isOwner && pendingPulls.length > 0 && (
            <div className="border border-cyan-500/20 bg-cyan-500/5 p-4">
              <h4 className="text-[9px] font-bold text-cyan-500 tracking-widest uppercase mb-3">Pending_Pulls ({pendingPulls.length})</h4>
              {pendingPulls.map(pull => (
                <div key={pull.id} className="text-[9px] mb-3 pb-3 border-b border-white/5">
                  <div className="text-white mb-1">Auditor: {pull.auditor_name}</div>
                  <div className="text-slate-500 mb-2">Ref: {pull.audit_id?.slice(0, 8)}...</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproval(pull.id, 'APPROVED')} className="flex-1 bg-cyan-500 text-black py-1 hover:bg-cyan-400 transition-all">APPROVE</button>
                    <button onClick={() => handleApproval(pull.id, 'REJECTED')} className="flex-1 border border-white/10 py-1 hover:border-red-500/50 hover:text-red-500 transition-all">DENY</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite Form (Owner only) */}
          {isOwner && (
            <div className="mt-auto border-t border-white/5 pt-6">
              <h4 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-4">Invite_Developer</h4>
              <form onSubmit={handleInvite} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="dev@company.ai"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
                />
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="bg-[#080B10] border border-white/10 p-2 text-[10px] focus:outline-none"
                >
                  {['AI_SAFETY', 'PAYMENTS', 'CORE_ENGINE', 'LEGAL', 'OPS'].map(d => <option key={d} value={d}>{d}</option>)}
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

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Hub ID', value: user?.org_id?.toUpperCase() || '—', sub: 'SOVEREIGN_GATEWAY' },
              { label: 'Spoke Nodes', value: projects.length, sub: 'FLEET_ENUMERATION' },
              { label: 'Integrity Score', value: stats?.integrity_score || '98.2%', sub: 'REAL_TIME_PARITY', high: true },
              { label: 'Regional Key', value: '••••••••', sub: 'ENCRYPTED_VAULT' },
            ].map((m, i) => (
              <div key={i} className="p-6 border border-white/5 bg-white/[0.01] relative overflow-hidden">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4">{m.label}</div>
                <div className={`text-2xl font-bold tracking-tighter mb-2 ${m.high ? 'text-cyan-500' : 'text-white'}`}>{m.value}</div>
                <div className="text-[8px] text-slate-600 tracking-widest uppercase">{m.sub}</div>
                <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500/20" />
              </div>
            ))}
          </div>

          {/* Lattice + Ticker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 border border-white/5 bg-black h-[500px] relative">
              <div className="absolute top-4 left-6 z-10">
                <h3 className="text-[10px] font-bold text-cyan-500 tracking-[0.4em] uppercase">Active_Mesh_Lattice</h3>
              </div>
              <TacticalLattice projects={projects} department={user?.department} />
            </div>

            <div className="border border-white/5 bg-white/[0.005] flex flex-col h-[500px]">
              <div className="p-4 border-b border-white/5 text-[9px] font-bold tracking-widest text-slate-400 uppercase flex justify-between">
                <span>Violation_Ticker</span>
                <span className="text-cyan-500 animate-pulse">●</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {projects.flatMap(p => p.recent_violations || []).length === 0 ? (
                  <div className="text-[10px] text-slate-600 text-center py-20 uppercase tracking-[0.3em]">No_Threats_Detected</div>
                ) : projects.flatMap(p => p.recent_violations || []).map((v, i) => (
                  <div key={i} className="border-l-2 border-red-500/30 pl-4 py-1 hover:bg-white/[0.02] transition-all cursor-pointer">
                    <div className="text-[8px] text-slate-500 mb-1">{v.timestamp} // {v.rule_id}</div>
                    <div className="text-[10px] text-slate-300">{v.summary}</div>
                    <div className="text-[8px] text-cyan-500 mt-2 uppercase">Investigate_Relay →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spoke Node Inventory */}
          {projects.length > 0 && (
            <div className="mt-10">
              <h4 className="text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase mb-6">Spoke_Node_Inventory</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="border border-white/5 bg-white/[0.01] p-6 hover:border-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-sm font-bold text-white mb-1 group-hover:text-cyan-500 transition-all">{p.name}</div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">{p.id}</div>
                      </div>
                      <span className={`px-2 py-1 text-[8px] font-bold ${p.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {p.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 mb-6">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-500">Compliance_Rate</span>
                        <span className="text-white font-bold">{p.compliance_rate || '100%'}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5">
                        <div className="h-full bg-cyan-500" style={{ width: p.compliance_rate || '100%' }} />
                      </div>
                    </div>
                    <button className="w-full border border-white/10 py-2 text-[9px] tracking-widest uppercase hover:bg-white/5 transition-all">Enter_Node_Console</button>
                  </div>
                ))}
              </div>
            </div>
          )}

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