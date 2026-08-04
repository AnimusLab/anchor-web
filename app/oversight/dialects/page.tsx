"use client";

import { useState } from "react";
import { FileCheck, Download, Sparkles, Search, UserCheck } from "lucide-react";
import { AuditorType } from "@/lib/auth/clearance";

export default function DialectGeneratorPage() {
  const [auditorType, setAuditorType] = useState<AuditorType>("GOVERNMENT_AUDITOR");
  const [customSiloInput, setCustomSiloInput] = useState("JPMC-IN-MUM01");
  const [selectedDropdownSilo, setSelectedDropdownSilo] = useState("JPMC-IN-MUM01");

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">STATUTORY COMPLIANCE COMPILER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dialect Generator</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Compile raw decision telemetry into certified statutory filing dialects (RBI, EU AI Act, ISO 42001).</p>
        </div>

        {/* Auditor Clearance Type Switcher Demo */}
        <div className="flex items-center space-x-2 font-mono text-xs glass-badge p-1.5">
          <span className="text-slate-400 px-2">CLEARANCE MODE:</span>
          {(["GOVERNMENT_AUDITOR", "STANDARD_AUDITOR", "CROSS_HUB_AUDITOR"] as AuditorType[]).map((type) => (
            <button
              key={type}
              onClick={() => setAuditorType(type)}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditorType === type ? "bg-white/10 text-amber-400 font-bold border border-white/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type.replace("_AUDITOR", "")}
            </button>
          ))}
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

          {/* DYNAMIC ENTITY INPUT (Type-in vs Dropdown based on Auditor Type) */}
          <div>
            <label className="text-slate-400 block mb-2 font-sans font-bold text-xs flex justify-between">
              <span>REGULATED ENTITY SILO</span>
              <span className="text-amber-400 text-[10px]">
                {auditorType === "GOVERNMENT_AUDITOR" ? "TYPE-IN (ALL JURISDICTION HUBS)" : "AUTHORIZED DROPDOWN"}
              </span>
            </label>

            {auditorType === "GOVERNMENT_AUDITOR" ? (
              /* Government Auditor: Type-in input for 100s of bank hubs */
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
                <input
                  type="text"
                  value={customSiloInput}
                  onChange={(e) => setCustomSiloInput(e.target.value)}
                  placeholder="Type Silo ID e.g. STATE-BANK-IN-01..."
                  className="w-full bg-[#040711] border border-amber-500/30 rounded-xl pl-10 pr-4 py-2.5 text-amber-300 font-bold focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            ) : (
              /* Standard & Cross-Hub Auditor: Dropdown of 1-3 assigned hubs */
              <select
                value={selectedDropdownSilo}
                onChange={(e) => setSelectedDropdownSilo(e.target.value)}
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
              >
                <option value="JPMC-IN-MUM01">JPMC-IN-MUM01 (Assigned Silo 1)</option>
                <option value="HDFC-IN-DEL02">HDFC-IN-DEL02 (Assigned Silo 2)</option>
              </select>
            )}
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
