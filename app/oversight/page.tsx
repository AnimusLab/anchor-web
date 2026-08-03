import { ShieldAlert, FileText, Send, Lock, ShieldCheck, Layers, Activity } from "lucide-react";

export default function OversightDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner (3D Neomorphic Card) */}
      <div className="neo-card-3d p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY OVERSIGHT TERMINAL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Assigned Jurisdiction Compliance</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Read-only oversight telemetry & DAC verification across assigned regulated entities.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">CLEARANCE: </span>
          <span className="text-amber-400 font-bold skeuo-badge-3d px-3.5 py-1.5 inline-block">
            GOVERNMENT AUDITOR (RBI)
          </span>
        </div>
      </div>

      {/* 3D Neomorphic Molded KPI Blocks (Fixing plain text float issue) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="neo-card-3d p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">ASSIGNED ENTITIES</span>
            <Layers className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">6 Inst.</div>
          <div className="text-xs text-slate-400 font-mono">Region: RBI-IN</div>
        </div>

        <div className="neo-card-3d p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">AI DECISIONS AUDITED</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">1,482,910</div>
          <div className="text-xs text-slate-400 font-mono">100% Chain Hash Signed</div>
        </div>

        <div className="neo-card-3d p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-amber-400">P2P FORENSIC PULLS</span>
            <Send className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">2 Relayed</div>
          <div className="text-xs text-slate-400 font-mono">Via AnimusLab Relay</div>
        </div>

        <div className="neo-card-3d p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">ENFORCEMENT NOTICES</span>
            <ShieldAlert className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">0 Active</div>
          <div className="text-xs text-slate-400 font-mono">No Active Disputes</div>
        </div>
      </div>

      {/* Decision Audit Log Stream (3D Neomorphic Box) */}
      <div className="neo-card-3d overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b14]">
          <span className="animus-label text-slate-300">DECISION AUDIT CHAIN (AI DECISIONS ONLY)</span>
          <span className="text-xs font-mono text-slate-400 font-semibold">Tamper-Proof Ledger</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="neo-card-inset-3d p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-100 font-bold text-base">JPMC-IN-MUM01</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-200 font-semibold">credit-decisioning-v4</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Chain Hash: 0x9a8f21b7c00e12...</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-bold skeuo-badge-3d px-3.5 py-1.5">
                RBI COMPLIANT
              </span>
              <button className="skeuo-badge-3d text-slate-200 px-4 py-2 font-semibold hover:text-white transition flex items-center space-x-2">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Request P2P Pull</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
