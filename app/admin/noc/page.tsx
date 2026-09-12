"use client";

import { Activity, ShieldCheck, Server, RefreshCw } from "lucide-react";

export default function LiveNocPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-emerald-600 dark:text-emerald-400">NETWORK OPERATIONS CENTER</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">Live NOC</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time infrastructure health, relay socket connections, and system vitals.</p>
        </div>

        <span className="glass-badge px-4 py-2 text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-2 border border-emerald-300 dark:border-emerald-500/30">
          <Activity className="w-4 h-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
          <span>NOC STREAM LIVE</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
          <span className="animus-label text-slate-500 dark:text-slate-400">P2P RELAY SOCKETS</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">12 / 12 Connected</div>
        </div>
        <div className="glass-card p-6 space-y-2 bg-slate-50 dark:bg-black/30 border border-emerald-300 dark:border-emerald-500/30">
          <span className="animus-label text-emerald-600 dark:text-emerald-400">API GATEWAY HEALTH</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100.0%</div>
        </div>
        <div className="glass-card p-6 space-y-2 bg-slate-50 dark:bg-black/30 border border-sky-300 dark:border-sky-500/30">
          <span className="animus-label text-sky-600 dark:text-sky-400">DATABASE IOPS</span>
          <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-1">1,240 IOPS</div>
        </div>
        <div className="glass-card p-6 space-y-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
          <span className="animus-label text-slate-500 dark:text-slate-400">CPU UTILIZATION</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">14.2%</div>
        </div>
      </div>
    </div>
  );
}
