import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { label: 'Overview',     href: '#' , active: true  },
  { label: 'Forensic Hub', href: '#' , active: false },
  { label: 'Enforcement',  href: '#' , active: false },
  { label: 'System Config',href: '#' , active: false },
];

export default function PortalLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E2E8F0] flex overflow-hidden font-sans">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 bg-[#080B10] border-r border-white/[0.04] flex flex-col">

        {/* Brand */}
        <div className="px-6 py-8 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 bg-emerald-500 rounded-sm flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-white leading-none">Anchor Oversight</div>
              <div className="text-[9px] text-emerald-500 tracking-[0.15em] font-mono mt-0.5">MASTER ACCESS</div>
            </div>
          </div>
        </div>

        {/* Clearance */}
        <div className="px-6 py-4 border-b border-white/[0.04]">
          <div className="text-[8px] text-slate-600 uppercase tracking-widest font-bold mb-1">Clearance Level</div>
          <div className="text-[10px] text-emerald-400 font-mono tracking-wider truncate">{user?.regulator || 'LEVEL_ROOT_CLEARANCE'}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <div className="text-[8px] text-slate-600 uppercase tracking-[0.3em] font-bold mb-3 px-3">Main Control</div>
          <div className="space-y-0.5">
            {NAV.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold tracking-wide transition-all ${
                  item.active
                    ? 'bg-white/[0.04] text-white border-l-2 border-emerald-500'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/[0.04]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Terminate Session
          </button>
          <div className="mt-4 text-[8px] text-slate-700 font-mono tracking-widest">
            Anchor v5.8 // Hub
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-[#05070A] border-b border-white/[0.04] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-300 tracking-[0.2em] uppercase">Overview</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="text-[9px] text-emerald-500 font-mono tracking-wider">GRID SECURE</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-[11px] font-bold">
            {user?.regulator?.slice(0, 1).toUpperCase() || 'R'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
