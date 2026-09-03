"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, Scale, Cpu, ArrowRight, FileCheck, Globe, Bell, Key, Users, BarChart3, Binary, Sun, Moon } from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";

/* ─────────────────────────────────────────────────────────
   ANCHOR — SAAS LANDING PAGE (Espeya Editorial Design)
   Floating Nav Capsule with Dark/Light Switch · Full-screen Hero with Natural Sunbeam Inflow
───────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Binary,    label: "Runtime enforcement" },
  { icon: Lock,      label: "Zero-knowledge telemetry" },
  { icon: FileCheck, label: "Audit chain" },
  { icon: Scale,     label: "Jurisdictional mapping" },
  { icon: Bell,      label: "Instant interception" },
  { icon: Globe,     label: "Multi-framework" },
  { icon: Key,       label: "Cryptographic signing" },
  { icon: Users,     label: "Team clearances" },
  { icon: BarChart3, label: "Compliance dashboards" },
];

const USE_CASES = [
  { title: "Fintech AI teams",       desc: "Deploy trading algorithms and lending models with runtime guardrails that satisfy RBI, SEC, and FCA simultaneously — out of the box." },
  { title: "Regulatory bodies",      desc: "Inspect enterprise AI deployments through a dedicated oversight portal. Pull signed forensic telemetry without touching production systems." },
  { title: "Healthcare AI",          desc: "Enforce HIPAA and EU AI Act Article 5 prohibitions on sensitive biometric inference — at the model call, not the audit log." },
  { title: "Internal audit teams",   desc: "Get a cryptographically sealed, chain-hashed ledger your compliance team can hand directly to external auditors." },
  { title: "Insurance underwriting", desc: "Govern actuarial AI decisions with jurisdiction-aware rule sets that update automatically when regulations change." },
  { title: "KYC & AML systems",      desc: "Anchor intercepts document-parsing agents at runtime — catching prompt injections and credential leaks before damage occurs." },
];

const FAQS = [
  {
    q: "Does Anchor require access to my source code or model weights?",
    a: "No. Anchor operates at the execution boundary — it hooks into runtime calls without reading your underlying model, codebase, or proprietary data. Only cryptographically sealed Ed25519 metadata hashes ever leave your cluster.",
  },
  {
    q: "What latency overhead does Anchor add?",
    a: "Anchor's native Rust kernel evaluates enforcement paths in-process, adding under 0.4ms per inference call. For most regulated workloads this is unmeasurable against network and model latency.",
  },
  {
    q: "Which regulatory frameworks does Anchor cover?",
    a: "EU AI Act (Articles 5, 9, 12, 13, 14, 19), SEC Regulation SCI, RBI Master Directions, FCA AI Governance Expectations, NIST AI RMF, ISO 42001, OWASP LLM Top 10, and FINOS responsible AI standards — with automatic updates as regulations evolve.",
  },
  {
    q: "Can regulators access our telemetry directly?",
    a: "Yes, through the dedicated Oversight Portal. Regulatory auditors submit a signed P2P pull request; your Hub Manager dual-key approves it. The auditor receives a time-limited, scoped view — nothing broader than what was approved.",
  },
  {
    q: "What is an Anchor Hub?",
    a: "A Hub is your organisation's governance control plane — a scoped workspace that binds your AI projects, team clearances, telemetry ledger, and regulatory access controls. Each Hub is cryptographically isolated from all others.",
  },
];

import { useTheme } from "@/lib/theme";

export default function LandingPage() {
  const { isDark, mounted, toggleTheme } = useTheme();
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty("--mx", `${x.toFixed(1)}%`);
    heroRef.current.style.setProperty("--my", `${y.toFixed(1)}%`);
  };

  return (
    <div
      className={`lp-root ${isDark ? "dark" : ""} min-h-screen flex flex-col selection:bg-[#2563EB] selection:text-white transition-colors duration-300 bg-white dark:bg-[#09090C] text-black dark:text-white`}
      style={{ fontFamily: "var(--font-sans)" }}
    >

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

          {/* Links (Strictly Single Line, Non-Wrapping) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium text-slate-300 whitespace-nowrap">
            <Link href="#product" className="hover:text-white transition-colors duration-150" style={{ textDecoration: "none" }}>Product</Link>
            <Link href="/docs" className="hover:text-white transition-colors duration-150" style={{ textDecoration: "none" }}>Docs</Link>
            <Link href="/compare" className="hover:text-white transition-colors duration-150" style={{ textDecoration: "none" }}>Compare</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors duration-150" style={{ textDecoration: "none" }}>Benchmarks</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors duration-150 whitespace-nowrap" style={{ textDecoration: "none" }}>Case Studies</Link>
            <Link href="/pricing" className="hover:text-white transition-colors duration-150" style={{ textDecoration: "none" }}>Pricing</Link>
          </div>

          {/* Controls: Theme Toggle & Access */}
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

            <Link
              href="/login"
              className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full lp-nav-btn-3d whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              + Get access
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO SECTION (Full Viewport Height, Hardware-Accelerated Sunlight Watermark) ── */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="min-h-screen relative flex flex-col justify-center items-center text-center px-6 pt-24 pb-16 overflow-hidden"
      >
        
        {/* Soft Balanced Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[480px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-60"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(147,197,253,0.06) 45%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,225,160,0.18) 0%, rgba(147,197,253,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Prominent Fading ANCHOR Watermark with Inflow + Smooth Cursor Following */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="hero-watermark-text">
            ANCHOR
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fadeInUp">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08]" style={{ color: "var(--lp-text)" }}>
              Govern your AI agents. <br />
              <span className="serif-em">At runtime.</span>
            </h1>
          </div>

          <div>
            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-normal" style={{ color: "var(--lp-sub)" }}>
              Anchor replaces passive audit dashboards with hard runtime firewalls. Every AI decision is intercepted, verified against statutory frameworks, and sealed in microseconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-base font-semibold px-9 py-4 rounded-full transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ background: isDark ? "#FFFFFF" : "#111111", color: isDark ? "#000000" : "#FFFFFF", textDecoration: "none" }}
            >
              Get Enterprise Access <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium tracking-wide" style={{ color: "var(--lp-muted)" }}>
              Annual enterprise contracts from $29,000/yr · Hybrid telemetry &amp; sovereign isolation
            </p>
          </div>
        </div>

        {/* Bottom subtle mist fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--lp-bg)] to-transparent pointer-events-none" />
      </section>

      {/* ── FEATURE CHIPS (3D Keycaps with Tactile Push) ─────────────────── */}
      <section id="product" className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="animate-fadeInUp text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: "var(--lp-text)" }}>
              Everything compliance needs, <span className="serif-em">nothing it doesn't</span>
            </h2>
            <p className="text-base text-slate-500 mt-2 font-normal">
              Event pages, telemetry verification, audit locks, and check-in — one unified protocol.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3.5 animate-fadeInUp delay-100">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span key={label} className="lp-chip">
                <Icon className="w-4 h-4 text-[#5B5CF6]" />
                <span className="font-medium text-[13px] tracking-tight">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACT 01 · ENFORCE (Copy Left, 3D Card Right) ──────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Copy */}
            <div className="space-y-6 animate-fadeInUp">
              <p className="lp-section-label">Act 01 · Enforce</p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--lp-text)" }}>
                From deployment to violation, <br />
                <span className="serif-em">in microseconds</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                Anchor hooks into your AI agent's execution boundary — before a response is formed, before a database is queried, before a transaction is placed. If it violates your policy, it never happens.
              </p>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                Anchor's native Rust kernel compiles statutory invariant paths. No separate sidecar. Sub-0.4ms hard ceiling per call.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-base font-semibold underline-slide"
                style={{ color: "var(--lp-indigo)", textDecoration: "none" }}
              >
                See how enforcement works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3D Artifact Card */}
            <div className="animate-fadeInUp delay-200 flex justify-center">
              <div className="lp-card-3d w-full max-w-md p-7 space-y-5" style={{ background: "var(--lp-surface)" }}>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
                  <span className="text-xs font-mono font-medium" style={{ color: "var(--lp-muted)" }}>anchor // runtime_interceptor</span>
                  <span className="text-xs font-bold px-2.5 py-1" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", borderRadius: "6px", border: "1px solid rgba(220,38,38,0.2)" }}>
                    BLOCKED
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>Rule Enforced</p>
                  <p className="text-base font-bold" style={{ color: "var(--lp-text)" }}>EU AI ACT · Article 5(1)(f)</p>
                  <p className="text-sm leading-normal" style={{ color: "var(--lp-sub)" }}>Prohibited biometric emotion profiling in employment screening</p>
                </div>
                <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-mono" style={{ color: "var(--lp-muted)" }}>Interception Latency</p>
                    <p className="text-3xl font-bold font-mono" style={{ color: "var(--lp-text)" }}>0.35 <span className="text-base font-normal text-slate-400">ms</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider font-mono" style={{ color: "var(--lp-muted)" }}>Verdict Status</p>
                    <p className="text-xs font-mono font-bold text-emerald-500">PRE-COMPILE_HIT</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-black/[0.06] dark:border-white/10">
                  <p className="text-xs font-mono break-all font-medium" style={{ color: "var(--lp-indigo)" }}>sha256:7f920a11b8ca4549f2b828fc0e80112a...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACT 02 · AUDIT (3D Card Left, Copy Right) ────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* 3D Artifact Card */}
            <div className="animate-fadeInUp flex justify-center order-2 lg:order-1">
              <div className="lp-card-3d w-full max-w-md p-7 space-y-4" style={{ background: "var(--lp-surface)" }}>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#5B5CF6]" />
                    <span className="text-sm font-bold" style={{ color: "var(--lp-text)" }}>Audit Ledger Stream</span>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-black/5 dark:bg-white/10" style={{ color: "var(--lp-muted)" }}>LIVE_FEED</span>
                </div>
                {[
                  { id: "led_001", project: "payments-engine", verdict: "COMPLIANT", ms: "0.22ms" },
                  { id: "led_002", project: "credit-decisioning", verdict: "COMPLIANT", ms: "0.31ms" },
                  { id: "led_003", project: "kyc-verifier-agent", verdict: "BLOCKED",   ms: "0.35ms" },
                ].map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] dark:border-white/[0.06] last:border-0">
                    <div>
                      <p className="text-xs font-mono" style={{ color: "var(--lp-muted)" }}>{entry.id}</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--lp-text)" }}>{entry.project}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        entry.verdict === "COMPLIANT"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {entry.verdict}
                      </span>
                      <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--lp-muted)" }}>{entry.ms}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-6 animate-fadeInUp order-1 lg:order-2">
              <p className="lp-section-label">Act 02 · Audit</p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--lp-text)" }}>
                Cryptographically sealed. <br />
                <span className="serif-em">Mathematically unforgeable.</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                Every check-in, execution permit, and policy block is recorded to an append-only, SHA-256 chain-hashed audit ledger.
              </p>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                When external regulators demand evidence, hand them mathematically verified telemetry proofs — not exported spreadsheets.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-base font-semibold underline-slide"
                style={{ color: "var(--lp-indigo)", textDecoration: "none" }}
              >
                Explore the audit ledger <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACT 03 · CERTIFY (Copy Left, 3D Card Right) ─────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Copy */}
            <div className="space-y-6 animate-fadeInUp">
              <p className="lp-section-label">Act 03 · Certify</p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--lp-text)" }}>
                One runtime. <br />
                <span className="serif-em">Every jurisdiction.</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                Map your AI system against EU AI Act, SEC Regulation SCI, RBI Master Directions, and ISO 42001 simultaneously.
              </p>
              <p className="text-base sm:text-lg leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                Anchor translates runtime execution events into jurisdiction-specific compliance dialects automatically.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-base font-semibold underline-slide"
                style={{ color: "var(--lp-indigo)", textDecoration: "none" }}
              >
                View regulatory frameworks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3D Artifact Card */}
            <div className="animate-fadeInUp delay-200 flex justify-center">
              <div className="lp-card-3d w-full max-w-md p-7 space-y-4" style={{ background: "var(--lp-surface)" }}>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
                  <span className="text-sm font-bold" style={{ color: "var(--lp-text)" }}>Jurisdiction Coverage</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">8 OF 8 COMPLIANT</span>
                </div>
                {[
                  { framework: "EU AI Act (2024/1689)",  articles: "Arts. 5, 9, 12, 14", status: "PASS" },
                  { framework: "SEC Regulation SCI",      articles: "Rule 1001(a)",       status: "PASS" },
                  { framework: "RBI Master Directions",   articles: "Section 7.2 (AI/ML)",status: "PASS" },
                  { framework: "FCA AI Principles",       articles: "Principle 2, 3 & 6", status: "PASS" },
                  { framework: "ISO/IEC 42001:2023",      articles: "Clause 6, 8 & 9",    status: "PASS" },
                ].map((item) => (
                  <div key={item.framework} className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/[0.06] last:border-0 text-xs">
                    <div>
                      <p className="font-semibold" style={{ color: "var(--lp-text)" }}>{item.framework}</p>
                      <p className="font-mono text-[11px]" style={{ color: "var(--lp-muted)" }}>{item.articles}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES GRID (Uniform 3D Cards with Clean Elevation) ───────── */}
      <section id="solutions" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 animate-fadeInUp">
            <p className="lp-section-label">Solutions</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--lp-text)" }}>
              Built for high-stakes AI. <span className="serif-em">Ready on day one.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp delay-100">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="lp-usecase-3d p-7 flex flex-col justify-between"
                style={{ background: "var(--lp-surface)" }}
              >
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold" style={{ color: "var(--lp-text)" }}>{uc.title}</h3>
                  <p className="text-sm leading-relaxed font-normal" style={{ color: "var(--lp-sub)" }}>
                    {uc.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--lp-indigo)" }}>
                  <span>Explore dialect</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION (Official Sovereign AI Governance Platform Tiers) ─ */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        {/* Soft radial glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,rgba(147,197,253,0.08)_40%,transparent_70%)] blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 space-y-16">
          <div className="text-center space-y-4 animate-fadeInUp max-w-3xl mx-auto">
            <p className="text-[11px] font-mono font-semibold tracking-widest text-[#5B5CF6] uppercase">
              Sovereign AI Governance Platform
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--lp-text)" }}>
              Annual contracts. <span className="serif-em text-slate-600 dark:text-slate-400">Zero vendor lock-in.</span>
            </h2>
            <p className="text-base sm:text-lg font-normal" style={{ color: "var(--lp-sub)" }}>
              Open Core engine (Apache 2.0). Enterprise Governance Hub deployed via predictable annual contracts, hybrid telemetry, and air-gapped on-premise infrastructure.
            </p>
          </div>

          {/* 4 Cards Grid with Free Trial Option */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 items-stretch animate-fadeInUp delay-100">

            {/* ── 00. 30-DAY FREE TRIAL VERTICAL BOX (GREEN THEME) ── */}
            <div className="p-8 sm:p-9 rounded-[32px] space-y-6 flex flex-col justify-between border-2 border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] shadow-sm hover:shadow-xl hover:border-emerald-500/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Sandbox Trial</p>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">100% FREE</span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">Free Sandbox</h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">$0</span>
                  <p className="text-xs mt-1 font-medium text-emerald-700 dark:text-emerald-400">30 days · zero financial commitment</p>
                </div>
                <p className="text-xs mt-2.5 text-emerald-900/80 dark:text-emerald-200/80">1 Local Dev Sandbox Hub</p>

                <div className="mt-5 pt-4 border-t border-emerald-500/20 space-y-2 text-xs font-mono text-emerald-950 dark:text-emerald-200">
                  <div className="flex justify-between items-center pb-1 border-b border-emerald-500/15"><span className="text-emerald-700 dark:text-emerald-400">Hub:</span><strong className="font-semibold text-emerald-950 dark:text-emerald-100">Local Sandbox</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-emerald-500/15"><span className="text-emerald-700 dark:text-emerald-400">Runtime:</span><strong className="font-semibold text-emerald-950 dark:text-emerald-100">@anchor.guard</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-emerald-500/15"><span className="text-emerald-700 dark:text-emerald-400">Developers:</span><strong className="font-semibold text-emerald-950 dark:text-emerald-100">Full Access</strong></div>
                  <div className="flex justify-between items-center"><span className="text-emerald-700 dark:text-emerald-400">Credit Card:</span><strong className="font-bold text-emerald-600 dark:text-emerald-400">None Needed</strong></div>
                </div>

                <ul className="space-y-3 text-[13px] mt-6 font-medium text-emerald-900 dark:text-emerald-200">
                  {[
                    "Free 30-day developer evaluation",
                    "Tree-sitter AST static linter & CLI",
                    "In-process @anchor.guard runtime",
                    "Test against RBI, EU AI Act, SEC",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/login"
                className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg transition-all duration-200"
                style={{ textDecoration: "none" }}
              >
                Start 30-Day Free Trial →
              </Link>
            </div>

            {/* ── Tier 1: Launch ($29,000 / yr) ── */}
            <div className="lp-price-3d-light p-8 sm:p-9 rounded-[32px] space-y-6 flex flex-col justify-between" style={{ background: "var(--lp-surface)" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--lp-muted)" }}>Fast-Close Floor</p>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-black/5 dark:bg-white/10" style={{ color: "var(--lp-text)" }}>ANNUAL</span>
                </div>
                <h3 className="text-2xl font-bold" style={{ color: "var(--lp-text)" }}>Launch</h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono" style={{ color: "var(--lp-text)" }}>$29,000</span>
                  <p className="text-xs mt-1 font-medium" style={{ color: "var(--lp-muted)" }}>per year · annual contract</p>
                </div>
                <p className="text-xs mt-2.5" style={{ color: "var(--lp-sub)" }}>1 Hub Setup Container</p>

                <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/10 space-y-2 text-xs font-mono" style={{ color: "var(--lp-sub)" }}>
                  <div className="flex justify-between items-center pb-1 border-b border-black/[0.04] dark:border-white/[0.04]"><span>Hub:</span><strong className="font-semibold" style={{ color: "var(--lp-text)" }}>1 Setup Container</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-black/[0.04] dark:border-white/[0.04]"><span>Leadership:</span><strong className="font-semibold" style={{ color: "var(--lp-text)" }}>1 Mgr · 1 PL</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-black/[0.04] dark:border-white/[0.04]"><span>Developers:</span><strong className="font-semibold" style={{ color: "var(--lp-text)" }}>5 Devs</strong></div>
                  <div className="flex justify-between items-center"><span>Capacity:</span><strong className="font-semibold" style={{ color: "var(--lp-text)" }}>1 Project · 1 Model</strong></div>
                </div>

                <ul className="space-y-3 text-[13px] mt-6 font-medium" style={{ color: "var(--lp-sub)" }}>
                  {[
                    "1 Standard Auditor included",
                    "2 years Decision Audit Chain",
                    "Pre-commit & @anchor.guard runtime",
                    "All jurisdiction dialects (EU, RBI, SEC)",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-[#5B5CF6] font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/pricing"
                className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl transition-all duration-200 hover:opacity-85 hover:shadow-lg"
                style={{ background: isDark ? "#FFFFFF" : "#111111", color: isDark ? "#000000" : "#FFFFFF", textDecoration: "none" }}
              >
                Deploy Launch Floor
              </Link>
            </div>

            {/* ── Tier 2: Starter ($60,000 / yr) ── */}
            <div className="lp-price-3d-dark p-8 sm:p-9 rounded-[32px] space-y-6 flex flex-col justify-between relative" style={{ background: "#18181E", border: "1px solid #2C2C36", color: "#FFFFFF" }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-[11px] font-bold tracking-widest uppercase rounded-full shadow-lg whitespace-nowrap">
                Reference Single Hub
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Branch Deployments</p>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-white">ANNUAL</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Starter</h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$60,000</span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">per year · annual contract</p>
                </div>
                <p className="text-xs text-slate-400 mt-2.5">1 Isolated Branch Hub ($7K infra)</p>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Hubs:</span><strong className="text-white font-semibold">1 Branch Hub</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Leadership:</span><strong className="text-white font-semibold">1 Mgr · 2 PLs</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Developers:</span><strong className="text-white font-semibold">25 Devs</strong></div>
                  <div className="flex justify-between items-center"><span>Capacity:</span><strong className="text-white font-semibold">2 Projects · 2 Models</strong></div>
                </div>

                <ul className="space-y-3 text-[13px] mt-6 text-slate-300 font-medium">
                  {[
                    "2 Standard Auditors included",
                    "List $71.5K - 15% discount = ~$60K",
                    "3 years Decision Audit Chain",
                    "Dual-key cryptographic approvals",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-[#5B5CF6] font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/pricing"
                className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl transition-all duration-200 hover:bg-slate-200 hover:shadow-xl"
                style={{ background: "#FFFFFF", color: "#111111", textDecoration: "none" }}
              >
                Deploy Reference Hub
              </Link>
            </div>

            {/* ── Tier 3: Professional ($95,000 / yr) ── */}
            <div className="lp-price-3d-dark p-8 sm:p-9 rounded-[32px] space-y-6 flex flex-col justify-between" style={{ background: "#141419", border: "1px solid #24242C", color: "#FFFFFF" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fully-Loaded Hub</p>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-white">ANNUAL</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Professional</h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$95,000</span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">per year · annual contract</p>
                </div>
                <p className="text-xs text-slate-400 mt-2.5">4 Concurrent Projects</p>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Hubs:</span><strong className="text-white font-semibold">1 Branch Hub</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Leadership:</span><strong className="text-white font-semibold">1 Mgr · 4 PLs</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Developers:</span><strong className="text-white font-semibold">40 Devs</strong></div>
                  <div className="flex justify-between items-center"><span>Capacity:</span><strong className="text-white font-semibold">4 Projects · 4 Models</strong></div>
                </div>

                <ul className="space-y-3 text-[13px] mt-6 text-slate-400 font-medium">
                  {[
                    "4 Standard Auditors included",
                    "List $112K - 15% discount = ~$95K",
                    "4 years Decision Audit Chain",
                    "Sub-0.4ms runtime interception",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-[#5B5CF6] font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/pricing"
                className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl transition-all duration-200 hover:bg-slate-200"
                style={{ background: "#FFFFFF", color: "#111111", textDecoration: "none" }}
              >
                Deploy Professional Hub
              </Link>
            </div>

            {/* ── Tier 4: Sovereign Enterprise ($600,000 / yr) ── */}
            <div className="lp-price-3d-dark p-8 sm:p-9 rounded-[32px] space-y-6 flex flex-col justify-between" style={{ background: "#0D0D11", border: "1px solid #1C1C22", color: "#FFFFFF" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Air-Gapped</p>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300">SOVEREIGN</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Sovereign</h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$600,000</span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">per year · multi-year contract</p>
                </div>
                <p className="text-xs text-slate-400 mt-2.5">Fully Air-Gapped / On-Prem</p>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Hubs:</span><strong className="text-white font-semibold">Custom (∞)</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>Seats:</span><strong className="text-white font-semibold">Custom (∞)</strong></div>
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]"><span>DAC Retention:</span><strong className="text-white font-semibold">7+ Years</strong></div>
                  <div className="flex justify-between items-center"><span>Deployment:</span><strong className="text-purple-400 font-semibold">Fully Air-Gapped</strong></div>
                </div>

                <ul className="space-y-3 text-[13px] mt-6 text-slate-400 font-medium">
                  {[
                    "Zero external connectivity (Zero data egress)",
                    "Founder-led on-site deployment & training",
                    "Quarterly health checks included",
                    "Custom jurisdiction dialect compiler",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-purple-400 font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="mailto:tan@animuslab.dev?subject=Anchor%20Sovereign%20Enterprise%20Discussion"
                className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl transition-all duration-200 hover:bg-slate-200"
                style={{ background: "#FFFFFF", color: "#111111", textDecoration: "none" }}
              >
                Talk with Founder
              </a>
            </div>

          </div>

          {/* ── Subpage Navigation Banner ── */}
          <div className="pt-8 border-t border-black/[0.06] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-0.5">
              <p className="text-sm font-bold" style={{ color: "var(--lp-text)" }}>Need the full business model breakdown?</p>
              <p className="text-xs" style={{ color: "var(--lp-sub)" }}>View Regulatory Oversight Licenses ($30K–$50K), add-on unit pricing, professional services, and deployment timeline.</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-6 py-3 rounded-full transition-all shadow-sm whitespace-nowrap"
              style={{ background: isDark ? "#FFFFFF" : "#111111", color: isDark ? "#000000" : "#FFFFFF", textDecoration: "none" }}
            >
              View Full Business Model &amp; Pricing Breakdown →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION (Smooth Accordion Cards) ─────────────────────────── */}
      <section id="docs" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 animate-fadeInUp">
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--lp-text)" }}>
              Questions, <span className="serif-em">answered</span>
            </h2>
          </div>
          <div className="space-y-4 animate-fadeInUp delay-100">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group p-6 sm:p-7 rounded-2xl border transition-all duration-200 open:shadow-md"
                style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer text-base sm:text-lg font-bold select-none list-none"
                  style={{ color: "var(--lp-text)" }}
                >
                  <span>{faq.q}</span>
                  <span className="text-xl ml-4 font-normal text-slate-400 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-base leading-relaxed pt-4 font-normal" style={{ color: "var(--lp-sub)" }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA HERO BANNER (Your AI Runs. Anchor Governs.) ───────────────── */}
      <section className="py-24 md:py-36 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8 animate-fadeInUp">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight" style={{ color: "var(--lp-text)" }}>
            Your AI runs. <br />
            <span className="serif-em">Anchor governs.</span>
          </h2>
          <p className="text-lg sm:text-xl max-w-xl mx-auto font-normal" style={{ color: "var(--lp-sub)" }}>
            Deterministic runtime enforcement. Immutable SHA-256 audit ledger. Zero external data exfiltration.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-base font-semibold px-9 py-4 rounded-full transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ background: isDark ? "#FFFFFF" : "#111111", color: isDark ? "#000000" : "#FFFFFF", textDecoration: "none" }}
            >
              Explore Enterprise Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER (Spacious Section with Refined Ghost Watermark) ─────────── */}
      <footer className="bg-[#0B0B0E] text-white pt-32 pb-24 relative overflow-hidden rounded-t-[48px] sm:rounded-t-[64px] shadow-2xl border-t border-white/5">
        {/* Refined ghost watermark at bottom */}
        <div
          className="absolute -bottom-3 left-0 right-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[15vw] sm:text-[14vw] font-bold tracking-tight text-white/[0.04] leading-none whitespace-nowrap">
            Anchor
          </span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-20 border-b border-white/[0.08]">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
                  <AnchorLogo size={18} variant="monochrome" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">anchor</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-slate-400 font-normal">
                Sovereign AI Governance Platform. Deterministic, cryptographically auditable runtime guardrails for agentic systems.
              </p>
              <div className="pt-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-6 py-3 rounded-full transition-all duration-200 hover:bg-slate-200"
                  style={{ background: "#FFFFFF", color: "#111111", textDecoration: "none" }}
                >
                  View annual contract pricing
                </Link>
              </div>
            </div>

            {/* Platform column */}
            <nav className="space-y-4">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Platform</p>
              {[["Runtime Engine", "#"], ["Decision Audit Chain", "#"], ["Regulatory Dialects", "#"], ["Pricing Overview", "/pricing"]].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="block text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  style={{ textDecoration: "none" }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Portals & Governance column */}
            <nav className="space-y-4">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Portals &amp; Hub</p>
              {[["Enterprise Hub", "/login"], ["Oversight Portal", "/oversight/login"], ["Pricing & Add-ons", "/pricing"], ["Founder Contact", "mailto:tan@animuslab.dev"]].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="block text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  style={{ textDecoration: "none" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <span>© 2026 Anchor · AnimusLab. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="mailto:tan@animuslab.dev" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <span>Founder: Tanishq Dasari · <a href="mailto:tan@animuslab.dev" className="hover:text-white underline">tan@animuslab.dev</a></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
