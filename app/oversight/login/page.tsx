"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import { Shield, Key, Mail, Lock, Building2, User, Globe, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react";

export default function OversightLoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "onboard">("signin");
  const [step, setStep] = useState<"identity" | "totp">("identity");

  // Form Field Inputs (Strictly Mandatory *)
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
    role: "STATUTORY OFFICER",
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

  // Continue to TOTP 2FA Verification Step (Strictly Mandatory Enforcement)
  const handleProceedToTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessId || !email || !agencyHubId) {
      setErrorMsg("CRITICAL_INVARIANT_FAILURE: All registration fields are strictly mandatory (*).");
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
      setErrorMsg("Please complete all required regulatory fields (*).");
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
    <div className="min-h-screen bg-[#040508] text-white font-mono p-8 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Quantum Telemetry Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04),transparent_60%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-4 py-4 relative z-20 flex justify-between items-center border-b border-white/10 max-w-7xl mx-auto w-full">
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
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>REGULATORY RELAY ACTIVE</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* LEFT COLUMN: Mandatory Triple-Scope Identity Access Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Cryptographic Audit Ledger Access
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
              {activeTab === "signin" ? "Regulatory Authorization" : "Request Regulatory Clearance"}
            </h1>
            <p className="text-xs text-[#6C7293] leading-relaxed max-w-xl">
              {activeTab === "signin"
                ? "Authorized statutory regulators and auditors access tamper-evident AI decision audit chains and sovereign telemetry logs via air-gapped relay."
                : "Submit official credentials for statutory auditor access. Clearance requests require verification by AnimusLab Root Administration."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-[#090B11] border border-white/10 font-mono text-xs">
            <button
              onClick={() => {
                setActiveTab("signin");
                setStep("identity");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`px-5 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                activeTab === "signin"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-[#6C7293] hover:text-white"
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
              className={`px-5 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                activeTab === "onboard"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-[#6C7293] hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Onboard</span>
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="border border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e] p-4 rounded-xl text-xs font-mono flex items-center space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#f43f5e]" />
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="border border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] p-4 rounded-xl text-xs font-mono flex items-center space-x-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#10b981]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === "signin" && (
            <div>
              {step === "identity" ? (
                <form onSubmit={handleProceedToTotp} className="space-y-4 max-w-lg font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#6C7293] font-bold tracking-wider block">
                      TACTICAL CLEARANCE ID <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accessId}
                      onChange={(e) => setAccessId(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., SEC-ALFA-9 or AUD-RBI-009"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white tracking-widest transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#6C7293] font-bold tracking-wider block">
                      OFFICIAL REGULATORY EMAIL <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., auditor@regulator.gov"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white tracking-widest transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#6C7293] font-bold tracking-wider block">
                      AGENCY HUB ID <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={agencyHubId}
                      onChange={(e) => setAgencyHubId(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., SEC, RBI, NIST"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white tracking-widest transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-amber-500/20 transition-all duration-200 mt-2 font-sans flex items-center justify-center space-x-2"
                  >
                    <span>Review Clearance & 2FA →</span>
                  </button>
                </form>
              ) : (
                /* STEP 2: TOTP CODE VERIFICATION */
                <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-lg font-mono text-xs">
                  <div className="bg-[#090B11] border border-amber-500/30 p-4 rounded-xl text-amber-400">
                    <div className="text-[10px] uppercase text-[#6C7293]">REGULATORY CREDENTIAL CONFIRMED</div>
                    <div className="text-sm font-bold text-white mt-0.5">{email}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[#6C7293] font-bold tracking-wider uppercase text-[10px]">
                      ENTER 6-DIGIT TOTP AUTHENTICATION CODE <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="671445"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-[#090B11] border border-amber-500/50 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep("identity")}
                      className="w-1/3 py-3 px-4 rounded-xl font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 py-3 px-6 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg flex items-center justify-center space-x-2 font-sans"
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
              <div className="space-y-1.5">
                <label className="text-[#6C7293] font-bold tracking-wider block">OFFICER FULL NAME <span className="text-[#f43f5e]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Inspector R. K. Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#6C7293] font-bold tracking-wider block">OFFICIAL REGULATORY EMAIL <span className="text-[#f43f5e]">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="auditor@regulator.gov"
                  value={onboardEmail}
                  onChange={(e) => setOnboardEmail(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#6C7293] font-bold tracking-wider block">REQUESTED AGENCY HUB ID <span className="text-[#f43f5e]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g., RBI, SEC, FCA, EU-AI-ACT"
                  value={reqAgencyHub}
                  onChange={(e) => setReqAgencyHub(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#6C7293] font-bold tracking-wider block">JURISDICTION (NATION STATE)</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white transition"
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
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-amber-500/20 transition shadow-lg flex items-center justify-center space-x-2 text-sm mt-4 font-sans"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Request Regulatory Access →</span>}
              </button>
            </form>
          )}

          {/* Dynamic Sandbox Trial Access Routing Interface */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <Link href="/demo" className="w-full sm:w-auto">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 font-bold px-5 py-3 rounded-xl tracking-wide transition-colors flex items-center justify-center space-x-2">
                <span>🚀 Launch 1-Month Free Sandbox</span>
              </button>
            </Link>
            <div className="text-[10px] text-[#6C7293] max-w-[200px] leading-normal text-right hidden sm:block font-mono">
              Trial sandbox environments auto-terminate after 30 calendar days.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Flipping Liquid Glass Sovereign Credential Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <DynamicLanyardCard data={cardData} portalTheme="oversight" mode={activeTab} />
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="px-8 py-4 border-t border-white/10 text-[10px] font-mono text-[#6C7293] flex justify-between items-center relative z-20 max-w-7xl mx-auto w-full">
        <div>ENFORCEMENT PRIORITY: 01 // SYSTEM_VERSION: V6.0.3</div>
        <div>AIR-GAPPED RELAY ACTIVE · OVERSIGHT.ANCHORGOVERNANCE.TECH</div>
      </footer>
    </div>
  );
}
