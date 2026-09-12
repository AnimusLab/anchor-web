"use client";

import { useTheme } from "@/lib/theme";

export default function SolarSystemBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 bg-[#FAFAFC] dark:bg-[#06080E]">
      {/* Precision Micro-Grid Blueprint Matrix */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px)"
            : "radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Atmospheric Ambient Glow 1 - Top Center Indigo Bloom */}
      <div
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[150px] transition-all duration-700 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.16) 0%, rgba(56, 189, 248, 0.06) 40%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.08) 0%, rgba(147, 197, 253, 0.04) 40%, transparent 70%)",
        }}
      />

      {/* Atmospheric Ambient Glow 2 - Bottom Right Cyan/Violet Rim */}
      <div
        className="absolute -bottom-[15%] -right-[5%] w-[700px] h-[600px] rounded-full blur-[140px] transition-all duration-700 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(56, 189, 248, 0.03) 50%, transparent 75%)",
        }}
      />

      {/* Atmospheric Ambient Glow 3 - Bottom Left Emerald Hint for Compliance */}
      <div
        className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[500px] rounded-full blur-[130px] transition-all duration-700 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

