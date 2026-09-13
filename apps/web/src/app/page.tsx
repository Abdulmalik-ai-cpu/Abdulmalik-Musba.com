import Link from 'next/link';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { formatPeriod } from '@/lib/format';
import { Card } from '@portfolio/ui';
import type { Profile, Project, ArticleSummary, Publication } from '@portfolio/types';

const DEFAULT_PROFILE = {
  fullName: 'Abdulmalik Musba',
  professionalTitle: 'Researcher & Builder',
  shortIntro:
    'I build things that outlive hype — rigorous research, practical software, and writing that survives the scrum of the feed.',
};

async function getHomeData(): Promise<{
  profile: Partial<Profile>;
  projects: Project[];
  articles: ArticleSummary[];
  publications: Publication[];
}> {
  const empty: {
    profile: Partial<Profile>;
    projects: Project[];
    articles: ArticleSummary[];
    publications: Publication[];
  } = {
    profile: DEFAULT_PROFILE,
    projects: [],
    articles: [],
    publications: [],
  };

  if (typeof window !== 'undefined') return empty;

  try {
    const [profile, projects, articles, publications] = await Promise.all([
      api.getPublic.profile().catch(() => null),
      api.getPublic.projects().catch(() => []),
      api.getPublic.articles().catch(() => []),
      api.getPublic.publications().catch(() => []),
    ]);

    return {
      profile: profile ?? DEFAULT_PROFILE,
      projects,
      articles,
      publications,
    };
  } catch {
    return empty;
  }
}

export default async function HomePage() {
  const { profile, projects, articles, publications } = await getHomeData();
  const config = siteConfig();

  const featuredProjects = projects.slice(0, 3);
  const featuredArticles = articles.filter((a) => a.featured).slice(0, 3);
  const featuredPublications = publications.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-24 pt-20 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:pt-32">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">Hello — I am</p>
          <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            {profile.fullName ?? ''}
          </h1>
          <p className="font-display mt-4 text-2xl text-ink/60 md:text-3xl">{profile.professionalTitle ?? ''}</p>
          <p className="prose-portfolio mt-8 max-w-xl">{profile.shortIntro ?? ''}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="rounded-full px-6 py-3 text-sm font-medium transition-colors"
              style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--paper))' }}
            >
              See my work
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-ink/30 px-6 py-3 text-sm font-medium transition-colors hover:border-ink"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="section-title mb-0">Projects</h2>
          <Link href="/projects" className="link-accent text-sm">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.id} className="flex h-full flex-col p-6">
              <h3 className="font-display text-lg font-semibold">{project.title}</h3>
              <p className="font-body mt-3 line-clamp-4 text-sm text-ink/70">{project.summary}</p>
              <Link href={`/projects/${project.id}`} className="link-accent mt-auto pt-4 text-sm">
                Read more →
              </Link>
            </Card>
          ))}
          {featuredProjects.length === 0 && (
            <p className="col-span-full text-ink/50">
              Projects will appear here once the site is connected to its CMS.
            </p>
          )}
        </div>
      </section>

      {/* Publications */}
      <section className="border-y border-ink/10 bg-ink/[0.02]">
        <div className="section">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="section-title mb-0">Selected Publications</h2>
            <Link href="/publications" className="link-accent text-sm">
              View all →
            </Link>
          </div>
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            {featuredPublications.map((pub) => (
              <div key={pub.id}>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{pub.year}</p>
                <h3 className="font-display mt-2 text-lg font-medium">{pub.title}</h3>
                {pub.venue ? <p className="mt-1 text-sm italic text-ink/60">{pub.venue}</p> : null}
              </div>
            ))}
            {featuredPublications.length === 0 && (
              <p className="text-ink/50">Publications will appear here once the site is connected to its CMS.</p>
            )}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="section">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="section-title mb-0">Writing</h2>
          <Link href="/articles" className="link-accent text-sm">
            All articles →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 3)).map((article) => (
            <article key={article.id}>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {article.publishedAt ? formatPeriod(article.publishedAt, null, false) : 'Draft'}
              </p>
              <h3 className="font-display mt-3 text-xl font-medium leading-snug">
                <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-accent">
                  {article.title}
                </Link>
              </h3>
              <p className="mt-3 line-clamp-3 text-sm text-ink/70">{article.excerpt}</p>
            </article>
          ))}
          {articles.length === 0 && (
            <p className="text-ink/50">Articles will appear here once the site is connected to its CMS.</p>
          )}
        </div>
      </section>

      {/* Availability CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 md:px-10">
        <div className="rounded-3xl border border-ink/10 bg-ink px-10 py-16 text-center" style={{ color: 'rgb(var(--paper))' }}>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Curious about the full story?
          </h2>
          <p className="mt-4 text-ink/70" style={{ color: 'rgba(244,241,234,0.7)' }}>
            Read about my research, career, and the ideas that drive the work at {config.name}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="rounded-full px-6 py-3 text-sm font-medium"
              style={{ background: 'rgb(var(--paper))', color: 'rgb(var(--ink))' }}
            >
              About me
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-paper/40 px-6 py-3 text-sm font-medium transition-colors hover:border-paper"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}