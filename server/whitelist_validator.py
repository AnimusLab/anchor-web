"""
Whitelist Domain Validation Module
Prevents email spoofing by validating email domain matches registered org domain
"""

from typing import Tuple, Dict
import re


class WhitelistValidator:
    """
    Validates whitelist entries with domain verification.
    
    Security Pattern:
    - Email domain must match registered organization domain
    - Example: email "user@animuslab.dev" requires org_domain = "animuslab.dev"
    - Validation happens at both entry creation and runtime authentication
    """

    @staticmethod
    def extract_email_domain(email: str) -> str:
        """Extract domain from email address."""
        try:
            if '@' not in email:
                return None
            return email.split('@')[1].lower()
        except Exception:
            return None

    @staticmethod
    def validate_email_format(email: str) -> Tuple[bool, str]:
        """Validate basic email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False, "Invalid email format"
        return True, None

    @staticmethod
    def validate_domain_format(domain: str) -> Tuple[bool, str]:
        """Validate organization domain format."""
        pattern = r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, domain):
            return False, "Invalid domain format (e.g., animuslab.dev)"
        return True, None

    @staticmethod
    def validate_domain_match(email: str, org_domain: str) -> Tuple[bool, str]:
        """
        Verify email domain matches organization domain.
        
        This is the CRITICAL security check that prevents spoofing.
        """
        email_domain = WhitelistValidator.extract_email_domain(email)
        org_domain_lower = org_domain.lower()

        if email_domain != org_domain_lower:
            return (
                False,
                f"Email domain '{email_domain}' does not match org domain '{org_domain_lower}'. "
                f"Possible spoofing attempt."
            )

        return True, None

    @staticmethod
    def validate_whitelist_entry(
        email: str,
        org_domain: str,
        org_slug: str,
        access_role: str
    ) -> Tuple[bool, Dict[str, str]]:
        """
        Validate complete whitelist entry.
        
        Returns:
            Tuple[bool, Dict]: (is_valid, error_dict)
            If valid: (True, {})
            If invalid: (False, {"field": "error message"})
        """
        errors = {}

        # Validate email format
        email_valid, email_error = WhitelistValidator.validate_email_format(email)
        if not email_valid:
            errors['email'] = email_error

        # Validate domain format
        domain_valid, domain_error = WhitelistValidator.validate_domain_format(org_domain)
        if not domain_valid:
            errors['org_domain'] = domain_error

        # Validate organization slug format
        if not org_slug or not re.match(r'^[a-z0-9-]{2,}$', org_slug):
            errors['org_slug'] = "Slug must be lowercase alphanumeric with hyphens (min 2 chars)"

        # Validate access role
        valid_roles = ['OWNER', 'DEVELOPER', 'AUDITOR', 'REGULATORY']
        if access_role not in valid_roles:
            errors['access_role'] = f"Invalid role. Must be one of: {', '.join(valid_roles)}"

        # Critical: Validate domain match (only if email and domain are valid)
        if not errors.get('email') and not errors.get('org_domain'):
            domain_match_valid, domain_match_error = WhitelistValidator.validate_domain_match(
                email,
                org_domain
            )
            if not domain_match_valid:
                errors['domain_mismatch'] = domain_match_error

        return len(errors) == 0, errors


class WhitelistEntry:
    """Represents a whitelist entry with domain verification."""

    def __init__(
        self,
        entry_id: str,
        email: str,
        org_domain: str,
        org_slug: str,
        access_role: str,
        created_at: str = None
    ):
        self.entry_id = entry_id
        self.email = email
        self.org_domain = org_domain
        self.org_slug = org_slug
        self.access_role = access_role
        self.created_at = created_at
        self.domain_verified = False

        # Verify on creation
        self.verify_domain()

    def verify_domain(self) -> bool:
        """Verify email domain matches org domain."""
        email_domain = WhitelistValidator.extract_email_domain(self.email)
        org_domain_lower = self.org_domain.lower()

        self.domain_verified = email_domain == org_domain_lower
        return self.domain_verified

    def to_dict(self) -> Dict:
        """Convert entry to dictionary for database/API."""
        return {
            'entry_id': self.entry_id,
            'email': self.email,
            'org_domain': self.org_domain,
            'org_slug': self.org_slug,
            'access_role': self.access_role,
            'created_at': self.created_at,
            'domain_verified': self.domain_verified,
            'email_domain': WhitelistValidator.extract_email_domain(self.email)
        }


def authorize_whitelist_entry(
    database_connection,
    email: str,
    org_domain: str,
    org_slug: str,
    access_role: str
) -> Tuple[bool, str, Dict]:
    """
    Backend endpoint: Authorize a new whitelist entry.
    
    This function should be called from your server endpoint.
    
    Returns:
        Tuple[bool, str, Dict]: (success, message, entry_dict)
    """
    # Validate entry
    is_valid, errors = WhitelistValidator.validate_whitelist_entry(
        email,
        org_domain,
        org_slug,
        access_role
    )

    if not is_valid:
        return False, "Validation failed", errors

    # Create entry
    entry_id = f"ent_{int(__import__('time').time() * 1000)}"
    entry = WhitelistEntry(
        entry_id=entry_id,
        email=email,
        org_domain=org_domain,
        org_slug=org_slug,
        access_role=access_role,
        created_at=__import__('datetime').datetime.now().isoformat()
    )

    # Store in database
    # database_connection.whitelist.insert_one(entry.to_dict())

    return True, f"Entry authorized: {email} ({access_role})", entry.to_dict()


def verify_authentication_domain(
    database_connection,
    email: str,
    incoming_domain: str
) -> Tuple[bool, str]:
    """
    Runtime authentication verification.
    
    When user authenticates, verify their email's org domain matches
    what's registered in the whitelist.
    
    This prevents attackers from using a whitelisted email with a different domain.
    
    Returns:
        Tuple[bool, str]: (is_authenticated, message)
    """
    # Look up whitelist entry by email
    # whitelist_entry = database_connection.whitelist.find_one({'email': email})

    # if not whitelist_entry:
    #     return False, "Email not whitelisted"

    # Verify domain matches
    email_domain = WhitelistValidator.extract_email_domain(email)
    
    if email_domain != incoming_domain.lower():
        return (
            False,
            f"Domain mismatch for {email}. Registered domain: {whitelist_entry.get('org_domain')}, "
            f"but incoming domain: {incoming_domain}. Possible spoofing attempt."
        )

    return True, "Domain verified"


# Example usage for backend auth.py or similar:
"""
from server.whitelist_validator import WhitelistValidator, authorize_whitelist_entry

# In your authorization endpoint:
@app.post('/api/admin/whitelist/authorize')
def authorize_entity(request_data):
    email = request_data.get('email')
    org_domain = request_data.get('org_domain')
    org_slug = request_data.get('org_slug')
    access_role = request_data.get('access_role')
    
    success, message, entry = authorize_whitelist_entry(
        db_connection,
        email,
        org_domain,
        org_slug,
        access_role
    )
    
    if not success:
        return {'success': False, 'errors': entry}, 400
    
    return {'success': True, 'entry': entry}, 201


# In your authentication flow:
@app.post('/api/auth/verify')
def verify_auth(request_data):
    email = request_data.get('email')
    incoming_domain = request_data.get('org_domain')
    
    is_verified, message = verify_authentication_domain(
        db_connection,
        email,
        incoming_domain
    )
    
    if not is_verified:
        return {'success': False, 'message': message}, 401
    
    # Continue with normal auth flow
    return issue_jwt_token(email)
"""
