import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { fail } from '../lib/http.js';

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, 'Route not found');
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message, undefined, err.code);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten(),
      },
    });
  }

  if (err instanceof Error) {
    return fail(res, 500, err.message);
  }

  return fail(res, 500, 'Unexpected server error');
}
