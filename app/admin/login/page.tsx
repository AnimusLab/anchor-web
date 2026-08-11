"use client";

import { useState } from "react";
import { Shield, Key, ArrowRight, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("tan@animuslab.dev");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !totpCode) {
      setErrorMsg("Please enter Root Admin Email and 6-digit TOTP Code.");
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
        window.location.href = data.redirectUrl || "https://admin.animuslab.dev";
      } else {
        setErrorMsg(data.message || "Root authentication failed.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMsg("Connection error to Admin Access Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-mono text-xs overflow-hidden relative items-center justify-center p-6">
      <div className="w-full max-w-md p-8 space-y-6 relative z-10 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-indigo-500/40 shadow-[0_20px_50px_rgba(99,102,241,0.2)]">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-5">
          <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-400/40 text-indigo-400">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-sans uppercase">Animus Root Access</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Isolated Master Control Plane Gateway</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px]">
          SECURITY MANDATE: Mandatory Hardware TOTP 2FA verification required for Level Root Access.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">ROOT OPERATOR IDENTITY</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. tan@animuslab.dev"
              className="w-full bg-[#040711] border border-white/15 rounded-xl px-4 py-3 text-indigo-300 font-bold focus:outline-none focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 flex justify-between font-semibold">
              <span>HARDWARE TOTP 2FA CODE</span>
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="6-digit TOTP Code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full bg-[#040711] border border-white/15 rounded-xl px-4 py-3 text-indigo-300 font-bold focus:outline-none focus:border-indigo-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2 font-sans mt-2"
          >
            <span>{loading ? "AUTHENTICATING ROOT CLEARANCE..." : "AUTHENTICATE ROOT CONTROL"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

