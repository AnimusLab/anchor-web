"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, Shield, Lock, FileCheck, Scale, Cpu, Globe, Server, 
  Key, Users, Zap, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Sun, Moon, Info, ShieldCheck, Database, Layers, Eye,
  HelpCircle, ChevronDown, X
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";

/* ─────────────────────────────────────────────────────────
   ANCHOR PROTOCOL — INTERACTIVE ARCHITECTURAL COMPARATOR (/compare)
   Light Mode: Pure White 3D Cards, Bold Black & Blue Text
   Dark Mode: Pure Black 3D Cards, Bold White & Blue Text
───────────────────────────────────────────────────────── */

interface DimensionFeature {
  id: string;
  name: string;
  simpleExplanation: string;
  whyItMatters: string;
  anchor: { value: string; badge: string; isPositive: boolean; note: string };
  langsmith: { value: string; badge: string; isPositive: boolean; note: string };
  credo: { value: string; badge: string; isPositive: boolean; note: string };
  guardrails: { value: string; badge: string; isPositive: boolean; note: string };
}

interface Dimension {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  features: DimensionFeature[];
}

const DIMENSIONS: Dimension[] = [
  {
    id: "latency",
    number: "01",
    title: "Execution Boundary & Latency",
    subtitle: "When & How Governance Intervenes",
    summary: "Traditional LLM observability tools act 'post-facto' (after a database mutation or message delivery has already happened). Anchor operates in-process before actions commit. Think of Anchor as a physical brake/firewall system, whereas observability tools are CCTV cameras that only film accidents after they occur.",
    features: [
      {
        id: "boundary-hook",
        name: "Execution Boundary Hook",
        simpleExplanation: "Where in the execution pipeline does governance run? Before an unauthorized action happens (preventative), or after it has already occurred (logging)?",
        whyItMatters: "Prevents unauthorized database writes, fraudulent fund transfers, or unauthorized API calls before damage occurs. Once a database write finishes, observability logs cannot undo the damage.",
        anchor: { value: "In-Process Deterministic Native Kernel (< 0.4ms)", badge: "Pre-Execution Gate", isPositive: true, note: "Interception happens inside the process memory before network/DB dispatch." },
        langsmith: { value: "Post-execution async log sink", badge: "Post-Facto Logger", isPositive: false, note: "Records traces asynchronously to cloud DB after execution finishes." },
        credo: { value: "None (Manual questionnaire forms)", badge: "No Runtime Engine", isPositive: false, note: "Zero code execution; governance is handled via offline checklists." },
        guardrails: { value: "Async Python string wrapper", badge: "Wrapper Layer", isPositive: false, note: "Wraps text outputs in Python runtime, unable to guard underlying system APIs." },
      },
      {
        id: "latency-overhead",
        name: "Inference Latency Overhead",
        simpleExplanation: "How much delay does the governance check add to each AI call?",
        whyItMatters: "High-frequency systems, live banking workflows, and conversational agents cannot tolerate multi-second secondary model evaluations for simple compliance rules.",
        anchor: { value: "0.18ms p50 / 0.38ms p99 (Rust FFI)", badge: "< 0.4ms Hard Ceiling", isPositive: true, note: "Compiled native binary with zero network hops." },
        langsmith: { value: "85ms – 250ms (Async HTTP API hop)", badge: "Network Overhead", isPositive: false, note: "Requires background network dispatch to cloud trace collector." },
        credo: { value: "0ms runtime (Zero runtime code)", badge: "Static Questionnaire", isPositive: false, note: "No runtime latency because it does not inspect active traffic." },
        guardrails: { value: "80ms – 450ms (Secondary LLM call)", badge: "Model Delay Penalty", isPositive: false, note: "Calls secondary validation LLMs to evaluate primary LLM outputs." },
      },
      {
        id: "self-healing",
        name: "Self-Healing Reroute Directives",
        simpleExplanation: "What happens when an agent violates a rule? Does it crash the app, or automatically fix the output?",
        whyItMatters: "When an agent attempts a forbidden action, Anchor automatically rewires the output payload into a compliant state instead of crashing with unhandled exceptions.",
        anchor: { value: "Deterministic AST semantic reroute", badge: "Automated Fallback", isPositive: true, note: "Transparently substitutes illegal parameters with compliant defaults in < 0.2ms." },
        langsmith: { value: "None (Alert notification only)", badge: "Alerts Only", isPositive: false, note: "Sends Slack/webhook notification; requires human to debug post-incident." },
        credo: { value: "None (Manual policy review)", badge: "Manual Process", isPositive: false, note: "Compliance officer updates internal policy documentation manually." },
        guardrails: { value: "Python exception throw", badge: "Raises Runtime Error", isPositive: false, note: "Crashes downstream handler unless custom try/catch logic is hand-written." },
      },
    ],
  },
  {
    id: "compliance",
    number: "02",
    title: "Statutory Law & Compliance Dialects",
    subtitle: "Mapping Real Regulations to Code",
    summary: "Generic observability tools track LLM calls but have no understanding of legal or regulatory mandates. Anchor compiles statutory articles (EU AI Act, RBI FREE-AI, SEC Reg SCI, FCA, ISO 42001) directly into deterministic machine Abstract Syntax Trees (ASTs).",
    features: [
      {
        id: "statutory-dialects",
        name: "Pre-Compiled Statutory Dialects",
        simpleExplanation: "Are real government laws and regulatory frameworks supported out-of-the-box as code?",
        whyItMatters: "Engineering teams should not waste months re-interpreting statutory legal text into custom Python regex rules. Anchor ships pre-compiled dialects for 22 global regulatory regimes.",
        anchor: { value: "22 Statutory Dialects (EU, RBI, SEC, FCA, ISO)", badge: "Native .anchor Dialects", isPositive: true, note: "Includes EU AI Act Art 9-15, RBI FREE-AI, SEC Reg SCI, HIPAA, SOC2." },
        langsmith: { value: "None (Raw custom key-value tags)", badge: "No Dialects", isPositive: false, note: "Users must invent their own tag taxonomy with no legal structure." },
        credo: { value: "Subjective checklists & forms", badge: "Manual Checklists", isPositive: false, note: "Humans fill out web forms to self-certify compliance readiness." },
        guardrails: { value: "Custom regex or Python functions", badge: "Custom Code", isPositive: false, note: "Developers write ad-hoc Python validation functions for every check." },
      },
      {
        id: "drift-detection",
        name: "Layer 1 Codebase Drift Detection",
        simpleExplanation: "Can the system catch compliance violations in code before deployment (in CI/CD)?",
        whyItMatters: "Catches policy violations and unauthorized architecture modifications during pull requests before code ever reaches production servers.",
        anchor: { value: "AST Git-Hook & CI Gatekeeper (< 20ms)", badge: "Pre-Deploy CI Gate", isPositive: true, note: "Static analyzer scans codebase and halts build if architectural drift > 0.0%." },
        langsmith: { value: "None (Runtime tracing only)", badge: "No Static Linting", isPositive: false, note: "No pre-commit or CI/CD static code auditing capabilities." },
        credo: { value: "Spreadsheet audit questionnaires", badge: "Periodic Survey", isPositive: false, note: "Quarterly or annual survey process disconnected from git commits." },
        guardrails: { value: "None (Runtime library only)", badge: "No Static Linting", isPositive: false, note: "Only executes when application code is invoked." },
      },
      {
        id: "lockfile-integrity",
        name: "Cryptographic Lockfile Signing",
        simpleExplanation: "How do you guarantee that compliance rules haven't been secretly disabled or altered?",
        whyItMatters: "Prevents rogue developers or compromised dependencies from silently commenting out or disabling governance rules.",
        anchor: { value: "GOVERNANCE.lock (Ed25519 Signed)", badge: "Tamper-Proof Lockfile", isPositive: true, note: "Any modification without the root governance private key invalidates the runtime." },
        langsmith: { value: "None (Mutable project settings)", badge: "Unsigned Config", isPositive: false, note: "Any workspace member with admin role can alter rules silently." },
        credo: { value: "None (Cloud database records)", badge: "Unsigned Forms", isPositive: false, note: "Relies on cloud provider database permissions without cryptographic proofs." },
        guardrails: { value: "None (Plain text config files)", badge: "Unsigned Code", isPositive: false, note: "Plain Python / YAML files that any repo contributor can edit." },
      },
    ],
  },
  {
    id: "evidence",
    number: "03",
    title: "Evidentiary Integrity & Cryptographic Proofs",
    subtitle: "Court-Admissible Non-Repudiation",
    summary: "External regulators, courts, and institutional auditors require tamper-evident proof that each AI decision was governed at the exact moment it occurred. Anchor's Decision Audit Chain (DAC) provides mathematical non-repudiation via SHA-256 Merkle-linked blocks.",
    features: [
      {
        id: "audit-chain",
        name: "Decision Audit Chain (DAC Ledger)",
        simpleExplanation: "Is the audit log immutable and cryptographically linked, or just mutable database rows?",
        whyItMatters: "Provides mathematically indisputable audit logs that survive regulatory subpoenas and court scrutiny without reliance on vendor trust.",
        anchor: { value: "SHA-256 Merkle-linked immutable blocks", badge: "Cryptographic DAC", isPositive: true, note: "Every execution event is cryptographically sealed in a local tamper-evident chain." },
        langsmith: { value: "Mutable PostgreSQL trace rows", badge: "Standard DB Rows", isPositive: false, note: "Logs can be updated, deleted, or truncated by database administrators." },
        credo: { value: "Manual PDF export reports", badge: "Static Documents", isPositive: false, note: "Exported PDF summaries with no cryptographic timestamping or hashes." },
        guardrails: { value: "Console stderr / stdout logs", badge: "Ephemeral Output", isPositive: false, note: "Application console logs that disappear when server containers restart." },
      },
      {
        id: "privacy-sovereignty",
        name: "Zero Data Exfiltration (Sovereign Spoke)",
        simpleExplanation: "Does your sensitive prompt and customer data leave your VPC to third-party cloud SaaS?",
        whyItMatters: "Highly regulated banks, defense contractors, and healthcare organizations are legally prohibited from leaking customer PII or proprietary prompts to external SaaS.",
        anchor: { value: "100% In-VPC. Zero payload exfiltration", badge: "Air-Gapped Sovereign", isPositive: true, note: "Engine runs completely local inside your perimeter; no telemetry sent home." },
        langsmith: { value: "Prompts sent to LangSmith SaaS Cloud", badge: "Cloud SaaS Dependency", isPositive: false, note: "Full user prompts and LLM outputs are streamed to external cloud." },
        credo: { value: "Metadata uploaded to Credo Cloud", badge: "Cloud SaaS Dependency", isPositive: false, note: "Governance models and metadata stored on multi-tenant cloud." },
        guardrails: { value: "Local Python execution (Self-hosted)", badge: "Self-Hosted", isPositive: true, note: "Runs within your local Python process." },
      },
      {
        id: "dual-key",
        name: "Dual-Key Auditor Pulls",
        simpleExplanation: "Can an external regulator verify compliance without viewing confidential underlying data?",
        whyItMatters: "Allows third-party regulatory authorities to cryptographically verify that all checks passed without exposing confidential trade secrets or consumer PII.",
        anchor: { value: "Ed25519 dual-key P2P state verification", badge: "Zero-Knowledge Verifiable", isPositive: true, note: "Auditors verify mathematical signatures without decryption of raw payloads." },
        langsmith: { value: "Team workspace member invites", badge: "RBAC Account Sharing", isPositive: false, note: "Auditors must be invited as full workspace members to inspect raw logs." },
        credo: { value: "Auditor report downloads", badge: "Manual PDF Sharing", isPositive: false, note: "Compliance reports sent manually as file attachments." },
        guardrails: { value: "None (No auditor API exists)", badge: "No Audit Interface", isPositive: false, note: "No native verification or auditor access interface." },
      },
    ],
  },
];

// Full matrix comparison rows (9 features x 4 tools)
const FULL_MATRIX_ROWS = [
  { category: "Execution & Runtime", feature: "Interception Timing", anchor: "Pre-execution deterministic gate (< 0.4ms)", langsmith: "Post-execution trace logging", credo: "Offline manual review", guardrails: "Post-inference string wrapper" },
  { category: "Execution & Runtime", feature: "Latency Overhead", anchor: "0.18ms p50 (Native Rust binary)", langsmith: "85ms - 250ms (HTTP cloud hop)", credo: "0ms (No runtime code)", guardrails: "80ms - 450ms (Secondary LLM call)" },
  { category: "Execution & Runtime", feature: "Failure Handling", anchor: "Deterministic AST auto-reroute", langsmith: "Dashboard alert notification", credo: "Manual policy revision", guardrails: "Throws unhandled Python exception" },
  { category: "Statutory Law", feature: "Pre-compiled Dialects", anchor: "22 regulatory regimes (EU, RBI, SEC, FCA)", langsmith: "None (Generic tags)", credo: "Subjective checklists", guardrails: "None (Custom code required)" },
  { category: "Statutory Law", feature: "CI/CD Drift Gatekeeper", anchor: "AST Git-Hook & CI Gate (< 20ms)", langsmith: "None (Runtime only)", credo: "None (Annual survey)", guardrails: "None (Runtime only)" },
  { category: "Statutory Law", feature: "Rule Integrity", anchor: "Ed25519 Cryptographic Lockfile", langsmith: "Unsigned project settings", credo: "Cloud database record", guardrails: "Unsigned source code" },
  { category: "Evidence & Audit", feature: "Audit Log Structure", anchor: "SHA-256 Merkle Decision Audit Chain", langsmith: "Mutable PostgreSQL rows", credo: "Exported PDF summaries", guardrails: "Console stdout/stderr" },
  { category: "Evidence & Audit", feature: "Data Sovereignty", anchor: "100% In-VPC (Zero payload exfiltration)", langsmith: "Full prompt cloud SaaS upload", credo: "Cloud SaaS upload", guardrails: "Local Python runtime" },
  { category: "Evidence & Audit", feature: "Auditor Verification", anchor: "Ed25519 Dual-Key ZK verification", langsmith: "Workspace member invite (PII exposed)", credo: "Manual PDF delivery", guardrails: "None" },
];

export default function ComparePage() {
  const { isDark, mounted, toggleTheme } = useTheme();
  const [activeDimension, setActiveDimension] = useState<string>("latency");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("boundary-hook");
  const [showFullMatrix, setShowFullMatrix] = useState<boolean>(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  const currentDimension = DIMENSIONS.find((d) => d.id === activeDimension) || DIMENSIONS[0];
  const currentFeature = currentDimension.features.find((f) => f.id === selectedFeatureId) || currentDimension.features[0];

  const toggleMatrix = () => {
    const nextState = !showFullMatrix;
    setShowFullMatrix(nextState);
    if (nextState) {
      setTimeout(() => {
        matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

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
            <Link href="/compare" className="text-white font-semibold underline underline-offset-4">Compare</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
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

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 px-6 text-center border-b border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(147,197,253,0.06)_45%,transparent_70%)] blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
            <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Architectural Comparison &amp; System Evaluation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-950 dark:text-white">
            Runtime Interception vs. <br />
            <span className="serif-em text-blue-600 dark:text-blue-400 font-bold">Passive Observability</span>
          </h1>

          <p className="text-base sm:text-lg max-w-3xl mx-auto font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            Understand how Anchor Protocol differs fundamentally from passive log sinks (LangSmith), subjective compliance questionnaires (Credo AI), and Python string wrappers (Guardrails AI).
          </p>
        </div>
      </section>

      {/* ── EXPLANATION GUIDE BANNER ─────────────────────────────────────── */}
      <section className="px-4 sm:px-8 pt-10 pb-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-blue-950 dark:text-blue-200">
                How to read this comparison: The 3 Core Architectural Differences
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5 shadow-sm">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">1. Execution Timing</span>
                <p className="font-semibold text-slate-950 dark:text-white">Pre-Execution vs. Post-Facto</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Anchor halts bad actions <span className="font-bold text-blue-600 dark:text-blue-400">before</span> they touch a database. Observability tools merely record what happened after the loss.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5 shadow-sm">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">2. Machine vs. Manual</span>
                <p className="font-semibold text-slate-950 dark:text-white">Compiled Law vs. Questionnaires</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Anchor turns legal acts (EU AI Act, RBI, SEC) into binary AST rules executed in CI/CD. Others rely on humans checking spreadsheet boxes.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5 shadow-sm">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">3. Proof of Compliance</span>
                <p className="font-semibold text-slate-950 dark:text-white">Cryptographic Chain vs. SQL Rows</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Anchor generates a SHA-256 Merkle-linked Decision Audit Chain. Competitors store mutable database rows that can be silently edited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE 3-DIMENSION COMPARATOR ──────────────────────────── */}
      <section className="py-10 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto space-y-10">

          {/* 3 Main Dimension Selectors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 1: Select Comparison Dimension
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIMENSIONS.map((dim) => {
                const isActive = activeDimension === dim.id;
                return (
                  <button
                    key={dim.id}
                    onClick={() => {
                      setActiveDimension(dim.id);
                      setSelectedFeatureId(dim.features[0].id);
                    }}
                    className={`p-6 text-left transition-all flex items-center justify-between rounded-2xl ${
                      isActive
                        ? "lp-item-selected"
                        : "lp-card-3d"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">DIMENSION {dim.number}</span>
                      <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{dim.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{dim.subtitle}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Dimension Details (3D Card) */}
          <div className="lp-card-3d p-6 sm:p-10 space-y-8">
            
            {/* Dimension Summary */}
            <div className="space-y-3 border-b border-slate-200 dark:border-white/10 pb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                  DIMENSION {currentDimension.number}
                </span>
                <span className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">
                  Architectural Focus
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                {currentDimension.title}
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 max-w-4xl leading-relaxed">
                {currentDimension.summary}
              </p>
            </div>

            {/* Feature Sub-selector Pills */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 2: Inspect Specific Feature Criteria
              </span>
              <div className="flex flex-wrap gap-3">
                {currentDimension.features.map((feat) => (
                  <button
                    key={feat.id}
                    onClick={() => setSelectedFeatureId(feat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedFeatureId === feat.id
                        ? "lp-item-selected"
                        : "lp-card-3d"
                    }`}
                  >
                    {feat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Deep Dive Header & Explanation */}
            <div className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-mono font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider">
                  Why this specific capability matters
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{currentFeature.name}</h3>
              <p className="text-xs sm:text-sm font-semibold text-blue-950 dark:text-blue-200">
                💡 <span className="font-bold">In Plain English:</span> {currentFeature.simpleExplanation}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed pt-1 border-t border-blue-200/50 dark:border-blue-800/30">
                <span className="font-bold text-slate-950 dark:text-white">Technical Impact:</span> {currentFeature.whyItMatters}
              </p>
            </div>

            {/* 4-Column Side-by-Side Comparison Cards */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 3: Comparative Analysis Across Platforms
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Card 1: Anchor Protocol (Hero 3D Card) */}
                <div className="p-6 lp-card-3d space-y-4 flex flex-col justify-between border-2 border-blue-600 dark:border-blue-500 shadow-md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AnchorLogo size={18} variant="monochrome" />
                        <span className="font-extrabold text-sm text-blue-900 dark:text-blue-300">Anchor Protocol</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold">
                        {currentFeature.anchor.badge}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-slate-950 dark:text-white leading-snug">
                      {currentFeature.anchor.value}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-2">
                      {currentFeature.anchor.note}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Deterministic Enforcement</span>
                  </div>
                </div>

                {/* Card 2: LangSmith / Arize */}
                <div className="p-6 lp-card-3d space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-950 dark:text-slate-100">LangSmith / Arize</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold">
                        {currentFeature.langsmith.badge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 leading-snug">
                      {currentFeature.langsmith.value}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-2">
                      {currentFeature.langsmith.note}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Post-facto monitoring only</span>
                  </div>
                </div>

                {/* Card 3: Credo AI */}
                <div className="p-6 lp-card-3d space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-950 dark:text-slate-100">Credo AI</span>
                      <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-700 dark:text-slate-400 font-mono text-[10px] font-bold">
                        {currentFeature.credo.badge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 leading-snug">
                      {currentFeature.credo.value}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-2">
                      {currentFeature.credo.note}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Questionnaire forms only</span>
                  </div>
                </div>

                {/* Card 4: Guardrails AI */}
                <div className="p-6 lp-card-3d space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-950 dark:text-slate-100">Guardrails AI</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 font-mono text-[10px] font-bold">
                        {currentFeature.guardrails.badge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 leading-snug">
                      {currentFeature.guardrails.value}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-2">
                      {currentFeature.guardrails.note}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Secondary LLM latency overhead</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── SPREADSHEET MATRIX EXPANDER BUTTON ── */}
          <div className="text-center pt-6">
            <button
              onClick={toggleMatrix}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{showFullMatrix ? "Hide Full Comparison Table" : "View Full 5-Way Matrix Table (All 9 Features)"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFullMatrix ? "rotate-180" : ""}`} />
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Compare all 9 technical features across all 4 platforms in a unified matrix.
            </p>
          </div>

          {/* ── COMPLETE 9-FEATURE MATRIX TABLE (EXPANDABLE) ── */}
          {showFullMatrix && (
            <div ref={matrixRef} className="lp-card-3d p-6 sm:p-10 space-y-6 animate-fadeInUp">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Comprehensive Technical Breakdown
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
                    Unified 5-Way Architecture Matrix
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                    Side-by-side comparison across all 9 evaluation points.
                  </p>
                </div>
                <button
                  onClick={() => setShowFullMatrix(false)}
                  className="self-start sm:self-auto flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Matrix</span>
                </button>
              </div>

              {/* Responsive Scroll Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 w-1/5">Category &amp; Feature</th>
                      <th className="py-3.5 px-4 font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border-x border-blue-200 dark:border-blue-900/50 w-1/4">
                        Anchor Protocol (v6.0.4)
                      </th>
                      <th className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 w-1/5">LangSmith / Arize</th>
                      <th className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 w-1/6">Credo AI</th>
                      <th className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 w-1/5">Guardrails AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {FULL_MATRIX_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-950 dark:text-white">
                          <span className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
                            {row.category}
                          </span>
                          {row.feature}
                        </td>
                        <td className="py-4 px-4 font-bold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20 border-x border-blue-200 dark:border-blue-900/40">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>{row.anchor}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {row.langsmith}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {row.credo}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {row.guardrails}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <span>* Benchmarks executed on AMD EPYC 7763, Linux 6.8 kernel, Python 3.11.8.</span>
                <Link href="/benchmarks" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  View Full Benchmark Methodology &rarr;
                </Link>
              </div>
            </div>
          )}

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
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="mailto:tan@animuslab.dev" className="hover:text-white transition-colors">Contact Founder</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
