"""
Anchor v5.0 — Mail Dispatch Module
Sends credential emails, verification links, and admin notifications.
Prioritizes Brevo REST API (Port 443) over legacy SMTP.
Falls back to console logging if no key is configured.
"""
import os
import re
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# Configuration from environment
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@anchorgovernance.tech")
BASE_URL = os.getenv("ANCHOR_BASE_URL", "https://animuslab-anchor-api.hf.space")

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


def send_auditor_provisioned(to_email: str, display_name: str, entity_id: str, regulator: str, qr_url: str):
    """
    Sends the auditor their provisioned access packet.
    Includes the Entity ID, Regulator context, and the TOTP QR code.
    """
    subject = f"Anchor Oversight — Access Provisioned [{entity_id}]"
    html = f"""
    <div style="font-family: monospace; background: #06060A; color: #E2E8F0; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #161B22;">
      <h2 style="color: #10B981; letter-spacing: 0.2em; font-size: 14px; border-bottom: 1px solid #161B22; padding-bottom: 15px;">AUTHORITY_PROVISIONED // LEVEL_1</h2>
      
      <p style="color: #94A3B8; font-size: 12px; line-height: 1.6;">
        Welcome <strong>{display_name}</strong>. You have been authorized as a regulatory official for <strong>{regulator}</strong>.
      </p>

      <div style="background: #0C0C12; border: 1px solid #161B22; padding: 20px; margin: 20px 0;">
        <p style="color: #484F58; font-size: 10px; margin: 0 0 5px; tracking: 0.2em;">ENTITY_ID</p>
        <code style="color: #10B981; font-size: 16px;">{entity_id}</code>
      </div>

      <div style="background: #0C0C12; border: 1px solid #161B22; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: #484F58; font-size: 10px; margin: 0 0 15px; tracking: 0.2em;">AUTHENTICATOR_HANDSHAKE (SCAN NOW)</p>
        <img src="{qr_url}" width="160" height="160" style="display: block; margin: 0 auto; border: 1px solid #161B22;" />
        <p style="color: #484F58; font-size: 9px; margin-top: 15px;">SCAN WITH GOOGLE AUTHENTICATOR OR AUTHY</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://oversight.anchorgovernance.tech" style="background: #10B981; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; font-size: 11px; tracking: 0.2em;">OPEN TERMINAL →</a>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html)

def send_enterprise_provisioned(to_email: str, display_name: str, company: str, region: str, entity_id: str, master_key: str, qr_url: str):
    """
    Sends an Enterprise Owner their regional master packet.
    Includes the Master Key for project integration and the TOTP QR code for login.
    """
    subject = f"Anchor Enterprise — Regional Master Node Provisioned [{region}]"
    html = f"""
    <div style="font-family: monospace; background: #06060A; color: #E2E8F0; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #161B22;">
      <h2 style="color: #F59E0B; letter-spacing: 0.2em; font-size: 14px; border-bottom: 1px solid #161B22; padding-bottom: 15px;">REGIONAL_MASTER_PROVISIONED // {region}</h2>
      
      <p style="color: #94A3B8; font-size: 12px; line-height: 1.6;">
        Welcome <strong>{display_name}</strong>. You are now the authorizing owner for <strong>{company} ({region})</strong>.
      </p>

      <div style="background: #0C0C12; border: 1px solid #161B22; padding: 20px; margin: 20px 0;">
        <p style="color: #484F58; font-size: 10px; margin: 0 0 5px; tracking: 0.2em;">REGIONAL_MASTER_KEY (FOR PROJECT INTEGRATION)</p>
        <code style="color: #F59E0B; font-size: 14px; word-break: break-all;">{master_key}</code>
        <p style="color: #484F58; font-size: 9px; margin-top: 10px;">IMPORTANT: Include this key in your AI project configuration to connect to the grid.</p>
      </div>

      <div style="background: #0C0C12; border: 1px solid #161B22; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: #484F58; font-size: 10px; margin: 0 0 15px; tracking: 0.2em;">AUTHENTICATOR_HANDSHAKE (SCAN NOW)</p>
        <img src="{qr_url}" width="160" height="160" style="display: block; margin: 0 auto; border: 1px solid #161B22;" />
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://enterprise.anchorgovernance.tech" style="background: #F59E0B; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; font-size: 11px; tracking: 0.2em;">OPEN ENTERPRISE DASHBOARD →</a>
      </div>
      
      <p style="color: #484F58; font-size: 9px; margin-top: 20px; text-align: center;">ENTITY_ID: {entity_id}</p>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_admin_access_code(to_email: str, code: str):
    """Sends a one-time administrative access code for the Master Console."""
    subject = f"Your Anchor Access Code: {code}"
    html = f"""
    <div style="font-family: monospace; background: #08080D; color: #E2E8F0; padding: 40px; max-width: 600px;">
        <h2 style="color: #F59E0B; letter-spacing: 0.15em;">MASTER CONSOLE ACCESS</h2>
        <p style="color: #94A3B8;">A request was made to access the Anchor Master Node with this email.</p>
        
        <div style="background: #0D0D14; border: 1px solid #F59E0B; padding: 30px; margin: 30px 0; text-align: center;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0 0 12px; letter-spacing: 0.2em;">ONE-TIME ACCESS CODE</p>
            <span style="color: #F59E0B; font-size: 42px; font-weight: bold; letter-spacing: 0.3em;">{code}</span>
        </div>
        
        <p style="color: #64748B; font-size: 11px;">
            This code will expire in 10 minutes.<br>
            If you did not request this access, your account remains secure. No further action is required.
        </p>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_developer_invite(to_email: str, display_name: str, org_name: str, project_name: str, clearance_id: str, org_id: str, invite_link: str):
    """Sends a tactical invite to a developer for a specific project."""
    subject = f"Anchor Sovereign Mesh — Mission Invite: {project_name}"
    html = f"""
    <div style="font-family: monospace; background: #06060A; color: #E2E8F0; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1A1F2E;">
      <h2 style="color: #60A5FA; letter-spacing: 0.2em; font-size: 14px; border-bottom: 1px solid #1A1F2E; padding-bottom: 15px;">MISSION_INVITE // DEV_ONBOARD</h2>
      
      <p style="color: #94A3B8; font-size: 12px; line-height: 1.6;">
        Welcome <strong>{display_name}</strong>. You have been invited by <strong>{org_name}</strong> to contribute to the <strong>{project_name}</strong> project on the Anchor Mesh.
      </p>

      <div style="background: #0C0C12; border: 1px solid #1A1F2E; padding: 20px; margin: 20px 0;">
        <p style="color: #4B5563; font-size: 9px; margin: 0 0 8px; tracking: 0.15em;">IDENTITY_MARKERS</p>
        <div style="margin-bottom: 15px;">
            <p style="color: #64748B; font-size: 10px; margin: 0;">CLEARANCE_ID</p>
            <code style="color: #60A5FA; font-size: 14px;">{clearance_id}</code>
        </div>
        <div>
            <p style="color: #64748B; font-size: 10px; margin: 0;">ORG_ID</p>
            <code style="color: #94A3B8; font-size: 14px;">{org_id}</code>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #4B5563; font-size: 10px; margin-bottom: 15px;">CLICK BELOW TO INITIALIZE HANDSHAKE</p>
        <a href="{invite_link}" 
           style="background: #60A5FA; color: #000; padding: 14px 35px; text-decoration: none; font-weight: bold; font-size: 11px; tracking: 0.2em;">
           INITIALIZE CLEARANCE →
        </a>
      </div>
      
      <p style="color: #4B5563; font-size: 9px; line-height: 1.4; text-align: center;">
        This invite is cryptographically scoped to your email address and will expire in 48 hours.<br>
        Sign in with your Email, Org ID, and recorded Clearance ID.
      </p>
    </div>
    """
    return _send_email(to_email, subject, html)

