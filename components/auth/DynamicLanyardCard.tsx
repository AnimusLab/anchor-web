"use client";

import { useState } from "react";
import { ShieldCheck, QrCode } from "lucide-react";

export interface LanyardCardData {
  name: string;
  email: string;
  orgName: string;
  hubId: string;
  clearanceId: string;
  role?: string;
  fingerprint?: string;
  isVerified?: boolean;
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

  // Pure Glassmorphism Color Theme Tokens
  const themeConfig = {
    hub: {
      accentGlow: "shadow-[0_0_60px_rgba(99,102,241,0.45)]",
      borderColor: "border-indigo-300/50",
      leftGlassBg: "bg-gradient-to-br from-indigo-500/35 via-purple-600/30 to-cyan-500/35",
      badgeBorder: "border-indigo-400/60",
      accentText: "text-indigo-200",
      badgeBg: "bg-indigo-500/30 border-indigo-300/60 text-indigo-100",
      leftTag: "SOVEREIGN CLEARANCE",
      headerOrg: "ANIMUSLAB MESH",
      barcodeColor: "bg-indigo-300",
      avatarBorder: "border-indigo-300/70",
    },
    oversight: {
      accentGlow: "shadow-[0_0_60px_rgba(245,158,11,0.45)]",
      borderColor: "border-amber-300/50",
      leftGlassBg: "bg-gradient-to-br from-amber-500/35 via-orange-600/30 to-yellow-500/35",
      badgeBorder: "border-amber-400/60",
      accentText: "text-amber-200",
      badgeBg: "bg-amber-500/30 border-amber-300/60 text-amber-100",
      leftTag: "REGULATORY OVERSIGHT",
      headerOrg: "STATUTORY AGENCY",
      barcodeColor: "bg-amber-300",
      avatarBorder: "border-amber-300/70",
    },
    admin: {
      accentGlow: "shadow-[0_0_60px_rgba(244,63,94,0.45)]",
      borderColor: "border-rose-300/50",
      leftGlassBg: "bg-gradient-to-br from-rose-500/35 via-pink-600/30 to-red-500/35",
      badgeBorder: "border-rose-400/60",
      accentText: "text-rose-200",
      badgeBg: "bg-rose-500/30 border-rose-300/60 text-rose-100",
      leftTag: "ROOT CONTROL PLANE",
      headerOrg: "ANIMUSLAB INFRA",
      barcodeColor: "bg-rose-300",
      avatarBorder: "border-rose-300/70",
    },
  }[portalTheme];

  const displayName = data.name || (data.email ? data.email.split("@")[0].toUpperCase() : "PERSONNEL NAME");
  const displayOrg = data.orgName || themeConfig.headerOrg;
  const displayHub = data.hubId ? data.hubId.toUpperCase() : "SILO_PENDING";
  const displayClearanceId = data.clearanceId ? data.clearanceId.toUpperCase() : "ID_PENDING";
  
  // Neutral initial role state when user hasn't filled form/authenticated
  const isInputted = Boolean(data.name || data.email || data.clearanceId);
  const displayRole = data.role 
    ? data.role.replace(/_/g, " ") 
    : (isInputted ? "SOVEREIGN OPERATOR" : "PENDING CLEARANCE");

  const statusBadgeText = data.isVerified || isInputted ? "VERIFIED" : "AWAITING";

  return (
    <div
      className="w-full max-w-[660px] h-[400px] relative z-10 cursor-pointer select-none group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1400px" }}
    >
      {/* Horizontal 3D Flip Container with Soft Glass Floating Hover */}
      <div
        className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.02] group-hover:-translate-y-2"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ================= BADGE FRONT SIDE (LARGE & SHARP FROSTED GLASS) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl pure-glass-card flex overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Glass Top Specular Reflection Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-20" />

          {/* Left Block (Frosted Tinted Glass Panel) */}
          <div className={`w-[240px] ${themeConfig.leftGlassBg} backdrop-blur-3xl p-7 flex flex-col justify-between items-center text-center border-r border-white/20 relative overflow-hidden flex-shrink-0`}>
            {/* Subtle Surface Dots */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* Large Circular Avatar Badge */}
            <div className="relative z-10 my-auto space-y-4">
              <div className={`w-24 h-24 rounded-full bg-black/40 backdrop-blur-xl border-2 ${themeConfig.avatarBorder} flex items-center justify-center font-black text-3xl text-white font-sans shadow-2xl mx-auto ring-4 ring-white/10`}>
                {displayName.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-200 font-bold tracking-widest uppercase block">
                  {themeConfig.leftTag}
                </span>
                <span className="text-sm font-black text-white tracking-wider block font-mono">
                  {displayClearanceId}
                </span>
              </div>
            </div>

            {/* Bottom Left Glass Badge */}
            <div className="relative z-10 w-full bg-black/45 backdrop-blur-md border border-white/30 rounded-xl py-2 px-2.5 text-[9px] font-black text-white uppercase tracking-wider shadow-inner">
              AUTHENTICATED BY ANIMUSLAB
            </div>
          </div>

          {/* Right Main Body (High-Contrast Spacious Content) */}
          <div className="flex-1 p-7 flex flex-col justify-between overflow-hidden bg-black/30 backdrop-blur-2xl">
            {/* Top Organization Header & Status Badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/20">
              <div>
                <span className="text-[10px] text-slate-300 font-bold tracking-widest block uppercase">
                  ORGANIZATION
                </span>
                <span className="text-xl font-black text-white tracking-wider font-sans block mt-0.5">
                  {displayOrg}
                </span>
              </div>
              <span
                className={`text-xs font-black px-4 py-1.5 rounded-full uppercase border ${
                  statusBadgeText === "VERIFIED"
                    ? "bg-emerald-500/30 border-emerald-400/70 text-emerald-200"
                    : themeConfig.badgeBg
                }`}
              >
                {statusBadgeText}
              </span>
            </div>

            {/* Personnel Name & Email */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-300 font-bold tracking-widest block uppercase">
                PERSONNEL NAME
              </span>
              <div className="text-xl font-black text-white tracking-wide truncate font-sans">
                {displayName}
              </div>
              <div className={`text-sm ${themeConfig.accentText} font-mono font-bold truncate`}>
                {data.email || "identity@animuslab.dev"}
              </div>
            </div>

            {/* Scope Matrix (Clearance ID & Hub ID) */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
                  CLEARANCE ID
                </span>
                <span className="text-sm font-extrabold text-white tracking-wider block mt-1 truncate font-mono">
                  {displayClearanceId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
                  HUB SILO ID
                </span>
                <span className={`text-sm font-extrabold ${themeConfig.accentText} tracking-wider block mt-1 truncate font-mono`}>
                  {displayHub}
                </span>
              </div>
            </div>

            {/* Clearance Status & Indicator */}
            <div className="pt-3 border-t border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
                  CLEARANCE STATUS
                </span>
                <span className={`text-xs font-extrabold tracking-widest block mt-1 uppercase ${isInputted ? "text-emerald-300" : "text-slate-300"}`}>
                  {displayRole}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase">
                <span className={`w-2.5 h-2.5 rounded-full ${isInputted ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                <span className={isInputted ? "text-emerald-300" : "text-amber-300"}>
                  {isInputted ? "IDENTITY VERIFIED" : "AWAITING AUTH"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BADGE BACK SIDE (LARGE & SHARP FROSTED GLASS) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl pure-glass-card p-7 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Glass Specular Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-20" />

          {/* Back Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/20 z-10">
            <div>
              <span className="text-[10px] text-slate-300 font-bold tracking-widest block uppercase">
                INSTITUTIONAL REGISTRY
              </span>
              <span className={`text-base font-black ${themeConfig.accentText} tracking-wider font-sans`}>
                SECURE AUDIT NODE
              </span>
            </div>
            <QrCode className={`w-7 h-7 ${themeConfig.accentText}`} />
          </div>

          {/* Middle Section: Machine-Readable Barcode */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-center space-y-3 shadow-2xl z-10">
            <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">
              MACHINE-READABLE CRYPTOGRAPHIC BARCODE
            </div>

            {/* High-Density Barcode Lines */}
            <div className="flex justify-center items-center h-14 space-x-2 py-2 bg-black/80 rounded-xl p-3 border border-white/20">
              {[4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8, 2, 5, 3, 7, 1, 6, 4, 8, 2, 5, 3, 7, 2, 4, 6].map((w, idx) => (
                <div
                  key={idx}
                  className={`h-full ${idx % 2 === 0 ? themeConfig.barcodeColor : "bg-slate-500"}`}
                  style={{ width: `${w * 1.8}px` }}
                />
              ))}
            </div>

            <div className={`text-sm font-extrabold ${themeConfig.accentText} tracking-widest uppercase font-mono`}>
              {displayHub !== "SILO_PENDING" ? `AN-SYS-${displayHub}-2026` : "CORE_NODE_INDEX_LOCKED"}
            </div>
          </div>

          {/* Security Mandate Section */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-[10px] text-slate-200 leading-relaxed z-10">
            <div className="text-white font-bold mb-1 uppercase tracking-wider">
              CRYPTOGRAPHIC SECURITY MANDATE:
            </div>
            This spatial credential is bound to the verified local private key layer. Any memory modification triggers immediate network revocation.
          </div>

          {/* Bottom Section */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-slate-300 z-10">
            <span className={`flex items-center gap-2 ${themeConfig.accentText} font-bold`}>
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>AUTHENTICATED BY ANIMUSLAB</span>
            </span>
            <span className="font-bold text-slate-300 uppercase tracking-wider">BACK SIDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
