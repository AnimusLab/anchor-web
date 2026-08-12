import { getSession } from "@/lib/auth/session";
import { Camera, Calendar, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditorProfilePage() {
  const session = await getSession();

  const userEmail = session?.email || "auditor@rbi.org.in";
  const initials = userEmail.substring(0, 2).toUpperCase();
  const userRole = session?.role || "STATUTORY_AUDITOR";
  const jurisdiction = session?.jurisdiction || "GLOBAL";
  const userId = session?.id || "AUD-001";

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative z-10 font-sans text-xs">
      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Badge */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-sky-500 to-indigo-500 p-1 flex-shrink-0 shadow-lg overflow-hidden">
            <div className="w-full h-full rounded-[22px] bg-[#070b16] flex items-center justify-center font-mono text-2xl font-bold text-amber-400">
              {initials}
            </div>
          </div>
        </div>

        {/* Bio & Auditor Details */}
        <div className="space-y-3 flex-1 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 font-sans">{userEmail.split('@')[0]}</h1>
              <p className="text-amber-400 font-mono text-xs">{userEmail}</p>
            </div>
            <span className="glass-badge px-3.5 py-1.5 text-amber-400 font-bold text-xs uppercase">
              {userRole} ({jurisdiction})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>Jurisdiction: <strong className="text-slate-100">{jurisdiction}</strong></div>
            <div>Clearance: <strong className="text-amber-400">{userId}</strong></div>
            <div>Status: <strong className="text-slate-100">Active Session</strong></div>
          </div>
        </div>
      </div>

      {/* Auditor Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-sky-400">P2P PULL REQUESTS FILED</span>
          <div className="text-3xl font-bold text-sky-400 mt-1">0 Requests</div>
          <div className="text-slate-400 text-xs">0 Approved · 0 Pending</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-amber-400">STATUTORY FILINGS COMPILED</span>
          <div className="text-3xl font-bold text-amber-400 mt-1">0 Filings</div>
          <div className="text-slate-400 text-xs">{jurisdiction} Governance Framework</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-emerald-400">BLOCK VERIFICATIONS</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">0 Hashes</div>
          <div className="text-slate-400 text-xs">Ledger Standby</div>
        </div>
      </div>

      {/* Cryptographic Signing Activity Heatmap */}
      <div className="glass-card p-6 space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 text-xs">
          <span className="animus-label text-slate-300">AUDITOR CRYPTOGRAPHIC AUDIT LOG (365 DAYS)</span>
          <span className="text-slate-400">0 Signed Audit Events</span>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 py-2">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-white/5" title={`Day ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

