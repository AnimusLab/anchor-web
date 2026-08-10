"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Activity, Cpu, Scale, Lock, ExternalLink } from "lucide-react";

export default function BusinessLandingPage() {
  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-mono selection:bg-[#6366f1] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Cinematic Quantum Mesh Spatial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[#000] opacity-40 mix-blend-overlay pointer-events-none" />

      {/* Top Navigation Bar Component */}
      <nav className="border-b border-white/5 bg-[#070b16]/60 backdrop-blur-xl px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-bold tracking-widest text-sm text-white font-sans">ANIMUSLAB // CONTROL_PLANE</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#8f96b3]">
          <a href="https://animuslab.dev/rules" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider">
            <span>Statutory_Rules</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://anchor.animuslab.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider">
            <span>Research_Folio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-white/20">|</span>
          <Link href="/hub" className="text-[#6366f1] font-bold hover:text-indigo-400 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <span>Enterprise_Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section: The Executive Value Pitch */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 pt-20 pb-20 relative z-10 w-full">
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

          {/* Business-Focused Premium Call-To-Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link href="/hub">
              <button className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:brightness-110 text-white px-8 py-4 rounded-xl text-xs font-bold tracking-wider shadow-lg shadow-[#6366f1]/20 transition-all duration-200 transform hover:-translate-y-0.5 font-sans">
                DEPLOY ENTERPRISE HUB →
              </button>
            </Link>
            <Link href="/oversight">
              <button className="bg-[#070b16]/80 border border-white/10 hover:border-white/30 text-[#C5C9DB] hover:text-white px-8 py-4 rounded-xl text-xs font-bold tracking-wider backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 font-sans">
                AUDITOR OVERSIGHT GATEWAY
              </button>
            </Link>
          </div>
        </div>

        {/* The 3 Business Pillars Grid Layer (Liquid Glassmorphism cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
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

      {/* Central Institutional Assurance Stamp Footer */}
      <footer className="border-t border-white/5 bg-[#04050a] py-8 text-center text-[10px] text-[#6c7293] relative z-10 font-mono">
        <div>CORE_ENGINE_STATUS: <span className="text-[#10b981] font-bold">ENFORCED</span> // REGISTRY_NODE_ID: sha256:b49d424a21e428ba...</div>
        <div className="mt-2 text-slate-500">🛡️ Certified & Logged by the AnimusLab Open-Source Infrastructure Council</div>
      </footer>
    </div>
  );
}
