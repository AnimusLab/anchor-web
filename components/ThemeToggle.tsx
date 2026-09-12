"use client";

import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { isDark, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
        isDark
          ? "bg-[#18181B] text-amber-300 border-white/10 hover:bg-white/10"
          : "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-100 hover:text-black"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
