"use client";

import { useState } from "react";
import { UserPlus, Sparkles, AlertTriangle, CheckCircle2, X } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: "admin" | "hub" | "oversight";
}

export default function OnboardingModal({ isOpen, onClose, portalType }: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
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
          jurisdiction: jurisdiction.trim(),
          department: department.trim(),
          portalType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding request failed.");

      setSuccessMsg(data.message || "Onboarding request submitted for administrator review.");
      setName("");
      setEmail("");
      setOrgName("");
      setTimeout(() => {
        onClose();
        setSuccessMsg("");
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred submitting onboarding request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg pure-glass-card p-8 rounded-3xl space-y-6 relative border border-emerald-400/40">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
            <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
            <span>SOVEREIGN ONBOARDING GATEWAY</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase font-sans">
            REQUEST WHITELIST CLEARANCE
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Submit your corporate identity credentials to request whitelisted clearance access.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-bold text-slate-200 uppercase mb-1">
              Full Name / Officer Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inspector General Vance"
              className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-200 uppercase mb-1">
              Corporate / Institutional Email <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@company.com"
              className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-200 uppercase mb-1">
              Organization Name / Agency
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. SEC Enforcement Division / Reserve Bank of India"
              className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-200 uppercase mb-1">
              Region / Jurisdiction
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. US-EAST | EU-AI-ACT | RBI-IN"
              className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT ONBOARDING REQUEST →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
