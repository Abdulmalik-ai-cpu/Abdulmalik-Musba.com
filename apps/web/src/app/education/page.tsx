import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { formatPeriod } from '@/lib/format';
import type { Education } from '@portfolio/types';

export const metadata: Metadata = { title: 'Education' };

async function getEducation(): Promise<Education[]> {
  try {
    return await api.getPublic.education();
  } catch {
    return [];
  }
}

export default async function EducationPage() {
  const items = await getEducation();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Education</h1>
      <div className="mt-12 space-y-10">
        {items.length === 0 && <p className="text-ink/50">Education history will appear here soon.</p>}
        {items.map((edu) => (
          <article key={edu.id} className="border-l-2 border-accent pl-6">
            <h2 className="font-display text-2xl font-semibold">{edu.degree}</h2>
            <p className="mt-1 text-ink/70">
              {edu.institution}
              {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
            </p>
            <p className="font-mono mt-1 text-xs uppercase tracking-widest text-accent">
              {formatPeriod(edu.startDate, edu.endDate, edu.current)}
            </p>
            {edu.description && <p className="prose-portfolio mt-4 max-w-2xl text-sm">{edu.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}