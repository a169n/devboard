import { z } from 'zod';

export const cardPriorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type CardPriority = (typeof cardPriorityValues)[number];

export const createCardSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(''),
  priority: z.enum(cardPriorityValues).default('MEDIUM'),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(cardPriorityValues).optional(),
});

export const moveCardSchema = z.object({
  cardId: z.string().min(1),
  sourceColumnId: z.string().min(1),
  destinationColumnId: z.string().min(1),
  sourceIndex: z.number().int().min(0),
  destinationIndex: z.number().int().min(0),
});
