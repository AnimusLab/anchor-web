"use client";

import { useState } from "react";
import { Activity, Shield, User, GitCommit, Key, Eye, X, Calendar, CheckCircle2, Lock } from "lucide-react";
import { Role } from "@/lib/auth/clearance";

interface TeamMember {
  id: string;
  user: string;
  email: string;
  role: "PROJECT_LEAD" | "DEVELOPER";
  project: string;
  commitSha: string;
  prNumber: string;
  action: string;
  time: string;
  totalCommits: number;
  totalKeysCreated: number;
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "mem_01", user: "Alex Chen", email: "alex.c@jpmc.com", role: "PROJECT_LEAD", project: "payments-service", commitSha: "c7a8910", prNumber: "PR #142", action: "Provisioned API key prod-payments-ingest", time: "10 mins ago", totalCommits: 342, totalKeysCreated: 12 },
  { id: "mem_02", user: "Sarah Jenkins", email: "sarah.j@jpmc.com", role: "DEVELOPER", project: "wealth-advisor-agent", commitSha: "f812a04", prNumber: "PR #139", action: "Triggered telemetry stream debug mode", time: "45 mins ago", totalCommits: 189, totalKeysCreated: 0 },
  { id: "mem_03", user: "David Miller", email: "david.m@jpmc.com", role: "DEVELOPER", project: "credit-decisioning", commitSha: "e9910ab", prNumber: "PR #131", action: "Executed Mission Replay playback dec_9902b", time: "2 hours ago", totalCommits: 210, totalKeysCreated: 0 }
];

export default function TeamActivityMonitorPage() {
  const [clearanceRole, setClearanceRole] = useState<Role>("HUB_MANAGER");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Clearance Scoping Rules
  // HUB_MANAGER: Inspects Project Leads & Developers
  // PROJECT_LEAD: Inspects Developers ONLY
  const visibleMembers = clearanceRole === "HUB_MANAGER"
    ? MOCK_TEAM_MEMBERS
    : MOCK_TEAM_MEMBERS.filter((a) => a.role === "DEVELOPER");

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SCOPED TEAM ACTIVITY MONITOR</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Team Activity & Mini Profiles</h1>
          <p className="text-sm text-slate-400 mt-1">Hierarchical activity monitoring (Hub Managers monitor Leads & Devs; Project Leads monitor Devs only). Click any card for detailed history.</p>
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

      {/* Interactive Mini Profile Cards (Click to Inspect Detailed History) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {visibleMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="glass-card p-6 space-y-4 cursor-pointer hover:border-sky-400/50 transition group"
          >
            <div className="flex items-center space-x-3.5 border-b border-white/10 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm">
                {member.user.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition">{member.user}</h3>
                <span className="text-[11px] text-sky-400 font-mono">{member.email}</span>
              </div>
              <span className="glass-badge px-2 py-0.5 text-[9px] font-mono text-emerald-400 font-bold ml-auto">
                {member.role}
              </span>
            </div>

            <div className="font-mono text-xs text-slate-300 glass-card-inset p-3 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">LATEST COMMIT</span>
                <span className="text-sky-400 font-bold">{member.prNumber} ({member.commitSha})</span>
              </div>
              <p className="text-slate-200 text-xs truncate">{member.action}</p>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 font-mono">
              <span>Click for full history</span>
              <Eye className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline Stream with Commit SHAs & PR Numbers */}
      <div className="glass-card overflow-hidden font-mono text-xs">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">HIERARCHICAL AUDIT TRAIL</span>
          <span className="text-slate-400">{visibleMembers.length} Monitored Member Logs</span>
        </div>

        <div className="p-5 space-y-4">
          {visibleMembers.map((act) => (
            <div key={act.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <GitCommit className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-100 font-bold font-sans text-sm">{act.user}</span>
                  <span className="glass-badge px-2 py-0.5 text-[10px] text-emerald-400 font-bold">{act.role}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-400 font-bold">{act.prNumber}</span>
                  <span className="text-slate-500">({act.commitSha})</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{act.action}</div>
              </div>
              <span className="text-slate-500 text-[11px]">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans text-xs">
          <div className="glass-card w-full max-w-xl p-7 space-y-6 border border-white/20 font-mono">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-bold text-slate-950 text-lg">
                  {selectedMember.user.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 font-sans">{selectedMember.user}</h3>
                  <p className="text-xs text-sky-400">{selectedMember.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="glass-badge p-2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card-inset p-4">
                <span className="text-slate-500 block text-[10px]">TOTAL COMMITS SIGNED</span>
                <span className="text-emerald-400 font-bold text-lg">{selectedMember.totalCommits} Commits</span>
              </div>
              <div className="glass-card-inset p-4">
                <span className="text-slate-500 block text-[10px]">VAULT KEYS GENERATED</span>
                <span className="text-sky-400 font-bold text-lg">{selectedMember.totalKeysCreated} Keys</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="animus-label text-slate-300">RECENT REPOSITORY COMMIT & AUDIT HISTORY</span>
              <div className="glass-card-inset p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-sky-400 font-bold">{selectedMember.prNumber}</span>
                  <span className="text-slate-400">{selectedMember.commitSha}</span>
                </div>
                <p className="text-slate-200">{selectedMember.action}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedMember(null)} className="glass-badge px-5 py-2 text-xs font-bold text-slate-200">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
