import type { Metadata } from 'next';
import AnchorPageClient from './AnchorPageClient';

export const metadata: Metadata = {
  title: 'Anchor Governance Infrastructure by AnimusLab',
  description:
    'Anchor is a federated runtime governance engine that mathematically enforces intent and provides cryptographic auditability for agentic AI systems, without ever exposing raw data.',
  alternates: {
    canonical: 'https://animuslab.dev/anchor',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Anchor",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "url": "https://animuslab.dev/anchor",
            "description": "Deterministic runtime capability resolution, AST validation, and isolation boundaries for autonomous systems.",
            "creator": {
              "@type": "ResearchOrganization",
              "name": "AnimusLab",
              "url": "https://www.animuslab.dev"
            }
          })
        }}
      />
      <AnchorPageClient />
    </>
  );
}
