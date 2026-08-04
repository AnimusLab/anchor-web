"use client";

import { useState, useEffect } from "react";
import { Gavel, Send, FileCheck, Calendar, Camera, Upload, CheckCircle2 } from "lucide-react";

export default function AuditorProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load avatar from browser cookie/localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("auditor_avatar_b64");
    if (saved) setAvatarUrl(saved);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setAvatarUrl(b64);
      localStorage.setItem("auditor_avatar_b64", b64);
      document.cookie = `auditor_avatar=${encodeURIComponent(b64)}; path=/; max-age=31536000`;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative z-10 font-sans text-xs">
      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Badge with Cookie Upload Option */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-sky-500 to-indigo-500 p-1 flex-shrink-0 shadow-lg overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-[22px]" />
            ) : (
              <div className="w-full h-full rounded-[22px] bg-[#070b16] flex items-center justify-center font-mono text-2xl font-bold text-amber-400">
                RBI
              </div>
            )}
          </div>
          <label className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
            <Camera className="w-6 h-6 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>

        {/* Bio & Auditor Details */}
        <div className="space-y-3 flex-1 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 font-sans">Inspector R. K. Sharma</h1>
              <p className="text-amber-400 font-mono text-xs">rbi_auditor_09@rbi.org.in</p>
            </div>
            <span className="glass-badge px-3.5 py-1.5 text-amber-400 font-bold text-xs">
              GOVERNMENT AUDITOR (RBI JURISDICTION)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>Jurisdiction: <strong className="text-slate-100">RBI-IN</strong></div>
            <div>Clearance: <strong className="text-amber-400">AUD-RBI-IN-009</strong></div>
            <div>Accredited: <strong className="text-slate-100">Feb 2025</strong></div>
          </div>
        </div>
      </div>

      {/* Auditor Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-sky-400">P2P PULL REQUESTS FILED</span>
          <div className="text-3xl font-bold text-sky-400 mt-1">24 Requests</div>
          <div className="text-slate-400 text-xs">22 Approved · 2 Pending</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-amber-400">STATUTORY FILINGS COMPILED</span>
          <div className="text-3xl font-bold text-amber-400 mt-1">18 Filings</div>
          <div className="text-slate-400 text-xs">RBI Master Direction 2025</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-emerald-400">BLOCK VERIFICATIONS</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">1,890 Hashes</div>
          <div className="text-slate-400 text-xs">100% Cryptographic Match</div>
        </div>
      </div>

      {/* Cryptographic Signing Activity Heatmap */}
      <div className="glass-card p-6 space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 text-xs">
          <span className="animus-label text-slate-300">AUDITOR CRYPTOGRAPHIC AUDIT LOG (365 DAYS)</span>
          <span className="text-slate-400">1,890 Signed Audit Events</span>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 py-2">
          {Array.from({ length: 96 }).map((_, i) => {
            const intensity = (i * 3) % 5;
            const bgClass =
              intensity === 4
                ? "bg-amber-400"
                : intensity === 3
                ? "bg-amber-500/70"
                : intensity === 2
                ? "bg-amber-700/50"
                : intensity === 1
                ? "bg-amber-950/40"
                : "bg-white/5";
            return <div key={i} className={`w-3 h-3 rounded-sm ${bgClass}`} title={`Day ${i + 1}`} />;
          })}
        </div>
      </div>
    </div>
  );
}
