"use client";

import { useEffect, useRef } from "react";

export default function SolarSystemBackground() {
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

    // Subtle Stars
    const stars: Array<{ x: number; y: number; r: number; alpha: number; speed: number }> = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        alpha: Math.random() * 0.5 + 0.2,
        speed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    // Solar System Planets Configuration
    const planets = [
      { name: "Mercury", orbitR: 100, r: 2.2, color: "#94a3b8", speed: 0.012, angle: Math.random() * Math.PI * 2 },
      { name: "Venus", orbitR: 155, r: 4, color: "#cbd5e1", speed: 0.009, angle: Math.random() * Math.PI * 2 },
      { name: "Earth", orbitR: 215, r: 4.5, color: "#38bdf8", speed: 0.007, angle: Math.random() * Math.PI * 2 },
      { name: "Mars", orbitR: 275, r: 3.2, color: "#f87171", speed: 0.005, angle: Math.random() * Math.PI * 2 },
      { name: "Jupiter", orbitR: 360, r: 9, color: "#fbbf24", speed: 0.003, angle: Math.random() * Math.PI * 2 },
      { name: "Saturn", orbitR: 450, r: 7.5, color: "#fef08a", speed: 0.002, angle: Math.random() * Math.PI * 2, hasRing: true },
      { name: "Uranus", orbitR: 540, r: 5.5, color: "#22d3ee", speed: 0.0015, angle: Math.random() * Math.PI * 2 },
      { name: "Neptune", orbitR: 630, r: 5, color: "#60a5fa", speed: 0.001, angle: Math.random() * Math.PI * 2 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Stars
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha <= 0.15 || star.alpha >= 0.8) star.speed = -star.speed;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      });

      // Solar System Center (Offset towards right/center)
      const sunX = width * 0.65;
      const sunY = height * 0.45;

      // 2. Draw Subtle Orbit Rings (Soothing 0.035 opacity)
      planets.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(sunX, sunY, p.orbitR, p.orbitR * 0.45, -Math.PI / 12, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 3. Draw Sun
      ctx.beginPath();
      ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 30);
      sunGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      sunGradient.addColorStop(0.3, "rgba(253, 224, 71, 0.7)");
      sunGradient.addColorStop(0.7, "rgba(245, 158, 11, 0.25)");
      sunGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = sunGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(253, 224, 71, 0.5)";
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Draw Orbiting Planets
      planets.forEach((p) => {
        p.angle += p.speed;

        const rx = p.orbitR;
        const ry = p.orbitR * 0.45;
        const tilt = -Math.PI / 12;

        const unrotatedX = rx * Math.cos(p.angle);
        const unrotatedY = ry * Math.sin(p.angle);

        const x = sunX + unrotatedX * Math.cos(tilt) - unrotatedY * Math.sin(tilt);
        const y = sunY + unrotatedX * Math.sin(tilt) + unrotatedY * Math.cos(tilt);

        // Planet Body
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Saturn Ring
        if (p.hasRing) {
          ctx.beginPath();
          ctx.ellipse(x, y, p.r * 2.2, p.r * 0.7, Math.PI / 6, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
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
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}
