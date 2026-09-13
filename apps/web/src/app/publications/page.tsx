import type { Metadata } from 'next';
import { api } from '@/lib/api';
import type { Publication } from '@portfolio/types';

export const metadata: Metadata = { title: 'Publications' };

const TYPE_LABELS: Record<string, string> = {
  JOURNAL: 'Journal',
  CONFERENCE: 'Conference',
  THESIS: 'Thesis',
  REPORT: 'Report',
  BOOK: 'Book',
  CHAPTER: 'Chapter',
  OTHER: 'Other',
};

async function getPublications(): Promise<Publication[]> {
  try {
    return await api.getPublic.publications();
  } catch {
    return [];
  }
}

export default async function PublicationsPage() {
  const items = await getPublications();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Publications</h1>
      <div className="mt-12 space-y-8">
        {items.length === 0 && <p className="text-ink/50">Publications will appear here soon.</p>}
        {items.map((pub) => (
          <article key={pub.id} id={pub.id} className="border-b border-ink/10 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">{pub.year ?? '-'}</span>
              <span className="rounded-full border border-ink/15 px-3 py-0.5 font-mono text-xs uppercase tracking-widest">
                {TYPE_LABELS[pub.type] ?? pub.type}
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-snug">{pub.title}</h2>
            {pub.authors.length > 0 && <p className="mt-2 text-sm italic text-ink/60">{pub.authors.join(', ')}</p>}
            {pub.venue && <p className="mt-1 text-sm text-ink/60">{pub.venue}</p>}
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              {pub.doi && (
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link-accent"
                >
                  DOI: {pub.doi}
                </a>
              )}
              {pub.url && (
                <a href={pub.url} target="_blank" rel="noreferrer" className="link-accent">
                  Read online
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}