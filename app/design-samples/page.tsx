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
} from "lucide-react";
import DynamicLanyardCard from "@/components/auth/DynamicLanyardCard";

// High-fidelity demo data for Control Plane preview in Design Samples
const DEMO_GOVERNED_SYSTEMS = [
  {
    id: "SYS-001",
    name: "Agent-Core-v4",
    domain: "SEC-01 (Cyber Risk & Financial Controls)",
    status: "COMPLIANT",
    latency: "12ms",
    executions: "48,120",
  },
  {
    id: "SYS-002",
    name: "Research-Agent-X",
    domain: "ETH-04 (EU AI Act High-Risk Framework)",
    status: "COMPLIANT",
    latency: "18ms",
    executions: "32,890",
  },
  {
    id: "SYS-003",
    name: "Customer-Support-Bot",
    domain: "PRV-02 (PII Boundary & Data Leakage)",
    status: "WARNING",
    latency: "24ms",
    executions: "74,100",
  },
  {
    id: "SYS-004",
    name: "Finance-Executor-Silo",
    domain: "FIN-01 (Treasury & Algorithmic Controls)",
    status: "COMPLIANT",
    latency: "14ms",
    executions: "29,181",
  },
];

const DEMO_RECENT_EVENTS = [
  {
    time: "19:42:01",
    ruleId: "POL-902-SEC",
    system: "Agent-Core-v4",
    action: "Policy evaluated & approved",
    verdict: "PERMITTED",
  },
  {
    time: "19:41:48",
    ruleId: "POL-104-FIN",
    system: "Finance-Executor-Silo",
    action: "Execution token validated",
    verdict: "PERMITTED",
  },
  {
    time: "19:39:12",
    ruleId: "POL-309-PRV",
    system: "Customer-Support-Bot",
    action: "PII leakage attempt intercepted",
    verdict: "BLOCKED",
  },
  {
    time: "19:37:05",
    ruleId: "POL-701-DAC",
    system: "Research-Agent-X",
    action: "Cryptographic evidence Merkle tree sealed",
    verdict: "SEALED",
  },
];

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<"control-plane" | "id-cards">("control-plane");
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
            ANCHOR DESIGN SAMPLES
          </h1>
          <p className="text-sm text-slate-300 font-mono mt-1">
            Sandbox staging environment for reviewing major visual language changes before production rollout.
          </p>
        </div>

        {/* Tab Switching Controls */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/15 font-mono text-xs">
          <button
            onClick={() => setActiveTab("control-plane")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition ${
              activeTab === "control-plane"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. Control Plane Prototype
          </button>
          <button
            onClick={() => setActiveTab("id-cards")}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition ${
              activeTab === "id-cards"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2. Sovereign ID Cards Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: AUTHENTICATED CONTROL PLANE PROTOTYPE */}
      {activeTab === "control-plane" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Control Plane Banner */}
          <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/40 px-3 py-1 rounded-full text-xs font-mono text-indigo-300 mb-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>PROTOTYPE STAGING // STAGE 01</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
                  ANCHOR CONTROL PLANE
                </h2>
                <p className="text-sm text-slate-300 font-mono mt-1">
                  Silo ID: <span className="text-white font-bold">ANIMUSLAB-MESH-01</span> · Operator: <span className="text-indigo-300">tan@animuslab.dev</span>
                </p>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
                  ● GOVERNANCE ACTIVE
                </span>
              </div>
            </div>

            {/* Real-time Status Bar Metrics */}
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

          {/* Main Grid: Governed Systems & Live Governance Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Governed AI Fleet */}
            <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span>GOVERNED AI FLEET</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">Active agent runtime nodes under governance</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {DEMO_GOVERNED_SYSTEMS.map((system) => (
                  <div
                    key={system.id}
                    className="bg-black/40 p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-4 font-mono"
                  >
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

                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${
                          system.status === "COMPLIANT"
                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                            : "bg-amber-500/20 border-amber-400/50 text-amber-300"
                        }`}
                      >
                        {system.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Governance Event Stream */}
            <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span>LIVE RECENT EVENTS</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">Real-time policy decision stream</p>
                </div>
              </div>

              <div className="space-y-3 font-mono">
                {DEMO_RECENT_EVENTS.map((event, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2 text-xs"
                  >
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
                      <span
                        className={`font-extrabold px-2.5 py-0.5 rounded-md uppercase text-[10px] ${
                          event.verdict === "PERMITTED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            : event.verdict === "BLOCKED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40"
                        }`}
                      >
                        {event.verdict}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance Health Gauges */}
          <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/20">
            <div className="border-b border-white/15 pb-4">
              <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>GOVERNANCE HEALTH & COMPLIANCE ASSURANCE</span>
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">Aggregate enforcement & evidence integrity metrics</p>
            </div>

            <div className="space-y-5 font-mono">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Policy Compliance Rate</span>
                  <span className="text-emerald-400 font-bold">98.7%</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/15 p-0.5">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[98.7%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Runtime Interception Coverage</span>
                  <span className="text-indigo-300 font-bold">99.2%</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/15 p-0.5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-[99.2%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Evidence Log Integrity (Merkle Sealing)</span>
                  <span className="text-cyan-400 font-bold">100.0% (Zero Tampering)</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/15 p-0.5">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOVEREIGN ID CARDS MATRIX */}
      {activeTab === "id-cards" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Dynamic Parameter Inputs */}
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

          {/* Spatial UI ID Cards Showcase Grid */}
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
