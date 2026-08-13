"use client";

import { useState } from "react";
import { ShieldCheck, QrCode, Sparkles, Layers } from "lucide-react";

export interface LanyardCardData {
  name: string;
  email: string;
  orgName: string;
  hubId: string;
  clearanceId: string;
  role: string;
  fingerprint?: string;
  isVerified?: boolean;
  statusText?: string;
}

interface DynamicLanyardCardProps {
  data: LanyardCardData;
  portalTheme?: "hub" | "oversight" | "admin";
  mode?: "signin" | "onboard";
}

export default function DynamicLanyardCard({
  data,
  portalTheme = "hub",
  mode = "signin",
}: DynamicLanyardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Role-Specific Spatial UI Color Mapping
  const themeConfig = {
    hub: {
      id: "5A",
      roleLabel: "Enterprise",
      accentGlow: "shadow-[0_0_60px_rgba(99,102,241,0.4)]",
      borderColor: "border-indigo-400/50",
      accentText: "text-indigo-300",
      badgeBg: "bg-indigo-500/20 border-indigo-400/60 text-indigo-300",
      headerTitle: "COBALT SPATIAL CLEARANCE",
      defaultOrg: "ANIMUSLAB MESH",
      defaultRole: "ENTERPRISE MANAGER",
      defaultClearanceId: "EMG-ANM-2607",
      barcodeColor: "bg-indigo-400",
    },
    oversight: {
      id: "5B",
      roleLabel: "Auditor",
      accentGlow: "shadow-[0_0_60px_rgba(245,158,11,0.4)]",
      borderColor: "border-amber-400/50",
      accentText: "text-amber-300",
      badgeBg: "bg-amber-500/20 border-amber-400/60 text-amber-300",
      headerTitle: "GOLD SPATIAL OVERSIGHT",
      defaultOrg: "STATUTORY AGENCY",
      defaultRole: "STATUTORY AUDITOR",
      defaultClearanceId: "AUD-ANM-2603",
      barcodeColor: "bg-amber-400",
    },
    admin: {
      id: "5C",
      roleLabel: "Admin",
      accentGlow: "shadow-[0_0_60px_rgba(244,63,94,0.4)]",
      borderColor: "border-rose-400/50",
      accentText: "text-rose-300",
      badgeBg: "bg-rose-500/20 border-rose-400/60 text-rose-300",
      headerTitle: "CRIMSON SPATIAL CONTROL",
      defaultOrg: "ANIMUSLAB INFRA",
      defaultRole: "ROOT OPERATOR",
      defaultClearanceId: "ADM-ANM-2601",
      barcodeColor: "bg-rose-500",
    },
  }[portalTheme];

  const displayName = data.name || (data.email ? data.email.split("@")[0].toUpperCase() : "PERSONNEL NAME");
  const displayOrg = data.orgName || themeConfig.defaultOrg;
  const displayHub = data.hubId ? data.hubId.toUpperCase() : "SILO_PENDING";
  const displayClearanceId = data.clearanceId || themeConfig.defaultClearanceId;
  const displayRole = data.role ? data.role.replace(/_/g, " ") : themeConfig.defaultRole;
  const displayFingerprint = data.fingerprint || "ED25519: UNVERIFIED KEYS HANDSHAKE";

  const isFullyInputted = Boolean(data.name || data.email || data.clearanceId);
  const statusBadgeText = isFullyInputted ? "VERIFIED" : "AWAITING";

  return (
    <div
      className="w-full max-w-[420px] h-[540px] relative z-10 cursor-pointer select-none group animate-zero-gravity hover-tip-balance"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1200px" }}
    >
      {/* 3D Flip Wrapper */}
      <div
        className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ================= BADGE FRONT SIDE (RAZOR-SHARP SPATIAL UI) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl backdrop-blur-2xl bg-slate-900/75 border-2 ${themeConfig.borderColor} p-7 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Spatial Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Spatial Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 z-10">
            <div>
              <span className="text-[11px] text-slate-400 font-bold tracking-widest block uppercase flex items-center gap-1.5 font-mono">
                <Layers className={`w-4 h-4 ${themeConfig.accentText}`} />
                {themeConfig.headerTitle}
              </span>
              <span className="text-sm font-black text-white tracking-wider font-sans">
                {displayOrg}
              </span>
            </div>
            <span
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                isFullyInputted
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                  : themeConfig.badgeBg
              }`}
            >
              {statusBadgeText}
            </span>
          </div>

          {/* Personnel Identity Floating Glass Container */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4.5 flex items-center gap-4 z-10 shadow-xl">
            <div className={`w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/25 flex items-center justify-center font-black text-base ${themeConfig.accentText} font-sans flex-shrink-0 shadow-inner`}>
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Personnel Identity
              </span>
              <div className="text-sm font-bold text-white tracking-wide truncate font-sans">
                {displayName}
              </div>
              <div className={`text-xs ${themeConfig.accentText} font-mono truncate mt-0.5`}>
                {data.email || "identity@animuslab.dev"}
              </div>
            </div>
          </div>

          {/* Scope Matrix Floating Glass Container */}
          <div className="grid grid-cols-2 gap-4 bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4.5 text-left z-10 shadow-xl">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance ID
              </span>
              <span className="text-xs font-extrabold text-white tracking-wider block mt-0.5 truncate font-mono">
                {displayClearanceId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Hub Silo ID
              </span>
              <span className={`text-xs font-extrabold ${themeConfig.accentText} tracking-wider block mt-0.5 truncate font-mono`}>
                {displayHub}
              </span>
            </div>
            <div className="col-span-2 pt-2.5 border-t border-white/15">
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance Status
              </span>
              <span className="text-xs font-extrabold text-emerald-400 tracking-widest block mt-0.5 uppercase">
                {displayRole}
              </span>
            </div>
          </div>

          {/* Bottom Cryptographic Fingerprint Footer */}
          <div className="space-y-2.5 z-10">
            <div className="bg-black/60 border border-white/15 rounded-xl p-3 text-[10px] font-bold text-slate-200 break-all tracking-tight select-all">
              KEY_FP: {displayFingerprint}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Zero-Gravity Floating · Click to Flip →
              </span>
              <span className={`font-bold ${themeConfig.accentText}`}>SPATIAL {themeConfig.id}</span>
            </div>
          </div>
        </div>

        {/* ================= BADGE BACK SIDE (NORMAL BARCODE & SEAL) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl backdrop-blur-2xl bg-slate-900/75 border-2 ${themeConfig.borderColor} p-7 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Spatial Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Back Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 z-10">
            <div>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest block uppercase">
                INSTITUTIONAL REGISTRY
              </span>
              <span className={`text-sm font-black ${themeConfig.accentText} tracking-wider font-sans`}>
                SECURE AUDIT NODE
              </span>
            </div>
            <QrCode className={`w-6 h-6 ${themeConfig.accentText}`} />
          </div>

          {/* Machine-Readable Cryptographic Barcode Area */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-center space-y-3.5 z-10 shadow-xl">
            <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              MACHINE-READABLE CRYPTOGRAPHIC BARCODE
            </div>

            {/* High-Density Barcode Lines */}
            <div className="flex justify-center items-center h-16 space-x-1.5 py-2 bg-black/90 rounded-xl p-3 border border-white/15">
              {[4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8, 2, 5, 3, 7, 1, 6, 4, 8, 2, 5, 3, 7, 2, 4, 6].map((w, idx) => (
                <div
                  key={idx}
                  className={`h-full ${idx % 2 === 0 ? themeConfig.barcodeColor : "bg-slate-700"}`}
                  style={{ width: `${w * 1.6}px` }}
                />
              ))}
            </div>

            <div className={`text-xs font-extrabold ${themeConfig.accentText} tracking-widest uppercase font-mono`}>
              {displayHub !== "SILO_PENDING" ? `AN-SYS-${displayHub}-2026` : "CORE_NODE_INDEX_LOCKED"}
            </div>
          </div>

          {/* Legal Sign-Off Statement */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-[10px] text-slate-300 leading-relaxed z-10">
            <div className="text-white font-bold mb-1 uppercase tracking-wider">
              Cryptographic Security Mandate:
            </div>
            This spatial credential is bound to the verified local private key layer. Any memory modification triggers immediate network revocation.
          </div>

          {/* Footer Seal */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/15 z-10">
            <span className={`flex items-center gap-1.5 ${themeConfig.accentText} font-bold`}>
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATED BY ANIMUSLAB</span>
            </span>
            <span>BACK SIDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
