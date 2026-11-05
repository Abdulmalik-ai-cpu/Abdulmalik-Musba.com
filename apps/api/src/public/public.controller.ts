import { Body, Controller, Get, HttpCode, Ip, Param, Post, Query, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { contactSubmissionSchema } from '@portfolio/validation';
import { ContactService } from '../contact/contact.service';
import type { AuthenticatedRequest } from '../common/decorators/current-user.decorator';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly contactService: ContactService,
  ) {}

  @Get('profile')
  profile() {
    return this.publicService.getProfile();
  }

  @Get('education')
  education() {
    return this.publicService.getEducation();
  }

  @Get('experience')
  experience() {
    return this.publicService.getExperience();
  }

  @Get('research')
  research() {
    return this.publicService.getResearch();
  }

  @Get('projects')
  projects() {
    return this.publicService.getProjects();
  }

  @Get('projects/:id')
  project(@Param('id') id: string) {
    return this.publicService.getProject(id);
  }

  @Get('publications')
  publications() {
    return this.publicService.getPublications();
  }

  @Get('skills')
  skills() {
    return this.publicService.getSkills();
  }

  @Get('achievements')
  achievements() {
    return this.publicService.getAchievements();
  }

  @Get('awards')
  awards() {
    return this.publicService.getAwards();
  }

  @Get('certifications')
  certifications() {
    return this.publicService.getCertifications();
  }

  @Get('talks')
  talks() {
    return this.publicService.getTalks();
  }

  @Get('services')
  services() {
    return this.publicService.getServices();
  }

  @Get('timeline')
  timeline() {
    return this.publicService.getTimeline();
  }

  @Get('articles')
  articles() {
    return this.publicService.getArticles();
  }

  @Get('articles/:slug')
  article(@Param('slug') slug: string) {
    return this.publicService.getArticle(slug);
  }

  @Get('social-links')
  socialLinks() {
    return this.publicService.getSocialLinks();
  }

  @Get('navigation')
  navigation() {
    return this.publicService.getNavigation();
  }

  @Get('settings')
  settings() {
    return this.publicService.getSettings();
  }

  @Get('seo')
  seo() {
    return this.publicService.getSeo();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.publicService.search(q ?? '');
  }

  /**
   * Contact form. Includes a honeypot field (website) — bots that fill it
   * are silently dropped. Real submissions are persisted for the owner and
   * trigger a best-effort notification (§43, §143.36).
   */
  @Post('contact')
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async contact(
    @Req() req: AuthenticatedRequest,
    @Ip() ip: string,
    @Body(new ZodValidationPipe(contactSubmissionSchema))
    body: {
      name: string;
      email: string;
      organization?: string | null;
      subject?: string | null;
      message: string;
      website?: string;
    },
  ) {
    if (body.website && body.website.length > 0) {
      // Respond exactly like a real submission so a bot cannot tell it was
      // filtered, but persist nothing and send no notification (§140.53).
      return { id: 'accepted', received: true };
    }

    return this.contactService.submit({
      name: body.name,
      email: body.email,
      organization: body.organization ?? null,
      subject: body.subject ?? null,
      message: body.message,
      ip: ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
  }
}