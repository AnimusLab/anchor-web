import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Users, UserPlus, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_COLOUR: Record<string, string> = {
  HUB_MANAGER: "text-emerald-400",
  PROJECT_LEAD: "text-indigo-400",
  DEVELOPER: "text-sky-400",
  STANDARD_AUDITOR: "text-amber-400",
};

export default async function TeamSeatsPage() {
  const session = await getSession();
  const hubId = session?.hubId;

  let members: any[] = [];
  let managerCount = 0;
  let subCount = 0;

  try {
    members = await prisma.user.findMany({
      where: {
        ...(hubId ? { hubId } : {}),
        status: "APPROVED",
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
    managerCount = members.filter((m) => m.role === "HUB_MANAGER").length;
    subCount = members.filter((m) => m.role !== "HUB_MANAGER").length;
  } catch (e) {
    console.error("Team seats fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest font-mono">ORGANIZATION ACCESS CONTROL</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Team &amp; Seats</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Manage team seat allocation, role-based access control (RBAC), and clearance tiers.</p>
        </div>
        <button className="pure-glass-badge px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center space-x-2 transition rounded-xl shadow-sm">
          <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Seat Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <div className="pure-glass-card rounded-2xl p-6 space-y-2 shadow-sm border border-slate-200 dark:border-white/10">
          <span className="animus-label text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[10px]">SEAT CAPACITY</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{members.length} / — Seats</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">Live from database</div>
        </div>
        <div className="pure-glass-card rounded-2xl p-6 space-y-2 shadow-sm border border-slate-200 dark:border-white/10">
          <span className="animus-label text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider text-[10px]">HUB MANAGERS</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{managerCount} Manager{managerCount !== 1 ? "s" : ""}</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">Full Governance Clearance</div>
        </div>
        <div className="pure-glass-card rounded-2xl p-6 space-y-2 shadow-sm border border-slate-200 dark:border-white/10">
          <span className="animus-label text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider text-[10px]">SUB-ACCOUNTS</span>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{subCount} Member{subCount !== 1 ? "s" : ""}</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">Engineers &amp; Leads</div>
        </div>
      </div>

      {/* Active Team Roster Table */}
      <div className="pure-glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center bg-slate-50/80 dark:bg-[#070b16]/60 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="font-semibold">ACTIVE PERSONNEL ROSTER</span>
          <span>{members.length} Registered</span>
        </div>

        <div className="p-4 space-y-3 font-mono text-xs">
          {members.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No team members registered yet.
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 font-sans text-xs">
                    {m.name ? m.name.slice(0, 2).toUpperCase() : m.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 font-sans">{m.name || m.email.split("@")[0]}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Hub: {m.hubId || hubId || "—"}</span>
                  <span
                    className={`px-3 py-1 font-bold text-[10px] rounded-full border ${
                      m.role === "HUB_MANAGER"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                        : m.role === "PROJECT_LEAD"
                        ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300"
                        : "bg-sky-50 dark:bg-sky-500/20 border-sky-200 dark:border-sky-500/40 text-sky-700 dark:text-sky-300"
                    }`}
                  >
                    {m.role.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
