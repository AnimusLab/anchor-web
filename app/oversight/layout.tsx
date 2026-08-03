import DynamicSidebar from "@/components/DynamicSidebar";
import SolarSystemBackground from "@/components/SolarSystemBackground";
import { getSession } from "@/lib/auth/session";

export default async function OversightLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const role = session?.role || "AUDITOR";
  const clearanceId = session?.id || "AUD-RBI-IN-009";
  const auditorType = session?.auditorType || "GOVERNMENT_AUDITOR";

  return (
    <div className="flex h-screen bg-[#03050a] text-slate-100 font-sans text-xs overflow-hidden relative">
      {/* Animated Solar System Background */}
      <SolarSystemBackground />
      
      {/* Dynamic Glassmorphism Sidebar */}
      <DynamicSidebar role={role} auditorType={auditorType} clearanceId={clearanceId} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
