'use client';

import Link from 'next/link';
import { Card } from '@portfolio/ui';
import {
  GraduationCap,
  Briefcase,
  FlaskConical,
  FolderGit2,
  BookOpen,
  Wrench,
  Award,
  Medal,
  Mic,
  CalendarClock,
  Smartphone,
  FileText,
  ImageIcon,
  Inbox,
} from 'lucide-react';

const GROUPS = [
  { href: '/content/profile', label: 'Profile', icon: Smartphone, desc: 'Identity, bio, socials' },
  { href: '/content/education', label: 'Education', icon: GraduationCap, desc: 'Degrees and certificates' },
  { href: '/content/experience', label: 'Experience', icon: Briefcase, desc: 'Roles and positions' },
  { href: '/content/research', label: 'Research', icon: FlaskConical, desc: 'Research interests and projects' },
  { href: '/content/projects', label: 'Projects', icon: FolderGit2, desc: 'Builds and repositories' },
  { href: '/content/publications', label: 'Publications', icon: BookOpen, desc: 'Papers and articles' },
  { href: '/content/skills', label: 'Skills & Technologies', icon: Wrench, desc: 'Skills and expertise' },
  { href: '/content/certifications', label: 'Certifications', icon: Award, desc: 'Credentials' },
  { href: '/content/achievements', label: 'Achievements', icon: Medal, desc: 'Honours and awards' },
  { href: '/content/talks', label: 'Talks', icon: Mic, desc: 'Presentations and talks' },
  { href: '/content/timeline', label: 'Timeline', icon: CalendarClock, desc: 'Milestones over time' },
  { href: '/content/articles', label: 'Articles', icon: FileText, desc: 'Long-form writing' },
  { href: '/content/media', label: 'Media', icon: ImageIcon, desc: 'Uploads and assets' },
  { href: '/content/contact', label: 'Inbox', icon: Inbox, desc: 'Contact submissions' },
];

export default function ContentIndexPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Content</h1>
      <p className="mt-1 text-sm text-ink/50">Choose a group to manage. Every change publishes to the public site.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <Link key={group.href} href={group.href}>
              <Card className="flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-md">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium">{group.label}</p>
                  <p className="mt-1 text-xs text-ink/50">{group.desc}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}