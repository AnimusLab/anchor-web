"use client";

import { useEffect, useRef } from "react";

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate 350 Star Particles
    const numStars = 350;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      alpha: number;
      alphaSpeed: number;
      vx: number;
      vy: number;
    }> = [];

    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(56, 189, 248, ",   // Electric Cyan
      "rgba(168, 85, 247, ",   // Deep Purple
      "rgba(236, 72, 153, ",   // Cosmic Pink
      "rgba(16, 185, 129, "    // Emerald
    ];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random(),
        alphaSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    // Render Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Star Particles
      stars.forEach((star) => {
        star.alpha += star.alphaSpeed;
        if (star.alpha <= 0.1 || star.alpha >= 1) {
          star.alphaSpeed = -star.alphaSpeed;
        }

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color + star.alpha + ")";
        ctx.shadowBlur = star.radius > 1.5 ? 8 : 0;
        ctx.shadowColor = star.color + "1)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#04060f]">
      {/* Vibrant Rotating Nebula Cloud Layer 1 */}
      <div 
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-[galaxySpin_40s_linear_infinite]"
        style={{
          background: `
            radial-gradient(circle at 35% 25%, rgba(56, 189, 248, 0.28) 0%, transparent 40%),
            radial-gradient(circle at 75% 30%, rgba(147, 51, 234, 0.25) 0%, transparent 45%),
            radial-gradient(circle at 45% 75%, rgba(16, 185, 129, 0.2) 0%, transparent 45%),
            radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.22) 0%, transparent 40%)
          `
        }}
      />

      {/* Vibrant Rotating Nebula Cloud Layer 2 (Counter Rotation) */}
      <div 
        className="absolute -top-[40%] -left-[40%] w-[180%] h-[180%] animate-[galaxySpinReverse_55s_linear_infinite]"
        style={{
          background: `
            radial-gradient(circle at 65% 45%, rgba(99, 102, 241, 0.22) 0%, transparent 45%),
            radial-gradient(circle at 25% 75%, rgba(245, 158, 11, 0.18) 0%, transparent 40%)
          `
        }}
      />

      {/* Live HTML5 Canvas Twinkling Star Particle Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Spatial Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:28px_28px] opacity-50" />
    </div>
  );
}
