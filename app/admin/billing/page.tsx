"use client";

import { CreditCard, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-emerald-400">SUBSCRIPTION CONTROL PLANE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Billing & Subscriptions</h1>
          <p className="text-sm text-slate-400 mt-1">Manage tenant package tiers (Starter, Base Enterprise, Growth Enterprise) and usage metering.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-3">
          <span className="animus-label text-slate-400">STARTER TIER</span>
          <div className="text-2xl font-bold text-slate-100">$4,990 / mo</div>
          <div className="text-slate-400 text-xs">1 Isolated Hub Silo</div>
        </div>
        <div className="glass-card p-6 space-y-3 border-emerald-500/30">
          <span className="animus-label text-emerald-400">BASE ENTERPRISE</span>
          <div className="text-2xl font-bold text-emerald-400">$14,990 / mo</div>
          <div className="text-slate-400 text-xs">3 Isolated Hub Silos + P2P Relay</div>
        </div>
        <div className="glass-card p-6 space-y-3">
          <span className="animus-label text-sky-400">GROWTH ENTERPRISE</span>
          <div className="text-2xl font-bold text-sky-400">$34,990 / mo</div>
          <div className="text-slate-400 text-xs">Unlimited Hub Silos + Dedicated Relay</div>
        </div>
      </div>
    </div>
  );
}
