import React from 'react';

const ComingSoon = ({ title, description, badge, icon }) => (
  <div style={{ padding: 28 }}>
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{description}</div>
    </div>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 40px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      gap: 20,
    }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Coming Soon</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400, lineHeight: 1.7 }}>
        This module is under active development and will be available in a future release of Anchor Root.
      </div>
      {badge && (
        <span style={{
          padding: '6px 16px',
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          background: 'var(--accent-dim)',
          color: '#a78bfa',
          border: '1px solid rgba(124,58,237,0.25)',
          letterSpacing: '0.06em',
        }}>{badge}</span>
      )}
    </div>
  </div>
);

export function GlobalTelemetry() {
  return <ComingSoon
    title="Global Telemetry"
    description="Live governance telemetry aggregated from all enterprise spokes across the mesh."
    icon="🌐"
    badge="LAYER 2 — IN DEVELOPMENT"
  />;
}

export function FleetInspection() {
  return <ComingSoon
    title="Fleet Inspection"
    description="Deep-dive inspection tools for individual enterprise nodes and their audit histories."
    icon="🔍"
    badge="Q2 2026"
  />;
}

export function BillingSubscriptions() {
  return <ComingSoon
    title="Billing & Subscriptions"
    description="Subscription management, tier upgrades, and usage billing for provisioned enterprises."
    icon="💳"
    badge="STRIPE INTEGRATION — PLANNED"
  />;
}

export function CryptographicEngine() {
  return <ComingSoon
    title="Cryptographic Engine"
    description="Root-level key management, seal verification, and cryptographic audit chain administration."
    icon="🔐"
    badge="HIGH SECURITY — PENDING"
  />;
}

export function IdentityResolution() {
  return <ComingSoon
    title="Identity Resolution"
    description="Resolve and verify cryptographic identities for enterprises, auditors, and agents on the mesh."
    icon="🆔"
    badge="DAC LAYER 2 — IN DEVELOPMENT"
  />;
}

export function IdentityRecovery() {
  return <ComingSoon
    title="Identity Recovery"
    description="Root-authorized recovery flow for lost enterprise credentials and TOTP resets."
    icon="🔄"
    badge="SECURE CHANNEL REQUIRED"
  />;
}

export function NetworkOverrides() {
  return <ComingSoon
    title="Network Overrides"
    description="Emergency governance overrides, rule suppressions, and network-level policy exceptions."
    icon="⚡"
    badge="ROOT PRIVILEGE REQUIRED"
  />;
}

// Default exports for individual import compatibility
export default GlobalTelemetry;
