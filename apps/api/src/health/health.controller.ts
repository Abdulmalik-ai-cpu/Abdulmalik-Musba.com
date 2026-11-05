import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';

/**
 * Health endpoints (§140.76, §67).
 * `/health/live` proves the process is up. `/health/ready` checks the real
 * dependencies the API needs to serve traffic. Optional integrations are
 * reported but never make readiness fail (§143.41).
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly storage: StorageService,
    private readonly email: EmailService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }

  @Get('live')
  live(): HealthIndicatorResult {
    return { status: { status: 'up' } } as unknown as HealthIndicatorResult;
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }

  /** Non-critical subsystem status for the admin System screen (§67). */
  @Get('status')
  status() {
    return {
      storage: { provider: this.storage.describeProvider(), configured: true },
      email: { provider: this.email.providerName(), configured: this.email.isConfigured() },
    };
  }
}