"use client";

import { FileText, Download, CheckCircle, ShieldCheck, Clock } from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  dialect: "EU_AI_ACT_2024" | "RBI_IN_2025" | "ISO_42001";
  period: string;
  complianceScore: string;
  generatedAt: string;
  size: string;
}

const MOCK_REPORTS: ReportItem[] = [
  { id: "rep_901", title: "Q2 2026 EU AI Act Article 14 Compliance Audit", dialect: "EU_AI_ACT_2024", period: "2026-04-01 - 2026-06-30", complianceScore: "99.2%", generatedAt: "2026-07-01", size: "4.2 MB" },
  { id: "rep_902", title: "RBI Master Direction - Digital Lending Regulatory Filing", dialect: "RBI_IN_2025", period: "2026-05-01 - 2026-07-31", complianceScore: "100.0%", generatedAt: "2026-08-01", size: "2.8 MB" },
  { id: "rep_903", title: "ISO/IEC 42001 AI Management System Evidence Packet", dialect: "ISO_42001", period: "2026-01-01 - 2026-06-30", complianceScore: "98.8%", generatedAt: "2026-07-05", size: "8.5 MB" }
];

export default function DialectReportsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">REGULATORY REPORT GENERATOR</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dialect Reports</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Export certified audit packages formatted to specific statutory framework dialects.</p>
        </div>

        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Compile Custom Dialect Report</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {MOCK_REPORTS.map((rep) => (
          <div key={rep.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100 font-sans">{rep.title}</h3>
                <span className="glass-badge px-3 py-1 text-sky-400 text-[10px] font-bold">{rep.dialect}</span>
              </div>
              <div className="text-slate-400 text-xs flex items-center space-x-4 pt-1 font-sans">
                <span>Coverage Period: {rep.period}</span>
                <span>·</span>
                <span>Generated: {rep.generatedAt}</span>
                <span>·</span>
                <span>Size: {rep.size}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">COMPLIANCE RATING</span>
                <span className="text-emerald-400 font-bold text-base">{rep.complianceScore}</span>
              </div>
              <button className="glass-badge px-4 py-2.5 text-xs font-bold text-slate-100 hover:text-white flex items-center space-x-2 transition">
                <Download className="w-4 h-4 text-sky-400" />
                <span>Download (.PDF)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
