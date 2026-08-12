"use client";

import { useState } from "react";
import { Building2, Search } from "lucide-react";

interface HeatmapItem {
  entity: string;
  region: string;
  totalDecisions: number;
  violationsCount: number;
  riskScore: string;
  riskLevel: "LOW" | "ELEVATED" | "HIGH";
}

const EMPTY_HEATMAP: HeatmapItem[] = [];

export default function ViolationHeatmapPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = EMPTY_HEATMAP.filter((item) =>
    item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">JURISDICTION RISK DENSITY</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Violation Heatmap</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Cross-entity compliance risk assessment and systemic violation density map.</p>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter Regulated Entity Silo ID or Institution Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070b16]/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/50 font-mono transition"
          />
        </div>
      </div>

      {/* Heatmap Grid Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
            NO REGULATED ENTITY RISK DATA FOUND // HEATMAP INACTIVE
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div key={item.entity} className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-sky-400" />
                      <h3 className="text-lg font-bold text-slate-100 font-mono">{item.entity}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Region: {item.region}</span>
                  </div>
                  <span
                    className={`glass-badge px-3 py-1 font-bold text-[10px] ${
                      item.riskLevel === "LOW"
                        ? "text-emerald-400"
                        : item.riskLevel === "ELEVATED"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {item.riskLevel} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs glass-card-inset p-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL AI DECISIONS</span>
                    <span className="text-slate-100 font-bold text-sm">{item.totalDecisions.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">FLAGGED VIOLATIONS</span>
                    <span className={`font-bold text-sm ${item.violationsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.violationsCount} Breaches
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono pt-2">
                  <span className="text-slate-400">Compliance Index: <strong className="text-slate-100">{item.riskScore}</strong></span>
                  <button className="text-amber-400 hover:underline">Inspect Entity Audit Log →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

