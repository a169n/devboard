import { z } from 'zod';

export const createColumnSchema = z.object({
  boardId: z.string().min(1),
  title: z.string().min(1).max(120),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(120),
});
