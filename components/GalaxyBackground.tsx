"use client";

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040711]">
      {/* 1. Rotating Deep Cosmic Nebula Layer */}
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_30%_20%,rgba(56,189,248,0.22)_0%,transparent_50%),radial-gradient(ellipse_at_70%_25%,rgba(147,51,234,0.18)_0%,transparent_50%),radial-gradient(ellipse_at_40%_75%,rgba(16,185,129,0.15)_0%,transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(245,158,11,0.12)_0%,transparent_50%)] animate-[galaxySpin_45s_linear_infinite]" />

      {/* 2. Secondary Counter-Rotating Celestial Mesh Layer */}
      <div className="absolute -top-[40%] -left-[40%] w-[180%] h-[180%] bg-[radial-gradient(circle_at_60%_40%,rgba(99,102,241,0.16)_0%,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.12)_0%,transparent_40%)] animate-[galaxySpinReverse_60s_linear_infinite]" />

      {/* 3. Twinkling Starfield Layer 1 */}
      <div 
        className="absolute inset-0 opacity-80 animate-[starfieldPulse_8s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 40px 60px, rgba(255,255,255,0.95), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 150px 220px, rgba(56,189,248,0.9), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 300px 80px, rgba(255,255,255,0.85), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 420px 350px, rgba(168,85,247,0.9), rgba(0,0,0,0)),
            radial-gradient(2.5px 2.5px at 580px 180px, rgba(255,255,255,0.95), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 700px 420px, rgba(16,185,129,0.85), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 850px 120px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 980px 300px, rgba(56,189,248,0.9), rgba(0,0,0,0))
          `,
          backgroundSize: '1000px 600px'
        }}
      />

      {/* 4. Twinkling Starfield Layer 2 (Offset Small Stars) */}
      <div 
        className="absolute inset-0 opacity-60 animate-[starfieldPulse_12s_ease-in-out_infinite_alternate-reverse]"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 80px 180px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 240px 390px, rgba(245,158,11,0.85), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 480px 110px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 620px 490px, rgba(56,189,248,0.85), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 780px 210px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 920px 450px, rgba(168,85,247,0.9), rgba(0,0,0,0))
          `,
          backgroundSize: '1100px 700px'
        }}
      />

      {/* 5. Spatial Perspective Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
    </div>
  );
}
