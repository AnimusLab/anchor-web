"use client";

import { useState } from "react";
import { FileCheck, Download, Sparkles, Search, UserCheck } from "lucide-react";
import { AuditorType } from "@/lib/auth/clearance";

export default function DialectGeneratorPage() {
  const [auditorType, setAuditorType] = useState<AuditorType>("GOVERNMENT_AUDITOR");
  const [customSiloInput, setCustomSiloInput] = useState("JPMC-IN-MUM01");
  const [selectedDropdownSilo, setSelectedDropdownSilo] = useState("JPMC-IN-MUM01");

  const [targetDialect, setTargetDialect] = useState("EU_AI_ACT_2024");
  const [timeline, setTimeline] = useState("2026-06-01 to 2026-08-04");
  const [compiling, setCompiling] = useState(false);
  const [compiledPack, setCompiledPack] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCompile = async () => {
    setCompiling(true);
    setErrorMsg("");
    try {
      const siloId = auditorType === "GOVERNMENT_AUDITOR" ? customSiloInput : selectedDropdownSilo;
      const res = await fetch("/api/v1/oversight/dialect/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialect: targetDialect, hubId: siloId, timeline })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to compile dialect package");
      setCompiledPack(data.dialectPack);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!compiledPack) return;
    const blob = new Blob([JSON.stringify(compiledPack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Anchor_Statutory_Dialect_${compiledPack.dialectId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <select
              value={targetDialect}
              onChange={(e) => setTargetDialect(e.target.value)}
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
            >
              <option value="EU_AI_ACT_2024">EU_AI_ACT_2024 (European Union)</option>
              <option value="RBI_IN_2025">RBI_IN_2025 (Reserve Bank of India)</option>
              <option value="ISO_42001">ISO_42001 (International AI Standards)</option>
            </select>
          </div>

          {/* DYNAMIC ENTITY INPUT */}
          <div>
            <label className="text-slate-400 block mb-2 font-sans font-bold text-xs flex justify-between">
              <span>REGULATED ENTITY SILO</span>
              <span className="text-amber-400 text-[10px]">
                {auditorType === "GOVERNMENT_AUDITOR" ? "TYPE-IN (ALL JURISDICTION HUBS)" : "AUTHORIZED DROPDOWN"}
              </span>
            </label>

            {auditorType === "GOVERNMENT_AUDITOR" ? (
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
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="glass-badge px-6 py-3 text-xs font-bold text-sky-400 hover:bg-sky-950/40 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-sky-400 ${compiling ? "animate-spin" : ""}`} />
            <span>{compiling ? "Compiling Statutory Package..." : "Compile Certified Statutory Package"}</span>
          </button>
        </div>
      </div>

      {/* Compiled Pack Visualizer */}
      {compiledPack && (
        <div className="glass-card p-8 space-y-6 font-mono text-xs border border-sky-500/30">
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
            <div className="flex items-center space-x-3">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{compiledPack.statuteTitle}</h3>
                <p className="text-slate-400 text-[10px]">Supervisory Authority: {compiledPack.supervisoryAuthority}</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl flex items-center space-x-2 font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Certified JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-[#040711] rounded-xl border border-white/5">
              <div className="text-slate-500 text-[10px]">VERDICT</div>
              <div className="text-emerald-400 font-bold text-sm mt-1">{compiledPack.statutoryComplianceVerdict}</div>
            </div>
            <div className="p-3 bg-[#040711] rounded-xl border border-white/5">
              <div className="text-slate-500 text-[10px]">MERKLE WITNESS</div>
              <div className="text-sky-300 font-bold text-[11px] truncate mt-1">{compiledPack.merkleIntegrityWitness}</div>
            </div>
            <div className="p-3 bg-[#040711] rounded-xl border border-white/5">
              <div className="text-slate-500 text-[10px]">EVENTS AUDITED</div>
              <div className="text-slate-200 font-bold text-sm mt-1">{compiledPack.auditedEventNodesCount} Nodes</div>
            </div>
            <div className="p-3 bg-[#040711] rounded-xl border border-white/5">
              <div className="text-slate-500 text-[10px]">TARGET SILO</div>
              <div className="text-amber-400 font-bold text-sm mt-1">{compiledPack.targetEntitySilo}</div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans font-bold text-xs mb-3">STATUTORY COMPLIANCE CHECKPOINTS</div>
            <div className="space-y-2">
              {compiledPack.statutoryCheckpoints.map((c: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#040711] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400 font-bold">{c.article}</span>
                    <span className="text-slate-300">{c.title}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
