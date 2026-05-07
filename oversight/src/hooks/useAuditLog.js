/**
 * useAuditLog — fire-and-forget hook to log auditor actions to the DB.
 *
 * Usage:
 *   const log = useAuditLog();
 *   log('VAULT_VIEW', { target_id: entry.entry_id, target_name: entry.project_name });
 *   log('EXPORT',     { target_name: 'Decision Ledger CSV', detail: `${rows} rows` });
 *   log('LOGIN');
 */

import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export function useAuditLog() {
  const { token } = useAuth();

  return (action, opts = {}) => {
    if (!token) return;
    fetch(`${endpoints.baseUrl}/api/oversight/audit-trail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action,
        target_id:   opts.target_id   ?? null,
        target_name: opts.target_name ?? null,
        detail:      opts.detail      ?? null,
      }),
    }).catch(() => {}); // silent — never block the UI
  };
}
