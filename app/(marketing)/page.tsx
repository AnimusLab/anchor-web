import Link from "next/link";
import { Shield, Terminal, FileCode, ArrowRight, Lock, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="font-bold tracking-tight text-lg">Anchor</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">v2.0.0-alpha</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm text-slate-400">
          <Link href="/docs" className="hover:text-slate-200 transition">Docs</Link>
          <Link href="/manifesto" className="hover:text-slate-200 transition">Manifesto</Link>
          <Link href="/hub" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium px-4 py-2 rounded-md transition text-sm">
            Launch Hub
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 max-w-5xl mx-auto text-center py-20">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 mb-8">
          <span>EU AI Act · RBI FREE-AI · SEC 2026 Ready</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-50 max-w-4xl leading-tight">
          Deterministic, Cryptographically Auditable AI Governance
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl">
          Replacing probabilistic safety theater with mathematical enforcement. raw audit data stays on your infrastructure; the Hub receives tamper-evident decision metadata hashes.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/hub" className="flex items-center space-x-2 bg-slate-100 hover:bg-white text-slate-950 font-semibold px-6 py-3 rounded-lg transition">
            <span>Enterprise Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm px-4 py-3 rounded-lg flex items-center space-x-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>pip install anchor-audit</span>
          </div>
        </div>

        {/* Three Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <Lock className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Hybrid Data Sovereignty</h3>
            <p className="text-sm text-slate-400">
              Raw inference logs and code evidence never leave your server. The Hub only stores cryptographic metadata hashes.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <FileCode className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Regulatory Polyglottism</h3>
            <p className="text-sm text-slate-400">
              One Decision Audit Chain satisfies EU AI Act Article 12, RBI Recommendation 7, and SEC audit trails simultaneously.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Auditor Query Wall</h3>
            <p className="text-sm text-slate-400">
              Strict database query wall (`WHERE entity_type = 'ai_agent'`). Regulatory auditors never see codebase audit records.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 AnimusLab. All rights reserved. Licensed under Apache 2.0.</p>
      </footer>
    </div>
  );
}
