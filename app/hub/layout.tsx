import DynamicSidebar from "@/components/DynamicSidebar";
import GalaxyBackground from "@/components/GalaxyBackground";
import { getSession } from "@/lib/auth/session";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const role = session?.role || "HUB_MANAGER";
  const clearanceId = session?.id || "OWN-AN-MUM-001";
  const auditorType = session?.auditorType;

  return (
    <div className="flex h-screen bg-[#040711] text-slate-100 font-sans text-xs overflow-hidden relative">
      {/* Animated Galaxy Starfield & Rotating Nebula Background */}
      <GalaxyBackground />
      
      {/* 3D Skeuomorphic Dynamic Sidebar */}
      <DynamicSidebar role={role} auditorType={auditorType} clearanceId={clearanceId} />

      {/* Main Spatial Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
