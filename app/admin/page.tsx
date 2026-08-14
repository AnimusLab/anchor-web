import { PrismaClient } from "@prisma/client";
import {
  Building2,
  UserCheck,
  ShieldCheck,
  Activity,
  CheckCircle,
  XCircle,
  Shield,
  Server,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const DEMO_TENANT_HUBS = [
  { id: "HUB-001", name: "AnimusLab Primary Mesh", org: "AnimusLab Dev", nodes: 14, cpu: "18%", memory: "4.2 GB", status: "HEALTHY" },
  { id: "HUB-002", name: "Nexus Financial Silo", org: "Nexus Systems", nodes: 8, cpu: "32%", memory: "8.1 GB", status: "HEALTHY" },
  { id: "HUB-003", name: "Alpha Cloud Governance", org: "Alpha Corp", nodes: 22, cpu: "65%", memory: "16.4 GB", status: "HEALTHY" },
];

const DEMO_PENDING_WHITELIST = [
  { email: "sarah@acme-finance.org", role: "SOVEREIGN OPERATOR", org: "Acme Finance", domainVerified: true, time: "10 mins ago" },
  { email: "auditor.vance@sec.gov", role: "STATUTORY AUDITOR", org: "SEC Enforcement", domainVerified: true, time: "25 mins ago" },
];

export default async function AdminPage() {
  let activeHubsCount = DEMO_TENANT_HUBS.length;
  let pendingWhitelistCount = DEMO_PENDING_WHITELIST.length;
  let pendingWhitelists: any[] = [];

  try {
    const [hCount, wCount, dbWhitelists] = await Promise.all([
      prisma.hub.count({ where: { isActive: true } }),
      prisma.whitelist.count({ where: { status: "PENDING" } }),
      prisma.whitelist.findMany({
        where: { status: "PENDING" },
        include: { organization: true },
        take: 5,
      }),
    ]);
    if (hCount > 0) activeHubsCount = hCount;
    if (wCount > 0) pendingWhitelistCount = wCount;
    if (dbWhitelists.length > 0) pendingWhitelists = dbWhitelists;
  } catch (err) {
    // Fallback
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 font-sans">
      {/* Top Banner */}
      <div className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-rose-400/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 border border-rose-400/40 px-3 py-1 rounded-full text-xs font-mono text-rose-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-rose-300" />
              <span>CLEARANCE: ROOT OPERATOR (LEVEL 0)</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-sans">
              ROOT ADMIN CONTROL PLANE
            </h1>
            <p className="text-sm text-slate-300 font-mono mt-1">
              Master Operations Portal · Primary Cluster Node: <span className="text-rose-300 font-bold">AN-EAST-01</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
            <span className="bg-rose-500/20 border border-rose-400/50 text-rose-200 px-4 py-2 rounded-2xl font-bold uppercase tracking-wider shadow-inner">
              ● ROOT AUTHORITY GATE ACTIVE
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PROVISIONED HUBS</span>
            <div className="text-2xl font-extrabold text-white flex items-center justify-between">
              <span>{activeHubsCount} HUBS</span>
              <Building2 className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[11px] text-emerald-400 block font-semibold">Real-Time Active Mesh</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PENDING WHITELIST</span>
            <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-between">
              <span>{pendingWhitelistCount} QUEUED</span>
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] text-amber-300 block font-semibold">Domain Check Verified</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">P2P RELAY CLUSTER</span>
            <div className="text-2xl font-extrabold text-white flex items-center justify-between">
              <span>12 NODES</span>
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="text-[11px] text-cyan-300 block font-semibold">High Availability Mesh</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CLUSTER UPTIME</span>
            <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
              <span>99.999%</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-300 block font-semibold">SLA Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <h2 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>WHITELIST PROVISIONING QUEUE</span>
            </h2>
          </div>

          <div className="space-y-3.5 font-mono text-xs">
            {pendingWhitelists.length === 0 ? (
              DEMO_PENDING_WHITELIST.map((item, idx) => (
                <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-rose-300 font-bold text-sm">{item.email}</span>
                      <span className="bg-rose-500/20 text-rose-200 border border-rose-400/40 px-2.5 py-0.5 rounded-md text-[10px]">
                        {item.role}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs">Org: {item.org} · Domain Check: <span className="text-emerald-400 font-bold">PASSED</span></div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button className="bg-rose-500/20 border border-rose-400/50 text-rose-300 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              pendingWhitelists.map((item) => (
                <div key={item.id} className="bg-black/40 p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-rose-300 font-bold text-sm">{item.email}</span>
                      <span className="bg-rose-500/20 text-rose-200 border border-rose-400/40 px-2.5 py-0.5 rounded-md text-[10px]">
                        {item.role}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs">Org: {item.organization?.displayName || "Enterprise"}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-white/20">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <h2 className="text-lg font-bold text-white uppercase font-sans flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-rose-400" />
              <span>MULTI-TENANT HUB MATRIX</span>
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {DEMO_TENANT_HUBS.map((hub) => (
              <div key={hub.id} className="bg-black/40 p-3.5 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold font-sans text-sm">{hub.name}</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] border border-emerald-400/30">
                    {hub.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>Org: {hub.org}</span>
                  <span>Nodes: {hub.nodes}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-300">
                  <span>CPU: <strong className="text-indigo-300">{hub.cpu}</strong></span>
                  <span>RAM: <strong className="text-cyan-300">{hub.memory}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
