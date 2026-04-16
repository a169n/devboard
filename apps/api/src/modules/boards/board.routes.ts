import { Router } from 'express';
import { ok, fail } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';
import { createBoardSchema, updateBoardSchema } from './board.schemas.js';

export const boardRouter = Router();

boardRouter.get('/', async (req, res) => {
  const boards = await prisma.board.findMany({
    where: { ownerId: req.user!.sub },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { columns: true } },
    },
  });
  return ok(res, boards);
});

boardRouter.post('/', async (req, res) => {
  const body = createBoardSchema.parse(req.body);
  const board = await prisma.board.create({
    data: {
      title: body.title,
      ownerId: req.user!.sub,
      columns: {
        create: [
          { title: 'Todo', order: 0 },
          { title: 'In Progress', order: 1 },
          { title: 'Done', order: 2 },
        ],
      },
    },
  });
  return ok(res, board, 201);
});

boardRouter.get('/:boardId', async (req, res) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.boardId, ownerId: req.user!.sub },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: { cards: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!board) return fail(res, 404, 'Board not found');
  return ok(res, board);
});

boardRouter.patch('/:boardId', async (req, res) => {
  const body = updateBoardSchema.parse(req.body);
  const board = await prisma.board.findFirst({
    where: { id: req.params.boardId, ownerId: req.user!.sub },
    select: { id: true },
  });
  if (!board) return fail(res, 404, 'Board not found');

  const updated = await prisma.board.update({ where: { id: board.id }, data: { title: body.title } });
  return ok(res, updated);
});

boardRouter.delete('/:boardId', async (req, res) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.boardId, ownerId: req.user!.sub },
    select: { id: true },
  });
  if (!board) return fail(res, 404, 'Board not found');

  await prisma.board.delete({ where: { id: board.id } });
  return ok(res, { id: board.id });
});
