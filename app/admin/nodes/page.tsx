"use client";

import { Building2, Plus, Server } from "lucide-react";

export default function EnterpriseNodesPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">SAAS CONTROL PLANE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Enterprise Nodes</h1>
          <p className="text-sm text-slate-400 mt-1">Provision and configure isolated tenant Hub silos across multi-cloud regions.</p>
        </div>

        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Provision New Hub Node</span>
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="glass-card-inset p-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">JPMC-IN-MUM01</h3>
            <p className="text-slate-400 text-xs mt-1">Silo Region: Mumbai (ap-south-1) · Mode: Hybrid P2P</p>
          </div>
          <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px]">HEALTHY</span>
        </div>
      </div>
    </div>
  );
}
