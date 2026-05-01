from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# --- 1. ORGANIZATION (Sovereign Bucket) ---
class Organization(Base):
    """v5.0 Top-level entity representing a company/regulator agency."""
    __tablename__ = "organizations"

    id             = Column(String, primary_key=True)               # "org_a1b2..."
    hub_id         = Column(String, unique=True, index=True)        # "animuslab", "sec"
    display_name   = Column(String, nullable=False)                 # "Animus Global"
    domain         = Column(String, unique=True, index=True)        # "animuslab.ai"
    region         = Column(String, nullable=True)                  # "India", "USA", "UK"
    master_key_hash= Column(String, nullable=True)                  # SHA-256 of the Org Regional Master Key
    server_region  = Column(String, default="IN")                  # "IN", "EU", "US"
    hr_contact     = Column(String, nullable=True)                  # Onboarding Manager
    status         = Column(String, default="active")               # "active", "suspended"
    org_type       = Column(String, default="enterprise")           # "enterprise", "regulator"
    created_at     = Column(String, nullable=False)                 # ISO-8601

    projects = relationship("Fleet", back_populates="organization")
    members  = relationship("User", back_populates="organization")

# --- 2. PROJECT (Execution Unit - formerly Fleet) ---
class Fleet(Base):
    """Represents a specific sub-project (e.g. 'marcus') with its own keys."""
    __tablename__ = "entities"

    entity_id   = Column(String, primary_key=True)                  # "animuslab-marcus"
    org_id      = Column(String, ForeignKey("organizations.id"))    # Link to parent org
    name        = Column(String)                                     # "Marcus Trading Bot"
    tier        = Column(String)                                     # "enterprise", "pro"
    key_hash    = Column(String)                                     # SDK Master Access Token hash
    secret_hash = Column(String)                                     # Dashboard login secret hash (if used)
    created_at  = Column(String)
    provisioned_by = Column(String)                                  # Manager ID who created it
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    subscriptions = relationship("WebhookSubscription", back_populates="fleet")
    ledger_entries = relationship("LedgerEntry", back_populates="fleet")

# --- 3. WEBHOOKS & LEDGER ---
class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    
    id = Column(String, primary_key=True)
    entity_id = Column(String, ForeignKey("entities.entity_id"))
    branch_name = Column(String)
    webhook_url = Column(String)
    webhook_secret = Column(String)
    dialect = Column(String)
    is_active = Column(Boolean, default=True)
    
    fleet = relationship("Fleet", back_populates="subscriptions")

class LedgerEntry(Base):
    __tablename__ = "ledger"

    id         = Column(String, primary_key=True)
    entity_id  = Column(String, ForeignKey("entities.entity_id"), nullable=True)
    parent_entry_id = Column(String, ForeignKey("ledger.id"), nullable=True)
    timestamp  = Column(String)
    type       = Column(String)
    chain_hash = Column(String)
    signature  = Column(String)
    payload    = Column(Text)

    fleet = relationship("Fleet", back_populates="ledger_entries")
    receipts = relationship("LedgerEntry", backref="parent", remote_side=[id])

# --- 4. USERS & RBAC ---
class User(Base):
    """v5.0 Personal Identity — Links to an Organization."""
    __tablename__ = "users"

    id           = Column(String, primary_key=True)               # "usr_a1b2..."
    email        = Column(String, unique=True, index=True)        # Personal/Work Email
    org_id       = Column(String, ForeignKey("organizations.id")) # Parent Org
    display_name = Column(String, nullable=False)
    role         = Column(String, nullable=False)                 # "owner", "admin", "lead", "member", "regulator"
    hashed_pass  = Column(String, nullable=True)                  # Optional for regulators
    totp_secret  = Column(String, nullable=True)                  # Google Authenticator Secret
    avatar_url   = Column(String, nullable=True)                  # Instagram-like Profile Pix
    clearance_id = Column(String, nullable=True)                  # "SEC-JHONDOC-2604"
    department   = Column(String, nullable=True)                  # "Compliance", "Lending AI", etc.
    jurisdiction = Column(String, nullable=True)                  # "US", "IN", "EU"
    status       = Column(String, default="pending")
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)             # One-time email verification token
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="members")


# --- 5. INVITES ---
class OrgInvite(Base):
    """v5.0 Pending invitations for team members."""
    __tablename__ = "org_invites"

    id             = Column(String, primary_key=True)               # UUID token
    org_id         = Column(String, ForeignKey("organizations.id")) # Link to parent org
    invited_email  = Column(String, nullable=False)
    clearance_id   = Column(String, nullable=True)                  # The assigned tactical ID
    target_project = Column(String, nullable=True)                  # Project name/ID
    role           = Column(String, default="member")               # "admin", "lead", "member"
    status         = Column(String, default="pending")               # "pending", "accepted", "expired"
    created_at     = Column(String, nullable=False)
    expires_at     = Column(String, nullable=False)

    organization = relationship("Organization")

