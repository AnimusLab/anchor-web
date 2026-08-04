"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  PlaySquare, 
  FolderKanban, 
  Key, 
  FileText, 
  ShieldCheck, 
  Users, 
  GitPullRequest, 
  Settings,
  User,
  History
} from "lucide-react";
import { Role, AuditorType } from "@/lib/auth/clearance";

interface DynamicSidebarProps {
  userRole?: Role;
  role?: Role;
  auditorType?: AuditorType;
  hubId?: string;
  clearanceId?: string;
}

export default function DynamicSidebar({
  userRole,
  role = "HUB_MANAGER",
  auditorType,
  hubId = "JPMC-IN-MUM01",
  clearanceId = "OWN-AN-MUM-001",
}: DynamicSidebarProps) {
  const pathname = usePathname();
  const effectiveRole = userRole || role;

  const isManager = effectiveRole === "HUB_MANAGER";
  const isLeadOrManager = isManager || effectiveRole === "PROJECT_LEAD";

  return (
    <aside className="w-64 glass-sidebar flex flex-col justify-between flex-shrink-0 z-20 font-mono text-xs">
      <div className="overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08]">
          <div className="p-3.5 glass-header-box flex items-center space-x-3">
            <div className="p-2 glass-badge">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-100 tracking-wide uppercase font-sans">
                Governance Hub
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">hub.animuslab.dev</div>
            </div>
          </div>
        </div>

        {/* Clearance Badge */}
        <div className="mx-4 my-3.5 p-3 glass-badge text-[10px]">
          <span className="text-slate-400 block uppercase">CLEARANCE: {effectiveRole}</span>
          <span className="text-emerald-400 font-bold tracking-wide">{clearanceId}</span>
        </div>

        {/* Section 1: Governance & Telemetry */}
        <div className="p-4 space-y-2">
          <div className="animus-label text-[9px]">GOVERNANCE & TELEMETRY</div>
          <nav className="space-y-1">
            <Link href="/hub" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overview</span>
            </Link>
            <Link href="/hub/telemetry" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/telemetry' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Decision Telemetry</span>
            </Link>
            <Link href="/hub/violations" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/violations' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Violation Feed</span>
            </Link>
            <Link href="/hub/replay" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/replay' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <PlaySquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Mission Replay</span>
            </Link>
          </nav>
        </div>

        {/* Section 2: Projects & Ingestion */}
        <div className="p-4 pt-0 space-y-2">
          <div className="animus-label text-[9px]">PROJECTS & INGESTION</div>
          <nav className="space-y-1">
            <Link href="/hub/projects" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/projects' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
              <span>Project Inventory</span>
            </Link>
            {isLeadOrManager && (
              <Link href="/hub/keys" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/keys' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Key Vault</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Section 3: Compliance & Reports */}
        <div className="p-4 pt-0 space-y-2">
          <div className="animus-label text-[9px]">COMPLIANCE & REPORTS</div>
          <nav className="space-y-1">
            <Link href="/hub/reports" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/reports' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Dialect Reports</span>
            </Link>
            <Link href="/hub/verifier" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/verifier' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Chain Verifier</span>
            </Link>
          </nav>
        </div>

        {/* Section 4: Hub Management */}
        <div className="p-4 pt-0 space-y-2">
          <div className="animus-label text-[9px]">HUB MANAGEMENT</div>
          <nav className="space-y-1">
            <Link href="/hub/profile" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/profile' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Profile</span>
            </Link>
            {isLeadOrManager && (
              <Link href="/hub/team/activity" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/team/activity' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Team Activity</span>
              </Link>
            )}
            {isManager && (
              <>
                <Link href="/hub/team" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/team' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Team & Seats</span>
                </Link>
                <Link href="/hub/requests" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/requests' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                  <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
                  <span>P2P Access Requests</span>
                </Link>
                <Link href="/hub/settings" className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${pathname === '/hub/settings' ? 'glass-nav-active' : 'text-slate-300 hover:text-white'}`}>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hub Settings</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08] text-[10px] text-slate-400 flex justify-between items-center bg-[#070b16]/80">
        <span>Silo: {hubId}</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
    </aside>
  );
}
