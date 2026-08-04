"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { Shield, Key, ArrowRight, Lock, Gavel, User, KeyRound, Droplet } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Real-time clearance detection
  const lowerEmail = email.toLowerCase();
  let detectedBadge = "HUB MANAGER (FULL CLEARANCE)";
  let detectedColor = "text-emerald-400 border-emerald-500/30";
  let Icon = Shield;

  if (lowerEmail.includes("rbi") || lowerEmail.includes("auditor")) {
    detectedBadge = "GOVERNMENT AUDITOR (RBI JURISDICTION)";
    detectedColor = "text-amber-400 border-amber-500/30";
    Icon = Gavel;
  } else if (lowerEmail.includes("lead") || lowerEmail.includes("alex")) {
    detectedBadge = "PROJECT LEAD (PAYMENTS SERVICE)";
    detectedColor = "text-sky-400 border-sky-500/30";
    Icon = User;
  } else if (lowerEmail.includes("dev") || lowerEmail.includes("sarah")) {
    detectedBadge = "DEVELOPER (READ-ONLY INGEST)";
    detectedColor = "text-slate-300 border-white/20";
    Icon = User;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !totpCode) {
      setErrorMsg("Please enter email, password, and 6-digit Authenticator TOTP Code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, totpCode }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectUrl);
        router.refresh();
      } else {
        setErrorMsg(data.message || "Authentication failed. Email not in Whitelist.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const setQuickEmail = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword("••••••••••••");
    setTotpCode("889012");
  };

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-sans text-xs overflow-hidden relative items-center justify-center p-6">
      {/* Animated Solar System Background */}
      <SolarSystemBackground />

      {/* Liquid Glass Login Box (Bigger Card Width max-w-lg) */}
      <div className="w-full max-w-lg p-9 space-y-7 relative z-10 rounded-3xl bg-slate-950/40 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_20px_50px_rgba(6,182,212,0.15),inset_0_1px_2px_rgba(255,255,255,0.3)]">
        {/* Logo & Zero Signup Banner */}
        <div className="flex justify-between items-center border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-300">
              <Droplet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">Anchor Access Portal</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Cryptographic Identity & Whitelist Gateway</p>
            </div>
          </div>
          <span className="glass-badge px-3 py-1 text-[10px] font-mono text-amber-400 font-bold border-amber-500/30">
            STRICT WHITELIST ONLY
          </span>
        </div>

        {/* Real-time Clearance Detection Badge */}
        {email && (
          <div className="glass-card-inset p-4 flex items-center space-x-3 font-mono text-xs border border-white/10 animate-fadeIn">
            <Icon className="w-4 h-4 text-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">DETECTED CLEARANCE LEVEL</span>
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1.5 font-sans font-semibold">ENTERPRISE / AUDITOR EMAIL</label>
            <input
              type="email"
              required
              placeholder="e.g. tanishq@animuslab.dev or rbi_auditor_09@rbi.org.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-cyan-400/60 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1.5 font-sans font-semibold">PASSWORD / PIN</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-cyan-400/60 transition"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-sans font-semibold flex items-center justify-between">
                <span>2FA AUTH CODE</span>
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit TOTP"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-[#040711]/90 border border-white/15 rounded-xl px-4 py-3.5 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400/60 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-[0_4px_25px_rgba(6,182,212,0.35)] flex items-center justify-center space-x-2 font-sans mt-2"
          >
            <span>{loading ? "VERIFYING WHITELIST & 2FA..." : "AUTHENTICATE & ACCESS PORTAL"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials (EXCLUDES Admin for Security Isolation) */}
        <div className="border-t border-white/10 pt-4 space-y-2 font-mono text-[11px]">
          <div className="flex justify-between items-center font-sans text-[10px]">
            <span className="text-slate-400 block uppercase">WHITELISTED DEMO CLEARANCES:</span>
            <span className="text-slate-500">NO PUBLIC SIGN-UP</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setQuickEmail("rbi_auditor_09@rbi.org.in")}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400 text-amber-400 text-left truncate"
            >
              🏛️ Gov Auditor
            </button>
            <button
              onClick={() => setQuickEmail("tanishq@animuslab.dev")}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400 text-emerald-400 text-left truncate"
            >
              🛡️ Hub Manager
            </button>
            <button
              onClick={() => setQuickEmail("alex.c@jpmc.com")}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400 text-sky-400 text-left truncate"
            >
              📁 Project Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
