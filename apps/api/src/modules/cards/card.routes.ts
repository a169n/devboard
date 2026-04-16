import { Router } from 'express';
import { ok, fail } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';
import { createCardSchema, moveCardSchema, updateCardSchema } from './card.schemas.js';

export const cardRouter = Router();

async function rewriteCardOrder(tx: typeof prisma, columnId: string, cardIds: string[]) {
  for (const [idx, id] of cardIds.entries()) {
    await tx.card.update({ where: { id }, data: { order: idx + 1000 } });
  }
  for (const [idx, id] of cardIds.entries()) {
    await tx.card.update({ where: { id }, data: { order: idx, columnId } });
  }
}

cardRouter.post('/', async (req, res) => {
  const body = createCardSchema.parse(req.body);
  const column = await prisma.column.findFirst({
    where: { id: body.columnId, board: { ownerId: req.user!.sub } },
    select: { id: true },
  });
  if (!column) return fail(res, 404, 'Column not found');

  const maxOrder = await prisma.card.aggregate({ where: { columnId: column.id }, _max: { order: true } });
  const card = await prisma.card.create({
    data: {
      columnId: column.id,
      title: body.title,
      description: body.description,
      priority: body.priority,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return ok(res, card, 201);
});

cardRouter.patch('/:cardId', async (req, res) => {
  const body = updateCardSchema.parse(req.body);
  const card = await prisma.card.findFirst({
    where: { id: req.params.cardId, column: { board: { ownerId: req.user!.sub } } },
    select: { id: true },
  });
  if (!card) return fail(res, 404, 'Card not found');

  const updated = await prisma.card.update({ where: { id: card.id }, data: body });
  return ok(res, updated);
});

cardRouter.delete('/:cardId', async (req, res) => {
  const card = await prisma.card.findFirst({
    where: { id: req.params.cardId, column: { board: { ownerId: req.user!.sub } } },
    select: { id: true, columnId: true },
  });
  if (!card) return fail(res, 404, 'Card not found');

  await prisma.$transaction(async (tx) => {
    await tx.card.delete({ where: { id: card.id } });
    const cards = await tx.card.findMany({ where: { columnId: card.columnId }, orderBy: { order: 'asc' } });
    await rewriteCardOrder(tx as typeof prisma, card.columnId, cards.map((c) => c.id));
  });

  return ok(res, { id: card.id });
});

cardRouter.post('/move', async (req, res) => {
  const body = moveCardSchema.parse(req.body);

  const card = await prisma.card.findFirst({
    where: { id: body.cardId, columnId: body.sourceColumnId, column: { board: { ownerId: req.user!.sub } } },
    select: { id: true },
  });
  if (!card) return fail(res, 404, 'Card not found');

  const sourceColumn = await prisma.column.findFirst({
    where: { id: body.sourceColumnId, board: { ownerId: req.user!.sub } },
    select: { id: true },
  });
  const destinationColumn = await prisma.column.findFirst({
    where: { id: body.destinationColumnId, board: { ownerId: req.user!.sub } },
    select: { id: true },
  });
  if (!sourceColumn || !destinationColumn) return fail(res, 404, 'Column not found');

  const moved = await prisma.$transaction(async (tx) => {
    const sourceCards = await tx.card.findMany({ where: { columnId: body.sourceColumnId }, orderBy: { order: 'asc' } });
    const withoutCard = sourceCards.filter((c) => c.id !== body.cardId);

    if (body.sourceColumnId === body.destinationColumnId) {
      const safeIndex = Math.min(body.destinationIndex, withoutCard.length);
      withoutCard.splice(safeIndex, 0, sourceCards.find((c) => c.id === body.cardId)!);
      await rewriteCardOrder(tx as typeof prisma, body.sourceColumnId, withoutCard.map((c) => c.id));
      return tx.card.findUnique({ where: { id: body.cardId } });
    }

    const destinationCards = await tx.card.findMany({
      where: { columnId: body.destinationColumnId },
      orderBy: { order: 'asc' },
    });
    const safeIndex = Math.min(body.destinationIndex, destinationCards.length);
    destinationCards.splice(safeIndex, 0, sourceCards.find((c) => c.id === body.cardId)!);

    await rewriteCardOrder(tx as typeof prisma, body.sourceColumnId, withoutCard.map((c) => c.id));
    await rewriteCardOrder(tx as typeof prisma, body.destinationColumnId, destinationCards.map((c) => c.id));

    return tx.card.findUnique({ where: { id: body.cardId } });
  });

  return ok(res, moved);
});
