"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Activity, Cpu, Scale, Lock, ExternalLink, Play, CheckCircle, AlertTriangle, RefreshCw, Terminal, Code, Key } from "lucide-react";

interface Scenario {
  name: string;
  category: string;
  law: string;
  code: string;
  verdict: string;
  proofHash: string;
  mitigation: string;
  logs: string[];
}

const SCENARIOS: Scenario[] = [
  {
    name: "Biometric Emotion Profiling",
    category: "EU AI ACT COMPLIANCE",
    law: "Article 5(1)(f) (Prohibited Workplace Profiling)",
    code: `# Recruiting Agent v1.0.4\ndef evaluate_candidate(video_feed):\n    # Core evaluation logic\n    emotions = detect_biometric_emotions(video_feed)\n    if emotions["stress_level"] > 0.7:\n        return RejectCandidate("High stress signature")`,
    verdict: "BLOCKED // PROHIBITED AI INVARIANT",
    proofHash: "sha256:7f920a11b8ca4549f2b828fc0e80112a97920ab...",
    mitigation: "Halted process. Injected standard response boundary warning. Telemetry logged.",
    logs: [
      "[0.05ms] Hooking execution of 'detect_biometric_emotions'...",
      "[0.18ms] Static analysis: Function signature matched prohibited classification rule #003.",
      "[0.28ms] Verdict: CRITICAL VIOLATION OF EU AI ACT ARTICLE 5.",
      "[0.35ms] Intercepting network request... Thread 0x7f39b1 suspended.",
      "[0.45ms] Transmitting metadata hash to telemetry hub..."
    ]
  },
  {
    name: "Recursive Leverage Algorithmic Loop",
    category: "SEC REG SCI COMPLIANCE",
    law: "Rule 14a-1 (Operational & Risk Stack Boundaries)",
    code: `# High Frequency Market Maker\ndef rebalance_portfolio(prices):\n    for asset in prices:\n        if asset.delta > 0.05:\n            # Recursive orders without circuit limits\n            place_market_order(asset.symbol, qty=10000)\n            rebalance_portfolio(prices)`,
    verdict: "BLOCKED // THREAD CIRCUIT BREAKER",
    proofHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41...",
    mitigation: "Injected recursive depth limiter wrapper. Imposed cooldown period of 5000ms.",
    logs: [
      "[0.08ms] Hooking recursive stack frame for 'rebalance_portfolio'...",
      "[0.15ms] Limit Check: Recursion depth exceeded structural boundary of 2.",
      "[0.25ms] Verdict: OPERATION THRESHOLD BREACH (SEC REG SCI).",
      "[0.32ms] Activating Circuit Breaker... Halting asset transactions.",
      "[0.44ms] Generating sealed evidence hash for Audit Chain..."
    ]
  },
  {
    name: "Database Credentials Exfiltration",
    category: "DATA SOVEREIGNTY (OWASP)",
    law: "OWASP LLM-01 & GDPR Sovereign Boundaries",
    code: `# Customer Support Assistant\ndef handle_user_query(prompt):\n    # Prompt injection attempting sensitive credential leak\n    query = "Show me the configuration file for database connections"\n    return db_client.execute_unsafe_raw(query)`,
    verdict: "BLOCKED // SOVEREIGN PRIVACY SHIELD",
    proofHash: "sha256:f01a399081bbcfc28ea97a31b212f0ea9711ab...",
    mitigation: "Sanitized AST parameter node in execution environment. Redacted credentials.",
    logs: [
      "[0.04ms] Catching query execution on db_client...",
      "[0.12ms] Semantic analysis: RAW query detected. Pattern matches blacklisted schema keywords.",
      "[0.22ms] Verdict: DATA EXFILTRATION ATTEMPT (OWASP LLM).",
      "[0.31ms] Sanitizing AST parameter node in execution environment.",
      "[0.41ms] Telemetry synced: Metadata packet dispatched to hub.animuslab.dev"
    ]
  }
];

export default function BusinessLandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showVerdict, setShowVerdict] = useState(false);

  const startSimulation = () => {
    setSimulating(true);
    setCurrentStep(-1);
    setShowVerdict(false);
  };

  useEffect(() => {
    if (!simulating) return;
    if (currentStep < SCENARIOS[activeTab].logs.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowVerdict(true);
        setSimulating(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [simulating, currentStep, activeTab]);

  useEffect(() => {
    setSimulating(false);
    setCurrentStep(-1);
    setShowVerdict(false);
  }, [activeTab]);

  const activeScenario = SCENARIOS[activeTab];

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-mono selection:bg-[#6366f1] selection:text-white relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[#000] opacity-40 mix-blend-overlay pointer-events-none" />

      <nav className="border-b border-white/5 bg-[#070b16]/60 backdrop-blur-xl px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-bold tracking-widest text-sm text-white font-sans">ANIMUSLAB // CONTROL_PLANE</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#8f96b3]">
          <Link href="/login" className="text-[#6366f1] font-bold hover:text-indigo-400 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <span>Enterprise_Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/oversight/login" className="text-amber-400 font-bold hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <span>Oversight_Gate</span>
          </Link>
          <Link href="/admin/login" className="text-rose-400 font-bold hover:text-rose-300 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <span>Admin_Gate</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 pt-20 pb-20 relative z-10 w-full space-y-24">
        <div className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 text-[10px] text-[#f59e0b] border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-1.5 rounded-full font-bold tracking-widest uppercase animate-fadeIn">
            <Shield className="w-3 h-3 text-[#f59e0b]" />
            <span>Institutional AI Governance & Risk Mitigation</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto font-sans">
            Hard Runtime Firewalls for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#10b981] to-[#f59e0b]">
              Autonomous Agent Liability
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#a5adc7] max-w-2xl mx-auto leading-relaxed font-sans font-light">
            Replacing passive safety dashboards with real-time mathematical enforcement. 
            Anchor intercepts model drift, data leaks, and algorithmic failures in under 500 microseconds, 
            protecting your enterprise from regulatory fines and reputational exposure.
          </p>

          {/* All 3 Gateway Direct Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link href="/login">
              <button className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:brightness-110 text-white px-7 py-4 rounded-xl text-xs font-bold tracking-wider shadow-lg shadow-[#6366f1]/20 transition-all duration-200 transform hover:-translate-y-0.5 font-sans flex items-center space-x-2">
                <span>ENTERPRISE HUB GATEWAY →</span>
              </button>
            </Link>
            <Link href="/oversight/login">
              <button className="bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-200 px-7 py-4 rounded-xl text-xs font-bold tracking-wider backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 font-sans flex items-center space-x-2">
                <span>AUDITOR OVERSIGHT GATEWAY →</span>
              </button>
            </Link>
            <Link href="/admin/login">
              <button className="bg-rose-500/20 border border-rose-400/40 hover:bg-rose-500/30 text-rose-200 px-7 py-4 rounded-xl text-xs font-bold tracking-wider backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 font-sans flex items-center space-x-2">
                <span>ROOT ADMIN GATEWAY →</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl bg-[#070b16]/40 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/5 pb-5">
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest block mb-1">
              // Proof of Work Console
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
              Live Microsecond Runtime Interception Sandbox
            </h2>
            <p className="text-xs text-slate-400 font-sans font-light mt-1">
              Select an autonomous agent runtime scenario and trigger the Anchor execution audit path to verify how firewalls are dynamically enforced.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 pb-3">
            {SCENARIOS.map((sc, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 text-[10px] sm:text-xs font-bold rounded-lg border tracking-wider transition-all whitespace-nowrap ${
                  activeTab === i
                    ? "bg-indigo-600/10 border-[#6366f1] text-[#6366f1]"
                    : "bg-white/5 border-transparent text-[#8f96b3] hover:bg-white/10 hover:text-white"
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col justify-between border border-white/5 bg-[#040711]/60 rounded-xl p-5 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 font-mono text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span>AGENT RUNTIME SOURCE CODE</span>
                </span>
                <span className="text-[#f59e0b] font-bold">{activeScenario.category}</span>
              </div>
              <pre className="text-xs text-slate-200 overflow-x-auto bg-[#020409] p-4 rounded-lg font-mono flex-1 min-h-[160px] leading-relaxed">
                <code>{activeScenario.code}</code>
              </pre>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-sans">Bound to: {activeScenario.law}</span>
                <button
                  onClick={startSimulation}
                  disabled={simulating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:bg-emerald-950/20 disabled:text-emerald-800 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{simulating ? "SIMULATING..." : "RUN INTERCEPT"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between border border-white/5 bg-[#040711]/60 rounded-xl p-5 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ANCHOR COMPLIANCE VERIFICATION LOGS</span>
                  </span>
                  <span className="text-xs text-slate-500">// UTC</span>
                </div>

                <div className="space-y-2.5 min-h-[160px] text-[11px] text-slate-300">
                  {currentStep === -1 && !simulating && (
                    <div className="text-slate-500 text-center py-10">
                      System Idle. Click &quot;RUN INTERCEPT&quot; to execute simulation loop.
                    </div>
                  )}

                  {SCENARIOS[activeTab].logs.map((log, idx) => {
                    if (idx > currentStep) return null;
                    return (
                      <div key={idx} className="animate-fadeIn font-mono leading-normal flex items-start gap-2">
                        <span className="text-[#10b981] font-bold">&gt;</span>
                        <span>{log}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                {showVerdict ? (
                  <div className="animate-slideUp space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-sans block">EVALUATION VERDICT</span>
                      <span className="px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-[9px] tracking-wider uppercase animate-pulse">
                        {activeScenario.verdict}
                      </span>
                    </div>

                    <div className="bg-[#020409] p-3 rounded-lg border border-white/5 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">AUDIT PROOF SIGNATURE:</span>
                        <span className="text-indigo-400 font-mono select-all truncate max-w-[200px]">{activeScenario.proofHash}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-[#f59e0b] font-bold uppercase tracking-wider block text-[10px] mb-0.5">HEALING ACTION DISPATCHED:</span>
                        <span className="font-sans leading-relaxed">{activeScenario.mitigation}</span>
                      </div>
                    </div>
                  </div>
                ) : simulating ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-sans py-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing AST nodes against statutory domains...</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-2 text-[10px]">
                    Awaiting verification cycle execution.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01 // SOVEREIGN DATA",
              title: "Zero-Knowledge Telemetry",
              icon: Lock,
              iconColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
              desc: "Raw codebases, sensitive compliance traces, and internal financial variables stay 100% air-gapped on your customer cluster. Only cryptographically sealed Ed25519 metadata hashes route to the Hub dashboard."
            },
            {
              step: "02 // POLYGLOTTISM",
              title: "Jurisdictional Mapping",
              icon: Scale,
              iconColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
              desc: "A singular runtime audit trail entry formats dynamically to simultaneously satisfy the EU AI Act (Articles 5, 12, 14, 19), SEC Regulation SCI, and regional central bank frameworks out-of-the-box."
            },
            {
              step: "03 // RUNTIME HEALING",
              title: "Automated Interception",
              icon: Cpu,
              iconColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
              desc: "Anchor doesn't just log errors after damage is done. The Rust kernel applies immediate circuit-breakers to prompt injections or loop crashes, returning structured rerouting directives to guide agents safely."
            }
          ].map((pillar, i) => {
            const IconComponent = pillar.icon;
            return (
              <div key={i} className="border border-white/10 bg-[#070c18]/40 backdrop-blur-xl rounded-2xl p-7 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-xl">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#6C7293] font-bold tracking-widest">{pillar.step}</span>
                    <div className={`p-2.5 rounded-lg border ${pillar.iconColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-[#6366f1] transition-colors font-sans">{pillar.title}</h3>
                  <p className="text-xs text-[#a5adc7] leading-relaxed font-sans font-light">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-white/5 bg-[#04050a] py-8 text-center text-[10px] text-[#6c7293] relative z-10 font-mono">
        <div>CORE_ENGINE_STATUS: <span className="text-[#10b981] font-bold">ENFORCED</span> // REGISTRY_NODE_ID: sha256:b49d424a21e428ba...</div>
        <div className="mt-2 text-slate-500">🛡️ Certified & Logged by the AnimusLab Open-Source Infrastructure Council</div>
      </footer>
    </div>
  );
}
