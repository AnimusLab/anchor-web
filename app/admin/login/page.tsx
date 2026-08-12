"use client";

import { useState, useEffect } from "react";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import { Shield, Key, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("tan@animuslab.dev");
  const [totpCode, setTotpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [cardData, setCardData] = useState<LanyardCardData>({
    name: "TANISHQ VASWANI",
    email: "tan@animuslab.dev",
    orgName: "ANIMUSLAB INFRASTRUCTURE",
    hubId: "SOVEREIGN_ROOT",
    clearanceId: "ADM-ROOT-001",
    role: "ROOT OPERATOR",
    fingerprint: "ED25519: ROOT HARDWARE KEY SIGNED",
    isVerified: true,
    statusText: "ROOT OPERATOR CLEARANCE VERIFIED",
  });

  useEffect(() => {
    setCardData((prev) => ({
      ...prev,
      email: email || prev.email,
    }));
  }, [email]);

  const handleIdentifierBlur = async (queryVal: string) => {
    if (!queryVal || queryVal.length < 3) return;

    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: queryVal }),
      });
      const data = await res.json();
      if (res.ok && data.found) {
        setCardData({
          name: data.name,
          email: data.email,
          orgName: data.orgName,
          hubId: data.hubId,
          clearanceId: data.clearanceId,
          role: data.role,
          fingerprint: data.fingerprint,
          isVerified: true,
          statusText: data.statusText,
        });
      }
    } catch (err) {
      console.error("Admin lookup error:", err);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !totpCode) {
      setErrorMsg("Please enter Root Admin Email and 6-digit TOTP Code.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, totpCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCardData((prev) => ({
          ...prev,
          isVerified: true,
          statusText: "ROOT SESSION ESTABLISHED // ACTIVE",
        }));
        window.location.href = data.redirectTo || "/admin";
      } else {
        setErrorMsg(data.error || data.message || "Root authentication failed. Invalid TOTP code.");
      }
    } catch (err) {
      setErrorMsg("Connection error to Admin Access Gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040308] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-rose-500/30 selection:text-rose-200">
      {/* Ambient Background Grid */}
      <div className="absolute inset-0 bg-[radial-[#1a0f1d]_1px,transparent_1px] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-8 py-6 relative z-20 flex justify-between items-center border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center font-bold text-white font-mono shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            R
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight uppercase">Animus Root Control</div>
            <div className="text-[10px] font-mono text-rose-400">MASTER OPERATOR GATEWAY</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>ROOT ENCLAVE ACTIVE</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="text-xs font-mono text-rose-400 font-bold tracking-wider mb-2 uppercase">
              ISOLATED CONTROL PLANE GATEWAY
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 font-sans">
              Root Administrator Access
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Mandatory hardware TOTP 2FA verification required for Level Root Access. Provisions and monitors sovereign tenant hubs across multi-cloud regions.
            </p>
          </div>

          {errorMsg && (
            <div className="glass-card p-4 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 max-w-lg font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">
                ROOT OPERATOR EMAIL *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="tan@animuslab.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => handleIdentifierBlur(e.target.value)}
                  className="w-full bg-[#070510]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-rose-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">
                HARDWARE TOTP 2FA CODE *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit TOTP Code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#070510]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-rose-400 font-bold focus:outline-none focus:border-rose-400 transition tracking-widest text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 text-white hover:brightness-110 transition shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center space-x-2 text-sm mt-4 font-sans"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Authenticate Root Control →</span>}
            </button>
          </form>
        </div>

        {/* Right Dynamic Lanyard Card Column */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <DynamicLanyardCard data={cardData} portalTheme="admin" mode="signin" />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/[0.08] text-[10px] font-mono text-slate-500 flex justify-between items-center relative z-20">
        <div>ROOT MANDATE: HARDWARE_KEY_REQUIRED</div>
        <div>ADMIN.ANIMUSLAB.DEV</div>
      </footer>
    </div>
  );
}
