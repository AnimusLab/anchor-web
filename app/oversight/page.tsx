export default function OversightDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="animus-label mb-1">REGULATORY OVERSIGHT TERMINAL</div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Assigned Jurisdiction Compliance</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Read-only oversight telemetry & DAC verification across assigned regulated entities.</p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">ASSIGNED ENTITIES</div>
          <div className="text-3xl font-semibold text-white">6 Inst.</div>
          <div className="text-[11px] text-zinc-500 font-mono">Region: RBI-IN</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">AI DECISIONS AUDITED</div>
          <div className="text-3xl font-semibold text-white">1,482,910</div>
          <div className="text-[11px] text-zinc-500 font-mono">100% Chain Hash Signed</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">P2P FORENSIC PULLS</div>
          <div className="text-3xl font-semibold text-white">2 Relayed</div>
          <div className="text-[11px] text-zinc-500 font-mono">Via AnimusLab Relay</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">ENFORCEMENT NOTICES</div>
          <div className="text-3xl font-semibold text-white">0 Active</div>
          <div className="text-[11px] text-zinc-500 font-mono">No Active Disputes</div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="bg-zinc-950 animus-border">
        <div className="p-4 animus-border-b flex justify-between items-center">
          <span className="animus-label">DECISION AUDIT CHAIN (AI DECISIONS ONLY)</span>
          <span className="text-xs font-mono text-zinc-500">Tamper-Proof Ledger</span>
        </div>

        <div className="divide-y divide-zinc-900 font-mono text-xs">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">JPMC-IN-MUM01</span>
              <span className="text-zinc-600 mx-2">|</span>
              <span className="text-zinc-300">credit-decisioning-v4</span>
              <div className="text-[11px] text-zinc-600 mt-1">Chain Hash: 0x9a8f21b7c00e12...</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-semibold px-2 py-0.5 border border-emerald-900 bg-emerald-950/40">RBI COMPLIANT</span>
              <button className="border border-zinc-700 hover:border-white text-white px-3 py-1 text-[11px] font-sans transition">
                Request P2P Pull
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
