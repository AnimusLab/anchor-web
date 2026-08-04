"use client";

import { useState } from "react";
import { FileCheck, Search, Filter, ShieldCheck, Lock, ExternalLink } from "lucide-react";

interface DacBlock {
  height: number;
  hash: string;
  prevHash: string;
  entity: string;
  agent: string;
  timestamp: string;
  status: "COMPLIANT" | "VIOLATION";
}

const MOCK_DAC_BLOCKS: DacBlock[] = [
  { height: 1482910, hash: "0x9a8f21b7c00e12ff8901", prevHash: "0x8b12c9910a22ff33aa90", entity: "JPMC-IN-MUM01", agent: "credit-decisioning-v4", timestamp: "2026-08-04 12:45:12 UTC", status: "COMPLIANT" },
  { height: 1482909, hash: "0x8b12c9910a22ff33aa90", prevHash: "0x77ee991200ab4411cc11", entity: "HDFC-IN-DEL02", agent: "kyc-biometrics-v1", timestamp: "2026-08-04 12:42:00 UTC", status: "COMPLIANT" },
  { height: 1482908, hash: "0x77ee991200ab4411cc11", prevHash: "0x55aa331100bb2244dd88", entity: "ICICI-IN-BLR01", agent: "wealth-advisor-v2", timestamp: "2026-08-04 12:38:10 UTC", status: "VIOLATION" }
];

export default function DacLedgerPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_DAC_BLOCKS.filter((b) =>
    b.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.hash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">IMMUTABLE CRYPTOGRAPHIC LEDGER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Decision Audit Chain</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Read-only immutable ledger of AI decision hashes across assigned jurisdiction entities.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">LEDGER HEIGHT: </span>
          <span className="text-amber-400 font-bold glass-badge px-3.5 py-1.5 inline-block">#1,482,910 Blocks</span>
        </div>
      </div>

      {/* Global Entity Search Filter */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Company Silo ID (e.g. JPMC-IN-MUM01), Agent, or Block Hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070b16]/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/50 font-mono transition"
          />
        </div>
      </div>

      {/* DAC Blocks Stream */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">BLOCK CHAIN STREAM</span>
          <span className="text-slate-400">{filtered.length} Blocks Matched</span>
        </div>

        <div className="p-5 space-y-4">
          {filtered.map((block) => (
            <div key={block.height} className="glass-card-inset p-5 space-y-3 font-mono text-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-amber-400 font-bold text-base">BLOCK #{block.height}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-100 font-semibold">{block.entity}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{block.agent}</span>
                </div>
                <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${block.status === 'COMPLIANT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {block.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">BLOCK HASH</span>
                  <span className="text-emerald-400 break-all font-bold">{block.hash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PREVIOUS BLOCK HASH</span>
                  <span className="text-slate-400 break-all">{block.prevHash}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">Timestamp: {block.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
