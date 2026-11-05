import Link from 'next/link';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import type { NavItem } from '@portfolio/types';

/** Used only when the API has no navigation rows yet (§143.44). */
const FALLBACK_NAV: NavItem[] = [
  { id: 'about', label: 'About', href: '/about', order: 1, visible: true, isExternal: false },
  { id: 'education', label: 'Education', href: '/education', order: 2, visible: true, isExternal: false },
  { id: 'experience', label: 'Experience', href: '/experience', order: 3, visible: true, isExternal: false },
  { id: 'research', label: 'Research', href: '/research', order: 4, visible: true, isExternal: false },
  { id: 'projects', label: 'Projects', href: '/projects', order: 5, visible: true, isExternal: false },
  { id: 'publications', label: 'Publications', href: '/publications', order: 6, visible: true, isExternal: false },
  { id: 'achievements', label: 'Achievements', href: '/achievements', order: 7, visible: true, isExternal: false },
  { id: 'articles', label: 'Articles', href: '/articles', order: 8, visible: true, isExternal: false },
  { id: 'contact', label: 'Contact', href: '/contact', order: 9, visible: true, isExternal: false },
];

/** Navigation is content, not markup: it comes from the API (§13, §140.14). */
async function getNavigation(): Promise<NavItem[]> {
  try {
    const items = await api.getPublic.navigation();
    const visible = items.filter((item) => item.visible).sort((a, b) => a.order - b.order);
    return visible.length > 0 ? visible : FALLBACK_NAV;
  } catch {
    return FALLBACK_NAV;
  }
}

export async function SiteHeader() {
  const config = siteConfig();
  const links = await getNavigation();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {config.name}
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) =>
            link.isExternal ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/70 transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                href={link.href}
                className="text-sm text-ink/70 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ),
          )}
          <Link
            href="/search"
            aria-label="Search"
            className="text-sm text-ink/70 transition-colors hover:text-ink"
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}