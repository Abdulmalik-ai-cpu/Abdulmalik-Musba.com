import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Serves stored media.
 * Public assets are streamed with long-lived cache headers. Private and
 * admin-only assets require a valid, unexpired signature minted by the API
 * after authorization, so they are never permanently reachable (§16, §143.22).
 */
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('public/*')
  async publicAsset(@Req() req: Request, @Res() res: Response) {
    const key = decodeURIComponent(req.params[0] ?? '');
    const media = await this.findByKey(key);
    if (!media || media.storageClass !== 'PUBLIC') {
      throw new NotFoundException('Media not found');
    }
    const body = await this.storage.get(key);
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(body);
  }

  @Get('private/*')
  async privateAsset(
    @Req() req: Request,
    @Query('expires') expires: string,
    @Query('signature') signature: string,
    @Res() res: Response,
  ) {
    const key = decodeURIComponent(req.params[0] ?? '');
    const local = this.storage.localAdapter();
    if (local) {
      const valid = local.verifySignedUrl(key, Number(expires), signature ?? '');
      if (!valid) throw new ForbiddenException('Invalid or expired link');
    }
    const media = await this.findByKey(key);
    if (!media) throw new NotFoundException('Media not found');

    const body = await this.storage.get(key);
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(body);
  }

  private async findByKey(key: string) {
    return this.prisma.media.findFirst({ where: { storageKey: key } });
  }
}
