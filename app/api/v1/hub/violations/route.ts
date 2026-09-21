import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');
    const requestedHubId = searchParams.get('hubId');

    // Build the query constraints matrix
    const queryConditions: any = {
      complianceVerdict: "NON_COMPLIANT"
    };

    const isCrossHubRole = ["ANIMUS_ADMIN", "CROSS_HUB_AUDITOR", "REGULATORY_AUDITOR"].includes(session.role);

    if (isCrossHubRole) {
      if (requestedHubId) {
        queryConditions.hubId = requestedHubId;
      }
    } else {
      // Internal personnel are strictly locked to their own Hub / Silo
      queryConditions.hubId = session.hubId || "animuslab-hq";
    }

    if (projectName) {
      queryConditions.projectName = projectName;
    }

    // Pull transaction records sorted chronologically by arrival time
    let telemetryEvents: any[] = [];
    try {
      telemetryEvents = await prisma.telemetryEvent.findMany({
        where: queryConditions,
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    } catch (dbErr) {
      // Fallback for temporary database connection blips / offline dev mode
      telemetryEvents = [];
    }

    // Unpack the JSON strings into raw iterable objects for frontend mapping
    const structuredViolations = telemetryEvents.map(event => ({
      id: event.id,
      siloId: event.hubId,
      hubId: event.hubId,
      projectName: event.projectName,
      riskScore: event.riskScore,
      identityFingerprint: event.identityFingerprint,
      createdAt: event.createdAt,
      violations: typeof event.violationsJson === 'string' ? JSON.parse(event.violationsJson) : event.violationsJson
    }));

    return NextResponse.json({ events: structuredViolations }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to parse hub telemetry data lines", details: error.message }, { status: 500 });
  }
}
