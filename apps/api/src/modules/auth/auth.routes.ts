import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ok, fail } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const authRouter = Router();

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
}

authRouter.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return fail(res, 409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email.toLowerCase(), passwordHash },
    select: { id: true, name: true, email: true },
  });

  const token = signToken({ id: user.id, email: user.email });
  return ok(res, { user, token }, 201);
});

authRouter.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) {
    return fail(res, 401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValid) {
    return fail(res, 401, 'Invalid credentials');
  }

  const token = signToken({ id: user.id, email: user.email });
  return ok(res, { user: { id: user.id, name: user.name, email: user.email }, token });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) return fail(res, 404, 'User not found');
  return ok(res, user);
});
