import DynamicSidebar from "@/components/DynamicSidebar";
import { getSession } from "@/lib/auth/session";

export default async function OversightLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const role = session?.role || "AUDITOR";
  const clearanceId = session?.id || "AUD-RBI-IN-009";
  const auditorType = session?.auditorType || "GOVERNMENT_AUDITOR";

  return (
    <div className="flex h-screen bg-[#060913] text-slate-100 font-sans text-xs overflow-hidden spatial-bg-animated">
      <div className="spatial-grid-overlay"></div>
      
      {/* 3D Skeuomorphic Dynamic Sidebar */}
      <DynamicSidebar role={role} auditorType={auditorType} clearanceId={clearanceId} />

      {/* Main Spatial Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
