'use client';

import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  GraduationCap,
  Briefcase,
  FlaskConical,
  BookOpen,
  Wrench,
  Award,
  Medal,
  Mic,
  CalendarClock,
  Smartphone,
  ImageIcon,
  Inbox,
  Settings,
  ScrollText,
  LogOut,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Manage',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/content/profile', label: 'Profile', icon: Smartphone },
      { href: '/content/education', label: 'Education', icon: GraduationCap },
      { href: '/content/experience', label: 'Experience', icon: Briefcase },
      { href: '/content/research', label: 'Research', icon: FlaskConical },
      { href: '/content/projects', label: 'Projects', icon: FolderGit2 },
      { href: '/content/publications', label: 'Publications', icon: BookOpen },
      { href: '/content/skills', label: 'Skills', icon: Wrench },
      { href: '/content/certifications', label: 'Certifications', icon: Award },
      { href: '/content/achievements', label: 'Achievements', icon: Medal },
      { href: '/content/talks', label: 'Talks', icon: Mic },
      { href: '/content/timeline', label: 'Timeline', icon: CalendarClock },
    ],
  },
  {
    label: 'Publish',
    items: [
      { href: '/content/articles', label: 'Articles', icon: FileText },
      { href: '/content/media', label: 'Media', icon: ImageIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/content/contact', label: 'Inbox', icon: Inbox },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/audit', label: 'Audit log', icon: ScrollText },
    ],
  },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname: string = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm uppercase tracking-widest text-ink/40">Loading…</p>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  function handleLogout() {
    logout();
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-6 py-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Super Admin</p>
          <h1 className="mt-1 font-display text-base font-semibold">Portfolio HQ</h1>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-widest text-ink/40">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'bg-ink text-paper'
                            : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-ink/10 px-6 py-4">
          <p className="truncate text-sm font-medium">{user?.email ?? 'Admin'}</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden px-8 py-10">{children}</main>
    </div>
  );
}