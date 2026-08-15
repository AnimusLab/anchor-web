"use client";

import { useState } from "react";
import { Mail, ShieldCheck, Sparkles, User, Building, Lock, QrCode, ArrowRight, Check } from "lucide-react";

interface RoleSample {
  id: string;
  roleTitle: string;
  subtitle: string;
  themeColor: string;
  themeGradient: string;
  portalUrl: string;
  sampleName: string;
  sampleEmail: string;
  sampleClearanceId: string;
  sampleHubId: string;
}

const ROLE_SAMPLES: RoleSample[] = [
  {
    id: "admin",
    roleTitle: "ROOT PLATFORM ADMIN",
    subtitle: "⚡ ROOT SOVEREIGN AUTHORITY CONTROL PLANE",
    themeColor: "#a855f7",
    themeGradient: "from-purple-600 to-indigo-600",
    portalUrl: "https://admin.animuslab.dev/admin/login",
    sampleName: "Tan (Root Admin)",
    sampleEmail: "tan@animuslab.dev",
    sampleClearanceId: "AN-ADMIN-TAN",
    sampleHubId: "animuslab-hq",
  },
  {
    id: "manager",
    roleTitle: "HUB MANAGER (ENTERPRISE ADMIN)",
    subtitle: "🏢 ENTERPRISE HUB MANAGEMENT CLEARANCE",
    themeColor: "#38bdf8",
    themeGradient: "from-sky-500 to-blue-600",
    portalUrl: "https://hub.animuslab.dev/login",
    sampleName: "Sarah Connor (Hub Manager)",
    sampleEmail: "s.connor@acme-corp.com",
    sampleClearanceId: "CLR-ACME-9481",
    sampleHubId: "acme-london-01",
  },
  {
    id: "lead",
    roleTitle: "PROJECT LEAD (CHIEF ARCHITECT)",
    subtitle: "⚡ ARCHITECTURE & REPOSITORY LEAD CLEARANCE",
    themeColor: "#2dd4bf",
    themeGradient: "from-teal-500 to-emerald-600",
    portalUrl: "https://hub.animuslab.dev/login",
    sampleName: "Dr. Aris Thorne (Chief Lead)",
    sampleEmail: "aris.thorne@nexus-ai.io",
    sampleClearanceId: "CLR-NEXUS-1029",
    sampleHubId: "nexus-singapore-01",
  },
  {
    id: "dev",
    roleTitle: "AI AGENT DEVELOPER",
    subtitle: "💻 ENGINEERING & AGENT DEVELOPER CLEARANCE",
    themeColor: "#60a5fa",
    themeGradient: "from-blue-500 to-cyan-500",
    portalUrl: "https://hub.animuslab.dev/login",
    sampleName: "Alex Mercer (Senior Dev)",
    sampleEmail: "alex.m@citi.com",
    sampleClearanceId: "CLR-CITI-4491",
    sampleHubId: "citi-london-01",
  },
  {
    id: "reg_auditor",
    roleTitle: "STATUTORY REGULATORY AUDITOR",
    subtitle: "🏛️ STATUTORY REGULATORY OVERSIGHT (RBI / SEC / EU)",
    themeColor: "#fbbf24",
    themeGradient: "from-amber-500 to-orange-600",
    portalUrl: "https://oversight.animuslab.dev/oversight/login",
    sampleName: "Inspector Vance (SEC Compliance)",
    sampleEmail: "auditor.vance@sec.gov",
    sampleClearanceId: "AUD-SEC-US-009",
    sampleHubId: "sec-sovereign-node",
  },
  {
    id: "cross_auditor",
    roleTitle: "CROSS-HUB COMPLIANCE AUDITOR",
    subtitle: "🌐 CROSS-SILO MULTI-TENANT INSPECTOR",
    themeColor: "#c084fc",
    themeGradient: "from-fuchsia-500 to-purple-600",
    portalUrl: "https://oversight.animuslab.dev/oversight/login",
    sampleName: "Elena Rostova (Global Inspector)",
    sampleEmail: "elena@finos-audit.org",
    sampleClearanceId: "AUD-CROSS-8810",
    sampleHubId: "multi-tenant-mesh",
  },
  {
    id: "std_auditor",
    roleTitle: "STANDARD HUB AUDITOR",
    subtitle: "🛡️ SINGLE-SILO AUDIT CLEARANCE",
    themeColor: "#94a3b8",
    themeGradient: "from-slate-500 to-gray-600",
    portalUrl: "https://oversight.animuslab.dev/oversight/login",
    sampleName: "Marcus Brody (Audit Officer)",
    sampleEmail: "marcus.brody@jpmc.com",
    sampleClearanceId: "AUD-STD-3391",
    sampleHubId: "jpmc-ny-01",
  },
];

export default function EmailSampleGalleryPage() {
  const [selectedRole, setSelectedRole] = useState<RoleSample>(ROLE_SAMPLES[0]);
  const [sampleSecret] = useState("JBSWY3DPEHPK3PXP");

  const qrUri = `otpauth://totp/AnimusLab:${encodeURIComponent(selectedRole.sampleEmail)}?secret=${sampleSecret}&issuer=AnimusLab`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`;

  return (
    <div className="min-h-screen bg-[#04060c] text-white font-mono p-6 md:p-12 space-y-8">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center space-x-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>ANIMUSLAB EMAIL DESIGN SYSTEM</span>
          </div>
          <h1 className="text-3xl font-black font-sans tracking-tight text-slate-100 mt-1">
            Role-Based Welcome Email Templates (7 Roles)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Interactive local preview gallery featuring 2FA TOTP QR codes, manual setup keys, and role-specific color grading.
          </p>
        </div>

        <div className="glass-badge px-4 py-2 text-xs font-bold text-emerald-400 border-emerald-400/40 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>RESEND API VERIFIED & COMPATIBLE</span>
        </div>
      </div>

      {/* Role Picker Buttons */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-2.5">
        {ROLE_SAMPLES.map((r) => {
          const isSelected = r.id === selectedRole.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-2 border cursor-pointer ${
                isSelected
                  ? "bg-white/15 text-white border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-black/40 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.themeColor }}></span>
              <span>{r.roleTitle.split("(")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Container */}
      <div className="max-w-3xl mx-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.8)] space-y-8 font-sans">
        {/* Email Header */}
        <div>
          <div
            className="text-[11px] font-mono font-extrabold uppercase tracking-widest mb-2"
            style={{ color: selectedRole.themeColor }}
          >
            {selectedRole.subtitle}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sovereign Credentials Issued
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Hello <strong className="text-slate-200">{selectedRole.sampleName}</strong>, your institutional clearance keys have been generated and cryptographically bound to your corporate email.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="space-y-3 font-mono">
          <div className="bg-[#04060c] p-4 rounded-2xl border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CLEARANCE ID TOKEN</div>
              <div className="text-base font-bold mt-0.5" style={{ color: selectedRole.themeColor }}>
                {selectedRole.sampleClearanceId}
              </div>
            </div>
            <ShieldCheck className="w-6 h-6" style={{ color: selectedRole.themeColor }} />
          </div>

          <div className="bg-[#04060c] p-4 rounded-2xl border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CANONICAL HUB SILO ID</div>
              <div className="text-base font-bold text-white mt-0.5 font-mono">
                {selectedRole.sampleHubId}
              </div>
            </div>
            <Building className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-[#04060c] p-4 rounded-2xl border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ASSIGNED ROLE CLEARANCE</div>
              <div className="text-base font-bold mt-0.5" style={{ color: selectedRole.themeColor }}>
                {selectedRole.roleTitle}
              </div>
            </div>
            <User className="w-6 h-6" style={{ color: selectedRole.themeColor }} />
          </div>
        </div>

        {/* 2FA TOTP Authenticator Box */}
        <div className="bg-[#04060c] border border-white/15 rounded-2xl p-6 text-center space-y-4 font-mono">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-slate-200 tracking-wider uppercase">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>🔐 AUTHENTICATOR 2FA ENFORCEMENT SETUP</span>
          </div>
          <p className="text-xs text-slate-400">
            Scan this QR code with Google Authenticator, 1Password, or Authy:
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl inline-block shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            <img
              src={qrCodeUrl}
              alt="TOTP QR Code"
              width={180}
              height={180}
              className="rounded-lg block"
            />
          </div>

          <p className="text-xs text-slate-400 pt-2">
            Or enter the manual setup key into your authenticator app:
          </p>
          <div
            className="bg-white/5 border border-dashed border-white/20 rounded-xl py-3 px-4 text-lg font-bold tracking-widest font-mono text-center"
            style={{ color: selectedRole.themeColor }}
          >
            {sampleSecret}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <a
            href={selectedRole.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-4 rounded-2xl text-center font-mono font-black text-sm uppercase tracking-wider text-white shadow-2xl flex items-center justify-center space-x-2 transition bg-gradient-to-r ${selectedRole.themeGradient}`}
          >
            <span>AUTHENTICATE CONTROL PLANE →</span>
          </a>
        </div>

        {/* Email Footer */}
        <div className="text-center font-mono text-[10px] text-slate-500 pt-4 border-t border-white/10">
          CRYPTOGRAPHIC SECURITY MANDATE · ANIMUSLAB SOVEREIGN RELAY<br />
          Signed &amp; Logged by AnimusLab Infrastructure Council
        </div>
      </div>
    </div>
  );
}
