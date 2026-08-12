import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const handle = body.handle || "sandbox-demo";

    const sessionToken = `SANDBOX-DEMO-TRIAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      token: sessionToken,
      handle: handle.toLowerCase(),
      trialDaysRemaining: 30,
      mode: "READ_ONLY_SANDBOX",
      mockEvents: [
        {
          id: "dec_demo_8801",
          agent: "credit-scoring-agent",
          hash: "0x9f81a7001b22ff89a012",
          verdict: "COMPLIANT",
          framework: "RBI-IN",
        },
        {
          id: "dec_demo_8802",
          agent: "wealth-advisor-llm",
          hash: "0x4aa01f88219001bca2",
          verdict: "VIOLATION",
          framework: "EU-AI-ACT",
          rule: "OWASP-LLM-01: Prompt Injection Detected",
        },
      ],
      message: "1-Month Free Trial Sandbox session provisioned successfully.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to provision sandbox session." }, { status: 500 });
  }
}
