"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Sparkles, Play, Sliders, Layers, Eye } from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";

/* ─────────────────────────────────────────────────────────────
   OPENING INTRO ANIMATION LAB FOR "ANCHOR" HERO WATERMARK
   Runs strictly on website launch / page load at the start
───────────────────────────────────────────────────────────── */

type OpeningStyle = "focus" | "letters" | "aperture" | "bloom";

const OPENING_OPTIONS = [
  {
    id: "focus" as OpeningStyle,
    number: "01",
    title: "Focus & Scale Snap",
    tag: "Apple / Linear Style",
    desc: "Starts expanded and deeply blurred (scale 1.18, blur 20px), then seamlessly converges into crisp mathematical focus and settles into the off-white background.",
    timing: "3.8s cinematic ease-out (Wide Inflow)",
  },
  {
    id: "letters" as OpeningStyle,
    number: "02",
    title: "Letter-by-Letter Staggered Rise",
    tag: "Cryptographic Cadence",
    desc: "Each individual glyph (A · N · C · H · O · R) rises sequentially from a subtle bottom mask with a 100ms stagger between letters.",
    timing: "1.2s staggered sequence",
  },
  {
    id: "aperture" as OpeningStyle,
    number: "03",
    title: "Central Aperture Expansion",
    tag: "Invariant Beam Wipe",
    desc: "Unfolds outward horizontally from a central laser-thin vertical aperture (clip-path wipe) accompanied by a soft dispersion glow.",
    timing: "1.6s aperture wipe",
  },
  {
    id: "bloom" as OpeningStyle,
    number: "04",
    title: "Ambient Light Bloom & Lock",
    tag: "Subtle Indigo Surge",
    desc: "An ambient indigo glow surges behind the watermark, illuminating the letters with a transient luminance burst before locking into resting opacity.",
    timing: "2.0s illumination bloom",
  },
];

export default function WatermarkOpeningLab() {
  const [selectedStyle, setSelectedStyle] = useState<OpeningStyle>("focus");
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [autoReplay, setAutoReplay] = useState<boolean>(false);

  // Trigger replay
  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!autoReplay) return;
    const interval = setInterval(() => {
      handleReplay();
    }, 4500);
    return () => clearInterval(interval);
  }, [autoReplay, selectedStyle]);

  const selectStyleAndPlay = (style: OpeningStyle) => {
    setSelectedStyle(style);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#111111] p-6 sm:p-10 font-sans selection:bg-[#5B5CF6] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-black transition-colors" style={{ textDecoration: "none" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Homepage
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono font-bold text-[#5B5CF6]">Start Intro Animations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Website Opening Animation Lab</h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Preview opening animations that trigger <strong>only once when the website is opened at the start</strong>.
            </p>
          </div>

          {/* Action Control Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoReplay(!autoReplay)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                autoReplay
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-300"
                  : "bg-white text-slate-600 border-black/[0.08] hover:text-black"
              }`}
            >
              {autoReplay ? "● Auto-Loop (Active)" : "○ Auto-Loop (Off)"}
            </button>

            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold shadow-md hover:opacity-85 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay Opening Animation
            </button>
          </div>
        </div>

        {/* Style Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OPENING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => selectStyleAndPlay(opt.id)}
              className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-3 ${
                selectedStyle === opt.id
                  ? "bg-white border-black shadow-md ring-1 ring-black"
                  : "bg-white/60 border-black/[0.06] hover:bg-white hover:border-black/[0.15]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 text-slate-700">
                  STYLE {opt.number}
                </span>
                <span className="text-[9px] font-mono text-[#5B5CF6] font-semibold">{opt.tag}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-black">{opt.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── LIVE HERO STAGE PREVIEW ── */}
        <div
          key={animationKey}
          className="relative min-h-[620px] rounded-[36px] bg-white border border-black/[0.08] shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center p-8 transition-all"
        >
          {/* Ambient Lighting Dome */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-[#6366F1]/10 via-[#93C5FD]/08 to-transparent rounded-full blur-[120px] pointer-events-none" />

          {/* ── 01. FOCUS & SCALE CONVERGENCE ── */}
          {selectedStyle === "focus" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
              <span className="text-[23vw] font-black tracking-tighter uppercase text-black leading-none animate-watermark-intro-focus">
                ANCHOR
              </span>
            </div>
          )}

          {/* ── 02. LETTER-BY-LETTER STAGGERED ELEVATION ── */}
          {selectedStyle === "letters" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
              <div className="text-[23vw] font-black tracking-tighter uppercase text-black leading-none flex items-center justify-center transform -translate-y-4">
                {["A", "N", "C", "H", "O", "R"].map((char, index) => (
                  <span
                    key={index}
                    className="inline-block animate-letter-rise"
                    style={{
                      animationDelay: `${index * 110}ms`,
                      opacity: 0,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── 03. CENTRAL APERTURE WIPE ── */}
          {selectedStyle === "aperture" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
              <span className="text-[23vw] font-black tracking-tighter uppercase text-black leading-none transform -translate-y-4 animate-watermark-intro-wipe">
                ANCHOR
              </span>
            </div>
          )}

          {/* ── 04. AMBIENT LIGHT BLOOM & LOCK ── */}
          {selectedStyle === "bloom" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
              <span className="text-[23vw] font-black tracking-tighter uppercase text-black leading-none transform -translate-y-4 animate-watermark-intro-bloom">
                ANCHOR
              </span>
            </div>
          )}

          {/* Hero Foreground Content (Staggers in smoothly after watermark) */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-fadeInUp">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-black flex items-center justify-center shadow-xl">
              <AnchorLogo size={24} variant="white" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 text-[11px] font-mono font-semibold text-slate-700">
                <span>Active Opening Preset:</span>
                <span className="text-black font-bold uppercase">{selectedStyle}</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-black leading-[1.1]">
                Govern your AI agents. <br />
                <span className="italic font-serif font-normal text-slate-700">At runtime.</span>
              </h2>
            </div>

            <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Deterministic, cryptographically auditable governance for agentic AI systems.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <span className="px-8 py-3.5 rounded-full bg-[#111111] text-white text-xs font-bold shadow-lg cursor-default">
                Start 30-Day Free Hub Trial
              </span>
              <span className="text-xs font-mono text-slate-500">
                Annual Contracts from $15,000 / year
              </span>
            </div>
          </div>

          {/* Status footer on preview card */}
          <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-black/[0.04] pt-3">
            <span>Timing: <strong>{OPENING_OPTIONS.find(o => o.id === selectedStyle)?.timing}</strong></span>
            <span className="text-[#5B5CF6]">Press &quot;Replay Opening Animation&quot; above to watch from t=0</span>
          </div>
        </div>

        {/* Comparison Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] space-y-3 shadow-sm">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B5CF6]" />
              Why Single-Trigger Opening Animations Excel
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Unlike continuous looping animations (which can sometimes pull the user&apos;s gaze away from the headline), a <strong>one-shot opening intro animation</strong> creates a high-end, cinematic entrance when the visitor arrives, then settles into a quiet, architectural resting state so the typography remains 100% readable.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] space-y-3 shadow-sm">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5B5CF6]" />
              How It Works In Production
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              When the user lands on the website, Next.js CSS keyframe animations trigger immediately at 60fps with zero layout thrashing or JavaScript runtime cost. Once complete, the element stays at its final resting opacity (e.g. <code>0.075</code>).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
