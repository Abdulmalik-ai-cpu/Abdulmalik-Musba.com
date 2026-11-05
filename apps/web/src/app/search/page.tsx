import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SearchResults } from '@portfolio/types';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  article: 'Article',
  publication: 'Publication',
  research: 'Research',
  education: 'Education',
  experience: 'Experience',
  talk: 'Talk',
};

async function search(q: string): Promise<SearchResults> {
  if (!q.trim()) return { results: [], total: 0 };
  try {
    return await api.getPublic.search(q);
  } catch {
    return { results: [], total: 0 };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const { results, total } = await search(query);

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Search</h1>

      <form action="/search" method="get" className="mt-8 flex max-w-xl gap-3">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search projects, articles, publications…"
          aria-label="Search query"
          className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          className="rounded-full px-6 py-3 text-sm font-medium"
          style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--paper))' }}
        >
          Search
        </button>
      </form>

      {query ? (
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink/50">
          {total} result{total === 1 ? '' : 's'} for “{query}”
        </p>
      ) : (
        <p className="mt-6 text-ink/50">Enter a term above to search the published content.</p>
      )}

      <div className="mt-8 space-y-6">
        {results.map((result) => (
          <article key={`${result.type}-${result.id}`} className="border-b border-ink/10 pb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              {TYPE_LABEL[result.type] ?? result.type}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              <Link href={result.url} className="transition-colors hover:text-accent">
                {result.title}
              </Link>
            </h2>
            {result.excerpt ? (
              <p className="mt-2 line-clamp-2 text-sm text-ink/70">{result.excerpt}</p>
            ) : null}
          </article>
        ))}
        {query && results.length === 0 ? (
          <p className="text-ink/50">No published content matched that search.</p>
        ) : null}
      </div>
    </section>
  );
}
