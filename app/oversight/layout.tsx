import Link from "next/link";
import { 
  Gavel, 
  Layers, 
  ShieldAlert, 
  RotateCcw, 
  FileCheck, 
  CheckCircle, 
  Send, 
  UserCheck 
} from "lucide-react";

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] font-sans text-xs overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 animus-border-r bg-[#080808] flex flex-col justify-between flex-shrink-0">
        <div className="overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 animus-border-b">
            <div className="flex items-center space-x-2">
              <Gavel className="w-4 h-4 text-white" />
              <span className="font-bold text-sm text-white tracking-wider uppercase">Anchor Oversight</span>
            </div>
            <div className="animus-label text-[10px] mt-1">oversight.animuslab.dev</div>
          </div>

          <div className="p-3 bg-zinc-950/80 animus-border-b font-mono text-[10px]">
            <span className="text-zinc-500 block">SUBTYPE: GOVERNMENT AUDITOR</span>
            <span className="text-white font-bold">AUD-RBI-IN-009</span>
          </div>

          {/* Query Wall Notice */}
          <div className="p-3 bg-amber-950/20 animus-border-b font-mono text-[10px] text-amber-300/80 leading-relaxed">
            🔒 HARD QUERY WALL:
            WHERE entity_type = &apos;ai_agent&apos;. Codebase audit records are permanently hidden.
          </div>

          {/* Section 1: Regulatory Oversight */}
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

          {/* Section 2: Forensic Audit */}
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

          {/* Section 3: Compliance Exports */}
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

          {/* Section 4: Enforcement */}
          <div className="p-4 pt-0 space-y-2 font-mono">
            <div className="animus-label text-[9px]">ENFORCEMENT</div>
            <nav className="space-y-0.5">
              <Link href="/oversight/notices" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Gavel className="w-3.5 h-3.5 text-amber-400" />
                <span>Enforcement Notices</span>
              </Link>
              <Link href="/oversight/profile" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Auditor Profile</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 animus-border-t font-mono text-[10px] text-zinc-500 flex justify-between items-center">
          <span>RBI FREE-AI / SEC</span>
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {children}
      </main>
    </div>
  );
}
