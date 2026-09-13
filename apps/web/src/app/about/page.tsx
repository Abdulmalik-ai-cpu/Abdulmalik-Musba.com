import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DEFAULT_PROFILE_FALLBACK } from '@/lib/fallbacks';

export const metadata: Metadata = { title: 'About' };

async function getAbout() {
  try {
    const profile = await api.getPublic.profile();
    return {
      profile,
      education: await api.getPublic.education(),
      certifications: await api.getPublic.certifications(),
      awards: await api.getPublic.achievements(),
    };
  } catch {
    return { profile: DEFAULT_PROFILE_FALLBACK, education: [], certifications: [], awards: [] };
  }
}

export default async function AboutPage() {
  const { profile, education, certifications, awards } = await getAbout();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">About</h1>
      <p className="prose-portfolio mt-6 max-w-3xl">{profile.biography}</p>
      {profile.longBiography && <p className="prose-portfolio mt-4 max-w-3xl">{profile.longBiography}</p>}

      {education.length > 0 && (
        <div className="mt-14">
          <h2 className="section-title">Education</h2>
          <ul className="space-y-6">
            {education.map((edu) => (
              <li key={edu.id} className="border-l-2 border-accent pl-6">
                <h3 className="font-display text-lg font-semibold">{edu.degree}</h3>
                <p className="text-sm text-ink/60">
                  {edu.institution}
                  {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(certifications.length > 0 || awards.length > 0) && (
        <div className="mt-14 grid gap-12 md:grid-cols-2">
          {certifications.length > 0 && (
            <div>
              <h2 className="section-title">Certifications</h2>
              <ul className="space-y-2">
                {certifications.map((cert) => (
                  <li key={cert.id} className="text-sm text-ink/80">
                    {cert.title}
                    {cert.issuer ? ` — ${cert.issuer}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {awards.length > 0 && (
            <div>
              <h2 className="section-title">Honours & Achievements</h2>
              <ul className="space-y-2">
                {awards.map((item) => (
                  <li key={item.id} className="text-sm text-ink/80">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-14">
        <Link href="/contact" className="link-accent text-sm">
          Get in touch →
        </Link>
      </div>
    </section>
  );
}