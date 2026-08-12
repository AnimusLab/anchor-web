import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_NOTIFICATION_EMAILS = [
  "tan@animuslab.dev",
  "tanishqdasari2004@gmail.com",
];

interface OnboardNotificationParams {
  name: string;
  email: string;
  orgName?: string;
  city?: string;
  region?: string;
  department?: string;
  portalType?: string;
  requestId?: string;
}

export async function sendOnboardingAdminNotification(params: OnboardNotificationParams) {
  const { name, email, orgName, city, region, department, portalType, requestId } = params;
  const resendApiKey = process.env.RESEND_API_KEY;

  const subject = `[ACTION REQUIRED] New ${portalType === "oversight" ? "Regulatory Auditor" : "Enterprise"} Onboarding Request: ${name}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: monospace, sans-serif; background-color: #040711; color: #f1f5f9; padding: 20px; }
          .card { background-color: #090e1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; max-width: 600px; margin: 0 auto; }
          .header { font-size: 18px; font-weight: bold; color: ${portalType === "oversight" ? "#f59e0b" : "#00f2fe"}; border-b: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px; }
          .field { margin-bottom: 12px; }
          .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 14px; font-weight: bold; color: #f8fafc; }
          .btn { display: inline-block; background: linear-gradient(to right, #00f2fe, #4facfe); color: #020617; padding: 12px 24px; font-weight: bold; border-radius: 12px; text-decoration: none; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            ANIMUSLAB MESH // ONBOARDING ALERT
          </div>
          <p style="font-size: 13px; color: #cbd5e1;">A new self-service registration payload has been submitted for Root Administrator clearance review.</p>
          
          <div class="field">
            <div class="label">Applicant Name</div>
            <div class="value">${name}</div>
          </div>

          <div class="field">
            <div class="label">Corporate / Official Email</div>
            <div class="value">${email}</div>
          </div>

          <div class="field">
            <div class="label">Organization / Agency</div>
            <div class="value">${orgName || "N/A"}</div>
          </div>

          <div class="field">
            <div class="label">Location & Division</div>
            <div class="value">${city ? city + ", " : ""}${region || "N/A"} (${department || "N/A"})</div>
          </div>

          <div class="field">
            <div class="label">Portal Type</div>
            <div class="value" style="color: ${portalType === "oversight" ? "#f59e0b" : "#38bdf8"};">${(portalType || "enterprise").toUpperCase()} GATEWAY</div>
          </div>

          <a href="https://admin.animuslab.dev/pending" class="btn">Open Admin Whitelist Queue →</a>
        </div>
      </body>
    </html>
  `;

  // Always log notification attempt to database console/log
  console.log(`[ONBOARDING NOTIFICATION DISPATCH] Applicant: ${email} (${name}) | Recipients: ${ADMIN_NOTIFICATION_EMAILS.join(", ")}`);

  // If Resend API Key is present, send email via HTTP API
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "AnimusLab Access Gateway <onboarding@animuslab.dev>",
          to: ADMIN_NOTIFICATION_EMAILS,
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resend API notification error:", errorText);
      } else {
        console.log(`Onboarding notification email successfully dispatched to ${ADMIN_NOTIFICATION_EMAILS.join(", ")}`);
      }
    } catch (err) {
      console.error("Failed to send notification email via Resend:", err);
    }
  } else {
    console.log(`[SIMULATED EMAIL NOTIFICATION] To: ${ADMIN_NOTIFICATION_EMAILS.join(", ")} | Subject: ${subject}`);
  }
}
