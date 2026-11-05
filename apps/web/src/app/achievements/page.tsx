import type { Metadata } from 'next';
import { api } from '@/lib/api';
import type { Achievement, Award, Certification } from '@portfolio/types';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Awards, certifications, honours, and milestones.',
};

interface GroupedAchievements {
  achievements: Achievement[];
  awards: Award[];
  certifications: Certification[];
}

async function getData(): Promise<GroupedAchievements> {
  try {
    const [achievements, awards, certifications] = await Promise.all([
      api.getPublic.achievements().catch(() => []),
      api.getPublic.awards().catch(() => []),
      api.getPublic.certifications().catch(() => []),
    ]);
    return { achievements, awards, certifications };
  } catch {
    return { achievements: [], awards: [], certifications: [] };
  }
}

function isEmpty({ achievements, awards, certifications }: GroupedAchievements): boolean {
  return achievements.length === 0 && awards.length === 0 && certifications.length === 0;
}

function year(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
}

export default async function AchievementsPage() {
  const data = await getData();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Achievements</h1>

      {isEmpty(data) ? (
        <p className="mt-8 text-ink/50">
          Awards, certifications, and milestones will be listed here once they are published.
        </p>
      ) : null}

      {data.awards.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Awards</h2>
          <div className="mt-6 space-y-8">
            {data.awards.map((award) => (
              <article key={award.id} className="border-l-2 border-accent pl-6">
                <h3 className="font-display text-2xl font-semibold">{award.title}</h3>
                <p className="mt-1 text-ink/70">
                  {[award.issuer, year(award.date)].filter(Boolean).join(' — ')}
                </p>
                {award.description && (
                  <p className="prose-portfolio mt-3 max-w-2xl text-sm">{award.description}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Certifications</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {data.certifications.map((cert) => (
              <article key={cert.id} className="rounded-2xl border border-ink/10 p-6">
                <h3 className="font-display text-xl font-semibold">{cert.title}</h3>
                <p className="mt-1 text-ink/70">
                  {[cert.issuer, year(cert.dateObtained)].filter(Boolean).join(' — ')}
                </p>
                {cert.credentialUrl ? (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent mt-3 inline-block text-sm"
                  >
                    View credential →
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}

      {data.achievements.length > 0 && (
        <div className="mt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Milestones</h2>
          <div className="mt-6 space-y-8">
            {data.achievements.map((item) => (
              <article key={item.id} className="border-l-2 border-ink/15 pl-6">
                <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                {item.category ? (
                  <p className="font-mono mt-1 text-xs uppercase tracking-widest text-accent">
                    {item.category}
                  </p>
                ) : null}
                {item.description && (
                  <p className="prose-portfolio mt-3 max-w-2xl text-sm">{item.description}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
