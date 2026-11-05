import type { Metadata } from 'next';
import { Fraunces, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const config = siteConfig();

/**
 * Site-wide metadata is owner-controlled content (§14, §58). When the API has
 * a SeoConfig row it wins; otherwise the environment defaults apply.
 */
export async function generateMetadata(): Promise<Metadata> {
  let seo: { siteTitle?: string; description?: string; canonicalBaseUrl?: string | null; twitterHandle?: string | null; ogImageUrl?: string | null } | null = null;
  try {
    seo = await api.getPublic.seo();
  } catch {
    seo = null;
  }

  const baseUrl = seo?.canonicalBaseUrl ?? config.url;
  const title = seo?.siteTitle ?? config.title;
  const description = seo?.description ?? config.description;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${config.name}`,
    },
    description,
    alternates: { canonical: baseUrl },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName: config.name,
      title,
      description,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: seo?.twitterHandle ?? config.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.name,
    url: config.url,
    description: config.description,
    jobTitle: undefined,
  };
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}