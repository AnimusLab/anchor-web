"""
Anchor v5.0 — Mail Dispatch Module
Sends credential emails, verification links, and admin notifications.
Prioritizes Brevo REST API (Port 443) over legacy SMTP.
Falls back to console logging if no key is configured.
"""
import os
import re

# Configuration from environment
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@anchorgovernance.tech")
BASE_URL = os.getenv("ANCHOR_BASE_URL", "http://localhost:8000")

# Setup Brevo Client
if BREVO_API_KEY:
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = BREVO_API_KEY
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
else:
    api_instance = None


def _send_email(to_email: str, subject: str, html_body: str):
    """Sends an email via Brevo REST API, or logs to console if no key is configured."""
    
    # --- Fallback: Console Logging (Dev Mode) ---
    if not api_instance:
        print(f"\n{'='*60}")
        print(f"[MAIL FALLBACK] TO: {to_email}")
        print(f"[MAIL FALLBACK] SUBJECT: {subject}")
        print(f"[MAIL FALLBACK] BODY (plaintext preview):")
        plain = re.sub(r'<[^>]+>', '', html_body)
        print(plain[:500])
        print(f"{'='*60}\n")
        return True

    # --- Production: Brevo REST API (Port 443) ---
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        reply_to={"email": FROM_EMAIL, "name": "Anchor Governance Support"},
        sender={"name": "Anchor Governance", "email": FROM_EMAIL},
        subject=subject,
        html_content=html_body
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"[MAIL] Dispatched to {to_email} via Brevo API")
        return True
    except ApiException as e:
        print(f"[MAIL ERROR] Brevo API failure: {e}")
        return False
    except Exception as e:
        print(f"[MAIL ERROR] Unexpected failure sending to {to_email}: {e}")
        return False


def send_enterprise_credentials(to_email: str, display_name: str, entity_id: str, secret_key: str, mat: str):
    """Sends the enterprise their login credentials + SDK .env config."""
    subject = f"Anchor Governance — Your Fleet Credentials [{entity_id}]"
    html = f"""
    <div style="font-family: monospace; background: #08080D; color: #E2E8F0; padding: 40px; max-width: 600px;">
        <h2 style="color: #22D3EE; letter-spacing: 0.15em;">ANCHOR GOVERNANCE ENGINE</h2>
        <p style="color: #94A3B8;">Welcome, <strong>{display_name}</strong>. Your enterprise fleet has been provisioned.</p>
        
        <div style="background: #0D0D14; border: 1px solid #1E293B; padding: 20px; margin: 20px 0;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0 0 8px;">ENTITY ID</p>
            <code style="color: #22D3EE; font-size: 14px;">{entity_id}</code>
        </div>
        
        <div style="background: #0D0D14; border: 1px solid rgba(239,68,68,0.3); padding: 20px; margin: 20px 0;">
            <p style="color: #EF4444; font-size: 11px; margin: 0 0 8px;">LOGIN SECRET (STORE SECURELY)</p>
            <code style="color: #FCA5A5; font-size: 12px; word-break: break-all;">{secret_key}</code>
        </div>
        
        <div style="background: #0D0D14; border: 1px solid #1E293B; padding: 20px; margin: 20px 0;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0 0 8px;">SDK ENVIRONMENT CONFIG (.env)</p>
            <code style="color: #22D3EE; font-size: 12px; display: block; margin: 4px 0;">ANCHOR_ENTITY_ID={entity_id}</code>
            <code style="color: #22D3EE; font-size: 12px; display: block; margin: 4px 0;">ANCHOR_MAT={mat}</code>
        </div>
        
        <p style="color: #64748B; font-size: 11px;">
            This email was sent once. The secret key cannot be recovered.<br>
            Login at: <a href="{BASE_URL}" style="color: #22D3EE;">anchorgovernance.tech/auth</a>
        </p>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_auditor_verification(to_email: str, display_name: str, entity_id: str, 
                                secret_key: str, verification_token: str):
    """Sends the auditor a verification link + their credentials."""
    verify_url = f"{BASE_URL}/api/auth/verify-email?token={verification_token}"
    subject = f"Anchor Governance — Verify Your Identity [{entity_id}]"
    html = f"""
    <div style="font-family: monospace; background: #08080D; color: #E2E8F0; padding: 40px; max-width: 600px;">
        <h2 style="color: #F59E0B; letter-spacing: 0.15em;">ANCHOR — AUDITOR VERIFICATION</h2>
        <p style="color: #94A3B8;">Welcome, <strong>{display_name}</strong>. Your access request has been received.</p>
        
        <p style="color: #94A3B8;">To verify your government email address and receive temporary access, click below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verify_url}" 
               style="background: linear-gradient(135deg, #F59E0B, #D97706); color: #08080D; 
                      padding: 14px 32px; text-decoration: none; font-weight: bold; 
                      letter-spacing: 0.1em; font-size: 12px;">
                VERIFY EMAIL ADDRESS
            </a>
        </div>
        
        <div style="background: #0D0D14; border: 1px solid #1E293B; padding: 20px; margin: 20px 0;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0 0 8px;">ENTITY ID</p>
            <code style="color: #22D3EE; font-size: 14px;">{entity_id}</code>
        </div>
        
        <div style="background: #0D0D14; border: 1px solid rgba(239,68,68,0.3); padding: 20px; margin: 20px 0;">
            <p style="color: #EF4444; font-size: 11px; margin: 0 0 8px;">SECRET KEY (STORE SECURELY — SHOWN ONCE)</p>
            <code style="color: #FCA5A5; font-size: 12px; word-break: break-all;">{secret_key}</code>
        </div>
        
        <p style="color: #64748B; font-size: 11px;">
            After email verification, you will receive temporary first-session access.<br>
            Full access will be granted after Master Node administrator approval.<br>
            <br>
            If you did not request this, ignore this email.
        </p>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_approval_notification(to_email: str, display_name: str, entity_id: str):
    """Notifies a user that their access has been approved by admin."""
    subject = f"Anchor Governance — Access Approved [{entity_id}]"
    html = f"""
    <div style="font-family: monospace; background: #08080D; color: #E2E8F0; padding: 40px; max-width: 600px;">
        <h2 style="color: #10B981; letter-spacing: 0.15em;">ACCESS APPROVED</h2>
        <p style="color: #94A3B8;">
            <strong>{display_name}</strong>, your access to the Anchor Governance Engine has been approved 
            by the Master Node administrator.
        </p>
        <p style="color: #94A3B8;">
            You can now log in with your Entity ID and Secret Key at:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{BASE_URL}" 
               style="background: linear-gradient(135deg, #10B981, #059669); color: #08080D; 
                      padding: 14px 32px; text-decoration: none; font-weight: bold; 
                      letter-spacing: 0.1em; font-size: 12px;">
                LOGIN TO ANCHOR
            </a>
        </div>
        <p style="color: #64748B; font-size: 11px;">Entity ID: {entity_id}</p>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_auditor_provisioned(to_email: str, display_name: str, entity_id: str, regulator: str):
    """
    Notifies a provisioned auditor that their oversight access is ready.
    Directs them to oversight.anchorgovernance.tech — NO keys included.
    Keys (TOTP QR) are shared separately by the admin via a secure channel.
    """
    subject = f"Anchor Oversight — Your Access Has Been Provisioned [{entity_id}]"
    html = f"""
    <div style="font-family: 'JetBrains Mono', monospace; background: #06060A; color: #E2E8F0; padding: 40px; max-width: 600px; margin: 0 auto;">

      <div style="border-bottom: 1px solid #1E1E2E; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 10px; height: 10px; background: #C9A84C;"></div>
        <h2 style="color: #C9A84C; letter-spacing: 0.2em; font-size: 13px; margin: 0; text-transform: uppercase;">
          Anchor Oversight System
        </h2>
      </div>

      <p style="color: #94A3B8; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">
        <strong style="color: #E2E8F0;">{display_name}</strong>, your regulatory oversight
        access to the Anchor Governance Engine has been provisioned by the Master Node administrator.
      </p>

      <div style="background: #0C0C12; border: 1px solid #1E1E2E; padding: 20px; margin-bottom: 20px;">
        <p style="color: #4A5568; font-size: 10px; margin: 0 0 8px; letter-spacing: 0.15em; text-transform: uppercase;">Entity ID</p>
        <code style="color: #C9A84C; font-size: 16px; letter-spacing: 0.15em;">{entity_id}</code>
      </div>

      <div style="background: #0C0C12; border: 1px solid #1E1E2E; padding: 20px; margin-bottom: 20px;">
        <p style="color: #4A5568; font-size: 10px; margin: 0 0 8px; letter-spacing: 0.15em; text-transform: uppercase;">Regulatory Authority</p>
        <code style="color: #E2E8F0; font-size: 14px;">{regulator}</code>
      </div>

      <div style="background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2); padding: 16px; margin-bottom: 24px;">
        <p style="color: #C9A84C; font-size: 10px; margin: 0 0 6px; letter-spacing: 0.15em; text-transform: uppercase;">⚠ Before You Log In</p>
        <p style="color: #94A3B8; font-size: 12px; margin: 0; line-height: 1.6;">
          Your administrator will share a QR code with you via a secure channel.
          Scan it with <strong>Google Authenticator</strong> or <strong>Authy</strong> before
          attempting to log in. This is required for authentication.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="https://oversight.anchorgovernance.tech"
           style="display: inline-block; background: linear-gradient(135deg, #92702A, #C9A84C);
                  color: #06060A; padding: 14px 36px; text-decoration: none;
                  font-weight: bold; letter-spacing: 0.15em; font-size: 11px; text-transform: uppercase;">
          OPEN OVERSIGHT TERMINAL →
        </a>
      </div>

      <p style="color: #2A2A3E; font-size: 10px; text-align: center; line-height: 1.7; margin-top: 24px; border-top: 1px solid #1E1E2E; padding-top: 16px;">
        oversight.anchorgovernance.tech &nbsp;·&nbsp;
        All sessions are cryptographically logged and legally admissible.<br/>
        If you did not request this access, contact the Anchor administrator immediately.
      </p>
    </div>
    """
    return _send_email(to_email, subject, html)

