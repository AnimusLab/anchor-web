"use client";

import { useState } from "react";
import { Sparkles, Layers, Sliders, Eye, Droplet, Sun, Volume2, Shield } from "lucide-react";

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-8 space-y-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-mono text-sky-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive UI Paradigm Showcase</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Visual Design Paradigms Showcase
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interactive HTML/Tailwind CSS examples of Glassmorphism, Skeuomorphism, Neomorphism, Liquid Glass, and Spatial UI.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 font-mono text-xs">
          {["all", "glassmorphism", "skeuomorphism", "neomorphism", "liquid-glass", "spatial-ui"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg capitalize transition font-medium ${
                activeTab === t
                  ? "bg-slate-100 text-slate-950 font-bold shadow-lg"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ========================================================
            1. GLASSMORPHISM
        ======================================================== */}
        {(activeTab === "all" || activeTab === "glassmorphism") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-slate-100">1. Glassmorphism</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translucent frosted glass over colorful vibrant backdrops with backdrop blur, delicate white border strokes, and soft drop shadows.
            </p>

            {/* Live Component */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden flex items-center justify-center min-h-[260px]">
              {/* Background ambient decorative orb */}
              <div className="absolute w-40 h-40 rounded-full bg-cyan-400 blur-2xl top-2 left-4 opacity-60"></div>
              
              {/* Glass Card */}
              <div className="relative w-full max-w-sm p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest text-white/70 uppercase">FROSTED CARD</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="text-lg font-bold text-white">Glassmorphism Widget</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Notice the background colorful blur shining through the translucent glass material with crisp white stroke borders.
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-mono">$1,420.00</span>
                  <button className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium border border-white/30 transition">
                    Glass Action
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            2. SKEUOMORPHISM
        ======================================================== */}
        {(activeTab === "all" || activeTab === "skeuomorphism") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">2. Skeuomorphism</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tactile 3D real-world realism. Metallic bevels, leather textures, glossy reflections, embossed push buttons, and realistic light sources.
            </p>

            {/* Live Component */}
            <div className="p-8 rounded-2xl bg-[#1c1d22] border border-slate-800 flex items-center justify-center min-h-[260px]">
              <div className="w-full max-w-sm p-6 rounded-xl bg-gradient-to-b from-[#2e313a] to-[#1a1c23] border border-[#404554] shadow-[0_12px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[#a0a5b5] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    ANALOG DIAL
                  </div>
                  {/* Skeuomorphic Metallic LED */}
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 border border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                </div>

                <div className="bg-[#121318] p-3 rounded-lg border border-[#2a2d37] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] font-mono text-amber-400 text-center text-lg font-bold tracking-widest">
                  88.4 MHz
                </div>

                {/* Tactile Skeuomorphic Button */}
                <button className="w-full py-3 rounded-lg bg-gradient-to-b from-[#3a3e4a] via-[#2a2d37] to-[#1f2128] border border-[#4d5363] text-slate-200 text-xs font-bold shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] active:translate-y-0.5 transition-all">
                  PUSH TACTILE BUTTON
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            3. NEOMORPHISM
        ======================================================== */}
        {(activeTab === "all" || activeTab === "neomorphism") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">3. Neomorphism</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Soft extruded UI. Cards and buttons appear to be molded directly out of the background material using dual convex/concave drop shadows.
            </p>

            {/* Live Component */}
            <div className="p-8 rounded-2xl bg-[#0e1726] flex items-center justify-center min-h-[260px]">
              <div 
                className="w-full max-w-sm p-6 rounded-2xl bg-[#0e1726] space-y-5"
                style={{
                  boxShadow: "8px 8px 16px #070c14, -8px -8px 16px #152238"
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">SOFT MOLDED WIDGET</span>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Inset Neomorphic Display */}
                <div 
                  className="p-4 rounded-xl bg-[#0e1726] text-center"
                  style={{
                    boxShadow: "inset 4px 4px 8px #070c14, inset -4px -4px 8px #152238"
                  }}
                >
                  <span className="text-2xl font-bold text-slate-100 font-mono">74%</span>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Volume Level</div>
                </div>

                {/* Neomorphic Button */}
                <button 
                  className="w-full py-3 rounded-xl bg-[#0e1726] text-xs font-bold text-slate-200 hover:text-emerald-400 transition"
                  style={{
                    boxShadow: "5px 5px 10px #070c14, -5px -5px 10px #152238"
                  }}
                >
                  NEOMORPHIC SWITCH
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            4. LIQUID GLASS
        ======================================================== */}
        {(activeTab === "all" || activeTab === "liquid-glass") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">4. Liquid Glass</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organic, fluid glass aesthetics with dynamic refraction gradients, water surface tension highlights, and fluid motion shimmer.
            </p>

            {/* Live Component */}
            <div className="relative p-8 rounded-2xl bg-[#040914] overflow-hidden flex items-center justify-center min-h-[260px]">
              {/* Dynamic Fluid Blob Background */}
              <div className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 blur-3xl opacity-40 animate-pulse"></div>

              {/* Liquid Glass Pill Container */}
              <div className="relative w-full max-w-sm p-6 rounded-3xl bg-cyan-950/30 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_20px_50px_rgba(6,182,212,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-200">FLUID WATER GLASS</span>
                  <Droplet className="w-4 h-4 text-cyan-300 animate-bounce" />
                </div>
                <p className="text-xs text-cyan-100/90 leading-relaxed">
                  High gloss surface tension highlights create a wet, organic liquid glass appearance over fluid background gradients.
                </p>
                <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:brightness-110 transition">
                  LIQUID ACTION BUTTON
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            5. SPATIAL UI
        ======================================================== */}
        {(activeTab === "all" || activeTab === "spatial-ui") && (
          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">5. Spatial UI (VisionOS Style)</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              3D depth hierarchy, floating translucent spatial panels, dynamic focus rings, and ambient background integration for immersive interfaces.
            </p>

            {/* Live Component */}
            <div className="relative p-10 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center min-h-[320px] overflow-hidden">
              {/* Spatial Background Grid & Focus Orbs */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <div className="absolute w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl"></div>

              {/* Floating Spatial Panel 1 (Background Layer) */}
              <div className="absolute top-8 left-8 w-64 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/40 shadow-xl opacity-60 pointer-events-none transform -rotate-3">
                <span className="text-[10px] font-mono text-slate-400">LAYER 01 // BACKGROUND SPATIAL NODE</span>
              </div>

              {/* Floating Spatial Panel 2 (Foreground Active Layer) */}
              <div className="relative z-10 w-full max-w-lg p-7 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-600/50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_20px_rgba(99,102,241,0.15)] space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">Spatial Window Panel</h3>
                      <p className="text-[10px] text-slate-400 font-mono">VisionOS 3D Depth Layer</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                    Focus Ring Active
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Spatial UI uses translucent floating glass panels with high depth shadows, making elements feel like physical objects floating in 3D space.
                </p>

                <div className="flex space-x-3">
                  <button className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] transition">
                    Spatial Select
                  </button>
                  <button className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
