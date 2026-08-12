"use client";

import { useState, useEffect } from "react";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import { Shield, Key, Mail, Lock, Building2, User, Globe, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react";

export default function OversightLoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "onboard">("signin");
  const [step, setStep] = useState<"identity" | "totp">("identity");

  // Sign In Form States
  const [accessId, setAccessId] = useState("");
  const [email, setEmail] = useState("");
  const [agencyHubId, setAgencyHubId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Onboarding Form States
  const [fullName, setFullName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [reqAgencyHub, setReqAgencyHub] = useState("");
  const [jurisdiction, setJurisdiction] = useState("India (RBI)");

  // Status & Dynamic Card Binding
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [cardData, setCardData] = useState<LanyardCardData>({
    name: "",
    email: "",
    orgName: "STATUTORY AGENCY",
    hubId: "AGENCY_PENDING",
    clearanceId: "ID_PENDING",
    role: "REGULATORY AUDITOR",
    isVerified: false,
  });

  // Dynamic Card Mirroring Effect on Input Changes
  useEffect(() => {
    if (activeTab === "signin") {
      setCardData((prev) => ({
        ...prev,
        email: email || prev.email,
        hubId: agencyHubId || prev.hubId,
        clearanceId: accessId || prev.clearanceId,
      }));
    } else {
      setCardData((prev) => ({
        ...prev,
        name: fullName,
        email: onboardEmail,
        orgName: reqAgencyHub ? `AGENCY: ${reqAgencyHub.toUpperCase()}` : "REGULATORY AGENCY",
        role: "STATUTORY OFFICER",
        clearanceId: "AUD_REQ_PENDING",
        hubId: reqAgencyHub || "PENDING",
        isVerified: false,
        statusText: "OVERSIGHT CLEARANCE // PENDING REVIEW",
      }));
    }
  }, [accessId, email, agencyHubId, fullName, onboardEmail, reqAgencyHub, activeTab]);

  // Server-Side Whitelist Scanner & Autofill Handler
  const handleIdentifierBlur = async (queryVal: string) => {
    if (!queryVal || queryVal.length < 3 || isSearching) return;

    setIsSearching(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: queryVal }),
      });

      const data = await res.json();

      if (res.ok && data.found) {
        setCardData({
          name: data.name,
          email: data.email,
          orgName: data.orgName || "REGULATORY AGENCY",
          hubId: data.hubId,
          clearanceId: data.clearanceId,
          role: data.role,
          fingerprint: data.fingerprint,
          isVerified: true,
          statusText: "AUDITOR CLEARANCE MATCHED // READY FOR 2FA",
        });

        if (!email) setEmail(data.email);
        if (!agencyHubId) setAgencyHubId(data.hubId);
        if (!accessId) setAccessId(data.clearanceId);
      }
    } catch (err) {
      console.error("Autofill lookup failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Continue to TOTP 2FA Verification Step
  const handleProceedToTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your official regulatory email address.");
      return;
    }
    setErrorMsg("");
    setStep("totp");
  };

  // Final Session Establishment Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      setErrorMsg("Please enter the 6-digit TOTP authentication code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          totpCode,
          accessId,
          hubId: agencyHubId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCardData((prev) => ({
          ...prev,
          isVerified: true,
          statusText: "AUDITOR SESSION VERIFIED // ACTIVE",
        }));
        window.location.href = data.redirectTo || "/oversight";
      } else {
        setErrorMsg(data.error || "Authentication failed. Invalid 2FA TOTP code.");
      }
    } catch (err) {
      setErrorMsg("Connection failure during auditor verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding Form Submission Handler
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !onboardEmail || !reqAgencyHub) {
      setErrorMsg("Please complete all required regulatory fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: onboardEmail,
          orgName: reqAgencyHub,
          jurisdiction,
          portalType: "oversight",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Regulatory clearance request submitted. Root Administrator review pending.");
        setCardData((prev) => ({
          ...prev,
          statusText: "STAGING REGISTRATION LOGGED",
        }));
      } else {
        setErrorMsg(data.error || "Failed to submit regulatory clearance request.");
      }
    } catch (err) {
      setErrorMsg("Connection failure during clearance submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Holographic Mesh Grid */}
      <div className="absolute inset-0 bg-[radial-[#1e1b18]_1px,transparent_1px] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-8 py-6 relative z-20 flex justify-between items-center border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center font-bold text-slate-950 font-mono shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            O
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Anchor Oversight</div>
            <div className="text-[10px] font-mono text-amber-400">REGULATORY PORTAL</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>REGULATORY RELAY ACTIVE</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="text-xs font-mono text-amber-400 font-bold tracking-wider mb-2">
              CRYPTOGRAPHIC AUDIT LEDGER ACCESS
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 font-sans">
              {activeTab === "signin" ? "Regulatory Authorization" : "Request Regulatory Clearance"}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              {activeTab === "signin"
                ? "Authorized statutory regulators and auditors access tamper-evident AI decision audit chains and sovereign telemetry logs via air-gapped relay."
                : "Submit official credentials for statutory auditor access. Clearance requests require verification by AnimusLab Root Administration."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-[#0d0f1a] border border-white/10 font-mono text-xs">
            <button
              onClick={() => {
                setActiveTab("signin");
                setStep("identity");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 ${
                activeTab === "signin"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("onboard");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center space-x-2 ${
                activeTab === "onboard"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Onboard</span>
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="glass-card p-4 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="glass-card p-4 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === "signin" && (
            <div>
              {step === "identity" ? (
                <form onSubmit={handleProceedToTotp} className="space-y-4 max-w-lg font-mono text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">
                      TACTICAL CLEARANCE ID (OPTIONAL)
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. SEC-ALFA-9 or AUD-RBI-009"
                        value={accessId}
                        onChange={(e) => setAccessId(e.target.value)}
                        onBlur={(e) => handleIdentifierBlur(e.target.value)}
                        className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">
                      OFFICIAL REGULATORY EMAIL *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="auditor@regulator.gov"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => handleIdentifierBlur(e.target.value)}
                        className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">
                      AGENCY HUB ID (OPTIONAL)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="SEC, RBI, NIST..."
                        value={agencyHubId}
                        onChange={(e) => setAgencyHubId(e.target.value)}
                        className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2 text-sm mt-4 font-sans"
                  >
                    <span>Review Clearance & 2FA →</span>
                  </button>
                </form>
              ) : (
                /* STEP 2: TOTP CODE VERIFICATION */
                <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-lg font-mono text-xs">
                  <div className="glass-card p-4 border border-amber-500/30 text-amber-300">
                    <div className="text-[10px] uppercase text-slate-400">REGULATORY CREDENTIAL CONFIRMED</div>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">{email}</div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 uppercase font-bold text-[10px]">
                      ENTER 6-DIGIT TOTP AUTHENTICATION CODE
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="671445"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-[#070b16]/90 border border-amber-500/50 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep("identity")}
                      className="w-1/3 py-3 px-4 rounded-xl font-bold glass-badge text-slate-300 hover:text-white transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2 font-sans"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Establish Auditor Session →</span>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ONBOARDING FORM */}
          {activeTab === "onboard" && (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 max-w-lg font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">OFFICER FULL NAME *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Inspector R. K. Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">OFFICIAL REGULATORY EMAIL *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="auditor@regulator.gov"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">REQUESTED AGENCY HUB ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RBI, SEC, FCA, EU-AI-ACT"
                  value={reqAgencyHub}
                  onChange={(e) => setReqAgencyHub(e.target.value)}
                  className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">JURISDICTION (NATION STATE)</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#070b16]/80 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="India (RBI)">India (RBI)</option>
                  <option value="United States (SEC)">United States (SEC)</option>
                  <option value="European Union (EU AI Act)">European Union (EU AI Act)</option>
                  <option value="United Kingdom (FCA)">United Kingdom (FCA)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2 text-sm mt-4 font-sans"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Request Regulatory Access →</span>}
              </button>
            </form>
          )}
        </div>

        {/* Right Dynamic Hanging Lanyard ID Card Column */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <DynamicLanyardCard data={cardData} portalTheme="oversight" mode={activeTab} />
        </div>
      </main>

      {/* Footer Disclaimer Bar */}
      <footer className="px-8 py-4 border-t border-white/[0.08] text-[10px] font-mono text-slate-500 flex justify-between items-center relative z-20">
        <div>ENFORCEMENT PRIORITY: 01 // SYSTEM_VERSION: V6.0.2</div>
        <div>AIR-GAPPED RELAY ACTIVE · OVERSIGHT.ANCHORGOVERNANCE.TECH</div>
      </footer>
    </div>
  );
}
