import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { fail } from '../lib/http.js';
import { logger } from './logger.js';

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, 'Route not found', { code: 'ROUTE_NOT_FOUND' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message, { code: err.code });
  }

  if (err instanceof ZodError) {
    return fail(res, 400, 'Validation failed', {
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
  }

  if (err instanceof Error) {
    logger.error({ err }, 'Unhandled error');
    return fail(res, 500, 'Internal server error');
  }

  logger.error({ err }, 'Unknown error value thrown');
  return fail(res, 500, 'Internal server error');
}
