import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

/**
 * Audit trail for all sensitive admin actions.
 * Persisted to the database so the owner retains a complete history.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    adminUserId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
    before?: unknown;
    after?: unknown;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { adminUserId, action, entity, entityId, before, after, ip, userAgent, metadata } = params;
    return this.prisma.auditLog.create({
      data: {
        adminUserId: adminUserId ?? null,
        action,
        entity,
        entityId,
        before: before === undefined ? undefined : (before as object),
        after: after === undefined ? undefined : (after as object),
        ip,
        userAgent,
        metadata: metadata === undefined ? undefined : (metadata as object),
      },
    });
  }
}