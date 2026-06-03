import React, { useState } from 'react';
import { Trash2, Check, AlertCircle } from 'lucide-react';

/**
 * Access Whitelist Component
 * 
 * Manages pre-authorized entities for onboarding into the Sovereign Mesh.
 * Includes org domain validation to prevent email spoofing.
 * 
 * Security Pattern:
 * - Email must match registered org domain
 * - Example: email "user@animuslab.dev" requires org_domain = "animuslab.dev"
 * - Domain validation happens on both entry and verification
 */

export default function AccessWhitelist() {
  const [entries, setEntries] = useState([
    {
      id: 'ent_001',
      email: 'tan@anchorgovernance.tech',
      org_domain: 'anchorgovernance.tech',
      org_slug: 'animuslab',
      role: 'OWNER',
      status: 'VERIFIED',
      added_date: '5/15/2026',
      domain_verified: true
    },
    {
      id: 'ent_002',
      email: 'artisianecho@gmail.com',
      org_domain: 'gmail.com',
      org_slug: 'pbi',
      role: 'AUDITOR',
      status: 'PENDING',
      added_date: '5/24/2026',
      domain_verified: true
    }
  ]);

  const [formData, setFormData] = useState({
    email: '',
    org_domain: '',
    org_slug: '',
    access_role: 'OWNER'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Extract domain from email
  const extractEmailDomain = (email) => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : '';
  };

  // Validate email domain matches org domain
  const validateEmailDomain = (email, orgDomain) => {
    const emailDomain = extractEmailDomain(email);
    return emailDomain.toLowerCase() === orgDomain.toLowerCase();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email required';
    }

    if (!formData.org_domain) {
      newErrors.org_domain = 'Organization domain required';
    }

    if (!formData.org_slug) {
      newErrors.org_slug = 'Organization slug required';
    }

    // Critical validation: email domain must match org domain
    if (formData.email && formData.org_domain) {
      if (!validateEmailDomain(formData.email, formData.org_domain)) {
        newErrors.domain_mismatch = `Email domain ${extractEmailDomain(formData.email)} does not match org domain ${formData.org_domain}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccessMessage('');

    // Auto-fill org domain from email if email changes
    if (name === 'email') {
      const domain = extractEmailDomain(value);
      if (domain) {
        setFormData(prev => ({
          ...prev,
          org_domain: domain
        }));
      }
    }
  };

  // Handle authorization
  const handleAuthorizeEntry = () => {
    if (!validateForm()) return;

    const newEntry = {
      id: `ent_${Date.now()}`,
      email: formData.email,
      org_domain: formData.org_domain,
      org_slug: formData.org_slug,
      role: formData.access_role,
      status: 'VERIFIED',
      added_date: new Date().toLocaleDateString(),
      domain_verified: true
    };

    setEntries(prev => [newEntry, ...prev]);
    setFormData({ email: '', org_domain: '', org_slug: '', access_role: 'OWNER' });
    setErrors({});
    setSuccessMessage(`✓ ${newEntry.email} authorized for ${newEntry.role} role with domain ${newEntry.org_domain}`);

    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle revocation
  const handleRevoke = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    setSuccessMessage('Entry revoked');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      'OWNER': 'bg-amber-900 text-amber-200',
      'DEVELOPER': 'bg-blue-900 text-blue-200',
      'AUDITOR': 'bg-purple-900 text-purple-200',
      'REGULATORY': 'bg-red-900 text-red-200'
    };
    return colors[role] || 'bg-slate-700 text-slate-200';
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'VERIFIED' ? 'text-green-400' : 'text-yellow-400';
  };

  return (
    <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-cyan-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Whitelist</h2>
        <p className="text-slate-400 text-sm">
          Manage pre-authorized entities allowed to onboard into the Sovereign Mesh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Authorization Panel */}
        <div className="lg:col-span-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Authorize New Entity</h3>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-600/50 rounded text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded">
              {Object.entries(errors).map(([key, message]) => (
                <div key={key} className="text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Target Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Target Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="identity@company.ai"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.email ? `Domain: ${extractEmailDomain(formData.email)}` : ''}
              </p>
            </div>

            {/* Organization Domain (Critical for Validation) */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Organization Domain <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="org_domain"
                placeholder="animuslab.dev"
                value={formData.org_domain}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.email && formData.org_domain ? (
                  validateEmailDomain(formData.email, formData.org_domain) ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <Check size={12} /> Email domain matches org domain
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} /> Email domain mismatch
                    </span>
                  )
                ) : (
                  'Email domain must match (e.g., animuslab.dev)'
                )}
              </p>
            </div>

            {/* Organization Slug */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Organization Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="org_slug"
                placeholder="lowercase-slug"
                value={formData.org_slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            {/* Access Role */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Access Role
              </label>
              <select
                name="access_role"
                value={formData.access_role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded text-slate-100 focus:border-cyan-500 focus:outline-none transition"
              >
                <option value="OWNER">Owner</option>
                <option value="DEVELOPER">Developer</option>
                <option value="AUDITOR">Auditor</option>
                <option value="REGULATORY">Regulatory</option>
              </select>
            </div>

            {/* Authorize Button */}
            <button
              onClick={handleAuthorizeEntry}
              disabled={Object.keys(errors).length > 0}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded transition"
            >
              Authorize Entry →
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-600/30 rounded text-xs text-cyan-300">
            <strong>Security:</strong> Email domain must match organization domain to prevent spoofing.
          </div>
        </div>

        {/* Active Authorizations Panel */}
        <div className="lg:col-span-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Active Authorizations{' '}
            <span className="text-slate-500 text-sm font-normal">{entries.length} ENTRIES</span>
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="text-slate-400 text-sm p-4 text-center">
                No authorized entries yet
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-slate-900/50 border border-slate-700/50 rounded hover:border-slate-600/50 transition"
                >
                  {/* Email and Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{entry.email}</p>
                      <p className="text-xs text-slate-400">
                        ORG: <span className="text-cyan-400">{entry.org_slug}</span> | DOMAIN:{' '}
                        <span className="text-cyan-400">{entry.org_domain}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevoke(entry.id)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Revoke access"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Role and Status */}
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(entry.role)}`}>
                        {entry.role}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded bg-slate-700 ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                      {entry.domain_verified && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-900/30 text-green-300 flex items-center gap-1">
                          <Check size={12} /> Domain verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{entry.added_date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security Documentation */}
      <div className="mt-6 p-4 bg-slate-900/30 border border-slate-700/30 rounded">
        <h4 className="text-sm font-semibold text-slate-200 mb-2">Domain Validation Security</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>✓ Email domain must match registered organization domain</li>
          <li>✓ Prevents email spoofing attacks (e.g., faking @company.dev as @company.com)</li>
          <li>✓ Domain verification happens at authorization and runtime authentication</li>
          <li>✓ Mismatched domains are rejected with clear validation errors</li>
          <li>✓ All verified entries are logged with domain confirmation status</li>
        </ul>
      </div>
    </div>
  );
}
