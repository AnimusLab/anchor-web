import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [hubs, allUsers, allWhitelists] = await Promise.all([
      prisma.hub.findMany({
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["HUB_MANAGER", "PROJECT_LEAD", "DEVELOPER"] },
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          hubId: true,
          orgId: true,
          createdAt: true,
        },
      }),
      prisma.whitelist.findMany({
        where: {
          role: { in: ["HUB_MANAGER", "PROJECT_LEAD", "DEVELOPER"] },
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          department: true,
          region: true,
          source: true,
          previewClearanceId: true,
          role: true,
          status: true,
          hubId: true,
          orgId: true,
          createdAt: true,
        },
      }),
    ]);

    const formattedHubs = hubs.map((hub) => {
      const userMap = new Map<string, any>();

      // 1. Add explicitly assigned User table matches
      for (const u of allUsers) {
        if (u.hubId === hub.id || (!u.hubId && u.orgId === hub.orgId)) {
          userMap.set(u.email.toLowerCase(), {
            id: u.id,
            email: u.email,
            displayName: u.displayName || u.email.split("@")[0].toUpperCase(),
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            department: null,
            region: hub.region,
            source: "PROVISIONED_USER",
          });
        }
      }

      // 2. Add explicitly assigned Whitelist table matches
      for (const w of allWhitelists) {
        const cleanEmail = w.email.toLowerCase();
        if ((w.hubId === hub.id || (!w.hubId && w.orgId === hub.orgId)) && !userMap.has(cleanEmail)) {
          userMap.set(cleanEmail, {
            id: w.previewClearanceId || w.id,
            whitelistId: w.id,
            email: w.email,
            displayName: w.displayName || w.email.split("@")[0].toUpperCase(),
            department: w.department,
            region: w.region || hub.region,
            role: w.role,
            status: w.status,
            source: w.source || "SELF_REGISTERED_GATEWAY",
            createdAt: w.createdAt,
          });
        }
      }

      const usersList = Array.from(userMap.values());

      return {
        id: hub.id,
        displayName: hub.displayName,
        region: hub.region,
        isActive: hub.isActive,
        organization: hub.organization,
        personnelCount: usersList.length,
        users: usersList,
      };
    });

    return NextResponse.json({ hubs: formattedHubs }, { status: 200 });
  } catch (error: any) {
    console.error("Hub list query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hubs", details: error.message },
      { status: 500 }
    );
  }
}
