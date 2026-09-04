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
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-amber-400">P2P RELAY ACCESS GATEKEEPER</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">P2P Access Requests</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Review and dual-key approve forensic P2P telemetry pull requests submitted by regulatory officials.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">REGULATORY PULL REQUEST QUEUE</span>
          <span className={pendingCount > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>
            {pendingCount > 0 ? `${pendingCount} Awaiting Action` : "No Pending Requests"}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {requests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-sans font-semibold">No Access Requests</div>
              <p className="text-xs text-slate-500 font-mono">
                Regulatory access requests submitted to this hub will appear here for dual-key approval.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-amber-400 font-bold text-sm">{req.id.slice(0, 10)}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-100 font-semibold">{req.requester?.displayName || req.requesterId}</span>
                    <span className="glass-badge px-2.5 py-0.5 text-[10px] text-amber-400 font-bold">
                      {req.requester?.role?.replace(/_/g, " ") || "AUDITOR"}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    Jurisdiction: {req.requester?.jurisdiction || "—"} · Purpose: <span className="text-sky-400 font-bold">{req.purposeClassification}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {req.justification.length > 100 ? req.justification.slice(0, 100) + "…" : req.justification}
                  </div>
                  <div className="text-[11px] text-slate-500">Submitted: {new Date(req.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${STATUS_COLOUR[req.status] || "text-slate-400"}`}>
                    {req.status}
                  </span>
                  {req.status === "PENDING" && (
                    <>
                      <button className="glass-badge text-emerald-400 px-4 py-2.5 font-bold text-xs hover:bg-emerald-950/40 flex items-center space-x-2 transition">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dual Key Approve</span>
                      </button>
                      <button className="glass-badge text-rose-400 px-4 py-2.5 font-bold text-xs hover:bg-rose-950/40 flex items-center space-x-2 transition">
                        <XCircle className="w-4 h-4" />
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
