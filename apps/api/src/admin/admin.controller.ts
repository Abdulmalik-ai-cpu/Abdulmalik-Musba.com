import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedRequest } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  profileSchema,
  educationSchema,
  experienceSchema,
  researchSchema,
  projectSchema,
  publicationSchema,
  skillSchema,
  certificationSchema,
  achievementSchema,
  awardSchema,
  talkSchema,
  serviceSchema,
  articleSchema,
  articlePublishSchema,
  siteSettingSchema,
  seoConfigSchema,
  navItemSchema,
  contactStatusSchema,
  mediaUpdateSchema,
} from '@portfolio/validation';
import type { z } from 'zod';

/**
 * Super Admin API.
 * Individually explicit routes (over a wildcard :entity) so the NestJS
 * router matches static paths first and OpenAPI documentation stays readable.
 */
@ApiTags('admin')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private ctx(req: AuthenticatedRequest, user: RequestUser) {
    return { adminUserId: user.adminUserId, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  // Dashboard ---------------------------------------------------------------

  @Get('dashboard/stats')
  dashboard() {
    return this.adminService.dashboardStats();
  }

  // Profile -----------------------------------------------------------------

  @Get('profile')
  getProfile() {
    return this.adminService.getProfile();
  }

  @Patch('profile')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(profileSchema)) body: z.infer<typeof profileSchema>,
  ) {
    return this.adminService.updateProfile(this.ctx(req, user), body);
  }

  // Education ---------------------------------------------------------------

  @Get('education')
  listEducation() {
    return this.adminService.listCategories('education');
  }

  @Post('education')
  createEducation(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(educationSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'education', body);
  }

  @Patch('education/:id')
  updateEducation(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(educationSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'education', id, body);
  }

  @Delete('education/:id')
  deleteEducation(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'education', id);
  }

  // Experience ---------------------------------------------------------------

  @Get('experience')
  listExperience() {
    return this.adminService.listCategories('experience');
  }

  @Post('experience')
  createExperience(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(experienceSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'experience', body);
  }

  @Patch('experience/:id')
  updateExperience(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(experienceSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'experience', id, body);
  }

  @Delete('experience/:id')
  deleteExperience(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'experience', id);
  }

  // Research -----------------------------------------------------------------

  @Get('research')
  listResearch() {
    return this.adminService.listCategories('research');
  }

  @Post('research')
  createResearch(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(researchSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'research', body);
  }

  @Patch('research/:id')
  updateResearch(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(researchSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'research', id, body);
  }

  @Delete('research/:id')
  deleteResearch(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'research', id);
  }

  // Projects -----------------------------------------------------------------

  @Get('projects')
  listProjects() {
    return this.adminService.listCategories('projects');
  }

  @Post('projects')
  createProject(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(projectSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'projects', body);
  }

  @Patch('projects/:id')
  updateProject(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(projectSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'projects', id, body);
  }

  @Delete('projects/:id')
  deleteProject(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'projects', id);
  }

  // Publications ----------------------------------------------------------------

  @Get('publications')
  listPublications() {
    return this.adminService.listCategories('publications');
  }

  @Post('publications')
  createPublication(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(publicationSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'publications', body);
  }

  @Patch('publications/:id')
  updatePublication(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(publicationSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'publications', id, body);
  }

  @Delete('publications/:id')
  deletePublication(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'publications', id);
  }

  // Skills ----------------------------------------------------------------------

  @Get('skills')
  listSkills() {
    return this.adminService.listCategories('skills');
  }

  @Post('skills')
  createSkill(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(skillSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'skills', body);
  }

  @Patch('skills/:id')
  updateSkill(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(skillSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'skills', id, body);
  }

  @Delete('skills/:id')
  deleteSkill(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'skills', id);
  }

  // Certifications --------------------------------------------------------------

  @Get('certifications')
  listCertifications() {
    return this.adminService.listCategories('certifications');
  }

  @Post('certifications')
  createCertification(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(certificationSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'certifications', body);
  }

  @Patch('certifications/:id')
  updateCertification(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(certificationSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'certifications', id, body);
  }

  @Delete('certifications/:id')
  deleteCertification(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'certifications', id);
  }

  // Achievements -----------------------------------------------------------------

  @Get('achievements')
  listAchievements() {
    return this.adminService.listCategories('achievements');
  }

  @Post('achievements')
  createAchievement(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(achievementSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'achievements', body);
  }

  @Patch('achievements/:id')
  updateAchievement(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(achievementSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'achievements', id, body);
  }

  @Delete('achievements/:id')
  deleteAchievement(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'achievements', id);
  }

  // Awards --------------------------------------------------------------------------

  @Get('awards')
  listAwards() {
    return this.adminService.listCategories('awards');
  }

  @Post('awards')
  createAward(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(awardSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'awards', body);
  }

  @Patch('awards/:id')
  updateAward(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(awardSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'awards', id, body);
  }

  @Delete('awards/:id')
  deleteAward(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'awards', id);
  }

  // Talks ------------------------------------------------------------------------------

  @Get('talks')
  listTalks() {
    return this.adminService.listCategories('talks');
  }

  @Post('talks')
  createTalk(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(talkSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'talks', body);
  }

  @Patch('talks/:id')
  updateTalk(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(talkSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'talks', id, body);
  }

  @Delete('talks/:id')
  deleteTalk(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'talks', id);
  }

  // Services ------------------------------------------------------------------------------

  @Get('services')
  listServices() {
    return this.adminService.listCategories('services');
  }

  @Post('services')
  createService(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(serviceSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'services', body);
  }

  @Patch('services/:id')
  updateService(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(serviceSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'services', id, body);
  }

  @Delete('services/:id')
  deleteService(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'services', id);
  }

  // Timeline -----------------------------------------------------------------------------------

  @Get('timeline')
  listTimeline() {
    return this.adminService.listCategories('timeline');
  }

  @Post('timeline')
  createTimeline(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminService.createEntity(this.ctx(req, user), 'timeline', body);
  }

  @Patch('timeline/:id')
  updateTimeline(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminService.updateEntity(this.ctx(req, user), 'timeline', id, body);
  }

  @Delete('timeline/:id')
  deleteTimeline(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'timeline', id);
  }

  // Articles -------------------------------------------------------------------------------------------|

  @Get('articles')
  listArticles(@Query() query: Record<string, unknown>) {
    return this.adminService.listArticles({
      page: Number(query.page ?? 1),
      pageSize: Number(query.pageSize ?? 10),
      search: typeof query.search === 'string' ? query.search : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
    });
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string) {
    return this.adminService.getArticle(id);
  }

  @Post('articles')
  createArticle(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(articleSchema)) body: z.infer<typeof articleSchema>,
  ) {
    return this.adminService.createArticle(this.ctx(req, user), body);
  }

  @Patch('articles/:id')
  updateArticle(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(articleSchema.partial())) body: Record<string, unknown>,
  ) {
    return this.adminService.updateArticle(this.ctx(req, user), id, body);
  }

  @Post('articles/:id/publish')
  publishArticle(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(articlePublishSchema))
    body: { action: 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE'; scheduledFor?: string | null },
  ) {
    return this.adminService.publishArticle(this.ctx(req, user), id, body.action, body.scheduledFor);
  }

  @Delete('articles/:id')
  deleteArticle(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteArticle(this.ctx(req, user), id);
  }

  // Media --------------------------------------------------------------------------------------------|

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.uploadMedia(this.ctx(req, user), file);
  }

  @Patch('media/:id')
  updateMedia(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(mediaUpdateSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.updateMedia(this.ctx(req, user), id, body);
  }

  // Contact ----------------------------------------------------------------------------------------------|

  @Get('contact')
  listContact() {
    return this.adminService.listCategories('contact');
  }

  @Patch('contact/:id')
  updateContact(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contactStatusSchema)) body: { status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED' },
  ) {
    return this.adminService.updateContactStatus(this.ctx(req, user), id, body.status);
  }

  @Delete('contact/:id')
  deleteContact(@Req() req: AuthenticatedRequest, @CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.deleteEntity(this.ctx(req, user), 'contact', id);
  }

  // Navigation / settings / SEO --------------------------------------------------------------------------------|

  @Get('navigation')
  getNavigation() {
    return this.adminService.getNavigation();
  }

  @Put('navigation')
  updateNavigation(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      items: Array<{
        id?: string;
        label: string;
        href: string;
        order?: number;
        visible?: boolean;
        isExternal?: boolean;
      }>;
    },
  ) {
    return this.adminService.updateNavigation(this.ctx(req, user), body.items);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(siteSettingSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.updateSettings(this.ctx(req, user), body);
  }

  @Get('seo')
  getSeo() {
    return this.adminService.getSeo();
  }

  @Patch('seo')
  updateSeo(
    @Req() req: AuthenticatedRequest,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(seoConfigSchema)) body: Record<string, unknown>,
  ) {
    return this.adminService.updateSeo(this.ctx(req, user), body);
  }

  // Audit --------------------------------------------------------------------------------------------------------------|

  @Get('audit')
  listAudit(@Query() query: Record<string, unknown>) {
    return this.adminService.listAudit({
      page: Number(query.page ?? 1),
      pageSize: Number(query.pageSize ?? 20),
      entity: typeof query.entity === 'string' ? query.entity : undefined,
    });
  }
}