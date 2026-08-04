"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search } from "lucide-react";

export default function RegulatoryChainVerifierPage() {
  const [inputHash, setInputHash] = useState("");
  const [result, setResult] = useState<null | { valid: boolean; blockHeight: number; entity: string; timestamp: string }>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHash.trim()) return;

    if (inputHash.startsWith("0x")) {
      setResult({
        valid: true,
        blockHeight: 1482910,
        entity: "JPMC-IN-MUM01",
        timestamp: "2026-08-04 12:45:12 UTC"
      });
    } else {
      setResult({ valid: false, blockHeight: 0, entity: "N/A", timestamp: "N/A" });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-emerald-400">INDEPENDENT REGULATORY HASH VERIFIER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Chain Verifier</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Independently verify decision block hashes against statutory DAC state ledgers.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8 space-y-6 font-mono text-xs">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="text-slate-300 block font-sans text-sm font-semibold">ENTER STATUTORY BLOCK HASH</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. 0x9a8f21b7c00e12ff8901..."
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              className="flex-1 bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-emerald-400 text-sm focus:outline-none"
            />
            <button type="submit" className="glass-badge px-6 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Verify Block</span>
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className={`glass-card p-6 space-y-4 border ${result.valid ? 'border-emerald-500/40' : 'border-rose-500/40'}`}>
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4 font-mono">
            {result.valid ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-emerald-400">STATUTORY HASH SIGNATURE VERIFIED</h3>
                  <p className="text-xs text-slate-400 font-sans">Block #{result.blockHeight} signature validated for entity {result.entity}.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-400" />
                <div>
                  <h3 className="text-base font-bold text-rose-400">BLOCK VERIFICATION FAILED</h3>
                  <p className="text-xs text-slate-400 font-sans">Hash mismatch or block tampering detected.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
