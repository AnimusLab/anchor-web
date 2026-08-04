"use client";

import { useState } from "react";
import { Key, Plus, Shield, Copy, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Role } from "@/lib/auth/clearance";

interface KeyItem {
  id: string;
  name: string;
  project: string;
  keyMasked: string;
  scope: string;
  created: string;
  dualKeyReq: boolean;
}

const MOCK_KEYS: KeyItem[] = [
  { id: "key_01", name: "prod-ingest-key", project: "payments-service", keyMasked: "anc_live_99a81********************3b8", scope: "INGEST_ONLY", created: "2026-06-01", dualKeyReq: true },
  { id: "key_02", name: "dev-sandbox-key", project: "wealth-advisor-agent", keyMasked: "anc_test_12b44********************0a1", scope: "FULL_ACCESS", created: "2026-06-15", dualKeyReq: false },
  { id: "key_03", name: "auditor-relay-key", project: "credit-decisioning", keyMasked: "anc_gov_77e90********************4f2", scope: "READ_ONLY", created: "2026-07-02", dualKeyReq: true }
];

export default function ApiKeyVaultPage() {
  const [role, setRole] = useState<Role>("HUB_MANAGER");
  const [assignedProject] = useState("payments-service");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clearance rules
  const canGenerateKeys = role === "HUB_MANAGER" || role === "PROJECT_LEAD";
  const isManager = role === "HUB_MANAGER";

  // Filter keys visible by clearance
  const visibleKeys = isManager 
    ? MOCK_KEYS 
    : MOCK_KEYS.filter((k) => k.project === assignedProject);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-emerald-400">CRYPTOGRAPHIC KEY VAULT</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">API Key Vault</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Manage project API keys, dual-key signing policies, and rate limits.</p>
        </div>

        {/* Clearance Role Mode Switcher Demo */}
        <div className="flex items-center space-x-2 font-mono text-xs glass-badge p-1.5">
          <span className="text-slate-400 px-2">CLEARANCE ROLE:</span>
          {(["HUB_MANAGER", "PROJECT_LEAD", "DEVELOPER"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg transition ${
                role === r ? "bg-white/10 text-emerald-400 font-bold border border-white/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Role Scoping Notice */}
      <div className="glass-card p-4 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>
            CURRENT CLEARANCE: <strong className="text-slate-100">{role}</strong>
            {!isManager && <span className="text-slate-400"> (Scoped to <strong className="text-sky-400">{assignedProject}</strong>)</span>}
          </span>
        </div>
        {canGenerateKeys ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-badge px-4 py-2 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Generate New API Key</span>
          </button>
        ) : (
          <span className="text-rose-400 font-bold text-[11px] glass-badge px-3 py-1">
            KEY CREATION DISABLED FOR DEVELOPERS
          </span>
        )}
      </div>

      {/* Keys List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">ACCESSIBLE PROJECT API KEYS</span>
          <span className="text-slate-400">{visibleKeys.length} Keys Visible</span>
        </div>

        <div className="p-5 space-y-4">
          {visibleKeys.map((k) => (
            <div key={k.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-100 font-bold text-sm">{k.name}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300">{k.project}</span>
                </div>
                <div className="text-slate-400 text-[11px] pt-1">{k.keyMasked}</div>
              </div>

              <div className="flex items-center space-x-3">
                {k.dualKeyReq && (
                  <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px] flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>DUAL-KEY REQ</span>
                  </span>
                )}
                <span className="glass-badge px-3 py-1 text-sky-400 font-bold text-[10px]">
                  {k.scope}
                </span>
                <button
                  onClick={() => handleCopy(k.id)}
                  className="glass-badge p-2 text-slate-300 hover:text-white transition"
                  title="Copy Key"
                >
                  {copiedId === k.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Key Modal (Role Scoped) */}
      {showCreateModal && canGenerateKeys && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-5 border border-white/20">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="animus-label text-emerald-400 mb-1">PROVISION VAULT KEY</div>
                <h3 className="text-xl font-bold text-slate-100">Generate Project API Key</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="glass-badge px-3 py-1 text-xs text-slate-400 font-mono">
                Close
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">KEY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. prod-payments-ingest"
                  className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* PROJECT SELECTOR: Type-in/Full for Manager vs Fixed for Project Lead */}
              <div>
                <label className="text-slate-400 block mb-1 flex justify-between">
                  <span>TARGET PROJECT SILO</span>
                  <span className="text-emerald-400 text-[10px]">
                    {isManager ? "HUB MANAGER (ALL PROJECTS)" : "PROJECT LEAD (ASSIGNED SILO ONLY)"}
                  </span>
                </label>

                {isManager ? (
                  <select className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none">
                    <option>payments-service</option>
                    <option>wealth-advisor-agent</option>
                    <option>credit-decisioning</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={assignedProject}
                    className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-sky-400 font-bold focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="dualkey" defaultChecked className="rounded border-white/10 bg-[#040711]" />
                <label htmlFor="dualkey" className="text-slate-300 font-sans text-xs">Enforce Dual-Key Approval for Vault Modifications</label>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button onClick={() => setShowCreateModal(false)} className="glass-badge px-4 py-2 text-xs text-slate-400">
                Cancel
              </button>
              <button onClick={() => setShowCreateModal(false)} className="glass-badge px-5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
