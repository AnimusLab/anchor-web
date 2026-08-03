import Link from "next/link";
import { 
  LayoutDashboard, 
  Layers, 
  ShieldAlert, 
  FileText, 
  History, 
  KeyRound, 
  Users, 
  CheckCircle2, 
  Shield 
} from "lucide-react";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-bold text-sm">Governance Hub</div>
              <div className="text-xs text-slate-500 font-mono">hub.animuslab.dev</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-sm">
            <Link href="/hub" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-medium">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Overview</span>
            </Link>
            <Link href="/hub/projects" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <Layers className="w-4 h-4" />
              <span>Projects & API Keys</span>
            </Link>
            <Link href="/hub/telemetry" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <History className="w-4 h-4" />
              <span>Audit Telemetry</span>
            </Link>
            <Link href="/hub/violations" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Violations</span>
            </Link>
            <Link href="/hub/reports" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <FileText className="w-4 h-4" />
              <span>Dialect Reports</span>
            </Link>
            <Link href="/hub/team" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <Users className="w-4 h-4" />
              <span>Team & Seats</span>
            </Link>
          </nav>
        </div>

        {/* User Info / Switcher */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-300">Hub Manager</div>
            <div className="text-slate-500 font-mono">OWN-AN-MUM-001</div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>
    </div>
  );
}
