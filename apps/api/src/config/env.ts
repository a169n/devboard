import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const currentDir = dirname(fileURLToPath(import.meta.url));
const envPathCandidates = [
  resolve(process.cwd(), envFile),
  resolve(currentDir, '../../', envFile),
  resolve(currentDir, '../../../../', envFile),
];
const envPath = envPathCandidates.find((candidate) => existsSync(candidate)) ?? envFile;

dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
