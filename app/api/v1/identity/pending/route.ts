import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ANIMUS_ADMIN" && session.role !== "HUB_MANAGER")) {
      return NextResponse.json(
        { error: "Access Denied: Administrator or Hub Manager clearance required." },
        { status: 403 }
      );
    }
    const pendingNodes = await prisma.governanceIdentity.findMany({
      where: { status: "PENDING_WHITELIST" },
      orderBy: { registeredAt: 'desc' }
    });

    const activeNodes = await prisma.governanceIdentity.findMany({
      where: { status: "ACTIVE" },
      orderBy: { registeredAt: 'desc' }
    });

    return NextResponse.json({
      pending: pendingNodes,
      active: activeNodes
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch pending node identities", details: error.message },
      { status: 500 }
    );
  }
}
