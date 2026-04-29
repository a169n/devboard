import { Router } from 'express';
import { ok } from '../../lib/http.js';
import { createColumnSchema, updateColumnSchema } from './column.schemas.js';
import * as columnService from './column.service.js';

export const columnRouter = Router();

columnRouter.post('/', async (req, res, next) => {
  try {
    const body = createColumnSchema.parse(req.body);
    const result = await columnService.createColumn(req.user!.sub, body.boardId, body.title);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

columnRouter.patch('/:columnId', async (req, res, next) => {
  try {
    const body = updateColumnSchema.parse(req.body);
    const result = await columnService.updateColumn(req.user!.sub, req.params.columnId, body.title);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

columnRouter.delete('/:columnId', async (req, res, next) => {
  try {
    const result = await columnService.deleteColumn(req.user!.sub, req.params.columnId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});
