import { getSession } from "@/lib/auth/session";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DialectReportsPage() {
  const session = await getSession();

  // Reports are generated on-demand from real governance audit data.
  // No report model exists in the schema yet — this page shows an empty state
  // until the report generation pipeline is implemented.

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest font-mono">REGULATORY REPORT GENERATOR</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dialect Reports</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Export certified audit packages formatted to specific statutory framework dialects.</p>
        </div>

        <button className="pure-glass-badge px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center space-x-2 transition rounded-xl shadow-sm">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Compile Custom Dialect Report</span>
        </button>
      </div>

      <div className="pure-glass-card rounded-2xl p-16 text-center space-y-4 shadow-sm border border-slate-200 dark:border-white/10">
        <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
        <div className="text-slate-900 dark:text-slate-200 font-sans font-semibold text-base">No Reports Generated Yet</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
          Dialect reports are compiled from your hub&apos;s governance audit ledger.
          Once your hub has active telemetry and ledger entries, click{" "}
          <span className="text-sky-600 dark:text-sky-400 font-semibold">Compile Custom Dialect Report</span> to generate a certified audit package
          for EU AI Act, RBI, ISO 42001, or other supported frameworks.
        </p>
      </div>
    </div>
  );
}
