/**
 * Anchor v6.1: Client-Side Governance Registry Mirror
 * 
 * Provides consistent semantic interpretation of governance capabilities
 * across all institutional frontend portals. This mirror ensures the UI
 * doesn't just check booleans, but understands the governance 'weight'
 * of the actions the user is about to take.
 */

export const CAPABILITY_METADATA = {
    can_replay: {
      id: "can_replay",
      label: "Forensic Replay Access",
      description: "Allows high-fidelity reconstruction of transaction meshes for evidence.",
      risk: "CRITICAL",
      institutionalWeight: 10,
      requiresJustification: true
    },
    can_export: {
      id: "can_export",
      label: "Regulatory Evidence Export",
      description: "Enables generation of signed evidentiary artifacts for legal submission.",
      risk: "HIGH",
      institutionalWeight: 8,
      requiresDualAuth: true
    },
    can_provision: {
      id: "can_provision",
      label: "Entity Provisioning",
      description: "Authority to register new nodes, identities, or mesh scopes.",
      risk: "HIGH",
      institutionalWeight: 7
    },
    can_view_identity: {
      id: "can_view_identity",
      label: "Identity Fingerprint Reveal",
      description: "Access to deanonymized identity fingerprints for forensic attribution.",
      risk: "EXTREMELY HIGH",
      institutionalWeight: 10
    }
  };
  
  /**
   * getGovernanceProfile
   * Compiles the raw JWT capabilities into a rich governance context.
   */
  export function getGovernanceProfile(user) {
    if (!user || !user.capabilities) {
        return { 
            active: [], 
            has: () => false, 
            isProvisional: true,
            isRestricted: true 
        };
    }
  
    const caps = user.capabilities;
    const activeIds = Object.keys(caps).filter(key => caps[key] === true);
    
    const profile = {
      active: activeIds.map(id => ({
        id,
        ...CAPABILITY_METADATA[id]
      })),
      isProvisional: caps.is_provisional || false,
      jurisdiction: caps.jurisdiction || "GLOBAL",
      visibility: caps.visibility || "HUB_ONLY",
      
      // Helper: Check if user has specific capability
      has: (capId) => !!caps[capId],
      
      // Helper: Check if an action requiring a capability is currently 'hydrated' (non-provisional)
      isHydrated: () => !caps.is_provisional
    };
  
    return profile;
  }
