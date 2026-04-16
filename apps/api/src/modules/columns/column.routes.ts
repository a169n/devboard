import { Router } from 'express';
import { ok, fail } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';
import { createColumnSchema, updateColumnSchema } from './column.schemas.js';

export const columnRouter = Router();

async function rewriteColumnOrder(tx: typeof prisma, boardId: string, columnIds: string[]) {
  for (const [idx, id] of columnIds.entries()) {
    await tx.column.update({ where: { id }, data: { order: idx + 1000 } });
  }
  for (const [idx, id] of columnIds.entries()) {
    await tx.column.update({ where: { id }, data: { order: idx, boardId } });
  }
}

columnRouter.post('/', async (req, res) => {
  const body = createColumnSchema.parse(req.body);
  const board = await prisma.board.findFirst({
    where: { id: body.boardId, ownerId: req.user!.sub },
    select: { id: true },
  });
  if (!board) return fail(res, 404, 'Board not found');

  const maxOrder = await prisma.column.aggregate({
    where: { boardId: board.id },
    _max: { order: true },
  });

  const column = await prisma.column.create({
    data: { boardId: board.id, title: body.title, order: (maxOrder._max.order ?? -1) + 1 },
  });

  return ok(res, column, 201);
});

columnRouter.patch('/:columnId', async (req, res) => {
  const body = updateColumnSchema.parse(req.body);
  const column = await prisma.column.findFirst({
    where: {
      id: req.params.columnId,
      board: { ownerId: req.user!.sub },
    },
    select: { id: true },
  });
  if (!column) return fail(res, 404, 'Column not found');

  const updated = await prisma.column.update({ where: { id: column.id }, data: { title: body.title } });
  return ok(res, updated);
});

columnRouter.delete('/:columnId', async (req, res) => {
  const column = await prisma.column.findFirst({
    where: {
      id: req.params.columnId,
      board: { ownerId: req.user!.sub },
    },
    select: { id: true, boardId: true },
  });
  if (!column) return fail(res, 404, 'Column not found');

  await prisma.$transaction(async (tx) => {
    await tx.column.delete({ where: { id: column.id } });
    const remaining = await tx.column.findMany({
      where: { boardId: column.boardId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await rewriteColumnOrder(tx as typeof prisma, column.boardId, remaining.map((item) => item.id));
  });

  return ok(res, { id: column.id });
});
