"use client";

import { useState, useEffect } from "react";

interface LiveHolographicAvatarProps {
  name?: string;
  role?: string;
  theme?: "hub" | "oversight" | "admin" | "cyan" | "gold" | "emerald" | "indigo";
}

export default function LiveHolographicAvatar({
  name = "TANISHQ VASWANI",
  role = "SOVEREIGN OPERATOR",
  theme = "cyan",
}: LiveHolographicAvatarProps) {
  const [expression, setExpression] = useState<"wink" | "smile">("wink");
  const [isScanning, setIsScanning] = useState(false);
  const [holoGlow, setHoloGlow] = useState(true);
  const [headTilt, setHeadTilt] = useState(false);

  // Auto loop expression animations (winking and head tilting like Snapchat Bitmoji / Apple Memoji)
  useEffect(() => {
    const interval = setInterval(() => {
      setExpression((prev) => (prev === "wink" ? "smile" : "wink"));
      setHeadTilt((prev) => !prev);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const themeConfig = {
    cyan: {
      accent: "#06b6d4",
      border: "border-cyan-400/40",
      aura: "rgba(6, 182, 212, 0.4)",
      badgeBg: "bg-cyan-500/20 border-cyan-400/40 text-cyan-300",
      scanLine: "from-cyan-400 via-sky-300 to-cyan-400",
    },
    gold: {
      accent: "#f59e0b",
      border: "border-amber-500/40",
      aura: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/20 border-amber-400/40 text-amber-400",
      scanLine: "from-amber-400 via-yellow-300 to-amber-400",
    },
    emerald: {
      accent: "#10b981",
      border: "border-emerald-500/40",
      aura: "rgba(16, 185, 129, 0.4)",
      badgeBg: "bg-emerald-500/20 border-emerald-400/40 text-emerald-400",
      scanLine: "from-emerald-400 via-teal-300 to-emerald-400",
    },
    indigo: {
      accent: "#6366f1",
      border: "border-indigo-500/40",
      aura: "rgba(99, 102, 241, 0.4)",
      badgeBg: "bg-indigo-500/20 border-indigo-400/40 text-indigo-300",
      scanLine: "from-indigo-400 via-purple-300 to-indigo-400",
    },
    hub: {
      accent: "#6366f1",
      border: "border-indigo-500/40",
      aura: "rgba(99, 102, 241, 0.4)",
      badgeBg: "bg-indigo-500/20 border-indigo-400/40 text-indigo-300",
      scanLine: "from-indigo-400 via-purple-300 to-indigo-400",
    },
    oversight: {
      accent: "#f59e0b",
      border: "border-amber-500/40",
      aura: "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/20 border-amber-400/40 text-amber-400",
      scanLine: "from-amber-400 via-yellow-300 to-amber-400",
    },
    admin: {
      accent: "#f43f5e",
      border: "border-rose-500/40",
      aura: "rgba(244, 63, 94, 0.4)",
      badgeBg: "bg-rose-500/20 border-rose-400/40 text-rose-400",
      scanLine: "from-rose-400 via-pink-300 to-rose-400",
    },
  }[theme] || {
    accent: "#06b6d4",
    border: "border-cyan-400/40",
    aura: "rgba(6, 182, 212, 0.4)",
    badgeBg: "bg-cyan-500/20 border-cyan-400/40 text-cyan-300",
    scanLine: "from-cyan-400 via-sky-300 to-cyan-400",
  };

  const handleScanTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-black/70 border border-white/10 overflow-hidden font-mono select-none">
      {/* Background Holographic Aura Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(${themeConfig.accent} 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
        }}
      />

      {/* Laser Biometric Scan Sweep Line */}
      {isScanning && (
        <div className={`absolute left-0 w-full h-1 bg-gradient-to-r ${themeConfig.scanLine} z-30 shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-bounce top-1/2`} />
      )}

      {/* 3D Memoji Avatar Frame Container */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1">
        {/* Holographic Glowing Pulse Rings */}
        {holoGlow && (
          <>
            <div
              className="absolute w-36 h-36 rounded-full border border-dashed border-white/30 animate-spin"
              style={{ animationDuration: "10s" }}
            />
            <div
              className="absolute w-40 h-40 rounded-full border border-white/10 animate-ping opacity-20"
              style={{ animationDuration: "3s" }}
            />
          </>
        )}

        {/* 3D Memoji Avatar Image Frame with Smooth Expressions & Tilting */}
        <div
          className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl relative z-10 transition-transform duration-500 ease-out"
          style={{
            transform: headTilt ? "rotate(-4deg) scale(1.02)" : "rotate(3deg) scale(1)",
          }}
        >
          <img
            src={expression === "wink" ? "/avatars/memoji_wink.jpg" : "/avatars/memoji_smile.jpg"}
            alt="3D Memoji Avatar"
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Dynamic Expression Emoji Badge Overlay */}
          <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md border border-white/20 px-1.5 py-0.5 rounded-full text-xs shadow-lg animate-pulse">
            {expression === "wink" ? "😉" : "😊"}
          </div>
        </div>
      </div>

      {/* Personnel Name & Role Header */}
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
            setExpression("wink");
          }}
          className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
            expression === "wink" ? themeConfig.badgeBg : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          😉 Wink
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpression("smile");
          }}
          className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
            expression === "smile" ? themeConfig.badgeBg : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          😊 Smile
        </button>

        <button
          onClick={handleScanTrigger}
          className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
            isScanning ? themeConfig.badgeBg : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          🛡️ Scan
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
