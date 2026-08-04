"use client";

import { UserCheck, CheckCircle2, XCircle } from "lucide-react";

export default function PendingApprovalsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">ACCESS APPROVAL QUEUE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Pending Approvals</h1>
          <p className="text-sm text-slate-400 mt-1">Review user registration whitelist requests and auditor clearance approvals.</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-sky-400 font-bold text-base">rbi_auditor_09@rbi.org.in</span>
              <span className="glass-badge px-2.5 py-0.5 text-amber-400 font-bold text-[10px]">GOVERNMENT_AUDITOR</span>
            </div>
            <div className="text-slate-400 text-xs mt-1">
              Organization: Reserve Bank of India · Domain Auto-Check: <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="glass-badge text-emerald-400 px-4 py-2 font-bold text-xs hover:bg-emerald-950/40 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Provision</span>
            </button>
            <button className="glass-badge text-rose-400 px-4 py-2 font-bold text-xs hover:bg-rose-950/40 flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
