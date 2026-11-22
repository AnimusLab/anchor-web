import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  FileText,
  ShieldCheck,
  Building2,
  DollarSign,
  BadgeCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getSession();

  let quotes: any[] = [];
  let contracts: any[] = [];
  let entitlements: any[] = [];

  try {
    quotes = await prisma.quote.findMany({
      include: {
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    contracts = await prisma.contract.findMany({
      include: {
        quote: {
          select: {
            companyLegalName: true,
            packageTier: true,
            totalContract: true,
          },
        },
        organization: {
          select: { displayName: true, domain: true },
        },
        signatures: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    entitlements = await prisma.entitlementGrant.findMany({
      include: {
        organization: {
          select: { displayName: true },
        },
        hub: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch (e) {
    console.error("Commercial management data fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest font-mono">
            COMMERCIAL &amp; ENTITLEMENT CONTROL PLANE
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Commercial Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
            Manage annual enterprise subscriptions, commercial quotes, Master Subscription Agreements, and cryptographic entitlement grants.
          </p>
        </div>
      </div>

      {/* Package Reference Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="pure-glass-card p-5 space-y-2 border border-slate-200 dark:border-white/10 rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            LAUNCH FLOOR
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            $29,000 <span className="text-xs font-normal text-slate-500">/ yr</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Fast-close floor. Unlimited projects · 1 AI model · 5 Devs · 1 Hub.
          </p>
        </div>

        <div className="pure-glass-card p-5 space-y-2 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl shadow-sm">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            STARTER REFERENCE
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            $60,775 <span className="text-xs font-normal text-slate-500">/ yr</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Reference single Hub. Unlimited projects · 2 AI models · 25 Devs.
          </p>
        </div>

        <div className="pure-glass-card p-5 space-y-2 border border-sky-300 dark:border-sky-500/30 rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase">
            PROFESSIONAL
          </span>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">
            $95,200 <span className="text-xs font-normal text-slate-500">/ yr</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Fully-loaded Hub. Unlimited projects · 4 AI models · 40 Devs.
          </p>
        </div>

        <div className="pure-glass-card p-5 space-y-2 border border-purple-300 dark:border-purple-500/30 rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
            SOVEREIGN ON-PREM
          </span>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            $600,000 <span className="text-xs font-normal text-slate-500">/ yr</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Air-gapped on-site. Unlimited Hubs &amp; Enterprise-wide AI systems.
          </p>
        </div>
      </div>

      {/* Incoming Quotes Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              Inbound Commercial Proposals ({quotes.length})
            </h2>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="pure-glass-card rounded-2xl p-10 text-center border border-slate-200 dark:border-white/10 space-y-2">
            <p className="text-slate-500 dark:text-slate-400 font-mono">
              No commercial proposals submitted yet. Calculator checkouts will appear here.
            </p>
          </div>
        ) : (
          <div className="pure-glass-card rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-500 uppercase">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Term</th>
                    <th className="py-3 px-4">Contract Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/[0.05]">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400">
                        {q.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-slate-900 dark:text-slate-100">
                          {q.companyLegalName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {q.contactEmail} ({q.companyCountry})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold">{q.packageTier}</td>
                      <td className="py-3 px-4">{q.termYears} yr</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(q.totalContract).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-700">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Active Contracts & Entitlement Grants */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
            Active Entitlement Grants ({entitlements.length})
          </h2>
        </div>

        {entitlements.length === 0 ? (
          <div className="pure-glass-card rounded-2xl p-10 text-center border border-slate-200 dark:border-white/10 space-y-2">
            <p className="text-slate-500 dark:text-slate-400 font-mono">
              No active entitlement grants found. Execute a contract to issue signed capacity manifests.
            </p>
          </div>
        ) : (
          <div className="pure-glass-card rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-500 uppercase">
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Feature Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/[0.05]">
                  {entitlements.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {e.organization.displayName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {e.scope} {e.hub ? `(${e.hub.displayName})` : "(All Hubs)"}
                      </td>
                      <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400">
                        {e.featureCode}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{e.aggregationType}</td>
                      <td className="py-3 px-4 font-bold">
                        {e.limitValue === -1 ? "UNLIMITED" : e.limitValue}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(e.effectiveUntil).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
