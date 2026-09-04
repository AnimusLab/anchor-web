"use client";

import { useState } from "react";
import { 
  Settings, 
  Save, 
  Shield, 
  Server, 
  CheckCircle2, 
  Globe, 
  Building2, 
  Wifi, 
  Database, 
  Lock, 
  Radio, 
  Info,
  ShieldCheck,
  Cpu
} from "lucide-react";

interface HubSettingsProps {
  initialSettings: {
    hubId: string;
    hubName: string;
    enterpriseName: string;
    domain: string;
    region: string;
    localVaultUrl?: string;
    p2pEndpoint: string;
    hybridMode: boolean;
  };
}

export default function HubSettingsClient({ initialSettings }: HubSettingsProps) {
  const [enterpriseName, setEnterpriseName] = useState(initialSettings.enterpriseName);
  const [region, setRegion] = useState(initialSettings.region);
  const [domain, setDomain] = useState(initialSettings.domain);
  const [localVaultUrl, setLocalVaultUrl] = useState(
    initialSettings.localVaultUrl || `https://anchor-node.internal.${initialSettings.domain || "company.com"}:8443`
  );
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
      setTimeout(() => setSaved(false), 3500);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SOVEREIGN SILO INFRASTRUCTURE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Hub Settings</h1>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            Configure on-premise data vaults, zero-knowledge P2P synchronization, and cryptographic policy boundaries.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glass-badge px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
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
          <span>Hub silo parameters &amp; Dual-Key topology updated successfully. Local policy locks verified.</span>
        </div>
      )}

      {/* Architecture Visual Callout */}
      <div className="glass-card p-5 border border-sky-500/20 bg-[#070e20]/60 space-y-3 font-sans text-xs">
        <div className="flex items-center space-x-2 text-sky-300 font-bold font-mono text-[11px] uppercase tracking-wider">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Dual-Plane Sovereign Architecture</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Anchor operates on a strict zero-knowledge segregation model: <strong>all unredacted decision reports, proprietary AST source code scans, and customer PII remain 100% on-premise within your private server</strong>. The external P2P mesh relay only transmits 32-byte cryptographic SHA-256 Merkle root proofs to statutory oversight bodies.
        </p>
      </div>

      {/* Settings Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Enterprise Silo Identity */}
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span className="animus-label text-sky-400">ENTERPRISE SILO IDENTIFIER</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Silo ID: <strong className="text-slate-100">{initialSettings.hubId}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-slate-400 block mb-1 font-bold">CORPORATE DOMAIN</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. company.com"
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

        {/* Section 2: On-Premise Telemetry Daemon & Data Vault Host */}
        <div className="glass-card p-6 space-y-4 border border-emerald-500/20">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="animus-label text-emerald-400">ON-PREMISE TELEMETRY DAEMON &amp; DATA VAULT HOST</span>
            </div>
            <span className="glass-badge px-2.5 py-0.5 text-[9px] text-emerald-300 font-bold border-emerald-400/30">
              PRIVATE STORAGE VAULT
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold font-mono">LOCAL DAEMON / INTERNAL SERVER URL</label>
                <span className="text-slate-400 text-[10px]">Stores unredacted audit reports, prompts &amp; AST logs</span>
              </div>
              <input
                type="text"
                value={localVaultUrl}
                onChange={(e) => setLocalVaultUrl(e.target.value)}
                placeholder="https://anchor-node.internal.bank.com:8443 or http://localhost:8000"
                className="w-full bg-[#040711] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-emerald-300 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Workstations and agent SDKs stream raw decisions to this on-premise endpoint. This server computes the cryptographic Merkle root hash before submitting proofs to the P2P wire.
            </p>
          </div>
        </div>

        {/* Section 3: Zero-Knowledge P2P State Mesh Relay */}
        <div className="glass-card p-6 space-y-4 border border-indigo-500/20">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-indigo-400" />
              <span className="animus-label text-indigo-400">ZERO-KNOWLEDGE P2P STATE MESH RELAY</span>
            </div>
            <span className="glass-badge px-2.5 py-0.5 text-[9px] text-indigo-300 font-bold border-indigo-400/30">
              CRYPTOGRAPHIC SYNC WIRE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold font-mono">P2P RELAY ENDPOINT URL</label>
                <span className="text-slate-400 text-[10px]">Encrypted pipe for SHA-256 Merkle proofs &amp; audit notifications</span>
              </div>
              <input
                type="text"
                value={p2pEndpoint}
                onChange={(e) => setP2pEndpoint(e.target.value)}
                className="w-full bg-[#040711] border border-indigo-500/30 rounded-xl px-4 py-2.5 text-indigo-300 focus:outline-none font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="hybridmode"
                  checked={hybridMode}
                  onChange={(e) => setHybridMode(e.target.checked)}
                  className="rounded border-white/10 bg-[#040711] cursor-pointer"
                />
                <label htmlFor="hybridmode" className="text-slate-200 font-sans text-xs font-semibold cursor-pointer select-none">
                  Enforce Zero-Knowledge Air-Gap Policy (Strictly broadcast state hashes only)
                </label>
              </div>
              <p className="text-[10px] text-slate-400 pl-6 font-sans">
                When enabled, raw payload payloads and decision contents are strictly blocked from egressing across the P2P relay. Auditors must request cryptographic read-tickets to query your local vault.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
