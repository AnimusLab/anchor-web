/**
 * EnterpriseAccessSection.jsx - Enterprise User Access Control
 * Shows all owners and developers with their hub/org assignments and capability levels
 * Part of root-admin governance inventory
 */

import React, { useState } from 'react';
import { ChevronDown, Users, Building2, Lock } from 'lucide-react';

export default function EnterpriseAccessSection() {
  const [expandedId, setExpandedId] = useState(null);
  const [filterRole, setFilterRole] = useState('ALL');

  const users = [
    {
      id: 'OWN-AN-SOLAPUR-999',
      name: 'Tanishq Dasari',
      type: 'OWNER',
      organization: 'animuslab',
      hub: 'AN-IN-SOL01',
      jurisdiction: 'India (IN)',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'HUB_OWNER',
        canReplay: true,
        canExport: true,
        canManageTeam: true,
        canProvisionAgents: true,
        canModifyPolicy: true,
      },
      accessSince: '2026-01-01',
      tokenScope: 'owner_relay',
      portal: 'app.anchorgovernance.tech',
      clearanceLevel: 'OWNER_ROOT',
      permissions: ['MANAGE_HUB', 'INVITE_USERS', 'MODIFY_CONSTITUTION', 'ISSUE_TOKENS'],
    },
    {
      id: 'DEV-AN-SOLAPUR-142',
      name: 'Sarah Chen',
      type: 'DEVELOPER',
      organization: 'animuslab',
      hub: 'AN-IN-SOL01',
      jurisdiction: 'India (IN)',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'HUB_MEMBER',
        canReplay: false,
        canExport: false,
        canManageTeam: false,
        canProvisionAgents: true,
        canModifyPolicy: false,
      },
      accessSince: '2026-02-15',
      tokenScope: 'dev_member',
      portal: 'app.anchorgovernance.tech',
      clearanceLevel: 'DEV_OPERATIONAL',
      permissions: ['CREATE_AGENTS', 'VIEW_GOVERNANCE', 'DEPLOY_AGENTS'],
    },
    {
      id: 'OWN-AN-GLOBAL-001',
      name: 'James Peterson',
      type: 'OWNER',
      organization: 'animuslab',
      hub: 'AN-GLOBAL-HUB',
      jurisdiction: 'GLOBAL',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'HUB_OWNER',
        canReplay: true,
        canExport: true,
        canManageTeam: true,
        canProvisionAgents: true,
        canModifyPolicy: true,
      },
      accessSince: '2025-12-10',
      tokenScope: 'owner_relay',
      portal: 'app.anchorgovernance.tech',
      clearanceLevel: 'OWNER_ROOT',
      permissions: ['MANAGE_HUB', 'INVITE_USERS', 'MODIFY_CONSTITUTION', 'CROSS_HUB_VISIBILITY'],
    },
    {
      id: 'DEV-AN-GLOBAL-088',
      name: 'Priya Sharma',
      type: 'DEVELOPER',
      organization: 'animuslab',
      hub: 'AN-GLOBAL-HUB',
      jurisdiction: 'GLOBAL',
      status: 'ACTIVE',
      capabilities: {
        visibility: 'HUB_MEMBER',
        canReplay: false,
        canExport: false,
        canManageTeam: false,
        canProvisionAgents: true,
        canModifyPolicy: false,
      },
      accessSince: '2026-01-20',
      tokenScope: 'dev_member',
      portal: 'app.anchorgovernance.tech',
      clearanceLevel: 'DEV_OPERATIONAL',
      permissions: ['CREATE_AGENTS', 'VIEW_GOVERNANCE'],
    },
  ];

  const filtered = filterRole === 'ALL' ? users : users.filter((u) => u.type === filterRole);

  const RoleTag = ({ type }) => {
    const styles = {
      OWNER: 'bg-amber-900/20 border-amber-500 text-amber-200',
      DEVELOPER: 'bg-blue-900/20 border-blue-500 text-blue-200',
    };
    return (
      <span className={`px-2 py-1 border rounded text-xs font-mono font-bold ${styles[type]}`}>
        {type}
      </span>
    );
  };

  const CapabilityItem = ({ label, enabled }) => (
    <div
      className={`flex items-center gap-2 text-xs ${
        enabled ? 'text-green-300' : 'text-slate-500 line-through'
      }`}
    >
      <Lock className={`w-3 h-3 ${enabled ? 'text-green-400' : 'text-slate-600'}`} />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Enterprise Access Registry
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRole('ALL')}
            className={`px-3 py-1 text-xs rounded transition ${
              filterRole === 'ALL'
                ? 'bg-cyan-500 text-slate-900 font-bold'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('OWNER')}
            className={`px-3 py-1 text-xs rounded transition ${
              filterRole === 'OWNER'
                ? 'bg-amber-600 text-slate-900 font-bold'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Owners ({users.filter((u) => u.type === 'OWNER').length})
          </button>
          <button
            onClick={() => setFilterRole('DEVELOPER')}
            className={`px-3 py-1 text-xs rounded transition ${
              filterRole === 'DEVELOPER'
                ? 'bg-blue-600 text-slate-900 font-bold'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Developers ({users.filter((u) => u.type === 'DEVELOPER').length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-750 transition text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <RoleTag type={user.type} />
                  <span className="text-lg font-semibold text-slate-100">{user.name}</span>
                  <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded">
                    {user.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {user.organization} → {user.hub}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Clearance: <span className="font-mono text-slate-300">{user.id}</span>
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition ${
                  expandedId === user.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Details */}
            {expandedId === user.id && (
              <div className="bg-slate-750/50 border-t border-slate-700 p-4 space-y-4">
                {/* Identity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">CLEARANCE ID</label>
                    <p className="text-sm text-slate-200 font-mono mt-1">{user.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">CLEARANCE LEVEL</label>
                    <p className="text-sm text-slate-200 font-mono mt-1">{user.clearanceLevel}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">ORGANIZATION</label>
                    <p className="text-sm text-slate-200 mt-1">{user.organization}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">SOVEREIGN HUB</label>
                    <p className="text-sm text-slate-200 font-mono mt-1">{user.hub}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">JURISDICTION</label>
                    <p className="text-sm text-slate-200 mt-1">{user.jurisdiction}</p>
                  </div>
                  <div>
                    <label className="text-xs text-cyan-400 font-mono">ACCESS SINCE</label>
                    <p className="text-sm text-slate-200 mt-1">{user.accessSince}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <label className="text-sm text-cyan-400 font-semibold mb-2 block">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Governance Capabilities
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded">
                    <CapabilityItem label="Replay Authority" enabled={user.capabilities.canReplay} />
                    <CapabilityItem
                      label="Export Authority"
                      enabled={user.capabilities.canExport}
                    />
                    <CapabilityItem
                      label="Team Management"
                      enabled={user.capabilities.canManageTeam}
                    />
                    <CapabilityItem
                      label="Provision Agents"
                      enabled={user.capabilities.canProvisionAgents}
                    />
                    <CapabilityItem
                      label="Modify Constitution"
                      enabled={user.capabilities.canModifyPolicy}
                    />
                  </div>
                </div>

                {/* Permissions List */}
                <div>
                  <label className="text-sm text-cyan-400 font-semibold mb-2 block">
                    Direct Permissions
                  </label>
                  <div className="space-y-1">
                    {user.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="inline-block bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded mr-2 mb-1 font-mono"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portal Access */}
                <div>
                  <label className="text-xs text-cyan-400 font-mono">PORTAL</label>
                  <p className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded mt-1 font-mono break-all">
                    {user.portal}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-3 rounded text-center">
          <p className="text-xs text-slate-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-cyan-400">{users.length}</p>
        </div>
        <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded text-center">
          <p className="text-xs text-amber-300 mb-1">Owners</p>
          <p className="text-2xl font-bold text-amber-300">{users.filter((u) => u.type === 'OWNER').length}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded text-center">
          <p className="text-xs text-blue-300 mb-1">Developers</p>
          <p className="text-2xl font-bold text-blue-300">{users.filter((u) => u.type === 'DEVELOPER').length}</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded text-center">
          <p className="text-xs text-slate-400 mb-1">Active Sessions</p>
          <p className="text-2xl font-bold text-green-400">{users.filter((u) => u.status === 'ACTIVE').length}</p>
        </div>
      </div>
    </div>
  );
}
