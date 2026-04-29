import { Router } from 'express';
import { ok } from '../../lib/http.js';
import { createBoardSchema, updateBoardSchema } from './board.schemas.js';
import * as boardService from './board.service.js';

export const boardRouter = Router();

boardRouter.get('/', async (req, res, next) => {
  try {
    const result = await boardService.listBoards(req.user!.sub);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

boardRouter.post('/', async (req, res, next) => {
  try {
    const body = createBoardSchema.parse(req.body);
    const result = await boardService.createBoard(req.user!.sub, body.title);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

boardRouter.get('/:boardId', async (req, res, next) => {
  try {
    const result = await boardService.getBoard(req.user!.sub, req.params.boardId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

boardRouter.patch('/:boardId', async (req, res, next) => {
  try {
    const body = updateBoardSchema.parse(req.body);
    const result = await boardService.updateBoard(req.user!.sub, req.params.boardId, body.title);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

boardRouter.delete('/:boardId', async (req, res, next) => {
  try {
    const result = await boardService.deleteBoard(req.user!.sub, req.params.boardId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});
