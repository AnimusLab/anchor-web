import { SkeletonDashboardHeader, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function OversightLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 font-sans">
      <SkeletonDashboardHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 pure-glass-card p-6 rounded-3xl space-y-5 border border-amber-400/30">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="w-1/3 h-6 bg-amber-400/20 animate-pulse rounded-lg" />
            <div className="w-24 h-8 bg-amber-400/20 animate-pulse rounded-xl" />
          </div>
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonTableRow key={i} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 pure-glass-card p-6 rounded-3xl space-y-5 border border-amber-400/30">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="w-1/2 h-6 bg-amber-400/20 animate-pulse rounded-lg" />
            <div className="w-20 h-6 bg-amber-400/20 animate-pulse rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-2 animate-pulse">
                <div className="flex justify-between">
                  <div className="w-1/4 h-3 bg-amber-400/20 rounded" />
                  <div className="w-1/5 h-3 bg-amber-400/20 rounded" />
                </div>
                <div className="w-3/4 h-4 bg-amber-400/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
