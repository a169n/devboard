import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../lib/errors.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('AUTH_REQUIRED', 'Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    req.user = decoded;
    return next();
  } catch {
    return next(unauthorized('TOKEN_INVALID', 'Invalid or expired token'));
  }
}
