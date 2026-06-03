/**
 * AuditorsSection.jsx - Auditor Access Control Registry
 * Shows all auditors with their type, jurisdiction, capabilities, and scopes
 * Part of root-admin governance inventory
 */

import React, { useState } from 'react';
import { ChevronDown, Shield, Eye, FileText } from 'lucide-react';

export default function AuditorsSection() {
  const [expandedId, setExpandedId] = useState(null);

  const auditors = [
    {
      id: 'AUD-RB-INDIA-359',
      name: 'Regulatory Official',
      type: 'REGULATORY_AUDITOR',
      jurisdiction: 'IN (India)',
      organization: 'Oversight Authority',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'SYSTEM_WIDE',
        replayAuth: 'REQUEST_BASED',
        forensicAccess: 'RESTRICTED',
        exports: ['RBI', 'COMPLIANCE'],
        canIssueNotices: true,
      },
      assignedAt: '2026-01-15',
      tokenScope: 'regulator',
      portal: 'oversight.anchorgovernance.tech',
      clearanceLevel: 'ROOT_ENFORCEMENT',
    },
    {
      id: 'AUD-ORG-ANIM-127',
      name: 'Internal Compliance Officer',
      type: 'STANDARD_AUDITOR',
      jurisdiction: 'GLOBAL',
      organization: 'animuslab',
      hub: 'AN-IN-SOL01',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'HUB_ONLY',
        replayAuth: 'DENIED',
        forensicAccess: 'DENIED',
        exports: ['HUB_REPORTS'],
        canIssueNotices: false,
      },
      assignedAt: '2026-02-20',
      tokenScope: 'standard_hub_auditor',
      portal: 'dashboard.anchorgovernance.tech',
      clearanceLevel: 'HUB_ENFORCEMENT',
    },
    {
      id: 'AUD-ENT-CROSS-042',
      name: 'Enterprise Governance Director',
      type: 'CROSS_HUB_AUDITOR',
      jurisdiction: 'GLOBAL',
      organization: 'animuslab',
      hubs: ['AN-IN-SOL01', 'AN-GLOBAL-HUB'],
      status: 'ACTIVE',
      capabilities: {
        visibility: 'ORG_WIDE',
        replayAuth: 'REQUEST_BASED',
        forensicAccess: 'RESTRICTED',
        exports: ['ORG_ANALYTICS', 'DRIFT_REPORTS'],
        canIssueNotices: false,
      },
      assignedAt: '2026-01-10',
      tokenScope: 'cross_hub_auditor',
      portal: 'dashboard.anchorgovernance.tech',
      clearanceLevel: 'ORG_ENFORCEMENT',
    },
  ];

  const AuditorTypeTag = ({ type }) => {
    const styles = {
      REGULATORY_AUDITOR: 'bg-red-900/20 border-red-500 text-red-200',
      CROSS_HUB_AUDITOR: 'bg-purple-900/20 border-purple-500 text-purple-200',
      STANDARD_AUDITOR: 'bg-blue-900/20 border-blue-500 text-blue-200',
    };
    return (
      <span className={`px-2 py-1 border rounded text-xs font-mono ${styles[type] || 'bg-gray-700 text-gray-200'}`}>
        {type.replace(/_/g, ' ')}
      </span>
    );
  };

  const CapabilityBadge = ({ label, value, type = 'text' }) => {
    const colors = {
      allowed: 'bg-green-900/30 text-green-300',
      restricted: 'bg-amber-900/30 text-amber-300',
      denied: 'bg-red-900/30 text-red-300',
    };

    let color = colors.text;
    if (value === true || value === 'ALLOWED') color = colors.allowed;
    else if (value === 'RESTRICTED') color = colors.restricted;
    else if (value === false || value === 'DENIED') color = colors.denied;

    return (
      <div className={`px-2 py-1 rounded text-xs ${color}`}>
        <span className="font-semibold">{label}:</span> {String(value).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Auditor Access Registry
        </h2>
        <span className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
          {auditors.length} Active Auditors
        </span>
      </div>

      <div className="space-y-4">
        {auditors.map((auditor) => (
          <div
            key={auditor.id}
            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === auditor.id ? null : auditor.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-750 transition text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <AuditorTypeTag type={auditor.type} />
                  <span className="text-lg font-semibold text-slate-100">{auditor.name}</span>
                  <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded">
                    {auditor.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  <span className="font-mono">{auditor.id}</span>
                  {' • '}
                  <span>{auditor.organization}</span>
                  {auditor.hub && ` • Hub: ${auditor.hub}`}
                  {auditor.hubs && ` • Hubs: ${auditor.hubs.join(', ')}`}
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition ${
                  expandedId === auditor.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Details */}
            {expandedId === auditor.id && (
              <div className="bg-slate-750/50 border-t border-slate-700 p-4 space-y-4">
                {/* Identity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">CLEARANCE ID</label>
                    <p className="text-sm text-slate-200 font-mono">{auditor.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">CLEARANCE LEVEL</label>
                    <p className="text-sm text-slate-200 font-mono">{auditor.clearanceLevel}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">JURISDICTION</label>
                    <p className="text-sm text-slate-200">{auditor.jurisdiction}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">ASSIGNED AT</label>
                    <p className="text-sm text-slate-200">{auditor.assignedAt}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <label className="text-sm text-cyan-400 font-semibold mb-2 block">
                    <Eye className="w-4 h-4 inline mr-2" />
                    Governance Capabilities
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-800/50 p-3 rounded">
                    <CapabilityBadge label="Visibility" value={auditor.capabilities.visibility} />
                    <CapabilityBadge label="Replay Auth" value={auditor.capabilities.replayAuth} />
                    <CapabilityBadge label="Forensic Access" value={auditor.capabilities.forensicAccess} />
                    <CapabilityBadge label="Issue Notices" value={auditor.capabilities.canIssueNotices} />
                  </div>
                </div>

                {/* Exports & Portal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">
                      <FileText className="w-3 h-3 inline mr-1" />
                      EXPORT CAPABILITIES
                    </label>
                    <div className="mt-1 space-y-1">
                      {auditor.capabilities.exports.map((exp) => (
                        <span key={exp} className="block text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">PORTAL ACCESS</label>
                    <p className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded mt-1 font-mono break-all">
                      {auditor.portal}
                    </p>
                  </div>
                </div>

                {/* Token Scope */}
                <div>
                  <label className="text-xs text-cyan-400 font-mono">TOKEN SCOPE</label>
                  <p className="text-sm text-slate-200 font-mono bg-slate-800/50 px-2 py-1 rounded mt-1">
                    {auditor.tokenScope}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-900/40 border border-red-500"></span>
          <span className="text-slate-400">Regulatory (System-wide access)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-purple-900/40 border border-purple-500"></span>
          <span className="text-slate-400">Cross-Hub (Organization access)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-900/40 border border-blue-500"></span>
          <span className="text-slate-400">Standard (Hub-scoped access)</span>
        </div>
      </div>
    </div>
  );
}
