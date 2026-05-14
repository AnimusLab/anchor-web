from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# --- 1. ORGANIZATION (The Parent Account) ---
class Organization(Base):
    """v5.0 Top-level entity representing a legal company or agency."""
    __tablename__ = "organizations"

    id             = Column(String, primary_key=True)               # "Tani_09-05-26"
    display_name   = Column(String, nullable=False)                 # "Tanishq Global"
    domain         = Column(String, unique=True, index=True)        
    region         = Column(String, nullable=True)                  # "IN", "US"
    status         = Column(String, default="approved")
    org_type       = Column(String, default="enterprise")           # "enterprise", "regulator"
    created_at     = Column(String, nullable=False)

    # Relationships
    hubs               = relationship("Hub", back_populates="organization")
    enterprise_members = relationship("EnterpriseUser", back_populates="organization")
    regulatory_members = relationship("RegulatoryOfficial", back_populates="organization")

# --- 2. HUB (The Spoke Node / Sovereign Silo) ---
class Hub(Base):
    """
    v5.8 Sovereign Identity Pivot: 
    The Hub is the actual 'Spoke Node'.
    The Regional Key acts as the unique handle/access token for this Hub.
    """
    __tablename__ = "hubs"

    id             = Column(String, primary_key=True)               # "finos-fe7" (Hub ID)
    org_id         = Column(String, ForeignKey("organizations.id")) # Link to Parent Org
    regional_key   = Column(String, unique=True, index=True)        # The 'Spoke Node' Activation Key
    display_name   = Column(String, nullable=False)                 # "Mumbai Branch"
    status         = Column(String, default="active")
    created_at     = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="hubs")
    ledger_entries = relationship("LedgerEntry", back_populates="hub")

# --- 3. THE LEDGER (Sovereign Data Plane) ---
class LedgerEntry(Base):
    __tablename__ = "ledger"

    id         = Column(String, primary_key=True)
    hub_id     = Column(String, ForeignKey("hubs.id"), nullable=True) # Linked to Hub, not Org
    parent_entry_id = Column(String, ForeignKey("ledger.id"), nullable=True)
    timestamp  = Column(String)
    type       = Column(String)
    chain_hash = Column(String)
    signature  = Column(String)
    payload    = Column(Text)

    hub = relationship("Hub", back_populates="ledger_entries")
    receipts = relationship("LedgerEntry", backref="parent", remote_side=[id])

# --- 4. PERSONNEL (Identity & Clearance) ---
class EnterpriseUser(Base):
    """Sovereign Identities for Corporate Personnel."""
    __tablename__ = "enterprise_users"

    id           = Column(String, primary_key=True)               # "tani-036" (Clearance ID)
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    hub_id       = Column(String, ForeignKey("hubs.id"), nullable=True) # Optional: Direct Hub Assignment
    display_name = Column(String, nullable=False)
    role         = Column(String, nullable=False)                 # "owner", "admin"
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)                  
    status       = Column(String, default="approved")
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="enterprise_members")

class RegulatoryOfficial(Base):
    """Sovereign Identities for Agency Auditors."""
    __tablename__ = "regulatory_officials"

    id           = Column(String, primary_key=True)               # "SEC-TANI-402"
    email        = Column(String, unique=True, index=True)        
    org_id       = Column(String, ForeignKey("organizations.id")) 
    display_name = Column(String, nullable=False)
    role         = Column(String, default="regulator")
    totp_secret  = Column(String, nullable=True)                  
    department   = Column(String, nullable=True)
    jurisdiction = Column(String, nullable=True)
    status       = Column(String, default="approved")
    created_at   = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="regulatory_members")

# --- 5. FORENSIC REQUESTS ---
class ForensicRequest(Base):
    __tablename__ = "forensic_requests"
    
    id            = Column(String, primary_key=True)
    auditor_id    = Column(String, nullable=False)
    auditor_name  = Column(String, nullable=False)
    hub_id        = Column(String, nullable=False)                  # Requests are per HUB, not just Org
    audit_id      = Column(String, nullable=False)
    status        = Column(String, default="PENDING")
    created_at    = Column(String, nullable=False)
