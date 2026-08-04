"use client";

import { Users, UserPlus, Shield, Lock, Mail } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "HUB_MANAGER" | "PROJECT_LEAD" | "DEVELOPER";
  projectAccess: string;
  joined: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: "usr_01", name: "Tanishq Vaswani", email: "tanishq@animuslab.dev", role: "HUB_MANAGER", projectAccess: "ALL PROJECTS", joined: "2026-01-10" },
  { id: "usr_02", name: "Alex Chen", email: "alex.c@jpmc.com", role: "PROJECT_LEAD", projectAccess: "payments-service", joined: "2026-05-15" },
  { id: "usr_03", name: "Sarah Jenkins", email: "sarah.j@jpmc.com", role: "DEVELOPER", projectAccess: "wealth-advisor-agent", joined: "2026-06-20" }
];

export default function TeamSeatsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">ORGANIZATION ACCESS CONTROL</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Team & Seats</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Manage team seat allocation, role-based access control (RBAC), and clearance tiers.</p>
        </div>

        <button className="glass-badge px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Seats Capacity Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-slate-400">SEAT CAPACITY</span>
          <div className="text-3xl font-bold text-slate-100 mt-1">3 / 10 Seats</div>
          <div className="text-slate-400 text-xs">Base Enterprise Tier</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-emerald-400">HUB MANAGERS</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">1 Manager</div>
          <div className="text-slate-400 text-xs">Full Governance Clearance</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-sky-400">PROJECT LEADS & DEVS</span>
          <div className="text-3xl font-bold text-sky-400 mt-1">2 Members</div>
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
          {MOCK_TEAM.map((m) => (
            <div key={m.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-100 font-bold text-base font-sans">{m.name}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-sky-400 font-mono text-xs">{m.email}</span>
                </div>
                <div className="text-slate-400 text-xs">Access Scope: {m.projectAccess}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`glass-badge px-3 py-1 font-bold text-[10px] ${m.role === 'HUB_MANAGER' ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {m.role}
                </span>
                <button className="glass-badge px-3 py-1 text-slate-400 hover:text-white">
                  Edit Scope
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
