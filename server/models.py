from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# --- 1. ORGANIZATION (Sovereign Bucket) ---
class Organization(Base):
    """v5.0 Top-level entity representing a company/regulator agency."""
    __tablename__ = "organizations"

    id             = Column(String, primary_key=True)               # "ALab_03-05-26"
    hub_id         = Column(String, unique=True, index=True)        # "alab", "sec"
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
    enterprise_members = relationship("EnterpriseUser", back_populates="organization")
    regulatory_members = relationship("RegulatoryOfficial", back_populates="organization")

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

# --- 4. ENTERPRISE USERS (Silo 1) ---
class EnterpriseUser(Base):
    """Sovereign Identities for Corporate Personnel."""
    __tablename__ = "enterprise_users"

    id           = Column(String, primary_key=True)               # "AL_Tan_03-05-26"
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    display_name = Column(String, nullable=False)
    role         = Column(String, nullable=False)                 # "owner", "admin", "member"
    hashed_pass  = Column(String, nullable=True)                  
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)                  
    status       = Column(String, default="pending")
    email_verified = Column(Boolean, default=False)
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="enterprise_members")

# --- 5. REGULATORY OFFICIALS (Silo 2) ---
class RegulatoryOfficial(Base):
    """Sovereign Identities for Agency Auditors."""
    __tablename__ = "regulatory_officials"

    id           = Column(String, primary_key=True)               # "SEC_Tan_03-05-26"
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    display_name = Column(String, nullable=False)
    role         = Column(String, default="regulator")
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)                  # "Compliance", "Enforcement"
    jurisdiction = Column(String, nullable=True)                  # "US", "IN", "EU"
    status       = Column(String, default="approved")
    email_verified = Column(Boolean, default=True)
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="regulatory_members")

# --- 6. INVITES ---
class OrgInvite(Base):
    """Pending invitations for Enterprise Users."""
    __tablename__ = "org_invites"

    id             = Column(String, primary_key=True)               
    org_id         = Column(String, ForeignKey("organizations.id")) 
    invited_email  = Column(String, nullable=False)
    clearance_id   = Column(String, nullable=False)                 
    target_project = Column(String, nullable=True)                  
    role           = Column(String, default="member")               
    status         = Column(String, default="pending")               
    created_at     = Column(String, nullable=False)
    expires_at     = Column(String, nullable=False)

    organization = relationship("Organization")


# --- 7. ENFORCEMENT NOTICES (Regulatory Actions) ---
class EnforcementNotice(Base):
    """Formal compliance notices filed by regulatory auditors against AI entities."""
    __tablename__ = "enforcement_notices"

    id            = Column(String, primary_key=True)               # "ENF-SEC-abc123"
    auditor_id    = Column(String, ForeignKey("regulatory_officials.id"), nullable=False)
    auditor_name  = Column(String, nullable=False)                  # Display name snapshot
    regulator     = Column(String, nullable=False)                  # "SEC", "RBI", etc.
    company       = Column(String, nullable=False)                  # Target entity name
    rule_violated = Column(String, nullable=False)                  # "RBI/AI-GOV-2024-07"
    severity      = Column(String, nullable=False)                  # "LOW","MEDIUM","HIGH","CRITICAL"
    description   = Column(Text, nullable=False)                    # Full violation description
    deadline      = Column(String, nullable=True)                   # ISO date for compliance deadline
    status        = Column(String, default="OPEN")                  # "OPEN","ACKNOWLEDGED","RESOLVED"
    filed_at      = Column(String, nullable=False)                  # ISO-8601 timestamp
