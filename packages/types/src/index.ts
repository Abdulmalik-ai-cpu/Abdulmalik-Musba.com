/**
 * Shared domain types for the General Personal Portfolio Platform.
 */

export type Visibility = 'PUBLIC' | 'PRIVATE' | 'ARCHIVED';
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
export type PublicationType = 'JOURNAL' | 'CONFERENCE' | 'THESIS' | 'REPORT' | 'BOOK' | 'CHAPTER' | 'OTHER';
export type MediaType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';
export type StorageClass = 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';
export type ContactStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'EXPORT'
  | 'SETTINGS_UPDATE'
  | 'OTHER';

export interface Profile {
  id: string;
  fullName: string;
  displayName: string;
  professionalTitle: string;
  shortIntro: string;
  biography: string;
  longBiography: string | null;
  profileImageUrl: string | null;
  location: string | null;
  nationality: string | null;
  languages: string[];
  email: string | null;
  phone: string | null;
  orcid: string | null;
  googleScholar: string | null;
  github: string | null;
  linkedin: string | null;
  personalDomains: string[];
  externalWebsites: string[];
  cvUrl: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string | null;
  organization: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Research {
  id: string;
  title: string;
  category: string | null;
  summary: string;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  visibility: Visibility;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  status: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  visibility: Visibility;
  sortOrder: number;
  technologies: string[];
}

export interface Publication {
  id: string;
  title: string;
  type: PublicationType;
  authors: string[];
  venue: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  citation: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency: number | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  dateObtained: string | null;
  credentialUrl: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Award {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  date: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Talk {
  id: string;
  title: string;
  event: string | null;
  date: string | null;
  location: string | null;
  url: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: PublishStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  tags: string[];
  coverImageUrl: string | null;
  readingTime: number | null;
  featured: boolean;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface Article extends ArticleSummary {
  content: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string | null;
  altText: string | null;
  caption: string | null;
  type: MediaType;
  storageClass: StorageClass;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
  readAt: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  visibility: Visibility;
  order: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  isExternal: boolean;
}

export interface SiteSetting {
  id: string;
  siteName: string;
  tagline: string | null;
  footerText: string | null;
  theme: string;
  contactEnabled: boolean;
  analyticsEnabled: boolean;
}

export interface SeoConfig {
  id: string;
  siteTitle: string;
  description: string;
  keywords: string[];
  ogImageUrl: string | null;
  twitterHandle: string | null;
  canonicalBaseUrl: string | null;
}

export interface TimelineRecord {
  id: string;
  title: string;
  description: string | null;
  date: string;
  category: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  visibility: Visibility;
  sortOrder: number;
}

export interface DashboardStats {
  educationCount: number;
  experienceCount: number;
  projectCount: number;
  publicationCount: number;
  articleCount: number;
  publishedArticleCount: number;
  skillCount: number;
  newContactCount: number;
  mediaCount: number;
}

export interface AuditRecordSummary {
  id: string;
  adminUserEmail: string | null;
  action: AuditAction;
  entity: string | null;
  entityId: string | null;
  createdAt: string;
  metadata: unknown | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}