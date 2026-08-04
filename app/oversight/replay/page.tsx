"use client";

import { Play, Pause, Lock, ShieldCheck, FileText } from "lucide-react";

export default function GatedMissionReplayPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY INSPECTION PLAYER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Gated Mission Replay</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Clearance-gated step-by-step playback of AI decisions under formal investigation.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">CLEARANCE GATE: </span>
          <span className="text-emerald-400 font-bold glass-badge px-3.5 py-1.5 inline-block">AUD-RBI-IN-009 (PASSED)</span>
        </div>
      </div>

      {/* Replay Notice */}
      <div className="glass-card p-6 flex items-center space-x-4 border border-emerald-500/30">
        <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
        <div className="font-mono text-xs">
          <h3 className="text-emerald-400 font-bold text-sm font-sans">Gated Access Token Active</h3>
          <p className="text-slate-300 font-sans text-xs mt-0.5">
            Your regulatory clearance token grants read-only playback of dec_9902b execution steps. All playback interactions are logged in the auditor access ledger.
          </p>
        </div>
      </div>

      {/* Player Frame */}
      <div className="glass-card p-8 space-y-6 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-slate-400">TARGET: </span>
            <span className="text-slate-100 font-bold">wealth-advisor-agent / dec_9902b</span>
          </div>
          <span className="glass-badge px-3 py-1 text-rose-400 font-bold">FLAW FLAG ACTIVE</span>
        </div>

        <div className="p-6 bg-[#040711] border border-white/10 rounded-xl space-y-4">
          <div className="text-amber-400 font-bold">STEP 02 / 04: EU AI ACT ARTICLE 14 OVERRIDE BREACH</div>
          <pre className="text-slate-300 text-xs leading-relaxed overflow-x-auto">
{`{
  "step": 2,
  "component": "portfolio-balancer",
  "action": "EXECUTE_HIGH_YIELD_REBALANCE",
  "threshold_eur": 500000,
  "trade_value_eur": 850000,
  "dual_key_bypassed": true,
  "breach_flag": "CRITICAL_UNAUTHORIZED_EXECUTION"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
