"use client";

import { RotateCcw } from "lucide-react";

export default function IdentityRecoveryPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-600 dark:text-amber-400">DISASTER RECOVERY ENGINE</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">Identity Recovery</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Recover lost agent cryptographic keypairs using threshold shamir secret shares.</p>
        </div>
      </div>

      <div className="glass-card p-6 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
        <div className="glass-card-inset p-5 text-slate-700 dark:text-slate-300 text-xs font-mono">
          Threshold Shamir Secret Share Recovery Ready (3 of 5 Master Key Shares Required)
        </div>
      </div>
    </div>
  );
}
