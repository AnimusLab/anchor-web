"use client";

import { Layers, Plus, Shield, Cpu, Key, FolderCheck } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  siloId: string;
  agentsCount: number;
  keysCount: number;
  status: "ACTIVE" | "MAINTENANCE";
  createdAt: string;
}

const MOCK_PROJECTS: ProjectItem[] = [
  { id: "proj_01", name: "payments-service", siloId: "SILO-MUM-01", agentsCount: 4, keysCount: 2, status: "ACTIVE", createdAt: "2026-05-12" },
  { id: "proj_02", name: "wealth-advisor-agent", siloId: "SILO-MUM-02", agentsCount: 2, keysCount: 1, status: "ACTIVE", createdAt: "2026-06-01" },
  { id: "proj_03", name: "credit-decisioning", siloId: "SILO-MUM-01", agentsCount: 6, keysCount: 3, status: "ACTIVE", createdAt: "2026-06-18" },
  { id: "proj_04", name: "kyc-verifier", siloId: "SILO-MUM-03", agentsCount: 3, keysCount: 1, status: "MAINTENANCE", createdAt: "2026-07-04" }
];

export default function ProjectInventoryPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">ISOLATED ENCLAVE INVENTORY</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Project Inventory</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Manage project silos, AI agent bindings, and cryptographic isolation boundaries.</p>
        </div>

        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Provision New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_PROJECTS.map((proj) => (
          <div key={proj.id} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-100 font-mono">{proj.name}</h3>
                  <span className={`glass-badge px-2.5 py-0.5 text-[10px] font-mono font-bold ${proj.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {proj.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Silo: {proj.siloId}</span>
              </div>
              <span className="text-xs font-mono text-slate-500">{proj.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs glass-card-inset p-4">
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">BOUND AGENTS</span>
                  <span className="text-slate-100 font-bold">{proj.agentsCount} AI Agents</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Key className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">API KEYS</span>
                  <span className="text-slate-100 font-bold">{proj.keysCount} Vault Keys</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono pt-2">
              <span className="text-slate-500">Created: {proj.createdAt}</span>
              <button className="text-sky-400 hover:underline">Manage Silo Settings →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
