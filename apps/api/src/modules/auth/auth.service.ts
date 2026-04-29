import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { conflict, notFound, unauthorized } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    throw conflict('EMAIL_IN_USE', 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash },
    select: { id: true, name: true, email: true },
  });

  const token = signToken({ id: user.id, email: user.email });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw unauthorized('INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw unauthorized('INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const token = signToken({ id: user.id, email: user.email });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) {
    throw notFound('USER_NOT_FOUND', 'User not found');
  }
  return user;
}
