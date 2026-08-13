"use client";

import { useState, useEffect } from "react";

interface LiveHolographicAvatarProps {
  name?: string;
  role?: string;
  theme?: "hub" | "oversight" | "admin" | "cyan" | "gold" | "emerald" | "indigo";
}

export default function LiveHolographicAvatar({
  name = "PERSONNEL",
  role = "SOVEREIGN OPERATOR",
  theme = "cyan",
}: LiveHolographicAvatarProps) {
  const [actionState, setActionState] = useState<"idle" | "wave" | "scan">("wave");
  const [holoGlow, setHoloGlow] = useState(true);

  // Auto loop avatar gestures
  useEffect(() => {
    const interval = setInterval(() => {
      setActionState((prev) => (prev === "idle" ? "wave" : prev === "wave" ? "scan" : "idle"));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const colorConfig = {
    cyan: {
      accent: "#06b6d4",
      visor: "#38bdf8",
      aura: "rgba(6, 182, 212, 0.4)",
      badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    },
    gold: {
      accent: "#f59e0b",
      visor: "#fbbf24",
      aura: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    },
    emerald: {
      accent: "#10b981",
      visor: "#34d399",
      aura: "rgba(16, 185, 129, 0.4)",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    },
    indigo: {
      accent: "#6366f1",
      visor: "#818cf8",
      aura: "rgba(99, 102, 241, 0.4)",
      badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    },
    hub: {
      accent: "#6366f1",
      visor: "#818cf8",
      aura: "rgba(99, 102, 241, 0.4)",
      badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    },
    oversight: {
      accent: "#f59e0b",
      visor: "#fbbf24",
      aura: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    },
    admin: {
      accent: "#f43f5e",
      visor: "#fb7185",
      aura: "rgba(244, 63, 94, 0.4)",
      badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    },
  }[theme] || {
    accent: "#06b6d4",
    visor: "#38bdf8",
    aura: "rgba(6, 182, 212, 0.4)",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-black/60 border border-white/10 overflow-hidden font-mono select-none">
      {/* Holographic Background Aura Grid & Scan Line */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(${colorConfig.accent} 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />

      {/* Laser Biometric Scanning Beam Animation */}
      <div
        className={`absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[${colorConfig.accent}] to-transparent transition-all duration-1000 z-20 shadow-[0_0_12px_rgba(255,255,255,0.8)] ${
          actionState === "scan" ? "top-full animate-bounce" : "top-0"
        }`}
      />

      {/* Avatar Container */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1">
        {/* Holographic Glowing Pulse Rings */}
        {holoGlow && (
          <>
            <div
              className="absolute w-32 h-32 rounded-full border border-dashed border-white/30 animate-spin"
              style={{ animationDuration: "12s" }}
            />
            <div
              className="absolute w-36 h-36 rounded-full border border-white/10 animate-ping opacity-25"
              style={{ animationDuration: "3s" }}
            />
          </>
        )}

        {/* Live SVG Rigged Cyberpunk Avatar */}
        <svg
          viewBox="0 0 160 160"
          className="w-32 h-32 z-10 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-300"
        >
          <defs>
            <linearGradient id={`grad-suit-${theme}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id={`grad-visor-${theme}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colorConfig.visor} />
              <stop offset="100%" stopColor={colorConfig.accent} />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shoulders & Tactical Armor Suit */}
          <path
            d="M 30 145 C 30 115 50 100 80 100 C 110 100 130 115 130 145 Z"
            fill={`url(#grad-suit-${theme})`}
            stroke={colorConfig.accent}
            strokeWidth="2"
          />

          {/* Armor Chest Core Light */}
          <circle cx="80" cy="120" r="6" fill={colorConfig.accent} filter="url(#glow)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Head & Neck Base */}
          <rect x="72" y="82" width="16" height="20" rx="4" fill="#334155" />
          <path d="M 52 45 C 52 30 65 20 80 20 C 95 20 108 30 108 45 L 108 72 C 108 82 95 90 80 90 C 65 90 52 82 52 72 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />

          {/* Cybernetic Visor Display */}
          <rect
            x="58"
            y="42"
            width="44"
            height="18"
            rx="6"
            fill={`url(#grad-visor-${theme})`}
            filter="url(#glow)"
          />
          {/* Visor Reflection Streak */}
          <path d="M 62 44 L 80 44 L 72 58 L 62 58 Z" fill="#ffffff" opacity="0.3" />

          {/* Ears & Comm Headset */}
          <circle cx="50" cy="55" r="4" fill="#475569" />
          <circle cx="110" cy="55" r="4" fill="#475569" />
          <path d="M 50 55 Q 80 15 110 55" fill="none" stroke={colorConfig.accent} strokeWidth="2" strokeDasharray="3,3" />

          {/* LEFT ARM - Waving Gesture */}
          <g
            style={{
              transformOrigin: "35px 115px",
              transform: actionState === "wave" ? "rotate(-25deg)" : "rotate(0deg)",
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {/* Upper Arm */}
            <rect x="22" y="110" width="14" height="25" rx="5" fill="#1e293b" stroke={colorConfig.accent} strokeWidth="1.5" />
            
            {/* Forearm & Hand Waving Gesture Group */}
            <g
              className={actionState === "wave" ? "animate-avatar-wave" : ""}
              style={{
                transformOrigin: "29px 135px",
              }}
            >
              <rect x="23" y="130" width="12" height="22" rx="4" fill="#334155" />
              {/* Hand Palm & Palm Pulse Sensor */}
              <circle cx="29" cy="155" r="5" fill={colorConfig.accent} filter="url(#glow)" />
            </g>
          </g>

          {/* RIGHT ARM - Rest Position */}
          <rect x="124" y="110" width="14" height="35" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Avatar Live Status Label */}
      <div className="text-center mt-1 z-10">
        <div className="text-[10px] font-bold text-white tracking-widest font-sans uppercase flex items-center justify-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{name}</span>
        </div>
        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{role}</div>
      </div>

      {/* Interactive Avatar Controls */}
      <div className="flex gap-1.5 mt-2.5 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActionState("wave");
          }}
          className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
            actionState === "wave" ? colorConfig.badgeBg : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          👋 Wave
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActionState("scan");
          }}
          className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
            actionState === "scan" ? colorConfig.badgeBg : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          🛡️ Bio Scan
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setHoloGlow(!holoGlow);
          }}
          className="px-2 py-1 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white transition"
        >
          ⚡ Holo
        </button>
      </div>
    </div>
  );
}
