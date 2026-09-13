import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequest } from '../common/decorators/current-user.decorator';

/**
 * Bearer-token authentication against the OAuth2-style opaque session store.
 * The session table allows revocation and expiry; login issues these tokens.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = header.slice('Bearer '.length).trim();
    const session = await this.prisma.authSession.findUnique({
      where: { token },
      include: { adminUser: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = session.adminUser;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account disabled');
    }

    request.user = {
      adminUserId: user.id,
      email: user.email,
      role: user.role,
    };

    return true;
  }
}