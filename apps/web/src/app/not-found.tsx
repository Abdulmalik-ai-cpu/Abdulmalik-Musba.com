import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Not Found' };

export default function NotFound() {
  return (
    <section className="section text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="font-display mt-4 text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-ink/70">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="link-accent mt-8 inline-block text-sm">
        Back to home
      </Link>
    </section>
  );
}