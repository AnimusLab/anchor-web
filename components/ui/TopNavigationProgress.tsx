"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation has completed!
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept all internal link clicks to trigger instant visual progress bar
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) {
        return;
      }

      // If clicking the current exact page, don't trigger
      if (href === pathname) return;

      setIsNavigating(true);
      setProgress(25);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + Math.random() * 15;
        });
      }, 150);

      // Failsafe cleanup
      setTimeout(() => clearInterval(interval), 4000);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, [pathname]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-1 bg-transparent">
      {/* Glow aura */}
      <div
        className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Scanning Laser Head */}
      {isNavigating && (
        <div
          className="absolute top-0 w-8 h-1.5 bg-white blur-[1px] shadow-[0_0_15px_#ffffff] transition-all duration-200"
          style={{ left: `calc(${progress}% - 32px)` }}
        />
      )}
    </div>
  );
}
