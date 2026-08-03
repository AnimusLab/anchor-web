import Link from "next/link";
import { Gavel } from "lucide-react";

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] flex flex-col font-sans">
      {/* Header */}
      <header className="animus-border-b px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gavel className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-wider text-sm uppercase">Anchor Oversight</span>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-zinc-400 font-mono text-xs">Regulatory Portal</span>
        </div>

        <nav className="flex items-center space-x-8 text-xs font-mono tracking-wider text-zinc-400">
          <Link href="/oversight" className="text-white border-b-2 border-white pb-1 uppercase">Overview</Link>
          <Link href="/oversight/requests" className="hover:text-white transition uppercase">P2P Requests</Link>
          <Link href="/oversight/dialects" className="hover:text-white transition uppercase">Dialect Exports</Link>
          <Link href="/oversight/verify" className="hover:text-white transition uppercase">Verifier</Link>
        </nav>

        <div className="text-xs font-mono text-zinc-400">
          <span>Official: </span>
          <span className="text-white font-bold">AUD-RBI-IN-009</span>
        </div>
      </header>

      {/* Query Wall Notice */}
      <div className="animus-border-b bg-zinc-950 px-8 py-2.5 text-xs text-zinc-400 font-mono flex justify-between items-center">
        <span>🔒 STRICT QUERY WALL: WHERE entity_type = &apos;ai_agent&apos;. Codebase audit records are inaccessible to regulatory accounts.</span>
        <span className="text-zinc-500">Jurisdiction: INDIA (RBI FREE-AI)</span>
      </div>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {children}
      </main>
    </div>
  );
}
