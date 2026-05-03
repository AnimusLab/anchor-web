import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertOctagon, 
  Settings, 
  LogOut,
  Bell,
  Fingerprint
} from 'lucide-react';

export default function PortalLayout({ children }) {
    const { user, logout } = useAuth();

    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', active: true },
        { icon: <ShieldCheck size={18} />, label: 'Forensic Hub', active: false },
        { icon: <AlertOctagon size={18} />, label: 'Enforcement', active: false },
        { icon: <Settings size={18} />, label: 'System Config', active: false },
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-[#94A3B8] font-sans selection:bg-purple-500/30 overflow-hidden flex">
            
            {/* --- PREMIUM SIDEBAR --- */}
            <aside className="w-72 bg-[#0A0A0F] border-r border-white/5 flex flex-col z-30 shadow-2xl">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                            <Fingerprint className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white tracking-wider">Anchor Oversight</span>
                            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Master Access</span>
                        </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                        <div className="text-[10px] text-purple-400 uppercase font-bold tracking-tighter mb-1">Clearance Level</div>
                        <div className="text-xs text-white font-bold tracking-widest uppercase">Level_Root_Clearance</div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-4 px-4">Oversight & Analytics</div>
                    {navItems.map((item, i) => (
                        <button 
                            key={i}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {item.icon}
                            <span className="text-sm font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all group">
                        <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-bold">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN FRAME --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Background Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Top Header */}
                <header className="h-20 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-white">Auditor Dashboard</h1>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Sovereign Relay Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <Bell size={16} className="text-slate-500" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {user?.regulator?.slice(0, 1) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar bg-[#050508]/50">
                    {children}
                </main>

                {/* Status Footer */}
                <footer className="h-10 bg-[#0A0A0F] border-t border-white/5 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="text-[10px] text-slate-700 uppercase tracking-[0.4em] font-bold">
                        Anchor v5.8.2 — Sovereign Governance Mesh
                    </div>
                    <div className="flex gap-6 text-[10px] text-slate-700 font-bold">
                        <span>LATENCY: 14ms</span>
                        <span>NODES: {user?.jurisdiction || 'GLOBAL'}</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
