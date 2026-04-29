import type { Prisma } from '@prisma/client';
import { notFound } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';

async function rewriteColumnOrder(
  tx: Prisma.TransactionClient,
  boardId: string,
  columnIds: string[],
) {
  for (const [idx, id] of columnIds.entries()) {
    await tx.column.update({ where: { id }, data: { order: idx + 1000 } });
  }
  for (const [idx, id] of columnIds.entries()) {
    await tx.column.update({ where: { id }, data: { order: idx, boardId } });
  }
}

export async function createColumn(userId: string, boardId: string, title: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
    select: { id: true },
  });
  if (!board) {
    throw notFound('BOARD_NOT_FOUND', 'Board not found');
  }

  const maxOrder = await prisma.column.aggregate({
    where: { boardId: board.id },
    _max: { order: true },
  });

  return prisma.column.create({
    data: { boardId: board.id, title, order: (maxOrder._max.order ?? -1) + 1 },
  });
}

export async function updateColumn(userId: string, columnId: string, title: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: { ownerId: userId },
    },
    select: { id: true },
  });
  if (!column) {
    throw notFound('COLUMN_NOT_FOUND', 'Column not found');
  }

  return prisma.column.update({
    where: { id: column.id },
    data: { title },
  });
}

export async function deleteColumn(userId: string, columnId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: { ownerId: userId },
    },
    select: { id: true, boardId: true },
  });
  if (!column) {
    throw notFound('COLUMN_NOT_FOUND', 'Column not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.column.delete({ where: { id: column.id } });
    const remaining = await tx.column.findMany({
      where: { boardId: column.boardId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await rewriteColumnOrder(
      tx,
      column.boardId,
      remaining.map((item) => item.id),
    );
  });

  return { id: column.id };
}
