'use client';

import React, { useEffect, useState } from 'react';

export default function SovereignBoundary() {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative border border-gray-800 rounded-xl overflow-hidden bg-[#050505] p-6 md:p-8 mt-12 mb-20 animate-fadeIn">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Visual Map Column */}
        <div className="relative w-full aspect-[4/3] max-w-sm mx-auto border border-gray-800 rounded-lg bg-[#080808] overflow-hidden shadow-2xl">
          
          {/* Animated SVG Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
            <path 
              d="M 80 220 L 320 80" 
              stroke="rgba(59, 130, 246, 0.2)" 
              strokeWidth="2" 
              strokeDasharray="6 4"
            />
            {/* Animated packet */}
            <circle 
              r="4" 
              fill="#60a5fa"
              cx={80 + (240 * animationPhase / 100)}
              cy={220 - (140 * animationPhase / 100)}
            >
              <animate attributeName="fill-opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Top Right Endpoint: HUB */}
          <div className="absolute top-4 right-4 w-32 p-3 border border-blue-900/50 bg-blue-950/20 rounded backdrop-blur-sm text-center">
            <div className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">Cloud Hub</div>
            <div className="text-[8px] text-blue-300/40 font-mono mt-1">Neon Postgres</div>
            <div className="text-[8px] text-blue-500/60 font-mono italic mt-1 uppercase">Metadata Only</div>
          </div>

          {/* Bottom Left Endpoint: SPOKE */}
          <div className="absolute bottom-4 left-4 w-32 p-3 border border-green-900/50 bg-green-950/20 rounded backdrop-blur-sm text-center">
            <div className="text-[10px] text-green-400 font-mono font-bold tracking-widest uppercase">Spoke Node</div>
            <div className="text-[8px] text-green-300/40 font-mono mt-1">Local SQLite</div>
            <div className="text-[8px] text-green-500/60 font-mono italic mt-1 uppercase">Forensic Data</div>
          </div>

          {/* Legend: Centered Bottom */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-[8px] font-mono text-gray-500 bg-black/40 px-2 py-1 rounded">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Sovereign Relay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Local Vault</span>
            </div>
          </div>
        </div>

        {/* Text Content Column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Data Sovereignty by Design</h2>
            <p className="text-sm text-gray-400 font-mono leading-relaxed">
              Anchor utilizes a <span className="text-blue-400">Decentralized Governance Topology</span> where high-sensitivity forensic data never leaves your infrastructure boundaries via REST or standard telemetry paths.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 border border-gray-900 rounded bg-[#080808]/50">
              <div className="text-blue-500 text-xl font-bold font-mono">01</div>
              <div>
                <div className="text-xs font-bold text-gray-200 tracking-widest uppercase mb-1">Cryptographic Header Tossing</div>
                <p className="text-[11px] text-gray-500 font-mono leading-normal">
                  Spoke nodes transmit only ~200 bytes of metadata (chain hashes and compliance flags) to the central Hub.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border border-gray-900 rounded bg-[#080808]/50">
              <div className="text-green-500 text-xl font-bold font-mono">02</div>
              <div>
                <div className="text-xs font-bold text-gray-200 tracking-widest uppercase mb-1">Local Spoke Storage</div>
                <p className="text-[11px] text-gray-500 font-mono leading-normal">
                  Raw prompts, RAG hits, and tool outputs are stored in a project-local SQLite database. Your data is isolated per-entity.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border border-gray-900 rounded bg-[#080808]/50">
              <div className="text-cyan-500 text-xl font-bold font-mono">03</div>
              <div>
                <div className="text-xs font-bold text-gray-200 tracking-widest uppercase mb-1">On-Demand Forensic Relay</div>
                <p className="text-[11px] text-gray-500 font-mono leading-normal">
                  Auditors request forensic access via the Sovereign Relay Protocol. Data is AES-256-GCM encrypted at the edge before transit.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
