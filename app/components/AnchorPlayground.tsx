'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Preset {
  name: string;
  description: string;
  policy: string;
  code: string;
}

const PLAYGROUND_PRESETS: Preset[] = [
  {
    name: '1. Knight Capital PowerPeg',
    description: 'Accidental reactivation of a legacy deprecated component (PowerPeg) leading to authority overreach.',
    policy: `[META]
policy_id = "POL-FIN-001"
version = "3.2.0"

[POLICIES]
rule_id = "RULE-COMPONENT-002"
name = "Legacy Blocklist"
severity = "BLOCKER"
blocked_modules = ["PowerPeg", "LegacyRouterV1"]
allow = false
mitigation = "halting_with_therapy"`,
    code: `// Trading Router Initialization
import { MarketMakerV3 } from './routing/market_maker';
import { PowerPeg } from './legacy/power_peg'; // Deprecated 2012 module

function routeOrder(order: any) {
  if (order.isPegged) {
    // Maldeployed trigger executing legacy code
    PowerPeg.execute(order);
  } else {
    MarketMakerV3.execute(order);
  }
}`
  },
  {
    name: '2. Air Canada Refund Drift',
    description: 'Enforcing semantic invariants against customer support chatbot outputs to prevent policy drift.',
    policy: `[META]
policy_id = "POL-SUPPORT-002"
version = "1.1.0"

[POLICIES]
rule_id = "RULE-BEREAVEMENT-001"
name = "Bereavement Policy Check"
severity = "BLOCKER"
target = "claims.refund"
action = "enforce"
allow_retroactive = false
mitigation = "coerce_to_fallback"`,
    code: `// Support Chatbot Query Processor
async function processQuery(query: string) {
  // Chatbot output asserts refund post-travel (retroactive)
  const claim = {
    type: "bereavement_rate",
    action: "claims.refund",
    allow_retroactive: true // DRIFT: policy forbids retroactive refund
  };
  
  return claim;
}`
  },
  {
    name: '3. Cryptographic Audit Trace',
    description: 'Verifying transaction state integrity using cryptographic hashes and edge node signatures.',
    policy: `[META]
policy_id = "POL-AUDIT-003"
version = "2.2.0"

[POLICIES]
rule_id = "RULE-LEDGER-VERIFICATION"
name = "Chain Integrity Check"
severity = "BLOCKER"
target = "ledger.block"
action = "verify_signature"
require_immutable = true
mitigation = "Verify block signature using compliance keyring"`,
    code: `// Transaction Ledger Reconstruction
const ledger = {
  block_id: 108432,
  tx_ref: "TX-893041",
  previous_hash: "a4f8b2c9d0e1f3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  signature: "INVALID_MUTATED_SIGNATURE" // TAMPERING DETECTED
};`
  },
  {
    name: '4. TSB Configuration Drift',
    description: 'Verifying staging logs and production datacenter config topologies at deployment time.',
    policy: `[META]
policy_id = "POL-DEPLOY-004"
version = "5.0.5"

[POLICIES]
rule_id = "RULE-DC-VERIFICATION-001"
name = "Data Center Topology Verify"
severity = "BLOCKER"
target = "deployment.manifest"
action = "verify_staging"
required_nodes_match = true
mitigation = "Run tests on untested staging nodes before release"`,
    code: `# Deployment manifest for active-active routing
deployment:
  datacenter_nodes: 2
  nodes:
    - name: Node A
      staging_tested: true
    - name: Node B
      staging_tested: false # DRIFT: Untested production target`
  },
  {
    name: '5. Citibank Payment Limits',
    description: 'Enforcing schedule-based amount-range checking for high-value financial transfers.',
    policy: `[META]
policy_id = "POL-FIN-005"
version = "1.0.2"

[POLICIES]
rule_id = "RULE-PAYMENT-LIMIT"
name = "Outbound Wire Range Check"
severity = "BLOCKER"
target = "payments"
action = "check_range"
max_tolerance_pct = 5.0
mitigation = "Override wire transfer amount using CEO/CRO signatures"`,
    code: `{
  "recipient": "Revlon Creditors",
  "obligation_type": "interest",
  "expected_amount_usd": 7800000.00,
  "amount_usd": 893000000.00,
  "funding_source": "Citi Account"
}`
  }
];

interface Violation {
  id: string;
  name: string;
  severity: 'BLOCKER' | 'ERROR' | 'WARNING';
  line: number;
  message: string;
  mitigation: string;
  codeSnippet: string;
}

export default function AnchorPlayground({ defaultPresetIndex = 0 }: { defaultPresetIndex?: number }) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(defaultPresetIndex);
  const [policyText, setPolicyText] = useState<string>('');
  const [codeText, setCodeText] = useState<string>('');
  
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Sync prop defaultPresetIndex to selectedPresetIdx state
  useEffect(() => {
    setSelectedPresetIdx(defaultPresetIndex);
  }, [defaultPresetIndex]);

  // Load preset on mount or index change
  useEffect(() => {
    const preset = PLAYGROUND_PRESETS[selectedPresetIdx];
    if (preset) {
      setPolicyText(preset.policy);
      setCodeText(preset.code);
      setViolations([]);
      setConsoleLogs([]);
      setHasRun(false);
    }
  }, [selectedPresetIdx]);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Real-time compliance engine - calls live /api/v1/anchor/eval endpoint
  const runEvaluation = async () => {
    setIsEvaluating(true);
    setConsoleLogs([]);
    setHasRun(true);

    const timestamp = () => `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}]`;
    setConsoleLogs([
      `${timestamp()} [ANCHOR-AUDIT v6.0.1] Transmitting AST payload to live PyO3 kernel endpoint...`,
    ]);

    try {
      const response = await fetch('/api/v1/anchor/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy: policyText,
          code: codeText,
          presetIndex: selectedPresetIdx,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Evaluation server error');
      }

      setViolations(result.violations || []);
      setConsoleLogs(result.logs || []);
    } catch (err: any) {
      setConsoleLogs((prev) => [
        ...prev,
        `${timestamp()} [ERROR] Live kernel evaluation failed: ${err.message}`,
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="border border-neutral-900 bg-[#070708]/80 backdrop-blur-md p-6 rounded-lg my-8 font-sans space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <h4 className="text-white text-base font-bold font-mono tracking-tight uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
            Anchor Compliance Playground
          </h4>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-2xl font-light">
            Edit the policy configuration and code execution payload in real-time. The compliance engine parses AST imports and patterns to enforce rules and halts violations dynamically.
          </p>
        </div>
        
        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {PLAYGROUND_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPresetIdx(idx)}
              className={`px-3 py-1.5 border text-[10px] font-mono transition-all duration-200 uppercase rounded-sm ${
                selectedPresetIdx === idx
                  ? 'border-indigo-500/80 bg-indigo-950/35 text-indigo-300 font-bold'
                  : 'border-neutral-900 bg-neutral-950 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800'
              }`}
            >
              {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-neutral-400 font-mono italic bg-neutral-950/40 p-3 rounded border border-neutral-900/60 leading-relaxed font-light">
        <strong>Preset Context:</strong> {PLAYGROUND_PRESETS[selectedPresetIdx].description}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Editor */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">// Policy Config (constitution.anchor)</span>
            <span className="text-[9px] text-indigo-400/70 font-mono">// Edit values below</span>
          </div>
          <div className="relative border border-neutral-900 bg-neutral-950/90 rounded p-1">
            <textarea
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              className="w-full h-64 bg-transparent text-indigo-300/90 font-mono text-[11px] p-3 focus:outline-none resize-none no-scrollbar leading-relaxed"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">// Execution Trace (action_payload.ts)</span>
            <span className="text-[9px] text-amber-500/70 font-mono">// Introduce violations here</span>
          </div>
          <div className="relative border border-neutral-900 bg-neutral-950/90 rounded p-1">
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              className="w-full h-64 bg-transparent text-neutral-300 font-mono text-[11px] p-3 focus:outline-none resize-none no-scrollbar leading-relaxed"
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
        <button
          onClick={runEvaluation}
          disabled={isEvaluating}
          className={`px-6 py-3 border text-xs font-mono font-bold tracking-wider rounded-sm transition-all duration-300 flex items-center gap-3 ${
            isEvaluating
              ? 'border-neutral-850 bg-neutral-900 text-neutral-600 cursor-not-allowed'
              : 'border-indigo-500/40 bg-indigo-950/15 text-indigo-400 hover:bg-indigo-950/40 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-950/20 active:scale-[0.98]'
          }`}
        >
          {isEvaluating ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              EVALUATING IN PROGRESS...
            </>
          ) : (
            'Execute Verification Gate'
          )}
        </button>
        
        {hasRun && !isEvaluating && (
          <span className={`text-[10px] font-mono px-3 py-1 border rounded-sm ${
            violations.length === 0 
              ? 'border-emerald-900 text-emerald-400 bg-emerald-950/10'
              : 'border-rose-900 text-rose-400 bg-rose-950/10'
          }`}>
            Status: {violations.length === 0 ? 'GATE ALLOWED' : 'GATE BLOCKED'}
          </span>
        )}
      </div>

      {/* Console output */}
      {hasRun && (
        <div className="space-y-3 font-mono animate-fadeIn">
          <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">// Simulated Anchor CLI stdout</span>
          <div className="bg-[#040405] border border-neutral-900 rounded p-4 h-44 overflow-y-auto no-scrollbar font-mono text-[10px] text-neutral-300 leading-normal space-y-1.5 shadow-inner">
            {consoleLogs.map((log, index) => {
              let color = 'text-neutral-400';
              if (log.includes('[VIOLATION]')) color = 'text-rose-400 font-semibold';
              else if (log.includes('[HALT]')) color = 'text-red-500 font-bold';
              else if (log.includes('[SYS] Verification clean') || log.includes('0 violations')) color = 'text-emerald-400 font-semibold';
              else if (log.includes('[ANCHOR]')) color = 'text-indigo-400';
              return (
                <div key={index} className={color}>
                  {log}
                </div>
              );
            })}
            {isEvaluating && (
              <div className="text-neutral-600 animate-pulse">Running checks...</div>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}

      {/* Violations report */}
      {hasRun && !isEvaluating && violations.length > 0 && (
        <div className="border border-rose-950/40 bg-rose-950/5 p-5 rounded space-y-4 animate-fadeIn font-mono">
          <div className="flex items-center gap-2 border-b border-rose-950/30 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Compliance Report // Blocked Invariants Found</span>
          </div>

          <div className="space-y-4">
            {violations.map((v, idx) => (
              <div key={idx} className="border-l-2 border-rose-600 pl-4 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-white font-bold bg-rose-950/30 px-2 py-0.5 border border-rose-900/40 rounded-sm">
                    {v.id}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">
                    {v.name}
                  </span>
                  <span className="text-[9px] text-rose-400 border border-rose-900 px-1.5 py-0.2 rounded-sm bg-rose-950/20">
                    LINE {v.line}
                  </span>
                </div>
                
                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {v.message}
                </p>
                
                {v.codeSnippet && (
                  <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-[10.5px] text-neutral-500 font-mono italic">
                    Snippet: &quot;{v.codeSnippet}&quot;
                  </div>
                )}
                
                <div className="text-[10.5px] text-indigo-300 leading-relaxed font-light">
                  <strong className="text-indigo-400 uppercase tracking-wider text-[9px] block mb-0.5">// Recommended Mitigation</strong>
                  {v.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
