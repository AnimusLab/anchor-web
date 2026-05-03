import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertOctagon, 
  Settings, 
  LogOut,
  Bell,
  Fingerprint,
  ChevronRight
} from 'lucide-react';

export default function PortalLayout({ children }) {
    const { user, logout } = useAuth();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', active: true },
        { icon: <ShieldCheck size={20} />, label: 'Forensic Hub', active: false },
        { icon: <AlertOctagon size={20} />, label: 'Enforcement', active: false },
        { icon: <Settings size={20} />, label: 'System Config', active: false },
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-[#94A3B8] font-sans selection:bg-purple-500/30 overflow-hidden flex">
            
            {/* --- PREMIUM SIDEBAR --- */}
            <aside className="w-80 bg-[#0A0A0F] border-r border-white/5 flex flex-col z-30 shadow-2xl shrink-0">
                <div className="p-10 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] shrink-0">
                            <Fingerprint className="text-white" size={28} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-white tracking-tight leading-tight">Anchor Oversight</span>
                            <span className="text-[11px] text-purple-500 font-bold uppercase tracking-[0.2em]">Master Access</span>
                        </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/20 p-5 rounded-2xl">
                        <div className="text-[10px] text-purple-400 uppercase font-bold tracking-widest mb-1.5 opacity-60">Jurisdiction Clearance</div>
                        <div className="text-sm text-white font-bold tracking-widest uppercase truncate">{user?.regulator || 'LEVEL_ROOT_CLEARANCE'}</div>
                    </div>
                </div>

                <nav className="flex-1 px-6 py-10 space-y-3">
                    <div className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em] mb-6 px-4">Oversight & Analytics</div>
                    {navItems.map((item, i) => (
                        <button 
                            key={i}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${item.active ? 'bg-purple-600/10 text-white border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-[15px] font-bold">{item.label}</span>
                            </div>
                            {item.active && <ChevronRight size={16} className="text-purple-500" />}
                        </button>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all group font-bold">
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[15px]">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN FRAME --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Background Glows */}
                <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />

                {/* Top Header - PRECISION ALIGNMENT */}
                <header className="h-24 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-12 shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-white tracking-tight">Auditor Dashboard</h1>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Sovereign Relay Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Health</span>
                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Nominal</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-purple-500/20">
                            {user?.regulator?.slice(0, 1) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar bg-[#050508]/50 flex flex-col">
                    <div className="flex-1 w-full max-w-[1920px] mx-auto">
                        {children}
                    </div>
                </main>

                {/* Status Footer */}
                <footer className="h-12 bg-[#0A0A0F] border-t border-white/5 flex items-center justify-between px-12 shrink-0 z-20">
                    <div className="text-[11px] text-slate-700 uppercase tracking-[0.4em] font-bold">
                        Anchor v5.8.2 — Sovereign Governance Mesh
                    </div>
                    <div className="flex gap-10 text-[11px] text-slate-700 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                           <span className="opacity-50">Latency:</span>
                           <span className="text-emerald-900">14ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="opacity-50">Node_ID:</span>
                           <span className="text-purple-900">0x1F2B</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
