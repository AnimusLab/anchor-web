"use client";

interface AnimusLogoProps {
  size?: number;
  variant?: "indigo" | "amber" | "rose";
  className?: string;
}

export default function AnimusLogo({
  size = 40,
  variant = "indigo",
  className = "",
}: AnimusLogoProps) {
  const colors = {
    indigo: {
      glow: "shadow-[0_0_25px_rgba(99,102,241,0.6)]",
      border: "border-indigo-400/50",
      bg: "bg-indigo-500/20",
      stroke: "#818cf8",
      core: "#a5b4fc",
    },
    amber: {
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.6)]",
      border: "border-amber-400/50",
      bg: "bg-amber-500/20",
      stroke: "#fbbf24",
      core: "#fcd34d",
    },
    rose: {
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.6)]",
      border: "border-rose-400/50",
      bg: "bg-rose-500/20",
      stroke: "#fb7185",
      core: "#f43f5e",
    },
  }[variant];

  return (
    <div
      className={`rounded-2xl ${colors.bg} backdrop-blur-xl border ${colors.border} ${colors.glow} flex items-center justify-center p-2 flex-shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Hexagonal Shield Frame */}
        <polygon
          points="24,4 42,12 42,32 24,44 6,32 6,12"
          stroke={colors.stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* Inner Cryptographic Diamond */}
        <polygon
          points="24,12 34,24 24,36 14,24"
          stroke={colors.stroke}
          strokeWidth="2.5"
          fill="none"
          opacity="0.8"
        />

        {/* Central Core Glowing Sovereign Node */}
        <circle cx="24" cy="24" r="4.5" fill={colors.core} />
        
        {/* Core Node Ring */}
        <circle cx="24" cy="24" r="8" stroke={colors.core} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
      </svg>
    </div>
  );
}
