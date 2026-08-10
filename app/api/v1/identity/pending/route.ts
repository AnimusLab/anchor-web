import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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
