"use client";

import { useState } from "react";
import { Sparkles, Sliders, ShieldCheck, QrCode, Lock, Palette } from "lucide-react";

export default function DesignSamplesPage() {
  const [testName, setTestName] = useState("Tanishq Vaswani");
  const [testEmail, setTestEmail] = useState("tan@animuslab.dev");
  const [testHub, setTestHub] = useState("animuslab");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardKey: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const colorPalettes = [
    {
      id: "cobalt",
      name: "Obsidian Cobalt",
      tag: "Electric Indigo & Cyan",
      bgSurface: "#0e1726",
      darkShadow: "#060a11",
      lightShadow: "#16243b",
      accentText: "text-[#6366f1]",
      hubText: "text-cyan-400",
      barcodeColor: "bg-[#6366f1]",
      borderHighlight: "border-indigo-500/30",
    },
    {
      id: "gold",
      name: "Sovereign Gold",
      tag: "Statutory Amber & Gold",
      bgSurface: "#1a160e",
      darkShadow: "#0c0905",
      lightShadow: "#282317",
      accentText: "text-amber-400",
      hubText: "text-yellow-300",
      barcodeColor: "bg-amber-400",
      borderHighlight: "border-amber-500/30",
    },
    {
      id: "emerald",
      name: "Cyber Emerald",
      tag: "Hyper Emerald & Mint",
      bgSurface: "#0b1a14",
      darkShadow: "#040c09",
      lightShadow: "#12281f",
      accentText: "text-emerald-400",
      hubText: "text-teal-300",
      barcodeColor: "bg-emerald-400",
      borderHighlight: "border-emerald-500/30",
    },
    {
      id: "crimson",
      name: "Crimson Operator",
      tag: "Animus Rose & Ruby",
      bgSurface: "#1c0d12",
      darkShadow: "#0c0407",
      lightShadow: "#2c161d",
      accentText: "text-rose-400",
      hubText: "text-pink-400",
      barcodeColor: "bg-rose-500",
      borderHighlight: "border-rose-500/30",
    },
    {
      id: "violet",
      name: "Midnight Violet",
      tag: "Deep Purple & Amethyst",
      bgSurface: "#140d24",
      darkShadow: "#080412",
      lightShadow: "#201636",
      accentText: "text-purple-400",
      hubText: "text-violet-300",
      barcodeColor: "bg-purple-500",
      borderHighlight: "border-purple-500/30",
    },
    {
      id: "silver",
      name: "Platinum Silver",
      tag: "Monochromatic Platinum",
      bgSurface: "#181b22",
      darkShadow: "#0b0c0f",
      lightShadow: "#252a35",
      accentText: "text-slate-200",
      hubText: "text-sky-300",
      barcodeColor: "bg-slate-200",
      borderHighlight: "border-slate-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 p-8 space-y-12 max-w-7xl mx-auto font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-indigo-400 mb-3">
          <Palette className="w-4 h-4" />
          <span>Interactive Neomorphism Color Palette Playground</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
          Sovereign ID Card Neomorphism Color Explorations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Experimenting with 6 curated high-end color surface palettes for the Neomorphism Sovereign Credential ID Card. Click any card to flip it over and inspect the matching barcode on the back!
        </p>

        {/* Dynamic Parameter Inputs */}
        <div className="mt-6 p-5 rounded-3xl bg-[#0e1726] space-y-3 font-mono text-xs max-w-3xl" style={{ boxShadow: "10px 10px 20px #060a11, -10px -10px 20px #16243b" }}>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Text Mirroring Controls</span>
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

      {/* Grid of 6 Color Palette Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-center justify-items-center">
        {colorPalettes.map((palette) => {
          const isFlipped = flippedCards[palette.id] || false;
          const displayName = testName || "PERSONNEL NAME";
          const displayHub = testHub ? testHub.toUpperCase() : "SILO_PENDING";

          return (
            <section key={palette.id} className="space-y-3 w-full flex flex-col items-center">
              <div className="text-center space-y-1">
                <span className={`text-[10px] font-mono font-bold uppercase ${palette.accentText}`}>
                  {palette.tag}
                </span>
                <h2 className="text-base font-bold text-slate-100 font-sans">{palette.name}</h2>
              </div>

              {/* Neomorphism ID Card with Custom Palette Surface */}
              <div
                className="w-full max-w-[350px] h-[460px] relative z-10 cursor-pointer select-none group"
                onClick={() => toggleFlip(palette.id)}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* ================= FRONT SIDE ================= */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between overflow-hidden font-mono text-xs text-slate-100"
                    style={{
                      backgroundColor: palette.bgSurface,
                      backfaceVisibility: "hidden",
                      boxShadow: `12px 12px 24px ${palette.darkShadow}, -12px -12px 24px ${palette.lightShadow}`,
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">
                          SOVEREIGN CLEARANCE
                        </span>
                        <span className="text-xs font-black text-slate-100 tracking-wider font-sans">
                          ANIMUSLAB MESH
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase ${palette.accentText}`}
                        style={{
                          backgroundColor: palette.bgSurface,
                          boxShadow: `inset 2px 2px 4px ${palette.darkShadow}, inset -2px -2px 4px ${palette.lightShadow}`,
                        }}
                      >
                        VERIFIED
                      </span>
                    </div>

                    {/* Personnel Identity Inset Block */}
                    <div
                      className="rounded-2xl p-4 flex items-center gap-3.5"
                      style={{
                        backgroundColor: palette.bgSurface,
                        boxShadow: `inset 4px 4px 8px ${palette.darkShadow}, inset -4px -4px 8px ${palette.lightShadow}`,
                      }}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${palette.accentText} font-sans flex-shrink-0`}
                        style={{
                          backgroundColor: palette.bgSurface,
                          boxShadow: `3px 3px 6px ${palette.darkShadow}, -3px -3px 6px ${palette.lightShadow}`,
                        }}
                      >
                        {displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                          Personnel Identity
                        </span>
                        <div className="text-xs font-bold text-slate-100 tracking-wide truncate font-sans">
                          {displayName.toUpperCase()}
                        </div>
                        <div className={`text-[10px] ${palette.hubText} font-mono truncate mt-0.5`}>
                          {testEmail}
                        </div>
                      </div>
                    </div>

                    {/* Scope Matrix Inset Block */}
                    <div
                      className="grid grid-cols-2 gap-3.5 rounded-2xl p-4 text-left"
                      style={{
                        backgroundColor: palette.bgSurface,
                        boxShadow: `inset 4px 4px 8px ${palette.darkShadow}, inset -4px -4px 8px ${palette.lightShadow}`,
                      }}
                    >
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                          Clearance ID
                        </span>
                        <span className="text-[10px] font-bold text-slate-100 tracking-wider block mt-0.5 truncate">
                          OWN-AN-MUM-842
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                          Hub Silo ID
                        </span>
                        <span className={`text-[10px] font-bold ${palette.hubText} tracking-wider block mt-0.5 truncate`}>
                          {displayHub}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-white/10">
                        <span className="text-[9px] text-slate-400 font-bold block tracking-wider uppercase">
                          Clearance Status
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 tracking-widest block mt-0.5 uppercase">
                          SOVEREIGN OPERATOR
                        </span>
                      </div>
                    </div>

                    {/* Bottom Cryptographic Fingerprint Footer */}
                    <div className="space-y-2">
                      <div
                        className="rounded-xl p-2.5 text-[9px] font-bold text-slate-300 break-all tracking-tight select-all"
                        style={{
                          backgroundColor: palette.bgSurface,
                          boxShadow: `inset 3px 3px 6px ${palette.darkShadow}, inset -3px -3px 6px ${palette.lightShadow}`,
                        }}
                      >
                        KEY_FP: sha256:b49d424a21b4142ddb670...
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          Click to Flip Badge →
                        </span>
                        <span className="font-bold text-slate-400">{palette.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* ================= BACK SIDE (MATCHING BARCODE) ================= */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between overflow-hidden font-mono text-xs text-slate-100"
                    style={{
                      backgroundColor: palette.bgSurface,
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      boxShadow: `12px 12px 24px ${palette.darkShadow}, -12px -12px 24px ${palette.lightShadow}`,
                    }}
                  >
                    {/* Back Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">
                          INSTITUTIONAL REGISTRY
                        </span>
                        <span className={`text-xs font-black ${palette.accentText} tracking-wider font-sans`}>
                          SECURE AUDIT NODE
                        </span>
                      </div>
                      <QrCode className={`w-5 h-5 ${palette.accentText}`} />
                    </div>

                    {/* Machine-Readable Cryptographic Barcode Area */}
                    <div
                      className="rounded-2xl p-4 text-center space-y-2.5"
                      style={{
                        backgroundColor: palette.bgSurface,
                        boxShadow: `inset 4px 4px 8px ${palette.darkShadow}, inset -4px -4px 8px ${palette.lightShadow}`,
                      }}
                    >
                      <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                        CRYPTOGRAPHIC BARCODE
                      </div>

                      {/* Barcode Lines */}
                      <div className="flex justify-center items-center h-12 space-x-1 py-1 bg-black/60 rounded-xl p-2">
                        {[4, 2, 6, 1, 8, 3, 5, 2, 7, 4, 2, 6, 3, 8, 2, 5, 3, 7, 1, 6, 4, 8, 2].map((w, idx) => (
                          <div
                            key={idx}
                            className={`h-full ${idx % 2 === 0 ? palette.barcodeColor : "bg-slate-700"}`}
                            style={{ width: `${w * 1.5}px` }}
                          />
                        ))}
                      </div>

                      <div className={`text-[10px] font-bold ${palette.accentText} tracking-widest uppercase`}>
                        AN-SYS-{displayHub}-2026
                      </div>
                    </div>

                    {/* Legal Statement */}
                    <div
                      className="rounded-2xl p-3 text-[9px] text-slate-400 leading-relaxed"
                      style={{
                        backgroundColor: palette.bgSurface,
                        boxShadow: `inset 4px 4px 8px ${palette.darkShadow}, inset -4px -4px 8px ${palette.lightShadow}`,
                      }}
                    >
                      <div className="text-slate-200 font-bold mb-0.5 uppercase tracking-wider">
                        Security Mandate:
                      </div>
                      Bound to verified local private key layer. Memory tampering revokes node session.
                    </div>

                    {/* Footer Seal */}
                    <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-white/10">
                      <span className={`flex items-center gap-1.5 ${palette.accentText} font-bold`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>AUTHENTICATED BY ANIMUSLAB</span>
                      </span>
                      <span>BACK SIDE</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
