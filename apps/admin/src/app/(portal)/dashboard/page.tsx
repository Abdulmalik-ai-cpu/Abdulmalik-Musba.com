'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@portfolio/ui';
import type { DashboardStats } from '@portfolio/types';

export default function DashboardPage() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    api.admin
      .dashboard()
      .then(setStats)
      .catch(() => setError('Unable to load dashboard stats. Is the API running?'));
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink/5" />
        ))}
      </div>
    );
  }

  const tiles: Array<{ label: string; value?: number; href: string }> = [
    { label: 'Education', value: stats?.educationCount, href: '/content/education' },
    { label: 'Experience', value: stats?.experienceCount, href: '/content/experience' },
    { label: 'Projects', value: stats?.projectCount, href: '/content/projects' },
    { label: 'Publications', value: stats?.publicationCount, href: '/content/publications' },
    { label: 'Articles', value: stats?.articleCount, href: '/content/articles' },
    { label: 'Published', value: stats?.publishedArticleCount, href: '/content/articles' },
    { label: 'Skills', value: stats?.skillCount, href: '/content/skills' },
    { label: 'New messages', value: stats?.newContactCount, href: '/content/contact' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">
        Welcome back, {user.email}. Here is the state of your portfolio.
      </p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <a key={tile.label} href={tile.href}>
            <Card className="p-6 transition-shadow hover:shadow-md">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/40">{tile.label}</p>
              <p className="font-display mt-2 text-3xl font-semibold">{tile.value ?? '—'}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}