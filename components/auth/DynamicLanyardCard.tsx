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

  // Role-Specific Theme Mapping
  const themeConfig = {
    hub: {
      accentGlow: "shadow-[0_0_50px_rgba(99,102,241,0.35)]",
      borderColor: "border-indigo-400/40",
      accentText: "text-indigo-300",
      badgeBg: "bg-indigo-500/20 border-indigo-400/50 text-indigo-300",
      headerSub: "SOVEREIGN CLEARANCE NODE",
      headerOrg: "ANIMUSLAB MESH",
      barcodeColor: "bg-indigo-400",
    },
    oversight: {
      accentGlow: "shadow-[0_0_50px_rgba(245,158,11,0.35)]",
      borderColor: "border-amber-400/40",
      accentText: "text-amber-300",
      badgeBg: "bg-amber-500/20 border-amber-400/50 text-amber-300",
      headerSub: "REGULATORY OVERSIGHT NODE",
      headerOrg: "STATUTORY AGENCY",
      barcodeColor: "bg-amber-400",
    },
    admin: {
      accentGlow: "shadow-[0_0_50px_rgba(244,63,94,0.35)]",
      borderColor: "border-rose-400/40",
      accentText: "text-rose-300",
      badgeBg: "bg-rose-500/20 border-rose-400/50 text-rose-300",
      headerSub: "ROOT CONTROL PLANE NODE",
      headerOrg: "ANIMUSLAB INFRA",
      barcodeColor: "bg-rose-500",
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
      className="w-full max-w-[420px] h-[520px] relative z-10 cursor-pointer select-none group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1200px" }}
    >
      {/* 3D Flip Container with Soft Floating Hover */}
      <div
        className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.02] group-hover:-translate-y-1.5"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ================= BADGE FRONT SIDE (CLEAN, SPACIOUS & HIGH-CONTRAST) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl backdrop-blur-2xl bg-[#090d16]/90 border-2 ${themeConfig.borderColor} p-8 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Subtle Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Official Institutional Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 z-10">
            <div>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest block uppercase font-mono">
                {themeConfig.headerSub}
              </span>
              <span className="text-base font-black text-white tracking-wider font-sans">
                {displayOrg}
              </span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                statusBadgeText === "VERIFIED"
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                  : themeConfig.badgeBg
              }`}
            >
              {statusBadgeText}
            </span>
          </div>

          {/* Personnel Identity Floating Glass Container */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex items-center gap-4.5 z-10 shadow-2xl">
            <div className={`w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/25 flex items-center justify-center font-black text-lg ${themeConfig.accentText} font-sans flex-shrink-0 shadow-inner`}>
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Personnel Identity
              </span>
              <div className="text-base font-bold text-white tracking-wide truncate font-sans">
                {displayName}
              </div>
              <div className={`text-xs ${themeConfig.accentText} font-mono truncate mt-0.5`}>
                {data.email || "identity@animuslab.dev"}
              </div>
            </div>
          </div>

          {/* Scope Matrix Floating Glass Container */}
          <div className="grid grid-cols-2 gap-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-left z-10 shadow-2xl">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance ID
              </span>
              <span className="text-sm font-extrabold text-white tracking-wider block mt-0.5 truncate font-mono">
                {displayClearanceId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Hub Silo ID
              </span>
              <span className={`text-sm font-extrabold ${themeConfig.accentText} tracking-wider block mt-0.5 truncate font-mono`}>
                {displayHub}
              </span>
            </div>
            <div className="col-span-2 pt-3 border-t border-white/15">
              <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance Status
              </span>
              <span className={`text-xs font-extrabold tracking-widest block mt-0.5 uppercase ${isInputted ? "text-emerald-400" : "text-slate-400"}`}>
                {displayRole}
              </span>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 font-mono z-10">
            <span className={`flex items-center gap-1.5 ${themeConfig.accentText} font-bold`}>
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATED BY ANIMUSLAB</span>
            </span>
          </div>
        </div>

        {/* ================= BADGE BACK SIDE (EXACT SPECIFICATION) ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl backdrop-blur-2xl bg-[#090d16]/90 border-2 ${themeConfig.borderColor} p-8 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Spatial Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
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
              <span className={`text-base font-black ${themeConfig.accentText} tracking-wider font-sans`}>
                SECURE AUDIT NODE
              </span>
            </div>
            <QrCode className={`w-6 h-6 ${themeConfig.accentText}`} />
          </div>

          {/* Middle Section: Machine-Readable Cryptographic Barcode */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-center space-y-3.5 z-10 shadow-2xl">
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

          {/* Security Mandate Section */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-[10px] text-slate-300 leading-relaxed z-10">
            <div className="text-white font-bold mb-1 uppercase tracking-wider">
              CRYPTOGRAPHIC SECURITY MANDATE:
            </div>
            This spatial credential is bound to the verified local private key layer. Any memory modification triggers immediate network revocation.
          </div>

          {/* Bottom Section */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 z-10">
            <span className={`flex items-center gap-1.5 ${themeConfig.accentText} font-bold`}>
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATED BY ANIMUSLAB</span>
            </span>
            <span className="font-bold text-slate-400 uppercase">BACK SIDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
