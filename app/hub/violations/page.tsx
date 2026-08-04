"use client";

import { ShieldAlert, AlertTriangle, FileCheck, ExternalLink, ShieldX } from "lucide-react";

interface ViolationItem {
  id: string;
  timestamp: string;
  project: string;
  agent: string;
  ruleViolated: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  jurisdiction: string;
  description: string;
}

const MOCK_VIOLATIONS: ViolationItem[] = [
  {
    id: "viol_8801",
    timestamp: "2026-08-04 12:44:50 UTC",
    project: "wealth-advisor-agent",
    agent: "portfolio-balancer",
    ruleViolated: "EU AI Act Article 14 (Human Oversight Override)",
    severity: "CRITICAL",
    jurisdiction: "EU_AI_ACT_2024",
    description: "Agent auto-executed high-risk trade exceeding 500k EUR threshold without requiring mandatory dual-key human manager sign-off."
  },
  {
    id: "viol_8802",
    timestamp: "2026-08-04 11:20:15 UTC",
    project: "credit-decisioning",
    agent: "underwriter-ai",
    ruleViolated: "RBI Master Direction - Digital Lending Sec 7.2",
    severity: "HIGH",
    jurisdiction: "RBI_IN_2025",
    description: "Decision engine referenced unapproved secondary demographic feature during automated interest rate scoring."
  },
  {
    id: "viol_8803",
    timestamp: "2026-08-04 09:15:00 UTC",
    project: "kyc-verifier",
    agent: "document-parser",
    ruleViolated: "ISO/IEC 42001 Clause 8.3 (Data Provenance Log)",
    severity: "MEDIUM",
    jurisdiction: "ISO_42001",
    description: "Audit trail missing raw image SHA-256 reference prior to optical character extraction."
  }
];

export default function ViolationFeedPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">COMPLIANCE RISK MONITOR</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Violation Feed</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Real-time flagged compliance flaws, regulatory breaches, and rule violations.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">ACTIVE CRITICAL: </span>
          <span className="text-rose-400 font-bold glass-badge px-3 py-1.5 inline-block">1 Critical Breach</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-rose-400">CRITICAL BREACHES</span>
            <ShieldX className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400 mt-2">1 Active</div>
          <div className="text-xs text-slate-400 font-mono">Requires Dual Key Resolution</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-amber-400">HIGH SEVERITY</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">1 Flaw</div>
          <div className="text-xs text-slate-400 font-mono">RBI Digital Lending</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">MEDIUM / LOW</span>
            <FileCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">1 Finding</div>
          <div className="text-xs text-slate-400 font-mono">ISO 42001 Audit Trail</div>
        </div>
      </div>

      {/* Violations List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">REGULATORY BREACH FEED</span>
          <span className="text-xs font-mono text-slate-400">Sorted by Severity</span>
        </div>

        <div className="p-5 space-y-4">
          {MOCK_VIOLATIONS.map((viol) => (
            <div key={viol.id} className="glass-card-inset p-5 space-y-3 font-mono text-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-rose-400 font-bold text-sm">{viol.id}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-200 font-semibold">{viol.project}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{viol.agent}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="glass-badge px-3 py-1 text-sky-400 font-bold text-[10px]">
                    {viol.jurisdiction}
                  </span>
                  <span
                    className={`glass-badge px-3 py-1 font-bold text-[10px] ${
                      viol.severity === "CRITICAL"
                        ? "text-rose-400 border-rose-500/30"
                        : viol.severity === "HIGH"
                        ? "text-amber-400"
                        : "text-sky-400"
                    }`}
                  >
                    {viol.severity}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-amber-400 font-bold text-sm block font-sans mb-1">
                  {viol.ruleViolated}
                </span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {viol.description}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-white/5">
                <span>Ingested: {viol.timestamp}</span>
                <button className="text-sky-400 hover:underline flex items-center space-x-1">
                  <span>View Decision Telemetry</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
