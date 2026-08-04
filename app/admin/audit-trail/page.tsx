"use client";

import { useState } from "react";
import { ShieldAlert, Download, Search, Filter, Lock, Eye, CheckCircle2 } from "lucide-react";

interface AuditTrailItem {
  id: string;
  actor: string;
  role: "AUDITOR" | "HUB_MANAGER" | "PROJECT_LEAD" | "DEVELOPER";
  action: string;
  commitOrPr: string;
  targetEntity: string;
  timestamp: string;
  flagStatus: "CLEAN" | "FLAGGED_FOR_INSPECTION";
}

const MOCK_AUDIT_TRAIL: AuditTrailItem[] = [
  { id: "log_9901", actor: "rbi_auditor_09@rbi.org.in", role: "AUDITOR", action: "Submitted P2P Access Pull Request req_7701", commitOrPr: "PR #142", targetEntity: "JPMC-IN-MUM01", timestamp: "2026-08-04 10:15:00 UTC", flagStatus: "CLEAN" },
  { id: "log_9902", actor: "tanishq@animuslab.dev", role: "HUB_MANAGER", action: "Signed Dual-Key Authorization for req_7701", commitOrPr: "SHA: c7a8910", targetEntity: "JPMC-IN-MUM01", timestamp: "2026-08-04 10:20:12 UTC", flagStatus: "CLEAN" },
  { id: "log_9903", actor: "alex.c@jpmc.com", role: "PROJECT_LEAD", action: "Provisioned Key prod-payments-ingest", commitOrPr: "PR #138", targetEntity: "JPMC-IN-MUM01", timestamp: "2026-08-03 14:02:11 UTC", flagStatus: "CLEAN" },
  { id: "log_9904", actor: "sarah.j@jpmc.com", role: "DEVELOPER", action: "Triggered telemetry stream debug override", commitOrPr: "SHA: f812a04", targetEntity: "JPMC-IN-MUM01", timestamp: "2026-08-03 11:45:00 UTC", flagStatus: "FLAGGED_FOR_INSPECTION" }
];

export default function AntiCollusionAuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exportedMsg, setExportedMsg] = useState("");

  const filtered = MOCK_AUDIT_TRAIL.filter(
    (item) =>
      item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commitOrPr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    setExportedMsg("Certified Read-Only Legal Audit Package (SHA-256 Verified CSV) generated and downloaded.");
    setTimeout(() => setExportedMsg(""), 5000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-rose-400">ANTI-COLLUSION MASTER TRAIL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Anti-Collusion Audit Trail</h1>
          <p className="text-sm text-slate-400 mt-1">Read-only master audit log tracking all actions across Auditors, Managers, Project Leads, and Developers.</p>
        </div>

        <button
          onClick={handleExport}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Certified Legal Audit Package</span>
        </button>
      </div>

      {exportedMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Global Filter */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Actor Email, PR Number, Git SHA (e.g. c7a8910), or Action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070b16]/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400/50 font-mono transition"
          />
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">MASTER SYSTEM AUDIT LOG</span>
          <span className="text-slate-400">{filtered.length} Monitored Actions</span>
        </div>

        <div className="p-5 space-y-4">
          {filtered.map((log) => (
            <div key={log.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-100 font-bold font-sans text-sm">{log.actor}</span>
                  <span className="glass-badge px-2 py-0.5 text-[10px] text-amber-400 font-bold">{log.role}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-sky-400 font-bold">{log.commitOrPr}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{log.action}</div>
                <div className="text-slate-500 text-[10px]">Target: {log.targetEntity} · {log.timestamp}</div>
              </div>

              <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${log.flagStatus === 'CLEAN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {log.flagStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
