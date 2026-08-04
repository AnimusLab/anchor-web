"use client";

import { useState } from "react";
import { Activity, Shield, User, GitCommit, Key, Eye } from "lucide-react";
import { Role } from "@/lib/auth/clearance";

interface TeamActivity {
  id: string;
  user: string;
  email: string;
  role: "PROJECT_LEAD" | "DEVELOPER";
  project: string;
  action: string;
  time: string;
}

const MOCK_TEAM_ACTIVITIES: TeamActivity[] = [
  { id: "act_01", user: "Alex Chen", email: "alex.c@jpmc.com", role: "PROJECT_LEAD", project: "payments-service", action: "Provisioned API key prod-payments-ingest", time: "10 mins ago" },
  { id: "act_02", user: "Sarah Jenkins", email: "sarah.j@jpmc.com", role: "DEVELOPER", project: "wealth-advisor-agent", action: "Triggered telemetry stream debug mode", time: "45 mins ago" },
  { id: "act_03", user: "Sarah Jenkins", email: "sarah.j@jpmc.com", role: "DEVELOPER", project: "wealth-advisor-agent", action: "Executed Mission Replay playback dec_9902b", time: "2 hours ago" }
];

export default function TeamActivityMonitorPage() {
  const [clearanceRole, setClearanceRole] = useState<Role>("HUB_MANAGER");

  // Clearance Scoping Rules
  // HUB_MANAGER: Inspects Project Leads & Developers
  // PROJECT_LEAD: Inspects Developers ONLY
  const visibleActivities = clearanceRole === "HUB_MANAGER"
    ? MOCK_TEAM_ACTIVITIES
    : MOCK_TEAM_ACTIVITIES.filter((a) => a.role === "DEVELOPER");

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SCOPED TEAM ACTIVITY MONITOR</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Team Activity & Mini Profiles</h1>
          <p className="text-sm text-slate-400 mt-1">Hierarchical activity monitoring (Hub Managers monitor Leads & Devs; Project Leads monitor Devs only).</p>
        </div>

        {/* Clearance Role Switcher */}
        <div className="flex items-center space-x-2 glass-badge p-1.5">
          <span className="text-slate-400 px-2 text-[10px]">VIEW AS ROLE:</span>
          {(["HUB_MANAGER", "PROJECT_LEAD"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setClearanceRole(r)}
              className={`px-3 py-1.5 rounded-lg transition ${
                clearanceRole === r ? "bg-white/10 text-emerald-400 font-bold border border-white/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {visibleActivities.slice(0, 2).map((member) => (
          <div key={member.id} className="glass-card p-6 space-y-4">
            <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-base">
                {member.user.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{member.user}</h3>
                <span className="text-xs text-sky-400 font-mono">{member.email}</span>
              </div>
              <span className="glass-badge px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-bold ml-auto">
                {member.role}
              </span>
            </div>

            <div className="font-mono text-xs text-slate-300 glass-card-inset p-3">
              <span className="text-slate-500 text-[10px] block">LATEST ACTIVITY</span>
              {member.action}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline Stream */}
      <div className="glass-card overflow-hidden font-mono text-xs">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">HIERARCHICAL AUDIT TRAIL</span>
          <span className="text-slate-400">{visibleActivities.length} Activities Monitored</span>
        </div>

        <div className="p-5 space-y-4">
          {visibleActivities.map((act) => (
            <div key={act.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <GitCommit className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-100 font-bold font-sans text-sm">{act.user}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-emerald-400 font-bold">{act.role}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{act.action}</div>
              </div>
              <span className="text-slate-500 text-[11px]">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
