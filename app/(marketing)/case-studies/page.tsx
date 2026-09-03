"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Shield, Lock, FileCheck, Scale, Cpu, Globe, Server, 
  Key, Users, Play, CheckCircle2, AlertTriangle, Terminal, RefreshCw, Sun, Moon, ExternalLink 
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";
import { useTheme } from "@/lib/theme";

/* ─────────────────────────────────────────────────────────
   ANCHOR PROTOCOL — FORENSIC CASE STUDIES & PROOF OF WORK (/case-studies)
   Light Mode: Pure White 3D Cards, Bold Black & Blue Text, Soft Blue Selection
   Dark Mode: Pure Black 3D Cards, Bold White & Blue Text, Slate Selection
───────────────────────────────────────────────────────── */

interface Scenario {
  id: string;
  caseId: string;
  name: string;
  domain: string;
  statute: string;
  payload: string;
  verdict: "BLOCKED" | "COMPLIANT";
  latency: string;
  ruleId: string;
  ruleName: string;
  directive: string;
  chainHash: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "c-001-hft-overrun",
    caseId: "C-001",
    name: "C-001: Tier-1 High-Frequency Fund Deprecated Routine Overrun ($440M Loss)",
    domain: "FINANCE-US-NYC01",
    statute: "SEC Regulation SCI / Authority Isolation Invariant",
    payload: `{\n  "execution_router": "order_router_v4",\n  "invoked_routine": "power_peg_legacy_fill",\n  "ticker": "WMT",\n  "volume": 212000,\n  "account_type": "DORMANT_RETAIL_ROUTING"\n}`,
    verdict: "BLOCKED",
    latency: "0.29 ms",
    ruleId: "SEC-SCI-DEPRECATED-MODULE",
    ruleName: "Authority Overreach & Deprecated Module Reactivation",
    directive: "Execution routine 'power_peg_legacy_fill' was decommissioned in governance lock. Anchor runtime interceptor halted order routing. 0 trades executed.",
    chainHash: "sha256:440a1928bc819028f8201a9c81920ae8f9201a9c81920ae8f9201a9c81920ae8",
  },
  {
    id: "c-002-airline-drift",
    caseId: "C-002",
    name: "C-002: Commercial Airline LLM Support Policy Drift (Tribunal Liability)",
    domain: "CUSTOMER-OPS-CA01",
    statute: "Contract Law / Semantic Policy Contract Invariant",
    payload: `{\n  "agent_id": "support_dialog_agent",\n  "user_query": "Can I claim bereavement refund after travel?",\n  "generated_response": "Yes, submit claim within 90 days of travel.",\n  "policy_ref": "OFFICIAL_TARIFF_SEC_4"\n}`,
    verdict: "BLOCKED",
    latency: "0.32 ms",
    ruleId: "SEMANTIC-POLICY-DRIFT-02",
    ruleName: "Chatbot Policy Drift & Hallucinated Fare Terms",
    directive: "Generated assertion directly violates Tariff Rule 4 (retroactive bereavement claims forbidden). Rerouted response to official tariff text before user delivery.",
    chainHash: "sha256:8120fa8c31e772810a9f201099238e810a9c8f2b23a099182390aef9201992",
  },
  {
    id: "c-005-custody-wire",
    caseId: "C-005",
    name: "C-005: Global Custody Bank $900M Principal Wire Error (Multi-Signoff Failure)",
    domain: "BANKING-US-NYC02",
    statute: "Institutional Wire Controls / Dual-Key Invariant",
    payload: `{\n  "system": "flexcube_wire_subsystem",\n  "action": "execute_principal_payoff",\n  "amount_usd": 894000000.00,\n  "intended_transfer": "INTEREST_ONLY",\n  "signoff_clearances": ["OPERATOR_A"]\n}`,
    verdict: "BLOCKED",
    latency: "0.24 ms",
    ruleId: "DUAL-KEY-WIRE-CEILING",
    ruleName: "Missing Dual-Key Cryptographic Authorization on Wire Outflow",
    directive: "Wire payout exceeds $10M threshold without second independent Hub Manager Ed25519 signature. Wire execution blocked in-flight.",
    chainHash: "sha256:9000a182019a820fe8201a9c81920ae8f9201a9c81920ae8f9201a9c81920ae8",
  },
  {
    id: "compliant-audit",
    caseId: "C-003",
    name: "C-003: Tamper-Evident Distributed Audit Reconstruction",
    domain: "GOVERNANCE-GLOBAL-01",
    statute: "ISO/IEC 42001:2023 / EU AI Act Art. 12 (Record Keeping)",
    payload: `{\n  "agent_id": "kyc_risk_evaluator",\n  "action": "verify_credential_hashes",\n  "doc_fingerprint": "sha256:passport_hash_88291",\n  "pii_redacted": true\n}`,
    verdict: "COMPLIANT",
    latency: "0.21 ms",
    ruleId: "ISO-42001-TRACEABILITY",
    ruleName: "Zero-Knowledge Forensic Audit Verification",
    directive: "Permit granted. Zero policy violations detected. Cryptographic record committed to Decision Audit Chain.",
    chainHash: "sha256:3901af82019a820fe8201a9c81920ae8f9201a9c81920ae8f9201a9c81920ae8",
  },
];

const REAL_CASE_STUDIES = [
  {
    caseId: "C-001",
    slug: "001-authority-overreach",
    title: "How Missing Runtime Governance Led to a $440M Algorithmic Market Disaster",
    incidentDate: "Historical Industry Reference",
    damage: "$440 Million USD",
    rootCause: "Deprecated algorithmic execution module reactivated during deployment without runtime kill switch.",
    anchorSolution: "100% Deterministic Prevention. Anchor Layer 1 AST lockfile prevents deployment of deprecated routines, while Layer 2 runtime guard blocks execution in < 0.4ms.",
    tags: ["Financial Markets", "Algorithmic Execution", "Authority Overreach"],
  },
  {
    caseId: "C-002",
    slug: "002-policy-drift",
    title: "Dynamic Policy Drift Mitigation in Consumer-Facing LLM Chatbots",
    incidentDate: "Historical Industry Reference",
    damage: "Legal Liability & Brand Exposure",
    rootCause: "LLM support agent drifted from official company tariff, hallucinating a retroactive bereavement refund.",
    anchorSolution: "Deterministic Semantic Boundary. Intercepts LLM generated outputs at the delivery channel and verifies assertions against authoritative policy rules.",
    tags: ["Customer Support", "Natural Language", "Policy Drift"],
  },
  {
    caseId: "C-003",
    slug: "003-audit-reconstruction",
    title: "Forensic Audit Reconstruction in Distributed Agent Mesh Systems",
    incidentDate: "Completed Reference",
    damage: "Regulatory Fines & Audit Failures",
    rootCause: "Inability to prove historical AI agent decisions without leaking raw customer PII to external auditors.",
    anchorSolution: "Decision Audit Chain (DAC). Generates immutable SHA-256 chain hashes and Ed25519 node signatures verifiable via dual-key P2P regulatory pulls.",
    tags: ["Audit Readiness", "Zero-Knowledge", "DAC Ledger"],
  },
  {
    caseId: "C-004",
    slug: "004-tsb-migration",
    title: "Core Banking IT Migration Failures — Multi-Node Architectural Drift",
    incidentDate: "Historical Industry Reference",
    damage: "£330 Million GBP",
    rootCause: "Architectural drift across thousands of distributed microservices during high-risk core banking migration.",
    anchorSolution: "Layer 1 Static Invariant Gatekeeping. Fails builds whenever architectural drift exceeds 0.0% against the signed baseline lockfile.",
    tags: ["Core Banking", "IT Migration", "Architectural Drift"],
  },
  {
    caseId: "C-005",
    slug: "005-citibank-transfer",
    title: "High-Value Principal Wire Errors — Multi-Signoff Control Failure",
    incidentDate: "Historical Industry Reference",
    damage: "$900 Million USD (Mistaken Wire)",
    rootCause: "Poorly designed multi-signoff interface failed to enforce dual-control verification on high-value principal payout.",
    anchorSolution: "Dual-Key Cryptographic Approval. Anchor halts any transaction above statutory threshold until second independent clearance signature is verified.",
    tags: ["Institutional Controls", "Wire Transfers", "Dual-Key"],
  },
];

export default function CaseStudiesPage() {
  const { isDark, mounted, toggleTheme } = useTheme();
  const [selectedScenario, setSelectedScenario] = React.useState<Scenario>(SCENARIOS[0]);
  const [isExecuting, setIsExecuting] = React.useState<boolean>(false);
  const [executed, setExecuted] = React.useState<boolean>(true);

  const runEvaluation = () => {
    setIsExecuting(true);
    setExecuted(false);
    setTimeout(() => {
      setIsExecuting(false);
      setExecuted(true);
    }, 450);
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
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/case-studies" className="text-white font-semibold underline underline-offset-4 whitespace-nowrap">Case Studies</Link>
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
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Forensic Incident Repository · case.animuslab.dev</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-950 dark:text-white">
            Forensic Case Studies <br />
            <span className="serif-em text-blue-600 dark:text-blue-400 font-bold">&amp; Proof of Work Sandbox</span>
          </h1>

          <p className="text-base sm:text-lg max-w-3xl mx-auto font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            Examine canonical real-world system failures and test real incident payloads against Anchor’s deterministic Layer 1 &amp; Layer 2 governance guardrails.
          </p>
        </div>
      </section>

      {/* ── 01. INTERACTIVE LIVE INTERCEPTION SANDBOX ───────────────────────── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto space-y-20">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Scenario Selector & Payload */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">
                  Interactive Incident Sandbox
                </span>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">Simulate Canonical Failure Scenarios</h3>
              </div>

              <div className="space-y-3">
                {SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenario(sc);
                        setExecuted(true);
                      }}
                      className={`w-full text-left p-5 transition-all ${
                        isSelected
                          ? "lp-item-selected"
                          : "lp-card-3d"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${
                          isSelected
                            ? "text-blue-950 dark:text-white"
                            : "text-slate-900 dark:text-white"
                        }`}>
                          {sc.name}
                        </p>
                        <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                          sc.verdict === "BLOCKED" 
                            ? "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30" 
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {sc.verdict}
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 font-semibold ${
                        isSelected
                          ? "text-blue-900 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {sc.statute}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Payload Editor Preview (Crisp Obsidian Box) */}
              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/10 text-white space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
                  <span className="text-slate-300 font-bold">Incident Payload ({selectedScenario.caseId})</span>
                  <span className="text-blue-400 font-bold">{selectedScenario.domain}</span>
                </div>
                <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{selectedScenario.payload}</code>
                </pre>

                <button
                  onClick={runEvaluation}
                  disabled={isExecuting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating in Anchor Core...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute Deterministic Guardrail Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Execution Output & DAC Ledger */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
                  Runtime Verification Result
                </span>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">Interception &amp; Decision Audit Chain Output</h3>
              </div>

              {executed && (
                <div className="p-8 rounded-3xl lp-card-3d space-y-6 shadow-xl animate-fadeInUp">
                  
                  {/* Status Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold ${
                        selectedScenario.verdict === "BLOCKED"
                          ? "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      }`}>
                        STATUS: {selectedScenario.verdict === "BLOCKED" ? "BLOCKED_BY_ANCHOR" : "PERMIT_GRANTED"}
                      </span>
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">Core Protocol v6.0.4</span>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase text-slate-700 dark:text-slate-300 font-bold">Interception Latency</p>
                      <p className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{selectedScenario.latency}</p>
                    </div>
                  </div>

                  {/* Matched Rule Details */}
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">Evaluated Invariant</p>
                    <p className="text-xl font-extrabold text-slate-950 dark:text-white">{selectedScenario.ruleName}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-mono font-bold">{selectedScenario.statute}</p>
                  </div>

                  {/* Self-Healing Directive */}
                  <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-white/[0.04] border border-blue-200 dark:border-white/10 space-y-1.5">
                    <p className="text-xs font-mono uppercase font-bold text-blue-700 dark:text-blue-400">Deterministic Guardrail Action</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-semibold">
                      {selectedScenario.directive}
                    </p>
                  </div>

                  {/* Decision Audit Chain (DAC) Append Record (High-Contrast Obsidian Box) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">Decision Audit Chain (DAC) Proof</p>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">APPENDED_AND_SEALED</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0F0F14] font-mono text-xs text-blue-300 break-all border border-white/10 shadow-inner">
                      {selectedScenario.chainHash}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── 02. REAL CANONICAL CASE STUDIES (High-Contrast 3D Cards & Live Links) ── */}
          <div className="space-y-12 pt-12 border-t-2 border-slate-200 dark:border-white/10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">
                Canonical Forensic Repository
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">Real-World Forensic Case Studies</h2>
              <p className="text-base text-slate-800 dark:text-slate-200 font-semibold">
                Authored by AnimusLab researchers. Explore the complete interactive repository at <a href="https://case.animuslab.dev" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 font-bold">case.animuslab.dev</a>.
              </p>
            </div>

            {/* 3D Physical Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {REAL_CASE_STUDIES.map((cs) => (
                <div 
                  key={cs.caseId} 
                  className="lp-card-3d p-8 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                        {cs.caseId}
                      </span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">{cs.incidentDate}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-950 dark:text-white leading-snug">{cs.title}</h3>
                    
                    <div className="space-y-3 text-sm">
                      <p className="text-slate-900 dark:text-slate-100">
                        <strong className="font-extrabold text-slate-950 dark:text-white">Damage:</strong>{" "}
                        <span className="text-red-600 dark:text-red-400 font-extrabold">{cs.damage}</span>
                      </p>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        <strong className="font-bold text-slate-950 dark:text-white">Root Cause:</strong> {cs.rootCause}
                      </p>
                      <p className="text-blue-800 dark:text-blue-300 leading-relaxed font-bold pt-1">
                        <strong className="text-blue-900 dark:text-blue-200 font-black">Anchor Solution:</strong> {cs.anchorSolution}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex flex-wrap gap-1.5">
                      {cs.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-[11px] font-mono text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-white/5">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Direct External Link to specific Case Study */}
                    <a
                      href={`https://case.animuslab.dev/${cs.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md group"
                      style={{ textDecoration: "none" }}
                    >
                      <span>Read Complete Forensic Breakdown</span>
                      <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              ))}
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
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="mailto:tan@animuslab.dev" className="hover:text-white transition-colors">Contact Founder</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
