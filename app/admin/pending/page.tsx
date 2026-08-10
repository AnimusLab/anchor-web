"use client";

import { useEffect, useState } from "react";
import { UserCheck, CheckCircle2, XCircle, Plus, Mail, Key, Shield, Building2, Send, Check, RefreshCw } from "lucide-react";

interface NodeIdentity {
  id: string;
  projectName: string;
  publicKeyPem: string;
  publicKeyFingerprint: string;
  registeredBy?: string;
  registeredAt: string;
  status: "PENDING_WHITELIST" | "ACTIVE" | "REJECTED";
}

export default function PendingApprovalsPage() {
  const [pendingNodes, setPendingNodes] = useState<NodeIdentity[]>([]);
  const [activeNodes, setActiveNodes] = useState<NodeIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/identity/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingNodes(data.pending || []);
        setActiveNodes(data.active || []);
      }
    } catch (err) {
      console.error("Failed to fetch node identities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleApproveNode = async (fingerprint: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/v1/identity/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, action })
      });

      if (res.ok) {
        const verb = action === "APPROVE" ? "APPROVED & ACTIVATED" : "REJECTED";
        setActionSuccessMsg(`Node ${fingerprint.substring(0, 18)}... ${verb} successfully.`);
        fetchNodes();
        setTimeout(() => setActionSuccessMsg(""), 5000);
      }
    } catch (err) {
      console.error("Failed to update node status:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">ACCESS CONTROL & WHITELIST INGESTION</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Pending Approvals & Node Registry</h1>
          <p className="text-sm text-slate-400 mt-1">Review pending cryptographic key identities from anchor init and provision active enterprise node access.</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={fetchNodes}
            className="glass-badge px-4 py-2.5 text-xs font-bold text-sky-400 hover:bg-sky-950/40 flex items-center space-x-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccessMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Zero Signup Policy Notice */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>POLICY: Zero Un-whitelisted Access. Telemetry packets from un-whitelisted node fingerprints are dropped with 401 Unauthorized.</span>
        </div>
        <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px]">ENFORCED</span>
      </div>

      {/* Pending Whitelist Queue */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-amber-400 font-bold">PENDING NODE IDENTITY APPROVAL QUEUE</span>
          <span className="text-slate-400">{pendingNodes.length} Nodes Awaiting Approval</span>
        </div>

        <div className="p-5 space-y-4">
          {pendingNodes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No pending node identity registrations awaiting approval.
            </div>
          ) : (
            pendingNodes.map((item) => (
              <div key={item.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-2 border-amber-500">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400 font-bold text-base">{item.projectName}</span>
                    <span className="glass-badge px-2.5 py-0.5 text-amber-400 font-bold text-[10px]">PENDING_WHITELIST</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-2 font-mono break-all">
                    Fingerprint: <span className="text-slate-200 font-bold">{item.publicKeyFingerprint}</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Registered: {new Date(item.registeredAt).toLocaleString()} · Source: {item.registeredBy || "CLI"}
                  </div>
                </div>

                <div className="flex space-x-3 flex-shrink-0">
                  <button
                    onClick={() => handleApproveNode(item.publicKeyFingerprint, "APPROVE")}
                    className="glass-badge text-emerald-400 px-4 py-2 font-bold text-xs hover:bg-emerald-950/40 flex items-center space-x-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Provision</span>
                  </button>
                  <button
                    onClick={() => handleApproveNode(item.publicKeyFingerprint, "REJECT")}
                    className="glass-badge text-rose-400 px-4 py-2 font-bold text-xs hover:bg-rose-950/40 flex items-center space-x-2 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Whitelisted Nodes */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-emerald-400 font-bold">ACTIVE PROVISIONED ENTERPRISE NODES</span>
          <span className="text-slate-400">{activeNodes.length} Active Telemetry Streams</span>
        </div>

        <div className="p-5 space-y-4">
          {activeNodes.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              No active nodes provisioned yet. Approve pending nodes above to enable telemetry ingestion.
            </div>
          ) : (
            activeNodes.map((item) => (
              <div key={item.id} className="glass-card-inset p-4 flex justify-between items-center border-l-2 border-emerald-500">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold text-sm">{item.projectName}</span>
                    <span className="glass-badge px-2.5 py-0.5 text-emerald-400 font-bold text-[10px]">ACTIVE & STREAMING</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1 font-mono">
                    FP: {item.publicKeyFingerprint}
                  </div>
                </div>
                <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px]">
                  TELEMETRY AUTHORIZED
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
