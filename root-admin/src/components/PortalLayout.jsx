import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PortalLayout({ children }) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#030305] text-[#8B949E] font-mono selection:bg-amber-500/30">
            {/* Master Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.02) 0%, transparent 80%)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px',
                }} />
            </div>

            {/* Authority Header */}
            <header className="relative z-20 border-b border-[#161B22] bg-[#030305]/90 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto flex h-20 items-center justify-between px-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <div className="w-3 h-3 bg-amber-500 animate-amber-pulse" />
                            </div>
                            <div>
                                <div className="text-sm font-bold tracking-[0.4em] uppercase text-amber-500">System Root</div>
                                <div className="text-[9px] tracking-widest text-slate-600 uppercase mt-0.5">Global Authority Node // 0x0001</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Master Integrity</div>
                            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em]">Verified Secure</div>
                        </div>
                        <button onClick={logout} className="h-10 px-6 text-[11px] font-bold tracking-[0.3em] uppercase text-slate-500 hover:text-amber-500 border border-[#161B22] hover:border-amber-500/40 transition-all bg-amber-500/0 hover:bg-amber-500/[0.03]">
                            De-Authorize
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Hub */}
            <main className="relative z-10 max-w-[1600px] mx-auto p-8">
                {children}
            </main>

            {/* Foundation Bar */}
            <footer className="fixed bottom-0 left-0 w-full z-20 border-t border-[#161B22] bg-[#030305]/90 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto px-8 h-10 flex items-center justify-between text-[10px] uppercase tracking-[0.5em] text-slate-700">
                    <div className="flex gap-8">
                        <span>Lead.Node.Status: ACTIVE</span>
                        <span>Clearance: LEVEL_ROOT</span>
                    </div>
                    <div className="flex gap-8">
                        <span>P-2P: ENCRYPTED</span>
                        <span>Protocol: V5.0 MASTER</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
