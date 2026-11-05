import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Scheduled publishing (§85, §140.77, §143.37).
 * Runs server-side on an interval so scheduled articles publish whether or not
 * the admin keeps a browser open. A Redis-backed worker can replace this
 * interval without changing the publish transition itself.
 */
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    if (process.env.SCHEDULER_ENABLED === 'false') {
      this.logger.log('Scheduler disabled by configuration');
      return;
    }
    const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000);
    this.timer = setInterval(() => {
      void this.publishDueArticles();
    }, intervalMs);
    // Do not hold the process open solely for the scheduler.
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Publishes every SCHEDULED article whose time has passed. Idempotent. */
  async publishDueArticles(now = new Date()): Promise<number> {
    try {
      const due = await this.prisma.article.findMany({
        where: { status: 'SCHEDULED', scheduledFor: { lte: now } },
        select: { id: true, title: true },
      });

      if (due.length === 0) return 0;

      const result = await this.prisma.article.updateMany({
        where: { id: { in: due.map((a) => a.id) }, status: 'SCHEDULED' },
        data: { status: 'PUBLISHED', publishedAt: now },
      });

      this.logger.log(`Published ${result.count} scheduled article(s)`);
      return result.count;
    } catch (error) {
      // A scheduler failure must never crash the API.
      this.logger.error(`Scheduled publish failed: ${error instanceof Error ? error.message : error}`);
      return 0;
    }
  }
}
