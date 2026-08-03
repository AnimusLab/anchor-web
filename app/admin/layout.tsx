import Link from "next/link";
import { Terminal } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-mono text-xs flex flex-col">
      {/* Header */}
      <header className="animus-border-b px-8 py-4 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-white" />
          <span className="font-bold text-sm text-white tracking-wider uppercase">AnimusLab Ops Terminal</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">INTERNAL PLATFORM CONTROL</span>
        </div>

        <nav className="flex items-center space-x-6 text-zinc-400">
          <Link href="/admin" className="text-white font-bold border-b border-white pb-0.5">[01] WHITELIST & PROVISIONING</Link>
          <Link href="/admin/relays" className="hover:text-white transition">[02] GOV ACCESS RELAYS</Link>
          <Link href="/admin/billing" className="hover:text-white transition">[03] CONTRACT TIERS & KEYS</Link>
        </nav>

        <div className="text-zinc-400">
          <span>OPERATOR: </span>
          <span className="text-white font-bold">Tan (Master)</span>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6">
        {children}
      </main>
    </div>
  );
}
