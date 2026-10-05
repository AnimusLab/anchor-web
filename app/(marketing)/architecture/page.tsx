"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Shield, Cpu, Network, Lock, Database, ArrowRight, CheckCircle2, 
  ExternalLink, Layers, Terminal, Activity, FileCheck, Zap, Sun, Moon, Info, GitMerge, ChevronRight, HelpCircle
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";

/* ─────────────────────────────────────────────────────────
   ANIMUSLAB ARCHITECTURE — PRODUCT STUDIO TOPOLOGY & GENESIS
   Explains the studio model, independent product lifecycles,
   dogfooding principles, and technical boundaries.
───────────────────────────────────────────────────────── */

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  badge: string;
  tagline: string;
  status: string;
  originStory: string;
  technicalCore: string[];
  whatItIs: string[];
  whatItIsNot: string[];
  internalUsage: string;
  icon: React.ElementType;
}

const PRODUCTS: ProductDetail[] = [
  {
    id: "anchor",
    name: "Anchor Engine",
    category: "AI Governance & Verification",
    badge: "Open Source Engine",
    tagline: "Deterministic static analysis and sub-millisecond runtime statutory enforcement.",
    status: "Production / Open Source Core",
    icon: Shield,
    originStory: "When developing the federated training workflows in AnchorGrid-Hub, participating institutions could fine-tune base models on proprietary data and submit adapter weight merge requests back to the network. This raised two critical questions: How do we mathematically verify that incoming weights improve capabilities rather than degrading performance, injecting backdoor triggers, or causing alignment drift? And how do we deterministically govern runtime AI tool execution and model outputs against statutory requirements (EU AI Act, RBI FREE-AI, SEC Reg SCI) with zero-latency overhead? Anchor was built to answer both.",
    technicalCore: [
      "Zero-copy Rust static analysis AST engine parsing code and prompt definitions against formal .anchor dialect rules.",
      "Sub-millisecond (< 0.4ms) synchronous intercept runtime gate enforcing hard statutory constraints before LLM calls execute.",
      "Decision Audit Chain (DAC) generating SHA-256 Merkle-linked, Ed25519-signed immutable compliance records.",
      "Open-core architecture: local engine is 100% free and open-source; anchor-web provides enterprise SaaS governance."
    ],
    whatItIs: [
      "An open-source CLI and Rust/Python SDK for AI governance.",
      "A static scanner that blocks compliance violations in CI/CD pipelines.",
      "A runtime guard enforcing legal and safety boundaries before execution."
    ],
    whatItIsNot: [
      "A post-hoc monitoring dashboard (that is anchor-web).",
      "A model training framework.",
      "A cloud service (the engine runs completely local and air-gapped)."
    ],
    internalUsage: "Used as the formal verification gate in AnchorGrid-Hub weight merges, and as the audit engine for QuantForge-AI execution boundaries."
  },
  {
    id: "anchorgrid",
    name: "AnchorGrid-Hub",
    category: "Federated Model Marketplace",
    badge: "P2P Intelligence Network",
    tagline: "BitTorrent-style decentralized model distribution with federated fine-tuning.",
    status: "Active Development",
    icon: Network,
    originStory: "Centralized AI hosting requires organizations to transmit sensitive proprietary data to external cloud providers. AnchorGrid-Hub was built to enable decentralized, federated intelligence without data leakage: clients download base models via P2P, fine-tune lightweight LoRA adapters locally on private data, and optionally submit adapter weights to improve the collective hive mind.",
    technicalCore: [
      "High-efficiency P2P distribution network for base model weights and modular LoRA adapters.",
      "Standardized local training pipeline (Mistral-7B 4-bit, Rank 16 LoRA) producing ~50MB portable adapters.",
      "Proof-of-Loss automated evaluation benchmark testing submissions against curated multi-domain datasets.",
      "Weekly automated merge schedule (CalVer YYYY.WW) updating global collective intelligence checkpoints."
    ],
    whatItIs: [
      "A P2P distribution layer for open model weights.",
      "A contribution and merge-request protocol for federated fine-tuning.",
      "A zero-data-leakage architecture where training data never leaves client premises."
    ],
    whatItIsNot: [
      "A centralized cloud training cluster.",
      "A proprietary model lock-in platform.",
      "Architecturally dependent on Anchor (Anchor is used by AnimusLab as the validation step, not hardwired into the P2P protocol)."
    ],
    internalUsage: "Distributes QuantForge-AI models and accepts domain-specific financial fine-tuning adapters from quantitative research teams."
  },
  {
    id: "quantforge",
    name: "QuantForge",
    category: "Financial AI & Developer Terminal",
    badge: "Financial Ecosystem",
    tagline: "Developer-first TUI financial workstation coupled with quantitative reasoning AI.",
    status: "Active Development",
    icon: Terminal,
    originStory: "Traditional financial analytics terminals (e.g., Bloomberg Terminal) are multi-thousand-dollar, proprietary GUI-locked silos that cannot be programmatically driven by AI agents or modern developer scripts. QuantForge was engineered to deliver a terminal-native, keyboard-driven, scriptable workstation that works symbiotically with financial AI agents.",
    technicalCore: [
      "QuantForge Terminal: High-performance TUI (Terminal User Interface) workstation built for quantitative researchers and developers.",
      "QuantForge-AI: Specialized financial reasoning agent fine-tuned on SEC EDGAR filings, central bank disclosures, and market microstructure.",
      "Bi-directional Tooling: QuantForge Terminal exposes live connectors (SEC, FRED, MarketWatch) to QuantForge-AI as tool calls, while the terminal surfaces AI reasoning natively."
    ],
    whatItIs: [
      "A scriptable, composable developer alternative to legacy financial workstations.",
      "A domain-expert financial AI agent.",
      "A modular workstation operable by humans, scripts, or autonomous agents."
    ],
    whatItIsNot: [
      "A closed-source proprietary data silo.",
      "A direct order routing broker (analytics and reasoning layer only).",
      "Dependent on Anchor or AnchorGrid to operate."
    ],
    internalUsage: "QuantForge-AI runs inside AnchorGrid as a distributed intelligence adapter, and runs subject to Anchor statutory governance in live execution."
  },
  {
    id: "shadow_watch",
    name: "Shadow_Watch",
    category: "Continuous Behavioral Security",
    badge: "Zero-Friction Identity",
    tagline: "Frictionless multi-signal behavioral anomaly detection replacing repetitive 2FA.",
    status: "Standalone Python Library",
    icon: Lock,
    originStory: "Traditional multi-factor authentication (TOTP codes, SMS OTPs, repetitive hardware prompts) introduces high operational friction in developer and quantitative trading workflows. Shadow_Watch was created to establish frictionless, continuous behavioral security: silently scoring interaction continuity and issuing step-up challenges only when anomaly thresholds are breached.",
    technicalCore: [
      "Continuous Ensemble Scoring: IP/Location (30%), Device Fingerprint (25%), Behavioral Interaction (20%), Time Heatmap (15%), API Jitter/Regularity (10%).",
      "Localized Behavioral Anomaly Scorer: Computes Laplace-smoothed Kullback-Leibler (KL) divergence on action-type distributions, velocity z-scores, and entity novelty rates.",
      "Jaccard Entity Fingerprinting: Analyzes symbol and asset access continuity to immediately flag account takeover (ATO) or scraping attempts.",
      "Dynamic Enforcement: Trust score >= 0.80 permits silent access; < 0.40 triggers hard block or MFA challenge."
    ],
    whatItIs: [
      "A continuous behavioral trust engine for APIs and user sessions.",
      "A silent security layer that eliminates repetitive 2FA prompts.",
      "A localized per-user statistical baseline model."
    ],
    whatItIsNot: [
      "A replacement for enterprise SSO or password vaults.",
      "A centralized tracking service (models and embeddings live in your database).",
      "Dependent on any other AnimusLab product."
    ],
    internalUsage: "Protects anchor-web session portals and secures AnchorGrid-Hub trading and model contribution API routes."
  },
  {
    id: "forge",
    name: "FORGE",
    category: "File-Oriented Storage Engine",
    badge: "Cloud Storage -> DB",
    tagline: "Turns arbitrary cloud file storage (Google Drive, R2, S3) into an authenticated database.",
    status: "Rust Core Engine",
    icon: Database,
    originStory: "Prototyping modern applications typically incurs the overhead and recurring cost of provisioning dedicated cloud database instances (PostgreSQL, Supabase, Neon). FORGE was engineered to turn existing, unmetered cloud file storage into an authenticated, queryable relational/document database using custom binary storage specs.",
    technicalCore: [
      "Custom .forge Binary Specification: 64-byte structured header (FORGE001 magic bytes, schema hash, row counts), schema definition block, indexing offset tables, and binary-encoded record blocks.",
      "High-Performance Rust Engine: Async runtime built with Axum, Tokio, and Hyper.",
      "Write-Ahead Logging (WAL): Crash-resilient write pipeline with idempotency guarantees.",
      "Universal Storage Adapter: Persists .forge binary files to Google Drive, Cloudflare R2, AWS S3, or generic HTTP storage via REST endpoints (/v1/data/:collection)."
    ],
    whatItIs: [
      "A database engine for developers who already pay for cloud storage.",
      "A lightweight, zero-maintenance persistence layer for prototypes and edge tools.",
      "A clean REST-accessible database with API-key authentication."
    ],
    whatItIsNot: [
      "A multi-terabyte high-concurrency transactional OLTP replacement for PostgreSQL.",
      "A proprietary locked-in cloud service.",
      "Dependent on any other AnimusLab product."
    ],
    internalUsage: "Used across AnimusLab internal tooling and prototyping pipelines for zero-cost authenticated state storage."
  }
];

const DOGFOODING_MATRIX = [
  { host: "AnchorGrid-Hub", tool: "Anchor Engine", purpose: "Validates incoming LoRA weight merge requests against statutory rules and performance bounds before merging.", independent: "Yes — Hub can merge weights using standard loss checks without Anchor." },
  { host: "AnchorGrid-Hub", tool: "Shadow_Watch", purpose: "Protects API endpoints and model submission routes with continuous behavioral trust scoring.", independent: "Yes — Hub functions with standard API key / bearer token auth." },
  { host: "QuantForge Terminal", tool: "QuantForge-AI", purpose: "Embeds quantitative reasoning and natural language financial analysis into the TUI.", independent: "Yes — Terminal operates as a standalone scriptable financial workstation." },
  { host: "QuantForge-AI", tool: "QuantForge Terminal", purpose: "Uses the terminal's financial connectors (SEC, FRED, MarketWatch) as live execution tools.", independent: "Yes — AI agent can connect to external Python or HTTP data feeds." },
  { host: "anchor-web", tool: "Shadow_Watch", purpose: "Provides zero-friction continuous session security across compliance and auditor portals.", independent: "Yes — anchor-web operates with standard TOTP clearance tokens." },
  { host: "AnimusLab Tooling", tool: "FORGE", purpose: "Provides rapid zero-cost persistent state storage during active prototyping sprints.", independent: "Yes — Systems can connect directly to PostgreSQL, SQLite, or Redis." }
];

export default function ArchitecturePage() {
  const { isDark, mounted, toggleTheme } = useTheme();
  const [selectedProduct, setSelectedProduct] = useState<string>("anchor");

  const activeProduct = PRODUCTS.find((p) => p.id === selectedProduct) || PRODUCTS[0];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-[#09090C] text-black dark:text-white">
      {/* ── FLOATING 3D NAV CAPSULE ─────────────────────────────────────── */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between gap-6 sm:gap-8 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full lp-nav-3d text-white backdrop-blur-2xl max-w-4xl w-full sm:w-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: "none" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black shadow-sm">
              <AnchorLogo size={18} variant="monochrome" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">ANIMUSLAB</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-300">
            <Link href="/benchmarks" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>BENCHMARKS</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>CASE STUDIES</Link>
            <Link href="/compare" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>COMPARE</Link>
            <Link href="/architecture" className="text-white font-bold" style={{ textDecoration: "none" }}>ARCHITECTURE</Link>
            <Link href="/pricing" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>PRICING</Link>
            <Link href="/docs" className="hover:text-white transition-colors" style={{ textDecoration: "none" }}>DOCS</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
            )}
            <Link
              href="/login"
              className="text-xs font-mono font-semibold px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
              style={{ textDecoration: "none" }}
            >
              PORTAL LOGIN
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="pt-32 pb-14 px-4 sm:px-8 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            <Layers className="w-3.5 h-3.5" />
            <span>PRODUCT STUDIO ARCHITECTURE &amp; TOPOLOGY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" style={{ color: "var(--lp-text)" }}>
            A Product Studio, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Not a Monolithic Platform.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            AnimusLab builds focused, independent infrastructure engines. Every product is standalone, independently deployable, and solves a first-principles problem. They interoperate through clear contracts and dogfooding—not forced platform dependencies.
          </p>
        </div>
      </section>

      {/* ── PRODUCT TOPOLOGY SELECTOR ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto space-y-10">
          
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Product Architecture
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {PRODUCTS.map((prod) => {
                const isSelected = selectedProduct === prod.id;
                const IconComponent = prod.icon;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod.id)}
                    className={`p-5 text-left rounded-2xl transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold">
                          {prod.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{prod.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{prod.category}</p>
                      </div>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <span>Inspect Topology</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PRODUCT DEEP-DIVE */}
          <div className="p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] shadow-lg space-y-10">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-bold">
                    {activeProduct.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Status: {activeProduct.status}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                  {activeProduct.name}
                </h2>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                  {activeProduct.tagline}
                </p>
              </div>

              <div className="shrink-0">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 max-w-xs space-y-1.5">
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase">Dogfooding Usage</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {activeProduct.internalUsage}
                  </p>
                </div>
              </div>
            </div>

            {/* Genesis Narrative */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                  Genesis Story &amp; Technical Motivation
                </h3>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                {activeProduct.originStory}
              </div>
            </div>

            {/* Technical Core & Scope Boundaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Technical Core */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                    Technical Core Mechanics
                  </h3>
                </div>
                <div className="space-y-3">
                  {activeProduct.technicalCore.map((spec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{spec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What it is vs What it is not */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    What It Is
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {activeProduct.whatItIs.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-4">
                  <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    What It Is Not (Scope Boundary)
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {activeProduct.whatItIsNot.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── DOGFOODING & INDEPENDENCE MATRIX ─────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 bg-slate-50/70 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-xs font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              Operational Contracts
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              The Dogfooding &amp; Independence Matrix
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every integration across the studio is an optional consumer contract. Systems run standalone and do not require monolithic omnibus runtimes.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121217] shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] font-mono text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6 font-bold">Host System</th>
                  <th className="py-4 px-6 font-bold">Integrated Tool</th>
                  <th className="py-4 px-6 font-bold">Nature of Integration</th>
                  <th className="py-4 px-6 font-bold">Operational Without Tool?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {DOGFOODING_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white font-mono">{row.host}</td>
                    <td className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400 font-mono">{row.tool}</td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{row.purpose}</td>
                    <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">{row.independent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── NOTE FOR INSTITUTIONAL EVALUATORS ─────────────────────────── */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/50 space-y-6">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Guidance for Institutional &amp; Regulatory Evaluators
            </h3>
          </div>
          
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            If you are evaluating AnimusLab technologies for regulatory compliance or mission-critical enterprise deployment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 space-y-1.5">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">1. Governance Audit</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inspect <strong>Anchor Core &amp; anchor-web</strong> for statutory AST compilation, zero-copy Rust runtime hooks, and Decision Audit Chain cryptographic proofs.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 space-y-1.5">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">2. Security Audit</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inspect <strong>Shadow_Watch</strong> for continuous ensemble scoring, KL-divergence behavioral modeling, and Jaccard entity continuity.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 space-y-1.5">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">3. Storage Audit</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inspect <strong>FORGE</strong> for .forge binary format parsing safety, in-memory query isolation, and Write-Ahead Logging integrity.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-200 dark:border-blue-900/40">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Complete proof artifacts &amp; benchmark trails are publicly accessible.
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/benchmarks"
                className="text-xs font-mono font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                style={{ textDecoration: "none" }}
              >
                VIEW LIVE BENCHMARKS
              </Link>
              <Link
                href="/docs"
                className="text-xs font-mono font-semibold px-4 py-2 rounded-xl border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                style={{ textDecoration: "none" }}
              >
                TECHNICAL DOCS
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-12 px-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070709] text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AnchorLogo size={16} variant="indigo" />
            <span className="font-bold text-slate-900 dark:text-white">ANIMUSLAB ARCHITECTURE DIRECTORY</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/benchmarks" className="hover:text-slate-900 dark:hover:text-white transition-colors" style={{ textDecoration: "none" }}>BENCHMARKS</Link>
            <Link href="/compare" className="hover:text-slate-900 dark:hover:text-white transition-colors" style={{ textDecoration: "none" }}>COMPARE</Link>
            <Link href="/case-studies" className="hover:text-slate-900 dark:hover:text-white transition-colors" style={{ textDecoration: "none" }}>CASE STUDIES</Link>
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors" style={{ textDecoration: "none" }}>PRICING</Link>
            <Link href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors" style={{ textDecoration: "none" }}>DOCS</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} AnimusLab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
