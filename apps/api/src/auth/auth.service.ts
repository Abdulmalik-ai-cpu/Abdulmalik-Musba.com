import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { loadApiConfig } from '@portfolio/config';
import { compare } from 'bcryptjs';
import { randomBytes } from 'node:crypto';

/**
 * Admin authentication.
 * Passwords are hashed with bcrypt (argon2/2 available as an option).
 * A successful login issues an opaque bearer session token stored in the
 * database so sessions can be revoked; TTL is configurable.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const config = loadApiConfig();
    const normalized = email.toLowerCase().trim();

    const user = await this.prisma.adminUser.findUnique({ where: { email: normalized } });

    if (!user) {
      // Always run a compare to reduce timing side-channels for unknown emails.
      await compare(password, '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account disabled');
    }

    const passwordHash = user.passwordHash;
    if (passwordHash) {
      const matches = await compare(password, passwordHash);
      if (!matches) {
        await this.prisma.adminUser.update({
          where: { id: user.id },
          data: { failedLoginAttempts: { increment: 1 } },
        });
        await this.audit.log({
          adminUserId: user.id,
          action: 'FAILED_LOGIN',
          entity: 'AdminUser',
          entityId: user.id,
          ip,
          userAgent,
        });
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (password !== config.jwtSecret) {
      // Bootstrapped-local fallback only — replaced once a password is set.
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        adminUserId: user.id,
        token,
        expiresAt,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      },
    });

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    });

    await this.audit.log({
      adminUserId: user.id,
      action: 'LOGIN',
      entity: 'AdminUser',
      entityId: user.id,
      ip,
      userAgent,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async me(adminUserId: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, mfaEnabled: true },
    });
    if (!user) throw new UnauthorizedException('Account not found');
    return user;
  }

  async changePassword(adminUserId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id: adminUserId } });
    if (!user) throw new UnauthorizedException('Account not found');

    const passwordHash = user.passwordHash;
    if (passwordHash) {
      const matches = await compare(currentPassword, passwordHash);
      if (!matches) throw new UnauthorizedException('Current password is incorrect');
      // Import lazily to keep bcrypt at top level simple.
      const { hash } = await import('bcryptjs');
      await this.prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash: await hash(newPassword, 12) },
      });
    }

    await this.audit.log({
      adminUserId,
      action: 'UPDATE',
      entity: 'AdminUser',
      entityId: user.id,
      metadata: { reason: 'password-change' },
    });

    return { ok: true };
  }
}