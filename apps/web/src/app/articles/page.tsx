import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ArticleSummary } from '@portfolio/types';

export const metadata: Metadata = { title: 'Articles' };

async function getArticles(): Promise<ArticleSummary[]> {
  try {
    return await api.getPublic.articles();
  } catch {
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Articles</h1>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {articles.length === 0 && <p className="text-ink/50">Articles will appear here soon.</p>}
        {articles.map((article) => (
          <article key={article.id} className="group">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Draft'}
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-snug transition-colors group-hover:text-accent">
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h2>
            {article.excerpt && <p className="mt-3 line-clamp-3 text-sm text-ink/70">{article.excerpt}</p>}
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-ink/15 px-3 py-1 font-mono text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}