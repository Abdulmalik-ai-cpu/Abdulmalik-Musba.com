import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PublishStatus, Prisma, Visibility } from '@prisma/client';

type AdminContext = { adminUserId: string; ip?: string; userAgent?: string };

/**
 * Super Admin domain operations.
 * Every write is scoped to the authenticated admin, passed through the audit
 * service, and only touches data that a single-person portfolio owner manages.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async trackAudit(
    ctx: AdminContext,
    action: Prisma.AuditLogCreateInput['action'],
    entity: string,
    entityId?: string,
    before?: unknown,
    after?: unknown,
  ) {
    await this.audit.log({
      adminUserId: ctx.adminUserId,
      action,
      entity,
      entityId,
      before,
      after,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  // -------------------------------------------------------------------------
  // Dashboard
  // -------------------------------------------------------------------------

  async dashboardStats() {
    const [
      educationCount,
      experienceCount,
      projectCount,
      publicationCount,
      articleCount,
      publishedArticleCount,
      skillCount,
      newContactCount,
      mediaCount,
    ] = await Promise.all([
      this.prisma.education.count(),
      this.prisma.experience.count(),
      this.prisma.project.count(),
      this.prisma.publication.count(),
      this.prisma.article.count(),
      this.prisma.article.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.skill.count(),
      this.prisma.contactSubmission.count({ where: { status: 'NEW' } }),
      this.prisma.media.count(),
    ]);

    return {
      educationCount,
      experienceCount,
      projectCount,
      publicationCount,
      articleCount,
      publishedArticleCount,
      skillCount,
      newContactCount,
      mediaCount,
    };
  }

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------

  async getProfile() {
    const profile = await this.prisma.profile.findFirst();
    if (!profile) throw new NotFoundException('Profile has not been created yet');
    return profile;
  }

  async updateProfile(ctx: AdminContext, payload: Record<string, unknown>) {
    const existing = await this.prisma.profile.findFirst();
    const profile = existing
      ? await this.prisma.profile.update({ where: { id: existing.id }, data: payload as Prisma.ProfileUpdateInput })
      : await this.prisma.profile.create({ data: payload as Prisma.ProfileCreateInput });

    await this.trackAudit(ctx, 'UPDATE', 'Profile', profile.id, existing, profile);
    return profile;
  }

  // -------------------------------------------------------------------------
  // Generic entity helpers
  // -------------------------------------------------------------------------

  async listCategories(entity: string) {
    const map: Record<string, () => Promise<unknown[]>> = {
      education: () => this.prisma.education.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      experience: () => this.prisma.experience.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      research: () => this.prisma.research.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      projects: () => this.prisma.project.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      publications: () => this.prisma.publication.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      skills: () => this.prisma.skill.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      certifications: () => this.prisma.certification.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      achievements: () => this.prisma.achievement.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      awards: () => this.prisma.award.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      talks: () => this.prisma.talk.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      services: () => this.prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      timeline: () => this.prisma.timelineRecord.findMany({ orderBy: [{ date: 'desc' }] }),
      contact: () => this.prisma.contactSubmission.findMany({ orderBy: [{ createdAt: 'desc' }] }),
      media: () => this.prisma.media.findMany({ orderBy: [{ createdAt: 'desc' }] }),
      'social-links': () => this.prisma.socialLink.findMany({ orderBy: [{ sortOrder: 'asc' }] }),
      'nav-items': () => this.prisma.navItem.findMany({ orderBy: [{ order: 'asc' }] }),
    };
    const fn = map[entity];
    if (!fn) throw new NotFoundException(`Unknown entity: ${entity}`);
    return fn();
  }

  async createEntity(ctx: AdminContext, entity: string, payload: Record<string, unknown>) {
    const map: Record<string, () => Promise<unknown>> = {
      education: () => this.prisma.education.create({ data: payload as Prisma.EducationCreateInput }),
      experience: () => this.prisma.experience.create({ data: payload as Prisma.ExperienceCreateInput }),
      research: () => this.prisma.research.create({ data: payload as Prisma.ResearchCreateInput }),
      projects: () => this.prisma.project.create({ data: payload as Prisma.ProjectCreateInput }),
      publications: () => this.prisma.publication.create({ data: payload as Prisma.PublicationCreateInput }),
      skills: () => this.prisma.skill.create({ data: payload as Prisma.SkillCreateInput }),
      technologies: () => this.prisma.technology.create({ data: payload as Prisma.TechnologyCreateInput }),
      certifications: () => this.prisma.certification.create({ data: payload as Prisma.CertificationCreateInput }),
      achievements: () => this.prisma.achievement.create({ data: payload as Prisma.AchievementCreateInput }),
      awards: () => this.prisma.award.create({ data: payload as Prisma.AwardCreateInput }),
      talks: () => this.prisma.talk.create({ data: payload as Prisma.TalkCreateInput }),
      services: () => this.prisma.service.create({ data: payload as Prisma.ServiceCreateInput }),
      timeline: () => this.prisma.timelineRecord.create({ data: payload as Prisma.TimelineRecordCreateInput }),
      'social-links': () => this.prisma.socialLink.create({ data: payload as Prisma.SocialLinkCreateInput }),
      'nav-items': () => this.prisma.navItem.create({ data: payload as Prisma.NavItemCreateInput }),
    };
    const fn = map[entity];
    if (!fn) throw new NotFoundException(`Unknown entity: ${entity}`);
    const record = await fn();
    await this.trackAudit(ctx, 'CREATE', entity, (record as { id: string }).id, undefined, payload);
    return record;
  }

  async updateEntity(ctx: AdminContext, entity: string, id: string, payload: Record<string, unknown>) {
    const model = this.resolveModel(entity);
    const record = await model.update({ where: { id }, data: payload as Prisma.InputJsonObject });
    await this.trackAudit(ctx, 'UPDATE', entity, id, undefined, record);
    return record;
  }

  async deleteEntity(ctx: AdminContext, entity: string, id: string) {
    const model = this.resolveModel(entity);
    await model.delete({ where: { id } });
    await this.trackAudit(ctx, 'DELETE', entity, id);
    return { ok: true };
  }

  private resolveModel(entity: string) {
    const delegates = {
      education: this.prisma.education,
      experience: this.prisma.experience,
      research: this.prisma.research,
      projects: this.prisma.project,
      publications: this.prisma.publication,
      skills: this.prisma.skill,
      technologies: this.prisma.technology,
      certifications: this.prisma.certification,
      achievements: this.prisma.achievement,
      awards: this.prisma.award,
      talks: this.prisma.talk,
      services: this.prisma.service,
      timeline: this.prisma.timelineRecord,
      contact: this.prisma.contactSubmission,
      media: this.prisma.media,
    } as const;
    const delegate = delegates[entity as keyof typeof delegates];
    if (!delegate) throw new NotFoundException(`Unknown entity: ${entity}`);
    return delegate as unknown as {
      update: (args: { where: { id: string }; data: Prisma.InputJsonObject }) => Promise<unknown>;
      delete: (args: { where: { id: string } }) => Promise<unknown>;
    };
  }

  // -------------------------------------------------------------------------
  // Articles
  // -------------------------------------------------------------------------

  async listArticles(params: { page?: number; pageSize?: number; search?: string; status?: string }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const where: Prisma.ArticleWhereInput = {
      ...(params.search
        ? { OR: [{ title: { contains: params.search } }, { excerpt: { contains: params.search } }] }
        : {}),
      ...(params.status ? { status: params.status as PublishStatus } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async createArticle(ctx: AdminContext, payload: Prisma.ArticleCreateInput) {
    const article = await this.prisma.article.create({
      data: { ...payload, status: (payload.status ?? 'DRAFT') as PublishStatus },
    });
    await this.trackAudit(ctx, 'CREATE', 'Article', article.id, undefined, {
      title: article.title,
      slug: article.slug,
    });
    return article;
  }

  async updateArticle(ctx: AdminContext, id: string, payload: Prisma.ArticleUpdateInput) {
    const article = await this.prisma.article.update({ where: { id }, data: payload });

    // Save a revision for the content change so past versions remain reachable.
    if (payload.content) {
      const previous = await this.prisma.revision.aggregate({
        _max: { version: true },
        where: { articleId: id },
      });
      await this.prisma.revision.create({
        data: {
          articleId: id,
          version: (previous._max.version ?? 0) + 1,
          title: payload.title && typeof payload.title === 'string' ? payload.title : article.title,
          content: String(payload.content),
          changelog: 'Edited via Super Admin',
        },
      });
    }

    await this.trackAudit(ctx, 'UPDATE', 'Article', id, undefined, { title: article.title });
    return article;
  }

  async publishArticle(
    ctx: AdminContext,
    id: string,
    action: 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE',
    scheduledFor?: string | null,
  ) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article not found');

    const data: Prisma.ArticleUpdateInput =
      action === 'PUBLISH'
        ? { status: 'PUBLISHED', publishedAt: new Date(), scheduledFor: null }
        : action === 'SCHEDULE'
          ? { status: 'SCHEDULED', scheduledFor: scheduledFor ? new Date(scheduledFor) : null }
          : { status: 'DRAFT', publishedAt: null };

    const article = await this.prisma.article.update({ where: { id }, data });
    await this.trackAudit(ctx, action === 'UNPUBLISH' ? 'UNPUBLISH' : 'PUBLISH', 'Article', id, undefined, {
      action,
      title: article.title,
    });
    return article;
  }

  async deleteArticle(ctx: AdminContext, id: string) {
    await this.prisma.article.delete({ where: { id } });
    await this.trackAudit(ctx, 'DELETE', 'Article', id);
    return { ok: true };
  }

  // -------------------------------------------------------------------------
  // Media
  // -------------------------------------------------------------------------

  async listMedia() {
    return this.prisma.media.findMany({ orderBy: [{ createdAt: 'desc' }] });
  }

  async uploadMedia(ctx: AdminContext, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('No file provided');
    // Local upload; a Cloudflare R2 adapter can be wired without changing this method.
    const publicUrl = `/media/${file.filename}`;
    const media = await this.prisma.media.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: publicUrl,
        type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
      },
    });
    await this.trackAudit(ctx, 'UPLOAD', 'Media', media.id, undefined, {
      originalName: file.originalname,
      size: file.size,
    });
    return media;
  }

  async updateMedia(ctx: AdminContext, id: string, payload: Record<string, unknown>) {
    const media = await this.prisma.media.update({ where: { id }, data: payload });
    await this.trackAudit(ctx, 'UPDATE', 'Media', id, undefined, payload);
    return media;
  }

  // -------------------------------------------------------------------------
  // Contact, Navigation, Settings, SEO
  // -------------------------------------------------------------------------

  async updateContactStatus(ctx: AdminContext, id: string, status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED') {
    const submission = await this.prisma.contactSubmission.update({
      where: { id },
      data: { status, readAt: status === 'READ' || status === 'REPLIED' ? new Date() : null },
    });
    await this.trackAudit(ctx, 'UPDATE', 'ContactSubmission', id, undefined, { status });
    return submission;
  }

  async getNavigation() {
    return this.prisma.navItem.findMany({ orderBy: [{ order: 'asc' }] });
  }

  async getSettings() {
    const settings = await this.prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!settings) throw new NotFoundException('Site settings have not been seeded');
    return settings;
  }

  async getSeo() {
    const seo = await this.prisma.seoConfig.findUnique({ where: { id: 'default' } });
    if (!seo) throw new NotFoundException('SEO configuration has not been seeded');
    return seo;
  }

  async updateNavigation(ctx: AdminContext, items: Array<{ id?: string; label: string; href: string; order?: number; visible?: boolean; isExternal?: boolean }>) {
    // Replaces the navigation with a fresh ordered set (idempotent full replace).
    await this.prisma.navItem.deleteMany({});
    await this.prisma.navItem.createMany({
      data: items.map((item, index) => ({
        label: item.label,
        href: item.href,
        order: item.order ?? index,
        visible: item.visible ?? true,
        isExternal: item.isExternal ?? false,
      })),
    });
    const saved = await this.prisma.navItem.findMany({ orderBy: [{ order: 'asc' }] });
    await this.trackAudit(ctx, 'SETTINGS_UPDATE', 'NavItem', undefined, undefined, { count: saved.length });
    return saved;
  }

  async updateSettings(ctx: AdminContext, payload: Record<string, unknown>) {
    const settings = await this.prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: payload,
      create: { id: 'default', siteName: String(payload.siteName ?? 'Portfolio'), ...payload },
    });
    await this.trackAudit(ctx, 'SETTINGS_UPDATE', 'SiteSetting', 'default', undefined, payload);
    return settings;
  }

  async updateSeo(ctx: AdminContext, payload: Record<string, unknown>) {
    const seo = await this.prisma.seoConfig.upsert({
      where: { id: 'default' },
      update: payload,
      create: { id: 'default', siteTitle: String(payload.siteTitle ?? ''), description: String(payload.description ?? ''), ...payload },
    });
    await this.trackAudit(ctx, 'SETTINGS_UPDATE', 'SeoConfig', 'default', undefined, payload);
    return seo;
  }

  async listAudit(params: { page?: number; pageSize?: number; entity?: string }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where: Prisma.AuditLogWhereInput = params.entity ? { entity: params.entity } : {};

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { adminUser: { select: { email: true } } },
      }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        adminUserEmail: item.adminUser?.email ?? null,
        action: item.action,
        entity: item.entity,
        entityId: item.entityId,
        createdAt: item.createdAt,
        metadata: item.metadata,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}