"use client";

import { useState } from "react";
import { 
  Key, 
  Plus, 
  Shield, 
  Lock, 
  Copy, 
  Check, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FolderKanban,
  Sparkles,
  ShieldCheck,
  Zap,
  Terminal
} from "lucide-react";

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scope: string;
  role: string;
  projectId?: string | null;
  projectName?: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  isActive: boolean;
}

export interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

interface ApiKeyVaultClientProps {
  initialKeys: ApiKeyItem[];
  projects: ProjectOption[];
  userRole: string;
  hubId: string;
  isLeadOrManager: boolean;
  isManager: boolean;
}

export default function ApiKeyVaultClient({
  initialKeys,
  projects,
  userRole,
  hubId,
  isLeadOrManager,
  isManager,
}: ApiKeyVaultClientProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<{ rawKey: string; name: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [scope, setScope] = useState("INGEST_ONLY");
  const [expiresInDays, setExpiresInDays] = useState("90");

  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/hub/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          projectId: selectedProjectId || null,
          scope,
          expiresInDays: expiresInDays === "never" ? null : Number(expiresInDays),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Key generation failed.");

      setKeys((prev) => [data.apiKey, ...prev]);
      setNewKeyResult({ rawKey: data.rawKey, name: data.apiKey.name });
      setIsGenerateModalOpen(false);
      setName("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate key.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke API key '${keyName}'? This will immediately terminate all AI agents and CI/CD pipelines using this key.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/hub/keys?keyId=${encodeURIComponent(keyId)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revocation failed.");

      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, isActive: false } : k))
      );
      setSuccessMsg(`API Key '${keyName}' has been revoked.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to revoke key.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-emerald-400">CRYPTOGRAPHIC KEY VAULT</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">API Key Vault</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate and manage sovereign API keys, AI agent telemetry tokens, and CI/CD signing keys.
          </p>
        </div>

        {isLeadOrManager ? (
          <button
            onClick={() => {
              setIsGenerateModalOpen(true);
              setErrorMsg("");
            }}
            className="glass-badge px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 border-emerald-400/40 flex items-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Generate New API Key</span>
          </button>
        ) : (
          <span className="glass-badge px-3 py-2 text-xs font-bold text-rose-400 flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5" />
            <span>KEY CREATION: DEVELOPER ACCESS DENIED</span>
          </span>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="glass-card p-4 border border-rose-500/40 text-rose-300 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Clearance Banner */}
      <div className="glass-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>
            CURRENT CLEARANCE: <strong className="text-slate-100">{userRole.replace(/_/g, " ")}</strong>
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">
          Hub Silo: <strong className="text-sky-300">{hubId}</strong>
        </span>
      </div>

      {/* Active Keys Table */}
      <div className="glass-card overflow-hidden space-y-0">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">ACTIVE CRYPTOGRAPHIC ACCESS TOKENS</span>
          <span className="text-slate-400">{keys.filter((k) => k.isActive).length} Keys Active</span>
        </div>

        <div className="p-5 space-y-4">
          {keys.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Key className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-sans font-semibold text-sm">No API Keys Generated Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>+ Generate New API Key</strong> above to create runtime ingestion keys for your Python agent SDKs or CI/CD pipelines.
              </p>
            </div>
          ) : (
            keys.map((k) => {
              const isExpired = k.expiresAt && new Date(k.expiresAt) < new Date();
              const isLive = k.isActive && !isExpired;

              return (
                <div
                  key={k.id}
                  className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/30 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-3">
                      <Key className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-100 font-bold text-sm font-sans">{k.name}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                          k.scope === "ADMIN_KEY"
                            ? "bg-rose-500/20 border-rose-400/40 text-rose-300"
                            : k.scope === "FULL_ACCESS"
                            ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                            : "bg-sky-500/20 border-sky-400/40 text-sky-300"
                        }`}
                      >
                        {k.scope}
                      </span>
                      {k.projectName && (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          Project: {k.projectName}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 text-[11px] font-mono flex items-center space-x-3">
                      <span className="text-emerald-300 font-bold">
                        {k.keyPrefix}****************************
                      </span>
                      <span>·</span>
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                      {k.expiresAt && (
                        <>
                          <span>·</span>
                          <span className={isExpired ? "text-rose-400" : "text-slate-400"}>
                            {isExpired ? "Expired" : `Expires: ${new Date(k.expiresAt).toLocaleDateString()}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span
                      className={`glass-badge px-2.5 py-0.5 text-[9px] font-bold ${
                        isLive ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30"
                      }`}
                    >
                      {isLive ? "ACTIVE" : isExpired ? "EXPIRED" : "REVOKED"}
                    </span>

                    {isLive && isLeadOrManager && (
                      <button
                        onClick={() => handleRevokeKey(k.id, k.name)}
                        title="Revoke Key"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-400 hover:text-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Generate New Key Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-5 relative border border-emerald-400/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>KEY VAULT PROVISIONER</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">GENERATE CRYPTOGRAPHIC KEY</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Issue a cryptographically signed ingestion or management key for agents, SDKs, or pipelines.
              </p>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Key Label / Service Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Algo-Trading Agent SDK | CI/CD Pre-Commit"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Target Project Silo
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                >
                  <option value="">Global Hub (All Projects)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Clearance Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                  >
                    <option value="INGEST_ONLY">Ingest &amp; Evaluate (Agent SDK)</option>
                    <option value="FULL_ACCESS">Full Read/Write &amp; Replay</option>
                    {isManager && <option value="ADMIN_KEY">Hub Master Admin Key</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Key Expiration
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                  >
                    <option value="30">30 Days</option>
                    <option value="90">90 Days (Recommended)</option>
                    <option value="365">1 Year</option>
                    <option value="never">Never (Persistent)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "GENERATING..." : "GENERATE KEY →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: One-Time Key Reveal Modal */}
      {newKeyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-5 relative border border-emerald-400/50 shadow-2xl">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>CRYPTOGRAPHIC TOKEN ISSUED</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">API KEY GENERATED</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Key for <strong>{newKeyResult.name}</strong> has been provisioned.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] font-mono flex items-start space-x-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Copy and store this secret key now. For security purposes, this secret is never displayed again.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">API SECRET KEY</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-emerald-300 text-xs font-mono font-bold break-all">
                  {newKeyResult.rawKey}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(newKeyResult.rawKey)}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center space-x-1.5 transition flex-shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Quick SDK Usage Snippet */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-[11px]">
              <span className="text-slate-400 block font-bold">SDK USAGE EXAMPLE:</span>
              <pre className="text-sky-300 font-mono text-[10px] overflow-x-auto p-2 bg-[#04060c] rounded-lg">
{`from anchor import AnchorClient

client = AnchorClient(
    api_key="${newKeyResult.rawKey}",
    hub_id="${hubId}"
)`}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => setNewKeyResult(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition cursor-pointer"
            >
              Done / I Have Saved My Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
