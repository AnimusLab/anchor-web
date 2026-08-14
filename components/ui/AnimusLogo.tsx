"use client";

interface AnimusLogoProps {
  size?: number;
  variant?: "indigo" | "amber" | "rose" | "silver";
  className?: string;
}

export default function AnimusLogo({
  size = 44,
  variant = "silver",
  className = "",
}: AnimusLogoProps) {
  // Theme color accents for subtle glow borders if needed
  const colors = {
    indigo: {
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.5)]",
      border: "border-indigo-400/40",
      bg: "bg-indigo-500/15",
    },
    amber: {
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]",
      border: "border-amber-400/40",
      bg: "bg-amber-500/15",
    },
    rose: {
      glow: "shadow-[0_0_30px_rgba(244,63,94,0.5)]",
      border: "border-rose-400/40",
      bg: "bg-rose-500/15",
    },
    silver: {
      glow: "shadow-[0_0_30px_rgba(255,255,255,0.4)]",
      border: "border-white/30",
      bg: "bg-white/10",
    },
  }[variant];

  return (
    <div
      className={`rounded-2xl ${colors.bg} backdrop-blur-xl border ${colors.border} ${colors.glow} flex items-center justify-center p-2 flex-shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 3D Metallic "A" Logo with Central Isometric Cube */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Metallic Silver Gradients */}
          <linearGradient id="metalLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>

          <linearGradient id="metalMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          <linearGradient id="metalDark" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>

          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>

          <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
        </defs>

        {/* Left Leg Base Side */}
        <polygon points="94,22 18,172 48,172 82,106 108,106 108,82 82,82" fill="url(#metalDark)" />

        {/* Left Leg Facet Light Face */}
        <polygon points="94,22 108,50 48,172 18,172" fill="url(#metalLight)" />

        {/* Right Leg Base Side */}
        <polygon points="106,22 182,172 152,172 118,106 92,106 92,82 118,82" fill="url(#metalMid)" />

        {/* Right Leg Facet Light Face */}
        <polygon points="106,22 92,50 152,172 182,172" fill="url(#metalLight)" />

        {/* Left Ribbon Wrap Facet */}
        <polygon points="34,142 84,106 100,134 50,170" fill="url(#metalDark)" />

        {/* Right Ribbon Wrap Facet */}
        <polygon points="166,142 116,106 100,134 150,170" fill="url(#metalMid)" />

        {/* ================= CENTRAL ISOMETRIC 3D CUBE ================= */}
        {/* Cube Top Face */}
        <polygon points="100,74 130,90 100,106 70,90" fill="url(#cubeTop)" stroke="#9ca3af" strokeWidth="1" />

        {/* Cube Left Face */}
        <polygon points="70,90 100,106 100,140 70,124" fill="url(#cubeLeft)" stroke="#6b7280" strokeWidth="1" />

        {/* Cube Right Face */}
        <polygon points="100,106 130,90 130,124 100,140" fill="url(#cubeRight)" stroke="#4b5563" strokeWidth="1" />
      </svg>
    </div>
  );
}
