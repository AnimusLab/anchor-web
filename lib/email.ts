import { Resend } from 'resend';

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
  totpSecret?: string;
  portalUrl?: string;
}

export async function sendCredentialWelcomeEmail(options: SendCredentialEmailOptions) {
  const { 
    to, 
    name, 
    clearanceId, 
    hubId, 
    role, 
    totpSecret = "JBSWY3DPEHPK3PXP", 
    portalUrl 
  } = options;

  const resend = getResendClient();
  if (!resend) return { success: false, message: 'Resend API key missing' };

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@updates.animuslab.dev';
  const replyToEmail = process.env.RESEND_REPLY_TO || 'tan@animuslab.dev';

  // Role Theme Config (7 Roles)
  const roleUpper = (role || "").toUpperCase();
  let themeColor = "#38bdf8"; // Default Cyber Sky
  let roleTitle = "PROVISIONED OPERATOR";
  let subtitle = "SOVEREIGN CONTROL MESH CLEARANCE";
  let defaultPortal = "https://hub.animuslab.dev/login";

  if (roleUpper.includes("ADMIN") || roleUpper.includes("ROOT")) {
    themeColor = "#a855f7"; // Sovereign Purple/Violet
    roleTitle = "ROOT PLATFORM ADMIN";
    subtitle = "⚡ ROOT SOVEREIGN AUTHORITY CONTROL PLANE";
    defaultPortal = "https://admin.animuslab.dev/admin/login";
  } else if (roleUpper.includes("MANAGER")) {
    themeColor = "#38bdf8"; // Enterprise Cyan
    roleTitle = "HUB MANAGER (ENTERPRISE ADMIN)";
    subtitle = "🏢 ENTERPRISE HUB MANAGEMENT CLEARANCE";
    defaultPortal = "https://hub.animuslab.dev/login";
  } else if (roleUpper.includes("LEAD")) {
    themeColor = "#2dd4bf"; // Architecture Teal
    roleTitle = "PROJECT LEAD (CHIEF ARCHITECT)";
    subtitle = "⚡ ARCHITECTURE & REPOSITORY LEAD CLEARANCE";
    defaultPortal = "https://hub.animuslab.dev/login";
  } else if (roleUpper.includes("DEV") || roleUpper.includes("ENGINEER")) {
    themeColor = "#60a5fa"; // Neon Blue
    roleTitle = "AI AGENT DEVELOPER";
    subtitle = "💻 ENGINEERING & AGENT DEVELOPER CLEARANCE";
    defaultPortal = "https://hub.animuslab.dev/login";
  } else if (roleUpper.includes("REGULATORY")) {
    themeColor = "#fbbf24"; // Imperial Amber Gold
    roleTitle = "STATUTORY REGULATORY AUDITOR";
    subtitle = "🏛️ STATUTORY REGULATORY OVERSIGHT (RBI / SEC / EU)";
    defaultPortal = "https://oversight.animuslab.dev/oversight/login";
  } else if (roleUpper.includes("CROSS")) {
    themeColor = "#c084fc"; // Sovereign Magenta
    roleTitle = "CROSS-HUB COMPLIANCE AUDITOR";
    subtitle = "🌐 CROSS-SILO MULTI-TENANT INSPECTOR";
    defaultPortal = "https://oversight.animuslab.dev/oversight/login";
  } else if (roleUpper.includes("AUDITOR")) {
    themeColor = "#94a3b8"; // Steel Slate
    roleTitle = "STANDARD HUB AUDITOR";
    subtitle = "🛡️ SINGLE-SILO AUDIT CLEARANCE";
    defaultPortal = "https://oversight.animuslab.dev/oversight/login";
  }

  const targetPortal = portalUrl || defaultPortal;

  // TOTP QR Code URL generated via secure QR API
  const qrUri = `otpauth://totp/AnimusLab:${encodeURIComponent(to)}?secret=${totpSecret}&issuer=AnimusLab`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #04060c; color: #f1f5f9; padding: 40px 20px; margin: 0; }
          .card { max-width: 580px; margin: 0 auto; background: #0b0f19; border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 36px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
          .header-tag { font-size: 10px; font-family: monospace; font-weight: 800; letter-spacing: 2px; color: ${themeColor}; text-transform: uppercase; margin-bottom: 8px; }
          h1 { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; tracking: -0.5px; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
          
          .field-box { background: #04060c; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; margin-bottom: 12px; }
          .label { font-size: 10px; font-weight: 800; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
          .value { font-size: 16px; font-family: monospace; font-weight: 800; color: #ffffff; }
          .value-accent { font-size: 16px; font-family: monospace; font-weight: 800; color: ${themeColor}; }
          
          .totp-card { background: #04060c; border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 24px; margin: 24px 0; text-align: center; }
          .totp-title { font-size: 11px; font-weight: 800; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #e4e4e7; margin-bottom: 12px; }
          .qr-wrapper { background: #ffffff; padding: 12px; border-radius: 14px; display: inline-block; box-shadow: 0 0 25px rgba(255,255,255,0.1); }
          .secret-box { background: rgba(255,255,255,0.06); border: 1px border-dashed rgba(255,255,255,0.25); border-radius: 12px; padding: 14px; margin-top: 14px; font-family: monospace; font-size: 18px; font-weight: 900; color: ${themeColor}; letter-spacing: 3px; word-break: break-all; }
          
          .button { display: block; width: 100%; box-sizing: border-box; text-align: center; background: linear-gradient(135deg, ${themeColor}, #3b82f6); color: #ffffff; font-weight: 900; font-size: 14px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 18px 0; border-radius: 14px; margin-top: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
          .footer { margin-top: 32px; font-size: 10px; text-align: center; color: #475569; font-family: monospace; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header-tag">${subtitle}</div>
          <h1>Sovereign Credentials Issued</h1>
          <p>Hello <strong>${name}</strong>, your institutional clearance keys have been generated and cryptographically bound to your corporate email.</p>

          <div class="field-box">
            <div class="label">CLEARANCE ID TOKEN</div>
            <div class="value-accent">${clearanceId}</div>
          </div>

          <div class="field-box">
            <div class="label">CANONICAL HUB SILO ID</div>
            <div class="value">${hubId}</div>
          </div>

          <div class="field-box">
            <div class="label">ASSIGNED ROLE CLEARANCE</div>
            <div class="value-accent">${roleTitle}</div>
          </div>

          <!-- 2FA TOTP AUTHENTICATOR SETUP -->
          <div class="totp-card">
            <div class="totp-title">🔐 AUTHENTICATOR 2FA ENFORCEMENT SETUP</div>
            <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 16px 0;">Scan this QR code with Google Authenticator, 1Password, or Authy:</p>
            
            <div class="qr-wrapper">
              <img src="${qrCodeUrl}" width="180" height="180" alt="TOTP QR Code" style="display: block; border-radius: 6px;" />
            </div>

            <p style="font-size: 11px; color: #71717a; margin: 16px 0 6px 0;">Or enter the manual setup key into your authenticator app:</p>
            <div class="secret-box">${totpSecret}</div>
          </div>

          <a href="${targetPortal}" class="button">AUTHENTICATE CONTROL PLANE →</a>

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
      replyTo: replyToEmail,
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

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@updates.animuslab.dev';
  const replyToEmail = process.env.RESEND_REPLY_TO || 'tan@animuslab.dev';
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'tan@animuslab.dev';

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      replyTo: replyToEmail,
      to: [adminEmail],
      subject: `[AnimusLab Admin Alert] New Onboarding Request: ${details.email}`,
      html: `
        <div style="font-family: monospace; background: #04060c; color: #fff; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15);">
          <h2 style="color: #f59e0b; margin-top: 0;">🚨 NEW ONBOARDING PROVISIONING REQUEST</h2>
          <p><strong>Applicant Email:</strong> ${details.email}</p>
          <p><strong>Personnel Name:</strong> ${details.name || 'Pending'}</p>
          <p><strong>Organization Name:</strong> ${details.orgName || 'Pending'}</p>
          <p><strong>Requested Role:</strong> ${details.role || 'HUB_MANAGER'}</p>
          <p><strong>Location:</strong> ${details.city || 'N/A'}, ${details.region || 'N/A'}</p>
          <p><strong>Target Clearance ID:</strong> ${details.clearanceId || 'Auto-generated'}</p>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="color: #64748b; font-size: 12px;">Review and approve in Root Admin Cockpit at /admin/pending</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Resend Admin Notification Error:', error);
    return { success: false, error: error.message };
  }
}
