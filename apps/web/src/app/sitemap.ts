import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';

const STATIC_ROUTES = [
  '',
  '/about',
  '/education',
  '/experience',
  '/research',
  '/projects',
  '/publications',
  '/skills',
  '/achievements',
  '/articles',
  '/contact',
];

/**
 * Sitemap is generated from published content only (§58, §140.30).
 * A failed content fetch degrades to the static routes rather than failing
 * the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = siteConfig();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${config.url}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));

  try {
    const [articles, projects] = await Promise.all([
      api.getPublic.articles().catch(() => []),
      api.getPublic.projects().catch(() => []),
    ]);

    for (const article of articles) {
      entries.push({
        url: `${config.url}/articles/${article.slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
        changeFrequency: 'yearly',
        priority: 0.6,
      });
    }

    for (const project of projects) {
      entries.push({
        url: `${config.url}/projects/${project.id}`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.6,
      });
    }
  } catch {
    // Keep the static sitemap.
  }

  return entries;
}
