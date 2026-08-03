export default function HubOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="animus-label mb-1">ENTERPRISE GOVERNANCE TERMINAL</div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Hub Overview</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Silo ID: JPMC-IN-MUM01 · Mode: Hybrid P2P Telemetry</p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">COMPLIANCE RATE</div>
          <div className="text-3xl font-semibold text-white">99.4%</div>
          <div className="text-[11px] text-zinc-500 font-mono">4 Active Projects</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">PACKAGE TIER</div>
          <div className="text-3xl font-semibold text-white">Base Enterprise</div>
          <div className="text-[11px] text-zinc-500 font-mono">3 Isolated Hubs</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">FLAGGED FINDINGS</div>
          <div className="text-3xl font-semibold text-white">3</div>
          <div className="text-[11px] text-zinc-500 font-mono">2 Resolved / 1 Active</div>
        </div>

        <div className="p-5 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">TELEMETRY STREAM</div>
          <div className="text-3xl font-semibold text-emerald-400">P2P Live</div>
          <div className="text-[11px] text-zinc-500 font-mono">Raw data on-premise</div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="bg-zinc-950 animus-border">
        <div className="p-4 animus-border-b flex justify-between items-center">
          <span className="animus-label">RECENT DECISION AUDIT CHAIN (DAC) ENTRIES</span>
          <span className="text-xs font-mono text-zinc-500">Live P2P Stream</span>
        </div>

        <div className="divide-y divide-zinc-900 font-mono text-xs">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">dec_9901a</span>
              <span className="text-zinc-600 mx-2">|</span>
              <span className="text-zinc-300">payments-service</span>
              <div className="text-[11px] text-zinc-600 mt-1">Chain Hash: 0x8f2a9910b42c00a1...</div>
            </div>
            <span className="text-emerald-400 font-semibold px-2 py-0.5 border border-emerald-900 bg-emerald-950/40">COMPLIANT (RBI)</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">dec_9902b</span>
              <span className="text-zinc-600 mx-2">|</span>
              <span className="text-zinc-300">wealth-advisor-agent</span>
              <div className="text-[11px] text-zinc-600 mt-1">Chain Hash: 0x4f12a8909101ff82...</div>
            </div>
            <span className="text-amber-400 font-semibold px-2 py-0.5 border border-amber-900 bg-amber-950/40">VIOLATION (EU AI ACT)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
