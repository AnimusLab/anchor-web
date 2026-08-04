"use client";

import { useState } from "react";
import { Search, Filter, RefreshCw, Eye, CheckCircle2, AlertTriangle, ArrowUpDown, Clock } from "lucide-react";

interface DecisionLog {
  id: string;
  timestamp: string;
  project: string;
  agent: string;
  action: string;
  latencyMs: number;
  status: "COMPLIANT" | "VIOLATION" | "WARNING";
  hash: string;
}

const MOCK_DECISIONS: DecisionLog[] = [
  { id: "dec_9901a", timestamp: "2026-08-04 12:45:12 UTC", project: "payments-service", agent: "fraud-detector-v2", action: "Flag High Value Wire Transfer", latencyMs: 42, status: "COMPLIANT", hash: "0x8f2a9910b42c00a188f9" },
  { id: "dec_9902b", timestamp: "2026-08-04 12:44:50 UTC", project: "wealth-advisor-agent", agent: "portfolio-balancer", action: "Rebalance High Yield Portfolio", latencyMs: 118, status: "VIOLATION", hash: "0x4f12a8909101ff8214a6" },
  { id: "dec_9903c", timestamp: "2026-08-04 12:42:10 UTC", project: "credit-decisioning", agent: "underwriter-ai", action: "Approve SME Line of Credit", latencyMs: 65, status: "COMPLIANT", hash: "0x7a31b99210aa883f9901" },
  { id: "dec_9904d", timestamp: "2026-08-04 12:38:05 UTC", project: "kyc-verifier", agent: "document-parser", action: "Extract Passport Biometrics", latencyMs: 31, status: "WARNING", hash: "0x1b44c88310ff772e008b" },
  { id: "dec_9905e", timestamp: "2026-08-04 12:35:00 UTC", project: "payments-service", agent: "sanction-checker", action: "OFAC List Match Verification", latencyMs: 28, status: "COMPLIANT", hash: "0x9c55d00112aa4411ee32" }
];

export default function DecisionTelemetryPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedDec, setSelectedDec] = useState<DecisionLog | null>(null);

  const filtered = MOCK_DECISIONS.filter((d) => {
    const matchesSearch = d.id.toLowerCase().includes(search.toLowerCase()) || 
                          d.project.toLowerCase().includes(search.toLowerCase()) ||
                          d.agent.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">TELEMETRY INGESTION PIPELINE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Decision Telemetry</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Real-time inspection stream for AI decision payloads and hash chains.</p>
        </div>

        <button className="glass-badge px-4 py-2 text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-2 transition">
          <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span>Live Ingest Active</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Decision ID, Project, or Agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070b16]/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 transition font-mono"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {["ALL", "COMPLIANT", "VIOLATION", "WARNING"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                filterStatus === status
                  ? "bg-white/10 border-white/20 text-white font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Stream List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 text-xs font-mono text-slate-400">
          <span>PAYLOAD HASH LOG</span>
          <span>{filtered.length} Entries Filtered</span>
        </div>

        <div className="p-4 space-y-3">
          {filtered.map((dec) => (
            <div
              key={dec.id}
              onClick={() => setSelectedDec(dec)}
              className="glass-card-inset p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:border-white/20 transition font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sky-400 font-bold text-sm">{dec.id}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-200 font-semibold">{dec.project}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{dec.agent}</span>
                </div>
                <div className="text-slate-300 font-sans font-medium text-xs">{dec.action}</div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{dec.timestamp}</span>
                  </span>
                  <span>Latency: {dec.latencyMs}ms</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 font-bold text-[10px] glass-badge ${
                    dec.status === "COMPLIANT"
                      ? "text-emerald-400"
                      : dec.status === "VIOLATION"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {dec.status}
                </span>
                <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Detail Modal */}
      {selectedDec && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-6 space-y-5 border border-white/20">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="animus-label text-sky-400 mb-1">DECISION PAYLOAD INSPECTOR</div>
                <h3 className="text-xl font-bold text-slate-100 font-mono">{selectedDec.id}</h3>
              </div>
              <button
                onClick={() => setSelectedDec(null)}
                className="text-slate-400 hover:text-white text-xs font-mono glass-badge px-3 py-1"
              >
                Close [ESC]
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4 glass-card-inset p-4">
                <div>
                  <span className="text-slate-500 block">PROJECT SILO</span>
                  <span className="text-slate-200 font-bold">{selectedDec.project}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">AI AGENT</span>
                  <span className="text-slate-200 font-bold">{selectedDec.agent}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">EXECUTION LATENCY</span>
                  <span className="text-slate-200 font-bold">{selectedDec.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block">STATUS</span>
                  <span className={`font-bold ${selectedDec.status === 'COMPLIANT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedDec.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">CRYPTOGRAPHIC DAC HASH</span>
                <div className="p-3 bg-[#040711] border border-white/10 rounded-lg text-emerald-400 break-all select-all">
                  {selectedDec.hash}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
