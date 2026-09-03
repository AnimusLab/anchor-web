import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import HubSettingsClient from "./HubSettingsClient";

export const dynamic = "force-dynamic";

export default async function HubSettingsPage() {
  const session = await getSession();
  const userHubId = session?.hubId || "animuslab-hq";

  let hub = null;
  try {
    hub = await prisma.hub.findUnique({
      where: { id: userHubId },
      include: { organization: true },
    });
  } catch (err) {
    console.error("Hub settings query error:", err);
  }

  const initialSettings = {
    hubId: hub?.id || userHubId,
    hubName: hub?.displayName || "Sovereign Hub",
    enterpriseName: hub?.organization?.displayName || "Enterprise Infrastructure",
    domain: hub?.organization?.domain || "company.com",
    region: hub?.region || "US-EAST-1",
    p2pEndpoint: `wss://relay.animuslab.dev/v1/p2p/hub/${hub?.id || userHubId}`,
    hybridMode: true,
  };

  return <HubSettingsClient initialSettings={initialSettings} />;
}
