"use client";

import { Server } from "lucide-react";

interface HubFleetItem {
  id: string;
  name: string;
  region: string;
  tier: string;
  status: "ONLINE" | "DEGRADED";
  version: string;
  uptime: string;
}

const EMPTY_FLEET: HubFleetItem[] = [];

export default function FleetInspectionPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">MULTI-TENANT HUB FLEET</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Fleet Inspection</h1>
          <p className="text-sm text-slate-400 mt-1">Health monitoring and version telemetry for on-premise Enterprise Hub nodes.</p>
        </div>
      </div>

      <div className="space-y-4">
        {EMPTY_FLEET.length === 0 ? (
          <div className="glass-card p-8 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
            NO ENTERPRISE HUB NODES PROVISIONED YET // FLEET INACTIVE
          </div>
        ) : (
          EMPTY_FLEET.map((f) => (
            <div key={f.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-slate-100 font-sans">{f.name}</h3>
                  <span className="glass-badge px-2.5 py-0.5 text-emerald-400 font-bold text-[10px]">{f.status}</span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Silo ID: {f.id} · Region: {f.region} · Tier: {f.tier}
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[10px]">UPTIME: <span className="text-emerald-400 font-bold">{f.uptime}</span></div>
                <div className="text-slate-500 text-[10px]">Node Version: {f.version}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

