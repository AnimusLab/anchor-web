"use client";

import { ShieldAlert, Gavel, UserCheck } from "lucide-react";

export default function RegulatoryOfficialsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY CREDENTIALS REGISTRY</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Regulatory Officials</h1>
          <p className="text-sm text-slate-400 mt-1">Directory of accredited government, standard, and cross-hub auditor clearance tokens.</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="glass-card-inset p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3">
              <Gavel className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100 font-sans">Reserve Bank of India (RBI) Oversight Team</h3>
            </div>
            <p className="text-slate-400 text-xs mt-1">Clearance ID: AUD-RBI-IN-009 · Type: GOVERNMENT_AUDITOR</p>
          </div>
          <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px]">ACTIVE JURISDICTION</span>
        </div>
      </div>
    </div>
  );
}
