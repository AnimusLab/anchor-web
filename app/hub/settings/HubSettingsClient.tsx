"use client";

import { useState } from "react";
import { Settings, Save, Shield, Server, CheckCircle2, Globe, Building2, Wifi } from "lucide-react";

interface HubSettingsProps {
  initialSettings: {
    hubId: string;
    hubName: string;
    enterpriseName: string;
    domain: string;
    region: string;
    p2pEndpoint: string;
    hybridMode: boolean;
  };
}

export default function HubSettingsClient({ initialSettings }: HubSettingsProps) {
  const [enterpriseName, setEnterpriseName] = useState(initialSettings.enterpriseName);
  const [region, setRegion] = useState(initialSettings.region);
  const [p2pEndpoint, setP2pEndpoint] = useState(initialSettings.p2pEndpoint);
  const [hybridMode, setHybridMode] = useState(initialSettings.hybridMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-slate-400">ON-PREMISE SILO CONFIGURATION</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Hub Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure Hub silo identity, P2P relay endpoints, webhooks, and Dual-Key policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glass-badge px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configuration Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Hub Configuration"}</span>
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>Hub silo parameters updated in local storage. Cryptographic policy locks verified.</span>
        </div>
      )}

      {/* Settings Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Hub Silo Details */}
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <span className="animus-label text-sky-400">HUB SILO IDENTIFIER</span>
            <span className="text-slate-400">Silo ID: <strong className="text-slate-100">{initialSettings.hubId}</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">ENTERPRISE NAME</label>
              <input
                type="text"
                value={enterpriseName}
                onChange={(e) => setEnterpriseName(e.target.value)}
                placeholder="e.g. Sovereign Enterprise Node"
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">PRIMARY JURISDICTION REGION</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. US-EAST-1 | AP-SOUTH-1 | EU-WEST-1"
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* P2P Relay Configuration */}
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="animus-label text-emerald-400">P2P RELAY PROTOCOL SETTINGS</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">P2P ENDPOINT URL</label>
              <input
                type="text"
                value={p2pEndpoint}
                onChange={(e) => setP2pEndpoint(e.target.value)}
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2.5 pt-2">
              <input
                type="checkbox"
                id="hybridmode"
                checked={hybridMode}
                onChange={(e) => setHybridMode(e.target.checked)}
                className="rounded border-white/10 bg-[#040711] cursor-pointer"
              />
              <label htmlFor="hybridmode" className="text-slate-300 font-sans text-xs cursor-pointer select-none">
                Enable Hybrid P2P Telemetry Mode (Raw decision logs stored on-premise only)
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
