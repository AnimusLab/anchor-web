import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON Payload" }, { status: 400 });
    }

    const {
      event_id,
      silo_id,
      project_name,
      identity_fingerprint,
      compliance_verdict,
      risk_score,
      violations
    } = payload;

    // Check Authentication Methods: API Key OR Ed25519 Cryptographic Signature
    const authHeader = request.headers.get("authorization") || "";
    const apiKeyHeader = request.headers.get("x-api-key") || (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
    const signatureHeader = request.headers.get("x-anchor-signature") || request.headers.get("x-signature");

    let isAuthorized = false;
    let authorizedHubId = silo_id || "animuslab-hq";
    let verifiedFingerprint = identity_fingerprint || "unverified";

    // 1. Authenticate via Scoped API Key (anc_live_...)
    if (apiKeyHeader && apiKeyHeader.startsWith("anc_live_")) {
      const keyHash = crypto.createHash("sha256").update(apiKeyHeader.trim()).digest("hex");
      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { hub: true, project: true }
      });

      if (apiKey && apiKey.isActive) {
        if (!apiKey.expiresAt || apiKey.expiresAt > new Date()) {
          if (apiKey.scope === "INGEST_ONLY" || apiKey.scope === "FULL_ADMIN") {
            isAuthorized = true;
            authorizedHubId = apiKey.hubId;
            verifiedFingerprint = `api_key:${apiKey.keyPrefix}`;
          }
        }
      }
    }

    // 2. Authenticate via Ed25519 Cryptographic Node Keypair Signature
    if (!isAuthorized && signatureHeader && identity_fingerprint) {
      const verifiedIdentity = await prisma.governanceIdentity.findUnique({
        where: { publicKeyFingerprint: identity_fingerprint }
      });

      if (verifiedIdentity && verifiedIdentity.status === "ACTIVE" && verifiedIdentity.publicKeyPem) {
        try {
          const pubKey = crypto.createPublicKey(verifiedIdentity.publicKeyPem);
          const sigEncoding = signatureHeader.length === 128 ? "hex" : "base64";
          const sigBuffer = Buffer.from(signatureHeader, sigEncoding);
          
          // Verify raw request payload against node public key
          const isValidSig = crypto.verify(null, Buffer.from(rawBody, "utf-8"), pubKey, sigBuffer);
          if (isValidSig) {
            isAuthorized = true;
            authorizedHubId = verifiedIdentity.hubId || silo_id || "animuslab-hq";
            verifiedFingerprint = verifiedIdentity.publicKeyFingerprint;
          }
        } catch (cryptoErr) {
          console.error("Ed25519 signature verification error:", cryptoErr);
        }
      }
    }

    // 3. Reject unauthenticated/unverified packets
    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: "Unauthorized Telemetry Packet: Missing or invalid Ed25519 cryptographic node signature ('X-Anchor-Signature') or active API Key ('X-API-Key')." 
        },
        { status: 401 }
      );
    }

    // 4. Process and persist verified telemetry event
    const loggedEvent = await prisma.telemetryEvent.create({
      data: {
        id: event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        hubId: authorizedHubId,
        projectName: project_name || "Enterprise AI Node",
        complianceVerdict: compliance_verdict || "NON_COMPLIANT",
        riskScore: parseFloat(risk_score) || 0.0,
        identityFingerprint: verifiedFingerprint,
        violationsJson: typeof violations === "string" ? violations : JSON.stringify(violations || [])
      }
    });

    return NextResponse.json({
      status: "LOGGED",
      transaction_id: loggedEvent.id,
      hub_id: loggedEvent.hubId,
      timestamp: loggedEvent.createdAt
    }, { status: 200 });

  } catch (error: any) {
    console.error("Telemetry sync error:", error);
    return NextResponse.json(
      { error: "Telemetry Sync Transmission Failure", details: error.message },
      { status: 500 }
    );
  }
}
