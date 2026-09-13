import type { Metadata } from 'next';
import { api } from '@/lib/api';
import type { Skill, Certification, Achievement, Award, Talk, Service, TimelineRecord } from '@portfolio/types';

export const metadata: Metadata = { title: 'Skills' };

async function getSkillsData() {
  try {
    const [skills, certifications, achievements, awards, talks, services, timeline] = await Promise.all([
      api.getPublic.skills().catch(() => [] as Skill[]),
      api.getPublic.certifications().catch(() => [] as Certification[]),
      api.getPublic.achievements().catch(() => [] as Achievement[]),
      api.getPublic.awards().catch(() => [] as Award[]),
      api.getPublic.talks().catch(() => [] as Talk[]),
      api.getPublic.services().catch(() => [] as Service[]),
      api.getPublic.timeline().catch(() => [] as TimelineRecord[]),
    ]);
    return { skills, certifications, achievements, awards, talks, services, timeline };
  } catch {
    return { skills: [], certifications: [], achievements: [], awards: [], talks: [], services: [], timeline: [] };
  }
}

function proficiencyLabel(value: number | null): string {
  if (value === null) return '';
  const pct = Math.max(0, Math.min(100, value));
  return `${pct}%`;
}

export default async function SkillsPage() {
  const { skills, certifications, achievements, awards, talks, services, timeline } = await getSkillsData();

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const key = skill.category ?? 'General';
    (acc[key] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Skills & Expertise</h1>

      {skills.length > 0 && (
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {Object.entries(skillsByCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent">{category}</h2>
              <ul className="mt-4 space-y-3">
                {items.map((skill) => (
                  <li key={skill.id} className="flex items-center justify-between gap-4">
                    <span className="font-body text-sm">{skill.name}</span>
                    {typeof skill.proficiency === 'number' && (
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: proficiencyLabel(skill.proficiency) }}
                        />
                      </span>
                    )}
                    {typeof skill.proficiency === 'number' && (
                      <span className="font-mono w-10 text-right text-xs text-ink/50">
                        {proficiencyLabel(skill.proficiency)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title">Services</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-ink/10 p-6">
                <h3 className="font-display text-lg font-semibold">{service.title}</h3>
                {service.description && <p className="mt-2 text-sm text-ink/70">{service.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(certifications.length > 0 || talks.length > 0 || achievements.length > 0 || awards.length > 0) && (
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {certifications.length > 0 && (
            <div>
              <h2 className="section-title">Certifications</h2>
              <ul className="space-y-3">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{cert.title}</p>
                      <p className="text-xs text-ink/60">{cert.issuer}</p>
                    </div>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="link-accent text-xs">
                        Verify →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {talks.length > 0 && (
            <div>
              <h2 className="section-title">Talks</h2>
              <ul className="space-y-3">
                {talks.map((talk) => (
                  <li key={talk.id}>
                    <p className="text-sm font-medium">{talk.title}</p>
                    <p className="text-xs text-ink/60">
                      {[talk.event, talk.location].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {achievements.length > 0 && (
            <div>
              <h2 className="section-title">Achievements</h2>
              <ul className="space-y-3">
                {achievements.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && <p className="text-xs text-ink/60">{item.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {awards.length > 0 && (
            <div>
              <h2 className="section-title">Awards</h2>
              <ul className="space-y-3">
                {awards.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.issuer && <p className="text-xs text-ink/60">{item.issuer}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {timeline.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title">Timeline</h2>
          <ol className="relative space-y-8 border-l border-ink/15 pl-8">
            {timeline.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[39px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-paper" />
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {new Date(item.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
                <h3 className="font-display mt-1 text-lg font-semibold">{item.title}</h3>
                {item.description && <p className="mt-1 text-sm text-ink/70">{item.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}