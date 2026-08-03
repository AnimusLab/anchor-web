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

    // Generate 400 Serious Pure White & Silver Stars
    const numStars = 400;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      alphaSpeed: number;
      vx: number;
      vy: number;
      isBright: boolean;
    }> = [];

    for (let i = 0; i < numStars; i++) {
      const isBright = Math.random() < 0.15; // 15% bright glint stars
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isBright ? Math.random() * 1.5 + 1 : Math.random() * 0.9 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        isBright,
      });
    }

    // Render Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Pure White Star Field
      stars.forEach((star) => {
        star.alpha += star.alphaSpeed;
        if (star.alpha <= 0.15 || star.alpha >= 0.95) {
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
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;

        if (star.isBright) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(255, 255, 255, ${star.alpha})`;
        } else {
          ctx.shadowBlur = 0;
        }

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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03050a]">
      {/* Subtle Deep Space Dark Dust Shadow (No Color) */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.4) 0%, transparent 80%),
            radial-gradient(circle at 80% 20%, rgba(2, 6, 23, 0.6) 0%, transparent 60%)
          `
        }}
      />

      {/* Pure White HTML5 Canvas Starfield Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Serious Fine Spatial Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
    </div>
  );
}
