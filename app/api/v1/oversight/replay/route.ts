import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: "Mandatory Audit Target Event ID required" }, { status: 400 });
    }

    const event = await prisma.telemetryEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: "Audit Trail Event Node not found" }, { status: 404 });
    }

    // Unpack raw event data to clean and redact parameters before sending to the auditor view
    const rawViolations = typeof event.violationsJson === 'string' ? JSON.parse(event.violationsJson) : event.violationsJson;

    // ZERO-KNOWLEDGE SANITIZATION (Article VII Compliance):
    // Strip local machine file paths, IDE line numbers, or variable traces completely
    const sanitizedViolations = (Array.isArray(rawViolations) ? rawViolations : [rawViolations]).map((v: any) => ({
      rule_id: v.rule_id || "RULE-UNKNOWN",
      statute: v.statute || "Statutory Compliance Invariant",
      severity: v.severity || "HIGH",
      summary: v.summary || v.message || "Manual verification required.",
      docs_url: `https://animuslab.dev/rules/${v.rule_id || 'EU-AI-ACT'}`
    }));

    const sanitizedReplayPayload = {
      id: event.id,
      siloId: event.hubId,
      hubId: event.hubId,
      projectName: event.projectName,
      riskScore: event.riskScore,
      identityFingerprint: event.identityFingerprint,
      createdAt: event.createdAt,
      timeline: sanitizedViolations
    };

    return NextResponse.json({ replay: sanitizedReplayPayload }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to extract forensic replay data streams", details: error.message }, { status: 500 });
  }
}
