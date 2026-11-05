import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { renderMarkdown } from '@/lib/markdown';
import type { Article } from '@portfolio/types';

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await api.getPublic.article(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };
  const config = siteConfig();
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt ?? undefined,
      url: `${config.url}/articles/${article.slug}`,
      publishedTime: article.publishedAt ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const config = siteConfig();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    author: { '@type': 'Person', name: config.name },
    mainEntityOfPage: `${config.url}/articles/${article.slug}`,
  };

  return (
    <article className="section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'Draft'}
      </p>
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        {article.title}
      </h1>

      {article.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-ink/15 px-3 py-1 font-mono text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="prose-portfolio mt-10 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
      />

      <div className="mt-14 border-t border-ink/10 pt-8">
        <Link href="/articles" className="link-accent text-sm">
          ← All articles
        </Link>
      </div>
    </article>
  );
}