from typing import List, Dict, Optional
import hashlib
import json
from datetime import datetime
from pydantic import BaseModel

class ContinuityProof(BaseModel):
    """
    Anchor v6.1: Deterministic State Lineage.
    Provides the cryptographic proof of continuity between evidentiary artifacts.
    """
    artifact_id: str
    previous_lineage_hash: str
    constitutional_context: str
    jurisdictional_seal: str
    governance_v: str

class EvidenceArtifact(BaseModel):
    """
    Institutional Evidence Logic.
    Separates Runtime State from Evidence State.
    """
    artifact_id: str
    origin_node: str
    classification: str # 'operational', 'regulatory', 'forensic', 'sealed'
    payload: Dict
    lineage: ContinuityProof
    timestamp: str

def generate_continuity_proof(artifact_id: str, prev_hash: str, constitutional_v: str, session_id: str) -> str:
    """
    Generates a Jurisdictional Seal for an artifact.
    Includes constitutional version and session lineage.
    """
    raw_seal = f"{artifact_id}|{prev_hash}|{constitutional_v}|{session_id}"
    return hashlib.sha256(raw_seal.encode()).hexdigest()

def seal_artifact(payload: Dict, classification: str, origin: str, session_id: str, prev_hash: str = "GENESIS") -> EvidenceArtifact:
    """
    Converts raw operational data into a Sealed Evidence Artifact.
    """
    from .activation_engine import GOVERNANCE_PROTOCOL_VERSION
    
    artifact_id = f"ART-{hashlib.sha256(str(payload).encode()).hexdigest()[:12].upper()}"
    ts = datetime.utcnow().isoformat()
    
    proof = ContinuityProof(
        artifact_id=artifact_id,
        previous_lineage_hash=prev_hash,
        constitutional_context="HUB-CONSTITUTION-V6",
        jurisdictional_seal=generate_continuity_proof(artifact_id, prev_hash, GOVERNANCE_PROTOCOL_VERSION, session_id),
        governance_v=GOVERNANCE_PROTOCOL_VERSION
    )
    
    return EvidenceArtifact(
        artifact_id=artifact_id,
        origin_node=origin,
        classification=classification,
        payload=payload,
        lineage=proof,
        timestamp=ts
    )
