import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#e5e5e5]">
      {/* Header */}
      <header className="animus-border-b px-8 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-white" />
          <span className="font-semibold tracking-wider text-base text-white uppercase">AnimusLab</span>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-zinc-400 font-mono text-xs">Anchor</span>
        </div>
        <nav className="flex items-center space-x-8 text-xs font-mono tracking-wider text-zinc-400">
          <Link href="/docs" className="hover:text-white transition uppercase">Docs</Link>
          <Link href="/manifesto" className="hover:text-white transition uppercase">Manifesto</Link>
          <Link href="/hub" className="border border-zinc-700 hover:border-white text-white px-4 py-2 transition uppercase">
            Enterprise Hub
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-8 py-24">
        <div className="animus-label mb-4">INSTITUTIONAL AI GOVERNANCE SYSTEM</div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
          Deterministic, Cryptographically Auditable Governance
        </h1>
        <div className="animus-accent-line my-8"></div>
        <p className="text-lg text-[#b3b3b3] max-w-2xl leading-relaxed">
          Replacing probabilistic safety theater with mathematical enforcement. Raw evidence remains strictly on customer servers; the Governance Hub processes non-repudiable metadata hashes.
        </p>

        {/* Technical Callout */}
        <div className="mt-12 p-6 bg-zinc-950/80 animus-border space-y-3 font-mono text-xs text-zinc-400">
          <div className="flex justify-between items-center text-zinc-300">
            <span>SPECIFICATION :: DECISION AUDIT CHAIN (DAC)</span>
            <span className="text-emerald-400">SEALED</span>
          </div>
          <p className="text-zinc-500 font-sans text-xs leading-normal">
            Satisfies EU AI Act Article 12, RBI FREE-AI Recommendation 7, CFPB Regulation B, and SEC 2026 audit trail requirements simultaneously.
          </p>
          <div className="text-white pt-2 border-t border-zinc-900 flex items-center justify-between">
            <span>$ pip install anchor-audit</span>
            <Link href="/hub" className="inline-flex items-center space-x-2 text-white hover:text-zinc-400 transition font-sans text-xs">
              <span>Enter Enterprise Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
          <div className="space-y-2">
            <div className="animus-label">01 / SOVEREIGNTY</div>
            <h3 className="font-semibold text-white text-sm">Hybrid Data Model</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero raw evidence transmission. P2P streaming for real-time audit verification.
            </p>
          </div>
          <div className="space-y-2">
            <div className="animus-label">02 / POLYGLOTTISM</div>
            <h3 className="font-semibold text-white text-sm">Regulatory Mapping</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              One audit chain entry formats dynamically to RBI, SEC, and EU AI Act standards.
            </p>
          </div>
          <div className="space-y-2">
            <div className="animus-label">03 / PRIVACY WALL</div>
            <h3 className="font-semibold text-white text-sm">Auditor Query Boundary</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hard query wall (`WHERE entity_type = &apos;ai_agent&apos;`). Codebase audits are invisible to auditors.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="animus-border-t py-8 px-8 text-center text-xs font-mono text-zinc-600 max-w-6xl mx-auto w-full">
        ANIMUSLAB © 2026 · INDEPENDENT RESEARCH INSTITUTE · APACHE 2.0
      </footer>
    </div>
  );
}
