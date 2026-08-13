"use client";

import { useState } from "react";
import { Sparkles, Eye, Layers, Sliders, Droplet, Sun, ShieldCheck, Key, Lock, QrCode, RotateCw, Activity, Cpu, Camera, UserCheck } from "lucide-react";
import LiveHolographicAvatar from "@/components/auth/LiveHolographicAvatar";

export default function DesignSamplesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Dynamic Test Parameters State
  const [testName, setTestName] = useState("Tanishq Vaswani");
  const [testGender, setTestGender] = useState<"male" | "female" | "auto">("auto");
  const [customPhoto, setCustomPhoto] = useState<string | undefined>(undefined);

  const toggleFlip = (cardKey: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCustomPhoto(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          Explore the AnimusLab Sovereign Identity Card rendered across 5 distinct design paradigms. Click any card to flip it over and experience the <span className="text-cyan-300 font-bold">Gender-Aware Live 3D Memoji Avatar / Custom Photo Resolver</span> on the back!
        </p>

        {/* Dynamic Parameter Test Controls */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs max-w-3xl">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Interactive Avatar Parameter Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TEST PERSONNEL NAME</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Tanishq Vaswani or Ananya Sharma"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">GENDER RESOLUTION MODE</label>
              <select
                value={testGender}
                onChange={(e) => setTestGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="auto">Auto-Detect from Name</option>
                <option value="male">👨 Male 3D Memoji</option>
                <option value="female">👩 Female 3D Memoji</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PROFILE PHOTO UPLOAD</label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition flex items-center justify-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{customPhoto ? "Change Photo" : "Upload Face Photo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCustomPhotoUpload} />
                </label>
                {customPhoto && (
                  <button
                    onClick={() => setCustomPhoto(undefined)}
                    className="px-2 py-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 text-xs font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

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
              Translucent frosted glass material with backdrop blur, white border strokes, and live waving 3D avatar on the back side.
            </p>

            {/* Glassmorphism Container Backdrop */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden flex items-center justify-center min-h-[520px] shadow-2xl">
              <div className="absolute w-56 h-56 rounded-full bg-cyan-400 blur-3xl top-4 left-4 opacity-70 animate-pulse"></div>
              <div className="absolute w-48 h-48 rounded-full bg-pink-500 blur-3xl bottom-4 right-4 opacity-60"></div>

              {/* Glassmorphism ID Card Component */}
              <div
                className="relative w-full max-w-[340px] h-[470px] cursor-pointer select-none group"
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
                  {/* FRONT VIEW */}
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 flex-shrink-0 shadow-lg overflow-hidden">
                        {customPhoto ? (
                          <img src={customPhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-sm text-cyan-300 font-sans">
                            {testName ? testName.substring(0, 2).toUpperCase() : "TV"}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate font-sans">{testName.toUpperCase()}</div>
                        <div className="text-[10px] text-cyan-200 truncate">identity@animuslab.dev</div>
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
                        <span>Click to Flip for 3D Avatar</span>
                        <span>GLASS V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK VIEW - GENDER-AWARE LIVE 3D MEMOJI AVATAR */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="text-[10px] font-bold text-cyan-300 font-sans uppercase">LIVE 3D MEMOJI AVATAR</span>
                      <QrCode className="w-4 h-4 text-cyan-300" />
                    </div>

                    {/* LIVE WAVING AVATAR RIG */}
                    <LiveHolographicAvatar
                      name={testName}
                      role="SOVEREIGN OPERATOR"
                      theme="cyan"
                      gender={testGender}
                      customPhotoUrl={customPhoto}
                    />

                    <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[9px] text-white/70">
                      <span>AN-SYS-SOL01-2026</span>
                      <span className="text-emerald-300 font-bold">👋 LIVE AVATAR ACTIVE</span>
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
              Tactile 3D analog realism with metallic bevels and gender-aware 3D Memoji avatar on the back side.
            </p>

            {/* Skeuomorphism Container Backdrop */}
            <div className="p-8 rounded-3xl bg-[#14161d] border border-slate-800 flex items-center justify-center min-h-[520px] shadow-2xl">
              <div
                className="relative w-full max-w-[340px] h-[470px] cursor-pointer select-none group"
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
                  {/* FRONT VIEW */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-gradient-to-b from-[#2e313a] via-[#21232b] to-[#16171d] border border-[#484d5e] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-center border-b border-[#3c404f] pb-3 pt-2">
                      <div>
                        <span className="text-[9px] text-[#a0a5b5] font-bold block uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          SKEUOMORPHIC BADGE
                        </span>
                        <span className="text-xs font-black text-amber-400 font-sans tracking-wide">ANIMUSLAB HEAVY</span>
                      </div>
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 border border-amber-800 shadow-[0_0_10px_rgba(245,158,11,0.9)]"></div>
                    </div>

                    <div className="bg-[#101217] p-4 rounded-xl border border-[#2c303c] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#3a3e4b] to-[#1c1e25] border border-[#52586a] flex items-center justify-center font-black text-sm text-amber-400 font-sans shadow-md overflow-hidden">
                        {customPhoto ? (
                          <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          testName ? testName.substring(0, 2).toUpperCase() : "TV"
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-sans">{testName.toUpperCase()}</div>
                        <div className="text-[10px] text-amber-400 font-mono">identity@animuslab.dev</div>
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
                        <span>Click to Flip for 3D Avatar</span>
                        <span>SKEUO V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK VIEW - GENDER-AWARE LIVE 3D MEMOJI AVATAR */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-2xl bg-gradient-to-b from-[#21232b] via-[#181920] to-[#0f1015] border border-[#484d5e] shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-[#3c404f] pb-2">
                      <span className="text-[10px] font-bold text-amber-400 font-sans uppercase">ANALOG LIVE AVATAR RIG</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>

                    {/* LIVE WAVING AVATAR RIG */}
                    <LiveHolographicAvatar
                      name={testName}
                      role="SECURITY OFFICER"
                      theme="gold"
                      gender={testGender}
                      customPhotoUrl={customPhoto}
                    />

                    <div className="border-t border-[#3c404f] pt-2 flex items-center justify-between text-[9px] text-slate-400">
                      <span>AN-SKEUO-BARCODE-2026</span>
                      <span className="text-amber-400 font-bold">👋 LIVE AVATAR ACTIVE</span>
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
              Soft molded UI crafted out of the dark surface with gender-aware 3D Memoji avatar on the back side.
            </p>

            {/* Neomorphism Container Backdrop */}
            <div className="p-8 rounded-3xl bg-[#0e1726] flex items-center justify-center min-h-[520px] shadow-2xl">
              <div
                className="relative w-full max-w-[340px] h-[470px] cursor-pointer select-none group"
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
                  {/* FRONT VIEW */}
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

                    <div
                      className="p-4 rounded-2xl bg-[#0e1726] flex items-center gap-3"
                      style={{ boxShadow: "inset 4px 4px 8px #060a11, inset -4px -4px 8px #16243b" }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl bg-[#0e1726] flex items-center justify-center font-black text-sm text-emerald-400 font-sans overflow-hidden"
                        style={{ boxShadow: "3px 3px 6px #060a11, -3px -3px 6px #16243b" }}
                      >
                        {customPhoto ? (
                          <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          testName ? testName.substring(0, 2).toUpperCase() : "TV"
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-sans">{testName.toUpperCase()}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">identity@animuslab.dev</div>
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
                        <span>Click to Flip for 3D Avatar</span>
                        <span>NEO V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK VIEW - GENDER-AWARE LIVE 3D MEMOJI AVATAR */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-3xl bg-[#0e1726] flex flex-col justify-between font-mono text-xs"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      boxShadow: "12px 12px 24px #060a11, -12px -12px 24px #16243b",
                    }}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                      <span className="text-[10px] font-bold text-emerald-400 font-sans uppercase">NEOMORPHIC LIVE AVATAR RIG</span>
                      <Cpu className="w-4 h-4 text-emerald-400" />
                    </div>

                    {/* LIVE WAVING AVATAR RIG */}
                    <LiveHolographicAvatar
                      name={testName}
                      role="MOLDED SECURITY OFFICER"
                      theme="emerald"
                      gender={testGender}
                      customPhotoUrl={customPhoto}
                    />

                    <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400">
                      <span>AN-NEO-MATRIX-2026</span>
                      <span className="text-emerald-400 font-bold">👋 LIVE AVATAR ACTIVE</span>
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
              Organic fluid glass with surface tension highlights and gender-aware 3D Memoji avatar on the back side.
            </p>

            {/* Liquid Glass Container Backdrop */}
            <div className="relative p-8 rounded-3xl bg-[#040914] overflow-hidden flex items-center justify-center min-h-[520px] shadow-2xl">
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 blur-3xl opacity-40 animate-pulse"></div>

              {/* Liquid Glass ID Card */}
              <div
                className="relative w-full max-w-[340px] h-[470px] cursor-pointer select-none group"
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
                  {/* FRONT VIEW */}
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-black text-sm text-slate-950 font-sans shadow-md overflow-hidden">
                        {customPhoto ? (
                          <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          testName ? testName.substring(0, 2).toUpperCase() : "TV"
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">{testName.toUpperCase()}</div>
                        <div className="text-[10px] text-cyan-300 font-mono">identity@animuslab.dev</div>
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
                        <span>Click to Flip for 3D Avatar</span>
                        <span>LIQUID V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK VIEW - GENDER-AWARE LIVE 3D MEMOJI AVATAR */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-3xl bg-cyan-950/40 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_20px_50px_rgba(6,182,212,0.3)] flex flex-col justify-between font-mono text-xs"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-cyan-400/20 pb-2">
                      <span className="text-[10px] font-bold text-cyan-300 font-sans uppercase">FLUID LIVE AVATAR RIG</span>
                      <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    </div>

                    {/* LIVE WAVING AVATAR RIG */}
                    <LiveHolographicAvatar
                      name={testName}
                      role="FLUID SECURITY OFFICER"
                      theme="cyan"
                      gender={testGender}
                      customPhotoUrl={customPhoto}
                    />

                    <div className="border-t border-cyan-400/20 pt-2 flex items-center justify-between text-[9px] text-cyan-300">
                      <span>AN-LIQUID-FLUID-2026</span>
                      <span className="text-cyan-300 font-bold">👋 LIVE AVATAR ACTIVE</span>
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
              3D depth hierarchy with multi-layered floating translucent spatial window panels and gender-aware 3D Memoji avatar on the back side.
            </p>

            {/* Spatial UI Container Backdrop */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center min-h-[540px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
              <div className="absolute w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>

              {/* Background Spatial Layer 01 */}
              <div className="absolute top-10 left-10 w-72 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/40 shadow-xl opacity-50 pointer-events-none transform -rotate-3 font-mono text-[10px] text-slate-400">
                LAYER 01 // BACKGROUND SPATIAL MATRIX NODE
              </div>

              {/* Spatial UI ID Card (Foreground Layer 02) */}
              <div
                className="relative z-10 w-full max-w-[360px] h-[470px] cursor-pointer select-none group"
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
                  {/* FRONT VIEW */}
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
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-black text-sm text-indigo-300 font-sans shadow-inner overflow-hidden">
                        {customPhoto ? (
                          <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          testName ? testName.substring(0, 2).toUpperCase() : "TV"
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">{testName.toUpperCase()}</div>
                        <div className="text-[10px] text-indigo-300 font-mono">identity@animuslab.dev</div>
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
                        <span>Click to Flip for 3D Avatar</span>
                        <span>VISIONOS V6</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK VIEW - GENDER-AWARE LIVE 3D MEMOJI AVATAR */}
                  <div
                    className="absolute inset-0 w-full h-full p-5 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-indigo-400/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col justify-between font-mono text-xs ring-2 ring-indigo-500/30"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[10px] font-bold text-indigo-300 font-sans uppercase">SPATIAL LIVE AVATAR RIG</span>
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    </div>

                    {/* LIVE WAVING AVATAR RIG */}
                    <LiveHolographicAvatar
                      name={testName}
                      role="SPATIAL SECURITY OFFICER"
                      theme="indigo"
                      gender={testGender}
                      customPhotoUrl={customPhoto}
                    />

                    <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[9px] text-slate-400">
                      <span>AN-SPATIAL-NODE-2026</span>
                      <span className="text-indigo-300 font-bold">👋 LIVE AVATAR ACTIVE</span>
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
