export default function OversightDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="animus-label mb-1 text-slate-300">REGULATORY OVERSIGHT TERMINAL</div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Assigned Jurisdiction Compliance</h1>
        <p className="text-sm text-slate-400 font-mono mt-1">Read-only oversight telemetry & DAC verification across assigned regulated entities.</p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="animus-card p-6 space-y-2">
          <div className="animus-label text-slate-300">ASSIGNED ENTITIES</div>
          <div className="text-3xl font-bold text-slate-100 mt-1">6 Inst.</div>
          <div className="text-xs text-slate-400 font-mono">Region: RBI-IN</div>
        </div>

        <div className="animus-card p-6 space-y-2">
          <div className="animus-label text-slate-300">AI DECISIONS AUDITED</div>
          <div className="text-3xl font-bold text-slate-100 mt-1">1,482,910</div>
          <div className="text-xs text-slate-400 font-mono">100% Chain Hash Signed</div>
        </div>

        <div className="animus-card p-6 space-y-2">
          <div className="animus-label text-slate-300">P2P FORENSIC PULLS</div>
          <div className="text-3xl font-bold text-slate-100 mt-1">2 Relayed</div>
          <div className="text-xs text-slate-400 font-mono">Via AnimusLab Relay</div>
        </div>

        <div className="animus-card p-6 space-y-2">
          <div className="animus-label text-slate-300">ENFORCEMENT NOTICES</div>
          <div className="text-3xl font-bold text-slate-100 mt-1">0 Active</div>
          <div className="text-xs text-slate-400 font-mono">No Active Disputes</div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="animus-card overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <span className="animus-label text-slate-300">DECISION AUDIT CHAIN (AI DECISIONS ONLY)</span>
          <span className="text-xs font-mono text-slate-400 font-semibold">Tamper-Proof Ledger</span>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          <div className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition">
            <div>
              <span className="text-slate-100 font-bold text-sm">JPMC-IN-MUM01</span>
              <span className="text-slate-500 mx-3">|</span>
              <span className="text-slate-200 font-semibold">credit-decisioning-v4</span>
              <div className="text-xs text-slate-400 mt-1">Chain Hash: 0x9a8f21b7c00e12...</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-bold px-3 py-1 rounded-md border border-emerald-800/80 bg-emerald-950/60">
                RBI COMPLIANT
              </span>
              <button className="border border-slate-700 hover:border-slate-400 text-slate-200 px-3.5 py-1.5 rounded-md text-xs font-semibold transition">
                Request P2P Pull
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
