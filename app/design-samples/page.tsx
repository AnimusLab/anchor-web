"use client";

import { useState } from "react";
import { Sparkles, Eye, Layers, Sliders, Droplet, Sun, ShieldCheck, Key, Lock, QrCode, RotateCw, Activity, Cpu } from "lucide-react";

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardKey: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 p-8 space-y-12 max-w-7xl mx-auto font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-sky-400 mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Interactive ID Card Design Paradigms Showcase</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
          Sovereign Credential ID Card Showcase
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore the AnimusLab Sovereign Identity Card rendered across 5 distinct design paradigms: Glassmorphism, Skeuomorphism, Neomorphism, Liquid Glass, and Spatial UI (VisionOS).
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 mt-6 font-mono text-xs">
          {["all", "glassmorphism", "skeuomorphism", "neomorphism", "liquid-glass", "spatial-ui"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl capitalize transition font-bold ${
                activeTab === t
                  ? "bg-gradient-to-r from-sky-400 to-blue-600 text-slate-950 shadow-lg shadow-sky-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 5 Sovereign ID Card Paradigms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ========================================================
            1. GLASSMORPHISM ID CARD
        ======================================================== */}
        {(activeTab === "all" || activeTab === "glassmorphism") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl font-bold text-slate-100 font-sans">1. Glassmorphism ID Card</h2>
              </div>
              <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30">
                Frosted Glass
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Translucent frosted glass material with backdrop blur, delicate white border strokes, colorful background orbs, and vivid status indicators.
            </p>

            {/* Glassmorphism Container Backdrop */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden flex items-center justify-center min-h-[500px] shadow-2xl">
              <div className="absolute w-56 h-56 rounded-full bg-cyan-400 blur-3xl top-4 left-4 opacity-70 animate-pulse"></div>
              <div className="absolute w-48 h-48 rounded-full bg-pink-500 blur-3xl bottom-4 right-4 opacity-60"></div>

              {/* Glassmorphism ID Card Component */}
              <div
                className="relative w-full max-w-[340px] h-[440px] cursor-pointer select-none group"
                onClick={() => toggleFlip("glass")}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["glass"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl flex flex-col justify-between overflow-hidden font-mono text-xs"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-start border-b border-white/20 pb-3">
                      <div>
                        <span className="text-[9px] text-white/70 font-bold block uppercase tracking-wider">ORGANIZATION CLEARANCE</span>
                        <span className="text-xs font-black text-white font-sans tracking-wide">ANIMUSLAB MESH</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded uppercase">
                        VERIFIED
                      </span>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md border border-white/15 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 flex-shrink-0 shadow-lg">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-sm text-cyan-300">
                          TV
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate font-sans">TANISHQ VASWANI</div>
                        <div className="text-[10px] text-cyan-200 truncate">tan@animuslab.dev</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl p-3 text-[10px]">
                      <div>
                        <span className="text-white/60 block">CLEARANCE ID</span>
                        <span className="font-bold text-white">OWN-AN-MUM-842</span>
                      </div>
                      <div>
                        <span className="text-white/60 block">HUB SILO ID</span>
                        <span className="font-bold text-cyan-300">AN-IN-SOL01</span>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-3 space-y-1 text-[9px]">
                      <div className="bg-black/40 p-2 rounded border border-white/10 text-slate-300 truncate">
                        KEY_FP: sha256:b49d424a21b414...
                      </div>
                      <div className="flex justify-between items-center text-white/70 pt-1">
                        <span>Click to Flip Card</span>
                        <span>GLASS V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-white/20 pb-3">
                      <span className="text-xs font-bold text-cyan-300 font-sans">INSTITUTIONAL SEAL</span>
                      <QrCode className="w-5 h-5 text-cyan-300" />
                    </div>

                    <div className="bg-black/50 p-4 rounded-xl border border-white/15 text-center space-y-2">
                      <div className="text-[9px] text-white/70 uppercase">AUTHENTICATION BARCODE</div>
                      <div className="flex justify-center items-center h-10 space-x-1 py-1 bg-black/80 rounded border border-white/10">
                        {[4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8].map((w, idx) => (
                          <div key={idx} className="h-full bg-cyan-400" style={{ width: `${w * 1.5}px` }} />
                        ))}
                      </div>
                      <div className="text-[10px] text-emerald-300 font-bold">AN-SYS-SOL01-2026</div>
                    </div>

                    <div className="text-[9px] text-white/70 leading-relaxed border-t border-white/20 pt-3">
                      This glassmorphic session token is cryptographically signed by AnimusLab Mesh Root Authority.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            2. SKEUOMORPHISM ID CARD
        ======================================================== */}
        {(activeTab === "all" || activeTab === "skeuomorphism") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-slate-100 font-sans">2. Skeuomorphism ID Card</h2>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                Tactile Metallic 3D
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Tactile 3D analog realism. Metallic bevels, leather textures, metallic rivet pins, glowing analog LED indicators, and engraved foil text.
            </p>

            {/* Skeuomorphism Container Backdrop */}
            <div className="p-8 rounded-3xl bg-[#14161d] border border-slate-800 flex items-center justify-center min-h-[500px] shadow-2xl">
              <div
                className="relative w-full max-w-[340px] h-[440px] cursor-pointer select-none group"
                onClick={() => toggleFlip("skeuo")}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["skeuo"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-gradient-to-b from-[#2e313a] via-[#21232b] to-[#16171d] border border-[#484d5e] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Metallic Top Clasp Pin */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 border border-slate-600 shadow-md"></div>

                    <div className="flex justify-between items-center border-b border-[#3c404f] pb-3 pt-2">
                      <div>
                        <span className="text-[9px] text-[#a0a5b5] font-bold block uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          SKEUOMORPHIC BADGE
                        </span>
                        <span className="text-xs font-black text-amber-400 font-sans tracking-wide">ANIMUSLAB HEAVY</span>
                      </div>
                      {/* Metallic LED Glow */}
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 border border-amber-800 shadow-[0_0_10px_rgba(245,158,11,0.9)]"></div>
                    </div>

                    <div className="bg-[#101217] p-4 rounded-xl border border-[#2c303c] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#3a3e4b] to-[#1c1e25] border border-[#52586a] flex items-center justify-center font-black text-sm text-amber-400 shadow-md">
                        TV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-sans">TANISHQ VASWANI</div>
                        <div className="text-[10px] text-amber-400 font-mono">tan@animuslab.dev</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-[#101217] p-3 rounded-xl border border-[#2c303c] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] text-[10px]">
                      <div>
                        <span className="text-slate-400 block">CLEARANCE ID</span>
                        <span className="font-bold text-slate-200">OWN-AN-MUM-842</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">HUB SILO ID</span>
                        <span className="font-bold text-amber-400">AN-IN-SOL01</span>
                      </div>
                    </div>

                    <div className="border-t border-[#3c404f] pt-3 space-y-1.5 text-[9px]">
                      <div className="bg-[#101217] p-2 rounded border border-[#2a2d37] text-amber-300 font-mono tracking-tighter truncate">
                        KEY_FP: ed25519:8f2a9910b42c00a1...
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Tactile Push to Flip</span>
                        <span>SKEUO V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-gradient-to-b from-[#21232b] via-[#181920] to-[#0f1015] border border-[#484d5e] shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-[#3c404f] pb-3">
                      <span className="text-xs font-bold text-amber-400 font-sans uppercase">ANALOG HARDWARE SECURITY</span>
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="bg-[#101217] p-4 rounded-xl border border-[#2c303c] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] text-center space-y-2">
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest">ANALOG ENGRAVED BARCODE</div>
                      <div className="flex justify-center items-center h-10 space-x-1 py-1 bg-[#050608] rounded border border-white/5">
                        {[5, 2, 7, 1, 6, 3, 4, 2, 8, 3, 2, 6, 4, 7].map((w, idx) => (
                          <div key={idx} className="h-full bg-amber-400" style={{ width: `${w * 1.5}px` }} />
                        ))}
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">AN-SKEUO-BARCODE-2026</div>
                    </div>

                    <div className="text-[9px] text-slate-400 leading-relaxed border-t border-[#3c404f] pt-3">
                      Tactile hardware credential engraved for high-security analog control nodes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            3. NEOMORPHISM ID CARD
        ======================================================== */}
        {(activeTab === "all" || activeTab === "neomorphism") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-100 font-sans">3. Neomorphism ID Card</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Soft Extruded UI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Soft extruded UI. The card and inner components appear to be molded directly out of the dark surface material using convex/concave drop shadows.
            </p>

            {/* Neomorphism Container Backdrop */}
            <div className="p-8 rounded-3xl bg-[#0e1726] flex items-center justify-center min-h-[500px] shadow-2xl">
              <div
                className="relative w-full max-w-[340px] h-[440px] cursor-pointer select-none group"
                onClick={() => toggleFlip("neo")}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["neo"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-[#0e1726] flex flex-col justify-between font-mono text-xs"
                    style={{
                      backfaceVisibility: "hidden",
                      boxShadow: "12px 12px 24px #060a11, -12px -12px 24px #16243b",
                    }}
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">
                          MOLDED SOVEREIGN CARD
                        </span>
                        <span className="text-xs font-black text-slate-100 font-sans">ANIMUSLAB MESH</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-[#0e1726] px-2.5 py-1 rounded-lg" style={{ boxShadow: "inset 2px 2px 4px #060a11, inset -2px -2px 4px #16243b" }}>
                        ACTIVE
                      </span>
                    </div>

                    {/* Inset Molded Profile Block */}
                    <div
                      className="p-4 rounded-2xl bg-[#0e1726] flex items-center gap-3"
                      style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl bg-[#0e1726] flex items-center justify-center font-black text-sm text-emerald-400"
                        style={{ boxShadow: "3px 3px 6px #060a11, -3px -3px 6px #16243b" }}
                      >
                        TV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-sans">TANISHQ VASWANI</div>
                        <div className="text-[10px] text-emerald-400 font-mono">tan@animuslab.dev</div>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#0e1726] text-[10px]"
                      style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
                    >
                      <div>
                        <span className="text-slate-400 block">CLEARANCE ID</span>
                        <span className="font-bold text-slate-100">OWN-AN-MUM-842</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">HUB SILO ID</span>
                        <span className="font-bold text-emerald-400">AN-IN-SOL01</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2 text-[9px]">
                      <div
                        className="p-2.5 rounded-xl bg-[#0e1726] text-slate-300 font-mono truncate"
                        style={{ boxShadow: "inset 3px 3px 6px #060a11, inset -3px -3px 6px #16243b" }}
                      >
                        KEY_FP: sha256:b49d424a21b414...
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Soft Molded Flip</span>
                        <span>NEO V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-[#0e1726] flex flex-col justify-between font-mono text-xs"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      boxShadow: "12px 12px 24px #060a11, -12px -12px 24px #16243b",
                    }}
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                      <span className="text-xs font-bold text-emerald-400 font-sans">NEOMORPHIC AUDIT SEAL</span>
                      <Cpu className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div
                      className="p-4 rounded-2xl bg-[#0e1726] text-center space-y-2"
                      style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
                    >
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest">SOFT BARCODE PATTERN</div>
                      <div className="flex justify-center items-center h-10 space-x-1 py-1 bg-[#0a101b] rounded-lg">
                        {[3, 1, 6, 2, 7, 3, 5, 2, 8, 4, 1, 6, 3, 5].map((w, idx) => (
                          <div key={idx} className="h-full bg-emerald-400" style={{ width: `${w * 1.5}px` }} />
                        ))}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">AN-NEO-MATRIX-2026</div>
                    </div>

                    <div className="text-[9px] text-slate-400 leading-relaxed pt-2">
                      Molded UI surface structure offering zero specular glare and tactile soft shadow depth.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            4. LIQUID GLASS ID CARD
        ======================================================== */}
        {(activeTab === "all" || activeTab === "liquid-glass") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplet className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-slate-100 font-sans">4. Liquid Glass ID Card</h2>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                Fluid Water Refraction
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Organic fluid glass with surface tension highlights, wet cyan/emerald fluid aura, 3D flip functionality, and refraction gloss lines.
            </p>

            {/* Liquid Glass Container Backdrop */}
            <div className="relative p-8 rounded-3xl bg-[#040914] overflow-hidden flex items-center justify-center min-h-[500px] shadow-2xl">
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 blur-3xl opacity-40 animate-pulse"></div>

              {/* Liquid Glass ID Card */}
              <div
                className="relative w-full max-w-[340px] h-[440px] cursor-pointer select-none group"
                onClick={() => toggleFlip("liquid")}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["liquid"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-cyan-950/30 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_20px_50px_rgba(6,182,212,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-center border-b border-cyan-400/20 pb-3">
                      <div>
                        <span className="text-[9px] text-cyan-300 font-bold block uppercase tracking-wider">
                          FLUID LIQUID CREDENTIAL
                        </span>
                        <span className="text-xs font-black text-white font-sans">ANIMUSLAB MESH</span>
                      </div>
                      <Droplet className="w-4 h-4 text-cyan-300 animate-bounce" />
                    </div>

                    <div className="bg-cyan-950/60 p-4 rounded-2xl border border-cyan-400/30 backdrop-blur-md flex items-center gap-3 shadow-inner">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-black text-sm text-slate-950 shadow-md">
                        TV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">TANISHQ VASWANI</div>
                        <div className="text-[10px] text-cyan-300 font-mono">tan@animuslab.dev</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-cyan-950/60 p-3 rounded-2xl border border-cyan-400/30 text-[10px]">
                      <div>
                        <span className="text-cyan-300/70 block">CLEARANCE ID</span>
                        <span className="font-bold text-white">OWN-AN-MUM-842</span>
                      </div>
                      <div>
                        <span className="text-cyan-300/70 block">HUB SILO ID</span>
                        <span className="font-bold text-cyan-300">AN-IN-SOL01</span>
                      </div>
                    </div>

                    <div className="border-t border-cyan-400/20 pt-3 space-y-1.5 text-[9px]">
                      <div className="bg-cyan-950/80 p-2 rounded-xl border border-cyan-400/30 text-cyan-200 truncate">
                        KEY_FP: sha256:b49d424a21b414...
                      </div>
                      <div className="flex justify-between items-center text-cyan-300">
                        <span>Fluid Motion Flip</span>
                        <span>LIQUID V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-cyan-950/40 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_20px_50px_rgba(6,182,212,0.3)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-cyan-400/20 pb-3">
                      <span className="text-xs font-bold text-cyan-300 font-sans">LIQUID WATER SEAL</span>
                      <ShieldCheck className="w-5 h-5 text-cyan-300" />
                    </div>

                    <div className="bg-cyan-950/70 p-4 rounded-2xl border border-cyan-400/30 text-center space-y-2">
                      <div className="text-[9px] text-cyan-300/80 uppercase tracking-widest">FLUID REFRACTION BARCODE</div>
                      <div className="flex justify-center items-center h-10 space-x-1 py-1 bg-black/60 rounded-xl">
                        {[4, 2, 7, 1, 5, 3, 6, 2, 8, 4, 2, 5, 3, 7].map((w, idx) => (
                          <div key={idx} className="h-full bg-cyan-400" style={{ width: `${w * 1.5}px` }} />
                        ))}
                      </div>
                      <div className="text-[10px] text-cyan-300 font-bold">AN-LIQUID-FLUID-2026</div>
                    </div>

                    <div className="text-[9px] text-cyan-200/80 leading-relaxed border-t border-cyan-400/20 pt-3">
                      High surface tension gloss highlights create a wet, organic liquid glass security seal.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            5. SPATIAL UI (VISIONOS) ID CARD
        ======================================================== */}
        {(activeTab === "all" || activeTab === "spatial-ui") && (
          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-slate-100 font-sans">5. Spatial UI (VisionOS) ID Card</h2>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
                VisionOS 3D Depth Layering
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              3D depth hierarchy with multi-layered floating translucent spatial window panels, active focus ring indicators, and floating background spatial nodes.
            </p>

            {/* Spatial UI Container Backdrop */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center min-h-[520px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
              <div className="absolute w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>

              {/* Background Spatial Layer 01 */}
              <div className="absolute top-10 left-10 w-72 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/40 shadow-xl opacity-50 pointer-events-none transform -rotate-3 font-mono text-[10px] text-slate-400">
                LAYER 01 // BACKGROUND SPATIAL MATRIX NODE
              </div>

              {/* Spatial UI ID Card (Foreground Layer 02) */}
              <div
                className="relative z-10 w-full max-w-[360px] h-[450px] cursor-pointer select-none group"
                onClick={() => toggleFlip("spatial")}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["spatial"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-indigo-400/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(99,102,241,0.25)] flex flex-col justify-between font-mono text-xs ring-2 ring-indigo-500/30"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[9px] text-indigo-300 font-bold block uppercase tracking-wider">
                          SPATIAL WINDOW PANEL
                        </span>
                        <span className="text-xs font-black text-white font-sans">ANIMUSLAB MESH</span>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/40 px-2.5 py-1 rounded-full">
                        Focus Active
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-black text-sm text-indigo-300 shadow-inner">
                        TV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">TANISHQ VASWANI</div>
                        <div className="text-[10px] text-indigo-300 font-mono">tan@animuslab.dev</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">CLEARANCE ID</span>
                        <span className="font-bold text-white">OWN-AN-MUM-842</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">HUB SILO ID</span>
                        <span className="font-bold text-indigo-400">AN-IN-SOL01</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-1.5 text-[9px]">
                      <div className="bg-slate-950/90 p-2.5 rounded-xl border border-indigo-500/30 text-indigo-200 truncate">
                        KEY_FP: sha256:b49d424a21b414...
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Spatial 3D Flip</span>
                        <span>VISIONOS V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-indigo-400/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col justify-between font-mono text-xs ring-2 ring-indigo-500/30"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs font-bold text-indigo-300 font-sans">SPATIAL AUDIT REPOSITORY</span>
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>

                    <div className="bg-slate-950/90 p-4 rounded-2xl border border-indigo-500/30 text-center space-y-2">
                      <div className="text-[9px] text-indigo-300 uppercase tracking-widest">3D SPATIAL MATRIX BARCODE</div>
                      <div className="flex justify-center items-center h-10 space-x-1 py-1 bg-slate-950 rounded-xl">
                        {[6, 2, 5, 1, 7, 3, 4, 2, 8, 3, 1, 6, 4, 5].map((w, idx) => (
                          <div key={idx} className="h-full bg-indigo-400" style={{ width: `${w * 1.5}px` }} />
                        ))}
                      </div>
                      <div className="text-[10px] text-indigo-300 font-bold">AN-SPATIAL-NODE-2026</div>
                    </div>

                    <div className="text-[9px] text-slate-400 leading-relaxed border-t border-white/10 pt-3">
                      Spatial UI floating depth window layer with active focal plane tracking.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
