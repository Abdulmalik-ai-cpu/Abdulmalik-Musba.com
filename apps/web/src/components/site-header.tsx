import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Education', href: '/education' },
  { label: 'Experience', href: '/experience' },
  { label: 'Research', href: '/research' },
  { label: 'Projects', href: '/projects' },
  { label: 'Publications', href: '/publications' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
];

export function SiteHeader() {
  const config = siteConfig();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {config.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}