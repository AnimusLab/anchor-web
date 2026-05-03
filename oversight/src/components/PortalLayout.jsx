import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PortalLayout({ children }) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#06060A] text-[#94A3B8] font-mono selection:bg-emerald-500/30">
            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.02) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }} />
            </div>

            {/* Top Navigation Bar */}
            <header className="relative z-20 border-b border-[#1E1E2E] bg-[#06060A]/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <div className="w-2 h-2 bg-emerald-500 animate-emerald-pulse" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.3em] uppercase text-emerald-400">Anchor Oversight</span>
                        </div>
                        <div className="h-4 w-[1px] bg-[#1E1E2E]" />
                        <span className="text-[10px] tracking-widest text-slate-500 uppercase">Regulatory Node 0x1F2B</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter">System Health</div>
                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Nominal</div>
                        </div>
                        <button onClick={logout} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-all">
                            Terminate Session
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 p-8">
                {children}
            </main>

            {/* System Status Footer */}
            <footer className="fixed bottom-0 left-0 w-full z-20 border-t border-[#1E1E2E] bg-[#06060A]/80 backdrop-blur-md">
                <div className="px-8 h-8 flex items-center justify-between text-[8px] uppercase tracking-[0.4em] text-slate-700">
                    <span>Sovereign.Relay.Status: ONLINE</span>
                    <div className="flex gap-4">
                        <span>Jurisdiction: GLOBAL</span>
                        <span>MTLS: ENFORCED</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
