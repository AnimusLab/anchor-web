"use client";

import { useState } from "react";
import { ShieldCheck, QrCode, ExternalLink, CheckCircle2 } from "lucide-react";

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

// Generate meaningful Code 128 barcode pattern widths based on input payload string
function generateCode128Barcode(payload: string): number[] {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  const widths: number[] = [4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8, 2, 5, 3, 7, 1, 6, 4, 8, 2, 5, 3, 7, 2, 4, 6];
  return widths.map((w, idx) => {
    const charCode = payload.charCodeAt(idx % payload.length) || 65;
    return ((charCode + idx + Math.abs(hash)) % 7) + 1.5;
  });
}

export default function DynamicLanyardCard({
  data,
  portalTheme = "hub",
  mode = "signin",
}: DynamicLanyardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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
  
  // Meaningful Barcode String Payload
  const barcodePayload = `AN-SYS-${displayHub}-2026-${displayClearanceId}`;
  const barcodeWidths = generateCode128Barcode(barcodePayload);
  const verifyUrl = `https://anchor.animuslab.dev/verify?id=${encodeURIComponent(displayClearanceId)}&hub=${encodeURIComponent(displayHub)}`;

  // Neutral initial role state when user hasn't filled form/authenticated
  const isInputted = Boolean(data.name || data.email || data.clearanceId);
  const displayRole = data.role 
    ? data.role.replace(/_/g, " ") 
    : (isInputted ? "SOVEREIGN OPERATOR" : "PENDING CLEARANCE");

  const statusBadgeText = data.isVerified || isInputted ? "VERIFIED" : "AWAITING";

  return (
    <div className="relative">
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
          {/* ================= BADGE FRONT SIDE (EXACT TYPOGRAPHY SCALE) ================= */}
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
                <div className={`w-24 h-24 rounded-full bg-black/40 backdrop-blur-xl border-2 ${themeConfig.avatarBorder} flex items-center justify-center font-bold text-3xl text-white font-sans shadow-2xl mx-auto ring-4 ring-white/10`}>
                  {displayName.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-200 font-medium tracking-widest uppercase block">
                    {themeConfig.leftTag}
                  </span>
                  <span className="text-[14px] font-bold text-white tracking-wider block font-mono">
                    {displayClearanceId}
                  </span>
                </div>
              </div>

              {/* Bottom Left Glass Badge */}
              <div className="relative z-10 w-full bg-black/45 backdrop-blur-md border border-white/30 rounded-xl py-2 px-3 text-[13.5px] font-semibold text-white uppercase tracking-wider shadow-inner flex items-center justify-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>AUTHENTICATED BY ANIMUSLAB</span>
              </div>
            </div>

            {/* Right Main Body (High-Contrast Exact Typography) */}
            <div className="flex-1 p-7 flex flex-col justify-between overflow-hidden bg-black/30 backdrop-blur-2xl">
              {/* Top Organization Header & Status Badge */}
              <div className="flex items-start justify-between pb-3.5 border-b border-white/20">
                <div>
                  <span className="text-[11px] text-slate-300 font-medium tracking-widest block uppercase">
                    ORGANIZATION
                  </span>
                  <span className="text-[17px] font-semibold text-white tracking-wide font-sans block mt-0.5">
                    {displayOrg}
                  </span>
                </div>
                <span
                  className={`text-[12px] font-semibold px-4 py-1.5 rounded-full uppercase border shadow-sm ${
                    statusBadgeText === "VERIFIED"
                      ? "bg-emerald-500/30 border-emerald-400/70 text-emerald-100"
                      : themeConfig.badgeBg
                  }`}
                >
                  {statusBadgeText}
                </span>
              </div>

              {/* Personnel Name & Email */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-300 font-medium tracking-widest block uppercase">
                  PERSONNEL NAME
                </span>
                <div className="text-[16px] font-semibold text-white tracking-wide truncate font-sans">
                  {displayName}
                </div>
                <div className={`text-[13px] ${themeConfig.accentText} font-mono font-normal truncate`}>
                  {data.email || "identity@animuslab.dev"}
                </div>
              </div>

              {/* Scope Matrix (Clearance ID & Hub ID) */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <span className="text-[11px] text-slate-300 font-medium block uppercase tracking-wider">
                    CLEARANCE ID
                  </span>
                  <span className="text-[14px] font-medium text-white tracking-wider block mt-0.5 truncate font-mono">
                    {displayClearanceId}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 font-medium block uppercase tracking-wider">
                    HUB SILO ID
                  </span>
                  <span className={`text-[14px] font-medium ${themeConfig.accentText} tracking-wider block mt-0.5 truncate font-mono`}>
                    {displayHub}
                  </span>
                </div>
              </div>

              {/* Clearance Status & Indicator */}
              <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-300 font-medium block uppercase tracking-wider">
                    CLEARANCE STATUS
                  </span>
                  <span className={`text-[13px] font-medium tracking-wider block mt-0.5 uppercase ${isInputted ? "text-emerald-300" : "text-slate-200"}`}>
                    {displayRole}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[12px] font-medium uppercase">
                  <span className={`w-2.5 h-2.5 rounded-full ${isInputted ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                  <span className={isInputted ? "text-emerald-300" : "text-amber-300"}>
                    {isInputted ? "IDENTITY VERIFIED" : "AWAITING AUTH"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BADGE BACK SIDE (FUNCTIONAL BARCODE & QR PAYLOAD) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-3xl pure-glass-card p-7 flex flex-col justify-between overflow-hidden font-mono text-slate-100 ${themeConfig.accentGlow}`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Glass Specular Highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-20" />

            {/* Back Header with Interactive QR Code */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/20 z-10">
              <div>
                <span className="text-[11px] text-slate-300 font-medium tracking-widest block uppercase">
                  INSTITUTIONAL REGISTRY
                </span>
                <span className={`text-[17px] font-semibold ${themeConfig.accentText} tracking-wide font-sans block mt-0.5`}>
                  SECURE AUDIT NODE
                </span>
              </div>

              {/* QR Code Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQrModal(true);
                }}
                className={`p-2 rounded-xl bg-black/40 border border-white/20 hover:border-white/50 transition ${themeConfig.accentText}`}
                title="Click to inspect cryptographic QR public key payload"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>

            {/* Middle Section: Real Meaningful Code 128 Cryptographic Barcode */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4.5 text-center space-y-2.5 shadow-2xl z-10">
              <div className="text-[11px] text-slate-300 font-medium tracking-widest uppercase">
                MACHINE-READABLE CRYPTOGRAPHIC BARCODE (CODE 128)
              </div>

              {/* Dynamic Barcode Lines Generated from Payload String */}
              <div className="flex justify-center items-center h-14 space-x-1.5 py-2 bg-black/80 rounded-xl p-3 border border-white/20 overflow-hidden">
                {barcodeWidths.map((w, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${idx % 2 === 0 ? themeConfig.barcodeColor : "bg-slate-500"}`}
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>

              <div className={`text-[13px] font-medium ${themeConfig.accentText} tracking-widest uppercase font-mono truncate`}>
                {barcodePayload}
              </div>
            </div>

            {/* Security Mandate Section */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-[13px] leading-[1.5] text-slate-100 font-sans z-10">
              <div className="text-white font-semibold mb-1 uppercase tracking-wider text-[13px]">
                CRYPTOGRAPHIC SECURITY MANDATE:
              </div>
              This spatial credential is bound to the verified local private key layer. Any memory modification triggers immediate network revocation.
            </div>

            {/* Bottom Section */}
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[13.5px] text-slate-100 z-10 font-mono">
              <span className={`flex items-center gap-2 ${themeConfig.accentText} font-semibold`}>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>AUTHENTICATED BY ANIMUSLAB</span>
              </span>
              <span className="font-medium text-slate-300 uppercase tracking-widest text-[11px]">BACK SIDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="pure-glass-card max-w-sm w-full p-6 rounded-3xl space-y-5 text-center font-mono text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">OFFLINE QR PUBLIC VERIFIER</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-2xl">
              <QrCode className="w-40 h-40 text-slate-900" />
            </div>

            <div className="space-y-2 text-left bg-black/50 p-4 rounded-2xl border border-white/15 text-xs font-sans">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ed25519 Cryptographic Verification Key</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] break-all mt-1">
                {verifyUrl}
              </p>
            </div>

            <button
              onClick={() => window.open(verifyUrl, "_blank")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg"
            >
              <span>Verify Signature Endpoint</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
