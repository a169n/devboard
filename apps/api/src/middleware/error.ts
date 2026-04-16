import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { fail } from '../lib/http.js';

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, 'Route not found');
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return fail(res, 400, 'Validation failed', err.flatten());
  }

  if (err instanceof Error) {
    return fail(res, 500, err.message);
  }

  return fail(res, 500, 'Unexpected server error');
}
