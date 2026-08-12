import { PrismaClient } from "@prisma/client";
import { Building2, UserCheck, ShieldAlert, Plus, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const [activeHubsCount, pendingWhitelistCount, pendingGovRequestsCount, pendingWhitelists] = await Promise.all([
    prisma.hub.count({ where: { isActive: true } }),
    prisma.whitelist.count({ where: { status: "PENDING" } }),
    prisma.governanceAccessRequest.count({ where: { status: "PENDING" } }),
    prisma.whitelist.findMany({
      where: { status: "PENDING" },
      include: { organization: true },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SYS://OPERATIONS_CONTROL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AnimusLab Platform Administration</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Master Operations Portal · Multi-Tenant Control Plane</p>
        </div>
        <div className="flex space-x-3">
          <button className="glass-badge px-4 py-2.5 font-bold text-xs text-white hover:bg-white/10 transition flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Provision New Hub</span>
          </button>
        </div>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-slate-400">ACTIVE HUBS</span>
            <Building2 className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{activeHubsCount} Provisioned</div>
          <div className="text-xs text-slate-400 font-mono">Real-time active mesh nodes</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-amber-400">PENDING WHITELIST</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">{pendingWhitelistCount} Awaiting</div>
          <div className="text-xs text-slate-400 font-mono">Domain check required</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="animus-label text-emerald-400">GOV RELAY REQUESTS</span>
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">{pendingGovRequestsCount} Awaiting Action</div>
          <div className="text-xs text-slate-400 font-mono">Gov Auditor → Hub Manager</div>
        </div>
      </div>

      {/* Whitelist Queue Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">WHITELIST PROVISIONING QUEUE</span>
          <span className="text-xs font-mono text-slate-400 font-semibold">Live Queue ({pendingWhitelists.length})</span>
        </div>

        <div className="p-5 space-y-4">
          {pendingWhitelists.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
              NO PENDING WHITELIST REQUESTS // SYSTEM SECURE
            </div>
          ) : (
            pendingWhitelists.map((item) => (
              <div key={item.id} className="glass-card-inset p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400 font-bold text-base">{item.email}</span>
                    <span className="text-xs font-mono text-amber-400 font-bold glass-badge px-3 py-1">
                      {item.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Org: {item.organization.displayName} · Domain Verified: <span className="text-emerald-400 font-bold">YES</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="glass-badge text-emerald-400 px-4 py-2 font-bold text-xs hover:bg-emerald-950/40 transition flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Provision</span>
                  </button>
                  <button className="glass-badge text-rose-400 px-4 py-2 font-bold text-xs hover:bg-rose-950/40 transition flex items-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
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

