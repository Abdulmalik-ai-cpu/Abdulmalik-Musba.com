/**
 * Central environment configuration with runtime validation.
 * Keeps provider-specific values out of the domain code.
 */

export interface ApiConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  publicOrigin: string;
  adminOrigin: string;
  apiOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  sessionTtlDays: number;
  redisUrl?: string;
  storageEndpoint?: string;
  storageRegion?: string;
  storageBucket?: string;
  storageAccessKey?: string;
  storageSecretKey?: string;
  emailProvider?: 'resend' | 'console' | 'none';
  resendApiKey?: string;
  contactFromEmail?: string;
  contactToEmail?: string;
  analyticsProvider?: 'plausible' | 'none';
  plausibleDomain?: string;
  sentryDsn?: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  corsOrigins: string[];
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) throw new Error(`Invalid integer environment variable: ${name}`);
  return parsed;
}

export function loadApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const nodeEnv = (env.NODE_ENV ?? 'development') as ApiConfig['nodeEnv'];
  const apiOrigin = requireEnv('API_ORIGIN', 'http://localhost:3001');

  const corsOrigins = (env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002').split(',');

  return {
    nodeEnv,
    port: intEnv('PORT', 3001),
    publicOrigin: requireEnv('PUBLIC_ORIGIN', 'http://localhost:3000'),
    adminOrigin: requireEnv('ADMIN_ORIGIN', 'http://localhost:3002'),
    apiOrigin,
    databaseUrl: requireEnv('DATABASE_URL', 'postgresql://portfolio:portfolio_dev_password@localhost:5432/portfolio_dev'),
    jwtSecret: requireEnv('JWT_SECRET', 'development-only-secret-change-me'),
    jwtExpiresIn: requireEnv('JWT_EXPIRES_IN', '7d'),
    sessionTtlDays: intEnv('SESSION_TTL_DAYS', 7),
    redisUrl: env.REDIS_URL,
    storageEndpoint: env.STORAGE_ENDPOINT,
    storageRegion: env.STORAGE_REGION,
    storageBucket: env.STORAGE_BUCKET,
    storageAccessKey: env.STORAGE_ACCESS_KEY,
    storageSecretKey: env.STORAGE_SECRET_KEY,
    emailProvider: (env.EMAIL_PROVIDER ?? 'console') as ApiConfig['emailProvider'],
    resendApiKey: env.RESEND_API_KEY,
    contactFromEmail: env.CONTACT_FROM_EMAIL,
    contactToEmail: env.CONTACT_TO_EMAIL,
    analyticsProvider: (env.ANALYTICS_PROVIDER ?? 'none') as ApiConfig['analyticsProvider'],
    plausibleDomain: env.PLAUSIBLE_DOMAIN,
    sentryDsn: env.SENTRY_DSN,
    rateLimitWindowMs: intEnv('RATE_LIMIT_WINDOW_MS', 60_000),
    rateLimitMax: intEnv('RATE_LIMIT_MAX', 60),
    corsOrigins,
  };
}