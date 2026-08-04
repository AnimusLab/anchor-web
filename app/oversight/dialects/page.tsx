"use client";

import { FileCheck, Download, Sparkles } from "lucide-react";

export default function DialectGeneratorPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">STATUTORY COMPLIANCE COMPILER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dialect Generator</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Compile raw decision telemetry into certified statutory filing dialects (RBI, EU AI Act, ISO 42001).</p>
        </div>
      </div>

      {/* Generator Form Card */}
      <div className="glass-card p-8 space-y-6 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-slate-400 block mb-2 font-sans font-bold text-xs">TARGET JURISDICTION DIALECT</label>
            <select className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none">
              <option>RBI_IN_2025 (Reserve Bank of India)</option>
              <option>EU_AI_ACT_2024 (European Union)</option>
              <option>ISO_42001 (International AI Standards)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-2 font-sans font-bold text-xs">REGULATED ENTITY SILO</label>
            <select className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none">
              <option>JPMC-IN-MUM01</option>
              <option>HDFC-IN-DEL02</option>
              <option>ICICI-IN-BLR01</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-2 font-sans font-bold text-xs">AUDIT TIMELINE WINDOW</label>
            <input
              type="text"
              defaultValue="2026-06-01 to 2026-08-04"
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="glass-badge px-6 py-3 text-xs font-bold text-sky-400 hover:bg-sky-950/40 flex items-center space-x-2 transition">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Compile Certified Statutory Package</span>
          </button>
        </div>
      </div>
    </div>
  );
}
