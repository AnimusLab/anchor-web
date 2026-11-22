"use client";

import { useEffect, useState } from "react";

interface RedeemResult {
  success: boolean;
  clearanceId?: string;
  email?: string;
  role?: string;
  hubId?: string;
  totpSecret?: string;
  otpauthUri?: string;
  loginUrl?: string;
  error?: string;
}

export default function OnboardClient({ token: initialToken }: { token: string }) {
  const [token, setToken] = useState(initialToken);
  const [ready, setReady] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const value = decodeURIComponent(hash.slice("#token=".length));
      if (value) setToken(value);
    }
    setReady(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/onboard/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName: displayName || undefined }),
      });
      const data = await res.json();
      setResult(res.ok ? { success: true, ...data } : { success: false, error: data.error });
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div style={card}>
        <div style={kicker}>ANCHOR GOVERNANCE PLATFORM</div>
        <h1 style={h1}>Checking your invitation…</h1>
        <p style={p}>Please wait while this private link is verified.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={card}>
        <h1 style={h1}>Invitation link incomplete</h1>
        <p style={p}>
          This page needs a valid onboarding token. Use the private link from your
          AnimusLab invitation email.
        </p>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div style={card}>
        <div style={kicker}>ANCHOR GOVERNANCE PLATFORM</div>
        <h1 style={h1}>Your Hub access is active</h1>
        <p style={p}>
          Clearance <strong>{result.clearanceId}</strong> has been provisioned for{" "}
          <strong>{result.email}</strong>.
        </p>

        <div style={secretBox}>
          <div style={secretLabel}>AUTHENTICATOR SETUP KEY</div>
          <div style={secretValue}>{result.totpSecret}</div>
        </div>

        <p style={p}>
          Enter this setup key manually in your authenticator app, then sign in with
          your Clearance ID and the current 6-digit code. Treat the key like a password:
          it is shown once and should never be shared.
        </p>

        <a href={result.loginUrl || "/login?portal=hub"} style={button}>
          Continue to sign in
        </a>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={kicker}>ANCHOR GOVERNANCE PLATFORM</div>
      <h1 style={h1}>Activate your Hub access</h1>
      <p style={p}>
        This is a single-use invitation. Confirm your name to provision your Hub
        Manager clearance and authenticator.
      </p>

      <form onSubmit={submit}>
        <label style={label} htmlFor="displayName">
          Full name
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Elena Rostova"
          style={input}
          autoComplete="name"
        />
        <button type="submit" style={button} disabled={pending}>
          {pending ? "Activating…" : "Activate Hub access"}
        </button>
      </form>

      {result && !result.success && (
        <p style={{ ...p, color: "#b91c1c", marginTop: 16 }}>{result.error}</p>
      )}

      <p style={{ ...p, fontSize: 11, color: "#94a3b8", marginTop: 20 }}>
        This link expires automatically and cannot be reused. If it has expired,
        contact your AnimusLab administrator.
      </p>
    </div>
  );
}

const card: React.CSSProperties = {
  maxWidth: 520,
  margin: "64px auto",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 36,
  boxShadow: "0 24px 60px -30px rgba(15,23,42,.35)",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  color: "#0b1220",
};
const kicker: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#2563eb",
  fontWeight: 800,
  marginBottom: 8,
};
const h1: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  margin: "0 0 12px",
};
const p: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: "#334155" };
const label: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
  margin: "20px 0 6px",
};
const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
};
const button: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
  border: "none",
  borderRadius: 10,
  padding: "13px 0",
  marginTop: 18,
  cursor: "pointer",
};
const secretBox: React.CSSProperties = {
  background: "#0b1220",
  borderRadius: 12,
  padding: 18,
  margin: "20px 0",
  textAlign: "center",
};
const secretLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#93c5fd",
  fontWeight: 800,
};
const secretValue: React.CSSProperties = {
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
  fontSize: 18,
  fontWeight: 800,
  color: "#ffffff",
  letterSpacing: 2,
  wordBreak: "break-all",
  marginTop: 8,
};
