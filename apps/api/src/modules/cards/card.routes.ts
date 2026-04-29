import { Router } from 'express';
import { ok } from '../../lib/http.js';
import { createCardSchema, moveCardSchema, updateCardSchema } from './card.schemas.js';
import * as cardService from './card.service.js';

export const cardRouter = Router();

cardRouter.post('/', async (req, res, next) => {
  try {
    const body = createCardSchema.parse(req.body);
    const result = await cardService.createCard(req.user!.sub, body.columnId, {
      title: body.title,
      description: body.description,
      priority: body.priority,
    });
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

cardRouter.patch('/:cardId', async (req, res, next) => {
  try {
    const body = updateCardSchema.parse(req.body);
    const result = await cardService.updateCard(req.user!.sub, req.params.cardId, body);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

cardRouter.delete('/:cardId', async (req, res, next) => {
  try {
    const result = await cardService.deleteCard(req.user!.sub, req.params.cardId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

cardRouter.post('/move', async (req, res, next) => {
  try {
    const body = moveCardSchema.parse(req.body);
    const result = await cardService.moveCard(req.user!.sub, body);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});
