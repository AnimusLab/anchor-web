"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { 
  LayoutDashboard, 
  Globe, 
  Server, 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  CreditCard, 
  Key, 
  RotateCcw, 
  Sliders, 
  Activity,
  Shield,
  FileSpreadsheet
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-100 tracking-wide uppercase font-sans">
                  Anchor Root
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin.animuslab.dev</div>
              </div>
            </div>
          </div>

          <div className="mx-4 my-3.5 p-3 glass-badge text-[10px]">
            <span className="text-slate-400 block uppercase">PRIVILEGE: ROOT</span>
            <span className="text-emerald-400 font-bold tracking-wide">LEVEL_ROOT_CLEARANCE</span>
          </div>

          {/* Nav Section 1: Oversight & Analytics */}
          <div className="p-4 space-y-2">
            <div className="animus-label text-[9px]">OVERSIGHT & ANALYTICS</div>
            <nav className="space-y-1">
              <Link href="/admin" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                <span>Overview</span>
              </Link>
              <Link href="/admin/telemetry" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/telemetry' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Global Telemetry</span>
              </Link>
              <Link href="/admin/fleet" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/fleet' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Fleet Inspection</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 2: Access & Audit Control */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">ACCESS & AUDIT CONTROL</div>
            <nav className="space-y-1">
              <Link href="/admin/pending" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/pending' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Approvals</span>
              </Link>
              <Link href="/admin/audit-trail" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/audit-trail' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />
                <span>Anti-Collusion Audit Trail</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 3: SaaS Control Plane */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">SAAS CONTROL PLANE</div>
            <nav className="space-y-1">
              <Link href="/admin/nodes" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/nodes' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Nodes</span>
              </Link>
              <Link href="/admin/auditors" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/auditors' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Regulatory Officials</span>
              </Link>
              <Link href="/admin/billing" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/billing' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Billing & Subscriptions</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 4: Cryptographic Engine */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">CRYPTOGRAPHIC ENGINE</div>
            <nav className="space-y-1">
              <Link href="/admin/resolution" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/resolution' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Key className="w-3.5 h-3.5" />
                <span>Identity Resolution</span>
              </Link>
              <Link href="/admin/recovery" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/recovery' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Identity Recovery</span>
              </Link>
              <Link href="/admin/overrides" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/overrides' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                <span>Network Overrides</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 5: Live Operations */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">LIVE OPERATIONS</div>
            <nav className="space-y-1">
              <Link href="/admin/noc" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/noc' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live NOC</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] text-[10px] text-slate-400 flex justify-between items-center bg-[#070b16]/80">
          <span>Anchor v2.0.0 — Root</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
