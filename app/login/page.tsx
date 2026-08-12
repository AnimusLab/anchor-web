"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DynamicLanyardCard, { LanyardCardData } from "@/components/auth/DynamicLanyardCard";
import { Shield, Key, Mail, Lock, Building2, User, Globe, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function EnterpriseLoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "onboard">("signin");
  const [step, setStep] = useState<"identity" | "totp">("identity");

  // Form Field Inputs (Strictly Mandatory *)
  const [accessId, setAccessId] = useState("");
  const [email, setEmail] = useState("");
  const [siloId, setSiloId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Onboarding Form States
  const [fullName, setFullName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("India (IN)");
  const [department, setDepartment] = useState("");

  // Status & Dynamic Card Binding
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [cardData, setCardData] = useState<LanyardCardData>({
    name: "",
    email: "",
    orgName: "",
    hubId: "",
    clearanceId: "",
    role: "SOVEREIGN OPERATOR",
    isVerified: false,
  });

  // Dynamic Card Mirroring Effect on Input Changes
  useEffect(() => {
    if (activeTab === "signin") {
      setCardData((prev) => ({
        ...prev,
        email: email || prev.email,
        hubId: siloId || prev.hubId,
        clearanceId: accessId || prev.clearanceId,
      }));
    } else {
      setCardData((prev) => ({
        ...prev,
        name: fullName,
        email: onboardEmail,
        orgName: companyName,
        role: department ? `${department.toUpperCase()} LEAD` : "PENDING REVIEW",
        clearanceId: "STAGING_REQ",
        hubId: "PENDING_PROVISION",
        isVerified: false,
        statusText: "ONBOARDING REQUEST // PENDING REVIEW",
      }));
    }
  }, [accessId, email, siloId, fullName, onboardEmail, companyName, department, activeTab]);

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
          orgName: data.orgName,
          hubId: data.hubId,
          clearanceId: data.clearanceId,
          role: data.role,
          fingerprint: data.fingerprint,
          isVerified: true,
          statusText: "CRYPTOGRAPHIC IDENTITY MATCHED // READY FOR 2FA",
        });

        if (!email) setEmail(data.email);
        if (!siloId) setSiloId(data.hubId);
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
    if (!accessId || !email || !siloId) {
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
          hubId: siloId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCardData((prev) => ({
          ...prev,
          isVerified: true,
          statusText: "AUTHENTICATED // SESSION ACTIVE",
        }));
        window.location.href = data.redirectTo || "/hub";
      } else {
        setErrorMsg(data.error || "Authentication failed. Invalid 2FA TOTP code.");
      }
    } catch (err) {
      setErrorMsg("Connection failure during login verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding Form Submission Handler
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !onboardEmail || !companyName) {
      setErrorMsg("Please complete all required onboarding fields (*).");
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
          orgName: companyName,
          city,
          region,
          department,
          portalType: "enterprise",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setCardData((prev) => ({
          ...prev,
          statusText: "STAGING REGISTRATION LOGGED",
        }));
      } else {
        setErrorMsg(data.error || "Failed to submit onboarding registration.");
      }
    } catch (err) {
      setErrorMsg("Connection failure during onboarding submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040508] text-white font-mono p-8 flex flex-col justify-between relative overflow-hidden selection:bg-[#6366f1] selection:text-white">
      {/* Background Mesh Quantum Telemetry Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04),transparent_60%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-4 py-4 relative z-20 flex justify-between items-center border-b border-white/10 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-sky-400 flex items-center justify-center font-bold text-slate-950 font-mono shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            A
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Anchor</div>
            <div className="text-[10px] font-mono text-[#6366f1]">ENTERPRISE PORTAL</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <span>SOVEREIGN CONTROL PLANE GATE</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* LEFT COLUMN: Mandatory Triple-Scope Identity Access Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-ping" />
              Sovereign Control Plane Gate
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
              {activeTab === "signin" ? "Cryptographic Access" : "Onboard Your Enterprise"}
            </h1>
            <p className="text-xs text-[#6C7293] leading-relaxed max-w-xl">
              {activeTab === "signin"
                ? "Verify your Ed25519 identity keys against the global registry node to activate your session."
                : "Register your organization on the Anchor sovereign mesh. Submitted registrations are staged for Root Administrator clearance review."}
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
                  ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20"
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
                  ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20"
                  : "text-[#6C7293] hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
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
                      ACCESS AUTHORIZATION ID <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accessId}
                      onChange={(e) => setAccessId(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., OWN-AN-MUM-842"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white tracking-widest transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#6C7293] font-bold tracking-wider block">
                      CORPORATE ACCESS EMAIL <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., tan@animuslab.dev"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white tracking-widest transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#6C7293] font-bold tracking-wider block">
                      ORGANIZATION HUB SILO ID <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={siloId}
                      onChange={(e) => setSiloId(e.target.value)}
                      onBlur={(e) => handleIdentifierBlur(e.target.value)}
                      placeholder="e.g., animuslab"
                      className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white tracking-widest transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-[#6366f1]/20 transition-all duration-200 mt-2 font-sans flex items-center justify-center space-x-2"
                  >
                    <span>Authenticate Node →</span>
                  </button>
                </form>
              ) : (
                /* STEP 2: TOTP CODE VERIFICATION */
                <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-lg font-mono text-xs">
                  <div className="bg-[#090B11] border border-[#6366f1]/30 p-4 rounded-xl text-[#6366f1]">
                    <div className="text-[10px] uppercase text-[#6C7293]">IDENTITY CONFIRMED</div>
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
                      className="w-full bg-[#090B11] border border-[#6366f1]/50 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-[#6366f1] focus:outline-none focus:border-[#6366f1] shadow-inner"
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
                      className="w-2/3 py-3 px-6 rounded-xl font-bold bg-[#6366f1] text-white hover:bg-[#4f46e5] transition shadow-lg flex items-center justify-center space-x-2 font-sans"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Establish Session →</span>}
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
                <label className="text-[#6C7293] font-bold tracking-wider block">YOUR FULL NAME <span className="text-[#f43f5e]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Tanishq Vaswani"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#6C7293] font-bold tracking-wider block">YOUR CORPORATE EMAIL <span className="text-[#f43f5e]">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="owner@company.al"
                  value={onboardEmail}
                  onChange={(e) => setOnboardEmail(e.target.value)}
                  className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#6C7293] font-bold tracking-wider block">COMPANY NAME <span className="text-[#f43f5e]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Global Bank"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#6C7293] font-bold tracking-wider block">CITY / BRANCH</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#6C7293] font-bold tracking-wider block">REGION / COUNTRY</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                  >
                    <option value="India (IN)">India (IN)</option>
                    <option value="United States (US)">United States (US)</option>
                    <option value="European Union (EU)">European Union (EU)</option>
                    <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#6C7293] font-bold tracking-wider block">DEPARTMENT / DIVISION</label>
                  <input
                    type="text"
                    placeholder="Risk Ops, Compliance"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] text-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-[#6366f1]/20 transition shadow-lg flex items-center justify-center space-x-2 text-sm mt-4 font-sans"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Submit for Clearance Review →</span>}
              </button>
            </form>
          )}

          {/* Dynamic Sandbox Trial Access Routing Interface */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <Link href="/demo" className="w-full sm:w-auto">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#10b981] font-bold px-5 py-3 rounded-xl tracking-wide transition-colors flex items-center justify-center space-x-2">
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
          <DynamicLanyardCard data={cardData} portalTheme="hub" mode={activeTab} />
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="px-8 py-4 border-t border-white/10 text-[10px] font-mono text-[#6C7293] flex justify-between items-center relative z-20 max-w-7xl mx-auto w-full">
        <div>CORE IDENTITY PROTOCOL: V6.0 // TRIPLE_FACTOR_AUTH</div>
        <div>SOVEREIGN RELAY ACTIVE · ANCHORGOVERNANCE.TECH</div>
      </footer>
    </div>
  );
}
