"use client";

import { useState } from "react";
import { Sparkles, Eye, Layers, Sliders, Droplet, Sun, ShieldCheck, QrCode, Lock } from "lucide-react";
import DynamicLanyardCard from "@/components/auth/DynamicLanyardCard";

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [testName, setTestName] = useState("Tanishq Vaswani");
  const [testEmail, setTestEmail] = useState("tan@animuslab.dev");
  const [testHub, setTestHub] = useState("animuslab");

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 p-8 space-y-12 max-w-7xl mx-auto font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400 mb-3">
          <Sliders className="w-4 h-4" />
          <span>Neomorphism Sovereign ID Card Showcase</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
          Neomorphism Sovereign Credential ID Card
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Soft molded UI crafted out of dark `#0e1726` surface using dual convex/concave drop shadows. Click the card to flip it over and inspect the <span className="text-emerald-400 font-bold">Machine-Readable Cryptographic Barcode</span> on the back side!
        </p>

        {/* Dynamic Parameter Inputs */}
        <div className="mt-6 p-5 rounded-3xl bg-[#0e1726] space-y-3 font-mono text-xs max-w-3xl" style={{ boxShadow: "10px 10px 20px #060a11, -10px -10px 20px #16243b" }}>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Input Mirroring Test Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PERSONNEL NAME</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-[#0e1726] rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none text-slate-100"
                style={{ boxShadow: "inset 3px 3px 6px #060a11, inset -3px -3px 6px #16243b" }}
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">CORPORATE EMAIL</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-[#0e1726] rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none text-slate-100"
                style={{ boxShadow: "inset 3px 3px 6px #060a11, inset -3px -3px 6px #16243b" }}
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">HUB SILO ID</label>
              <input
                type="text"
                value={testHub}
                onChange={(e) => setTestHub(e.target.value)}
                className="w-full bg-[#0e1726] rounded-xl px-3.5 py-2 text-white text-xs font-sans focus:outline-none text-slate-100"
                style={{ boxShadow: "inset 3px 3px 6px #060a11, inset -3px -3px 6px #16243b" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Neomorphism ID Card Themes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-items-center">
        {/* 1. ENTERPRISE HUB THEME */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase">ENTERPRISE HUB</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Cobalt Neomorphism</h2>
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

        {/* 2. REGULATORY OVERSIGHT THEME */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">REGULATORY OVERSIGHT</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Gold Neomorphism</h2>
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

        {/* 3. ROOT ADMIN THEME */}
        <section className="space-y-4 w-full flex flex-col items-center">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase">ROOT ADMIN</span>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Crimson Neomorphism</h2>
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
