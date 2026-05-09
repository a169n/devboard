import type { Prisma } from '@prisma/client';
import { badRequest, notFound } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import type { CardPriority } from './card.schemas.js';

async function rewriteCardOrder(tx: Prisma.TransactionClient, columnId: string, cardIds: string[]) {
  for (const [idx, id] of cardIds.entries()) {
    await tx.card.update({ where: { id }, data: { order: idx + 1000 } });
  }
  for (const [idx, id] of cardIds.entries()) {
    await tx.card.update({ where: { id }, data: { order: idx, columnId } });
  }
}

export interface CreateCardData {
  columnId: string;
  title: string;
  description?: string;
  priority?: CardPriority;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  priority?: CardPriority;
}

export interface MoveCardPayload {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export async function createCard(
  userId: string,
  columnId: string,
  data: Omit<CreateCardData, 'columnId'>,
) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { ownerId: userId } },
    select: { id: true },
  });
  if (!column) {
    throw notFound('COLUMN_NOT_FOUND', 'Column not found');
  }

  const maxOrder = await prisma.card.aggregate({
    where: { columnId: column.id },
    _max: { order: true },
  });

  return prisma.card.create({
    data: {
      columnId: column.id,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'MEDIUM',
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
}

export async function updateCard(userId: string, cardId: string, data: UpdateCardData) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, column: { board: { ownerId: userId } } },
    select: { id: true },
  });
  if (!card) {
    throw notFound('CARD_NOT_FOUND', 'Card not found');
  }

  return prisma.card.update({ where: { id: card.id }, data });
}

export async function deleteCard(userId: string, cardId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, column: { board: { ownerId: userId } } },
    select: { id: true, columnId: true },
  });
  if (!card) {
    throw notFound('CARD_NOT_FOUND', 'Card not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.card.delete({ where: { id: card.id } });
    const cards = await tx.card.findMany({
      where: { columnId: card.columnId },
      orderBy: { order: 'asc' },
    });
    await rewriteCardOrder(
      tx,
      card.columnId,
      cards.map((c) => c.id),
    );
  });

  return { id: card.id };
}

export async function moveCard(userId: string, payload: MoveCardPayload) {
  const card = await prisma.card.findFirst({
    where: {
      id: payload.cardId,
      columnId: payload.sourceColumnId,
      column: { board: { ownerId: userId } },
    },
    select: { id: true },
  });
  if (!card) {
    throw notFound('CARD_NOT_FOUND', 'Card not found');
  }

  const sourceColumn = await prisma.column.findFirst({
    where: { id: payload.sourceColumnId, board: { ownerId: userId } },
    select: { id: true, boardId: true },
  });
  const destinationColumn = await prisma.column.findFirst({
    where: { id: payload.destinationColumnId, board: { ownerId: userId } },
    select: { id: true, boardId: true },
  });
  if (!sourceColumn || !destinationColumn) {
    throw notFound('COLUMN_NOT_FOUND', 'Column not found');
  }
  if (sourceColumn.boardId !== destinationColumn.boardId) {
    throw badRequest('INVALID_CARD_MOVE', 'Cards can only move within the same board');
  }

  return prisma.$transaction(async (tx) => {
    const sourceCards = await tx.card.findMany({
      where: { columnId: payload.sourceColumnId },
      orderBy: { order: 'asc' },
    });
    const movedCard = sourceCards.find((c) => c.id === payload.cardId);
    if (!movedCard) {
      throw notFound('CARD_NOT_FOUND', 'Card not found');
    }

    const withoutCard = sourceCards.filter((c) => c.id !== payload.cardId);

    if (payload.sourceColumnId === payload.destinationColumnId) {
      const safeIndex = Math.min(payload.destinationIndex, withoutCard.length);
      withoutCard.splice(safeIndex, 0, movedCard);
      await rewriteCardOrder(
        tx,
        payload.sourceColumnId,
        withoutCard.map((c) => c.id),
      );
      return tx.card.findUnique({ where: { id: payload.cardId } });
    }

    const destinationCards = await tx.card.findMany({
      where: { columnId: payload.destinationColumnId },
      orderBy: { order: 'asc' },
    });
    const safeIndex = Math.min(payload.destinationIndex, destinationCards.length);
    destinationCards.splice(safeIndex, 0, movedCard);

    await rewriteCardOrder(
      tx,
      payload.sourceColumnId,
      withoutCard.map((c) => c.id),
    );
    await rewriteCardOrder(
      tx,
      payload.destinationColumnId,
      destinationCards.map((c) => c.id),
    );

    return tx.card.findUnique({ where: { id: payload.cardId } });
  });
}
