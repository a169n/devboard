import pino from 'pino';
import { pinoHttp as createHttpLogger } from 'pino-http';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino(
  { level: isDev ? 'debug' : 'info' },
  isDev
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true } })
    : undefined,
);

export const httpLogger = createHttpLogger({ logger });
