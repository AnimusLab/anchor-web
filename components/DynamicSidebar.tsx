"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  RotateCcw, 
  Layers, 
  Key, 
  FileText, 
  CheckCircle, 
  Users, 
  UserCheck, 
  Settings, 
  Shield,
  Gavel,
  FileCheck,
  Send
} from "lucide-react";
import { Role, AuditorType, CLEARANCE_MATRIX } from "@/lib/auth/clearance";

interface SidebarProps {
  role: Role;
  auditorType?: AuditorType;
  clearanceId: string;
}

export default function DynamicSidebar({ role, auditorType, clearanceId }: SidebarProps) {
  const pathname = usePathname();

  const canManageKeys = CLEARANCE_MATRIX.capabilities.canManageHubKeys(role) || CLEARANCE_MATRIX.capabilities.canCreateProjectKeys(role);
  const canManageSeats = CLEARANCE_MATRIX.capabilities.canManageSeats(role);
  const canApproveP2P = CLEARANCE_MATRIX.capabilities.canApproveP2PRequests(role);

  return (
    <aside className="w-64 glass-sidebar flex flex-col justify-between flex-shrink-0 z-20">
      <div className="overflow-y-auto no-scrollbar">
        {/* Glass Header Box */}
        <div className="p-4 border-b border-white/[0.08]">
          <div className="p-3.5 glass-header-box flex items-center space-x-3">
            <div className="p-2 glass-badge">
              {role === "AUDITOR" ? (
                <Gavel className="w-5 h-5 text-amber-400" />
              ) : (
                <Shield className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-100 tracking-wide uppercase">
                {role === "AUDITOR" ? "Anchor Oversight" : "Governance Hub"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {role === "AUDITOR" ? "oversight.animuslab.dev" : "hub.animuslab.dev"}
              </div>
            </div>
          </div>
        </div>

        {/* Glass Clearance Badge */}
        <div className="mx-4 my-3.5 p-3.5 glass-badge font-mono text-xs space-y-1">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">
            CLEARANCE: {auditorType || role}
          </span>
          <span className="text-slate-100 font-bold tracking-wide text-xs">{clearanceId}</span>
        </div>

        {/* Enterprise Navigation */}
        {role !== "AUDITOR" && (
          <>
            {/* Section 1: Governance & Telemetry */}
            <div className="p-4 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">GOVERNANCE & TELEMETRY</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/hub" className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${pathname === '/hub' ? 'glass-nav-active' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Overview</span>
                </Link>
                <Link href="/hub/telemetry" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Decision Telemetry</span>
                </Link>
                <Link href="/hub/violations" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Violation Feed</span>
                </Link>
                <Link href="/hub/replay" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Mission Replay</span>
                </Link>
              </nav>
            </div>

            {/* Section 2: Projects & Ingestion */}
            <div className="p-4 pt-0 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">PROJECTS & INGESTION</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/hub/projects" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Project Inventory</span>
                </Link>

                {canManageKeys && (
                  <Link href="/hub/keys" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span>API Key Vault</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Section 3: Compliance & Reports */}
            <div className="p-4 pt-0 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">COMPLIANCE & REPORTS</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/hub/reports" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Dialect Reports</span>
                </Link>
                <Link href="/hub/verifier" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span>Audit Chain Verifier</span>
                </Link>
              </nav>
            </div>

            {/* Section 4: Hub Management */}
            {(canManageSeats || canApproveP2P) && (
              <div className="p-4 pt-0 space-y-2">
                <div className="animus-label text-[10px] text-slate-400">HUB MANAGEMENT</div>
                <nav className="space-y-1.5 font-medium text-xs">
                  {canManageSeats && (
                    <Link href="/hub/team" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Team & Seats</span>
                    </Link>
                  )}
                  {canApproveP2P && (
                    <Link href="/hub/requests" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>P2P Access Requests</span>
                    </Link>
                  )}
                  <Link href="/hub/settings" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Hub Settings</span>
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Auditor Navigation */}
        {role === "AUDITOR" && (
          <>
            <div className="p-4 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">REGULATORY OVERSIGHT</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/oversight" className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${pathname === '/oversight' ? 'glass-nav-active' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Jurisdiction Overview</span>
                </Link>
                <Link href="/oversight/dac" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>Decision Audit Chain</span>
                </Link>
                <Link href="/oversight/heatmap" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Violation Heatmap</span>
                </Link>
              </nav>
            </div>

            <div className="p-4 pt-0 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">FORENSIC AUDIT</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/oversight/requests" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>P2P Pull Requests</span>
                </Link>
                <Link href="/oversight/replay" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Gated Mission Replay</span>
                </Link>
              </nav>
            </div>

            <div className="p-4 pt-0 space-y-2">
              <div className="animus-label text-[10px] text-slate-400">COMPLIANCE EXPORTS</div>
              <nav className="space-y-1.5 font-medium text-xs">
                <Link href="/oversight/dialects" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>Dialect Generator</span>
                </Link>
                <Link href="/oversight/verify" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span>Chain Verifier</span>
                </Link>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08] font-mono text-xs text-slate-400 flex justify-between items-center bg-[#070b16]/80">
        <span className="font-semibold">{role === "AUDITOR" ? "REGULATORY PORTAL" : "ENTERPRISE PORTAL"}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${role === "AUDITOR" ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`}></span>
      </div>
    </aside>
  );
}
