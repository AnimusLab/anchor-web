"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Gavel, Plus, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface AuditorUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organization?: {
    displayName: string;
  };
}

export default function RegulatoryOfficialsPage() {
  const [auditors, setAuditors] = useState<AuditorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("REGULATORY_AUDITOR");
  const [jurisdiction, setJurisdiction] = useState("RBI-IN");

  const loadAuditors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auditor/whitelist");
      if (res.ok) {
        const data = await res.json();
        setAuditors(data.auditors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditors();
  }, []);

  const handleWhitelistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/auditor/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, role, jurisdiction }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to whitelist statutory auditor.");

      setSuccessMsg(data.message || `Auditor '${displayName}' successfully whitelisted.`);
      setAuditors((prev) => [data.auditor, ...prev]);

      setEmail("");
      setDisplayName("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while whitelisting auditor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY CREDENTIALS REGISTRY</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Regulatory Officials</h1>
          <p className="text-sm text-slate-400 mt-1">Directory of accredited government, standard, and cross-hub auditor clearance tokens.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 border-amber-400/40 flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ Whitelist Statutory Auditor</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Auditor Cards */}
      <div className="glass-card p-6 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-amber-400 animate-pulse font-mono text-xs">
            LOADING ACCREDITED AUDITOR REGISTRY...
          </div>
        ) : auditors.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl font-mono text-xs">
            NO ACCREDITED STATUTORY AUDITORS REGISTERED YET // CLICK '+ WHITELIST STATUTORY AUDITOR' TO PROVISION
          </div>
        ) : (
          auditors.map((auditor) => (
            <div key={auditor.id} className="glass-card-inset p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100 font-sans">{auditor.displayName || auditor.email}</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Clearance ID: <span className="text-amber-300 font-bold">{auditor.id}</span> · Email: {auditor.email} · Org: {auditor.organization?.displayName || "Statutory Agency"}
                </p>
              </div>
              <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px]">ACTIVE JURISDICTION</span>
            </div>
          ))
        )}
      </div>

      {/* Whitelist Statutory Auditor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-8 rounded-3xl space-y-6 relative border border-amber-400/40">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-300/40 px-3 py-1 rounded-full text-xs font-mono text-amber-200 mb-2">
                <Gavel className="w-3.5 h-3.5 text-amber-300" />
                <span>AUDITOR CREDENTIAL ACCREDITATION</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">WHITELIST STATUTORY AUDITOR</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Issue a whitelisted statutory auditor clearance token to a regulatory official or government agency.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 p-3 rounded-xl text-xs font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleWhitelistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Auditor Corporate Email <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="auditor.vance@sec.gov | officer@rbi.org.in"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Agency / Official Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Reserve Bank of India Oversight Team"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Jurisdiction Code
                </label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g. RBI-IN | SEC-US | EU-ACT"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Auditor Role Tier
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono bg-black/60 focus:outline-none"
                >
                  <option value="REGULATORY_AUDITOR">REGULATORY_AUDITOR (Statutory Government Oversight)</option>
                  <option value="CROSS_HUB_AUDITOR">CROSS_HUB_AUDITOR (Multi-Silo Compliance)</option>
                  <option value="STANDARD_AUDITOR">STANDARD_AUDITOR (Single Hub Audit)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 font-mono py-3 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  {submitting ? "ACCREDITING..." : "ISSUE CLEARANCE TOKEN →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
