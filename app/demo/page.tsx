"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck, AlertTriangle, Layers, ArrowRight, CheckCircle2, Lock, Terminal, Zap } from "lucide-react";

export default function InstantDemoSandboxPage() {
  const [handle, setHandle] = useState("acme-corp");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleLaunchSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      setIsReady(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#040508] text-white font-mono selection:bg-[#10b981] selection:text-slate-950 flex flex-col justify-between relative overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_60%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-8 py-6 relative z-20 flex justify-between items-center border-b border-white/10 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-emerald-400 flex items-center justify-center font-bold text-slate-950 font-mono shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            ⚡
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Anchor Demo</div>
            <div className="text-[10px] font-mono text-[#10b981]">1-MONTH FREE SANDBOX</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="glass-badge px-3 py-1 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>30-DAY TRIAL ACTIVE</span>
          </span>

          <Link href="/login">
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition">
              Sign In to Production →
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      {!isReady ? (
        <main className="max-w-4xl mx-auto px-6 py-16 w-full text-center relative z-10 my-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            <span>Friction-Free Sandbox Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Instant 30-Day Free Trial
          </h1>

          <p className="text-sm text-[#6C7293] max-w-xl mx-auto leading-relaxed">
            Experience AnimusLab Anchor’s real-time AI decision telemetry, OWASP prompt injection circuit breakers, and tamper-evident audit chains with zero setup friction.
          </p>

          <form onSubmit={handleLaunchSandbox} className="max-w-md mx-auto space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[#6C7293] font-bold tracking-wider block text-xs">
                CHOOSE SANDBOX ORGANIZATIONAL HANDLE
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. acme-corp or fintech-sandbox"
                className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#10b981] text-white tracking-widest transition text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isProvisioning}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-slate-950 py-4 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-[#10b981]/20 transition-all duration-200 font-sans flex items-center justify-center space-x-2 text-sm"
            >
              {isProvisioning ? (
                <span>PROVISIONING SANDBOX NODE...</span>
              ) : (
                <>
                  <span>Launch 1-Month Free Sandbox →</span>
                </>
              )}
            </button>
          </form>

          <div className="text-[11px] text-[#6C7293] pt-4 font-mono">
            No credit card, no password, and no identity credentials required. Auto-terminates in 30 calendar days.
          </div>
        </main>
      ) : (
        /* LIVE SANDBOX CONTROL PANEL PREVIEW */
        <main className="max-w-7xl mx-auto px-6 py-8 w-full relative z-10 space-y-8 my-auto">
          {/* Top Trial Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-400 uppercase">⚡ INSTANT DEMO ENVIRONMENT ACTIVE</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Silo ID: {handle.toUpperCase()}-SOL01 · Mode: 30-Day Sandbox Telemetry</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="glass-badge px-3.5 py-1.5 text-emerald-400 font-bold">29 DAYS REMAINING</span>
              <Link href="/login">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition">
                  Upgrade to Production Sovereign Hub →
                </button>
              </Link>
            </div>
          </div>

          {/* Sandbox Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="glass-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="animus-label text-slate-400">COMPLIANCE INDEX</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-2">100.0%</div>
              <div className="text-xs text-slate-400 font-mono">Sandbox Verified</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="animus-label text-slate-400">AI DECISIONS</span>
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-2">142,890</div>
              <div className="text-xs text-slate-400 font-mono">1,820 msg / sec</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="animus-label text-amber-400">CIRCUIT BREAKERS</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400 mt-2">3 Flaws Trapped</div>
              <div className="text-xs text-slate-400 font-mono">OWASP Injection Blocked</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="animus-label text-slate-400">GOVERNANCE RULES</span>
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">170 Enforced</div>
              <div className="text-xs text-slate-400 font-mono">Articles 5–99 Active</div>
            </div>
          </div>

          {/* Sandbox Live Telemetry Stream */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#070b16]/60">
              <span className="animus-label text-slate-300">LIVE DEMO DECISION AUDIT CHAIN (DAC)</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">Real-Time Simulation</span>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="glass-card-inset p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-l-2 border-emerald-500">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold">dec_demo_8801</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-semibold">credit-agent-v2</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Chain Hash: 0x9f81a7001b22ff89a012</div>
                </div>
                <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px]">
                  RBI COMPLIANT
                </span>
              </div>

              <div className="glass-card-inset p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-l-2 border-amber-500">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold">dec_demo_8802</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-semibold">customer-chat-bot</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Chain Hash: 0x4aa01f88219001bca2</div>
                </div>
                <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px]">
                  PROMPT INJECTION TRAPPED (OWASP LLM01)
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between items-center relative z-20 max-w-7xl mx-auto w-full">
        <div>DEMO ENVIRONMENT: 30-DAY FREE TRIAL</div>
        <div>ANIMUSLAB ANCHOR V6.0</div>
      </footer>
    </div>
  );
}
