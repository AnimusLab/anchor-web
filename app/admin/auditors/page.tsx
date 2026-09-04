"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Gavel, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Building2, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Shield, 
  FileCheck, 
  Sparkles,
  Clock,
  Send,
  UserCheck
} from "lucide-react";

interface AuditorRecord {
  id: string;
  whitelistId?: string;
  clearanceId: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  organization: string;
  orgDomain?: string;
  department?: string;
  jurisdiction: string;
  hubName?: string;
  assignedHubsCount?: number;
  createdAt: string;
  source?: string;
}

export default function RegulatoryOfficialsPage() {
  const [auditors, setAuditors] = useState<AuditorRecord[]>([]);
  const [pendingAuditors, setPendingAuditors] = useState<AuditorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending">("all");
  
  // Modals & Dossier Drawer
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState<AuditorRecord | null>(null);
  
  // Form State
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState("REGULATORY_AUDITOR");
  const [jurisdiction, setJurisdiction] = useState("RBI-IN");
  
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadAuditors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auditor/whitelist");
      if (res.ok) {
        const data = await res.json();
        setAuditors(data.auditors || []);
        setPendingAuditors(data.pending || []);
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
        body: JSON.stringify({ email, displayName, role, jurisdiction, orgName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to whitelist statutory auditor.");

      setSuccessMsg(data.message || `Auditor '${displayName}' successfully whitelisted.`);
      loadAuditors();

      setEmail("");
      setDisplayName("");
      setOrgName("");
      setTimeout(() => {
        setIsWhitelistModalOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while whitelisting auditor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePending = async (auditor: AuditorRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setApprovingId(auditor.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/whitelist/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelistId: auditor.whitelistId,
          email: auditor.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed.");

      setSuccessMsg(`Statutory Auditor '${auditor.displayName}' approved! Clearance ID: ${data.user?.id || auditor.clearanceId}`);
      if (selectedAuditor?.id === auditor.id) {
        setSelectedAuditor(null);
      }
      loadAuditors();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve auditor.");
    } finally {
      setApprovingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter list
  const displayList =
    activeTab === "approved"
      ? auditors
      : activeTab === "pending"
      ? pendingAuditors
      : [...pendingAuditors, ...auditors];

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case "REGULATORY_AUDITOR":
        return {
          label: "STATUTORY REGULATORY AUDITOR (L4)",
          color: "bg-amber-500/20 text-amber-300 border-amber-400/40",
          icon: <Gavel className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "CROSS_HUB_AUDITOR":
        return {
          label: "CROSS-HUB GOVERNANCE AUDITOR (L2)",
          color: "bg-purple-500/20 text-purple-300 border-purple-400/40",
          icon: <Globe className="w-3.5 h-3.5 text-purple-400" />,
        };
      default:
        return {
          label: "STANDARD HUB AUDITOR (L1)",
          color: "bg-slate-500/20 text-slate-300 border-slate-400/40",
          icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY CREDENTIALS REGISTRY</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Regulatory Officials</h1>
          <p className="text-sm text-slate-400 mt-1">
            Directory of accredited government regulators, standard inspectors, and cross-Hub audit officers.
          </p>
        </div>

        <button
          onClick={() => {
            setIsWhitelistModalOpen(true);
            setErrorMsg("");
          }}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 border-amber-400/40 flex items-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.25)]"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ Whitelist Statutory Auditor</span>
        </button>
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

      {/* Metrics & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2 bg-[#060913]/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === "all" ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            All Officials ({auditors.length + pendingAuditors.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Accredited Active ({auditors.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Pending Review</span>
            {pendingAuditors.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {pendingAuditors.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-2">
          <span>Sovereign Oversight Protocol:</span>
          <span className="glass-badge px-2.5 py-0.5 text-amber-400 font-bold border-amber-400/30">
            ZERO-KNOWLEDGE AUDIT MESH
          </span>
        </div>
      </div>

      {/* Auditor Cards Grid */}
      {loading ? (
        <div className="pure-glass-card p-16 text-center space-y-3 rounded-3xl border border-white/15">
          <Gavel className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
          <div className="text-amber-300 font-bold text-xs uppercase tracking-widest animate-pulse">
            LOADING ACCREDITED AUDITOR REGISTRY...
          </div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="pure-glass-card p-16 text-center space-y-4 rounded-3xl border border-white/10">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-sans font-semibold text-base">No Regulatory Officials in this View</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click <strong>+ Whitelist Statutory Auditor</strong> above to provision statutory clearance keys for regulatory inspectors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {displayList.map((auditor) => {
            const roleMeta = getRoleBadge(auditor.role);
            const isPending = auditor.status === "PENDING";
            const initials = auditor.displayName
              ? auditor.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : "AU";

            return (
              <div
                key={auditor.id}
                onClick={() => setSelectedAuditor(auditor)}
                className={`pure-glass-card p-6 rounded-3xl space-y-4 cursor-pointer transition border hover:scale-[1.01] relative overflow-hidden ${
                  isPending ? "border-amber-400/40 hover:border-amber-400/80" : "border-white/15 hover:border-amber-400/60"
                }`}
              >
                {/* Top Role & Status Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${roleMeta.color}`}>
                    {roleMeta.icon}
                    <span>{roleMeta.label}</span>
                  </div>

                  <span
                    className={`glass-badge px-2.5 py-0.5 text-[9px] font-mono font-bold ${
                      isPending ? "text-amber-400 border-amber-400/40 animate-pulse" : "text-emerald-400 border-emerald-400/30"
                    }`}
                  >
                    {isPending ? "PENDING REVIEW" : "ACCREDITED"}
                  </span>
                </div>

                {/* Profile Details */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center font-mono font-bold text-slate-950 text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                    {initials}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate font-sans">{auditor.displayName}</h3>
                    <p className="text-slate-300 text-xs font-mono truncate">{auditor.email}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{auditor.organization}</span>
                    </div>
                  </div>
                </div>

                {/* Clearance ID & Jurisdiction Info */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[9px] block uppercase font-bold">Clearance Token</span>
                    <span className="text-amber-300 font-bold">{auditor.clearanceId}</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-slate-400 text-[9px] block uppercase font-bold">Jurisdiction</span>
                    <span className="text-slate-200 font-bold bg-white/10 px-2 py-0.5 rounded text-[10px]">
                      {auditor.jurisdiction || "GLOBAL"}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Accredited: {new Date(auditor.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {isPending ? (
                      <button
                        onClick={(e) => handleApprovePending(auditor, e)}
                        disabled={approvingId === auditor.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{approvingId === auditor.id ? "Approving..." : "Approve"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedAuditor(auditor)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                      >
                        <span>View Dossier</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Auditor Security Dossier Modal */}
      {selectedAuditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 relative border border-amber-400/50 shadow-2xl font-sans">
            <button
              onClick={() => setSelectedAuditor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-amber-200 mb-2">
                <Gavel className="w-3.5 h-3.5 text-amber-300" />
                <span>STATUTORY AUDITOR SECURITY DOSSIER</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase">{selectedAuditor.displayName}</h2>
              <p className="text-xs text-slate-300 mt-1 font-mono">{selectedAuditor.email}</p>
            </div>

            {/* Field Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Clearance Token</span>
                <span className="text-amber-300 font-bold break-all">{selectedAuditor.clearanceId}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Accreditation Status</span>
                <span className={`font-bold ${selectedAuditor.status === "APPROVED" ? "text-emerald-400" : "text-amber-400"}`}>
                  {selectedAuditor.status}
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Statutory Agency</span>
                <span className="text-slate-100 font-bold">{selectedAuditor.organization}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Primary Jurisdiction</span>
                <span className="text-slate-100 font-bold">{selectedAuditor.jurisdiction || "GLOBAL"}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Agency Domain</span>
                <span className="text-slate-300">{selectedAuditor.orgDomain || "N/A"}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Registration Date</span>
                <span className="text-slate-300">{new Date(selectedAuditor.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAuditor(null)}
                className="w-1/2 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
              >
                Close Dossier
              </button>

              {selectedAuditor.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleApprovePending(selectedAuditor)}
                  disabled={approvingId === selectedAuditor.id}
                  className="w-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {approvingId === selectedAuditor.id ? "APPROVING..." : "APPROVE AUDITOR →"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedAuditor.clearanceId, selectedAuditor.id)}
                  className="w-1/2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 py-3 rounded-xl font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {copiedId === selectedAuditor.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === selectedAuditor.id ? "Token Copied!" : "Copy Token"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Whitelist Statutory Auditor Modal */}
      {isWhitelistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 relative border border-amber-400/40 shadow-2xl font-sans">
            <button
              onClick={() => setIsWhitelistModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-amber-200 mb-2">
                <Gavel className="w-3.5 h-3.5 text-amber-300" />
                <span>AUDITOR CREDENTIAL ACCREDITATION</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">WHITELIST STATUTORY AUDITOR</h2>
              <p className="text-xs text-slate-300 mt-1">
                Issue a whitelisted statutory auditor clearance token to a regulatory official or government agency.
              </p>
            </div>

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
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Full Official Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Vance, Regulatory Examiner"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Statutory Agency / Organization
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Reserve Bank of India (RBI) | US SEC"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Clearance Level
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                  >
                    <option value="REGULATORY_AUDITOR">Regulatory Auditor (Level 4)</option>
                    <option value="CROSS_HUB_AUDITOR">Cross-Hub Auditor (Level 2)</option>
                    <option value="STANDARD_AUDITOR">Standard Auditor (Level 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Primary Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                  >
                    <option value="RBI-IN">RBI-IN (Reserve Bank of India)</option>
                    <option value="SEC-US">SEC-US (Securities &amp; Exchange)</option>
                    <option value="EU-AI">EU-AI (EU AI Act Authority)</option>
                    <option value="CFPB-US">CFPB-US (Consumer Protection)</option>
                    <option value="FCA-UK">FCA-UK (Financial Conduct)</option>
                    <option value="MAS-SG">MAS-SG (Monetary Authority SG)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWhitelistModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "PROVISIONING..." : "ACCREDIT AUDITOR →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
