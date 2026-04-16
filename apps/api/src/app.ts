import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { boardRouter } from './modules/boards/board.routes.js';
import { cardRouter } from './modules/cards/card.routes.js';
import { columnRouter } from './modules/columns/column.routes.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import { ok } from './lib/http.js';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => ok(res, { status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/boards', requireAuth, boardRouter);
app.use('/api/columns', requireAuth, columnRouter);
app.use('/api/cards', requireAuth, cardRouter);

app.use(notFound);
app.use(errorHandler);
