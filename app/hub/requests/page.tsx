import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLOUR: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-emerald-400",
  DENIED: "text-rose-400",
  REVOKED: "text-rose-400",
  EXPIRED: "text-slate-500",
};

export default async function P2PAccessRequestsPage() {
  const session = await getSession();
  const hubId = session?.hubId;

  let requests: any[] = [];
  try {
    requests = await prisma.governanceAccessRequest.findMany({
      where: hubId ? { targetHubId: hubId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { displayName: true, email: true, role: true, jurisdiction: true } },
      },
    });
  } catch (e) {
    console.error("P2P requests fetch error:", e);
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-600 dark:text-amber-400 font-bold uppercase text-[10px] tracking-widest font-mono">P2P RELAY ACCESS GATEKEEPER</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">P2P Access Requests</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Review and dual-key approve forensic P2P telemetry pull requests submitted by regulatory officials.</p>
        </div>
      </div>

      <div className="pure-glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center bg-slate-50/80 dark:bg-[#070b16]/60 font-mono text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">REGULATORY PULL REQUEST QUEUE</span>
          <span className={pendingCount > 0 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
            {pendingCount > 0 ? `${pendingCount} Awaiting Action` : "No Pending Requests"}
          </span>
        </div>

        <div className="p-5 space-y-4 font-mono text-xs">
          {requests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <UserCheck className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <div className="text-slate-900 dark:text-slate-200 font-sans font-semibold">No Access Requests</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Regulatory access requests submitted to this hub will appear here for dual-key approval.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-900 dark:text-slate-100 font-bold font-sans text-sm">{req.requester?.email || req.requesterId}</span>
                    <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-bold">
                      {req.scope}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Jurisdiction: {req.requester?.jurisdiction || "STATUTORY"} · Requested: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 font-bold text-[10px] rounded-full border ${
                    req.status === "APPROVED"
                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : req.status === "DENIED" || req.status === "REVOKED"
                      ? "bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300"
                  }`}>
                    {req.status}
                  </span>
                  {req.status === "PENDING" && (
                    <>
                      <button className="pure-glass-badge text-emerald-700 dark:text-emerald-400 px-4 py-2 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center space-x-2 transition rounded-xl border border-emerald-300 dark:border-emerald-500/40">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Dual Key Approve</span>
                      </button>
                      <button className="pure-glass-badge text-rose-700 dark:text-rose-400 px-4 py-2 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 transition rounded-xl border border-rose-300 dark:border-rose-500/40">
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
