import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { MediaModule } from './media/media.module';
import { ContactModule } from './contact/contact.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 300,
      },
    ]),
    PrismaModule,
    AuditModule,
    StorageModule,
    EmailModule,
    ContactModule,
    AuthModule,
    PublicModule,
    AdminModule,
    MediaModule,
    HealthModule,
    SchedulerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}