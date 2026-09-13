import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@portfolio/ui';
import type { Project } from '@portfolio/types';

export const metadata: Metadata = ({} satisfies Metadata);

async function getProject(id: string): Promise<Project | null> {
  try {
    return await api.getPublic.project(id);
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <section className="section">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Project</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{project.title}</h1>
      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">{project.status ?? 'Building'}</p>

      <div className="mt-8 flex flex-wrap gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-6 py-3 text-sm font-medium"
            style={{ background: 'rgb(var(--ink))', color: 'rgb(var(--paper))' }}
          >
            Visit live site
          </a>
        )}
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink/30 px-6 py-3 text-sm font-medium transition-colors hover:border-ink"
          >
            View source
          </a>
        )}
      </div>

      <div className="prose-portfolio mt-10 max-w-3xl">{project.summary}</div>

      {project.technologies.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Technologies</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-ink/15 px-4 py-2 font-mono text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        <Link href="/projects" className="link-accent text-sm">
          ← All projects
        </Link>
      </div>
    </section>
  );
}