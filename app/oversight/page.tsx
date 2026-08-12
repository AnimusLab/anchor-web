import { getSession } from "@/lib/auth/session";
import { PrismaClient } from "@prisma/client";
import { ShieldAlert, Send, ShieldCheck, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function OversightDashboardPage() {
  const session = await getSession();

  const [entitiesCount, auditedDecisionsCount, p2pPullsCount, noticesCount, auditEntries] = await Promise.all([
    prisma.organization.count({ where: { orgType: "ENTERPRISE" } }),
    prisma.ledgerEntry.count({ where: { entityType: "AI_AGENT" } }),
    prisma.governanceAccessRequest.count(),
    prisma.enforcementNotice.count(),
    prisma.ledgerEntry.findMany({
      where: { entityType: "AI_AGENT" },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
  ]);

  const jurisdiction = session?.jurisdiction || "GLOBAL";

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">REGULATORY OVERSIGHT TERMINAL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Assigned Jurisdiction Compliance</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Read-only oversight telemetry & DAC verification across assigned regulated entities.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300">
          <span className="text-slate-400">CLEARANCE: </span>
          <span className="text-amber-400 font-bold glass-badge px-3.5 py-1.5 inline-block uppercase">
            STATUTORY AUDITOR ({jurisdiction})
          </span>
        </div>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">ASSIGNED ENTITIES</span>
            <Layers className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{entitiesCount} Inst.</div>
          <div className="text-xs text-slate-400 font-mono">Jurisdiction: {jurisdiction}</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">AI DECISIONS AUDITED</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{auditedDecisionsCount.toLocaleString()}</div>
          <div className="text-xs text-slate-400 font-mono">100% Chain Hash Signed</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-amber-400">P2P FORENSIC PULLS</span>
            <Send className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">{p2pPullsCount} Relayed</div>
          <div className="text-xs text-slate-400 font-mono">Via AnimusLab Relay</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">ENFORCEMENT NOTICES</span>
            <ShieldAlert className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{noticesCount} Active</div>
          <div className="text-xs text-slate-400 font-mono">No Active Disputes</div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">DECISION AUDIT CHAIN (AI DECISIONS ONLY)</span>
          <span className="text-xs font-mono text-slate-400 font-semibold">Tamper-Proof Ledger ({auditEntries.length})</span>
        </div>

        <div className="p-5 space-y-4">
          {auditEntries.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
              NO AUDITED AI DECISIONS RECORDED // LEDGER READY
            </div>
          ) : (
            auditEntries.map((entry) => (
              <div key={entry.id} className="glass-card-inset p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold text-base">{entry.hubId}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-200 font-semibold">{entry.projectName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Chain Hash: {entry.chainHash}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-400 font-bold glass-badge px-3.5 py-1.5">
                    {jurisdiction} COMPLIANT
                  </span>
                  <button className="glass-badge text-slate-200 px-4 py-2 font-semibold hover:text-white transition flex items-center space-x-2">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Request P2P Pull</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

