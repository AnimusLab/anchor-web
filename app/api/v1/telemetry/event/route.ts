import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      event_id,
      silo_id,
      project_name,
      identity_fingerprint,
      compliance_verdict,
      risk_score,
      violations
    } = payload;

    // Verify the identity footprint exists and is currently active inside the global registry
    const verifiedIdentity = await prisma.governanceIdentity.findUnique({
      where: { publicKeyFingerprint: identity_fingerprint }
    });

    if (!verifiedIdentity || verifiedIdentity.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unverified Identity Fingerprint. Telemetry Packet Dropped." },
        { status: 401 }
      );
    }

    // Process and serialize the telemetry block directly into the Prisma transaction logger
    const loggedEvent = await prisma.telemetryEvent.create({
      data: {
        id: event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        hubId: silo_id || verifiedIdentity.hubId || "JPMC-IN-MUM01",
        projectName: project_name || verifiedIdentity.projectName,
        complianceVerdict: compliance_verdict || "NON_COMPLIANT",
        riskScore: parseFloat(risk_score) || 0.0,
        identityFingerprint: identity_fingerprint,
        violationsJson: typeof violations === "string" ? violations : JSON.stringify(violations || [])
      }
    });

    return NextResponse.json({
      status: "LOGGED",
      transaction_id: loggedEvent.id,
      timestamp: loggedEvent.createdAt
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Telemetry Sync Transmission Failure", details: error.message },
      { status: 500 }
    );
  }
}
