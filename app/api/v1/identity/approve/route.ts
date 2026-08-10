import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { fingerprint, action } = await request.json();

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Missing publicKeyFingerprint parameter" },
        { status: 400 }
      );
    }

    const targetStatus = action === "REJECT" ? "REJECTED" : "ACTIVE";

    const updatedNode = await prisma.governanceIdentity.update({
      where: { publicKeyFingerprint: fingerprint },
      data: { status: targetStatus }
    });

    return NextResponse.json({
      status: "SUCCESS",
      node: updatedNode
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update node identity status", details: error.message },
      { status: 500 }
    );
  }
}
