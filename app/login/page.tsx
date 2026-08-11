"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { Shield, ArrowRight, Gavel, User, KeyRound, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dynamic Identity Scope Badge
  const lowerEmail = email.toLowerCase();
  const cleanId = identifier.trim().toUpperCase();

  let detectedBadge = "ENTERPRISE IDENTITY";
  let detectedColor = "text-emerald-400 border-emerald-500/30";
  let Icon = Shield;

  if (lowerEmail.includes("@animuslab.dev") || lowerEmail.startsWith("tan")) {
    detectedBadge = "ANIMUSLAB ROOT ADMIN (SYSTEM OPERATIONS)";
    detectedColor = "text-indigo-400 border-indigo-500/30";
    Icon = Shield;
  } else if (lowerEmail.includes("rbi") || lowerEmail.includes("sec") || lowerEmail.includes("auditor")) {
    detectedBadge = `STATUTORY AUDITOR ${cleanId ? `// ${cleanId}` : "(OVERSIGHT CLEARANCE)"}`;
    detectedColor = "text-amber-400 border-amber-500/30";
    Icon = Gavel;
  } else if (cleanId) {
    detectedBadge = `HUB SILO CLEARANCE // [${cleanId}]`;
    detectedColor = "text-sky-400 border-sky-500/30";
    Icon = Building2;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !totpCode) {
      setErrorMsg("Please enter your Enterprise Email and 6-digit Authenticator TOTP Code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, identifier, totpCode }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        setErrorMsg(data.message || "Authentication failed. Identity not verified in Whitelist.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("Connection error to Governance Access Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-sans text-xs overflow-hidden relative items-center justify-center p-6">
      {/* Animated Solar System Background */}
      <SolarSystemBackground />

      {/* Pure Liquid Glass Login Box */}
      <div className="liquid-glass-card w-full max-w-lg p-9 space-y-7 relative z-10">
        {/* Logo & Zero Signup Banner */}
        <div className="flex justify-between items-center border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 glass-badge text-sky-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">Anchor Access Portal</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Cryptographic Identity & Whitelist Gateway</p>
            </div>
          </div>
          <span className="glass-badge px-3 py-1 text-[10px] font-mono text-amber-400 font-bold border-amber-500/30">
            ZERO-PASSWORD 2FA
          </span>
        </div>

        {/* Dynamic Scope Detection Badge */}
        {email && (
          <div className="glass-card-inset p-4 flex items-center space-x-3 font-mono text-xs border border-white/10 animate-fadeIn">
            <Icon className="w-4 h-4 text-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">DETECTED IDENTITY SCOPE</span>
              <span className={`font-bold ${detectedColor}`}>{detectedBadge}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs">
            {errorMsg}
          </div>
        )}

        {/* Passwordless 2FA Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1.5 font-sans font-semibold">ENTERPRISE / AUDITOR EMAIL</label>
            <input
              type="email"
              required
              placeholder="e.g. tan@animuslab.dev or dark.t.1030@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-sky-400/60 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1.5 font-sans font-semibold flex items-center justify-between">
                <span>HUB ID / ORG ID</span>
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input
                type="text"
                placeholder="e.g. AN-IN-SOL01 or jpmc"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-slate-100 uppercase focus:outline-none focus:border-sky-400/60 transition"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-sans font-semibold flex items-center justify-between">
                <span>2FA AUTH CODE</span>
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit TOTP"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-sky-400 font-bold focus:outline-none focus:border-sky-400/60 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 text-slate-950 font-bold text-xs hover:brightness-110 transition flex items-center justify-center space-x-2 font-sans mt-2"
          >
            <span>{loading ? "VERIFYING CRYPTOGRAPHIC 2FA..." : "AUTHENTICATE & ACCESS PORTAL"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Whitelisted Notice */}
        <div className="border-t border-white/10 pt-4 text-center font-mono text-[11px] text-slate-500">
          SECURE SEED GATE // ZERO-PASSWORD 2FA AUTHENTICATION
        </div>
      </div>
    </div>
  );
}

