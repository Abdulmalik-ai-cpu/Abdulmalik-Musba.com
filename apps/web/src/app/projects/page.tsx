import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@portfolio/ui';
import type { Project } from '@portfolio/types';

export const metadata: Metadata = { title: 'Projects' };

async function getProjects(): Promise<Project[]> {
  try {
    return await api.getPublic.projects();
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="section">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Projects</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {projects.length === 0 && <p className="text-ink/50">Projects will appear here soon.</p>}
        {projects.map((project) => (
          <Card key={project.id} className="flex h-full flex-col p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">{project.title}</h2>
              {project.featured && (
                <span className="font-mono shrink-0 rounded-full bg-accent px-3 py-1 text-xs uppercase tracking-widest text-paper">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-ink/70">{project.summary}</p>
            {project.technologies.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-ink/15 px-3 py-1 font-mono text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 flex items-center gap-6">
              <Link href={`/projects/${project.id}`} className="link-accent text-sm">
                Details →
              </Link>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="link-accent text-sm">
                  Live site
                </a>
              )}
              {project.repositoryUrl && (
                <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="link-accent text-sm">
                  Source
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}