import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublishStatus, Visibility } from '@prisma/client';

/**
 * Public read service.
 * Returns only records that are visible to anonymous visitors
 * (visibility PUBLIC) — private and archived records never leave the API.
 */
@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly publicWhere = { visibility: Visibility.PUBLIC } as const;
  private readonly publishedArticleWhere = { visibility: Visibility.PUBLIC, status: PublishStatus.PUBLISHED } as const;

  async getProfile() {
    const profile = await this.prisma.profile.findFirst({
      include: {
        education: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        experience: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        research: {
          where: { visibility: Visibility.PUBLIC },
          orderBy: [{ startDate: 'desc' }, { sortOrder: 'asc' }],
        },
        projects: {
          where: { visibility: Visibility.PUBLIC },
          orderBy: [{ sortOrder: 'asc' }],
          include: { technologies: { where: { visibility: Visibility.PUBLIC }, select: { name: true } } },
        },
        publications: {
          where: { visibility: Visibility.PUBLIC },
          orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
        },
        skills: {
          where: { visibility: Visibility.PUBLIC },
          orderBy: [{ sortOrder: 'asc' }],
          include: { technologies: { where: { visibility: Visibility.PUBLIC } } },
        },
        certifications: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        achievements: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        awards: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        talks: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        services: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        socialLinks: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ sortOrder: 'asc' }] },
        timelineRecords: { where: { visibility: Visibility.PUBLIC }, orderBy: [{ date: 'desc' }] },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile has not been set up yet');
    }
    return profile;
  }

  async getEducation() {
    return this.prisma.education.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getExperience() {
    return this.prisma.experience.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getResearch() {
    return this.prisma.research.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getProjects() {
    const projects = await this.prisma.project.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
      include: { technologies: { where: { visibility: Visibility.PUBLIC }, select: { name: true } } },
    });
    return projects.map(({ technologies, ...project }) => ({
      ...project,
      technologies: technologies.map((t) => t.name),
    }));
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, visibility: Visibility.PUBLIC },
      include: {
        technologies: { where: { visibility: Visibility.PUBLIC }, select: { name: true } },
        publications: { where: { visibility: Visibility.PUBLIC } },
        media: { where: { storageClass: 'PUBLIC' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const { technologies, ...rest } = project;
    return { ...rest, technologies: technologies.map((t) => t.name) };
  }

  async getPublications() {
    return this.prisma.publication.findMany({
      where: this.publicWhere,
      orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async getSkills() {
    return this.prisma.skill.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
      include: { technologies: { where: { visibility: Visibility.PUBLIC } } },
    });
  }

  async getAchievements() {
    return this.prisma.achievement.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getAwards() {
    return this.prisma.award.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getCertifications() {
    return this.prisma.certification.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getTalks() {
    return this.prisma.talk.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getServices() {
    return this.prisma.service.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getTimeline() {
    return this.prisma.timelineRecord.findMany({
      where: this.publicWhere,
      orderBy: [{ date: 'desc' }],
    });
  }

  async getArticles() {
    return this.prisma.article.findMany({
      where: this.publishedArticleWhere,
      orderBy: [{ publishedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        scheduledFor: true,
        tags: true,
        coverImageUrl: true,
        readingTime: true,
        featured: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getArticle(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        visibility: Visibility.PUBLIC,
        status: PublishStatus.PUBLISHED,
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async getSocialLinks() {
    return this.prisma.socialLink.findMany({
      where: this.publicWhere,
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async getNavigation() {
    const items = await this.prisma.navItem.findMany({
      where: { visible: true },
      orderBy: [{ order: 'asc' }],
    });
    return items.map(({ id, label, href, order, visible, isExternal }) => ({
      id,
      label,
      href,
      order,
      visible,
      isExternal,
    }));
  }

  async getSettings() {
    return this.prisma.siteSetting.findUnique({ where: { id: 'default' } });
  }

  async getSeo() {
    return this.prisma.seoConfig.findUnique({ where: { id: 'default' } });
  }

  async search(query: string) {
    const q = query.trim();
    if (!q) return { results: [], total: 0 };

    const [projects, articles, publications, research] = await Promise.all([
      this.prisma.project.findMany({
        where: { visibility: Visibility.PUBLIC, OR: [{ title: { contains: q } }, { summary: { contains: q } }] },
        take: 10,
        select: { id: true, title: true, summary: true },
      }),
      this.prisma.article.findMany({
        where: this.publishedArticleWhere,
        take: 10,
        select: { id: true, title: true, slug: true, excerpt: true },
      }),
      this.prisma.publication.findMany({
        where: { visibility: Visibility.PUBLIC, OR: [{ title: { contains: q } }, { venue: { contains: q } }] },
        take: 10,
        select: { id: true, title: true, year: true },
      }),
      this.prisma.research.findMany({
        where: { visibility: Visibility.PUBLIC, OR: [{ title: { contains: q } }, { summary: { contains: q } }] },
        take: 10,
        select: { id: true, title: true, summary: true },
      }),
    ]);

    const results = [
      ...projects.map((p) => ({ type: 'project' as const, id: p.id, title: p.title, excerpt: p.summary, url: `/projects/${p.id}` })),
      ...articles.map((a) => ({ type: 'article' as const, id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, url: `/articles/${a.slug}` })),
      ...publications.map((p) => ({ type: 'publication' as const, id: p.id, title: p.title, excerpt: p.year ? String(p.year) : null, url: `/publications#${p.id}` })),
      ...research.map((r) => ({ type: 'research' as const, id: r.id, title: r.title, excerpt: r.summary, url: `/research#${r.id}` })),
    ];

    return { results, total: results.length };
  }
}