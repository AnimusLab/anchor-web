import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');

    // Build the query constraints matrix
    const queryConditions: any = {
      complianceVerdict: "NON_COMPLIANT"
    };

    if (projectName) {
      queryConditions.projectName = projectName;
    }

    // Pull transaction records sorted chronologically by arrival time
    const telemetryEvents = await prisma.telemetryEvent.findMany({
      where: queryConditions,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Unpack the JSON strings into raw iterable objects for frontend mapping
    const structuredViolations = telemetryEvents.map(event => ({
      id: event.id,
      siloId: event.siloId,
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
