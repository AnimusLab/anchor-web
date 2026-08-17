import { getSession } from "@/lib/auth/session";
import { PrismaClient } from "@prisma/client";
import {
  ShieldCheck,
  Building2,
  Send,
  FileCheck,
  Globe,
  Lock,
  Clock,
  Shield,
  Layers,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function OversightDashboardPage() {
  const session = await getSession();
  const jurisdiction = session?.jurisdiction || "GLOBAL (EU AI ACT / SEC)";
  const auditorEmail = session?.email || "auditor@statutory.gov";

  let entitiesCount = 0;
  let auditedCount = 0;
  let p2pPullsCount = 0;
  let noticesCount = 0;
  let dbOrgs: any[] = [];
  let dbLedger: any[] = [];

  try {
    const [eCount, dCount, pCount, nCount, orgs, ledger] = await Promise.all([
      prisma.organization.count({ where: { orgType: "ENTERPRISE" } }),
      prisma.ledgerEntry.count(),
      prisma.governanceAccessRequest.count(),
      prisma.enforcementNotice.count(),
      prisma.organization.findMany({ take: 5, include: { _count: { select: { hubs: true } } } }),
      prisma.ledgerEntry.findMany({ take: 5, orderBy: { timestamp: "desc" } }),
    ]);

    entitiesCount = eCount;
    auditedCount = dCount;
    p2pPullsCount = pCount;
    noticesCount = nCount;
    dbOrgs = orgs;
    dbLedger = ledger;
  } catch (err) {
    console.error("Oversight page live query error:", err);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 font-sans">
      {/* Top Banner */}
      <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-amber-400/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-mono text-amber-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>STATUTORY REGULATORY OVERSIGHT CONTROL PLANE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
              REGULATORY OVERSIGHT CONTROL PLANE
            </h1>
            <p className="text-sm text-slate-300 font-mono mt-1">
              Jurisdiction: <span className="text-amber-300 font-bold">{jurisdiction}</span> · Auditor: <span className="text-white">{auditorEmail}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="bg-amber-500/20 border border-amber-400/50 text-amber-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
              ● AUDIT OVERSIGHT ACTIVE
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">REGULATED INSTITUTIONS</span>
            <div className="text-2xl font-extrabold text-white flex items-center justify-between">
              <span>{entitiesCount} SILOS</span>
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] text-amber-300 block font-semibold">Active Monitored Mesh</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">DECISIONS AUDITED</span>
            <div className="text-2xl font-extrabold text-white flex items-center justify-between">
              <span>{auditedCount.toLocaleString()}</span>
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-emerald-400 block font-semibold">100% Chain Hash Signed</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">P2P EVIDENCE PULLS</span>
            <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-between">
              <span>{p2pPullsCount} RELAYED</span>
              <Send className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-300 block font-semibold">Zero-Knowledge Sealed</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ENFORCEMENT NOTICES</span>
            <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
              <span>{noticesCount} ACTIVE</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-emerald-300 block font-semibold">Zero Active Disputes</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <h2 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>REGULATED INSTITUTIONS HEATMAP</span>
            </h2>
          </div>

          <div className="space-y-3.5 font-mono">
            {DEMO_REGULATED_INSTITUTIONS.map((inst) => (
              <div key={inst.id} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-white font-sans">{inst.name}</span>
                    <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">{inst.id}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">{inst.jurisdiction}</div>
                </div>

                <div className="flex items-center space-x-4 text-right flex-shrink-0">
                  <div className="text-xs space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">AUDIT: {inst.auditDate}</span>
                    <span className="text-amber-300 font-bold block text-[11px]">{inst.compliance} COMPLIANCE</span>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase border ${inst.riskTier === "LOW" ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300" : "bg-amber-500/20 border-amber-400/50 text-amber-300"}`}>
                    {inst.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <h2 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>DECISION AUDIT CHAIN (DAC)</span>
            </h2>
          </div>

          <div className="space-y-3 font-mono">
            {DEMO_OVERSIGHT_DECISIONS.map((entry, idx) => (
              <div key={idx} className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="text-slate-200 font-bold">{entry.inst}</span>
                  <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">{entry.rule}</span>
                </div>
                <div className="text-white font-sans font-semibold">{entry.model}</div>
                <div className="text-[10px] text-slate-400 font-mono">Chain Hash: {entry.hash}</div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                  <span className="text-emerald-400 font-bold">{entry.verdict}</span>
                  <button className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-500/30 transition text-[10px]">
                    Request P2P Pull →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
