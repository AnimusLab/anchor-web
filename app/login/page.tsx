"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { Shield, Key, ArrowRight, CheckCircle2, Lock, Gavel, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time clearance detection
  const lowerEmail = email.toLowerCase();
  let detectedRole = "HUB_MANAGER";
  let detectedBadge = "HUB MANAGER (FULL CLEARANCE)";
  let detectedColor = "text-emerald-400 border-emerald-500/30";
  let Icon = Shield;

  if (lowerEmail.includes("rbi") || lowerEmail.includes("auditor")) {
    detectedRole = "AUDITOR";
    detectedBadge = "GOVERNMENT AUDITOR (RBI JURISDICTION)";
    detectedColor = "text-amber-400 border-amber-500/30";
    Icon = Gavel;
  } else if (lowerEmail.includes("admin") || lowerEmail.includes("root")) {
    detectedRole = "ANIMUS_ADMIN";
    detectedBadge = "ANIMUS ROOT ADMINISTRATOR";
    detectedColor = "text-sky-400 border-sky-500/30";
    Icon = Key;
  } else if (lowerEmail.includes("lead") || lowerEmail.includes("alex")) {
    detectedRole = "PROJECT_LEAD";
    detectedBadge = "PROJECT LEAD (PAYMENTS SERVICE)";
    detectedColor = "text-sky-400 border-sky-500/30";
    Icon = User;
  } else if (lowerEmail.includes("dev") || lowerEmail.includes("sarah")) {
    detectedRole = "DEVELOPER";
    detectedBadge = "DEVELOPER (READ-ONLY INGEST)";
    detectedColor = "text-slate-300 border-white/20";
    Icon = User;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const setQuickEmail = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword("••••••••••••");
  };

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-sans text-xs overflow-hidden relative items-center justify-center p-4">
      {/* Animated Solar System Background */}
      <SolarSystemBackground />

      {/* Login Card */}
      <div className="glass-card w-full max-w-md p-8 space-y-6 relative z-10 border border-white/15">
        {/* Logo Header */}
        <div className="flex items-center space-x-3 border-b border-white/10 pb-5">
          <div className="p-2.5 glass-badge">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-sans">Anchor Access Portal</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">AnimusLab Cryptographic Identity Gateway</p>
          </div>
        </div>

        {/* Real-time Clearance Detection Badge */}
        {email && (
          <div className="glass-card-inset p-3.5 flex items-center space-x-3 font-mono text-xs animate-fadeIn">
            <Icon className="w-4 h-4 text-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">DETECTED CLEARANCE LEVEL</span>
              <span className={`font-bold ${detectedColor}`}>{detectedBadge}</span>
            </div>
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
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-sans font-semibold">PASSWORD / YUBIKEY PIN</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2 font-sans"
          >
            <span>{loading ? "AUTHENTICATING CLEARANCE..." : "AUTHENTICATE & LOG IN"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="border-t border-white/10 pt-4 space-y-2 font-mono text-[11px]">
          <span className="text-slate-400 block text-[10px] uppercase font-sans">QUICK DEMO CLEARANCE LOGINS:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setQuickEmail("rbi_auditor_09@rbi.org.in")}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400 text-amber-400 text-left truncate"
            >
              🏛️ Gov Auditor
            </button>
            <button
              onClick={() => setQuickEmail("tanishq@animuslab.dev")}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400 text-emerald-400 text-left truncate"
            >
              🛡️ Hub Manager
            </button>
            <button
              onClick={() => setQuickEmail("alex.c@jpmc.com")}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-sky-400 text-sky-400 text-left truncate"
            >
              📁 Project Lead
            </button>
            <button
              onClick={() => setQuickEmail("root@animuslab.dev")}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400 text-purple-400 text-left truncate"
            >
              🔑 Animus Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
