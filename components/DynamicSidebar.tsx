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
    <aside className="w-64 animus-border-r bg-[#080808] flex flex-col justify-between flex-shrink-0">
      <div className="overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="p-4 animus-border-b">
          <div className="flex items-center space-x-2">
            {role === "AUDITOR" ? (
              <Gavel className="w-4 h-4 text-white" />
            ) : (
              <Shield className="w-4 h-4 text-white" />
            )}
            <span className="font-bold text-sm text-white tracking-wider uppercase">
              {role === "AUDITOR" ? "Anchor Oversight" : "Governance Hub"}
            </span>
          </div>
          <div className="animus-label text-[10px] mt-1">
            {role === "AUDITOR" ? "oversight.animuslab.dev" : "hub.animuslab.dev"}
          </div>
        </div>

        {/* Clearance Badge */}
        <div className="p-3 bg-zinc-950/80 animus-border-b font-mono text-[10px]">
          <span className="text-zinc-500 block uppercase">
            CLEARANCE: {auditorType || role}
          </span>
          <span className="text-white font-bold">{clearanceId}</span>
        </div>

        {/* Auditor Hard Query Wall Banner */}
        {role === "AUDITOR" && (
          <div className="p-3 bg-amber-950/20 animus-border-b font-mono text-[10px] text-amber-300/80 leading-relaxed">
            🔒 HARD QUERY WALL:
            WHERE entity_type = &apos;ai_agent&apos;. Codebase audit records are permanently hidden.
          </div>
        )}

        {/* Enterprise Navigation (Managers, Leads, Devs) */}
        {role !== "AUDITOR" && (
          <>
            {/* Section 1: Governance & Telemetry */}
            <div className="p-4 space-y-2 font-mono">
              <div className="animus-label text-[9px]">GOVERNANCE & TELEMETRY</div>
              <nav className="space-y-0.5">
                <Link href="/hub" className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded ${pathname === '/hub' ? 'text-white bg-zinc-900 animus-border' : 'text-zinc-400 hover:text-white transition'}`}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link href="/hub/telemetry" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <History className="w-3.5 h-3.5" />
                  <span>Decision Telemetry</span>
                </Link>
                <Link href="/hub/violations" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Violation Feed</span>
                </Link>
                <Link href="/hub/replay" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mission Replay</span>
                </Link>
              </nav>
            </div>

            {/* Section 2: Projects & Ingestion */}
            <div className="p-4 pt-0 space-y-2 font-mono">
              <div className="animus-label text-[9px]">PROJECTS & INGESTION</div>
              <nav className="space-y-0.5">
                <Link href="/hub/projects" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Project Inventory</span>
                </Link>

                {/* ONLY RENDERED IF AUTHORIZED FOR KEYS */}
                {canManageKeys && (
                  <Link href="/hub/keys" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>API Key Vault</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Section 3: Compliance & Reports */}
            <div className="p-4 pt-0 space-y-2 font-mono">
              <div className="animus-label text-[9px]">COMPLIANCE & REPORTS</div>
              <nav className="space-y-0.5">
                <Link href="/hub/reports" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dialect Reports</span>
                </Link>
                <Link href="/hub/verifier" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Audit Chain Verifier</span>
                </Link>
              </nav>
            </div>

            {/* Section 4: Hub Management (Gated to Managers & Admin) */}
            {(canManageSeats || canApproveP2P) && (
              <div className="p-4 pt-0 space-y-2 font-mono">
                <div className="animus-label text-[9px]">HUB MANAGEMENT</div>
                <nav className="space-y-0.5">
                  {canManageSeats && (
                    <Link href="/hub/team" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team & Seats</span>
                    </Link>
                  )}
                  {canApproveP2P && (
                    <Link href="/hub/requests" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>P2P Access Requests</span>
                    </Link>
                  )}
                  <Link href="/hub/settings" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Hub Settings</span>
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Auditor Navigation (Standard, Cross-Hub, Gov) */}
        {role === "AUDITOR" && (
          <>
            <div className="p-4 space-y-2 font-mono">
              <div className="animus-label text-[9px]">REGULATORY OVERSIGHT</div>
              <nav className="space-y-0.5">
                <Link href="/oversight" className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-white bg-zinc-900 animus-border">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Jurisdiction Overview</span>
                </Link>
                <Link href="/oversight/dac" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Decision Audit Chain</span>
                </Link>
                <Link href="/oversight/heatmap" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Violation Heatmap</span>
                </Link>
              </nav>
            </div>

            <div className="p-4 pt-0 space-y-2 font-mono">
              <div className="animus-label text-[9px]">FORENSIC AUDIT</div>
              <nav className="space-y-0.5">
                <Link href="/oversight/requests" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>P2P Pull Requests</span>
                </Link>
                <Link href="/oversight/replay" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Gated Mission Replay</span>
                </Link>
              </nav>
            </div>

            <div className="p-4 pt-0 space-y-2 font-mono">
              <div className="animus-label text-[9px]">COMPLIANCE EXPORTS</div>
              <nav className="space-y-0.5">
                <Link href="/oversight/dialects" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Dialect Generator</span>
                </Link>
                <Link href="/oversight/verify" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Chain Verifier</span>
                </Link>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 animus-border-t font-mono text-[10px] text-zinc-500 flex justify-between items-center">
        <span>{role === "AUDITOR" ? "REGULATORY PORTAL" : "ENTERPRISE PORTAL"}</span>
        <span className={`w-2 h-2 rounded-full ${role === "AUDITOR" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
      </div>
    </aside>
  );
}
