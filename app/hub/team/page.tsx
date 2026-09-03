import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { Users, UserPlus, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

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
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">ORGANIZATION ACCESS CONTROL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Team &amp; Seats</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Manage team seat allocation, role-based access control (RBAC), and clearance tiers.</p>
        </div>
        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Seat Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-slate-400">SEAT CAPACITY</span>
          <div className="text-3xl font-bold text-slate-100 mt-1">{members.length} / — Seats</div>
          <div className="text-slate-400 text-xs">Live from database</div>
        </div>
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-emerald-400">HUB MANAGERS</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{managerCount} Manager{managerCount !== 1 ? "s" : ""}</div>
          <div className="text-slate-400 text-xs">Full Governance Clearance</div>
        </div>
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-sky-400">LEADS &amp; DEVS</span>
          <div className="text-3xl font-bold text-sky-400 mt-1">{subCount} Member{subCount !== 1 ? "s" : ""}</div>
          <div className="text-slate-400 text-xs">Scoped Project Access</div>
        </div>
      </div>

      {/* Team List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">ACTIVE TEAM MEMBERS</span>
          <span className="text-slate-400">RBAC Enforcement Active</span>
        </div>

        <div className="p-5 space-y-4">
          {members.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-sans font-semibold">No Team Members Yet</div>
              <p className="text-xs text-slate-500 font-mono">Invite team members to populate this hub.</p>
            </div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-100 font-bold text-base font-sans">{m.displayName || m.email.split("@")[0]}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-sky-400 font-mono text-xs">{m.email}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Clearance ID: {m.id} · Joined: {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${ROLE_COLOUR[m.role] || "text-slate-400"}`}>
                    {m.role.replace(/_/g, " ")}
                  </span>
                  <button className="glass-badge px-3 py-1 text-slate-400 hover:text-white text-[10px]">
                    Edit Scope
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
