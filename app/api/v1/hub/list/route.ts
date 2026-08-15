import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hubs = await prisma.hub.findMany({
      include: { organization: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ hubs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch hubs", details: error.message },
      { status: 500 }
    );
  }
}
