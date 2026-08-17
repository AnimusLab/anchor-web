import { SkeletonDashboardHeader, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 font-sans">
      <SkeletonDashboardHeader />
      <div className="pure-glass-card p-6 rounded-3xl space-y-4 border border-white/20">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonTableRow key={i} />
        ))}
      </div>
    </div>
  );
}
