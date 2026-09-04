import { Suspense } from "react";
import DynamicSidebar from "@/components/DynamicSidebar";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { getSession } from "@/lib/auth/session";
import { generateClearanceId } from "@/lib/auth/clearanceId";
import HubLoading from "./loading";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const role = session?.role || "HUB_MANAGER";
  // Derive a readable clearance ID from role + email prefix, not the raw UUID
  const namePrefix = session?.email?.split("@")[0] || "usr";
  const clearanceId = session ? generateClearanceId(namePrefix, role) : "OWN-AN-MUM-001";
  // Pass real hubId from session — this fixes the sidebar footer showing JPMC default
  const hubId = session?.hubId || "animuslab-hq";
  const auditorType = session?.auditorType;

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-sans text-xs overflow-hidden relative">
      {/* Animated Solar System Background */}
      <SolarSystemBackground />
      
      {/* Dynamic Glassmorphism Sidebar */}
      <DynamicSidebar
        role={role}
        auditorType={auditorType}
        clearanceId={clearanceId}
        hubId={hubId}
      />

      {/* Main Content Area with Suspense Streaming */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <Suspense fallback={<HubLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
