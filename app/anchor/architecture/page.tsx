import type { Metadata } from 'next';
import ArchitecturePageClient from './ArchitecturePageClient';

export const metadata: Metadata = {
  title: 'Architecture | AnimusLab',
  alternates: {
    canonical: 'https://animuslab.dev/anchor/architecture',
  },
};

export default function Page() {
  return <ArchitecturePageClient />;
}
