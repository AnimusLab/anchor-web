import { Resend } from 'resend';

// Access API key strictly via environment variables (never hardcoded in source)
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing from environment variables.');
    return null;
  }
  return new Resend(apiKey);
};

export interface SendCredentialEmailOptions {
  to: string;
  name: string;
  clearanceId: string;
  hubId: string;
  role: string;
  portalUrl?: string;
}

export async function sendCredentialWelcomeEmail(options: SendCredentialEmailOptions) {
  const { to, name, clearanceId, hubId, role, portalUrl = 'https://animuslab.dev/login' } = options;
  const resend = getResendClient();
  if (!resend) return { success: false, message: 'Resend API key missing' };

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #04060c; color: #f1f5f9; padding: 40px 20px; }
          .card { max-width: 560px; margin: 0 auto; background: #0b0f19; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
          .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #818cf8; text-transform: uppercase; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
          .field-box { background: #04060c; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
          .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
          .value { font-size: 15px; font-family: monospace; font-weight: 700; color: #38bdf8; }
          .button { display: inline-block; width: 100%; text-align: center; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 16px 0; border-radius: 12px; margin-top: 16px; }
          .footer { margin-top: 32px; font-size: 11px; text-align: center; color: #475569; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">⚡ ANIMUSLAB // SOVEREIGN CONTROL PLANE</div>
          <h1>Identity Credentials Provisioned</h1>
          <p>Hello <strong>${name}</strong>, your institutional clearance keys have been successfully generated and bound to your corporate email.</p>

          <div class="field-box">
            <div class="label">CLEARANCE ID</div>
            <div class="value">${clearanceId}</div>
          </div>

          <div class="field-box">
            <div class="label">CANONICAL HUB SILO ID</div>
            <div class="value">${hubId}</div>
          </div>

          <div class="field-box">
            <div class="label">CLEARANCE LEVEL</div>
            <div class="value" style="color: #4ade80;">${role}</div>
          </div>

          <a href="${portalUrl}" class="button">AUTHENTICATE CONTROL PLANE →</a>

          <div class="footer">
            CRYPTOGRAPHIC SECURITY MANDATE · ANIMUSLAB SOVEREIGN RELAY<br>
            Signed &amp; Logged by AnimusLab Infrastructure Council
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `[AnimusLab] Sovereign Credentials Provisioned (${clearanceId})`,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Resend Email Error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOnboardingAdminNotification(details: {
  email: string;
  name?: string;
  orgName?: string;
  role?: string;
  clearanceId?: string;
  city?: string;
  region?: string;
  department?: string;
  portalType?: string;
}) {
  const resend = getResendClient();
  if (!resend) return { success: false, message: 'Resend API key missing' };

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const adminEmail = 'tan@animuslab.dev';

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `[AnimusLab Admin Alert] New Onboarding Request: ${details.email}`,
      html: `
        <div style="font-family: monospace; background: #04060c; color: #fff; padding: 24px; border-radius: 12px;">
          <h2 style="color: #f59e0b;">🚨 NEW ONBOARDING PROVISIONING REQUEST</h2>
          <p><strong>Email:</strong> ${details.email}</p>
          <p><strong>Name:</strong> ${details.name || 'Pending'}</p>
          <p><strong>Org Name:</strong> ${details.orgName || 'Pending'}</p>
          <p><strong>Requested Role:</strong> ${details.role || 'HUB_MANAGER'}</p>
          <p><strong>Location:</strong> ${details.city || 'N/A'}, ${details.region || 'N/A'}</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Review and approve in Root Admin Cockpit at /admin/pending</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Resend Admin Notification Error:', error);
    return { success: false, error: error.message };
  }
}
