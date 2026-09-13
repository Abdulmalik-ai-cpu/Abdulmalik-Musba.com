import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPeriod } from '@/lib/format';
import type { Research } from '@portfolio/types';

export const metadata: Metadata = { title: 'Research' };

async function getResearch(): Promise<Research[]> {
  try {
    return await api.getPublic.research();
  } catch {
    return [];
  }
}

export default async function ResearchPage() {
  const items = await getResearch();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Research</h1>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {items.length === 0 && <p className="text-ink/50">Research will appear here soon.</p>}
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-ink/10 p-8">
            {item.category && (
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{item.category}</p>
            )}
            <h2 className="font-display mt-3 text-2xl font-semibold leading-snug">{item.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm text-ink/70">{item.summary}</p>
            <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">
              {formatPeriod(item.startDate, item.endDate, item.current)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}