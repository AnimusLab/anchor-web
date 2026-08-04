"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { Shield, Key, ArrowRight, Lock, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("root@animuslab.dev");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !totpCode) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "root@animuslab.dev", totpCode }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-mono text-xs overflow-hidden relative items-center justify-center p-6">
      <SolarSystemBackground />

      <div className="w-full max-w-md p-8 space-y-6 relative z-10 rounded-3xl bg-slate-950/60 backdrop-blur-2xl border border-sky-500/40 shadow-[0_20px_50px_rgba(56,189,248,0.2)]">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-5">
          <div className="p-3 rounded-2xl bg-sky-950/50 border border-sky-400/40 text-sky-400">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-sans uppercase">Animus Root Access</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Isolated Master Control Plane Gateway</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px]">
          SECURITY MANDATE: Mandatory Hardware YubiKey / 2FA TOTP verification required for Level Root Access.
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">ROOT OPERATOR IDENTITY</label>
            <input
              type="text"
              readOnly
              value="root@animuslab.dev"
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-sky-400 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">MASTER ROOT PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-sky-500/60"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 flex justify-between">
              <span>HARDWARE YUBIKEY / 2FA TOTP</span>
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="6-digit TOTP Code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-3 text-sky-400 font-bold focus:outline-none focus:border-sky-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2 font-sans mt-2"
          >
            <span>{loading ? "AUTHENTICATING ROOT CLEARANCE..." : "AUTHENTICATE ROOT CONTROL"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
