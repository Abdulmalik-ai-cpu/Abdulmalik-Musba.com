import { BadRequestException, createParamDecorator, ExecutionContext, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import type { Request } from 'express';

/**
 * Pipe that validates the request body (or a named property) against a Zod schema.
 * Used alongside class-validator for admin DTOs. Throws 400 with a readable message.
 */
export function ZodBody<T>(schema: ZodSchema<T>): ParameterDecorator {
  return createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
      return schema.parse(ctx.switchToHttp().getRequest<Request>().body);
    },
  )();
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema<any>) {}

  transform(value: unknown): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const first = error.errors[0];
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw error;
    }
  }
}