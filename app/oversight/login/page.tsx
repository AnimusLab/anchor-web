"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, Key, Lock, Layers, Rocket } from "lucide-react";
import DynamicLanyardCard from "@/components/auth/DynamicLanyardCard";
import AnimusLogo from "@/components/ui/AnimusLogo";

export default function OversightLoginPage() {
  const router = useRouter();
  const [clearanceId, setClearanceId] = useState("");
  const [email, setEmail] = useState("");
  const [hubId, setHubId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen merged-bg-amber text-slate-100 flex flex-col justify-between p-6 md:p-10 relative overflow-hidden font-sans selection:bg-amber-500/40 selection:text-amber-100">
      {/* Ambient Smooth Merged Glow Orbs */}
      <div className="ambient-glow-orb -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/40 via-orange-600/30 to-yellow-500/40 animate-spatial-aurora" />
      <div className="ambient-glow-orb -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/40 via-amber-600/30 to-yellow-600/40 animate-spatial-aurora" style={{ animationDelay: "-6s" }} />

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between z-20 max-w-[1550px] w-full mx-auto pb-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <AnimusLogo variant="amber" size={42} />
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
      <main className="z-20 max-w-[1550px] w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Form Container */}
        <div className="lg:col-span-5 w-full max-w-xl justify-self-start pure-glass-card p-8 md:p-11 rounded-3xl space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-md border border-amber-300/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-200 mb-3 shadow-inner">
              <Layers className="w-4 h-4 text-amber-300" />
              <span>STATUTORY AUDITOR ACCESS GATE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
              OVERSIGHT ACCESS
            </h1>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed font-sans">
              Verify statutory regulatory clearance keys to access compliance nodes.
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
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                Clearance ID <span className="text-amber-300">*</span>
              </label>
              <input
                type="text"
                required
                value={clearanceId}
                onChange={(e) => setClearanceId(e.target.value)}
                placeholder="AUD-ANM-2603"
                className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-4 text-white text-base font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
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
                className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-4 text-white text-base font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
                Organization Hub ID <span className="text-amber-300">*</span>
              </label>
              <input
                type="text"
                required
                value={hubId}
                onChange={(e) => setHubId(e.target.value)}
                placeholder="animuslab"
                className="w-full pure-glass-input rounded-2xl pl-6 pr-4 py-4 text-white text-base font-sans placeholder:text-slate-400 placeholder:opacity-70 focus:outline-none transition shadow-inner leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-base font-black py-4.5 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] transition-all uppercase tracking-wider flex items-center justify-center space-x-2 border border-amber-300/40"
            >
              <span>{isLoading ? "AUTHENTICATING..." : "AUTHENTICATE AUDITOR NODE →"}</span>
            </button>
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
        <div className="lg:col-span-7 w-full flex justify-end justify-self-end">
          <DynamicLanyardCard
            portalTheme="oversight"
            data={{
              name: email ? email.split("@")[0].toUpperCase() : "",
              email: email,
              orgName: "STATUTORY AGENCY",
              hubId: hubId,
              clearanceId: clearanceId,
              isVerified: Boolean(clearanceId && email),
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="z-20 max-w-[1550px] w-full mx-auto pt-6 border-t border-white/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <div>REGULATORY COMPLIANCE PROTOCOL // STATUTORY_OVERSIGHT_V6</div>
        <div className="text-slate-200 font-bold">SOVEREIGN AUDIT RELAY · ANCHORGOVERNANCE.TECH</div>
      </footer>
    </div>
  );
}
