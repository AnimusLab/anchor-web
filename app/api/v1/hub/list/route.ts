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
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          hubId: true,
          orgId: true,
        },
      }),
      prisma.whitelist.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          hubId: true,
          orgId: true,
        },
      }),
    ]);

    const formattedHubs = hubs.map((hub) => {
      const userMap = new Map<string, any>();

      // 1. Add explicitly assigned User table matches
      for (const u of allUsers) {
        if (u.hubId === hub.id || u.orgId === hub.orgId) {
          userMap.set(u.email.toLowerCase(), {
            id: u.id,
            email: u.email,
            displayName: u.displayName || u.email.split("@")[0].toUpperCase(),
            role: u.role,
            status: u.status,
          });
        }
      }

      // 2. Add explicitly assigned Whitelist table matches
      for (const w of allWhitelists) {
        const cleanEmail = w.email.toLowerCase();
        if ((w.hubId === hub.id || w.orgId === hub.orgId) && !userMap.has(cleanEmail)) {
          userMap.set(cleanEmail, {
            id: w.id || `W-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
            email: w.email,
            displayName: w.email.split("@")[0].toUpperCase(),
            role: w.role,
            status: w.status,
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
