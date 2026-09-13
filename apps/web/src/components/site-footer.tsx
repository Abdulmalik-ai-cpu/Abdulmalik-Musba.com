import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function SiteFooter() {
  const config = siteConfig();
  const year = new Date().getFullYear();
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
          <a
            href="https://github.com/Abdulmalik-ai-cpu"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink/60 hover:text-ink"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}