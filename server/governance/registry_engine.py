from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime

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
GOVERNANCE_PROTOCOL_VERSION = "6.1.1" # [NOTE: Migration to v6.2 Institutional Identity in progress]
POLICY_LINEAGE_ID = "BASE-CONSTITUTION-V6"

# STRATEGIC NOTE: Capability Namespacing (v7.0 Roadmap)
# To maintain scale, capabilities should eventually transition to namespaced IDs:
# gov.can_issue_notice, mesh.can_view_cross_hub, forensics.can_pull_execution, repo.can_view_codebase

# Identity Subtypes (Anchor v6.2)
# Determines the UI persona and baseline capability defaults.
IDENTITY_SUBTYPES = {
    "government_auditor": {
        "description": "State-level oversight (RBI, SEC, EU AI Act).",
        "default_capabilities": ["can_export", "can_issue_notice"],
        "visiblity_scope": "jurisdiction_wide"
    },
    "standard_auditor": {
        "description": "Internal and compliance auditors (SOC2, ISO).",
        "default_capabilities": ["can_replay", "can_view_metadata"],
        "visiblity_scope": "assigned_hubs"
    },
    "cross_hub_auditor": {
        "description": "Network-wide governance and observability.",
        "default_capabilities": ["can_replay", "can_export", "can_view_metadata", "can_pull_forensics"],
        "visiblity_scope": "all_hubs"
    }
}

GOVERNANCE_REGISTRY: Dict[str, GovernanceCapability] = {
    "can_replay": GovernanceCapability(
        capability_id="can_replay",
        semantic_name="Forensic Replay Access",
        clearance_level="auditor",
        binding_jurisdiction=["ALL"],
        requires_replay_justification=True,
        revocation_strategy="session_end",
        evidence_scope="forensic"
    ),
    "can_export": GovernanceCapability(
        capability_id="can_export",
        semantic_name="Regulatory Evidence Export",
        clearance_level="regulator",
        binding_jurisdiction=["ALL"],
        requires_dual_authorization=True,
        export_classification="sovereign"
    ),
    "can_issue_notice": GovernanceCapability(
        capability_id="can_issue_notice",
        semantic_name="Enforcement Notice Filing",
        clearance_level="regulator",
        binding_jurisdiction=["ALL"]
    ),
    "can_pull_forensics": GovernanceCapability(
        capability_id="can_pull_forensics",
        semantic_name="Direct Forensic Extraction",
        clearance_level="root",
        binding_jurisdiction=["ALL"],
        evidence_scope="full_trace"
    ),
    "can_view_codebase": GovernanceCapability(
        capability_id="can_view_codebase",
        semantic_name="Source Code Repository Access",
        clearance_level="root",
        binding_jurisdiction=["ALL"]
    )
}

def compile_governance_profile(role: str, subtype: str = None, overrides: Any = None) -> Dict[str, bool]:
    """
    Deterministic Governance Compiler (v6.2).
    Maps an Identity Subtype and its provisioned Capability Manifest to effective flags.
    Supports temporal (expiring) capabilities and audit reasoning.
    """
    effective_capabilities = {cid: False for cid in GOVERNANCE_REGISTRY.keys()}
    now = datetime.utcnow().isoformat()
    
    # 1. Apply baseline capabilities for the subtype
    st_config = IDENTITY_SUBTYPES.get(subtype.lower()) if subtype else None
    if st_config:
        for cap in st_config["default_capabilities"]:
            if cap in effective_capabilities:
                effective_capabilities[cap] = True

    # 2. Apply explicit provisioned overrides (Admin mandated)
    # Overrides can be a Simple List (CSV) or a Structured Dict (v6.2 Extended)
    if overrides:
        manifest = []
        if isinstance(overrides, str):
            # Legacy CSV support
            manifest = [{"capability": c.strip()} for c in overrides.split(",") if c.strip()]
        elif isinstance(overrides, list):
            manifest = overrides

        for entry in manifest:
            cid = entry.get("capability")
            expires_at = entry.get("expires_at")
            
            if cid in effective_capabilities:
                # Temporal filtering
                if expires_at and now > expires_at:
                    continue # Capability has expired
                    
                effective_capabilities[cid] = True

    # 3. Role-based fallback for Root/System accounts
    if role.lower() == "root":
        for cap in effective_capabilities:
            effective_capabilities[cap] = True

    return effective_capabilities
