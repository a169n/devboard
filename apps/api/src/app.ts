import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { boardRouter } from './modules/boards/board.routes.js';
import { cardRouter } from './modules/cards/card.routes.js';
import { columnRouter } from './modules/columns/column.routes.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import { httpLogger } from './middleware/logger.js';
import { globalLimiter, authLimiter } from './middleware/rateLimit.js';
import { ok } from './lib/http.js';
import { prisma } from './lib/prisma.js';
import { openApiDocument, swaggerUiHandlers, swaggerUiSetup } from './docs/openapi.js';

export const app = express();

app.use(httpLogger);
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(globalLimiter);
app.use(express.json());

app.get('/openapi.json', (_req, res) => res.json(openApiDocument));
app.use('/docs', swaggerUiHandlers, swaggerUiSetup);

app.get('/health', async (_req, res, next) => {
  try {
    const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    return ok(res, { status: 'ok', db: dbOk ? 'ok' : 'error', uptime: process.uptime() });
  } catch (err) {
    next(err);
  }
});
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/boards', requireAuth, boardRouter);
app.use('/api/columns', requireAuth, columnRouter);
app.use('/api/cards', requireAuth, cardRouter);

app.use(notFound);
app.use(errorHandler);
