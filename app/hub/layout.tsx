import Link from "next/link";
import { LayoutDashboard, Layers, History, ShieldAlert, FileText, Users, Shield } from "lucide-react";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 animus-border-r bg-[#080808] flex flex-col justify-between">
        <div>
          <div className="p-6 animus-border-b flex items-center space-x-3">
            <Shield className="w-5 h-5 text-white" />
            <div>
              <div className="font-semibold text-sm text-white tracking-wide">Governance Hub</div>
              <div className="animus-label text-[10px]">hub.animuslab.dev</div>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-mono">
            <Link href="/hub" className="flex items-center space-x-3 px-3 py-2.5 rounded text-white bg-zinc-900 animus-border">
              <LayoutDashboard className="w-4 h-4 text-white" />
              <span>OVERVIEW</span>
            </Link>
            <Link href="/hub/projects" className="flex items-center space-x-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition">
              <Layers className="w-4 h-4" />
              <span>PROJECTS & KEYS</span>
            </Link>
            <Link href="/hub/telemetry" className="flex items-center space-x-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition">
              <History className="w-4 h-4" />
              <span>AUDIT TELEMETRY</span>
            </Link>
            <Link href="/hub/violations" className="flex items-center space-x-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition">
              <ShieldAlert className="w-4 h-4" />
              <span>VIOLATIONS</span>
            </Link>
            <Link href="/hub/reports" className="flex items-center space-x-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition">
              <FileText className="w-4 h-4" />
              <span>DIALECT REPORTS</span>
            </Link>
            <Link href="/hub/team" className="flex items-center space-x-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition">
              <Users className="w-4 h-4" />
              <span>TEAM & SEATS</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 animus-border-t font-mono text-[11px] text-zinc-500">
          <div className="text-zinc-300 font-sans">Hub Manager</div>
          <div>OWN-AN-MUM-001</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {children}
      </main>
    </div>
  );
}
