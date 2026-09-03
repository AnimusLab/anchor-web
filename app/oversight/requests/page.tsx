import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { Send, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const STATUS_COLOUR: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-emerald-400",
  DENIED: "text-rose-400",
  REVOKED: "text-rose-400",
  EXPIRED: "text-slate-500",
};

export default async function ForensicPullRequestsPage() {
  const session = await getSession();

  // Auditors see all requests they have filed
  let requests: any[] = [];
  try {
    requests = await prisma.governanceAccessRequest.findMany({
      where: session?.id ? { requesterId: session.id } : {},
      orderBy: { createdAt: "desc" },
      include: {
        targetHub: { select: { displayName: true, id: true } },
      },
    });
  } catch (e) {
    console.error("Forensic pull requests fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">P2P FORENSIC PULL PROTOCOL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">P2P Pull Requests</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Submit signed forensic P2P telemetry pull requests to regulated enterprise hubs.</p>
        </div>

        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
          <Send className="w-4 h-4 text-sky-400" />
          <span>Submit P2P Pull Request</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">ACTIVE FORENSIC PULL REQUEST TRACKER</span>
          <span className="text-slate-400">{requests.length} Request{requests.length !== 1 ? "s" : ""} Tracked</span>
        </div>

        <div className="p-5 space-y-4">
          {requests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Send className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-sans font-semibold">No Pull Requests Filed</div>
              <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                Submit a signed P2P forensic pull request to request access to a regulated institution&apos;s telemetry ledger.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="glass-card-inset p-5 space-y-3 font-mono text-xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400 font-bold text-sm">{req.id.slice(0, 12)}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-100 font-semibold">{req.targetHub?.id}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-300">{req.requestedCapability}</span>
                  </div>
                  <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${STATUS_COLOUR[req.status] || "text-slate-400"}`}>
                    {req.status}
                  </span>
                </div>

                <div className="font-sans text-xs text-slate-300">
                  <span className="text-slate-400 font-mono text-[10px] block uppercase">Purpose: {req.purposeClassification}</span>
                  {req.justification}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                  {req.expiresAt && (
                    <span className="ml-3">· Expires: {new Date(req.expiresAt).toLocaleDateString()}</span>
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
