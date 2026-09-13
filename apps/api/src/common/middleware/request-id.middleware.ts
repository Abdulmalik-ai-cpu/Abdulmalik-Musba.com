import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const provided = req.headers[REQUEST_ID_HEADER];
    const requestId = (Array.isArray(provided) ? provided[0] : provided) ?? randomUUID();
    req.headers[REQUEST_ID_HEADER] = String(requestId);
    res.setHeader(REQUEST_ID_HEADER, String(requestId));
    next();
  }
}