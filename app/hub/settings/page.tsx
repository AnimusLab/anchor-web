"use client";

import { Settings, Save, Shield, Server, RefreshCw, Key } from "lucide-react";

export default function HubSettingsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-slate-400">ON-PREMISE SILO CONFIGURATION</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Hub Settings</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Configure Hub silo identity, P2P relay endpoints, webhooks, and Dual-Key policies.</p>
        </div>

        <button className="glass-badge px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition">
          <Save className="w-4 h-4" />
          <span>Save Hub Configuration</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 font-mono text-xs">
        {/* Hub Silo Details */}
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <span className="animus-label text-sky-400">HUB SILO IDENTIFIER</span>
            <span className="text-slate-400">Silo ID: JPMC-IN-MUM01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">ENTERPRISE NAME</label>
              <input
                type="text"
                defaultValue="JP Morgan Chase (India)"
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">PRIMARY JURISDICTION REGION</label>
              <input
                type="text"
                defaultValue="RBI-IN (Reserve Bank of India)"
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* P2P Relay Configuration */}
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="animus-label text-emerald-400">P2P RELAY PROTOCOL SETTINGS</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">P2P ENDPOINT URL</label>
              <input
                type="text"
                defaultValue="wss://relay.animuslab.dev/v1/p2p/hub/JPMC-IN-MUM01"
                className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="hybridmode" defaultChecked className="rounded border-white/10 bg-[#040711]" />
              <label htmlFor="hybridmode" className="text-slate-300 font-sans text-xs">Enable Hybrid P2P Telemetry Mode (Raw decision logs stored on-premise only)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
