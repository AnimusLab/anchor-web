"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, Key, Lock, Layers, Rocket, AlertTriangle, ArrowLeft } from "lucide-react";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import AnimusLogo from "@/components/ui/AnimusLogo";

const BLOCKED_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "mail.com", "protonmail.com", "aol.com", "gmx.com", "zoho.com"];

export default function AdminLoginPage() {
  const router = useRouter();
  const [clearanceId, setClearanceId] = useState("");
  const [email, setEmail] = useState("");
  const [hubId, setHubId] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "totp">("credentials");

  const [resolvedOrg, setResolvedOrg] = useState("SOVEREIGN ROOT CONTROL");
  const [resolvedName, setResolvedName] = useState("");
  const [resolvedRole, setResolvedRole] = useState("");

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
          if (data.email && (!email || email === "identity@animuslab.dev")) setEmail(data.email);
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
    }, 450);

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
          totpCode: totpCode.trim(),
          portalType: "admin",
        }),
      });

      const data = await res.json();

      if (data.requireTotp && step === "credentials") {
        setStep("totp");
        setIsLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate root admin credential.");
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
        router.push("/admin");
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
    role: resolvedRole || "ROOT OPERATOR",
    isVerified: Boolean(clearanceId && email && !isFormBlocked),
  };

  return (
    <div className="min-h-screen merged-bg-crimson text-slate-100 flex flex-col justify-between p-6 md:p-10 relative overflow-hidden font-sans selection:bg-rose-500/40 selection:text-rose-100">
      {/* Ambient Smooth Merged Glow Orbs */}
      <div className="ambient-glow-orb -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-rose-500/40 via-pink-600/30 to-red-500/40 animate-spatial-aurora" />
      <div className="ambient-glow-orb -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-pink-600/40 via-rose-600/30 to-purple-600/40 animate-spatial-aurora" style={{ animationDelay: "-6s" }} />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between z-20 max-w-7xl w-full mx-auto pb-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <AnimusLogo variant="silver" size={44} />
          <div>
            <span className="text-base font-black tracking-wider text-white uppercase block font-sans">
              Anchor Admin
            </span>
            <span className="text-[11px] font-mono text-rose-300 font-bold tracking-widest block uppercase">
              ROOT CONTROL PLANE GATE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
          <span className="text-slate-200 font-bold tracking-wider uppercase">
            ROOT AUTHORITY GATE
          </span>
        </div>
      </header>

      {/* Main Form & Horizontal ID Card Container */}
      <main className="z-20 max-w-7xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-items-center">
        {/* Left Form Container */}
        <div className="lg:col-span-6 w-full max-w-lg pure-glass-card p-8 md:p-10 rounded-3xl space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 backdrop-blur-md border border-rose-300/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-rose-200 mb-3 shadow-inner">
              <Layers className="w-4 h-4 text-rose-300" />
              <span>ROOT CONTROL PLANE ACCESS GATE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
              {step === "totp" ? "2FA AUTHENTICATOR" : "ROOT ADMIN ACCESS"}
            </h1>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed font-sans">
              {step === "totp"
                ? "Enter the 6-digit TOTP code generated by your Authenticator app."
                : "Enter your Clearance ID to resolve root identity keypair and access the control plane."}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/50 text-rose-200 p-4 rounded-2xl text-xs font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {step === "credentials" ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2 font-mono">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Clearance ID <span className="text-rose-300">*</span>
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
                    placeholder="e.g. ADM-8800-XX"
                    className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-3.5 text-white text-sm font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                    Corporate Email <span className="text-rose-300">*</span>
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
                    Organization Hub ID <span className="text-rose-300">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hubId}
                    onChange={(e) => setHubId(e.target.value)}
                    placeholder="e.g. org-unit"
                    className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-3.5 text-white text-sm font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isFormBlocked}
                  className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-red-500 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black py-4 rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:shadow-[0_0_50px_rgba(244,63,94,0.8)] transition-all uppercase tracking-wider flex items-center justify-center space-x-2 border border-rose-300/40"
                >
                  <span>{isLoading ? "AUTHENTICATING..." : "AUTHENTICATE ROOT NODE →"}</span>
                </button>
              </>
            ) : (
              <>
                {/* STEP 2: 2FA TOTP Code Entry */}
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3 font-mono text-xs text-rose-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
                    <span>CLEARANCE ID: {clearanceId}</span>
                    <span>HUB: {hubId}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">USER: {email}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                    6-Digit Authenticator Code (TOTP) <span className="text-rose-300">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-4 text-white text-2xl font-mono tracking-[0.5em] text-center placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("credentials")}
                    className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || totpCode.length < 6}
                    className="flex-1 bg-gradient-to-r from-rose-600 via-pink-600 to-red-500 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black py-4 rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:shadow-[0_0_50px_rgba(244,63,94,0.8)] transition-all uppercase tracking-wider flex items-center justify-center space-x-2 border border-rose-300/40 font-mono"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isLoading ? "VERIFYING TOTP..." : "VERIFY 2FA & ACCESS NODE →"}</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Prominent Sandbox Launcher */}
          <div className="pt-3 border-t border-white/20">
            <button
              type="button"
              onClick={handleSandboxLaunch}
              disabled={isLoading}
              className="w-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-500/30 text-emerald-200 py-3.5 rounded-2xl font-mono text-xs font-extrabold tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              <Rocket className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Launch 1-Month Free Sandbox Portal</span>
            </button>
          </div>
        </div>

        {/* Right Horizontal ID Card Container */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <DynamicLanyardCard
            portalTheme="admin"
            isScanning={isScanning}
            data={lanyardCardData}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="z-20 max-w-7xl w-full mx-auto pt-6 border-t border-white/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <div>CORE IDENTITY PROTOCOL: V6.0 // TRIPLE_FACTOR_AUTH</div>
        <div className="text-slate-200 font-bold tracking-wider">
          SOVEREIGN RELAY ACTIVE · <span className="text-rose-300 font-mono">ANIMUSLAB.DEV</span>
        </div>
      </footer>
    </div>
  );
}
