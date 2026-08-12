import { getSession } from "@/lib/auth/session";
import { Shield, Key, Mail, Calendar, Building2, GitCommit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage() {
  const session = await getSession();

  const userEmail = session?.email || "user@animuslab.dev";
  const initials = userEmail.substring(0, 2).toUpperCase();
  const userRole = session?.role || "USER";
  const userHubId = session?.hubId || "UNASSIGNED";
  const userId = session?.id || "OWN-AN-001";

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative z-10 font-sans text-xs">
      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Badge */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-500 p-1 flex-shrink-0 shadow-lg">
          <div className="w-full h-full rounded-[22px] bg-[#070b16] flex items-center justify-center font-mono text-2xl font-bold text-slate-100">
            {initials}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-3 flex-1 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 font-sans">{userEmail.split('@')[0]}</h1>
              <p className="text-sky-400 font-mono text-xs">{userEmail}</p>
            </div>
            <span className="glass-badge px-3.5 py-1.5 text-emerald-400 font-bold text-xs uppercase">
              {userRole} CLEARANCE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Silo: {userHubId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>ID: {userId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Status: Active Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-Style Cryptographic Activity Heatmap Grid */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 font-mono text-xs">
          <span className="animus-label text-slate-300">CRYPTOGRAPHIC SIGNING ACTIVITY (365 DAYS)</span>
          <span className="text-slate-400">0 Signed DAC Blocks</span>
        </div>

        {/* Simulated Heatmap Squares */}
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 py-2">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-white/5" title={`Day ${i + 1}`} />
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
          <span>Less Activity</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-white/5 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700/50 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
          </div>
          <span>More Activity</span>
        </div>
      </div>
    </div>
  );
}

