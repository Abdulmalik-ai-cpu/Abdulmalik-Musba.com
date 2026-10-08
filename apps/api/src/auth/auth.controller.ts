import { Body, Controller, Get, HttpCode, Ip, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, changePasswordSchema } from '@portfolio/validation';
import type { AuthenticatedRequest } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(
    @Body(new ZodValidationPipe(loginSchema)) body: { email: string; password: string },
    @Req() req: AuthenticatedRequest,
    @Ip() ip: string,
  ) {
    return this.authService.login(body.email, body.password, ip, req.headers['user-agent']);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.adminUserId);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: AuthenticatedRequest) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
    return this.authService.logout(token);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(changePasswordSchema))
    body: { currentPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(user.adminUserId, body.currentPassword, body.newPassword);
    return { ok: true };
  }
}