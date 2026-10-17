'use client';

import React, { useState } from 'react';

interface TopicDetail {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  whatLabBuilt: string;
  architecture: string;
  codeSnippet: string;
  keyInvariants: string[];
}

const TOPIC_DETAILS: Record<string, TopicDetail> = {
  "runtime-governance": {
    id: "runtime-governance",
    title: "Runtime Governance",
    subtitle: "AST-level execution interception with zero-copy PyO3 bindings.",
    badge: "CORE ENGINE // RUNTIME",
    summary: "Runtime governance intercepts model tool invocations and function calls before they hit system execution boundaries. Unlike soft system prompt safety checks, Anchor operates as a binary interceptor executing in the process thread.",
    whatLabBuilt: "AnimusLab engineered the @anchor.guard decorator and PyO3 C-extension bridge, enforcing <0.8ms inspection latency over Python and Rust tool calls.",
    architecture: "System Memory → AST Interceptor → Policy Evaluator → Execution Gate → Decision Audit Chain",
    codeSnippet: `@anchor.guard(policy="POL-FIN-001")\ndef execute_wire_transfer(amount: float, recipient: str):\n    # Intercepted before execution\n    return bank_api.transfer(amount, recipient)`,
    keyInvariants: [
      "Zero-Copy Stream Interception: Pointers are inspected in memory without data copying.",
      "Deterministic Fail-Closed: If evaluation fails or times out, execution is denied immediately.",
      "Thread Safety: Thread-local storage guarantees parallel safety across multi-tenant workers."
    ]
  },
  "constitutional-enforcement": {
    id: "constitutional-enforcement",
    title: "Constitutional Enforcement",
    subtitle: "Binding 18-Article formal invariant check across all active runtimes.",
    badge: "BINDING LAW // COMPILER",
    summary: "Constitutional enforcement translates natural language institutional law (The AnimusLab Constitution, 18 Articles) into compiled .anchor AST matcher rules. It guarantees system code satisfies statutory constraints at all times.",
    whatLabBuilt: "AnimusLab authored 20+ production-grade .anchor governance files mapping EU AI Act (Articles 5, 12, 14, 19, 50, 99), SEC SCI/15c3, OWASP LLM Top 10, and NIST AI RMF.",
    architecture: "Legislative Text → .anchor DSL → Tree-sitter AST Parser → Invariant Matcher → Sandbox Violation Stream",
    codeSnippet: `[POLICIES]\nrule_id = "EU-AI-ACT-ART-12"\ntarget = "telemetry.log_retention"\naction = "enforce"\nretention_days = 180\nmitigation = "hard_block"`,
    keyInvariants: [
      "Article XIII Supremacy: Policy rules override all model instructions and user prompts.",
      "Statutory Mapping: Natural language law maps 1-to-1 with deterministic AST queries.",
      "Continuous Compliance: Code drift is flagged continuously via CLI check and CI/CD gates."
    ]
  },
  "capability-isolation": {
    id: "capability-isolation",
    title: "Capability Isolation",
    subtitle: "Diamond Cage WebAssembly (WASM) execution rings & memory sandboxing.",
    badge: "SECURITY // SANDBOX",
    summary: "Capability isolation prevents autonomous agents from escalating privileges, executing arbitrary shell commands, or accessing unauthorized file descriptors. All untrusted execution is trapped inside isolated WebAssembly execution rings.",
    whatLabBuilt: "AnimusLab built the Diamond Cage WASM sandbox kernel, providing strict memory virtual memory bounds and syscall whitelisting for agent execution environments.",
    architecture: "Agent Action → Ring 3 (Untrusted Model) → Diamond Cage WASM Boundary → Ring 0 (Host OS Verification)",
    codeSnippet: `// Diamond Cage WASM Capability Constraint\n[CAPABILITIES]\nallow_net_connect = false\nallow_file_write = ["/tmp/sandbox/*"]\nmax_memory_mb = 64`,
    keyInvariants: [
      "Article XIV Isolation: Capability rings operate with zero shared mutable state.",
      "Syscall Whitelisting: POSIX calls (exec, fork, socket) are trapped and verified.",
      "Resource Limits: Memory and CPU execution ticks are strictly capped."
    ]
  },
  "audit-infrastructure": {
    id: "audit-infrastructure",
    title: "Audit Infrastructure",
    subtitle: "Ed25519-signed Decision Audit Chains (DAC) & Zero-Knowledge Replay.",
    badge: "CRYPTOGRAPHY // VERIFICATION",
    summary: "Audit infrastructure produces immutable forensic proof of every action, decision state, and policy verification. The output stream forms a cryptographically linked append-only ledger suitable for regulatory submission.",
    whatLabBuilt: "AnimusLab developed the Decision Audit Chain (DAC) block specification and built oversight.animuslab.dev for gated, zero-knowledge mission replay with sanitized payload views.",
    architecture: "Event Trigger → SHA-256 Payload Hashing → Ed25519 HSM Sign → Block Append → ZK Sanitization",
    codeSnippet: `{\n  "block_id": "DAC-893041",\n  "prev_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n  "verdict": "DENIED",\n  "rule_violated": "POL-FIN-005",\n  "signature": "ed25519:7f8a91..."\n}`,
    keyInvariants: [
      "Article VII Truth Over Optics: Audit trails provide full forensic transparency.",
      "Zero-Knowledge Veil: Internal file paths and proprietary IP are sanitized before external auditor review.",
      "Tamper Evidence: Any block modification breaks the cryptographic SHA-256 hash chain."
    ]
  },
  "policy-execution": {
    id: "policy-execution",
    title: "Policy Execution",
    subtitle: "Context-aware DSL evaluation engine with real-time output coercion.",
    badge: "COMPILER // INTERCEPTION",
    summary: "Policy execution evaluates model assertions against active domain manifests. If a model output drifts from official policy (as seen in the Air Canada chatbot court ruling), Anchor rewrites or coercively blocks the response before client delivery.",
    whatLabBuilt: "AnimusLab built the semantic coercion engine, preventing LLM hallucinations and legal liability by ensuring claims match official policy contracts in real-time.",
    architecture: "Model Output → Assertion Parser → Contract Matcher → [PASS: Emit | FAIL: Coerce/Fallback]",
    codeSnippet: `@anchor.intercept(policy="POL-SUPPORT-002")\ndef generate_support_reply(query):\n    # Output assertion matched against refund policy\n    return model.generate(query)`,
    keyInvariants: [
      "Article VIII Semantics Before Representation: Policy contracts govern meaning, not just syntax.",
      "Fallback Coercion: Violations revert to pre-approved legal templates.",
      "Zero Context Pollution: Interception runs without polluting the underlying model's context window."
    ]
  },
  "deterministic-control": {
    id: "deterministic-control",
    title: "Deterministic Control",
    subtitle: "Hard fail-closed state machines guaranteeing non-probabilistic safety.",
    badge: "SAFETY // GUARANTEES",
    summary: "Deterministic control eliminates reliance on soft system prompts or confidence scores. System safety is enforced through mathematical state machine invariants that cannot be bypassed by prompt injection or model fine-tuning.",
    whatLabBuilt: "AnimusLab built the deterministic execution kernel powering anchor-audit v6.0.1, guaranteeing that safety rules remain binary, enforceable, and verifiable.",
    architecture: "State Transition → Invariant Matrix → Deterministic Evaluator → Binary Decision [0: DENY, 1: ALLOW]",
    codeSnippet: `// Hard Invariant Evaluator\nfn evaluate_state(state: &State) -> Verdict {\n    if state.risk_score > THRESHOLD || !state.key_valid {\n        Verdict::Deny\n    } else {\n        Verdict::Allow\n    }\n}`,
    keyInvariants: [
      "Article IX Constraints Create Clarity: Hard boundaries increase system reliability.",
      "Prompt Injection Immunity: Interceptors execute outside the LLM context layer.",
      "Provable Guarantees: State transitions are mathematically proven prior to release."
    ]
  }
};

export default function AnchorManifestoPage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicDetail | null>(null);

  return (
    <div className="space-y-24 animate-fadeIn">
      {/* HERO */}
      <section className="pb-16 border-b border-neutral-900">
        <p className="institution-label mb-6">
          Anchor Manifesto
        </p>

        <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight max-w-4xl">
          Capability without governance is not progress.
        </h1>

        <p className="mt-8 text-lg text-neutral-400 max-w-3xl leading-relaxed">
          Anchor is founded on a simple premise: increasingly capable systems require increasingly reliable mechanisms of governance.
        </p>
      </section>

      {/* SECTION 1 */}
      <section className="pb-16 border-b border-neutral-900">
        <h2 className="text-2xl font-semibold text-white mb-8">
          The Current Assumption
        </h2>

        <div className="space-y-6 text-base md:text-lg text-neutral-400 leading-relaxed max-w-3xl">
          <p>Much of modern AI safety relies on probabilistic compliance.</p>
          <p>Systems are trained to behave.</p>
          <p>Systems are encouraged to follow rules.</p>
          <p>Systems are evaluated against benchmarks.</p>
          <p>Yet the underlying assumption remains: the system chooses to comply.</p>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="pb-16 border-b border-neutral-900">
        <h2 className="text-2xl font-semibold text-white mb-8">
          The Problem
        </h2>

        <div className="space-y-6 text-base md:text-lg text-neutral-400 leading-relaxed max-w-3xl">
          <p>Institutions do not operate on trust alone.</p>
          <p>Financial systems use controls.</p>
          <p>Operating systems use permissions.</p>
          <p>Aviation relies on procedures, verification, and containment.</p>
          <p>Yet many intelligent systems are expected to remain safe through instruction and behavioral optimization alone.</p>
          <p className="text-white font-medium">Anchor questions whether that approach can scale.</p>
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="pb-16 border-b border-neutral-900">
        <h2 className="text-2xl font-semibold text-white mb-8">
          The Anchor Thesis
        </h2>

        <div className="space-y-6 text-base md:text-lg text-neutral-400 leading-relaxed max-w-3xl">
          <p>Governance should not depend entirely on model behavior.</p>
          <p>Governance should exist as an independent layer.</p>
          <p>Constraints should be enforced.</p>
          <p>Capabilities should be isolated.</p>
          <p>Actions should be auditable.</p>
          <p>Policies should remain active during execution.</p>
        </div>
      </section>

      {/* SECTION 4 - INTERACTIVE TOPIC CARDS */}
      <section className="pb-16 border-b border-neutral-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-mono font-bold block mb-2">// Interactive Knowledge Pillars</span>
            <h2 className="text-2xl font-semibold text-white">
              What Anchor Explores
            </h2>
          </div>
          <p className="text-xs text-neutral-500 font-mono">
            Click any pillar card to view architectural specifications &amp; code implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {Object.values(TOPIC_DETAILS).map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="border border-neutral-900 p-8 bg-[#070707]/30 font-mono text-sm text-neutral-300 hover:border-indigo-500/60 hover:bg-neutral-950/60 transition-all text-left group flex flex-col justify-between space-y-4 rounded-sm relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold tracking-wider">{topic.badge}</span>
                  <span className="text-[10px] text-neutral-600 group-hover:text-indigo-400 transition-colors">Click to inspect →</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{topic.title}</h3>
                <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed">{topic.subtitle}</p>
              </div>
              <div className="pt-2 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>View Architecture &amp; Code</span>
                <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* DETAIL MODAL DRAWER */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="bg-[#08090c] border border-neutral-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 space-y-8 rounded-md shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-6">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider block mb-2">// {selectedTopic.badge}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedTopic.title}</h2>
                <p className="text-neutral-400 text-sm font-mono mt-1">{selectedTopic.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-neutral-500 hover:text-white font-mono text-xs border border-neutral-800 px-3 py-1.5 rounded-sm hover:border-neutral-600 transition-colors"
              >
                Close ESC ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">// Overview &amp; Knowledge</h3>
                <p className="text-neutral-300 leading-relaxed font-sans">{selectedTopic.summary}</p>
              </div>

              <div className="space-y-2 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-sm">
                <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">// Implemented by AnimusLab</h3>
                <p className="text-neutral-300 text-xs font-sans leading-relaxed">{selectedTopic.whatLabBuilt}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold">// Data Flow &amp; Architecture</h3>
                <p className="text-xs font-mono text-indigo-300 bg-neutral-950 p-3 border border-neutral-850 rounded-sm overflow-x-auto">
                  {selectedTopic.architecture}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold">// Implementation Code Sample</h3>
                <pre className="text-xs font-mono text-neutral-200 bg-black p-4 border border-neutral-850 rounded-sm overflow-x-auto">
                  <code>{selectedTopic.codeSnippet}</code>
                </pre>
              </div>

              <div className="space-y-3 border-t border-neutral-800 pt-4">
                <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">// Binding Invariants</h3>
                <ul className="space-y-2 text-xs font-mono text-neutral-400">
                  {selectedTopic.keyInvariants.map((inv, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{inv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedTopic(null)}
                className="bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold px-6 py-2.5 rounded-sm transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL */}
      <section className="pb-16">
        <h2 className="text-3xl font-semibold text-white mb-8">
          Long-Term Vision
        </h2>

        <div className="space-y-6 text-base md:text-lg text-neutral-400 leading-relaxed max-w-3xl">
          <p>Anchor is not an attempt to build more capable systems.</p>
          <p>Anchor is an attempt to understand how capable systems can remain governable.</p>
          <p className="text-indigo-400 text-lg md:text-xl font-medium mt-6">
            The future of intelligence may depend as much on governance as capability.
          </p>
        </div>
      </section>
    </div>
  );
}
