"use client";

import { useState } from "react";
import { UserPlus, Sparkles, AlertTriangle, CheckCircle2, X, Clock, ShieldCheck, Globe, Building2, Key } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: "admin" | "hub" | "oversight";
}

export default function OnboardingModal({ isOpen, onClose, portalType }: OnboardingModalProps) {
  const isOversight = portalType === "oversight";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [requestedRole, setRequestedRole] = useState(isOversight ? "REGULATORY_AUDITOR" : "HUB_MANAGER");
  const [jurisdiction, setJurisdiction] = useState(isOversight ? "RBI" : "US-EAST-1");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          orgName: orgName.trim(),
          orgDomain: orgDomain.trim(),
          requestedRole,
          jurisdiction: jurisdiction.trim(),
          department: department.trim(),
          portalType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding request failed.");

      setSuccessMsg(data.message || "Onboarding request submitted for Root Administrator clearance review.");
      setName("");
      setEmail("");
      setOrgName("");
      setOrgDomain("");
      setTimeout(() => {
        onClose();
        setSuccessMsg("");
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred submitting onboarding request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-xl pure-glass-card p-6 sm:p-8 rounded-3xl space-y-5 relative border border-emerald-400/40 my-8 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
            <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isOversight ? "REGULATORY CLEARANCE GATEWAY" : "ENTERPRISE CLEARANCE GATEWAY"}</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase font-sans">
            {isOversight ? "REQUEST STATUTORY AUDITOR CLEARANCE" : "REQUEST WHITELIST CLEARANCE"}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
            Submit your official identity credentials to request whitelisted cryptographic clearance access.
          </p>
        </div>

        {/* 48-Hour SLA Advisory Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] font-mono flex items-start space-x-2.5 leading-relaxed">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Identity verification can take up to at least <strong>48 hours</strong> for clearance approval (approval times depend on institutional response speeds from your respective organization or regulatory body).
          </span>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 p-4 rounded-xl text-xs font-mono flex items-start space-x-2.5 leading-relaxed">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Row 1: Name and Role Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                Full Name / Officer Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanishq Dasari"
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                Requested Clearance Level <span className="text-emerald-400">*</span>
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white bg-[#0A0A10] focus:outline-none cursor-pointer"
              >
                {isOversight ? (
                  <>
                    <option value="REGULATORY_AUDITOR">Regulatory Auditor (L4) — Statutory Oversight &amp; Subpoenas</option>
                    <option value="CROSS_HUB_AUDITOR">Cross-Hub Auditor (L2) — Multi-Hub Enterprise Governance</option>
                    <option value="STANDARD_AUDITOR">Standard Auditor (L1) — Single-Hub Read-Only Audit</option>
                  </>
                ) : (
                  <>
                    <option value="HUB_MANAGER">Hub Manager (L3) — Apex Hub Administrative Control</option>
                    <option value="PROJECT_LEAD">Project Lead (L2) — Team &amp; Repository Guardrails</option>
                    <option value="DEVELOPER">Developer (L1) — AST &amp; Runtime SDK Integration</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Row 2: Email and Domain URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                Institutional Email <span className="text-emerald-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@agency.gov or name@company.com"
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                Organization Domain URL <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                placeholder="e.g. rbi.org.in or jpmorgan.com"
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Org Name and Jurisdiction / Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                Organization / Agency Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Reserve Bank of India / JP Morgan"
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 uppercase mb-1">
                {isOversight ? "Statutory Jurisdiction" : "Primary Cloud Region"}
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder={isOversight ? "e.g. RBI | SEC | FCA | EU-AI-ACT" : "e.g. US-EAST-1 | AP-SOUTH-1 | EU-WEST-1"}
                className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 uppercase mb-1">
              Department / Division <span className="text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. FinTech Oversight Division / Algorithmic Trading Systems"
              className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT ONBOARDING REQUEST →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
