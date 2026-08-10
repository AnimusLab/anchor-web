import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_name, public_key_pem, public_key_fingerprint } = body;

    // Boundary Check: Prevent missing parameters from breaking the database initialization loop
    if (!project_name || !public_key_pem || !public_key_fingerprint) {
      return NextResponse.json(
        { error: "Missing Mandatory Registration Cryptographic Fields" },
        { status: 400 }
      );
    }

    // Edge Case: Handle fingerprint collision attempts (Identity Hijacking Protection)
    const existingIdentity = await prisma.governanceIdentity.findUnique({
      where: { publicKeyFingerprint: public_key_fingerprint }
    });

    if (existingIdentity) {
      return NextResponse.json(
        { error: "Cryptographic Public Key Fingerprint Conflict. Node Registration Denied." },
        { status: 409 }
      );
    }

    // Commit the new keypair payload to the database staging layer under a PENDING status
    const newRegistration = await prisma.governanceIdentity.create({
      data: {
        projectName: project_name,
        publicKeyPem: public_key_pem,
        publicKeyFingerprint: public_key_fingerprint,
        status: "PENDING_WHITELIST", // Strictly gates the key until reviewed via admin.animuslab.dev
        registeredBy: "CLI_AUTO_REGISTRATION"
      }
    });

    return NextResponse.json({
      status: "STAGED",
      message: "Node key identity received successfully. Awaiting Admin structural provisioning approval.",
      fingerprint: newRegistration.publicKeyFingerprint
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Cryptographic Database Invariant Failure", details: error.message },
      { status: 500 }
    );
  }
}
