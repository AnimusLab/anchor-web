import { getSession } from "@/lib/auth/session";
import { PrismaClient } from "@prisma/client";
import { ShieldCheck, Layers, AlertTriangle, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function HubOverviewPage() {
  const session = await getSession();

  const userHubId = session?.hubId || "HUB-UNASSIGNED";

  const [projectsCount, violationsCount, ledgerEntries] = await Promise.all([
    prisma.project.count({ where: session?.hubId ? { hubId: session.hubId } : {} }),
    prisma.telemetryEvent.count({
      where: {
        complianceVerdict: "NON_COMPLIANT",
        ...(session?.hubId ? { hubId: session.hubId } : {}),
      },
    }),
    prisma.ledgerEntry.findMany({
      where: session?.hubId ? { hubId: session.hubId } : {},
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-slate-400">ENTERPRISE GOVERNANCE TERMINAL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Hub Overview</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Silo ID: {userHubId} · Mode: Hybrid P2P Telemetry</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">CLEARANCE: </span>
          <span className="text-emerald-400 font-bold glass-badge px-3.5 py-1.5 inline-block uppercase">
            {session?.role || "USER"} CLEARANCE
          </span>
        </div>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">COMPLIANCE RATE</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">100%</div>
          <div className="text-xs text-slate-400 font-mono">{projectsCount} Active Projects</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">PACKAGE TIER</span>
            <Layers className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">Sovereign</div>
          <div className="text-xs text-slate-400 font-mono">Isolated Hub Node</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-amber-400">FLAGGED FINDINGS</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">{violationsCount} Flaws</div>
          <div className="text-xs text-slate-400 font-mono">Active violations</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">TELEMETRY STREAM</span>
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">P2P Live</div>
          <div className="text-xs text-slate-400 font-mono">Raw data on-premise</div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">DECISION AUDIT CHAIN (DAC) ENTRIES</span>
          <span className="text-xs font-mono text-slate-400 font-semibold">Live P2P Stream ({ledgerEntries.length})</span>
        </div>

        <div className="p-5 space-y-4">
          {ledgerEntries.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
              NO AUDIT TRAIL ENTRIES YET // NODE STREAM READY
            </div>
          ) : (
            ledgerEntries.map((entry) => (
              <div key={entry.id} className="glass-card-inset p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold text-base">{entry.id}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-200 font-semibold">{entry.projectName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">Chain Hash: {entry.chainHash}</div>
                </div>
                <span className="text-emerald-400 font-bold glass-badge px-3.5 py-1.5">
                  VERIFIED ({entry.type})
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

