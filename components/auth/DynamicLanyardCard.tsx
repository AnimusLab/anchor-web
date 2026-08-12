"use client";

import { useState } from "react";
import { ShieldCheck, Key, Lock, CheckCircle2, AlertCircle, QrCode, RefreshCw } from "lucide-react";

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

  const themeConfig = {
    hub: {
      accentColor: "#6366F1",
      badgeText: "text-[#6366f1]",
      badgeBg: "bg-[#6366f1]/10 border-[#6366f1]/20",
      cardBorder: data.isVerified ? "border-[#6366f1]/60 shadow-[0_0_40px_rgba(99,102,241,0.3)]" : "border-white/15",
      headerTitle: "ORGANIZATION CLEARANCE",
      defaultOrg: "ANIMUSLAB MESH",
      defaultRole: "SOVEREIGN OPERATOR",
    },
    oversight: {
      accentColor: "#F59E0B",
      badgeText: "text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/30",
      cardBorder: data.isVerified ? "border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.3)]" : "border-white/15",
      headerTitle: "REGULATORY CREDENTIAL",
      defaultOrg: "STATUTORY AGENCY",
      defaultRole: "STATUTORY OFFICER",
    },
    admin: {
      accentColor: "#F43F5E",
      badgeText: "text-rose-400",
      badgeBg: "bg-rose-500/10 border-rose-500/30",
      cardBorder: data.isVerified ? "border-rose-400/60 shadow-[0_0_40px_rgba(244,63,94,0.3)]" : "border-white/15",
      headerTitle: "ROOT CONTROL PLANE",
      defaultOrg: "ANIMUSLAB INFRA",
      defaultRole: "ROOT OPERATOR",
    },
  }[portalTheme];

  const displayName = data.name || (data.email ? data.email.split("@")[0].toUpperCase() : "PERSONNEL NAME");
  const displayOrg = data.orgName || themeConfig.defaultOrg;
  const displayHub = data.hubId ? data.hubId.toUpperCase() : "SILO_PENDING";
  const displayClearanceId = data.clearanceId || "ID_PENDING";
  const displayRole = data.role ? data.role.replace(/_/g, " ") : themeConfig.defaultRole;
  const displayFingerprint = data.fingerprint || "ED25519: UNVERIFIED KEYS HANDSHAKE";

  return (
    <div
      className="w-full max-w-[380px] h-[480px] relative z-10 cursor-pointer select-none group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="w-full h-full relative transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ================= BADGE FRONT SIDE ================= */}
        <div
          className={`absolute inset-0 w-full h-full border ${themeConfig.cardBorder} bg-[#0A0D14]/85 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden font-mono text-xs`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Ambient Liquid Specular Top Highlight Link */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Front Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[9px] text-[#6C7293] font-bold tracking-widest block uppercase">
                {themeConfig.headerTitle}
              </span>
              <span className="text-xs font-black text-white tracking-wider font-sans">
                {displayOrg}
              </span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${themeConfig.badgeBg} ${themeConfig.badgeText}`}>
              {data.isVerified ? "VERIFIED" : "AWAITING"}
            </span>
          </div>

          {/* Personnel Identity Center Block (#030712 High Contrast Backing) */}
          <div className="bg-[#030712] border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-[#1A1D26] border border-white/15 flex items-center justify-center font-black text-sm text-[#6366f1] uppercase font-sans flex-shrink-0">
              {displayName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-[9px] text-[#6C7293] font-bold block uppercase tracking-wider">
                Personnel Identity
              </span>
              <div className="text-xs font-bold text-white tracking-wide truncate font-sans">
                {displayName}
              </div>
              <div className="text-[10px] text-sky-400 font-bold truncate mt-0.5">
                {data.email || "identity@animuslab.dev"}
              </div>
            </div>
          </div>

          {/* Scope Matrix Identification Block */}
          <div className="grid grid-cols-2 gap-4 bg-[#030712] border border-white/10 rounded-xl p-4 text-left">
            <div>
              <span className="text-[9px] text-[#6C7293] font-bold block tracking-wider uppercase">
                Clearance ID
              </span>
              <span className="text-[11px] font-bold text-white tracking-wider block mt-0.5 truncate">
                {displayClearanceId}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C7293] font-bold block tracking-wider uppercase">
                Hub Silo ID
              </span>
              <span className="text-[11px] font-bold text-sky-400 tracking-wider block mt-0.5 truncate">
                {displayHub}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-white/10">
              <span className="text-[9px] text-[#6C7293] font-bold block tracking-wider uppercase">
                Clearance Status
              </span>
              <span className="text-[11px] font-bold text-[#10b981] tracking-widest block mt-0.5 uppercase">
                {displayRole}
              </span>
            </div>
          </div>

          {/* Bottom Cryptographic Fingerprint Footer */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="bg-[#030712] border border-white/10 rounded p-2 text-[9px] font-bold text-slate-300 break-all tracking-tight select-all">
              KEY_FP: {displayFingerprint}
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#6C7293]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                Click to Flip Badge →
              </span>
              <span className="font-bold text-slate-400">ANIMUS V6.0</span>
            </div>
          </div>
        </div>

        {/* ================= BADGE BACK SIDE ================= */}
        <div
          className={`absolute inset-0 w-full h-full border ${themeConfig.cardBorder} bg-[#0A0D14]/95 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden font-mono text-xs`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[9px] text-[#6C7293] font-bold tracking-widest block uppercase">
                INSTITUTIONAL VERIFICATION REGISTRY
              </span>
              <span className="text-xs font-black text-amber-400 tracking-wider">
                SECURE AUDIT NODE REPOSITORY
              </span>
            </div>
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>

          {/* Machine-Readable Cryptographic Barcode Area */}
          <div className="bg-[#030712] border border-white/10 rounded-xl p-5 text-center space-y-3 shadow-inner">
            <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
              MACHINE-READABLE CRYPTOGRAPHIC BARCODE
            </div>

            {/* Dynamic Simulated High-Density Barcode Lines */}
            <div className="flex justify-center items-center h-12 space-x-1 py-1 bg-black/60 rounded-lg p-2 border border-white/5">
              {[4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8, 2, 5, 3, 7, 1, 6, 4, 8, 2, 5, 3, 7, 2, 4, 6].map((w, idx) => (
                <div
                  key={idx}
                  className={`h-full ${idx % 2 === 0 ? "bg-amber-400" : "bg-slate-700"}`}
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>

            <div className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              {displayHub !== "SILO_PENDING" ? `AN-SYS-${displayHub}-2026` : "CORE_NODE_INDEX_LOCKED"}
            </div>
          </div>

          {/* Legal Sign-Off Statement */}
          <div className="bg-[#030712] border border-white/10 rounded-xl p-3.5 text-[9px] text-slate-400 leading-relaxed">
            <div className="text-slate-200 font-bold mb-1 uppercase tracking-wider">
              Cryptographic Security Mandate:
            </div>
            This physical session credential is bound to the verified local private key layer. Any memory modification triggers immediate revocation.
          </div>

          {/* Footer Seal */}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[9px] text-[#6C7293]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AUTHENTICATED BY ANIMUSLAB</span>
            </span>
            <span>BACK SIDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
