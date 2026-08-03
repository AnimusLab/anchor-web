import Link from "next/link";
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
  Shield 
} from "lucide-react";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] font-sans text-xs overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 animus-border-r bg-[#080808] flex flex-col justify-between flex-shrink-0">
        <div className="overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 animus-border-b">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="font-bold text-sm text-white tracking-wider uppercase">Governance Hub</span>
            </div>
            <div className="animus-label text-[10px] mt-1">hub.animuslab.dev</div>
          </div>

          <div className="p-3 bg-zinc-950/80 animus-border-b font-mono text-[10px]">
            <span className="text-zinc-500 block">CLEARANCE: HUB MANAGER</span>
            <span className="text-white font-bold">OWN-AN-MUM-001</span>
          </div>

          {/* Section 1: Governance & Telemetry */}
          <div className="p-4 space-y-2 font-mono">
            <div className="animus-label text-[9px]">GOVERNANCE & TELEMETRY</div>
            <nav className="space-y-0.5">
              <Link href="/hub" className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-white bg-zinc-900 animus-border">
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
              <Link href="/hub/keys" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Key Vault</span>
              </Link>
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

          {/* Section 4: Hub Management */}
          <div className="p-4 pt-0 space-y-2 font-mono">
            <div className="animus-label text-[9px]">HUB MANAGEMENT</div>
            <nav className="space-y-0.5">
              <Link href="/hub/team" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Users className="w-3.5 h-3.5" />
                <span>Team & Seats</span>
              </Link>
              <Link href="/hub/requests" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>P2P Access Requests</span>
              </Link>
              <Link href="/hub/settings" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Settings className="w-3.5 h-3.5" />
                <span>Hub Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 animus-border-t font-mono text-[10px] text-zinc-500 flex justify-between items-center">
          <span>JPMC-IN-MUM01</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {children}
      </main>
    </div>
  );
}
