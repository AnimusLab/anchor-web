import type { Metadata } from "next";
import { getContent, ContentItem } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Research Archive & Regulatory Submissions | AnimusLab Anchor',
  description: 'Academic preprints, regulatory consultation responses (FSB, RBI), and engineering notes for Anchor deterministic governance.',
  alternates: {
    canonical: 'https://animuslab.dev/anchor/research',
  },
};

interface ConsultationDoc {
  id: string;
  title: string;
  targetBody: string;
  date: string;
  type: string;
  summary: string;
  keyContributions: string[];
  pdfPath: string;
}

const REGULATORY_SUBMISSIONS: ConsultationDoc[] = [
  {
    id: "REG-FSB-2026",
    title: "Financial Stability Board (FSB) Consultation Response: Sound Practices for Responsible AI Adoption",
    targetBody: "Financial Stability Board (FSB) / Bank for International Settlements (BIS)",
    date: "June 29, 2026",
    type: "Formal Regulatory Submission",
    summary: "AnimusLab's official submission to the FSB regarding deterministic runtime governance, zero-copy telemetry isolation, and tamper-evident audit chains for artificial intelligence operating inside systemic financial market infrastructure.",
    keyContributions: [
      "Mandatory Deterministic Execution Gates: Proposing hard AST-level containment over probabilistic soft prompts.",
      "Zero-Knowledge Regulatory Veils: Proving Article VII compliance by relaying encrypted headers without leaking private bank IP.",
      "Sub-Millisecond Overhead Limits: Demonstrating <0.8ms inspection latency for real-time payment settlement networks."
    ],
    pdfPath: "/consultations/FSB_AnimusLab_Response.pdf"
  },
  {
    id: "REG-RBI-2026",
    title: "Reserve Bank of India (RBI) FREE-AI Framework Comments & Model Risk Technical Feedback",
    targetBody: "Reserve Bank of India (RBI) / Department of Information Technology",
    date: "June 30, 2026",
    type: "Central Bank Technical Briefing",
    summary: "Formal technical comments on the RBI FREE-AI Report (Recommendations 7 & 14), establishing per-decision Decision Audit Chains (DAC) reportable to the CIMS portal for AI credit scoring and fraud detection.",
    keyContributions: [
      "CIMS-Compliant Schema: Native mapping of cims_payload() for automated central bank supervisory reporting.",
      "Adverse Action Explainability: Deterministic ReasonCode extraction satisfying CFPB & RBI fairness standards.",
      "Hardware-Anchored Keypair Proofs: Ed25519 node keypair verification on sovereign on-premise hubs."
    ],
    pdfPath: "/consultations/RBI_AnimusLab_Comments.pdf"
  }
];

const ADDITIONAL_PREPRINTS = [
  {
    id: "SSR-P002",
    title: "The $3 Billion Warning: Systemic Failure Modes in Autonomous Financial Agents",
    author: "Tanishq Dasari",
    date: "July 2026",
    publisher: "SSRN Electronic Journal",
    summary: "A quantitative forensic paper modeling systemic failure modes, automated authority overreach, and cascading liquidity drift in high-frequency autonomous trading networks.",
    pdfPath: "/papers/The_3_Billion_Warning_v2.pdf",
    ssrnUrl: "https://zenodo.org/records/19734724"
  },
  {
    id: "SSR-P001",
    title: "Anchor: A Federated Governance Engine for Secure and Compliant Agentic AI Systems",
    author: "Tanishq Dasari",
    date: "June 2026",
    publisher: "SSRN & Zenodo Repository (10.5281/zenodo.19734724)",
    summary: "Foundational academic paper detailing the Diamond Cage WASM sandbox, PyO3 AST scanner, and 18-Article formal invariant compliance framework.",
    pdfPath: "/papers/AnimusLab_Anchor_SSRN_Paper.pdf",
    ssrnUrl: "https://zenodo.org/records/19734724"
  }
];

export default function AnchorResearch() {
  const notes = getContent("notes");

  return (
    <div className="space-y-16 animate-fadeIn">
      {/* SECTION HEADER */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-indigo-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          ANCHOR // RESEARCH &amp; REGULATORY ARCHIVE
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Publications, Regulatory Submissions &amp; Technical Notes
        </h1>
        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-3xl">
          Curated collection of academic preprints, central bank consultation submissions (FSB, RBI), formal statutory mappings, and low-level engineering notes governing the Anchor runtime engine.
        </p>
      </div>

      {/* SECTION 1: REGULATORY CONSULTATIONS & CENTRAL BANK SUBMISSIONS */}
      <section className="space-y-8">
        <div className="border-b border-neutral-900 pb-4">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold block mb-1">
            // SECTION 01
          </span>
          <h2 className="text-xl font-bold text-white">
            Regulatory Consultations &amp; Central Bank Submissions
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Formal policy filings submitted to global financial stability bodies and monetary authorities.
          </p>
        </div>

        <div className="space-y-6">
          {REGULATORY_SUBMISSIONS.map((sub) => (
            <article
              key={sub.id}
              className="border border-neutral-900 p-8 bg-[#070707]/30 hover:border-emerald-500/40 transition-all rounded-sm space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-sm">
                  {sub.type}
                </span>
                <span className="text-neutral-500">{sub.date} | ID: {sub.id}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-500 block uppercase">Target Body: {sub.targetBody}</span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {sub.title}
                </h3>
              </div>

              <p className="text-sm text-neutral-300 font-light leading-relaxed font-sans">
                {sub.summary}
              </p>

              <div className="border-t border-neutral-900/80 pt-4 space-y-2 font-mono text-xs">
                <span className="text-indigo-400 font-bold uppercase block mb-2">// Key Contributions &amp; Statutory Demands:</span>
                {sub.keyContributions.map((kc, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-neutral-400">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{kc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4 font-mono text-xs border-t border-neutral-900/60">
                <a
                  href={sub.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black hover:bg-neutral-200 px-5 py-2.5 font-bold transition-all rounded-sm shadow-md inline-flex items-center gap-2"
                >
                  <span>📄 Download Official Response PDF</span>
                </a>
                <span className="text-neutral-600">|</span>
                <span className="text-neutral-500">Verified Signature // Ed25519 Sealed</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: ACADEMIC PREPRINTS & SSRN PAPERS */}
      <section className="space-y-8 pt-8 border-t border-neutral-900">
        <div className="border-b border-neutral-900 pb-4">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold block mb-1">
            // SECTION 02
          </span>
          <h2 className="text-xl font-bold text-white">
            Academic Preprints &amp; SSRN Publications
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Peer-reviewed papers and formal SSRN preprints detailing Anchor&apos;s mathematical verification framework.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ADDITIONAL_PREPRINTS.map((paper) => (
            <article
              key={paper.id}
              className="border border-neutral-900 p-6 bg-[#070707]/30 hover:border-amber-500/40 transition-all rounded-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold uppercase">{paper.id}</span>
                  <span className="text-neutral-500">{paper.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {paper.title}
                </h3>
                <p className="text-xs font-mono text-neutral-500">{paper.author} // {paper.publisher}</p>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  {paper.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-900 flex flex-wrap items-center gap-3 font-mono text-xs">
                <a
                  href={paper.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-amber-500/40 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 px-4 py-2 font-bold transition-colors rounded-sm"
                >
                  📄 Download PDF
                </a>
                {paper.id === "SSR-P001" && (
                  <Link
                    href="/anchor/whitepaper"
                    className="text-neutral-300 hover:text-white underline font-bold"
                  >
                    Read Inline →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: TECHNICAL & ENGINEERING NOTES */}
      <section className="space-y-8 pt-8 border-t border-neutral-900">
        <div className="border-b border-neutral-900 pb-4">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono font-bold block mb-1">
            // SECTION 03
          </span>
          <h2 className="text-xl font-bold text-white">
            Engineering Logs &amp; Implementation Notes
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Low-level technical notes covering Tree-sitter AST scanning speeds, PyO3 bindings, and persistence models.
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="text-neutral-500 font-mono text-xs">No technical notes found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {notes.map((note: ContentItem) => (
              <article 
                key={note.slug}
                className="border border-neutral-900 p-6 hover:border-neutral-800 transition-colors bg-[#070707]/10 flex flex-col justify-between space-y-4 rounded-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">{note.category || "TECHNICAL NOTE"}</span>
                    <span className="text-neutral-500">{note.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {note.title}
                  </h3>
                  {note.excerpt && (
                    <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                      {note.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-900/60">
                  <Link 
                    href={`/research`} 
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold transition-colors block"
                  >
                    Read Technical Note →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
