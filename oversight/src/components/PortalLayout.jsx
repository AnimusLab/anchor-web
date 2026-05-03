import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertOctagon, 
  Settings, 
  LogOut,
  Fingerprint,
  ChevronRight,
  Globe,
  Layout
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
        <div className="min-h-screen bg-[#050508] text-slate-400 font-sans selection:bg-purple-500/30 flex p-6 gap-6 overflow-hidden">
            
            {/* --- COMPACT SIDEBAR (FLOATING) --- */}
            <aside className="w-[280px] bg-[#0A0A0F] border border-white/[0.03] rounded-[24px] flex flex-col z-30 shadow-2xl shrink-0 overflow-hidden">
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(147,51,234,0.3)]">
                            <Fingerprint className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-white tracking-tight leading-none mb-1">Anchor Oversight</span>
                            <span className="text-[9px] text-purple-500 font-bold uppercase tracking-[0.2em]">Master Access</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                           <div className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em] px-2 opacity-50">Main Control</div>
                           <nav className="space-y-1">
                                {navItems.map((item, i) => (
                                    <button 
                                        key={i}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${item.active ? 'bg-white/[0.03] text-white border border-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${item.active ? 'text-purple-500' : 'text-slate-600'}`}>{item.icon}</div>
                                            <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                                        </div>
                                        {item.active && <ChevronRight size={14} className="text-purple-900" />}
                                    </button>
                                ))}
                           </nav>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-8 border-t border-white/[0.03]">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all group font-bold">
                        <LogOut size={18} />
                        <span className="text-[13px]">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA (CENTERED & SPACED) --- */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative px-10">
                
                {/* Internal Header */}
                <header className="flex items-center justify-between py-6 shrink-0 mb-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em]">Overview</h1>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest opacity-60 italic">Grid Secure</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xl">
                            {user?.regulator?.slice(0, 1) || 'R'}
                        </div>
                    </div>
                </header>

                <div className="max-w-[1600px] w-full">
                    {children}
                </div>

                {/* Footer Integrated into Content */}
                <footer className="mt-20 py-10 border-t border-white/[0.02] flex items-center justify-between opacity-30">
                    <div className="text-[9px] font-bold uppercase tracking-[0.5em] text-slate-600">
                        Anchor v5.8.2 — Sovereign Hub
                    </div>
                    <div className="flex gap-10 text-[9px] font-bold uppercase tracking-widest">
                       <span>Lat: 0.01ms</span>
                       <span>ID: 0x1F2B</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
