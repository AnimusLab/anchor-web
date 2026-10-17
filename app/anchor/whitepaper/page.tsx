import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "../../components/MermaidDiagram";
import {
  ArchitectureDiagram,
  SovereignRelayDiagram,
  DiamondCageDiagram,
  DecisionAuditChainDiagram,
} from "../../components/DocDiagrams";

export const metadata: Metadata = {
  title: 'Whitepaper | AnimusLab',
  alternates: {
    canonical: 'https://animuslab.dev/anchor/whitepaper',
  },
};

export default function AnchorWhitepaper() {
  const papers = getContent("papers");
  const paper = papers.find(
    (p) => p.slug === "anchor-deterministic-runtime-governance"
  );

  if (!paper) {
    return (
      <div className="py-12 text-center text-neutral-500 font-mono">
        Error: Anchor whitepaper source not found.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* HEADER METADATA */}
      <header className="border-b border-neutral-900 pb-12 space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-indigo-400 uppercase tracking-widest">// Technical_Whitepaper</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-500">ID: {paper.id}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-emerald-400 font-bold">Kernel v6.0.1</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
          {paper.title}
        </h2>

        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 text-sm">
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// Author</p>
            <p className="text-neutral-300 font-medium mt-1">{paper.author}</p>
          </div>
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// Date</p>
            <p className="text-neutral-300 font-medium mt-1">{paper.date}</p>
          </div>
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// Reading_Time</p>
            <p className="text-neutral-300 font-medium mt-1">{paper.readingTime} minutes</p>
          </div>
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// SSRN_Preprint</p>
            <a 
              href="https://zenodo.org/records/19734724" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium mt-1 block hover:underline"
            >
              SSRN Academic Repository →
            </a>
          </div>
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// Zenodo_DOI</p>
            <a 
              href="https://doi.org/10.5281/zenodo.19734724" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium mt-1 block hover:underline"
            >
              10.5281/zenodo.19734724 →
            </a>
          </div>
          <div>
            <p className="text-neutral-500 font-mono text-xs uppercase">// Download_Paper</p>
            <a 
              href="/papers/AnimusLab_Anchor_SSRN_Paper.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-medium mt-1 block hover:underline font-bold"
            >
              📄 Download SSRN PDF →
            </a>
          </div>
        </div>

        {paper.excerpt && (
          <div className="mt-8 p-6 bg-[#080808]/40 border border-neutral-900 text-neutral-400 text-sm leading-relaxed max-w-[960px]">
            <span className="text-xs text-neutral-500 font-mono block mb-2 uppercase">// Executive_Summary</span>
            {paper.excerpt}
          </div>
        )}
      </header>

      {/* PAPER READER BODY */}
      <section className="grid grid-cols-1 gap-12">
        <article className="institution-content font-light max-w-[960px] w-full min-w-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              p({ node, children, ...props }) {
                const firstChild = Array.isArray(children) ? children[0] : children;
                const isMath = typeof firstChild === 'string' && firstChild.trim().startsWith('$$');
                if (isMath) {
                  return (
                    <div className="w-full overflow-x-auto no-scrollbar my-8 py-4 px-6 text-center bg-[#070707]/60 border border-neutral-900/60 rounded font-mono text-xs md:text-sm text-indigo-300/90 whitespace-nowrap">
                      {children}
                    </div>
                  );
                }
                return <p {...props}>{children}</p>;
              },
              code({ node, className, children, ...props }) {
                const matchArchitecture = /language-diagram-architecture/.exec(className || '');
                const matchRelay = /language-diagram-relay/.exec(className || '');
                const matchSandbox = /language-diagram-sandbox/.exec(className || '');
                const matchChain = /language-diagram-chain/.exec(className || '');
                const matchMermaid = /language-mermaid/.exec(className || '');

                if (matchArchitecture) return <ArchitectureDiagram />;
                if (matchRelay) return <SovereignRelayDiagram />;
                if (matchSandbox) return <DiamondCageDiagram />;
                if (matchChain) return <DecisionAuditChainDiagram />;

                if (matchMermaid) {
                  return (
                    <div className="border border-neutral-900 bg-[#080808]/20 rounded-lg p-6 my-8">
                      <MermaidDiagram
                        chart={String(children).replace(/\n$/, '')}
                        label="MERMAID_CHART"
                      />
                    </div>
                  );
                }

                const isBlock = className || String(children).includes('\n');
                if (isBlock) {
                  return (
                    <pre className="no-scrollbar overflow-x-auto my-8 p-6 bg-[#080808]/40 border border-neutral-900 rounded font-mono text-xs md:text-sm">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {paper.content}
          </ReactMarkdown>
        </article>

        {/* CITATION BOX */}
        <section className="pt-12 border-t border-neutral-900 max-w-[960px]">
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4 font-mono">// Citation_Metadata</p>
          <div className="p-6 bg-[#070707]/10 border border-neutral-900 text-xs font-mono text-neutral-400 leading-relaxed">
            {paper.author}. ({paper.date}).<br />
            <span className="italic text-white">"{paper.title}"</span>.<br />
            AnimusLab Research. DOI: {paper.doi}
          </div>
        </section>
      </section>
    </div>
  );
}
