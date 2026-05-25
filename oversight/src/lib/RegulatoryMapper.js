/**
 * Anchor v6.0 Regulatory Translation Engine
 * Maps technical events to specific regulatory clauses (RBI, SEC, GDPR, etc.)
 */

const DIALECT_MAPS = {
  RBI: {
    name: 'Reserve Bank of India (Master Direction)',
    clauses: {
      'data_access': 'MD-IT-2023 Clause 4.2.1 (Unauthorized Access Prevention)',
      'identity_provision': 'MD-IT-2023 Clause 6.1.4 (Identity & Access Management)',
      'policy_violation': 'MD-IT-2023 Clause 8.3 (Incident Reporting Framework)',
      'replay_session': 'MD-IT-2023 Clause 10.2 (Forensic Audit Trail Persistence)',
      'cross_border': 'MD-IT-2023 Clause 12.1 (Data Localization & Sovereignty)',
      'unknown': 'MD-IT-2023 (General Compliance Reference)'
    }
  },
  SEC: {
    name: 'SEC Regulation S-P / SCI',
    clauses: {
      'data_access': 'Rule 30(a) (Safeguards Rule)',
      'identity_provision': 'Rule 204-2 (Investment Advisers Act - Recordkeeping)',
      'policy_violation': 'Regulation SCI Rule 1002 (Obligations to Report)',
      'replay_session': 'Rule 17a-4 (CFR - Record Preservation)',
      'cross_border': 'Regulation S-P (Privacy of Consumer Financial Information)',
      'unknown': 'SEC Compliance Framework (Standard Oversight)'
    }
  },
  GDPR: {
    name: 'General Data Protection Regulation',
    clauses: {
      'data_access': 'Article 32 (Security of Processing)',
      'identity_provision': 'Article 25 (Data Protection by Design)',
      'policy_violation': 'Article 33 (Breach Notification)',
      'replay_session': 'Article 30 (Records of Processing Activities)',
      'cross_border': 'Article 45 (Transfers on Adequacy Decision)',
      'unknown': 'GDPR Regulatory Framework'
    }
  }
};

/**
 * Translates a technical event type into a regulatory clause.
 * @param {string} eventType - The technical key (e.g., 'data_access')
 * @param {string} dialect - The target jurisdiction (e.g., 'RBI', 'SEC')
 */
export function translateToRegulatory(eventType, dialect = 'RBI') {
  const map = DIALECT_MAPS[dialect] || DIALECT_MAPS['RBI'];
  const clause = map.clauses[eventType] || map.clauses['unknown'];
  return {
    dialectName: map.name,
    clause,
    timestamp: new Date().toISOString()
  };
}

export const SUPPORTED_DIALECTS = Object.keys(DIALECT_MAPS);
