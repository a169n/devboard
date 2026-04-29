import { notFound } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';

export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { columns: true } },
    },
  });
}

export async function createBoard(userId: string, title: string) {
  return prisma.board.create({
    data: {
      title,
      ownerId: userId,
      columns: {
        create: [
          { title: 'Todo', order: 0 },
          { title: 'In Progress', order: 1 },
          { title: 'Done', order: 2 },
        ],
      },
    },
  });
}

export async function getBoard(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: { cards: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!board) {
    throw notFound('BOARD_NOT_FOUND', 'Board not found');
  }
  return board;
}

export async function updateBoard(userId: string, boardId: string, title: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
    select: { id: true },
  });
  if (!board) {
    throw notFound('BOARD_NOT_FOUND', 'Board not found');
  }

  return prisma.board.update({
    where: { id: board.id },
    data: { title },
  });
}

export async function deleteBoard(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
    select: { id: true },
  });
  if (!board) {
    throw notFound('BOARD_NOT_FOUND', 'Board not found');
  }

  await prisma.board.delete({ where: { id: board.id } });
  return { id: board.id };
}
