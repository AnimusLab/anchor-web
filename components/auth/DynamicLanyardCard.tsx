"use client";

import { Shield, ShieldCheck, Key, Lock, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";

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
  // Theme Color Configurations
  const themeConfig = {
    hub: {
      accentColor: "#00F2FE",
      accentBg: "from-cyan-500 to-blue-600",
      badgeText: "text-cyan-400",
      badgeBg: "bg-cyan-500/10 border-cyan-500/30",
      lanyardLine: "bg-gradient-to-b from-cyan-400 to-sky-600 shadow-[0_0_12px_rgba(0,242,254,0.5)]",
      cardBorder: data.isVerified ? "border-cyan-400/60 shadow-[0_0_30px_rgba(0,242,254,0.25)]" : "border-white/10",
      headerTitle: "ORGANIZATION CLEARANCE",
      defaultOrg: "ANIMUSLAB MESH",
      defaultRole: "SOVEREIGN USER",
    },
    oversight: {
      accentColor: "#F59E0B",
      accentBg: "from-amber-500 to-yellow-600",
      badgeText: "text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/30",
      lanyardLine: "bg-gradient-to-b from-amber-400 to-emerald-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
      cardBorder: data.isVerified ? "border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.25)]" : "border-white/10",
      headerTitle: "REGULATORY CREDENTIAL",
      defaultOrg: "STATUTORY AGENCY",
      defaultRole: "OVERSIGHT OFFICER",
    },
    admin: {
      accentColor: "#F43F5E",
      accentBg: "from-rose-500 to-purple-600",
      badgeText: "text-rose-400",
      badgeBg: "bg-rose-500/10 border-rose-500/30",
      lanyardLine: "bg-gradient-to-b from-rose-500 to-violet-600 shadow-[0_0_12px_rgba(244,63,94,0.5)]",
      cardBorder: data.isVerified ? "border-rose-400/60 shadow-[0_0_30px_rgba(244,63,94,0.25)]" : "border-white/10",
      headerTitle: "ROOT CONTROL PLANE",
      defaultOrg: "ANIMUSLAB INFRA",
      defaultRole: "MASTER NODE OPERATOR",
    },
  }[portalTheme];

  const displayName = data.name || (data.email ? data.email.split("@")[0].toUpperCase() : "PERSONNEL NAME");
  const displayOrg = data.orgName || themeConfig.defaultOrg;
  const displayHub = data.hubId || "HUB_PENDING";
  const displayClearanceId = data.clearanceId || "ID_PENDING";
  const displayRole = data.role ? data.role.replace(/_/g, " ") : themeConfig.defaultRole;
  const displayFingerprint = data.fingerprint || "ED25519: UNVERIFIED KEY HASH";

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Hanging Top Lanyard Cord with Metallic Clasp */}
      <div className={`w-1.5 h-28 md:h-36 ${themeConfig.lanyardLine} transition-all duration-500 relative`}>
        {/* Metallic Clasp Clip at Card Joint */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-md bg-gradient-to-b from-slate-300 via-slate-500 to-slate-800 border border-slate-200/50 shadow-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/40" />
        </div>
      </div>

      {/* Lanyard ID Card Body */}
      <div
        className={`w-[320px] sm:w-[380px] rounded-3xl bg-[#090d1a]/95 backdrop-blur-xl border ${themeConfig.cardBorder} p-6 shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden font-mono text-xs mt-3`}
      >
        {/* Ambient Holographic Background Grid Glow */}
        <div className="absolute inset-0 bg-[radial-[#0f172a]_1px,transparent_1px] [background-size:12px_12px] opacity-30 pointer-events-none" />
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${themeConfig.accentBg} opacity-15 blur-3xl pointer-events-none`} />

        {/* Card Header & Security Badge */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4 relative z-10">
          <div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-bold">
              {themeConfig.headerTitle}
            </div>
            <div className="text-sm font-bold text-slate-100 font-sans tracking-tight mt-0.5">
              {displayOrg}
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              data.isVerified
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : themeConfig.badgeBg + " " + themeConfig.badgeText
            } flex items-center space-x-1`}
          >
            {data.isVerified ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>VERIFIED</span>
              </>
            ) : mode === "onboard" ? (
              <>
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>NEW STAGING</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>PENDING</span>
              </>
            )}
          </div>
        </div>

        {/* Card Content Layout */}
        <div className="py-5 space-y-4 relative z-10">
          {/* Personnel Avatar & Identity Block */}
          <div className="flex items-center space-x-4">
            {/* Avatar Badge Container */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/15 flex items-center justify-center flex-shrink-0 shadow-inner relative">
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-base text-slate-200 uppercase font-sans">
                {displayName.substring(0, 2)}
              </div>
              {data.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090d1a] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
                </div>
              )}
            </div>

            <div className="space-y-1 overflow-hidden">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">PERSONNEL NAME</div>
              <div className="text-sm font-bold text-slate-100 truncate font-sans tracking-tight">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-400 truncate font-mono">
                {data.email || "awaiting.identity@animuslab.dev"}
              </div>
            </div>
          </div>

          {/* Key Identifiers Grid */}
          <div className="grid grid-cols-2 gap-3 glass-card-inset p-3.5 rounded-xl border border-white/5 bg-[#050811]/70">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">CLEARANCE ID</div>
              <div className="text-xs font-bold text-slate-200 font-mono mt-0.5 truncate">
                {displayClearanceId}
              </div>
            </div>

            <div>
              <div className="text-[9px] text-slate-500 uppercase">HUB SILO ID</div>
              <div className="text-xs font-bold text-sky-400 font-mono mt-0.5 truncate">
                {displayHub}
              </div>
            </div>

            <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
              <div className="text-[9px] text-slate-500 uppercase">CLEARANCE LEVEL</div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5 uppercase tracking-wide">
                {displayRole}
              </div>
            </div>
          </div>

          {/* Cryptographic Key Fingerprint Bar */}
          <div className="glass-card-inset p-2.5 rounded-xl border border-white/5 bg-[#03050c]/90 flex items-center justify-between text-[10px]">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Key className={`w-3.5 h-3.5 flex-shrink-0 ${data.isVerified ? "text-emerald-400" : "text-slate-500"}`} />
              <span className="text-slate-400 truncate font-mono tracking-tighter">
                {displayFingerprint}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Status Bar */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 relative z-10">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                data.isVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{data.statusText || (data.isVerified ? "IDENTITY VERIFIED // ACTIVE" : "AWAITING IDENTIFICATION")}</span>
          </div>

          <span className="text-[9px] text-slate-600 font-mono">ANIMUS V6.0</span>
        </div>
      </div>
    </div>
  );
}
