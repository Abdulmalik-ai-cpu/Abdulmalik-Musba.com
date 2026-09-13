import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { formatPeriod } from '@/lib/format';
import type { Experience } from '@portfolio/types';

export const metadata: Metadata = { title: 'Experience' };

async function getExperience(): Promise<Experience[]> {
  try {
    return await api.getPublic.experience();
  } catch {
    return [];
  }
}

export default async function ExperiencePage() {
  const items = await getExperience();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Experience</h1>
      <div className="mt-12 space-y-10">
        {items.length === 0 && <p className="text-ink/50">Career history will appear here soon.</p>}
        {items.map((role) => (
          <article key={role.id} className="border-l-2 border-accent pl-6">
            <h2 className="font-display text-2xl font-semibold">{role.title}</h2>
            <p className="mt-1 text-ink/70">
              {[role.company, role.organization, role.location].filter(Boolean).join(' · ')}
            </p>
            <p className="font-mono mt-1 text-xs uppercase tracking-widest text-accent">
              {formatPeriod(role.startDate, role.endDate, role.current)}
            </p>
            {role.description && (
              <p className="prose-portfolio mt-4 max-w-2xl whitespace-pre-line text-sm">{role.description}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}