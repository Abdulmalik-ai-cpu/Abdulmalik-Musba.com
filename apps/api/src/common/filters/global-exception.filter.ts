import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers[REQUEST_ID_HEADER] ?? undefined;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : (body as { message?: string | string[] })?.message ?? exception.message;

      return response.status(status).json({
        statusCode: status,
        code: (body as { code?: string })?.code ?? 'HTTP_EXCEPTION',
        message: Array.isArray(message) ? message[0] : message,
        details: (body as { details?: unknown })?.details,
        requestId,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.url}: ${
        exception instanceof Error ? exception.message : String(exception)
      }${exception instanceof Error && exception.stack ? `\n${exception.stack}` : ''}`,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}