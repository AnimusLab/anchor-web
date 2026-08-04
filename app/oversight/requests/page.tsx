"use client";

import { useState } from "react";
import { Send, Plus, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

interface RequestTracker {
  id: string;
  targetEntity: string;
  targetProject: string;
  justification: string;
  requestedAt: string;
  status: "PENDING_DUAL_KEY" | "APPROVED_RELAYED" | "DENIED";
}

const MOCK_PULL_REQUESTS: RequestTracker[] = [
  {
    id: "req_7701",
    targetEntity: "JPMC-IN-MUM01",
    targetProject: "credit-decisioning",
    justification: "Statutory inspection under RBI Master Direction Section 7.2 digital lending compliance.",
    requestedAt: "2026-08-04 10:15:00 UTC",
    status: "PENDING_DUAL_KEY"
  },
  {
    id: "req_7699",
    targetEntity: "HDFC-IN-DEL02",
    targetProject: "kyc-biometrics",
    justification: "Annual regulatory baseline verification.",
    requestedAt: "2026-07-28 14:00:00 UTC",
    status: "APPROVED_RELAYED"
  }
];

export default function ForensicPullRequestsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">P2P FORENSIC PULL PROTOCOL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">P2P Pull Requests</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Submit signed forensic P2P telemetry pull requests to regulated enterprise hubs.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition"
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Submit P2P Pull Request</span>
        </button>
      </div>

      {/* Requests Tracker List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">ACTIVE FORENSIC PULL REQUEST TRACKER</span>
          <span className="text-slate-400">{MOCK_PULL_REQUESTS.length} Requests Tracked</span>
        </div>

        <div className="p-5 space-y-4">
          {MOCK_PULL_REQUESTS.map((req) => (
            <div key={req.id} className="glass-card-inset p-5 space-y-3 font-mono text-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sky-400 font-bold text-sm">{req.id}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-100 font-semibold">{req.targetEntity}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-300">{req.targetProject}</span>
                </div>
                <span
                  className={`glass-badge px-3 py-1 font-bold text-[10px] ${
                    req.status === "APPROVED_RELAYED"
                      ? "text-emerald-400"
                      : req.status === "PENDING_DUAL_KEY"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="font-sans text-xs text-slate-300">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">REGULATORY JUSTIFICATION</span>
                {req.justification}
              </div>

              <div className="text-[11px] text-slate-500 pt-1">Submitted: {req.requestedAt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
