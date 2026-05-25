from sqlalchemy import Column, String, Boolean, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from database import Base

# --- 1. WHITELIST (The Security Gate) ---
class WhitelistEntry(Base):
    """Pre-authorized emails that are allowed to onboard."""
    __tablename__ = "whitelist"
    
    id          = Column(Integer, primary_key=True)
    email       = Column(String, unique=True, index=True)
    org_id      = Column(String, nullable=False)                  # "jpmc"
    role        = Column(String, default="owner")                 # "owner", "auditor"
    created_at  = Column(String, nullable=False)

# --- 2. ORGANIZATION (The Parent Account) ---
class Organization(Base):
    """v5.8 Top-level entity representing a legal company or agency."""
    __tablename__ = "organizations"

    id             = Column(String, primary_key=True)               # "jpmc"
    display_name   = Column(String, nullable=False)                 # "J.P. Morgan"
    domain         = Column(String, unique=True, index=True)        # "jpmc.com"
    region         = Column(String, nullable=True)                  # "GL", "IN", "US"
    org_type       = Column(String, default="enterprise")           # "enterprise", "regulator"
    status         = Column(String, default="pending")              # "pending", "approved"
    created_at     = Column(String, nullable=False)

    hubs               = relationship("Hub", back_populates="organization")
    enterprise_members = relationship("EnterpriseUser", back_populates="organization")
    regulatory_members = relationship("RegulatoryOfficial", back_populates="organization")

# --- 3. HUB (The Spoke Node / Sovereign Silo) ---
class Hub(Base):
    """
    Representing a Sovereign Hub (Enterprise Silo or Mesh Node).
    Includes Governance Classification Taxonomy (v6.0).
    """
    __tablename__ = "hubs"

    id             = Column(String, primary_key=True)               # "JPMC-IN-MUM01"
    org_id         = Column(String, ForeignKey("organizations.id")) 
    regional_key   = Column(String, unique=True, index=True)        # The 'Sovereign Handle'
    display_name   = Column(String, nullable=False)                 # "Mumbai Office"
    region         = Column(String, nullable=False)                  # "IN"
    unit           = Column(String, nullable=False)                  # "MUM01"
    
    # Governance Taxonomy (v6.0)
    entity_type         = Column(String, default="ai_agent")         # ai_agent, codebase, gateway, mesh_node
    visibility_class    = Column(String, default="INTERNAL")        # PUBLIC, INTERNAL, RESTRICTED
    regulatory_visible  = Column(Boolean, default=True)
    requires_escalation = Column(Boolean, default=False)

    is_active      = Column(Boolean, default=False)                 # Activation status
    created_at     = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="hubs")
    ledger_entries = relationship("LedgerEntry", back_populates="hub")

# --- 4. PERSONNEL (Identity & Clearance) ---
class EnterpriseUser(Base):
    """
    ID format: OWN-[ORG]-[REGION]-[###]
    """
    __tablename__ = "enterprise_users"

    id           = Column(String, primary_key=True)               # "OWN-JPMC-MUM-042"
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    hub_id       = Column(String, ForeignKey("hubs.id"), nullable=True) 
    display_name = Column(String, nullable=False)
    role         = Column(String, nullable=False)                 # "owner", "admin", "dev"
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)                  
    status       = Column(String, default="pending")              # "pending", "approved"
    created_at   = Column(String, nullable=False)

    # v6.1 Institutional Governance Identity
    identity_subtype         = Column(String, nullable=True)      # INTERNAL_AUDITOR, LEAD_OWNER
    jurisdiction_scope       = Column(String, nullable=True)      # "GLO", "RBI", "EU"
    entity_visibility_scope  = Column(String, nullable=True)      # "ai_agent,decision_system"
    governance_scope         = Column(String, nullable=True)      # "enterprise_wide", "hub_specific"
    institutional_origin     = Column(String, nullable=True)      # Parent institution name
    clearance_level          = Column(Integer, default=1)         # 1-4
    delegation_rights        = Column(Boolean, default=False)

    organization = relationship("Organization", back_populates="enterprise_members")

class RegulatoryOfficial(Base):
    """
    ID format: AUD-[AGENCY]-[###]
    """
    __tablename__ = "regulatory_officials"

    id           = Column(String, primary_key=True)               # "AUD-RBI-009"
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    display_name = Column(String, nullable=False)
    role         = Column(String, default="regulator")
    auditor_type = Column(String, default="HUB_AUDITOR")          # "HUB_AUDITOR", "CROSS_HUB_AUDITOR", "REGULATOR_AUDITOR"
    assigned_hub_ids = Column(String, nullable=True)              # Comma-separated Hub IDs
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)
    jurisdiction = Column(String, nullable=True)                  # Region code
    status       = Column(String, default="pending")
    created_at   = Column(String, nullable=False)

    # v6.1 Institutional Governance Identity
    identity_subtype         = Column(String, nullable=True)      # REGULATORY_AUDITOR, FORENSIC_OPERATOR
    jurisdiction_scope       = Column(String, nullable=True)      # "RBI", "EU", "SEC"
    entity_visibility_scope  = Column(String, nullable=True)      # "ai_agent,gateway"
    governance_scope         = Column(String, nullable=True)      # "jurisdiction_wide"
    institutional_origin     = Column(String, nullable=True)      # "RBI Central", "EU Oversight"
    clearance_level          = Column(Integer, default=3)         # 1-4
    delegation_rights        = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="regulatory_members")

# --- 5. THE LEDGER & FORENSICS ---
class LedgerEntry(Base):
    __tablename__ = "ledger"

    id         = Column(String, primary_key=True)
    hub_id     = Column(String, ForeignKey("hubs.id"), nullable=True)
    timestamp  = Column(String)
    payload    = Column(Text)
    chain_hash = Column(String)
    type       = Column(String, nullable=True)
    signature  = Column(String, nullable=True)
    
    # v6.1 Evidence Lineage fields
    evidence_lineage = Column(Text, nullable=True) # JSON blob of ContinuityProof
    evidence_classification = Column(String, default="operational") # operational, regulatory, forensic, sealed

    hub = relationship("Hub", back_populates="ledger_entries")

class ForensicRequest(Base):
    __tablename__ = "forensic_requests"
    
    id              = Column(String, primary_key=True)
    auditor_id      = Column(String, nullable=False)
    auditor_name    = Column(String, nullable=False)
    hub_id          = Column(String, nullable=False)
    status          = Column(String, default="PENDING")
    temporary_token = Column(String, nullable=True)
    expires_at      = Column(String, nullable=True)
    replayed_at     = Column(String, nullable=True)
    replayed_by     = Column(String, nullable=True)
    created_at      = Column(String, nullable=False)

# --- 6. REGULATORY OVERSIGHT (Notices & Internal Audits) ---
class EnforcementNotice(Base):
    """v5.8 Official regulatory notices issued to a specific Hub Silo."""
    __tablename__ = "enforcement_notices"

    id           = Column(String, primary_key=True)
    auditor_id   = Column(String, ForeignKey("regulatory_officials.id"))
    hub_id       = Column(String, ForeignKey("hubs.id"))
    target_email = Column(String, nullable=False)
    severity     = Column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    notice_text  = Column(Text, nullable=False)
    filed_at     = Column(String, nullable=False)

class AuditTrailEntry(Base):
    """Tracks internal actions performed by Auditors for accountability."""
    __tablename__ = "auditor_trail"

    id           = Column(Integer, primary_key=True)
    auditor_id   = Column(String, ForeignKey("regulatory_officials.id"))
    action       = Column(String, nullable=False)
    target_id    = Column(String, nullable=True) # ID of the Hub or Entry inspected
    timestamp    = Column(String, nullable=False)

# --- 7. INSTITUTIONAL GOVERNANCE (v6.1 Activation & Intent) ---
class GovernanceAccessRequest(Base):
    """
    Anchor v6.1: Institutional Access Control Model.
    Moves 'Replay' and 'Export' from open features to governed privileges.
    """
    __tablename__ = "governance_access_requests"

    id                    = Column(String, primary_key=True)
    requester_id          = Column(String, nullable=False) # sub/id
    requester_name        = Column(String, nullable=False) 
    
    # Intent & Purpose (Mandatory for institutional accountability)
    purpose_classification = Column(String, nullable=False) # e.g., 'Forensic Audit', 'Incident Investigation'
    investigation_reference = Column(String, nullable=True) 
    justification          = Column(Text, nullable=False)
    
    # Scoping
    requested_capability   = Column(String, nullable=False) # e.g., 'can_replay'
    target_hub_id          = Column(String, nullable=False)
    requested_duration_sec = Column(Integer, default=3600)
    
    # State Machine
    status                 = Column(String, default="PENDING") # PENDING, APPROVED, DENIED, REVOKED, EXPIRED
    approving_authority    = Column(String, nullable=True)
    denial_reason          = Column(String, nullable=True)
    revocation_reason      = Column(String, nullable=True)
    
    # Tokens & Lineage
    temporary_token        = Column(String, nullable=True) # Short-lived session token
    session_lineage_id     = Column(String, nullable=True) # Links multiple actions in one session
    governance_v           = Column(String, default="6.1.1") # Constitutional version at time of request
    
    created_at             = Column(String, nullable=False)
    expires_at             = Column(String, nullable=True)
    activated_at           = Column(String, nullable=True)


# --- 7. RUNTIME TOPOLOGY REGISTRY & AUDIT-OF-AUDITORS ACCESS LOGS ---
class RuntimeRegistry(Base):
    """Maps sovereign governance execution surfaces & namespaces."""
    __tablename__ = "runtime_registry"
    
    id             = Column(String, primary_key=True)               # e.g., "WEALTH-AGENT-01"
    hub_id         = Column(String, ForeignKey("hubs.id"))
    policy_chain   = Column(String, nullable=False)                 # e.g., "FINANCE-STRICT"
    dac_namespace  = Column(String, nullable=False)                 # e.g., "FINANCE"
    relay_identity = Column(String, nullable=False)                 # e.g., "LOCAL-SOVEREIGN"
    created_at     = Column(String, nullable=False)


class ReplayAccessLog(Base):
    """Seals forensic pull events into a replayable, tamper-proof DAC log."""
    __tablename__ = "replay_access_log"
    
    id          = Column(String, primary_key=True)                 # "acc_..."
    pull_id     = Column(String, ForeignKey("forensic_requests.id"))
    accessed_by = Column(String, nullable=False)                   # Auditor ID
    accessed_at = Column(String, nullable=False)
    chain_hash  = Column(String, nullable=False)                   # Seals the event into the DAC
