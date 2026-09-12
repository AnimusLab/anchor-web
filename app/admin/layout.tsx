"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import AdminLoading from "./loading";
import ThemeToggle from "@/components/ThemeToggle";
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

  // If on login gateway or root entry, render full screen gateway without sidebar
  if (pathname === "/admin/login" || pathname === "/" || pathname.endsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#03050a] text-slate-900 dark:text-slate-100 font-mono text-xs overflow-hidden relative transition-colors duration-300">
      <SolarSystemBackground />

      {/* Dynamic Glassmorphism Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col justify-between flex-shrink-0 z-20 shadow-md">
        <div className="overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="p-3.5 glass-header-box flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 pure-glass-badge rounded-lg">
                  <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-wide uppercase font-sans">
                    Anchor Root
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">admin.animuslab.dev</div>
                </div>
              </div>
              <ThemeToggle className="scale-90" />
            </div>
          </div>

          <div className="mx-4 my-3.5 p-3 pure-glass-badge rounded-xl text-[10px]">
            <span className="text-slate-500 dark:text-slate-400 block uppercase">PRIVILEGE: ROOT</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">LEVEL_ROOT_CLEARANCE</span>
          </div>

          {/* Nav Section 1: Oversight & Analytics */}
          <div className="p-4 space-y-2 border-b border-slate-200/60 dark:border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">OVERSIGHT &amp; ANALYTICS</div>
            <nav className="space-y-1">
              <Link href="/admin" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Overview</span>
              </Link>
              <Link href="/admin/telemetry" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/telemetry' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Global Telemetry</span>
              </Link>
              <Link href="/admin/fleet" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/fleet' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Server className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Fleet Inspection</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 2: Access & Audit Control */}
          <div className="p-4 pt-3 space-y-2 border-b border-slate-200/60 dark:border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">ACCESS &amp; AUDIT CONTROL</div>
            <nav className="space-y-1">
              <Link href="/admin/pending" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/pending' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Pending Approvals</span>
              </Link>
              <Link href="/admin/audit-trail" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/audit-trail' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Anti-Collusion Audit Trail</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 3: SaaS Control Plane */}
          <div className="p-4 pt-3 space-y-2 border-b border-slate-200/60 dark:border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">SAAS CONTROL PLANE</div>
            <nav className="space-y-1">
              <Link href="/admin/nodes" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/nodes' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Nodes</span>
              </Link>
              <Link href="/admin/auditors" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/auditors' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Regulatory Officials</span>
              </Link>
              <Link href="/admin/billing" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/billing' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Billing &amp; Subscriptions</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 4: Cryptographic Engine */}
          <div className="p-4 pt-3 space-y-2 border-b border-slate-200/60 dark:border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">CRYPTOGRAPHIC ENGINE</div>
            <nav className="space-y-1">
              <Link href="/admin/resolution" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/resolution' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Key className="w-3.5 h-3.5" />
                <span>Identity Resolution</span>
              </Link>
              <Link href="/admin/recovery" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/recovery' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Identity Recovery</span>
              </Link>
              <Link href="/admin/overrides" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/overrides' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Sliders className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Network Overrides</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 5: Live Operations */}
          <div className="p-4 pt-3 space-y-2">
            <div className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">LIVE OPERATIONS</div>
            <nav className="space-y-1">
              <Link href="/admin/noc" prefetch={true} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/admin/noc' ? 'glass-nav-active' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}>
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Live NOC</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] text-[10px] text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-100/70 dark:bg-[#070b16]/80">
          <span>Anchor v2.0.0 — Root</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>

      {/* Main Area with Suspense Streaming */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <Suspense fallback={<AdminLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
