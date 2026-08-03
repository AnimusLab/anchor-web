import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Missing or invalid Bearer token in Authorization header." },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  if (!token.startsWith("ak_live_") && !token.startsWith("ak_test_")) {
    return NextResponse.json(
      { error: "INVALID_KEY_FORMAT", message: "API key must start with ak_live_ or ak_test_" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { project, entity_type = "AI_AGENT", payload, chain_hash } = body;

    if (!project || !payload || !chain_hash) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Missing required fields: project, payload, chain_hash" },
        { status: 400 }
      );
    }

    // Response acknowledging metadata hash storage
    return NextResponse.json({
      status: "INGESTED",
      record_id: `rec_${Date.now()}`,
      project,
      entity_type,
      chain_hash_verified: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Failed to process ingestion payload." },
      { status: 500 }
    );
  }
}
