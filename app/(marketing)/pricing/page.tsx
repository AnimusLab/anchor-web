"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Lock, FileCheck, Scale, Cpu, Globe, Server, Key, Users, ChevronRight, Download, HelpCircle, Sun, Moon, Layers, BadgeCheck, AlertCircle } from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";

/* ─────────────────────────────────────────────────────────
   ANCHOR GOVERNANCE HUB — BUSINESS MODEL & PRICING
   Sovereign AI Governance Platform (Annual Contracts)
   Clearance-Level Hierarchy & Multi-Tier Enterprise Ladder
───────────────────────────────────────────────────────── */

const CLEARANCE_ROLES = [
  {
    role: "Developer",
    code: "DEVELOPER",
    level: "L1",
    rate: "$1,500",
    period: "per seat / year",
    scope: "Project-Scoped Codebase & Models",
    interface: "Developer Portal & CLI Gateway",
    permissions: [
      "Run anchor-audit CLI scans, pre-commit hooks, and Tree-sitter AST linting",
      "Layer 2 runtime instrumentation with @anchor.guard decorator packages & SDKs",
      "Violation debugger with file paths, line numbers, and self-healing reroute traces",
      "Register local Ed25519 public keys and agent identity fingerprints",
    ],
    restricted: "Cannot view other Hubs, approve access permits, or alter statutory policies.",
  },
  {
    role: "Standard Auditor",
    code: "STANDARD_AUDITOR",
    level: "L1",
    rate: "$4,500",
    period: "per seat / year",
    scope: "Single-Hub Forensic Scope",
    interface: "Forensic Audit & DAC Verification Console",
    permissions: [
      "Full read access to append-only Decision Audit Chain (DAC) SHA-256 ledger",
      "Issue formal EnforcementNotice tickets (Low, Med, High, Critical) to non-compliant teams",
      "Request scoped, time-limited cryptographic ReplayAccessLog permits for historic states",
      "Export standardized audit dossiers mapped to EU AI Act, RBI FREE-AI, SEC Reg SCI, FCA",
    ],
    restricted: "Read-only access to code/models (cannot modify code), strictly isolated to assigned Hub.",
  },
  {
    role: "Project Lead",
    code: "PROJECT_LEAD",
    level: "L2",
    rate: "$4,500",
    period: "per seat / year",
    scope: "Project Management & Delivery",
    interface: "Project Management & Monitoring Dashboard",
    permissions: [
      "Real-time telemetry stream across all project model calls, intercept latency, and verdicts",
      "Issue and rotate project-level API keys and assign developers to specific repositories",
      "Submit formal GovernanceAccessRequest permits to Hub Managers for elevated reviews",
      "Violation triage, exception acknowledgement, and remediation velocity tracking",
    ],
    restricted: "Cannot access projects outside assigned Hub, modify global contracts, or grant dual-key approvals.",
  },
  {
    role: "Cross-Hub Auditor",
    code: "CROSS_HUB_AUDITOR",
    level: "L2",
    rate: "$8,500",
    period: "per seat / year",
    scope: "Multi-Hub Global Scope",
    interface: "Multi-Hub Institutional Oversight Portal",
    permissions: [
      "Seamless read-only navigation across all organizational Hubs, branches, and subsidiaries",
      "Inter-Hub Agent Mesh auditing across distributed data pipelines and federated model calls",
      "Macro-level compliance analytics, systemic risk scoring, and cross-division trends",
      "Consolidated multi-jurisdiction regulatory filing exports (RBI, SEBI, FCA, SEC, EU)",
    ],
    restricted: "Cannot modify project configs, invite users, or alter intercept rules (forensic read-only).",
  },
  {
    role: "Hub Manager",
    code: "HUB_MANAGER",
    level: "L3",
    rate: "$9,000",
    period: "per seat / year",
    scope: "Apex Branch Administrator",
    interface: "Hub Control Plane & Administrative Gateway",
    permissions: [
      "User & Clearance Sovereignty: invite, assign clearance levels (L1–L4), or revoke access",
      "Dual-Key Cryptographic Approval on time-limited GovernanceAccessRequest permits",
      "Jurisdictional Dialect Configuration: toggle and map EU AI Act, RBI, SEC, and FCA rules",
      "Full DAC Explorer with root hash inspection and Spoke Node network topology management",
    ],
    restricted: "Cannot access other isolated organizational Hubs without explicit cross-hub delegation.",
  },
];

const TIERS = [
  {
    name: "Launch",
    price: "$29,000",
    period: "per year · Annual Contract",
    tagline: "Seed-stage fintechs · NBFCs · Single-department pilots · Immediate deployment",
    badge: "Fast-Close Floor",
    badgeDark: false,
    highlight: false,
    specs: {
      hubs: "1 Hub (Setup Container)",
      leadership: "1 Hub Manager · 1 Project Lead",
      devs: "5 Developers",
      auditors: "1 Standard Auditor",
      capacity: "1 Project · 1 Governed AI Model",
      retention: "2 Years DAC Retention",
      deployment: "Hybrid Telemetry Isolation",
    },
    features: [
      "1 Isolated Organization Hub Container ($3.5K setup)",
      "1 Hub Manager ($9K) · 1 Project Lead ($4.5K)",
      "5 Developers ($7.5K) · 1 Standard Auditor ($4.5K)",
      "1 Project Slot & 1 Governed AI Model Slot",
      "2 years Decision Audit Chain (DAC) SHA-256 retention",
      "Pre-commit CLI scanning & @anchor.guard runtime interceptor",
      "All jurisdictional dialects (EU AI Act, RBI, SEC, FCA)",
    ],
    cta: "Deploy Launch Floor",
    ctaHref: "mailto:tan@animuslab.dev?subject=Anchor%20Launch%20Contract%20Inquiry%20($29K)",
  },
  {
    name: "Starter",
    price: "$60,000",
    period: "per year · Annual Contract",
    tagline: "The Reference Single Hub · One branch / business unit with full project team deployment",
    badge: "Reference Single Hub",
    badgeDark: true,
    highlight: true,
    specs: {
      hubs: "1 Isolated Hub ($7K infra)",
      leadership: "1 Hub Manager · 2 Project Leads",
      devs: "25 Developers",
      auditors: "2 Standard Auditors",
      capacity: "2 Projects · 2 Governed AI Models",
      retention: "3 Years DAC Retention",
      deployment: "Hybrid Telemetry Isolation",
    },
    features: [
      "1 Isolated Branch Hub ($7,000 base infrastructure)",
      "1 Hub Manager ($9K) · 2 Project Leads ($9K)",
      "25 Developers ($37.5K) · 2 Standard Auditors ($9K)",
      "2 Project Slots & 2 Governed AI Model Slots included",
      "List $71,500 with 15% standard bundle discount = $60,775 (~$60K)",
      "3 years Decision Audit Chain immutable retention",
      "Dual-key cryptographic access requests & DAC explorer",
    ],
    cta: "Deploy Reference Hub",
    ctaHref: "mailto:tan@animuslab.dev?subject=Anchor%20Starter%20Hub%20Contract%20Inquiry%20($60K)",
  },
  {
    name: "Professional",
    price: "$95,000",
    period: "per year · Annual Contract",
    tagline: "Single fully-loaded Hub · Sized for 4 concurrent project teams with heavy audit capacity",
    badge: "Fully-Loaded Hub",
    badgeDark: false,
    highlight: false,
    specs: {
      hubs: "1 Isolated Hub ($7K infra)",
      leadership: "1 Hub Manager · 4 Project Leads",
      devs: "40 Developers",
      auditors: "4 Standard Auditors",
      capacity: "4 Projects · 4 Governed AI Models",
      retention: "4 Years DAC Retention",
      deployment: "Hybrid Telemetry Isolation",
    },
    features: [
      "1 Isolated Branch Hub ($7,000 base infrastructure)",
      "1 Hub Manager ($9K) · 4 Project Leads ($18K)",
      "40 Developers ($60K) · 4 Standard Auditors ($18K)",
      "4 Project Slots & 4 Governed AI Model Slots included",
      "List $112,000 with 15% standard bundle discount = $95,200 (~$95K)",
      "4 years Decision Audit Chain immutable retention",
      "High-throughput sub-0.4ms runtime interception",
    ],
    cta: "Deploy Professional Hub",
    ctaHref: "mailto:tan@animuslab.dev?subject=Anchor%20Professional%20Hub%20Inquiry%20($95K)",
  },
  {
    name: "Growth",
    price: "Custom ($180K – $350K+)",
    period: "per year · Multi-Hub Agreement",
    tagline: "Growth-stage companies · Series B+ funding · Multi-branch expansion · Quant funds",
    badge: "Multi-Branch Scale",
    badgeDark: false,
    highlight: false,
    specs: {
      hubs: "3 – 8+ Isolated Hubs",
      leadership: "Co-Managers & Project Leads",
      devs: "80 – 160+ Developers",
      auditors: "Cross-Hub & Standard Auditors",
      capacity: "Multi-Project & Mesh Auditing",
      retention: "5 Years DAC Retention",
      deployment: "Distributed Hybrid Mesh",
    },
    features: [
      "Multi-Hub Architecture (3–8+ Regional / Business Unit Hubs)",
      "Co-Managers & Deputy Managers with L3 sovereignty",
      "Cross-Hub Auditors (L2) for enterprise-wide risk aggregation",
      "Priced from established per-seat rate card with volume discounting",
      "5 years immutable DAC retention with inter-hub agent mesh",
      "Dedicated Technical Account Manager & 4-hr guaranteed SLA",
    ],
    cta: "Configure Growth Agreement",
    ctaHref: "mailto:tan@animuslab.dev?subject=Anchor%20Growth%20Tier%20Inquiry",
  },
  {
    name: "Sovereign Enterprise",
    price: "$600,000",
    period: "per year · Multi-Year Contract",
    tagline: "Tier-1 Banks · Central Banks · Sovereign Defense & Government Entities",
    badge: "Air-Gapped / On-Prem",
    badgeDark: true,
    highlight: false,
    specs: {
      hubs: "Unlimited Air-Gapped Hubs",
      leadership: "Custom Enterprise Seats",
      devs: "Unlimited Developer Access",
      auditors: "Air-Gapped Forensic Views",
      capacity: "Enterprise-Wide AI Systems",
      retention: "7+ Years DAC Retention",
      deployment: "Fully Air-Gapped / On-Prem",
    },
    features: [
      "Fully air-gapped / on-premises deployment (Zero external data egress)",
      "Audit summaries isolated to auditors only — zero telemetry to third parties",
      "Founder-led on-site installation, configuration & team training",
      "Quarterly on-site health checks, disaster recovery verification & upgrades",
      "7+ years Decision Audit Chain retention for statutory subpoena readiness",
      "Custom regulatory dialect compiler for national / sovereign frameworks",
    ],
    cta: "Talk with Founder",
    ctaHref: "mailto:tan@animuslab.dev?subject=Anchor%20Sovereign%20Enterprise%20Inquiry%20($600K)",
  },
];

const ADD_ON_CATALOG = [
  { item: "Additional Project Pack", price: "$23,500 / yr", desc: "1 Project Lead ($4.5K) + 10 Developers ($15K) + 1 Standard Auditor ($4.5K) + 1 AI Slot" },
  { item: "Developer Pack (10 seats)", price: "$15,000 / yr", desc: "CLI/CI scans, AST linting, and @anchor.guard runtime instrumentation ($1,500/seat)" },
  { item: "Project Lead Pack (3 seats)", price: "$10,500 / yr", desc: "Key issuance, triage velocity & project telemetry stream (~12.5% pack discount)" },
  { item: "Standard Auditor Pack (5 seats)", price: "$22,500 / yr", desc: "Single-Hub DAC verification & formal EnforcementNotice issuance ($4,500/seat)" },
  { item: "Cross-Hub Auditor Pack (3 seats)", price: "$25,500 / yr", desc: "Multi-Hub global explorer, mesh auditing & consolidated statutory filings ($8,500/seat)" },
  { item: "Extra Hub Manager (1 seat)", price: "$9,000 / yr", desc: "Apex L3 administrator with dual-key cryptographic approval sovereignty (sold individually)" },
  { item: "Additional Hub Container", price: "$7,000 / yr", desc: "Isolated digital branch infrastructure container for new physical/business divisions" },
  { item: "Additional Governed AI Model Slot", price: "$2,500 / yr", desc: "Dedicated statutory mapping and risk boundary slot per additional production model" },
];

const PROFESSIONAL_SERVICES = [
  {
    service: "Governance Assessment",
    price: "$800 – $1,500",
    time: "3–5 days",
    deliverable: "Read-only codebase scan, Tree-sitter AST findings report, and statutory remediation map.",
  },
  {
    service: "Implementation & Onboarding",
    price: "$2,000 – $15,000",
    time: "2–4 weeks",
    deliverable: "Anchor runtime integration into AI pipelines, DAC configured for jurisdiction, CI/CD gates.",
  },
  {
    service: "On-site Training & Deployment",
    price: "$3,000 / day + travel",
    time: "Custom",
    deliverable: "Hands-on sovereign deployment, dual-key permit training, and compliance staff onboarding.",
  },
  {
    service: "Custom Jurisdiction Dialect Mapping",
    price: "$8,000 – $20,000",
    time: "2–3 weeks",
    deliverable: "New regulatory framework compiled into Anchor invariant rules and automated dialect exports.",
  },
  {
    service: "Regulatory Compliance Assessment",
    price: "$1,000 – $2,500",
    time: "3–5 days",
    deliverable: "Written mapping of AI system to specific regulatory provisions (RBI, EU AI Act, SEC Reg SCI).",
  },
];

const TARGET_MARKETS = [
  {
    segment: "Indian NBFCs & Fintechs",
    pain: "RBI FREE-AI 26 recommendations active now",
    entry: "Governance Assessment → Launch ($29K/yr) or Starter ($60K/yr)",
    timing: "Immediate",
  },
  {
    segment: "EU-Regulated Financial Institutions",
    pain: "EU AI Act statutory enforcement (August 2026)",
    entry: "Assessment → Starter ($60K/yr) or Professional ($95K/yr)",
    timing: "Urgent",
  },
  {
    segment: "Quant Funds & High-Frequency AI",
    pain: "SEC 2026 AI audit trail examination priority",
    entry: "Professional ($95K) → Growth Multi-Hub ($180K–$350K/yr)",
    timing: "Active",
  },
  {
    segment: "Tier-1 Indian & Global Banks",
    pain: "RBI CIMS reporting & multi-jurisdiction cross-border audit",
    entry: "Consulting Engagement → Sovereign Enterprise ($600K/yr)",
    timing: "6–12 months",
  },
  {
    segment: "Government & Defense AI Deployments",
    pain: "Multi-framework compliance simultaneously in air-gapped VPCs",
    entry: "Regulatory Oversight License ($30K–$50K) → Sovereign ($600K)",
    timing: "12–24 months",
  },
];

export default function PricingPage() {
  const { isDark, mounted, toggleTheme } = useTheme();

  return (
    <div className={`lp-root ${isDark ? "dark" : ""} min-h-screen flex flex-col selection:bg-[#2563EB] selection:text-white transition-colors duration-300 bg-white dark:bg-[#09090C] text-black dark:text-white`} style={{ fontFamily: "var(--font-sans)" }}>

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
            <Link href="/#product" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Product</Link>
            <Link href="/docs" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Docs</Link>
            <Link href="/compare" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Compare</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>Benchmarks</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors whitespace-nowrap" style={{ textDecoration: "none" }}>Case Studies</Link>
            <Link href="/pricing" className="text-white font-semibold underline underline-offset-4" style={{ textDecoration: "none" }}>Pricing</Link>
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
      <section className="relative pt-36 pb-20 px-6 text-center overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,rgba(147,197,253,0.08)_45%,transparent_70%)] blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            <span>Sovereign AI Governance Platform</span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-600 dark:text-blue-400">Annual Contracts · Clearance Hierarchy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight" style={{ color: "var(--lp-text)" }}>
            Anchor Governance Hub <br />
            <span className="serif-em">Business Model &amp; Pricing</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
            Predictable, clearance-level pricing anchored to access scope and operational responsibility. Open Core engine with enterprise annual contracts, zero data exfiltration, and sovereign on-prem deployments.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-2xl font-extrabold text-black dark:text-white font-mono">$29K</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Launch fast-close floor</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-2xl font-extrabold text-black dark:text-white font-mono">$60K</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reference single Hub</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-2xl font-extrabold text-black dark:text-white font-mono">$600K</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sovereign on-prem ceiling</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-2xl font-extrabold text-black dark:text-white font-mono">5 Tiers</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Launch to Sovereign</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01. CLEARANCE-LEVEL ROLE MATRIX ───────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">01 // Clearance Hierarchy</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--lp-text)" }}>Role-Based Clearance &amp; Per-Seat Pricing</h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Price scales with access scope and liability authority, not arbitrary headcount. Five standardized client-facing clearance levels ensure predictable budgeting and transparent expansion paths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLEARANCE_ROLES.map((role) => (
              <div key={role.code} className="p-6 rounded-3xl bg-white dark:bg-[#121217] border-2 border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      LEVEL {role.level}
                    </span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{role.code}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">{role.role}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl font-extrabold font-mono text-black dark:text-white">{role.rate}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{role.period}</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1 font-semibold">{role.scope}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] uppercase font-mono">Core Permissions:</p>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">✓</span>
                          <span className="leading-tight">{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Boundary:</span> {role.restricted}
                </div>
              </div>
            ))}

            {/* External Regulatory Oversight Card */}
            <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800/40 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    EXTERNAL
                  </span>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">STATUTORY LICENSE</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-purple-950 dark:text-purple-100">Regulatory Oversight License</h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-extrabold font-mono text-purple-950 dark:text-purple-100">$30K – $50K</span>
                    <span className="text-xs text-purple-700 dark:text-purple-300">per year</span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-mono mt-1 font-semibold">Sold Directly to Regulators (RBI, SEBI, FCA, SEC)</p>
                </div>

                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2 text-xs">
                  <p className="font-semibold text-purple-900 dark:text-purple-200 text-[11px] uppercase font-mono">Authority Capabilities:</p>
                  <ul className="space-y-1.5 text-purple-800 dark:text-purple-300">
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0">✓</span>
                      <span>Deploys 0 Spoke nodes — read-only aggregated metadata stream</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0">✓</span>
                      <span>On-demand encrypted forensic pull requests for audited decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold shrink-0">✓</span>
                      <span>Issue formal EnforcementNotice tickets directly to non-compliant Hubs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-100/60 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-[11px] text-purple-900 dark:text-purple-200 font-mono">
                <span className="font-bold">Access Model:</span> TOTP zero-trust clearance portal for statutory examiners.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02. ANNUAL CONTRACT TIERS (5 TIERS) ─────────────────────────── */}
      <section className="py-24 px-4 sm:px-8 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-[1720px] mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">02 // Annual Contract Tiers</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--lp-text)" }}>
              The 5-Tier Governance Ladder
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
              Every tier operates on a strict annual contract basis. All prices are quoted exclusive of applicable taxes (GST at prevailing rates for Indian clients).
            </p>
          </div>

          {/* ── ROW 1: SINGLE-HUB REFERENCE TIERS & FREE TRIAL (4 WIDE CARDS) ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Single-Branch Deployments &amp; Sandbox Evaluation</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                30-Day Free Sandbox Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 items-stretch">
              
              {/* ── 00. 30-DAY FREE TRIAL VERTICAL BOX (GREEN THEME) ── */}
              <div className="p-8 rounded-[32px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border-2 border-emerald-500/40 dark:border-emerald-500/30 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:border-emerald-500/60">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      30-DAY FREE TRIAL
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">100% FREE</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">Sandbox Trial</h3>
                    <div className="mt-3">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">$0</span>
                      <p className="text-xs mt-1 font-medium text-emerald-700 dark:text-emerald-400">30 days · Zero financial commitment</p>
                    </div>
                    <p className="text-xs sm:text-sm mt-3.5 leading-relaxed font-normal text-emerald-900/80 dark:text-emerald-200/80">
                      Evaluate AST gatekeeper &amp; runtime interceptors in your local dev environment.
                    </p>
                  </div>

                  {/* Allocation Matrix */}
                  <div className="p-4 rounded-2xl space-y-2 text-xs font-mono bg-emerald-500/[0.06] text-emerald-950 dark:text-emerald-200 border border-emerald-500/20">
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                      <span className="text-emerald-700 dark:text-emerald-400">Hub:</span>
                      <strong className="text-right text-emerald-950 dark:text-emerald-100">1 Local Dev Sandbox</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                      <span className="text-emerald-700 dark:text-emerald-400">Runtime:</span>
                      <strong className="text-right text-emerald-950 dark:text-emerald-100">@anchor.guard Native</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                      <span className="text-emerald-700 dark:text-emerald-400">Developers:</span>
                      <strong className="text-right text-emerald-950 dark:text-emerald-100">Full Team Access</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                      <span className="text-emerald-700 dark:text-emerald-400">DAC Ledger:</span>
                      <strong className="text-right text-emerald-950 dark:text-emerald-100">30-Day Retention</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 dark:text-emerald-400">Credit Card:</span>
                      <strong className="text-right text-emerald-600 dark:text-emerald-400 font-bold">None Required</strong>
                    </div>
                  </div>

                  {/* Features List in Green Text */}
                  <ul className="space-y-2.5 text-xs sm:text-[13px] font-medium text-emerald-900 dark:text-emerald-200">
                    <li className="flex items-start gap-2.5">
                      <span className="text-sm font-bold shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="leading-relaxed">Free 30-day developer evaluation</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-sm font-bold shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="leading-relaxed">Tree-sitter AST static linter &amp; CLI</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-sm font-bold shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="leading-relaxed">In-process @anchor.guard runtime</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-sm font-bold shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="leading-relaxed">Test against RBI, EU AI Act, SEC</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-sm font-bold shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="leading-relaxed">Instant local setup in under 5 mins</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href="/login"
                    className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-200"
                    style={{ textDecoration: "none" }}
                  >
                    Start 30-Day Free Trial →
                  </Link>
                </div>
              </div>

              {/* ── 01-03. PAID SINGLE-HUB TIERS ── */}
              {TIERS.slice(0, 3).map((tier) => (
                <div
                  key={tier.name}
                  className={`p-8 sm:p-9 rounded-[32px] flex flex-col justify-between transition-all duration-300 ${
                    tier.highlight
                      ? "bg-[#121217] text-white shadow-2xl ring-2 ring-blue-500 lg:-translate-y-2 border-2 border-blue-500/50"
                      : "bg-white dark:bg-[#121217] text-black dark:text-white border-2 border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        tier.highlight ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                      }`}>
                        {tier.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">1-YR CONTRACT</span>
                    </div>

                    <div>
                      <h3 className={`text-2xl font-bold ${tier.highlight ? "text-white" : "text-black dark:text-white"}`}>{tier.name}</h3>
                      <div className="mt-3">
                        <span className={`text-3xl sm:text-4xl font-extrabold font-mono ${tier.highlight ? "text-white" : "text-black dark:text-white"}`}>{tier.price}</span>
                        <p className={`text-xs mt-1 font-medium ${tier.highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>{tier.period}</p>
                      </div>
                      <p className={`text-xs sm:text-sm mt-3.5 leading-relaxed font-normal ${tier.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                        {tier.tagline}
                      </p>
                    </div>

                    {/* Allocation Matrix */}
                    <div className={`p-4 rounded-2xl space-y-2 text-xs font-mono ${
                      tier.highlight ? "bg-white/[0.06] text-slate-200 border border-white/10" : "bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                    }`}>
                      <div className="flex justify-between items-center pb-1.5 border-b border-black/[0.04] dark:border-white/[0.06]">
                        <span className="text-slate-400">Hubs:</span>
                        <strong className="text-right">{tier.specs.hubs}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-black/[0.04] dark:border-white/[0.06]">
                        <span className="text-slate-400">Leadership:</span>
                        <strong className="text-right">{tier.specs.leadership}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-black/[0.04] dark:border-white/[0.06]">
                        <span className="text-slate-400">Developers:</span>
                        <strong className="text-right">{tier.specs.devs}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-black/[0.04] dark:border-white/[0.06]">
                        <span className="text-slate-400">Auditors:</span>
                        <strong className="text-right">{tier.specs.auditors}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Capacity:</span>
                        <strong className="text-right">{tier.specs.capacity}</strong>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className={`space-y-2.5 text-xs sm:text-[13px] font-medium ${tier.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className={`text-sm font-bold shrink-0 mt-0.5 ${tier.highlight ? "text-blue-400" : "text-blue-600 dark:text-blue-400"}`}>✓</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <a
                      href={tier.ctaHref}
                      className={`block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl transition-all duration-200 ${
                        tier.highlight
                          ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-xl"
                          : "bg-[#111111] dark:bg-white text-white dark:text-black hover:opacity-85 shadow-md"
                      }`}
                      style={{ textDecoration: "none" }}
                    >
                      {tier.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROW 2: MULTI-HUB & SOVEREIGN ENTERPRISE (2 ULTRA-WIDE CARDS) ── */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Multi-Division &amp; Sovereign Enterprise Agreements</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {TIERS.slice(3, 5).map((tier) => (
                <div
                  key={tier.name}
                  className="p-8 sm:p-10 rounded-[36px] bg-white dark:bg-[#121217] text-black dark:text-white border-2 border-slate-200 dark:border-white/10 shadow-md hover:shadow-2xl flex flex-col justify-between transition-all duration-300"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {tier.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">ENTERPRISE CONTRACT</span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">{tier.name}</h3>
                      <div className="mt-3">
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono text-black dark:text-white">{tier.price}</span>
                        <p className="text-xs mt-1 font-medium text-slate-500 dark:text-slate-400">{tier.period}</p>
                      </div>
                      <p className="text-xs sm:text-sm mt-3.5 leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                        {tier.tagline}
                      </p>
                    </div>

                    {/* Allocation Matrix Grid */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-1 pb-2 sm:pb-0 sm:border-r border-slate-200 dark:border-white/10 pr-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Hub Scope:</span>
                          <strong>{tier.specs.hubs}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Leadership:</span>
                          <strong>{tier.specs.leadership}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Developers:</span>
                          <strong>{tier.specs.devs}</strong>
                        </div>
                      </div>
                      <div className="space-y-1 pl-0 sm:pl-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Auditors:</span>
                          <strong>{tier.specs.auditors}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Capacity:</span>
                          <strong>{tier.specs.capacity}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Retention:</span>
                          <strong>{tier.specs.retention}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2.5 text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-400">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-sm font-bold shrink-0 mt-0.5 text-purple-600 dark:text-purple-400">✓</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <a
                      href={tier.ctaHref}
                      className="block text-center text-xs sm:text-sm font-bold py-4 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black hover:opacity-85 shadow-md transition-all duration-200"
                      style={{ textDecoration: "none" }}
                    >
                      {tier.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-600 dark:text-slate-400 max-w-3xl mx-auto space-y-1.5 shadow-sm">
            <p className="font-bold text-black dark:text-white">Standing 15% Bundle Discount &amp; Multi-Year Commitments</p>
            <p>Every custom configuration is priced at list rates with a standing 15% bundle discount applied. 12% to 18% additional discounts apply for 3+ year enterprise agreements.</p>
          </div>
        </div>
      </section>

      {/* ── 03. ADD-ON CATALOG & EXPANSION PACKS ──────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Add-ons List */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">03 // Standalone Add-On Catalog</p>
                <h3 className="text-2xl font-bold text-black dark:text-white">Expansion Packs &amp; Role Top-Ups</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Scale teams and project capacity without altering base tier contracts.</p>
              </div>

              <div className="space-y-3">
                {ADD_ON_CATALOG.map((addon) => (
                  <div key={addon.item} className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">{addon.item}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{addon.desc}</p>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-black dark:text-white whitespace-nowrap pl-4">{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Services */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">04 // Professional Services</p>
                <h3 className="text-2xl font-bold text-black dark:text-white">Consulting &amp; Custom Deployments</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Standalone engineering engagements that build institutional readiness.</p>
              </div>

              <div className="space-y-3">
                {PROFESSIONAL_SERVICES.map((serv) => (
                  <div key={serv.service} className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-black dark:text-white">{serv.service}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-black dark:text-white">{serv.price}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{serv.deliverable}</p>
                    <p className="text-[11px] font-mono text-slate-400">Timeline: {serv.time}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 04. TARGET MARKETS & REGULATORY TIMELINE ─────────────────────── */}
      <section className="py-20 px-6 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">05 // Market Segmentation</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--lp-text)" }}>Converging Statutory Deadlines</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Three statutory mandates are active: EU AI Act (Aug 2026), RBI FREE-AI, and SEC 2026 Examination Priorities.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 font-mono uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Segment</th>
                  <th className="py-4 px-6">Core Regulatory Exposure</th>
                  <th className="py-4 px-6">Entry Point</th>
                  <th className="py-4 px-6 text-right">Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {TARGET_MARKETS.map((m) => (
                  <tr key={m.segment} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-black dark:text-white">{m.segment}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{m.pain}</td>
                    <td className="py-4 px-6 font-mono font-medium text-blue-600 dark:text-blue-400">{m.entry}</td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-900 dark:text-slate-100">{m.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 05. NEXT STEPS & DIRECT FOUNDER CONTACT ──────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto p-10 sm:p-12 rounded-3xl bg-white dark:bg-[#121217] border-2 border-slate-200 dark:border-white/10 text-center space-y-8 shadow-md">
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">06 // Engagement Protocol</p>
            <h2 className="text-3xl font-bold text-black dark:text-white">Next Steps for Prospects</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Every step proves mathematical value before the next commitment. Move from zero risk to full production governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">STEP 01</span>
              <h4 className="text-sm font-bold text-black dark:text-white">Free Codebase Scan</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">20-minute live demo and codebase audit. We identify policy gaps on the spot.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">STEP 02</span>
              <h4 className="text-sm font-bold text-black dark:text-white">Sandbox Hub Pilot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Deploy a scoped test Hub in development environment. Explore real-time telemetry &amp; DAC ledger.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">STEP 03</span>
              <h4 className="text-sm font-bold text-black dark:text-white">Annual Contract</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Convert to Launch ($29K) or Reference Starter ($60K) with 48-hour onboarding.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:tan@animuslab.dev?subject=Anchor%20Governance%20Demo%20%26%20Pricing%20Discussion"
              className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black hover:opacity-85 transition-all shadow-md"
              style={{ textDecoration: "none" }}
            >
              Contact Founder (Tanishq Dasari) →
            </a>
            <span className="text-xs text-slate-500 font-mono">tan@animuslab.dev · Reply guaranteed within 24 hours</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#101014] text-white pt-24 pb-16 relative overflow-hidden rounded-t-[48px] sm:rounded-t-[64px] shadow-2xl mt-12">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/[0.08]">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
                  <AnchorLogo size={18} variant="monochrome" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">anchor</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm text-slate-400 font-normal">
                Sovereign AI Governance Platform. Deterministic, cryptographically auditable governance for agentic AI systems.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 transition-all"
                  style={{ textDecoration: "none" }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>

            <nav className="space-y-3">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Platform</p>
              {[["Home", "/"], ["Pricing Overview", "/pricing"], ["Enterprise Hub", "/login"], ["Oversight Portal", "/oversight/login"]].map(([label, href]) => (
                <Link key={label} href={href} className="block text-xs text-slate-400 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>

            <nav className="space-y-3">
              <p className="text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">Contact &amp; Governance</p>
              {[["Founder Contact", "mailto:tan@animuslab.dev"], ["Website", "https://animuslab.dev"], ["Terms", "#"], ["Privacy", "#"]].map(([label, href]) => (
                <Link key={label} href={href} className="block text-xs text-slate-400 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <span>© 2026 AnimusLab · Sovereign Systems. All rights reserved.</span>
            <span>Founder: Tanishq Dasari · tan@animuslab.dev</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
