import { Router } from 'express';
import { ok } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body.name, body.email, body.password);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.me(req.user!.sub);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});
