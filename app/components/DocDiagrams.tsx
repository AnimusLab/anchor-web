'use client';

import React from 'react';

// ── 1. ARCHITECTURE DIAGRAM ───────────────────────────────────────────
export function ArchitectureDiagram() {
  return (
    <div className="border border-neutral-900 bg-[#070707]/30 rounded-lg p-6 my-8 font-sans">
      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-4">// Figure 1.0 - Decoupled Core &amp; Mesh Topology</p>
      
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch lg:min-w-[850px]">
        {/* Package Column */}
        <div className="border border-neutral-900 bg-[#0a0a0a]/50 p-6 rounded-md space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
            <h5 className="text-white font-mono text-xs font-bold uppercase">anchor (PyPI Engine)</h5>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Layer 1: Static Compliance Engine</p>
              <p className="text-[11px] text-neutral-400 mt-1">Parses Abstract Syntax Trees (AST) using Tree-sitter before compilation.</p>
            </div>
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Layer 2: Runtime Interceptor</p>
              <p className="text-[11px] text-neutral-400 mt-1">Hooks live AI inference calls, output patterns, and network syscalls.</p>
            </div>
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Layer 3: Diamond Cage WASM Sandbox</p>
              <p className="text-[11px] text-neutral-400 mt-1">Runs generated agent code inside isolated WasmEdge containers.</p>
            </div>
          </div>
        </div>

        {/* Mesh Column */}
        <div className="border border-neutral-900 bg-[#0a0a0a]/50 p-6 rounded-md space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <h5 className="text-white font-mono text-xs font-bold uppercase">anchor-web (Sovereign Mesh)</h5>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Spoke Node (Local Perimeter)</p>
              <p className="text-[11px] text-neutral-400 mt-1">Stores full telemetry payloads on-premise in encrypted SQLite databases.</p>
            </div>
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Hub Node (Sovereign Cloud)</p>
              <p className="text-[11px] text-neutral-400 mt-1">Maintains the central ledger, receiving metadata-only hashes via WebSockets.</p>
            </div>
            <div className="p-3 border border-neutral-900 bg-[#0f1012] rounded">
              <p className="text-white text-xs font-semibold font-mono">Frontend Portals (React)</p>
              <p className="text-[11px] text-neutral-400 mt-1">Dedicated interfaces for Enterprise Dashboards and Regulatory Oversight.</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Relational Flow Summary */}
      <div className="mt-6 p-4 border border-neutral-900 bg-[#080809] rounded-md text-xs text-neutral-400 font-mono leading-relaxed space-y-1">
        <p><span className="text-indigo-400">Layer 1 &amp; 2</span> ──► Scan AST and intercepts runtime inputs/outputs against the Constitution.</p>
        <p><span className="text-indigo-400">Layer 2 Interceptor</span> ──► Writes HMAC-signed logs to <span className="text-emerald-400">Spoke Node</span>.</p>
        <p><span className="text-emerald-400">Spoke Node</span> ──► Pushes lightweight hashes (200-byte metadata) to <span className="text-emerald-400">Hub Node</span> via WebSocket.</p>
      </div>
    </div>
  );
}

// ── 2. SOVEREIGN RELAY DIAGRAM ─────────────────────────────────────────
export function SovereignRelayDiagram() {
  const steps = [
    {
      title: "1. Local Ingest & Encryption",
      actor: "Anchor SDK ──► Spoke Node",
      desc: "The SDK intercepts inference and writes full payloads locally into SQLite (anchor.db) within the enterprise perimeter."
    },
    {
      title: "2. WebSocket Metadata Sync",
      actor: "Spoke Node ──► Hub Node (Cloud)",
      desc: "Spoke pushes a 200-byte AUDIT_HEADER (chain_hash, compliance status) over secure WebSocket. No raw code or logs cross the boundary."
    },
    {
      title: "3. Forensic Pull Request",
      actor: "Auditor ──► Hub Node ──► Spoke Node",
      desc: "Under regulatory review, an authorized auditor requests details. The Hub sends an encrypted request to the Spoke."
    },
    {
      title: "4. Encrypted Response",
      actor: "Spoke Node ──► Hub Node ──► Auditor",
      desc: "The Spoke decrypts local SQLite record, encrypts it with AES-256-GCM, and relays it to the auditor portal."
    }
  ];

  return (
    <div className="border border-neutral-900 bg-[#070707]/30 rounded-lg p-6 my-8 font-sans">
      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-4">// Figure 2.0 - Sovereign Relay Telemetry Flow</p>
      
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start border border-neutral-900/50 bg-[#09090a]/50 p-4 rounded">
            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center font-mono text-xs text-indigo-400 font-bold">
              {idx + 1}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-white text-xs font-bold font-mono">{step.title}</span>
                <span className="text-[10px] text-neutral-500 font-mono uppercase">({step.actor})</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. DIAMOND CAGE DIAGRAM ────────────────────────────────────────────
export function DiamondCageDiagram() {
  return (
    <div className="border border-neutral-900 bg-[#070707]/30 rounded-lg p-6 my-8 font-sans">
      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-4">// Figure 3.0 - Diamond Cage Sandbox & Verification Flow</p>
      
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:min-w-[800px]">
        {/* Sandbox Column */}
        <div className="border border-neutral-900 bg-[#0a0a0b]/60 p-5 rounded-md space-y-3">
          <h6 className="text-white font-mono text-xs font-bold uppercase border-b border-neutral-900 pb-2 text-indigo-400">// Sandbox limits</h6>
          <ul className="space-y-2 text-[11px] text-neutral-400 font-mono leading-relaxed">
            <li>• <strong className="text-white">Filesystem:</strong> Virtual mount (/app)</li>
            <li>• <strong className="text-white">Network:</strong> Blocked socket outputs</li>
            <li>• <strong className="text-white">Environment:</strong> Stripped env tokens</li>
            <li>• <strong className="text-white">Gas:</strong> Strict instruction limits</li>
          </ul>
        </div>

        {/* Verification Column */}
        <div className="border border-neutral-900 bg-[#0a0a0b]/60 p-5 rounded-md space-y-3">
          <h6 className="text-white font-mono text-xs font-bold uppercase border-b border-neutral-900 pb-2 text-indigo-400">// Differential verify</h6>
          <ul className="space-y-2 text-[11px] text-neutral-400 font-mono leading-relaxed">
            <li>• Runs original script (Snapshot A)</li>
            <li>• Runs patched script (Snapshot B)</li>
            <li>• Compares: stdout, stderr diff, exit code, and execution time</li>
          </ul>
        </div>

        {/* Verdicts Column */}
        <div className="border border-neutral-900 bg-[#0a0a0b]/60 p-5 rounded-md space-y-3">
          <h6 className="text-white font-mono text-xs font-bold uppercase border-b border-neutral-900 pb-2 text-indigo-400">// Verdicts</h6>
          <div className="space-y-2 font-mono text-[9px]">
            <div className="border border-emerald-950 bg-emerald-950/20 text-emerald-400 p-1.5 rounded uppercase font-bold text-center">
              PROVED_SAFE
            </div>
            <div className="border border-amber-950 bg-amber-950/20 text-amber-400 p-1.5 rounded uppercase font-bold text-center">
              BEHAVIOR_CHANGED
            </div>
            <div className="border border-rose-950 bg-rose-950/20 text-rose-400 p-1.5 rounded uppercase font-bold text-center">
              MALICIOUS_HALLUCINATION
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. DECISION AUDIT CHAIN DIAGRAM ────────────────────────────────────
export function DecisionAuditChainDiagram() {
  return (
    <div className="border border-neutral-900 bg-[#070707]/30 rounded-lg p-6 my-8 font-sans">
      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-4">// Figure 4.0 - Cryptographic Hash Chaining Mechanism</p>
      
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs md:min-w-[850px]">
        {/* Block n-1 */}
        <div className="border border-neutral-800 bg-[#09090a] p-4 rounded-md w-full md:w-64 space-y-2">
          <p className="text-[10px] text-neutral-500">// AuditEntry (n-1)</p>
          <div className="font-mono text-[11px] space-y-1 text-neutral-400">
            <p>ID: <span className="text-white">ae-0982</span></p>
            <p className="truncate">Hash: <span className="text-indigo-400">0x8f2c...31a</span></p>
          </div>
        </div>

        {/* SHA-256 Link */}
        <div className="flex flex-col items-center">
          <span className="text-neutral-600 text-xs">SHA-256</span>
          <span className="text-indigo-500 text-lg">──►</span>
        </div>

        {/* Block n */}
        <div className="border border-indigo-900 bg-[#0a0b10]/80 p-4 rounded-md w-full md:w-72 space-y-2 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <p className="text-[10px] text-indigo-400">// AuditEntry (n)</p>
          <div className="font-mono text-[11px] space-y-1 text-neutral-300">
            <p>ID: <span className="text-white">ae-0983</span></p>
            <p className="truncate">Prev Hash: <span className="text-indigo-400">0x8f2c...31a</span></p>
            <p className="truncate">Findings Hash: <span className="text-emerald-400">e(n).findings_hash</span></p>
            <p className="truncate border-t border-neutral-800 pt-1.5 mt-1">Chain Hash: <span className="text-white font-bold">0x7a3d...f92</span></p>
          </div>
        </div>

        {/* Sync */}
        <div className="flex flex-col items-center">
          <span className="text-neutral-600 text-xs">Sync</span>
          <span className="text-emerald-500 text-lg">──►</span>
        </div>

        {/* Hub Ledger */}
        <div className="border border-neutral-800 bg-[#09090a] p-4 rounded-md w-full md:w-56 space-y-2">
          <p className="text-[10px] text-emerald-400">// Hub Ledger (Metadata)</p>
          <div className="font-mono text-[10px] space-y-1 text-neutral-500">
            <p>Relayed: <span className="text-neutral-300">Hash Only</span></p>
            <p>Signature: <span className="text-neutral-300">HMAC-SHA256</span></p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
