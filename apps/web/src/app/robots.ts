import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

/** The admin portal is a separate origin; only the public site is crawled. */
export default function robots(): MetadataRoute.Robots {
  const config = siteConfig();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/search', '/api/'],
      },
    ],
    sitemap: `${config.url}/sitemap.xml`,
    host: config.url,
  };
}
