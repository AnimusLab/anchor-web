"use client";

import { useState } from "react";
import { ShieldCheck, QrCode, Lock } from "lucide-react";

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
      badgeText: "text-indigo-400",
      headerTitle: "ORGANIZATION CLEARANCE",
      defaultOrg: "ANIMUSLAB MESH",
      defaultRole: "SOVEREIGN OPERATOR",
    },
    oversight: {
      accentColor: "#F59E0B",
      badgeText: "text-amber-400",
      headerTitle: "REGULATORY CREDENTIAL",
      defaultOrg: "STATUTORY AGENCY",
      defaultRole: "STATUTORY OFFICER",
    },
    admin: {
      accentColor: "#F43F5E",
      badgeText: "text-rose-400",
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
        {/* ================= BADGE FRONT SIDE (NEOMORPHISM DESIGN) ================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#0e1726] p-6 flex flex-col justify-between overflow-hidden font-mono text-xs text-slate-100"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: "14px 14px 28px #060a11, -14px -14px 28px #16243b",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">
                {themeConfig.headerTitle}
              </span>
              <span className="text-xs font-black text-slate-100 tracking-wider font-sans">
                {displayOrg}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase ${themeConfig.badgeText} bg-[#0e1726]`}
              style={{ boxShadow: "inset 2px 2px 4px #060a11, inset -2px -2px 4px #16243b" }}
            >
              {data.isVerified ? "VERIFIED" : "AWAITING"}
            </span>
          </div>

          {/* Personnel Identity Center Block (Inset Molded Neomorphism) */}
          <div
            className="bg-[#0e1726] rounded-2xl p-4 flex items-center gap-4"
            style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
          >
            <div
              className="w-12 h-12 rounded-xl bg-[#0e1726] flex items-center justify-center font-black text-sm text-sky-400 font-sans flex-shrink-0"
              style={{ boxShadow: "4px 4px 8px #060a11, -4px -4px 8px #16243b" }}
            >
              {displayName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                Personnel Identity
              </span>
              <div className="text-xs font-bold text-slate-100 tracking-wide truncate font-sans">
                {displayName}
              </div>
              <div className="text-[10px] text-sky-400 font-mono truncate mt-0.5">
                {data.email || "identity@animuslab.dev"}
              </div>
            </div>
          </div>

          {/* Scope Matrix Identification Block (Inset Neomorphism) */}
          <div
            className="grid grid-cols-2 gap-4 bg-[#0e1726] rounded-2xl p-4 text-left"
            style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
          >
            <div>
              <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance ID
              </span>
              <span className="text-[11px] font-bold text-slate-100 tracking-wider block mt-0.5 truncate">
                {displayClearanceId}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                Hub Silo ID
              </span>
              <span className="text-[11px] font-bold text-sky-400 tracking-wider block mt-0.5 truncate">
                {displayHub}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-800/60">
              <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                Clearance Status
              </span>
              <span className="text-[11px] font-bold text-emerald-400 tracking-widest block mt-0.5 uppercase">
                {displayRole}
              </span>
            </div>
          </div>

          {/* Bottom Cryptographic Fingerprint Footer */}
          <div className="space-y-2">
            <div
              className="bg-[#0e1726] rounded-xl p-2.5 text-[9px] font-bold text-slate-300 break-all tracking-tight select-all"
              style={{ boxShadow: "inset 3px 3px 6px #060a11, inset -3px -3px 6px #16243b" }}
            >
              KEY_FP: {displayFingerprint}
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Click to Flip Badge →
              </span>
              <span className="font-bold text-slate-400">NEO V6</span>
            </div>
          </div>
        </div>

        {/* ================= BADGE BACK SIDE (NORMAL BARCODE & SEAL) ================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#0e1726] p-6 flex flex-col justify-between overflow-hidden font-mono text-xs text-slate-100"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "14px 14px 28px #060a11, -14px -14px 28px #16243b",
          }}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">
                INSTITUTIONAL VERIFICATION REGISTRY
              </span>
              <span className="text-xs font-black text-amber-400 tracking-wider font-sans">
                SECURE AUDIT NODE REPOSITORY
              </span>
            </div>
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>

          {/* Machine-Readable Cryptographic Barcode Area */}
          <div
            className="bg-[#0e1726] rounded-2xl p-5 text-center space-y-3"
            style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
          >
            <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
              MACHINE-READABLE CRYPTOGRAPHIC BARCODE
            </div>

            {/* High-Density Security Matrix Code Bars */}
            <div className="flex justify-center items-center h-14 space-x-1 py-1.5 bg-[#080d16] rounded-xl p-2.5">
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
          <div
            className="bg-[#0e1726] rounded-2xl p-3.5 text-[9px] text-slate-400 leading-relaxed"
            style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
          >
            <div className="text-slate-200 font-bold mb-1 uppercase tracking-wider">
              Cryptographic Security Mandate:
            </div>
            This physical session credential is bound to the verified local private key layer. Any memory modification triggers immediate network revocation.
          </div>

          {/* Footer Seal */}
          <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80">
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
