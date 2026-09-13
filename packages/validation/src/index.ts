import { z } from 'zod';

/** Reusable validators shared between the NestJS API and the React frontends. */

export const visibilitySchema = z.enum(['PUBLIC', 'PRIVATE', 'ARCHIVED']);
export const publishStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']);

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, URL-safe, hyphenated');

export const emailSchema = z.string().email('A valid email address is required');

const optionalDate = () => z.string().datetime().nullable().optional();
const requiredDate = () => z.string().datetime('Must be a valid ISO date');

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  fullName: z.string().min(1).max(200),
  displayName: z.string().min(1).max(200),
  professionalTitle: z.string().min(1).max(200),
  shortIntro: z.string().min(1).max(500),
  biography: z.string().min(1),
  longBiography: z.string().nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  nationality: z.string().max(200).nullable().optional(),
  languages: z.array(z.string()).optional().default([]),
  email: emailSchema.nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  orcid: z.string().max(100).nullable().optional(),
  googleScholar: z.string().max(500).nullable().optional(),
  github: z.string().max(500).nullable().optional(),
  linkedin: z.string().max(500).nullable().optional(),
  personalDomains: z.array(z.string()).optional().default([]),
  externalWebsites: z.array(z.string()).optional().default([]),
  cvUrl: z.string().url().nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  institution: z.string().min(1).max(300),
  degree: z.string().min(1).max(200),
  fieldOfStudy: z.string().max(200).nullable().optional(),
  startDate: requiredDate(),
  endDate: optionalDate(),
  current: z.boolean().optional().default(false),
  description: z.string().max(2000).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export const experienceSchema = z.object({
  title: z.string().min(1).max(300),
  company: z.string().max(300).nullable().optional(),
  organization: z.string().max(300).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  startDate: requiredDate(),
  endDate: optionalDate(),
  current: z.boolean().optional().default(false),
  description: z.string().max(5000).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

export const researchSchema = z.object({
  title: z.string().min(1).max(300),
  category: z.string().max(200).nullable().optional(),
  summary: z.string().min(1).max(2000),
  status: z.string().max(200).nullable().optional(),
  startDate: optionalDate(),
  endDate: optionalDate(),
  current: z.boolean().optional().default(false),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(2000),
  status: z.string().max(200).nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  liveUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  featured: z.boolean().optional().default(false),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
  technologies: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------

export const publicationSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(['JOURNAL', 'CONFERENCE', 'THESIS', 'REPORT', 'BOOK', 'CHAPTER', 'OTHER']).default('OTHER'),
  authors: z.array(z.string()).optional().default([]),
  venue: z.string().max(300).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  doi: z.string().max(200).nullable().optional(),
  url: z.string().url().nullable().optional(),
  citation: z.string().max(2000).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

// ---------------------------------------------------------------------------
// Skills & Technologies
// ---------------------------------------------------------------------------

export const skillSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(200).nullable().optional(),
  proficiency: z.number().int().min(0).max(100).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

export const technologySchema = skillSchema.partial().extend({ name: z.string().min(1).max(200) });

// ---------------------------------------------------------------------------
// Certifications, Achievements, Awards, Talks, Services
// ---------------------------------------------------------------------------

const dateOnlyOrNull = () => z.string().nullable().optional();

export const certificationSchema = z.object({
  title: z.string().min(1).max(300),
  issuer: z.string().min(1).max(300),
  dateObtained: dateOnlyOrNull(),
  expirationDate: dateOnlyOrNull(),
  credentialUrl: z.string().url().nullable().optional(),
  credentialId: z.string().max(200).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

export const achievementSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable().optional(),
  date: dateOnlyOrNull(),
  category: z.string().max(200).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

export const awardSchema = z.object({
  title: z.string().min(1).max(300),
  issuer: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  date: dateOnlyOrNull(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

export const talkSchema = z.object({
  title: z.string().min(1).max(300),
  event: z.string().max(300).nullable().optional(),
  date: dateOnlyOrNull(),
  location: z.string().max(300).nullable().optional(),
  url: z.string().url().nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

export const serviceSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable().optional(),
  visibility: visibilitySchema.optional().default('PUBLIC'),
  sortOrder: z.number().int().optional().default(0),
});

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const articleSchema = z.object({
  title: z.string().min(1).max(300),
  slug: slugSchema,
  excerpt: z.string().max(1000).nullable().optional(),
  content: z.string().min(1),
  status: publishStatusSchema.optional().default('DRAFT'),
  publishedAt: optionalDate(),
  scheduledFor: optionalDate(),
  timezone: z.string().max(100).nullable().optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDescription: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  coverImageUrl: z.string().url().nullable().optional(),
  featured: z.boolean().optional().default(false),
});

export const articlePublishSchema = z.object({
  action: z.enum(['PUBLISH', 'UNPUBLISH', 'SCHEDULE']),
  scheduledFor: optionalDate(),
  timezone: z.string().max(100).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const mediaUpdateSchema = z.object({
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  storageClass: z.enum(['PUBLIC', 'PRIVATE', 'ADMIN_ONLY']).optional(),
});

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contactSubmissionSchema = z.object({
  name: z.string().min(1).max(200),
  email: emailSchema,
  subject: z.string().max(300).nullable().optional(),
  message: z.string().min(1).max(5000),
  website: z.string().max(10).optional().default(''), // honeypot
});

export const contactStatusSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']),
});

// ---------------------------------------------------------------------------
// Navigation / settings / SEO
// ---------------------------------------------------------------------------

export const navItemSchema = z.object({
  label: z.string().min(1).max(100),
  href: z.string().min(1).max(300),
  order: z.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
  isExternal: z.boolean().optional().default(false),
});

export const siteSettingSchema = z.object({
  siteName: z.string().min(1).max(200),
  tagline: z.string().max(500).nullable().optional(),
  footerText: z.string().max(500).nullable().optional(),
  theme: z.string().max(50).optional().default('dark'),
  contactEnabled: z.boolean().optional().default(true),
  analyticsEnabled: z.boolean().optional().default(false),
});

export const seoConfigSchema = z.object({
  siteTitle: z.string().min(1).max(300),
  description: z.string().max(1000),
  keywords: z.array(z.string()).optional().default([]),
  ogImageUrl: z.string().url().nullable().optional(),
  twitterHandle: z.string().max(100).nullable().optional(),
  canonicalBaseUrl: z.string().url().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z.string().min(8).max(200),
});

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(200).optional(),
  visibility: visibilitySchema.optional(),
  status: publishStatusSchema.optional(),
  sort: z.string().max(50).optional(),
});