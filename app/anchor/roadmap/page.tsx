import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Roadmap | AnimusLab',
  alternates: {
    canonical: 'https://animuslab.dev/anchor/roadmap',
  },
};

interface Milestone {
  year: string;
  program: string;
  subtitle: string;
  status: "active" | "planned" | "long-term";
  description: string;
}

const ROADMAP_DATA: Milestone[] = [
  {
    year: "2026",
    program: "Anchor",
    subtitle: "Deterministic Runtime Governance",
    status: "active",
    description:
      "Developing the layer-1 security runtime for autonomous systems. Enforcing compile-time Abstract Syntax Tree (AST) scanning, virtualized WebAssembly containment, and tamper-evident local therapy logs.",
  },
  {
    year: "2027",
    program: "ANIMUS",
    subtitle: "Deterministic Cognitive Reasoning",
    status: "planned",
    description:
      "Investigating symbolic reasoning architectures and neural-symbolic cognitive boundaries. Moving past probabilistic text predictions to build agents whose cognitive steps are mathematically verifiable.",
  },
  {
    year: "2028",
    program: "Shadow Watch",
    subtitle: "Observability & Session Trust",
    status: "planned",
    description:
      "Building decentralised observability infrastructure for forensic audit trails. Researching session trust, behavior drift detection, and automated recovery loops inside highly distributed system clusters.",
  },
  {
    year: "2030+",
    program: "Governable Intelligence",
    subtitle: "Mathematical Safety Boundaries",
    status: "long-term",
    description:
      "Integrating runtime boundaries, deterministic reasoning paths, and immutable audit logs into a unified framework for legally-compliant machine intelligence operating inside critical infrastructure.",
  }
];

export default function AnchorRoadmap() {
  return (
    <div className="space-y-16 animate-fadeIn">
      {/* SECTION HEADER */}
      <div className="space-y-4">
        <span className="text-xs text-neutral-500 font-mono uppercase tracking-widest">// Program_Roadmap</span>
        <h3 className="text-2xl text-white font-semibold tracking-tight border-b border-neutral-900 pb-2">
          Anchor Program & Institutional Timeline
        </h3>
        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-3xl">
          Anchor represents Phase 1 of AnimusLab's security roadmap. Below is the structural schedule for integrating deterministic runtime boundaries into autonomous network agents, leading toward fully governable cognitive architectures.
        </p>
      </div>

      {/* ROADMAP TIMELINE GRID */}
      <div className="relative border-l border-neutral-900 ml-4 pl-8 space-y-12">
        {ROADMAP_DATA.map((milestone) => (
          <div key={milestone.year} className="relative group">
            {/* Dot symbol on timeline */}
            <div className="absolute -left-[37px] top-1.5 h-4 w-4 bg-[#050505] border border-neutral-800 rounded-full flex items-center justify-center group-hover:border-indigo-500 transition-colors">
              {milestone.status === "active" && (
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" />
              )}
            </div>

            {/* Timeline Item Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 font-mono">
                <span className="text-xl font-bold text-white">{milestone.year}</span>
                <span className="text-neutral-600">//</span>
                <span className="text-xs uppercase tracking-widest text-indigo-400">
                  {milestone.program}
                </span>
                <span
                  className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 border rounded-sm font-bold ${
                    milestone.status === "active"
                      ? "border-indigo-900 bg-indigo-950/20 text-indigo-400"
                      : milestone.status === "planned"
                      ? "border-neutral-800 bg-neutral-900/10 text-neutral-400"
                      : "border-neutral-900 bg-neutral-950/50 text-neutral-600"
                  }`}
                >
                  {milestone.status}
                </span>
              </div>

              <h4 className="text-lg font-medium text-white tracking-tight">
                {milestone.subtitle}
              </h4>
              <p className="text-sm text-neutral-400 leading-relaxed font-light max-w-2xl">
                {milestone.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CALL TO ACTION */}
      <div className="pt-8 border-t border-neutral-900 text-left">
        <Link 
          href="/research-roadmap" 
          className="inline-block text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          [ VIEW FULL INSTITUTIONAL ROADMAP & OBJECTIVES ]
        </Link>
      </div>
    </div>
  );
}
