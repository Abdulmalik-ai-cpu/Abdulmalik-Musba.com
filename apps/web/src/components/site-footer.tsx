import Link from 'next/link';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import type { SocialLink } from '@portfolio/types';

/** Social links are owner-supplied content, never hardcoded (§80, §81). */
async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    return await api.getPublic.socialLinks();
  } catch {
    return [];
  }
}

export async function SiteFooter() {
  const config = siteConfig();
  const year = new Date().getFullYear();
  const socialLinks = await getSocialLinks();

  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center md:flex-row md:px-10 md:text-left">
        <p className="text-sm text-ink/60">
          © {year} {config.name}. Built for a lifetime of work.
        </p>
        <nav className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-ink/60 hover:text-ink">
            About
          </Link>
          <Link href="/contact" className="text-sm text-ink/60 hover:text-ink">
            Contact
          </Link>
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink/60 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}