import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hubs = await prisma.hub.findMany({
      include: {
        organization: true,
        users: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedHubs = hubs.map((hub) => ({
      id: hub.id,
      displayName: hub.displayName,
      region: hub.region,
      isActive: hub.isActive,
      organization: hub.organization,
      personnelCount: hub.users.length,
      users: hub.users,
    }));

    return NextResponse.json({ hubs: formattedHubs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch hubs", details: error.message },
      { status: 500 }
    );
  }
}
