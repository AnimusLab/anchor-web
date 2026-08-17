import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "text" | "card";
}

export default function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  let baseStyles = "animate-pulse bg-white/10 rounded-xl relative overflow-hidden";

  if (variant === "circular") {
    baseStyles = "animate-pulse bg-white/10 rounded-full relative overflow-hidden";
  } else if (variant === "text") {
    baseStyles = "animate-pulse bg-white/10 rounded-md h-4 relative overflow-hidden";
  } else if (variant === "card") {
    baseStyles = "animate-pulse bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden";
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="pure-glass-card p-6 rounded-3xl space-y-4 border border-white/10 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="rectangular" className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton variant="text" className="w-2/3 h-4" />
      <div className="pt-4 flex justify-between items-center">
        <Skeleton variant="rectangular" className="w-24 h-8 rounded-xl" />
        <Skeleton variant="rectangular" className="w-16 h-8 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="p-4 bg-black/30 rounded-2xl border border-white/10 flex justify-between items-center animate-pulse gap-4">
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <Skeleton variant="rectangular" className="w-20 h-7 rounded-full" />
    </div>
  );
}

export function SkeletonDashboardHeader() {
  return (
    <div className="pure-glass-card p-6 rounded-3xl space-y-6 border border-white/10 animate-pulse">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="space-y-2 w-1/2">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-3/4 h-8" />
        </div>
        <Skeleton variant="rectangular" className="w-32 h-10 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2">
            <Skeleton variant="text" className="w-1/2 h-3" />
            <Skeleton variant="text" className="w-3/4 h-6" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
