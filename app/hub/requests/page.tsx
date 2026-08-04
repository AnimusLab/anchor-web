"use client";

import { UserCheck, CheckCircle2, XCircle, ShieldAlert, Send } from "lucide-react";

interface RequestItem {
  id: string;
  auditorId: string;
  auditorType: string;
  jurisdiction: string;
  targetProject: string;
  requestedAt: string;
  status: "PENDING_DUAL_KEY" | "APPROVED" | "REJECTED";
}

const MOCK_REQUESTS: RequestItem[] = [
  {
    id: "req_7701",
    auditorId: "AUD-RBI-IN-009",
    auditorType: "GOVERNMENT_AUDITOR",
    jurisdiction: "Reserve Bank of India (RBI)",
    targetProject: "credit-decisioning",
    requestedAt: "2026-08-04 10:15:00 UTC",
    status: "PENDING_DUAL_KEY"
  }
];

export default function P2PAccessRequestsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">P2P RELAY ACCESS GATEKEEPER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">P2P Access Requests</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Review and dual-key approve forensic P2P telemetry pull requests submitted by regulatory officials.</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">REGULATORY PULL REQUEST QUEUE</span>
          <span className="text-slate-400">1 Request Awaiting Action</span>
        </div>

        <div className="p-5 space-y-4">
          {MOCK_REQUESTS.map((req) => (
            <div key={req.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-amber-400 font-bold text-base">{req.id}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-100 font-semibold">{req.auditorId}</span>
                  <span className="glass-badge px-2.5 py-0.5 text-[10px] text-amber-400 font-bold">{req.auditorType}</span>
                </div>
                <div className="text-slate-400 text-xs">
                  Jurisdiction: {req.jurisdiction} · Target: <span className="text-sky-400 font-bold">{req.targetProject}</span>
                </div>
                <div className="text-[11px] text-slate-500">Requested: {req.requestedAt}</div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="glass-badge text-emerald-400 px-4 py-2.5 font-bold text-xs hover:bg-emerald-950/40 flex items-center space-x-2 transition">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dual Key Approve</span>
                </button>
                <button className="glass-badge text-rose-400 px-4 py-2.5 font-bold text-xs hover:bg-rose-950/40 flex items-center space-x-2 transition">
                  <XCircle className="w-4 h-4" />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
