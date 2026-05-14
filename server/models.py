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
    created_at     = Column(String, nullable=False)

    hubs               = relationship("Hub", back_populates="organization")
    enterprise_members = relationship("EnterpriseUser", back_populates="organization")
    regulatory_members = relationship("RegulatoryOfficial", back_populates="organization")

# --- 3. HUB (The Spoke Node / Sovereign Silo) ---
class Hub(Base):
    """
    v5.8 Final ID Standard:
    ID format: [ORG]-[REGION]-[UNIT] (e.g. JPMC-IN-MUM01)
    """
    __tablename__ = "hubs"

    id             = Column(String, primary_key=True)               # "JPMC-IN-MUM01"
    org_id         = Column(String, ForeignKey("organizations.id")) 
    regional_key   = Column(String, unique=True, index=True)        # The 'Sovereign Handle'
    display_name   = Column(String, nullable=False)                 # "Mumbai Office"
    region         = Column(String, nullable=False)                  # "IN"
    unit           = Column(String, nullable=False)                  # "MUM01"
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
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)
    jurisdiction = Column(String, nullable=True)                  # Region code
    status       = Column(String, default="pending")
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="regulatory_members")

# --- 5. THE LEDGER & FORENSICS ---
class LedgerEntry(Base):
    __tablename__ = "ledger"

    id         = Column(String, primary_key=True)
    hub_id     = Column(String, ForeignKey("hubs.id"), nullable=True)
    timestamp  = Column(String)
    payload    = Column(Text)
    chain_hash = Column(String)

    hub = relationship("Hub", back_populates="ledger_entries")

class ForensicRequest(Base):
    __tablename__ = "forensic_requests"
    
    id            = Column(String, primary_key=True)
    auditor_id    = Column(String, nullable=False)
    auditor_name  = Column(String, nullable=False)
    hub_id        = Column(String, nullable=False)
    status        = Column(String, default="PENDING")
    created_at    = Column(String, nullable=False)
