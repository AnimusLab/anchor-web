"use client";

import { useState } from "react";
import { Sparkles, Sliders, Layers, ShieldCheck, QrCode, ArrowRight } from "lucide-react";
import DynamicLanyardCard from "@/components/auth/DynamicLanyardCard";

export default function DesignSamplesPage() {
  const [testName, setTestName] = useState("Tanishq Vaswani");
  const [testEmail, setTestEmail] = useState("tan@animuslab.dev");
  const [testHub, setTestHub] = useState("animuslab");

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 p-8 space-y-12 max-w-7xl mx-auto font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-8">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-indigo-400 mb-4">
          <Layers className="w-4 h-4" />
          <span>Spatial UI (VisionOS 3D Weightless Floating) Showcase</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase font-sans">
          Spatial UI Sovereign Credential ID Cards
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-4xl">
          Multi-layered translucent floating spatial window panels with zero-gravity weightless space bobbing animations (`@keyframes zeroGravityFloat`), 3D parallax tilting, and spring-accelerated 180° flip interactions.
        </p>

        {/* Role & Recommended Color Recommendation Table */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Role-Based Spatial UI Color Hierarchy Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Recommended Color</th>
                  <th className="py-3 px-4">Label in Gallery</th>
                  <th className="py-3 px-4">Design Rationale & Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Enterprise
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans">Cobalt Spatial</td>
                  <td className="py-3 px-4 text-indigo-300 font-bold">5A. Cobalt Spatial</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Calm, professional, high-trust. Best for client-facing / institutional identity.</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Auditor
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans">Gold Spatial</td>
                  <td className="py-3 px-4 text-amber-300 font-bold">5B. Gold Spatial</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Signals oversight, verification, and authority without aggression. Strong regulatory feel.</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-bold text-rose-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Admin
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans">Crimson Spatial</td>
                  <td className="py-3 px-4 text-rose-300 font-bold">5C. Crimson Spatial</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Clear hierarchy signal. Feels like elevated control / root access.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Parameter Inputs */}
        <div className="mt-6 p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-3 font-mono text-xs max-w-3xl shadow-2xl">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Input Mirroring Test Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PERSONNEL NAME</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400 text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">CORPORATE EMAIL</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400 text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">HUB SILO ID</label>
              <input
                type="text"
                value={testHub}
                onChange={(e) => setTestHub(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400 text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spatial UI ID Cards Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-items-center">
        {/* 1. ENTERPRISE ROLE -> 5A. COBALT SPATIAL */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase">5A. COBALT SPATIAL</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Enterprise Hub Role</h2>
            <p className="text-[11px] text-slate-400 font-mono">Client-Facing & Institutional High-Trust</p>
          </div>
          <DynamicLanyardCard
            portalTheme="hub"
            data={{
              name: testName,
              email: testEmail,
              orgName: "ANIMUSLAB MESH",
              hubId: testHub,
              clearanceId: "OWN-AN-MUM-842",
              role: "SOVEREIGN OPERATOR",
              isVerified: true,
              fingerprint: "sha256:b49d424a21b4142ddb670bce34f798...",
            }}
          />
        </section>

        {/* 2. AUDITOR ROLE -> 5B. GOLD SPATIAL */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">5B. GOLD SPATIAL</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Auditor Oversight Role</h2>
            <p className="text-[11px] text-slate-400 font-mono">Statutory Authority & Regulatory Verification</p>
          </div>
          <DynamicLanyardCard
            portalTheme="oversight"
            data={{
              name: testName,
              email: testEmail,
              orgName: "STATUTORY AGENCY",
              hubId: testHub,
              clearanceId: "AUD-RBI-009",
              role: "STATUTORY OFFICER",
              isVerified: true,
              fingerprint: "ed25519:8f2a9910b42c00a188f110bc...",
            }}
          />
        </section>

        {/* 3. ADMIN ROLE -> 5C. CRIMSON SPATIAL */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase">5C. CRIMSON SPATIAL</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Root Admin Role</h2>
            <p className="text-[11px] text-slate-400 font-mono">Elevated Control & Root Access Hierarchy</p>
          </div>
          <DynamicLanyardCard
            portalTheme="admin"
            data={{
              name: testName,
              email: testEmail,
              orgName: "ANIMUSLAB INFRA",
              hubId: testHub,
              clearanceId: "ROOT-ADM-001",
              role: "ROOT OPERATOR",
              isVerified: true,
              fingerprint: "sha256:f43f5e99002a819b119280ab...",
            }}
          />
        </section>
      </div>
    </div>
  );
}
