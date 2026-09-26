"use client";

import { useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   ANCHOR GOVERNANCE — INTERACTIVE PRICING CALCULATOR
   Implements agreed discount policy exactly:
   • Flat unconditional 15% bundle discount on all configurations
   • Multi-year term: 3yr=12%, 4yr=15%, 5+yr=18% (no 2yr option)
   • Additional Project Pack as whole unit ($23,500) — no per-slot line
   • Governed AI Model Slot confirmed at $2,500/yr
   • Professional Services shown with full ranges, est. midpoint for calc
───────────────────────────────────────────────────────────── */

/* ── RATE CARD ───────────────────────────────────────────────── */

const SEATS = [
  { key: "hub_mgr",   label: "Hub Manager",        sub: "L3 · Dual-key cryptographic sovereignty",  rate: 9000 },
  { key: "proj_lead", label: "Project Lead",        sub: "L2 · API keys, triage, telemetry stream",  rate: 4500 },
  { key: "dev",       label: "Developer",           sub: "L1 · CLI scans, @anchor.guard runtime",    rate: 1500 },
  { key: "std_aud",   label: "Standard Auditor",    sub: "L1 · DAC forensics, single-hub scope",     rate: 4500 },
  { key: "cross_aud", label: "Cross-Hub Auditor",   sub: "L2 · Multi-hub global scope",              rate: 8500 },
] as const;

const ADDONS = [
  { key: "proj_pack",  label: "Additional Project Pack",          sub: "1 PL + 10 Devs + 1 Auditor + 1 model slot",  rate: 23500 },
  { key: "dev_pack",   label: "Developer Pack (10 seats)",        sub: "@anchor.guard + CLI + AST linting",           rate: 15000 },
  { key: "pl_pack",    label: "Project Lead Pack (3 seats)",      sub: "Key issuance, triage velocity",               rate: 10500 },
  { key: "aud_pack",   label: "Standard Auditor Pack (5 seats)",  sub: "DAC forensics, single-hub scope",             rate: 22500 },
  { key: "xaud_pack",  label: "Cross-Hub Auditor Pack (3 seats)", sub: "Multi-hub global scope + consolidated filings", rate: 25500 },
  { key: "hub_mgr2",   label: "Extra Hub Manager (1 seat)",       sub: "L3 · sold individually",                     rate: 9000  },
  { key: "hub_extra",  label: "Additional Hub Container",         sub: "Isolated branch infrastructure",              rate: 7000  },
  { key: "model_slot", label: "Governed AI Model Slot",           sub: "Statutory mapping per production model · confirmed $2,500/yr", rate: 2500 },
] as const;

const SERVICES = [
  { key: "svc_assess",  label: "Governance Assessment",             range: "$800–$1,500",   mid: 1150,  note: "3–5 days" },
  { key: "svc_impl",    label: "Implementation & Onboarding",       range: "$2,000–$15,000", mid: 8500, note: "2–4 weeks" },
  { key: "svc_train",   label: "On-site Training & Deployment",     range: "from $3,000/day + travel", mid: 3000, note: "custom scope" },
  { key: "svc_dialect", label: "Custom Jurisdiction Dialect",       range: "$8,000–$20,000", mid: 14000, note: "2–3 weeks" },
  { key: "svc_reg",     label: "Regulatory Compliance Assessment",  range: "$1,000–$2,500",  mid: 1750,  note: "3–5 days" },
] as const;

// Confirmed policy
const BUNDLE_DISC = 0.15;
const TERM_DISC: Record<number, number> = { 1: 0, 3: 0.12, 4: 0.15, 5: 0.18 };
const TAX_OPTIONS = [
  { label: "No Tax / Exempt", rate: 0 },
  { label: "India — GST 18%", rate: 18 },
  { label: "UK — VAT 20%", rate: 20 },
  { label: "EU Standard — VAT 21%", rate: 21 },
  { label: "Custom Rate", rate: -1 },
];

/* ── HELPERS ───────────────────────────────────────────────── */
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtYr = (n: number) => fmt(n) + " / yr";

type SeatKey   = typeof SEATS[number]["key"];
type AddonKey  = typeof ADDONS[number]["key"];
type ServiceKey = typeof SERVICES[number]["key"];

type Counts<T extends string> = Record<T, number>;

/* ── STEPPER ───────────────────────────────────────────────── */
function Stepper({
  value, min = 0, max = 500,
  onChange,
}: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-[#DDD8CE] dark:border-white/15 rounded-[5px] overflow-hidden bg-white dark:bg-white/5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-base text-[#1C1B19] dark:text-white hover:bg-[#F3F1EC] dark:hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
      >−</button>
      <span className="w-11 text-center font-mono text-[13px] font-medium text-[#1C1B19] dark:text-white border-x border-[#DDD8CE] dark:border-white/15 h-8 flex items-center justify-center select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-base text-[#1C1B19] dark:text-white hover:bg-[#F3F1EC] dark:hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
      >+</button>
    </div>
  );
}

/* ── TOGGLE ────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full flex-shrink-0 transition-colors duration-200 ${
        checked ? "bg-[#1E3A5F]" : "bg-[#DDD8CE] dark:bg-white/20"
      }`}
    >
      <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"}`} />
    </button>
  );
}

/* ── SECTION LABEL ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[9px] font-bold tracking-[0.13em] uppercase font-mono text-[#1E3A5F] dark:text-blue-400 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#DDD8CE] dark:bg-white/10" />
    </div>
  );
}

/* ── LEDGER LINE ───────────────────────────────────────────── */
function LedgerLine({
  label, sub, amount, deduct = false, bold = false,
}: { label: string; sub?: string; amount: string; deduct?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-baseline gap-2 py-[7px] border-b border-[#DDD8CE] dark:border-white/8 last:border-b-0 ${deduct ? "text-[#3F6E4E]" : ""}`}>
      <div className="min-w-0">
        <p className={`text-[13px] leading-snug ${bold ? "font-semibold" : ""} ${deduct ? "text-[#3F6E4E]" : "text-[#1C1B19] dark:text-white"}`}>
          {deduct && "−"}{label}
        </p>
        {sub && <p className="text-[11px] text-[#6B6762] dark:text-white/45 mt-0.5">{sub}</p>}
      </div>
      <span className={`font-mono text-[13px] font-medium whitespace-nowrap flex-shrink-0 ${deduct ? "text-[#3F6E4E]" : bold ? "text-[#1C1B19] dark:text-white font-semibold" : "text-[#1C1B19] dark:text-white"}`}>
        {amount}
      </span>
    </div>
  );
}

/* ── LEDGER SECTION HEAD ───────────────────────────────────── */
function LedgerSectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.13em] uppercase font-mono text-[#6B6762] dark:text-white/40 pt-3 pb-1">
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export function PricingCalculator() {
  const [term, setTerm] = useState<1 | 3 | 4 | 5>(1);
  const [seats,    setSeats]   = useState<Counts<SeatKey>>(   Object.fromEntries(SEATS.map(s => [s.key, s.key === "hub_mgr" ? 1 : s.key === "proj_lead" ? 1 : s.key === "dev" ? 5 : s.key === "std_aud" ? 1 : 0])) as Counts<SeatKey>);
  const [addons,   setAddons]  = useState<Counts<AddonKey>>(  Object.fromEntries(ADDONS.map(a => [a.key, 0])) as Counts<AddonKey>);
  const [hubs,     setHubs]    = useState(1);
  const [svcs,     setSvcs]    = useState<Counts<ServiceKey>>(Object.fromEntries(SERVICES.map(s => [s.key, 0])) as Counts<ServiceKey>);
  const [taxIdx,   setTaxIdx]  = useState(0);
  const [customTax,setCustomTax] = useState(9);

  const adjSeat  = useCallback((k: SeatKey,  v: number) => setSeats(p  => ({ ...p, [k]: v })), []);
  const adjAddon = useCallback((k: AddonKey, v: number) => setAddons(p => ({ ...p, [k]: v })), []);
  const adjSvc   = useCallback((k: ServiceKey, v: boolean) => setSvcs(p => ({ ...p, [k]: v ? 1 : 0 })), []);

  /* ── CALC ── */
  const seatTotal  = SEATS.reduce((s, r) => s + r.rate * seats[r.key], 0);
  const addonTotal = ADDONS.reduce((s, a) => s + a.rate * addons[a.key], 0);
  const infraTotal = hubs * 7000;
  const svcTotal   = SERVICES.reduce((s, r) => s + r.mid * svcs[r.key], 0);

  const annualList  = seatTotal + infraTotal + addonTotal;
  const bundleDisc  = annualList * BUNDLE_DISC;
  const afterBundle = annualList - bundleDisc;
  const termPct     = TERM_DISC[term] ?? 0;
  const termDisc    = afterBundle * termPct;
  const netAnnual   = afterBundle - termDisc;
  const contractBase = netAnnual * term + svcTotal;

  const taxRate = TAX_OPTIONS[taxIdx].rate === -1 ? customTax / 100 : (TAX_OPTIONS[taxIdx].rate ?? 0) / 100;
  const taxAmt  = contractBase * taxRate;
  const finalTotal = contractBase + taxAmt;

  const totalSaving = (bundleDisc + termDisc) * term;
  const savingsPct  = annualList > 0 ? Math.round((bundleDisc + termDisc) / annualList * 100) : 0;

  const hasConfig = annualList > 0 || svcTotal > 0;

  /* ── MAILTO ── */
  const mailtoHref = (() => {
    const subj = encodeURIComponent(`Anchor Quote Request — ${fmt(finalTotal)} estimate (${term}-yr)`);
    const rows = [
      "Anchor Governance Hub — Formal Quote Request", "",
      `Contract Term: ${term} year${term > 1 ? "s" : ""}`, "",
      "— Seat Configuration —",
      ...SEATS.filter(s => seats[s.key] > 0).map(s => `  ${s.label}: ${seats[s.key]} seats`),
      `  Hub Containers: ${hubs}`,
      ...ADDONS.filter(a => addons[a.key] > 0).map(a => `  ${a.label}: ${addons[a.key]}`),
      "",
      "— Discount Summary —",
      `  Standing Bundle Discount (15%): −${fmt(bundleDisc)} / yr`,
      ...(termDisc > 0 ? [`  ${term}-Year Term Discount (${(termPct * 100).toFixed(0)}%): −${fmt(termDisc)} / yr`] : []),
      `  Discounted Annual Rate: ${fmt(netAnnual)}`,
      ...(svcTotal > 0 ? [`  Professional Services (one-time): ${fmt(svcTotal)}`] : []),
      ...(taxRate > 0  ? [`  Tax (${(taxRate * 100).toFixed(1)}%): ${fmt(taxAmt)}`] : []),
      "",
      `ESTIMATED TOTAL (${term}-yr): ${fmt(finalTotal)}`,
      "",
      "Please send a formal order form with final terms.",
    ];
    return `mailto:tan@animuslab.dev?subject=${subj}&body=${encodeURIComponent(rows.join("\n"))}`;
  })();

  /* ── TERM BUTTONS ── */
  const TERMS: Array<{ val: 1|3|4|5; label: string; disc?: string }> = [
    { val: 1, label: "1 Year" },
    { val: 3, label: "3 Years", disc: "+12%" },
    { val: 4, label: "4 Years", disc: "+15%" },
    { val: 5, label: "5+ Years", disc: "+18%" },
  ];

  return (
    <section className="py-20 px-4 sm:px-8 border-y border-slate-200 dark:border-white/10 bg-[#FAFAF7] dark:bg-[#0E0E12]">
      <div className="max-w-[1340px] mx-auto">

        {/* Section header */}
        <div className="text-center space-y-3 mb-12">
          <p className="text-[11px] font-mono font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
            03 // Interactive Pricing Calculator
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white">
            Build Your Configuration
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Assemble your exact seat count from the published rate card. The 15% bundle discount and any multi-year term discount are applied transparently — the same math a procurement team would run.
          </p>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0 border border-[#DDD8CE] dark:border-white/12 rounded-3xl overflow-hidden shadow-sm">

          {/* ══════ LEFT: CONFIG ══════ */}
          <div className="p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#DDD8CE] dark:border-white/12 bg-[#FAFAF7] dark:bg-[#0E0E12] space-y-7">

            {/* Rate card notice */}
            <div className="bg-[#F3F1EC] dark:bg-white/5 border border-[#DDD8CE] dark:border-white/10 rounded-xl px-4 py-3 text-[11px] text-[#6B6762] dark:text-white/50 leading-relaxed">
              <span className="font-semibold text-[#1C1B19] dark:text-white">Rate card (confirmed, 2026).</span>{" "}
              All USD, annual recurring unless marked one-time. Standing 15% bundle discount applied unconditionally.
              Multi-year term discounts (3yr +12%, 4yr +15%, 5+yr +18%) are additional and require full prepayment.
            </div>

            {/* ── CONTRACT TERM ── */}
            <div>
              <SectionLabel>Contract Term</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {TERMS.map(t => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setTerm(t.val)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-mono border transition-all duration-150 ${
                      term === t.val
                        ? "bg-[#1E3A5F] border-[#1E3A5F] text-white"
                        : "bg-white dark:bg-white/5 border-[#DDD8CE] dark:border-white/15 text-[#6B6762] dark:text-white/50 hover:border-[#1C1B19] dark:hover:border-white/30 hover:text-[#1C1B19] dark:hover:text-white"
                    }`}
                  >
                    {t.label}
                    {t.disc && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                        term === t.val
                          ? "bg-white/15 border-white/25 text-white/90"
                          : "bg-[#EEF5F1] border-[#B4D4C0] text-[#3F6E4E]"
                      }`}>
                        {t.disc}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── HUB INFRASTRUCTURE ── */}
            <div>
              <SectionLabel>Hub Infrastructure</SectionLabel>
              <div className="flex items-center justify-between py-3 border-b border-[#DDD8CE] dark:border-white/8">
                <div>
                  <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">Hub Container</p>
                  <p className="text-[11px] text-[#6B6762] dark:text-white/45 mt-0.5">Isolated branch infrastructure · $7,000 / hub / yr</p>
                </div>
                <Stepper value={hubs} min={1} max={20} onChange={setHubs} />
              </div>
            </div>

            {/* ── CLEARANCE SEATS ── */}
            <div>
              <SectionLabel>Clearance Seats</SectionLabel>
              <div>
                {SEATS.map(s => (
                  <div key={s.key} className="flex items-center justify-between py-3 border-b border-[#DDD8CE] dark:border-white/8 last:border-b-0">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">{s.label}</p>
                      <p className="text-[11px] text-[#6B6762] dark:text-white/45 mt-0.5">{s.sub} · {fmt(s.rate)} / seat / yr</p>
                    </div>
                    <Stepper value={seats[s.key]} min={0} max={500} onChange={v => adjSeat(s.key, v)} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── ADD-ONS ── */}
            <div>
              <SectionLabel>Add-Ons &amp; Expansion Packs</SectionLabel>
              <div>
                {ADDONS.map(a => (
                  <div key={a.key} className="flex items-center justify-between py-3 border-b border-[#DDD8CE] dark:border-white/8 last:border-b-0">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">{a.label}</p>
                      <p className="text-[11px] text-[#6B6762] dark:text-white/45 mt-0.5">{a.sub} · {fmt(a.rate)} / yr</p>
                    </div>
                    <Stepper value={addons[a.key]} min={0} max={50} onChange={v => adjAddon(a.key, v)} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── PROFESSIONAL SERVICES ── */}
            <div>
              <SectionLabel>Professional Services (one-time)</SectionLabel>
              <div>
                {SERVICES.map(s => (
                  <div key={s.key} className="flex items-center justify-between py-3 border-b border-[#DDD8CE] dark:border-white/8 last:border-b-0 gap-4">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">{s.label}</p>
                      <p className="text-[11px] text-[#6B6762] dark:text-white/45 mt-0.5">{s.range} · {s.note} · one-time</p>
                    </div>
                    <Toggle checked={svcs[s.key] === 1} onChange={v => adjSvc(s.key, v)} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── TAX ── */}
            <div>
              <SectionLabel>Tax Jurisdiction</SectionLabel>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-[11px] text-[#6B6762] dark:text-white/45 block mb-1.5">Region</label>
                  <select
                    value={taxIdx}
                    onChange={e => setTaxIdx(Number(e.target.value))}
                    className="w-full bg-white dark:bg-white/5 border border-[#DDD8CE] dark:border-white/15 rounded-lg px-3 py-2 text-[13px] text-[#1C1B19] dark:text-white outline-none focus:border-[#1E3A5F] transition-colors"
                  >
                    {TAX_OPTIONS.map((t, i) => (
                      <option key={i} value={i}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6762] dark:text-white/45 block mb-1.5">Custom %</label>
                  <input
                    type="number" min={0} max={50} step={0.5}
                    value={customTax}
                    onChange={e => setCustomTax(parseFloat(e.target.value) || 0)}
                    disabled={TAX_OPTIONS[taxIdx].rate !== -1}
                    className="w-full bg-white dark:bg-white/5 border border-[#DDD8CE] dark:border-white/15 rounded-lg px-3 py-2 text-[13px] text-[#1C1B19] dark:text-white outline-none focus:border-[#1E3A5F] transition-colors disabled:opacity-40"
                    placeholder="e.g. 9"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#6B6762] dark:text-white/40 leading-relaxed">
                Enterprise procurement typically applies reverse-charge or exemption. Confirm applicability with tax counsel before contracting.
              </p>
            </div>

          </div>{/* end config */}

          {/* ══════ RIGHT: LEDGER ══════ */}
          <div className="lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto p-8 sm:p-10 bg-[#FAFAF7] dark:bg-[#0A0A0E] flex flex-col gap-0">

            <p className="text-[9px] font-bold tracking-[0.13em] uppercase font-mono text-[#6B6762] dark:text-white/40 mb-1">
              Live Itemised Invoice
            </p>
            <p className="text-[18px] font-bold text-[#1C1B19] dark:text-white mb-1">Order Summary</p>
            <p className="text-[11px] text-[#6B6762] dark:text-white/40 font-mono mb-5">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            {/* Savings badge */}
            {hasConfig && totalSaving > 0 && (
              <div className="mb-5">
                <span className="inline-block text-[11px] font-mono font-medium px-3 py-1.5 rounded border bg-[#EEF5F1] border-[#B4D4C0] text-[#3F6E4E]">
                  Saving {fmt(totalSaving)} over {term} year{term > 1 ? "s" : ""} · {savingsPct}% off list
                </span>
              </div>
            )}

            {/* Empty state */}
            {!hasConfig && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#6B6762] dark:text-white/35">
                <p className="text-4xl mb-4 opacity-30">⊟</p>
                <p className="text-[13px] leading-relaxed">Configure seats on the left<br />to build your invoice.</p>
              </div>
            )}

            {/* Line items */}
            {hasConfig && (
              <div className="flex-1">

                {/* Seats */}
                {seatTotal > 0 && (
                  <>
                    <LedgerSectionHead>Clearance Seats — Annual</LedgerSectionHead>
                    {SEATS.filter(s => seats[s.key] > 0).map(s => (
                      <LedgerLine
                        key={s.key}
                        label={s.label}
                        sub={`${seats[s.key]} × ${fmt(s.rate)}`}
                        amount={fmtYr(s.rate * seats[s.key])}
                      />
                    ))}
                  </>
                )}

                {/* Infra */}
                <LedgerSectionHead>Infrastructure — Annual</LedgerSectionHead>
                <LedgerLine label="Hub Container" sub={`${hubs} × $7,000`} amount={fmtYr(infraTotal)} />

                {/* Add-ons */}
                {addonTotal > 0 && (
                  <>
                    <LedgerSectionHead>Add-Ons — Annual</LedgerSectionHead>
                    {ADDONS.filter(a => addons[a.key] > 0).map(a => (
                      <LedgerLine
                        key={a.key}
                        label={a.label}
                        sub={`${addons[a.key]} × ${fmt(a.rate)}`}
                        amount={fmtYr(a.rate * addons[a.key])}
                      />
                    ))}
                  </>
                )}

                {/* Services */}
                {svcTotal > 0 && (
                  <>
                    <LedgerSectionHead>Professional Services — One-time</LedgerSectionHead>
                    {SERVICES.filter(s => svcs[s.key] > 0).map(s => (
                      <LedgerLine key={s.key} label={s.label} sub={`est. ${s.range}`} amount={fmt(s.mid)} />
                    ))}
                  </>
                )}

                {/* Discount section */}
                <LedgerSectionHead>Discount Calculation</LedgerSectionHead>

                {/* Subtotal before discount */}
                <div className="flex justify-between items-baseline gap-2 py-[7px] border-t border-b border-[#1C1B19] dark:border-white/30 mt-1 mb-1">
                  <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">Annual List Price</p>
                  <span className="font-mono text-[13px] font-semibold text-[#1C1B19] dark:text-white">{fmtYr(annualList)}</span>
                </div>

                {/* Bundle discount — always shown */}
                <LedgerLine
                  label="Standing 15% Bundle Discount"
                  sub="Applied to all configurations, unconditionally"
                  amount={fmtYr(bundleDisc)}
                  deduct
                />

                {/* Term discount */}
                {termDisc > 0 && (
                  <LedgerLine
                    label={`${term}-Year Term Discount (${(termPct * 100).toFixed(0)}%)`}
                    sub="Additional on post-bundle rate · requires prepayment"
                    amount={fmtYr(termDisc)}
                    deduct
                  />
                )}

                {/* Net annual */}
                <div className="flex justify-between items-center gap-2 py-2 px-3 my-2 bg-[#F3F1EC] dark:bg-white/5 rounded-lg">
                  <p className="text-[13px] font-semibold text-[#1C1B19] dark:text-white">Discounted Annual Rate</p>
                  <span className="font-mono text-[13px] font-semibold text-[#1C1B19] dark:text-white">{fmtYr(netAnnual)}</span>
                </div>

                {/* Multi-year total */}
                {term > 1 && (
                  <>
                    <LedgerSectionHead>{term}-Year Contract Build-Up</LedgerSectionHead>
                    <LedgerLine
                      label={`${fmtYr(netAnnual)} × ${term} years`}
                      amount={fmt(netAnnual * term)}
                    />
                  </>
                )}

                {svcTotal > 0 && (
                  <LedgerLine label="Professional Services (one-time)" amount={fmt(svcTotal)} />
                )}

                {/* Tax */}
                {taxRate > 0 && (
                  <LedgerLine
                    label={`Tax / GST / VAT (${(taxRate * 100).toFixed(1)}%)`}
                    sub="Confirm applicability with counsel"
                    amount={fmt(taxAmt)}
                  />
                )}

                {/* Grand total */}
                <div className="flex justify-between items-baseline gap-2 py-4 border-t-2 border-b-2 border-[#1C1B19] dark:border-white/40 mt-2">
                  <p className="text-[15px] font-bold text-[#1C1B19] dark:text-white">
                    Total{term > 1 ? ` (${term}-yr contract)` : " / year"}
                  </p>
                  <span className="font-mono text-[22px] font-semibold tracking-tight" style={{ color: "#A6832E" }}>
                    {fmt(finalTotal)}
                  </span>
                </div>

                {/* Effective per-year for multi-year */}
                {term > 1 && (
                  <div className="flex justify-end mt-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded border bg-[#F7F2E8] border-[#D4BF8A] text-[#A6832E]">
                      {fmtYr(finalTotal / term)} effective
                    </span>
                  </div>
                )}

              </div>
            )}

            {/* CTA */}
            {hasConfig && (
              <div className="mt-6 space-y-2">
                <a
                  href={mailtoHref}
                  className="block w-full text-center py-3.5 px-4 bg-[#1E3A5F] hover:bg-[#1a3356] text-white text-[14px] font-semibold rounded-xl transition-colors"
                >
                  Request Formal Quote →
                </a>
                <p className="text-[10px] text-[#6B6762] dark:text-white/35 text-center leading-relaxed">
                  Reflects published list pricing and agreed discount policy.<br />
                  Final contract may include negotiated terms.
                </p>
              </div>
            )}

          </div>{/* end ledger */}

        </div>{/* end grid */}
      </div>
    </section>
  );
}
