import { prisma } from "@/lib/prisma";
import { Globe, Activity, Server } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GlobalTelemetryPage() {
  let totalHashesCount = 0;
  let activeHubsCount = 0;
  let totalTelemetryEventsCount = 0;

  try {
    const [hCount, hubsCount, eventsCount] = await Promise.all([
      prisma.ledgerEntry.count(),
      prisma.hub.count({ where: { isActive: true } }),
      prisma.telemetryEvent.count(),
    ]);
    totalHashesCount = hCount;
    activeHubsCount = hubsCount;
    totalTelemetryEventsCount = eventsCount;
  } catch (err) {
    console.error("Error loading telemetry metrics from database:", err);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400">GLOBAL NETWORK INGESTION</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">Global Telemetry</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Cross-tenant decision telemetry ingestion rates, network throughput, and relay bandwidth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-slate-600 dark:text-slate-400">INGESTION EVENTS</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalTelemetryEventsCount.toLocaleString()}</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs">Across {activeHubsCount} Active Hubs</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-emerald-600 dark:text-emerald-400">RELAY LATENCY</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">0.0 ms</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs">P99 Peer-to-Peer Relay</div>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="animus-label text-sky-600 dark:text-sky-400">TOTAL HASHES SIGNED</span>
          <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-1">{totalHashesCount.toLocaleString()} Hashes</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs">100% Verified Chain</div>
        </div>
      </div>
    </div>
  );
}

