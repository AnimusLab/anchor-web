"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search, ShieldCheck, Hash, FileCode } from "lucide-react";

export default function AuditChainVerifierPage() {
  const [inputHash, setInputHash] = useState("");
  const [result, setResult] = useState<null | {
    valid: boolean;
    decisionId: string;
    project: string;
    timestamp: string;
    blockNumber: number;
    merkleRoot: string;
  }>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHash.trim()) return;

    // Simulate verification
    if (inputHash.startsWith("0x")) {
      setResult({
        valid: true,
        decisionId: "dec_9901a",
        project: "payments-service",
        timestamp: "2026-08-04 12:45:12 UTC",
        blockNumber: 1482910,
        merkleRoot: "0x3f11a88b901ff2a00188c991a02b"
      });
    } else {
      setResult({
        valid: false,
        decisionId: "N/A",
        project: "N/A",
        timestamp: "N/A",
        blockNumber: 0,
        merkleRoot: "N/A"
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-emerald-400">CRYPTOGRAPHIC PROOF VERIFIER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Audit Chain Verifier</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Independently validate SHA-256 decision hashes against the immutable DAC ledger.</p>
        </div>
      </div>

      {/* Verifier Form Card */}
      <div className="glass-card p-8 space-y-6">
        <form onSubmit={handleVerify} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-2 font-sans text-sm font-semibold">
              ENTER DECISION CHAIN HASH OR MERKLE PROOF
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. 0x8f2a9910b42c00a188f9..."
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                className="flex-1 bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-emerald-400 text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                className="glass-badge px-6 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Verify Proof</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className={`glass-card p-6 space-y-4 border ${result.valid ? 'border-emerald-500/40' : 'border-rose-500/40'}`}>
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4 font-mono">
            {result.valid ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-emerald-400">HASH VERIFICATION SUCCESSFUL</h3>
                  <p className="text-xs text-slate-400 font-sans">Tamper-proof signature verified against on-premise DAC ledger.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-400" />
                <div>
                  <h3 className="text-base font-bold text-rose-400">HASH VERIFICATION FAILED</h3>
                  <p className="text-xs text-slate-400 font-sans">No matching block hash found in DAC ledger or signature tampered.</p>
                </div>
              </>
            )}
          </div>

          {result.valid && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs glass-card-inset p-4">
              <div>
                <span className="text-slate-500 block text-[10px]">DECISION ID</span>
                <span className="text-slate-100 font-bold">{result.decisionId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PROJECT SILO</span>
                <span className="text-slate-100 font-bold">{result.project}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BLOCK HEIGHT</span>
                <span className="text-slate-100 font-bold">#{result.blockNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">INGEST TIMESTAMP</span>
                <span className="text-slate-100 font-bold">{result.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
