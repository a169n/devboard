import { api } from '../../api/client';
import type { BoardDetail, BoardSummary, Priority } from '../../types/models';

export const listBoards = async () => (await api.get('/boards')).data.data as BoardSummary[];

export const createBoard = async (title: string) =>
  (await api.post('/boards', { title })).data.data;

export const updateBoard = async (boardId: string, title: string) =>
  (await api.patch(`/boards/${boardId}`, { title })).data.data;

export const deleteBoard = async (boardId: string) =>
  (await api.delete(`/boards/${boardId}`)).data.data;

export const getBoard = async (boardId: string) =>
  (await api.get(`/boards/${boardId}`)).data.data as BoardDetail;

export const createColumn = async (boardId: string, title: string) =>
  (await api.post('/columns', { boardId, title })).data.data;

export const updateColumn = async (columnId: string, title: string) =>
  (await api.patch(`/columns/${columnId}`, { title })).data.data;

export const deleteColumn = async (columnId: string) =>
  (await api.delete(`/columns/${columnId}`)).data.data;

export const createCard = async (
  columnId: string,
  payload: { title: string; description?: string; priority: Priority },
) => (await api.post('/cards', { columnId, ...payload })).data.data;

export const updateCard = async (
  cardId: string,
  payload: { title?: string; description?: string; priority?: Priority },
) => (await api.patch(`/cards/${cardId}`, payload)).data.data;

export const deleteCard = async (cardId: string) =>
  (await api.delete(`/cards/${cardId}`)).data.data;

export const moveCard = async (payload: {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}) => (await api.post('/cards/move', payload)).data.data;
