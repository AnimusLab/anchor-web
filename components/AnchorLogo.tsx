import React from "react";

interface AnchorLogoProps {
  size?: number;
  className?: string;
  variant?: "solid" | "monochrome" | "indigo" | "white";
}

/**
 * Anchor Brand Mark — "The Invariant Interceptor"
 * 
 * Philosophy:
 * Focuses on what Anchor actually does:
 * - Runtime Interception: A dynamic vector captured at the execution boundary.
 * - Invariant Gate: An unbroken geometric boundary framing autonomous execution.
 * - Cryptographic Seal: An immutable coordinate point at the exact mathematical center.
 */
export function AnchorLogo({
  size = 24,
  className = "",
  variant = "white",
}: AnchorLogoProps) {
  const primaryColor =
    variant === "white"
      ? "#FFFFFF"
      : variant === "monochrome"
      ? "#111111"
      : variant === "indigo"
      ? "#5B5CF6"
      : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Invariant Gate (Rotated Rounded Square Boundary) */}
      <rect
        x="12"
        y="1.75"
        width="14.5"
        height="14.5"
        rx="3.5"
        transform="rotate(45 12 1.75)"
        stroke={primaryColor}
        strokeWidth="1.8"
      />

      {/* Dynamic Execution Axes (Runtime Trajectory Cross) */}
      <path
        d="M12 5.5V9.5M12 14.5V18.5M5.5 12H9.5M14.5 12H18.5"
        stroke={primaryColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Central Immutable Cryptographic Node */}
      <circle cx="12" cy="12" r="1.75" fill={primaryColor} />
    </svg>
  );
}

export function AnchorWordmark({
  logoSize = 18,
  className = "",
  variant = "dark",
}: {
  logoSize?: number;
  className?: string;
  variant?: "dark" | "light";
}) {
  const textColor = variant === "light" ? "#FFFFFF" : "#111111";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black text-white shadow-sm transition-transform duration-200 hover:scale-105">
        <AnchorLogo size={logoSize} variant="white" />
      </div>
      <span
        className="font-bold text-base tracking-tight"
        style={{ color: textColor }}
      >
        anchor
      </span>
    </div>
  );
}
