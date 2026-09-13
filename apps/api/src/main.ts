import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger({
    log: (msg) => logger.info(msg),
    error: (msg) => logger.error(msg),
    warn: (msg) => logger.warn(msg),
    debug: (msg) => logger.debug(msg),
    verbose: (msg) => logger.debug(msg),
  });

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Abdulmalik Musba — Portfolio API')
    .setDescription('Modular monolith API for the portfolio platform.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  logger.info(`API listening on http://${host}:${port}/api`);
}

void bootstrap();