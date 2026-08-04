"use client";

import { Shield, Key, Mail, Calendar, Building2, CheckCircle2, GitCommit, Activity, Lock } from "lucide-react";

export default function UserProfilePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto relative z-10 font-sans text-xs">
      {/* Profile Header (GitHub Style Layout) */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Badge */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 p-1 flex-shrink-0 shadow-lg">
          <div className="w-full h-full rounded-[22px] bg-[#070b16] flex items-center justify-center font-mono text-2xl font-bold text-slate-100">
            TV
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-3 flex-1 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 font-sans">Tanishq Vaswani</h1>
              <p className="text-sky-400 font-mono text-xs">tanishq@animuslab.dev</p>
            </div>
            <span className="glass-badge px-3.5 py-1.5 text-emerald-400 font-bold text-xs">
              HUB MANAGER (FULL CLEARANCE)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Silo: JPMC-IN-MUM01</span>
            </div>
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>ID: OWN-AN-MUM-001</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: Jan 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-Style Cryptographic Activity Heatmap Grid */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 font-mono text-xs">
          <span className="animus-label text-slate-300">CRYPTOGRAPHIC SIGNING ACTIVITY (365 DAYS)</span>
          <span className="text-slate-400">1,482 Signed DAC Blocks</span>
        </div>

        {/* Simulated Heatmap Squares */}
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 py-2">
          {Array.from({ length: 96 }).map((_, i) => {
            const intensity = i % 5;
            const bgClass =
              intensity === 4
                ? "bg-emerald-400"
                : intensity === 3
                ? "bg-emerald-500/70"
                : intensity === 2
                ? "bg-emerald-700/50"
                : intensity === 1
                ? "bg-emerald-950/40"
                : "bg-white/5";
            return <div key={i} className={`w-3 h-3 rounded-sm ${bgClass}`} title={`Day ${i + 1}`} />;
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
          <span>Less Activity</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-white/5 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700/50 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
          </div>
          <span>More Activity</span>
        </div>
      </div>

      {/* Recent Cryptographic Actions Log */}
      <div className="glass-card p-6 space-y-4 font-mono text-xs">
        <div className="animus-label text-sky-400">RECENT GOVERNANCE CONTRIBUTIONS</div>

        <div className="space-y-3">
          <div className="glass-card-inset p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>Signed Dual-Key P2P Pull Request <strong className="text-slate-100">req_7701</strong></span>
            </div>
            <span className="text-slate-500 text-[11px]">2 hours ago</span>
          </div>

          <div className="glass-card-inset p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Key className="w-4 h-4 text-sky-400" />
              <span>Provisioned Vault Key <strong className="text-slate-100">prod-payments-ingest</strong></span>
            </div>
            <span className="text-slate-500 text-[11px]"> Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
