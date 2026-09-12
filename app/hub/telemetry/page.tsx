import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Search, RefreshCw, Eye, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

const VERDICT_COLOUR: Record<string, string> = {
  COMPLIANT: "text-emerald-400",
  NON_COMPLIANT: "text-rose-400",
  WARNING: "text-amber-400",
};

export default async function DecisionTelemetryPage() {
  const session = await getSession();
  const hubId = session?.hubId;

  let events: any[] = [];
  try {
    events = await prisma.telemetryEvent.findMany({
      where: hubId ? { hubId } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.error("Telemetry fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest">TELEMETRY INGESTION PIPELINE</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Decision Telemetry</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Real-time inspection stream for AI decision payloads and hash chains.</p>
        </div>
        <span className="pure-glass-badge px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 rounded-full shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Live Ingest Active</span>
        </span>
      </div>

      <div className="pure-glass-card overflow-hidden rounded-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center bg-slate-50/80 dark:bg-[#070b16]/60 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="font-semibold">PAYLOAD HASH LOG</span>
          <span>{events.length} Entries</span>
        </div>

        <div className="p-4 space-y-3">
          {events.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Terminal className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <div className="text-slate-900 dark:text-slate-300 font-sans font-semibold">No Telemetry Events Recorded</div>
              <p className="text-xs text-slate-500 font-mono">
                Events will appear here once your governed agents begin submitting decision payloads.
              </p>
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-600 dark:text-sky-400 font-bold text-sm">{ev.id.slice(0, 12)}</span>
                    <span className="text-slate-400 dark:text-slate-500">|</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">{ev.projectName}</span>
                    {ev.entityDisplayName && (
                      <>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-600 dark:text-slate-400">{ev.entityDisplayName}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(ev.createdAt).toLocaleString()}</span>
                    </span>
                    <span>Risk: {(ev.riskScore * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 font-bold text-[10px] rounded-full border ${
                    ev.complianceVerdict === "COMPLIANT"
                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                      : ev.complianceVerdict === "NON_COMPLIANT"
                        ? "bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300"
                        : "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {ev.complianceVerdict}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
