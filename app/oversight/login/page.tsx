"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, Key, Lock, Layers, Rocket, AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import AnimusLogo from "@/components/ui/AnimusLogo";
import OnboardingModal from "@/components/auth/OnboardingModal";

const BLOCKED_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "mail.com", "protonmail.com", "aol.com", "gmx.com", "zoho.com"];

export default function OversightLoginPage() {
  const router = useRouter();
  const [clearanceId, setClearanceId] = useState("");
  const [email, setEmail] = useState("");
  const [hubId, setHubId] = useState("");
  const [resolvedOrg, setResolvedOrg] = useState("STATUTORY AGENCY");
  const [resolvedName, setResolvedName] = useState("");
  const [resolvedRole, setResolvedRole] = useState("");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  // Validate Corporate Email Domain
  useEffect(() => {
    if (!email.includes("@")) {
      setEmailWarning("");
      return;
    }
    const domain = email.split("@")[1]?.toLowerCase().trim();
    if (BLOCKED_DOMAINS.includes(domain)) {
      setEmailWarning("🚫 PUBLIC CONSUMER DOMAIN RESTRICTED // INSTITUTIONAL CORPORATE EMAIL REQUIRED (@company.com)");
    } else {
      setEmailWarning("");
    }
  }, [email]);

  // Clearance ID Auto-Lookup Hook
  useEffect(() => {
    const trimmed = clearanceId.trim();
    if (trimmed.length < 3) {
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/lookup?clearanceId=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.found) {
          if (data.email) setEmail(data.email);
          if (data.hubId) setHubId(data.hubId);
          if (data.orgName) setResolvedOrg(data.orgName);
          if (data.name) setResolvedName(data.name);
          if (data.role) setResolvedRole(data.role);
        }
      } catch (err) {
        // Fallback
      } finally {
        setIsScanning(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [clearanceId]);

  const isFormBlocked = Boolean(emailWarning);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormBlocked) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clearanceId: clearanceId.trim(),
          email: email.trim(),
          hubId: hubId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      router.push("/oversight");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate auditor credential.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSandboxLaunch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/demo/provision", { method: "POST" });
      const data = await res.json();
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push("/oversight");
      }
    } catch (err) {
      router.push("/demo");
    } finally {
      setIsLoading(false);
    }
  };

  const lanyardCardData: LanyardCardData = {
    name: resolvedName || (email ? email.split("@")[0].toUpperCase() : ""),
    email: email,
    orgName: resolvedOrg,
    hubId: hubId,
    clearanceId: clearanceId,
    role: resolvedRole || "STATUTORY AUDITOR",
    isVerified: Boolean(clearanceId && email && !isFormBlocked),
  };

  return (
    <div className="min-h-screen merged-bg-amber text-slate-100 flex flex-col justify-between p-6 md:p-10 relative overflow-hidden font-sans selection:bg-amber-500/40 selection:text-amber-100">
      {/* Ambient Smooth Merged Glow Orbs */}
      <div className="ambient-glow-orb -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/40 via-orange-600/30 to-yellow-500/40 animate-spatial-aurora" />
      <div className="ambient-glow-orb -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/40 via-amber-600/30 to-yellow-600/40 animate-spatial-aurora" style={{ animationDelay: "-6s" }} />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between z-20 max-w-7xl w-full mx-auto pb-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <AnimusLogo variant="silver" size={44} />
          <div>
            <span className="text-base font-black tracking-wider text-white uppercase block font-sans">
              Anchor Oversight
            </span>
            <span className="text-[11px] font-mono text-amber-300 font-bold tracking-widest block uppercase">
              STATUTORY OVERSIGHT PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-slate-200 font-bold tracking-wider uppercase">
            REGULATORY CONTROL GATE
          </span>
        </div>
      </header>

      {/* Main Form & Horizontal ID Card Container */}
      <main className="z-20 max-w-7xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-items-center">
        {/* Left Form Container */}
        <div className="lg:col-span-6 w-full max-w-lg pure-glass-card p-8 md:p-10 rounded-3xl space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-md border border-amber-300/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-200 mb-3 shadow-inner">
              <Layers className="w-4 h-4 text-amber-300" />
              <span>STATUTORY AUDITOR ACCESS GATE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
              OVERSIGHT ACCESS
            </h1>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed font-sans">
              Enter your Clearance ID to resolve identity keypair and verify compliance node.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/50 text-rose-200 p-4 rounded-2xl text-xs font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2 font-mono">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Clearance ID <span className="text-amber-300">*</span>
                </label>
                {isScanning && (
                  <span className="text-[10px] text-cyan-300 animate-pulse font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin" /> RESOLVING KEY...
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={clearanceId}
                onChange={(e) => setClearanceId(e.target.value)}
                placeholder="AUD-ANM-2603"
                className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-3.5 text-white text-sm font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                Corporate Email <span className="text-amber-300">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full pure-glass-input rounded-2xl pl-6 pr-4 py-3.5 text-white text-sm font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal ${
                  emailWarning ? "border-rose-400 focus:border-rose-500 bg-rose-950/20" : ""
                }`}
              />
              {emailWarning && (
                <div className="mt-2 text-[11px] text-rose-300 font-mono flex items-center space-x-1 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{emailWarning}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                Regulatory Body / Jurisdiction <span className="text-amber-300">*</span>
              </label>
              <input
                type="text"
                required
                value={hubId}
                onChange={(e) => setHubId(e.target.value)}
                placeholder="SEC | EU-AI-ACT | RBI | animuslab-prod"
                className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-3.5 text-white text-sm font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isFormBlocked}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black py-4 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] transition-all uppercase tracking-wider flex items-center justify-center space-x-2 border border-amber-300/40"
            >
              <span>{isLoading ? "AUTHENTICATING..." : "AUTHENTICATE AUDITOR NODE →"}</span>
            </button>
          </form>

          {/* Prominent Sandbox Launcher & Onboarding Request */}
          <div className="pt-3 border-t border-white/20 space-y-2.5">
            <button
              type="button"
              onClick={handleSandboxLaunch}
              disabled={isLoading}
              className="w-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-500/30 text-emerald-200 py-3.5 rounded-2xl font-mono text-xs font-extrabold tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Launch 1-Month Free Sandbox Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOnboardOpen(true)}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 py-2.5 rounded-2xl font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Don't have a Clearance ID? Request Whitelist Clearance →</span>
            </button>
          </div>
        </div>

        <OnboardingModal
          isOpen={isOnboardOpen}
          onClose={() => setIsOnboardOpen(false)}
          portalType="oversight"
        />

        {/* Right Horizontal ID Card Container with Auto Scanner Animation */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <DynamicLanyardCard
            portalTheme="oversight"
            isScanning={isScanning}
            data={lanyardCardData}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="z-20 max-w-7xl w-full mx-auto pt-6 border-t border-white/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <div>REGULATORY COMPLIANCE PROTOCOL // STATUTORY_OVERSIGHT_V6</div>
        <div className="text-slate-200 font-bold tracking-wider">
          SOVEREIGN AUDIT RELAY · <span className="text-amber-300 font-mono">ANIMUSLAB.DEV</span>
        </div>
      </footer>
    </div>
  );
}
