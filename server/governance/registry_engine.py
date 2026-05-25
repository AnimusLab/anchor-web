from typing import List, Dict, Optional
from pydantic import BaseModel

class GovernanceCapability(BaseModel):
    """
    Anchor v6.1: Formal Governance Capability Schema.
    Defines the semantic authority and evidentiary requirements for restricted operations.
    """
    capability_id: str
    semantic_name: str
    clearance_level: str
    binding_jurisdiction: List[str]

    # Institutional Guardrails
    requires_dual_authorization: bool = False
    requires_replay_justification: bool = False
    requires_live_session: bool = False

    # Operational Parameters
    revocation_strategy: str = "immediate"  # immediate, session_end, rolling
    evidence_scope: str = "minimal"        # minimal, forensic, full_trace

    # Compliance & Export
    export_classification: str = "restricted" # internal, restricted, sovereign

    # Contextual Limits
    temporal_constraints: Dict = {}

# v6.1 Governance Versioning
GOVERNANCE_PROTOCOL_VERSION = "6.1.1"
POLICY_LINEAGE_ID = "BASE-CONSTITUTION-V6"

GOVERNANCE_REGISTRY: Dict[str, GovernanceCapability] = {
    "can_replay": GovernanceCapability(
        capability_id="can_replay",
        semantic_name="Forensic Replay Access",
        clearance_level="auditor",
        binding_jurisdiction=["USA", "UK", "IN", "EU"],
        requires_replay_justification=True,
        revocation_strategy="session_end",
        evidence_scope="forensic"
    ),
    "can_export": GovernanceCapability(
        capability_id="can_export",
        semantic_name="Regulatory Evidence Export",
        clearance_level="regulator",
        binding_jurisdiction=["USA", "UK", "IN", "EU"],
        requires_dual_authorization=True,
        export_classification="sovereign"
    ),
    "can_provision": GovernanceCapability(
        capability_id="can_provision",
        semantic_name="Entity Provisioning",
        clearance_level="admin",
        binding_jurisdiction=["ALL"],
        revocation_strategy="immediate"
    ),
    "can_view_identity": GovernanceCapability(
        capability_id="can_view_identity",
        semantic_name="Identity Fingerprint Reveal",
        clearance_level="root",
        binding_jurisdiction=["ALL"],
        evidence_scope="full_trace"
    )
}

def compile_governance_profile(role: str, jurisdiction: str = "ALL") -> Dict[str, bool]:
    """
    Deterministic Governance Compiler.
    Compiles a role and jurisdiction into a map of effective capability flags.
    This replaces hardcoded JWT permission logic with a formal ontology.
    """
    # Role Hierarchy Mapping
    HIERARCHY = {
        "root": 100,
        "admin": 80,
        "owner": 80,
        "regulator": 60,
        "auditor": 40,
        "user": 20,
        "guest": 0
    }
    
    user_level = HIERARCHY.get(role.lower(), 0)
    
    effective_capabilities = {}
    
    for cid, cap in GOVERNANCE_REGISTRY.items():
        cap_required_level = HIERARCHY.get(cap.clearance_level.lower(), 100)
        
        # 1. Authority Check
        has_authority = user_level >= cap_required_level
        
        # 2. Jurisdictional Check
        in_jurisdiction = "ALL" in cap.binding_jurisdiction or jurisdiction.upper() in [j.upper() for j in cap.binding_jurisdiction]
        
        # Effective if both conditions met
        effective_capabilities[cid] = has_authority and in_jurisdiction

    return effective_capabilities
