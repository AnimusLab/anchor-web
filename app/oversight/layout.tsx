"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { 
  LayoutDashboard, 
  Layers, 
  Building2, 
  Send, 
  PlaySquare, 
  FileCheck, 
  Search,
  User,
  Gavel
} from "lucide-react";

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on login gateway or root entry, render full screen gateway without sidebar
  if (pathname === "/oversight/login" || pathname === "/" || pathname.endsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-mono text-xs overflow-hidden relative">
      <SolarSystemBackground />

      {/* Dynamic Glassmorphism Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col justify-between flex-shrink-0 z-20">
        <div className="overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08]">
            <div className="p-3.5 glass-header-box flex items-center space-x-3">
              <div className="p-2 glass-badge">
                <Gavel className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-100 tracking-wide uppercase font-sans">
                  Anchor Oversight
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">oversight.animuslab.dev</div>
              </div>
            </div>
          </div>

          <div className="mx-4 my-3.5 p-3 glass-badge text-[10px]">
            <span className="text-slate-400 block uppercase">JURISDICTION CLEARANCE</span>
            <span className="text-amber-400 font-bold tracking-wide">AUD-ANM-2603</span>
          </div>

          {/* Nav Section 1: Statutory Oversight */}
          <div className="p-4 space-y-2">
            <div className="animus-label text-[9px]">STATUTORY OVERSIGHT</div>
            <nav className="space-y-1">
              <Link href="/oversight" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Overview</span>
              </Link>
              <Link href="/oversight/dac" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/dac' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Decision Audit Chain</span>
              </Link>
              <Link href="/oversight/heatmap" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/heatmap' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Building2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Violation Heatmap</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 2: Forensic Inspection */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">FORENSIC INSPECTION</div>
            <nav className="space-y-1">
              <Link href="/oversight/requests" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/requests' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>P2P Pull Requests</span>
              </Link>
              <Link href="/oversight/replay" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/replay' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <PlaySquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Gated Mission Replay</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 3: Verification & Filings */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">VERIFICATION & FILINGS</div>
            <nav className="space-y-1">
              <Link href="/oversight/dialects" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/dialects' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dialect Generator</span>
              </Link>
              <Link href="/oversight/verify" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/verify' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Chain Verifier</span>
              </Link>
              <Link href="/oversight/profile" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/oversight/profile' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Profile</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] text-[10px] text-slate-400 flex justify-between items-center bg-[#070b16]/80">
          <span>Jurisdiction: RBI-IN</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
