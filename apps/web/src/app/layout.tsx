import type { Metadata } from 'next';
import { Fraunces, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
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

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: {
    default: config.title,
    template: `%s | ${config.name}`,
  },
  description: config.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.url,
    siteName: config.name,
    title: config.title,
    description: config.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: config.title,
    description: config.description,
    creator: config.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}