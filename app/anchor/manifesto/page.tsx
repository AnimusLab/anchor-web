import type { Metadata } from 'next';
import ManifestoPageClient from './ManifestoPageClient';

export const metadata: Metadata = {
  title: 'Manifesto | AnimusLab',
  alternates: {
    canonical: 'https://animuslab.dev/anchor/manifesto',
  },
};

export default function Page() {
  return <ManifestoPageClient />;
}
