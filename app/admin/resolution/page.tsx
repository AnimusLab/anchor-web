import { prisma } from "@/lib/prisma";
import { Key, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IdentityResolutionPage() {
  let identities: any[] = [];

  try {
    identities = await prisma.governanceIdentity.findMany({
      take: 10,
      orderBy: { registeredAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching governance identities:", err);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      <div className="flex justify-between items-end border-b border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-400">CRYPTOGRAPHIC RESOLUTION</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Identity Resolution</h1>
          <p className="text-sm text-slate-400 mt-1">Resolve cross-hub AI agent identities, public keys, and cryptographic certificates.</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        {identities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl font-mono text-xs">
            NO REGISTERED AI AGENT IDENTITIES RESOLVED YET // READY FOR INGESTION
          </div>
        ) : (
          identities.map((identity) => (
            <div key={identity.id} className="glass-card-inset p-5 font-mono text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[10px]">RESOLVED AGENT ID / PROJECT</span>
                <span className="text-emerald-400 font-bold text-sm">{identity.projectName} ({identity.id})</span>
                <div className="text-slate-500 text-[10px] mt-1 break-all">
                  Fingerprint: {identity.publicKeyFingerprint}
                </div>
              </div>
              <span className="glass-badge px-3 py-1 text-cyan-400 font-bold text-[10px]">
                {identity.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
