import type {
  Achievement,
  Article,
  ArticleSummary,
  AuditRecordSummary,
  Award,
  Certification,
  ContactSubmission,
  DashboardStats,
  Education,
  Experience,
  Media,
  NavItem,
  Paginated,
  Profile,
  Project,
  Publication,
  Research,
  SeoConfig,
  Service,
  SiteSetting,
  Skill,
  SocialLink,
  Talk,
  TimelineRecord,
  Visibility,
} from '@portfolio/types';

/**
 * Typed API client for the portfolio backend.
 * The public web and admin apps both consume these contracts; the API is the
 * only writer and the single source of truth.
 */

export interface ApiErrorShape {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getToken?: () => string | null;
}

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export class ApiClient {
  private baseUrl: string;
  private fetchImpl: typeof fetch;
  private tokenProvider: (() => string | null) | undefined;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.tokenProvider = options.getToken;
  }

  getToken(): string | null {
    return this.tokenProvider?.() ?? null;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>,
    options?: { formData?: FormData; additionalHeaders?: Record<string, string> },
  ): Promise<T> {
    let payload: BodyInit | undefined;
    const headers: Record<string, string> = { ...DEFAULT_HEADERS };

    const token = this.tokenProvider?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    if (options?.formData) {
      payload = options.formData;
      delete headers['Content-Type'];
    } else if (body !== undefined) {
      payload = JSON.stringify(body);
    }

    const response = await this.fetchImpl(this.buildUrl(path, query), {
      method,
      headers: { ...headers, ...options?.additionalHeaders },
      body: payload,
      cache: 'no-store',
    });

    if (!response.ok) {
      let error: ApiErrorShape;
      try {
        error = (await response.json()) as ApiErrorShape;
      } catch {
        error = {
          statusCode: response.status,
          code: 'UNKNOWN_ERROR',
          message: `Request failed with status ${response.status}`,
        };
      }
      throw new ApiError(error.statusCode, error.code, error.message, error.details);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  private get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  private post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  private put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  private delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  // -------------------------------------------------------------------------
  // Public content
  // -------------------------------------------------------------------------

  getPublic = {
    profile: () => this.get<Profile>('/public/profile'),
    education: () => this.get<Education[]>('/public/education'),
    experience: () => this.get<Experience[]>('/public/experience'),
    research: () => this.get<Research[]>('/public/research'),
    projects: () => this.get<Project[]>('/public/projects'),
    project: (id: string) => this.get<Project>(`/public/projects/${id}`),
    publications: () => this.get<Publication[]>('/public/publications'),
    skills: () => this.get<Skill[]>('/public/skills'),
    achievements: () => this.get<Achievement[]>('/public/achievements'),
    awards: () => this.get<Award[]>('/public/awards'),
    certifications: () => this.get<Certification[]>('/public/certifications'),
    talks: () => this.get<Talk[]>('/public/talks'),
    services: () => this.get<Service[]>('/public/services'),
    timeline: () => this.get<TimelineRecord[]>('/public/timeline'),
    articles: () => this.get<ArticleSummary[]>('/public/articles'),
    article: (slug: string) => this.get<Article>(`/public/articles/${slug}`),
    socialLinks: () => this.get<SocialLink[]>('/public/social-links'),
    navigation: () => this.get<NavItem[]>('/public/navigation'),
    settings: () => this.get<SiteSetting>('/public/settings'),
    seo: () => this.get<SeoConfig>('/public/seo'),
    search: (q: string) =>
      this.get<SearchResults>(`/public/search`, { q }),
  };

  // -------------------------------------------------------------------------
  // Contact / public forms
  // -------------------------------------------------------------------------

  contact = {
    submit: (payload: {
      name: string;
      email: string;
      subject?: string | null;
      message: string;
      website?: string;
    }): Promise<{ id: string; received: boolean }> =>
      this.post('/public/contact', { ...payload, website: payload.website ?? '' }),
  };

  // -------------------------------------------------------------------------
  // Authentication (admin)
  // -------------------------------------------------------------------------

  auth = {
    login: (email: string, password: string): Promise<{ token: string; user: AuthUser }> =>
      this.post('/auth/login', { email, password }),
    me: () => this.get<AuthUser>('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      this.post<{ ok: boolean }>('/auth/change-password', { currentPassword, newPassword }),
  };

  // -------------------------------------------------------------------------
  // Admin — dashboard & CRUD
  // -------------------------------------------------------------------------

  admin = {
    dashboard: () => this.get<DashboardStats>('/admin/dashboard/stats'),

    profile: {
      get: () => this.get<Profile>('/admin/profile'),
      update: (payload: Partial<Profile>) => this.patch<Profile>('/admin/profile', payload),
    },

    education: {
      list: () => this.get<Education[]>('/admin/education'),
      create: (payload: unknown) => this.post<Education>('/admin/education', payload),
      update: (id: string, payload: unknown) => this.patch<Education>(`/admin/education/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/education/${id}`),
    },

    experience: {
      list: () => this.get<Experience[]>('/admin/experience'),
      create: (payload: unknown) => this.post<Experience>('/admin/experience', payload),
      update: (id: string, payload: unknown) => this.patch<Experience>(`/admin/experience/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/experience/${id}`),
    },

    research: {
      list: () => this.get<Research[]>('/admin/research'),
      create: (payload: unknown) => this.post<Research>('/admin/research', payload),
      update: (id: string, payload: unknown) => this.patch<Research>(`/admin/research/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/research/${id}`),
    },

    projects: {
      list: () => this.get<Project[]>('/admin/projects'),
      create: (payload: unknown) => this.post<Project>('/admin/projects', payload),
      update: (id: string, payload: unknown) => this.patch<Project>(`/admin/projects/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/projects/${id}`),
    },

    publications: {
      list: () => this.get<Publication[]>('/admin/publications'),
      create: (payload: unknown) => this.post<Publication>('/admin/publications', payload),
      update: (id: string, payload: unknown) => this.patch<Publication>(`/admin/publications/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/publications/${id}`),
    },

    skills: {
      list: () => this.get<Skill[]>('/admin/skills'),
      create: (payload: unknown) => this.post<Skill>('/admin/skills', payload),
      update: (id: string, payload: unknown) => this.patch<Skill>(`/admin/skills/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/skills/${id}`),
    },

    certifications: {
      list: () => this.get<Certification[]>('/admin/certifications'),
      create: (payload: unknown) => this.post<Certification>('/admin/certifications', payload),
      update: (id: string, payload: unknown) => this.patch<Certification>(`/admin/certifications/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/certifications/${id}`),
    },

    achievements: {
      list: () => this.get<Achievement[]>('/admin/achievements'),
      create: (payload: unknown) => this.post<Achievement>('/admin/achievements', payload),
      update: (id: string, payload: unknown) => this.patch<Achievement>(`/admin/achievements/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/achievements/${id}`),
    },

    awards: {
      list: () => this.get<Award[]>('/admin/awards'),
      create: (payload: unknown) => this.post<Award>('/admin/awards', payload),
      update: (id: string, payload: unknown) => this.patch<Award>(`/admin/awards/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/awards/${id}`),
    },

    talks: {
      list: () => this.get<Talk[]>('/admin/talks'),
      create: (payload: unknown) => this.post<Talk>('/admin/talks', payload),
      update: (id: string, payload: unknown) => this.patch<Talk>(`/admin/talks/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/talks/${id}`),
    },

    services: {
      list: () => this.get<Service[]>('/admin/services'),
      create: (payload: unknown) => this.post<Service>('/admin/services', payload),
      update: (id: string, payload: unknown) => this.patch<Service>(`/admin/services/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/services/${id}`),
    },

    articles: {
      list: (query?: { status?: string; search?: string; page?: number; pageSize?: number }) =>
        this.get<Paginated<ArticleSummary>>('/admin/articles', query),
      get: (id: string) => this.get<Article>(`/admin/articles/${id}`),
      create: (payload: unknown) => this.post<Article>('/admin/articles', payload),
      update: (id: string, payload: unknown) => this.patch<Article>(`/admin/articles/${id}`, payload),
      publish: (
        id: string,
        payload: { action: 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE'; scheduledFor?: string | null },
      ) => this.post(`/admin/articles/${id}/publish`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/articles/${id}`),
    },

    timeline: {
      list: () => this.get<TimelineRecord[]>('/admin/timeline'),
      create: (payload: unknown) => this.post<TimelineRecord>('/admin/timeline', payload),
      update: (id: string, payload: unknown) => this.patch<TimelineRecord>(`/admin/timeline/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/timeline/${id}`),
    },

    media: {
      list: () => this.get<Media[]>('/admin/media'),
      upload: (formData: FormData) =>
        this.request<Media>('POST', '/admin/media/upload', undefined, undefined, { formData }),
      update: (id: string, payload: unknown) => this.patch<Media>(`/admin/media/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/media/${id}`),
    },

    contact: {
      list: () => this.get<ContactSubmission[]>('/admin/contact'),
      update: (id: string, payload: unknown) => this.patch<ContactSubmission>(`/admin/contact/${id}`, payload),
      remove: (id: string) => this.delete<{ ok: boolean }>(`/admin/contact/${id}`),
    },

    navigation: {
      get: () => this.get<NavItem[]>('/admin/navigation'),
      update: (items: NavItem[]) => this.put<NavItem[]>('/admin/navigation', { items }),
    },

    settings: {
      get: () => this.get<SiteSetting>('/admin/settings'),
      update: (payload: Partial<SiteSetting>) => this.patch<SiteSetting>('/admin/settings', payload),
    },

    seo: {
      get: () => this.get<SeoConfig>('/admin/seo'),
      update: (payload: Partial<SeoConfig>) => this.patch<SeoConfig>('/admin/seo', payload),
    },

    audit: {
      list: (query?: { page?: number; pageSize?: number; entity?: string }) =>
        this.get<Paginated<AuditRecordSummary>>('/admin/audit', query),
    },
  };

  health = () => this.get<Record<string, unknown>>('/health');
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface SearchResults {
  results: Array<{
    type: 'project' | 'article' | 'publication' | 'research';
    id: string;
    title: string;
    slug?: string | null;
    excerpt?: string | null;
    url: string;
  }>;
  total: number;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

export type { Visibility };