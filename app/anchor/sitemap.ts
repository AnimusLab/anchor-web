import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://animuslab.dev/anchor';

  // Static routes for anchor subdomain
  const staticRoutes = [
    '',
    '/manifesto',
    '/whitepaper',
    '/architecture',
    '/roadmap',
    '/research',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
