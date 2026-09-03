import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { Users, GitCommit, Shield } from "lucide-react";
import { CLEARANCE_MATRIX } from "@/lib/auth/clearance";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const ROLE_COLOUR: Record<string, string> = {
  HUB_MANAGER: "text-emerald-400",
  PROJECT_LEAD: "text-indigo-400",
  DEVELOPER: "text-sky-400",
  STANDARD_AUDITOR: "text-amber-400",
};

export default async function TeamActivityMonitorPage() {
  const session = await getSession();
  const hubId = session?.hubId;
  const viewerRole = session?.role || "HUB_MANAGER";

  // HUB_MANAGER sees Leads + Devs. PROJECT_LEAD sees Devs only.
  const visibleRoles =
    viewerRole === "HUB_MANAGER"
      ? ["PROJECT_LEAD", "DEVELOPER", "STANDARD_AUDITOR"]
      : ["DEVELOPER"];

  let members: any[] = [];
  let auditLogs: any[] = [];

  try {
    members = await prisma.user.findMany({
      where: {
        ...(hubId ? { hubId } : {}),
        role: { in: visibleRoles as any[] },
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch recent audit trail entries for visible members
    if (members.length > 0) {
      auditLogs = await prisma.auditTrail.findMany({
        where: { userId: { in: members.map((m) => m.id) } },
        orderBy: { timestamp: "desc" },
        take: 20,
        include: { user: { select: { displayName: true, role: true } } },
      });
    }
  } catch (e) {
    console.error("Team activity fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SCOPED TEAM ACTIVITY MONITOR</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Team Activity &amp; Mini Profiles</h1>
          <p className="text-sm text-slate-400 mt-1">
            Hierarchical activity monitoring (Hub Managers monitor Leads &amp; Devs; Project Leads monitor Devs only).
          </p>
        </div>
        <div className="glass-badge px-3 py-2 text-[10px] flex items-center space-x-2">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400">Viewing as: <strong className="text-slate-100">{viewerRole.replace(/_/g, " ")}</strong></span>
        </div>
      </div>

      {/* Member Cards */}
      {members.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-4">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-sans font-semibold text-base">No Team Members Found</div>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
            No approved team members are visible under your clearance level for this hub.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {members.map((member) => {
              const initials = (member.displayName || member.email)
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div key={member.id} className="glass-card p-6 space-y-4">
                  <div className="flex items-center space-x-3.5 border-b border-white/10 pb-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{member.displayName || member.email.split("@")[0]}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">{member.email}</span>
                    </div>
                    <span className={`glass-badge px-2 py-0.5 text-[9px] font-mono font-bold ml-auto ${ROLE_COLOUR[member.role] || "text-slate-400"}`}>
                      {member.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500 block">CLEARANCE ID</span>
                    <span className="text-slate-200">{member.id}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500 block">MEMBER SINCE</span>
                    <span className="text-slate-200">{new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Trail */}
          <div className="glass-card overflow-hidden font-mono text-xs">
            <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
              <span className="animus-label text-slate-300">HIERARCHICAL AUDIT TRAIL</span>
              <span className="text-slate-400">{auditLogs.length} Recent Entries</span>
            </div>
            <div className="p-5 space-y-4">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No audit trail entries recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <GitCommit className="w-4 h-4 text-sky-400" />
                        <span className="text-slate-100 font-bold font-sans text-sm">{log.user?.displayName || log.userId}</span>
                        <span className={`glass-badge px-2 py-0.5 text-[10px] font-bold ${ROLE_COLOUR[log.user?.role] || "text-slate-400"}`}>
                          {(log.user?.role || "").replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-slate-300 font-sans text-xs">{log.action}{log.details ? ` — ${log.details}` : ""}</div>
                    </div>
                    <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
