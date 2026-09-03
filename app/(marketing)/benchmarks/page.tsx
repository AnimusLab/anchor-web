"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Shield, Lock, FileCheck, Scale, Cpu, Globe, Server, 
  Key, Users, Zap, Activity, HardDrive, Network, BarChart3, Sun, Moon, Info 
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";

/* ─────────────────────────────────────────────────────────
   ANCHOR PROTOCOL — BENCHMARKS & SYSTEM TOPOGRAPHY (/benchmarks)
   Light Mode: Pure White 3D Cards, Pure Black & Blue Text
   Dark Mode: Pure Black 3D Cards, Pure White & Blue Text
───────────────────────────────────────────────────────── */

const LATENCY_METRICS = [
  { metric: "p50 Runtime Intercept", value: "0.18 ms", sub: "180 microseconds (PyO3 Rust FFI)", highlight: false },
  { metric: "p90 Runtime Intercept", value: "0.28 ms", sub: "280 microseconds", highlight: false },
  { metric: "p99 Runtime Intercept", value: "0.38 ms", sub: "380 microseconds (tail latency)", highlight: true },
  { metric: "Layer 1 AST Full Scan", value: "18.4 ms", sub: "50,000 LOC / 120 AST rules", highlight: false },
];

const BENCHMARK_COMPARISON = [
  { name: "Anchor Layer 2 (In-Process PyO3 Rust FFI)", latency: "0.35 ms", ms: 0.35, color: "#2563EB", highlight: true },
  { name: "LangSmith Async Telemetry Sink", latency: "85.00 ms", ms: 85, color: "#64748B", highlight: false },
  { name: "Guardrails AI (Python Regex & Wrapper)", latency: "180.00 ms", ms: 180, color: "#64748B", highlight: false },
  { name: "NeMo Guardrails (Secondary LLM Judge)", latency: "240.00 ms", ms: 240, color: "#64748B", highlight: false },
  { name: "Full Secondary LLM Review (e.g. GPT-4o-mini)", latency: "380.00 ms", ms: 380, color: "#64748B", highlight: false },
];

const TESTBED_SPECS = [
  { label: "Cloud Instance", value: "AWS c6i.4xlarge (Dedicated Compute)" },
  { label: "Processor", value: "Intel Xeon Platinum 8375C @ 2.90GHz (16 vCPUs)" },
  { label: "Memory", value: "32 GB DDR4-3200MHz ECC" },
  { label: "Operating System", value: "Ubuntu 22.04 LTS (Linux Kernel 6.5 x86_64)" },
  { label: "Sample Size", value: "1,000,000 synthetic payload iterations" },
  { label: "Execution Layer", value: "In-Process Zero-Copy PyO3 FFI pointer passing" },
];

export default function BenchmarksPage() {
  const { isDark, mounted, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-[#09090C] text-black dark:text-white">
      {/* ── FLOATING 3D NAV CAPSULE ─────────────────────────────────────── */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between gap-6 sm:gap-8 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full lp-nav-3d text-white backdrop-blur-2xl max-w-4xl w-full sm:w-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: "none" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
              <AnchorLogo size={16} variant="monochrome" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">anchor</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium text-slate-300 whitespace-nowrap">
            <Link href="/#product" className="hover:text-white transition-colors">Product</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/benchmarks" className="text-white font-semibold underline underline-offset-4">Benchmarks</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors whitespace-nowrap">Case Studies</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-200 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                )}
              </button>
            )}

            <Link href="/login" className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full lp-nav-btn-3d whitespace-nowrap" style={{ textDecoration: "none" }}>
              + Get access
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 text-center border-b border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(147,197,253,0.06)_45%,transparent_70%)] blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Empirical Benchmarks &amp; System Topography</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-950 dark:text-white">
            Sub-Millisecond Guardrails. <br />
            <span className="serif-em text-blue-600 dark:text-blue-400 font-bold">Zero Hot-Path Overhead.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-3xl mx-auto font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            Measured under rigorous high-frequency load on dedicated hardware testbeds: <strong className="text-slate-950 dark:text-white">100,000+ operations/sec</strong> per node with p99 runtime latency under <strong className="text-slate-950 dark:text-white">0.38 milliseconds</strong>.
          </p>
        </div>
      </section>

      {/* ── 01. LATENCY METRIC CARDS ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto space-y-20">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LATENCY_METRICS.map((item) => (
              <div
                key={item.metric}
                className={`p-8 ${
                  item.highlight
                    ? "lp-item-selected"
                    : "lp-card-3d"
                }`}
              >
                <p className={`text-xs font-mono font-bold uppercase tracking-wider ${item.highlight ? "text-blue-800 dark:text-blue-300" : "text-slate-700 dark:text-slate-400"}`}>{item.metric}</p>
                <div className="mt-4">
                  <p className="text-4xl font-extrabold font-mono text-slate-950 dark:text-white">
                    {item.value}
                  </p>
                  <p className={`text-xs mt-1 font-semibold ${item.highlight ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-400"}`}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 02. HARDWARE TESTBED & BENCHMARK PARAMETERS ── */}
          <div className="p-8 sm:p-12 lp-card-3d space-y-6">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-mono font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider">Benchmark Parameters &amp; Testbed Topography</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">Why Anchor Achieves &lt; 0.4ms Execution Latency</h2>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed max-w-4xl">
              Unlike LLM proxy wrappers that route payloads through external network hops or invoke secondary language models, Anchor executes <strong className="text-slate-950 dark:text-white">in-process via zero-copy PyO3 Rust FFI pointer passing</strong>. When decorated with <code className="font-mono text-blue-700 dark:text-blue-400 font-bold">@anchor.guard</code>, input arguments are evaluated directly against pre-compiled AST invariants in memory.
            </p>

            {/* Testbed Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {TESTBED_SPECS.map((spec) => (
                <div key={spec.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="text-[11px] font-mono uppercase text-slate-700 dark:text-slate-400 font-bold">{spec.label}</p>
                  <p className="text-xs font-mono font-bold text-slate-950 dark:text-white">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 03. COMPARATIVE LATENCY BAR CHART ── */}
          <div className="p-8 sm:p-12 lp-card-3d space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">Execution Overhead Comparison</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">Inference Latency Impact (Lower is Better)</h2>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Comparing Anchor in-process Rust FFI against network sidecars and secondary LLM judges.</p>
            </div>

            <div className="space-y-6 pt-4">
              {BENCHMARK_COMPARISON.map((b) => {
                const pct = Math.max(1.5, (b.ms / 380) * 100);
                return (
                  <div key={b.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                      <span className="text-slate-950 dark:text-white font-bold">{b.name}</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {b.latency}
                      </span>
                    </div>
                    <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          b.highlight ? "bg-blue-600 shadow-sm" : "bg-slate-400 dark:bg-slate-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 04. SYSTEM TOPOGRAPHY ARCHITECTURE ── */}
          <div className="p-8 sm:p-12 lp-card-3d space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <p className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">Federated Network Topology</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">How Anchor Connects: Spoke to Hub</h2>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                Raw AI data never leaves the client's sovereign spoke node. Only cryptographically hashed Ed25519 state packets synchronize with the Hub.
              </p>
            </div>

            {/* Topography Visual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold mb-3">01</div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Client Execution Node</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">AI agent models, pipelines, and tools running in client VPC / on-premise infrastructure.</p>
                </div>
                <p className="text-[11px] font-mono text-blue-700 dark:text-blue-400 pt-3 border-t border-slate-200 dark:border-white/10 font-bold">@anchor.guard hook</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center font-mono text-xs font-bold mb-3">02</div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Anchor Core Engine</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">Zero-copy PyO3 Rust kernel evaluates AST parameters in &lt; 0.35ms.</p>
                </div>
                <p className="text-[11px] font-mono text-purple-700 dark:text-purple-400 pt-3 border-t border-slate-200 dark:border-white/10 font-bold">Deterministic verdict</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-mono text-xs font-bold mb-3">03</div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Local DAC Storage</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">Appends cryptographic SHA-256 chain-hash to local tamper-evident disk ledger.</p>
                </div>
                <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 pt-3 border-t border-slate-200 dark:border-white/10 font-bold">Immutable proof</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold mb-3">04</div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Spoke Telemetry Relay</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">Async queue transmits zero-knowledge Ed25519 signed state hashes to the Hub.</p>
                </div>
                <p className="text-[11px] font-mono text-blue-700 dark:text-blue-400 pt-3 border-t border-slate-200 dark:border-white/10 font-bold">Non-blocking sync</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-bold mb-3">05</div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Enterprise Hub &amp; Oversight</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 font-medium">Centralized dashboard, dual-key auditor pulls, and automated statutory dialect translation.</p>
                </div>
                <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 pt-3 border-t border-slate-200 dark:border-white/10 font-bold">Dual-key portal</p>
              </div>
            </div>
          </div>

          {/* ── 05. RESOURCE CONSUMPTION SPECS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 lp-card-3d space-y-3">
              <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Memory Footprint</h3>
              <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">&lt; 25 MB</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">Resident Set Size (RSS) per spoke node process during sustained 10K req/sec load.</p>
            </div>

            <div className="p-8 lp-card-3d space-y-3">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">CPU Utilization</h3>
              <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">&lt; 1.2% Core</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">Zero-copy byte serialization avoids Python GIL bottlenecks and GC pauses.</p>
            </div>

            <div className="p-8 lp-card-3d space-y-3">
              <Network className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Throughput Scaling</h3>
              <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">100K+ ops/s</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">Single node throughput capacity without scaling sidecar proxies.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0B0B0E] text-white pt-20 pb-16 border-t border-white/5 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AnchorLogo size={16} variant="monochrome" />
            <span className="text-white font-bold">anchor protocol</span>
            <span>· © 2026 AnimusLab</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="mailto:tan@animuslab.dev" className="hover:text-white transition-colors">Contact Founder</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
