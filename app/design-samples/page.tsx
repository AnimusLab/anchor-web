"use client";

import { useState } from "react";
import {
  Sparkles,
  Sliders,
  Layers,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Cpu,
  Terminal,
  TrendingUp,
  Server,
  AlertTriangle,
  Zap,
  FileCheck,
  Clock,
  Shield,
  Building2,
  Send,
  UserCheck,
  Plus,
  CheckCircle,
  XCircle,
  Activity,
  Globe,
  Lock,
} from "lucide-react";
import DynamicLanyardCard from "@/components/auth/DynamicLanyardCard";

// ================= DEMO DATASETS FOR THE 3 CONTROL PLANES =================

// 1. Enterprise Hub Demo Data
const DEMO_ENTERPRISE_SYSTEMS = [
  { id: "SYS-001", name: "Agent-Core-v4", domain: "SEC-01 (Cyber Risk & Financial Controls)", status: "COMPLIANT", latency: "12ms", executions: "48,120" },
  { id: "SYS-002", name: "Research-Agent-X", domain: "ETH-04 (EU AI Act High-Risk Framework)", status: "COMPLIANT", latency: "18ms", executions: "32,890" },
  { id: "SYS-003", name: "Customer-Support-Bot", domain: "PRV-02 (PII Boundary & Data Leakage)", status: "WARNING", latency: "24ms", executions: "74,100" },
  { id: "SYS-004", name: "Finance-Executor-Silo", domain: "FIN-01 (Treasury & Algorithmic Controls)", status: "COMPLIANT", latency: "14ms", executions: "29,181" },
];

const DEMO_ENTERPRISE_EVENTS = [
  { time: "19:42:01", ruleId: "POL-902-SEC", system: "Agent-Core-v4", action: "Policy evaluated & approved", verdict: "PERMITTED" },
  { time: "19:41:48", ruleId: "POL-104-FIN", system: "Finance-Executor-Silo", action: "Execution token validated", verdict: "PERMITTED" },
  { time: "19:39:12", ruleId: "POL-309-PRV", system: "Customer-Support-Bot", action: "PII leakage attempt intercepted", verdict: "BLOCKED" },
  { time: "19:37:05", ruleId: "POL-701-DAC", system: "Research-Agent-X", action: "Cryptographic evidence Merkle tree sealed", verdict: "SEALED" },
];

// 2. Regulatory Oversight Demo Data
const DEMO_REGULATED_INSTITUTIONS = [
  { id: "INST-001", name: "AnimusLab Mesh Silo", jurisdiction: "EU AI Act & SEC", compliance: "98.7%", riskTier: "LOW", auditDate: "19:42:01", status: "VERIFIED" },
  { id: "INST-002", name: "FinTech Global Silo", jurisdiction: "SEBI & RBI Cyber Rules", compliance: "99.4%", riskTier: "LOW", auditDate: "19:40:15", status: "VERIFIED" },
  { id: "INST-003", name: "HealthAI Systems Node", jurisdiction: "HIPAA & EU AI Act", compliance: "94.1%", riskTier: "MEDIUM", auditDate: "19:35:00", status: "WARNING (1 Violation)" },
  { id: "INST-004", name: "Alpha Algo Treasury", jurisdiction: "CFPB & FCA Algorithmic Trading", compliance: "100.0%", riskTier: "LOW", auditDate: "19:30:22", status: "VERIFIED" },
];

const DEMO_OVERSIGHT_DECISIONS = [
  { time: "19:41:10", inst: "AnimusLab Mesh", model: "LLM-Credit-Assessor", rule: "EU-AI-ACT-ART-14", hash: "0x8f2a...c419", verdict: "AUDITED_COMPLIANT" },
  { time: "19:38:44", inst: "HealthAI Systems", model: "Clinical-Diagnostic-Agent", rule: "HIPAA-PRV-901", hash: "0x3e11...b820", verdict: "AUDITED_WARNING" },
  { time: "19:32:00", inst: "FinTech Global", model: "Fraud-Detection-Model", rule: "SEBI-SEC-402", hash: "0x7d94...e102", verdict: "AUDITED_COMPLIANT" },
];

// 3. Root Admin Demo Data
const DEMO_TENANT_HUBS = [
  { id: "HUB-001", name: "AnimusLab Primary Mesh", org: "AnimusLab Dev", nodes: 14, cpu: "18%", memory: "4.2 GB", status: "HEALTHY" },
  { id: "HUB-002", name: "Nexus Financial Silo", org: "Nexus Systems", nodes: 8, cpu: "32%", memory: "8.1 GB", status: "HEALTHY" },
  { id: "HUB-003", name: "Alpha Cloud Governance", org: "Alpha Corp", nodes: 22, cpu: "65%", memory: "16.4 GB", status: "HEALTHY" },
];

const DEMO_PENDING_WHITELIST = [
  { email: "sarah@acme-finance.org", role: "SOVEREIGN OPERATOR", org: "Acme Finance", domainVerified: true, time: "10 mins ago" },
  { email: "auditor.vance@sec.gov", role: "STATUTORY AUDITOR", org: "SEC Enforcement", domainVerified: true, time: "25 mins ago" },
];

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<"enterprise" | "oversight" | "admin" | "id-cards">("enterprise");
  const [testName, setTestName] = useState("Tanishq Vaswani");
  const [testEmail, setTestEmail] = useState("tan@animuslab.dev");
  const [testHub, setTestHub] = useState("animuslab");

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Bar */}
      <div className="border-b border-white/15 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/40 px-3.5 py-1 rounded-full text-xs font-mono text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>DESIGN LABORATORY & PROTOTYPE STAGING</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
            ANCHOR CONTROL PLANES PROTOTYPES
          </h1>
          <p className="text-sm text-slate-300 font-mono mt-1">
            Sandbox staging room to review, refine, and test major visual features before production rollout.
          </p>
        </div>

        {/* Tab Switching Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/15 font-mono text-xs">
          <button
            onClick={() => setActiveTab("enterprise")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition flex items-center space-x-1.5 ${
              activeTab === "enterprise" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>1. Enterprise Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("oversight")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition flex items-center space-x-1.5 ${
              activeTab === "oversight" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>2. Auditor Oversight</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition flex items-center space-x-1.5 ${
              activeTab === "admin" ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>3. Root Admin</span>
          </button>

          <button
            onClick={() => setActiveTab("id-cards")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition flex items-center space-x-1.5 ${
              activeTab === "id-cards" ? "bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>4. ID Cards Matrix</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ENTERPRISE CONTROL PLANE PROTOTYPE ================= */}
      {activeTab === "enterprise" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Banner */}
          <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-indigo-400/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/40 px-3 py-1 rounded-full text-xs font-mono text-indigo-300 mb-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CLEARANCE: SOVEREIGN OPERATOR</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
                  ENTERPRISE CONTROL PLANE
                </h2>
                <p className="text-sm text-slate-300 font-mono mt-1">
                  Tenant Silo: <span className="text-white font-bold">ANIMUSLAB-MESH-01</span> · Operator: <span className="text-indigo-300">tan@animuslab.dev</span>
                </p>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
                  ● GOVERNANCE ACTIVE
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">MONITORED SYSTEMS</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>14 NODES</span>
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[11px] text-emerald-400 block font-semibold">100% Operational</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CRITICAL VIOLATIONS</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span className="text-emerald-400">0</span>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[11px] text-amber-300 block font-semibold">3 Warnings Flagged</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">EVALUATED EVENTS</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>184,291</span>
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[11px] text-cyan-300 block font-semibold">+1,420 events / min</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">EVIDENCE VERIFIED</span>
                <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
                  <span>99.98%</span>
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-slate-300 block font-semibold">Cryptographically Sealed</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <span>GOVERNED AI FLEET (ENTERPRISE SILO)</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {DEMO_ENTERPRISE_SYSTEMS.map((system) => (
                  <div key={system.id} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-4 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-white font-sans">{system.name}</span>
                        <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">{system.id}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans">{system.domain}</div>
                    </div>

                    <div className="flex items-center space-x-4 text-right flex-shrink-0">
                      <div className="text-xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px]">EXEC: {system.executions}</span>
                        <span className="text-emerald-400 font-bold block text-[11px]">{system.latency} latency</span>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${system.status === "COMPLIANT" ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300" : "bg-amber-500/20 border-amber-400/50 text-amber-300"}`}>
                        {system.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>LIVE ENTERPRISE DECISION STREAM</span>
                </h3>
              </div>

              <div className="space-y-3 font-mono">
                {DEMO_ENTERPRISE_EVENTS.map((event, idx) => (
                  <div key={idx} className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.time}</span>
                      </span>
                      <span className="text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30">
                        {event.ruleId}
                      </span>
                    </div>
                    <div className="text-white font-sans font-semibold">{event.action}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-slate-400">{event.system}</span>
                      <span className={`font-extrabold px-2.5 py-0.5 rounded-md uppercase text-[10px] ${event.verdict === "PERMITTED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : event.verdict === "BLOCKED" ? "bg-rose-500/20 text-rose-300 border border-rose-400/40" : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40"}`}>
                        {event.verdict}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AUDITOR OVERSIGHT CONTROL PLANE PROTOTYPE ================= */}
      {activeTab === "oversight" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Banner */}
          <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-amber-400/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-mono text-amber-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>CLEARANCE: STATUTORY AUDITOR (GLOBAL)</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
                  REGULATORY OVERSIGHT CONTROL PLANE
                </h2>
                <p className="text-sm text-slate-300 font-mono mt-1">
                  Jurisdiction: <span className="text-amber-300 font-bold">GLOBAL (EU AI ACT / SEC / SEBI)</span> · Read-Only Cryptographic Audit Node
                </p>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span className="bg-amber-500/20 border border-amber-400/50 text-amber-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
                  ● STATUTORY OVERSIGHT ACTIVE
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">REGULATED INSTITUTIONS</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>12 SILOS</span>
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[11px] text-amber-300 block font-semibold">Active Monitored Mesh</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">DECISIONS AUDITED</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>1,420,890</span>
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-400 block font-semibold">100% Chain Hash Signed</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">P2P EVIDENCE PULLS</span>
                <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-between">
                  <span>4 RELAYED</span>
                  <Send className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[11px] text-slate-300 block font-semibold">Zero-Knowledge Sealed</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ENFORCEMENT NOTICES</span>
                <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
                  <span>0 ACTIVE</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-300 block font-semibold">Zero Active Disputes</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Regulated Institutions Heatmap Grid */}
            <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span>REGULATED INSTITUTIONS HEATMAP</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {DEMO_REGULATED_INSTITUTIONS.map((inst) => (
                  <div key={inst.id} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-4 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-white font-sans">{inst.name}</span>
                        <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">{inst.id}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans">{inst.jurisdiction}</div>
                    </div>

                    <div className="flex items-center space-x-4 text-right flex-shrink-0">
                      <div className="text-xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px]">AUDIT: {inst.auditDate}</span>
                        <span className="text-amber-300 font-bold block text-[11px]">{inst.compliance} COMPLIANCE</span>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${inst.riskTier === "LOW" ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300" : "bg-amber-500/20 border-amber-400/50 text-amber-300"}`}>
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Audit Chain (DAC) Ledger */}
            <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>DECISION AUDIT CHAIN (DAC)</span>
                </h3>
              </div>

              <div className="space-y-3 font-mono">
                {DEMO_OVERSIGHT_DECISIONS.map((entry, idx) => (
                  <div key={idx} className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="text-slate-200 font-bold">{entry.inst}</span>
                      <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">{entry.rule}</span>
                    </div>
                    <div className="text-white font-sans font-semibold">{entry.model}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Chain Hash: {entry.hash}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <span className="text-emerald-400 font-bold">{entry.verdict}</span>
                      <button className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-500/30 transition text-[10px]">
                        Request P2P Pull →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ROOT ADMIN CONTROL PLANE PROTOTYPE ================= */}
      {activeTab === "admin" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Banner */}
          <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-rose-400/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-rose-500/20 border border-rose-400/40 px-3 py-1 rounded-full text-xs font-mono text-rose-200 mb-2">
                  <Shield className="w-3.5 h-3.5 text-rose-300" />
                  <span>CLEARANCE: ROOT OPERATOR (LEVEL 0)</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
                  ROOT ADMIN CONTROL PLANE
                </h2>
                <p className="text-sm text-slate-300 font-mono mt-1">
                  Master Operations Portal · Primary Cluster Node: <span className="text-rose-300 font-bold">AN-EAST-01</span>
                </p>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
                <span className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
                  ● ROOT AUTHORITY GATE ACTIVE
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PROVISIONED HUBS</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>48 HUBS</span>
                  <Building2 className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-[11px] text-emerald-400 block font-semibold">Real-Time Active Mesh</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PENDING WHITELIST</span>
                <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-between">
                  <span>2 QUEUED</span>
                  <UserCheck className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[11px] text-amber-300 block font-semibold">Domain Check Verified</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">P2P RELAY CLUSTER</span>
                <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                  <span>12 NODES</span>
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <span className="text-[11px] text-cyan-300 block font-semibold">High Availability Mesh</span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CLUSTER UPTIME</span>
                <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
                  <span>99.999%</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-slate-300 block font-semibold">SLA Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Whitelist Queue Table */}
            <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>WHITELIST PROVISIONING QUEUE</span>
                </h3>
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                {DEMO_PENDING_WHITELIST.map((item, idx) => (
                  <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-rose-300 font-bold text-sm">{item.email}</span>
                        <span className="bg-rose-500/20 text-rose-200 border border-rose-400/40 px-2.5 py-0.5 rounded-md text-[10px]">
                          {item.role}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs">Org: {item.org} · Domain Check: <span className="text-emerald-400 font-bold">PASSED</span></div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button className="bg-rose-500/20 border border-rose-400/50 text-rose-300 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenant Hub Health Matrix */}
            <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-rose-400" />
                  <span>MULTI-TENANT HUB MATRIX</span>
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {DEMO_TENANT_HUBS.map((hub) => (
                  <div key={hub.id} className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold font-sans text-sm">{hub.name}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] border border-emerald-400/30">
                        {hub.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex justify-between">
                      <span>Org: {hub.org}</span>
                      <span>Nodes: {hub.nodes}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-300">
                      <span>CPU: <strong className="text-indigo-300">{hub.cpu}</strong></span>
                      <span>RAM: <strong className="text-cyan-300">{hub.memory}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SOVEREIGN ID CARDS MATRIX ================= */}
      {activeTab === "id-cards" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/15 space-y-3 font-mono text-xs shadow-2xl">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Input Mirroring Test Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PERSONNEL NAME</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-indigo-400 text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">CORPORATE EMAIL</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-indigo-400 text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">HUB SILO ID</label>
                <input
                  type="text"
                  value={testHub}
                  onChange={(e) => setTestHub(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-indigo-400 text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center justify-items-center">
            {/* Enterprise Role */}
            <section className="space-y-4 w-full flex flex-col items-center">
              <div className="text-center space-y-1 font-mono">
                <span className="text-xs text-indigo-400 font-bold uppercase">ENTERPRISE HUB ROLE</span>
                <h3 className="text-lg font-bold text-slate-100 font-sans">Cobalt Sovereign ID</h3>
              </div>
              <DynamicLanyardCard
                portalTheme="hub"
                data={{
                  name: testName,
                  email: testEmail,
                  orgName: "ANIMUSLAB MESH",
                  hubId: testHub,
                  clearanceId: "OWN-AN-MUM-842",
                  role: "SOVEREIGN OPERATOR",
                  isVerified: true,
                }}
              />
            </section>

            {/* Auditor Role */}
            <section className="space-y-4 w-full flex flex-col items-center">
              <div className="text-center space-y-1 font-mono">
                <span className="text-xs text-amber-400 font-bold uppercase">STATUTORY AUDITOR ROLE</span>
                <h3 className="text-lg font-bold text-slate-100 font-sans">Amber Oversight ID</h3>
              </div>
              <DynamicLanyardCard
                portalTheme="oversight"
                data={{
                  name: testName,
                  email: testEmail,
                  orgName: "STATUTORY AGENCY",
                  hubId: testHub,
                  clearanceId: "AUD-RBI-009",
                  role: "STATUTORY OFFICER",
                  isVerified: true,
                }}
              />
            </section>

            {/* Admin Role */}
            <section className="space-y-4 w-full flex flex-col items-center">
              <div className="text-center space-y-1 font-mono">
                <span className="text-xs text-rose-400 font-bold uppercase">ROOT ADMIN ROLE</span>
                <h3 className="text-lg font-bold text-slate-100 font-sans">Crimson Root Admin ID</h3>
              </div>
              <DynamicLanyardCard
                portalTheme="admin"
                data={{
                  name: testName,
                  email: testEmail,
                  orgName: "ANIMUSLAB INFRA",
                  hubId: testHub,
                  clearanceId: "ROOT-ADM-001",
                  role: "ROOT OPERATOR",
                  isVerified: true,
                }}
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
