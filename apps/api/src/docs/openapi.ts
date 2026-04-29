import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import type { RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { createBoardSchema, updateBoardSchema } from '../modules/boards/board.schemas.js';
import {
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from '../modules/cards/card.schemas.js';
import { createColumnSchema, updateColumnSchema } from '../modules/columns/column.schemas.js';
import { loginSchema, registerSchema } from '../modules/auth/auth.schemas.js';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const errorResponse = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().optional(),
      message: z.string(),
      details: z.unknown().optional(),
    }),
  })
  .openapi('ErrorResponse');

const userSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string().datetime().optional(),
  })
  .openapi('User');

const authResponse = z
  .object({
    success: z.literal(true),
    data: z.object({
      user: userSchema,
      token: z.string(),
    }),
  })
  .openapi('AuthResponse');

const boardSummary = z
  .object({
    id: z.string(),
    title: z.string(),
    updatedAt: z.string().datetime(),
    _count: z.object({ columns: z.number() }),
  })
  .openapi('BoardSummary');

const cardSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    order: z.number(),
    columnId: z.string(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .openapi('Card');

const columnSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
    boardId: z.string(),
    cards: z.array(cardSchema).optional(),
  })
  .openapi('Column');

const boardDetail = z
  .object({
    id: z.string(),
    title: z.string(),
    ownerId: z.string(),
    columns: z.array(columnSchema),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .openapi('BoardDetail');

const success = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.literal(true),
    data: schema,
  });

const jsonResponse = (description: string, schema: z.ZodTypeAny) => ({
  description,
  content: { 'application/json': { schema } },
});

const errorResponses = {
  400: jsonResponse('Validation or request error', errorResponse),
  401: jsonResponse('Authentication required or token invalid', errorResponse),
  404: jsonResponse('Resource not found', errorResponse),
  429: jsonResponse('Rate limit exceeded', errorResponse),
  500: jsonResponse('Unexpected server error', errorResponse),
};

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: {
    200: jsonResponse(
      'API and database status',
      success(
        z.object({
          status: z.literal('ok'),
          db: z.enum(['ok', 'error']),
          uptime: z.number(),
        }),
      ),
    ),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  summary: 'Register a user',
  request: { body: { content: { 'application/json': { schema: registerSchema } } } },
  responses: { 201: jsonResponse('Registered user and token', authResponse), ...errorResponses },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  summary: 'Login a user',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: { 200: jsonResponse('Authenticated user and token', authResponse), ...errorResponses },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  summary: 'Get current user',
  security: [{ bearerAuth: [] }],
  responses: { 200: jsonResponse('Current user', success(userSchema)), ...errorResponses },
});

registry.registerPath({
  method: 'get',
  path: '/api/boards',
  summary: 'List boards owned by the current user',
  security: [{ bearerAuth: [] }],
  responses: { 200: jsonResponse('Board list', success(z.array(boardSummary))), ...errorResponses },
});

registry.registerPath({
  method: 'post',
  path: '/api/boards',
  summary: 'Create a board',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createBoardSchema } } } },
  responses: { 201: jsonResponse('Created board', success(boardDetail)), ...errorResponses },
});

registry.registerPath({
  method: 'get',
  path: '/api/boards/{boardId}',
  summary: 'Get a board with columns and cards',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string() }) },
  responses: { 200: jsonResponse('Board detail', success(boardDetail)), ...errorResponses },
});

registry.registerPath({
  method: 'patch',
  path: '/api/boards/{boardId}',
  summary: 'Rename a board',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ boardId: z.string() }),
    body: { content: { 'application/json': { schema: updateBoardSchema } } },
  },
  responses: { 200: jsonResponse('Updated board', success(boardDetail)), ...errorResponses },
});

registry.registerPath({
  method: 'delete',
  path: '/api/boards/{boardId}',
  summary: 'Delete a board',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string() }) },
  responses: {
    200: jsonResponse('Deleted board id', success(z.object({ id: z.string() }))),
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/columns',
  summary: 'Create a column',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createColumnSchema } } } },
  responses: { 201: jsonResponse('Created column', success(columnSchema)), ...errorResponses },
});

registry.registerPath({
  method: 'patch',
  path: '/api/columns/{columnId}',
  summary: 'Rename a column',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ columnId: z.string() }),
    body: { content: { 'application/json': { schema: updateColumnSchema } } },
  },
  responses: { 200: jsonResponse('Updated column', success(columnSchema)), ...errorResponses },
});

registry.registerPath({
  method: 'delete',
  path: '/api/columns/{columnId}',
  summary: 'Delete a column',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string() }) },
  responses: {
    200: jsonResponse('Deleted column id', success(z.object({ id: z.string() }))),
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/cards',
  summary: 'Create a card',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createCardSchema } } } },
  responses: { 201: jsonResponse('Created card', success(cardSchema)), ...errorResponses },
});

registry.registerPath({
  method: 'patch',
  path: '/api/cards/{cardId}',
  summary: 'Update a card',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ cardId: z.string() }),
    body: { content: { 'application/json': { schema: updateCardSchema } } },
  },
  responses: { 200: jsonResponse('Updated card', success(cardSchema)), ...errorResponses },
});

registry.registerPath({
  method: 'delete',
  path: '/api/cards/{cardId}',
  summary: 'Delete a card',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ cardId: z.string() }) },
  responses: {
    200: jsonResponse('Deleted card id', success(z.object({ id: z.string() }))),
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/cards/move',
  summary: 'Move a card within its board',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: moveCardSchema } } } },
  responses: { 200: jsonResponse('Moved card', success(cardSchema.nullable())), ...errorResponses },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'DevBoard API',
    version: '1.0.0',
    description: 'API for private user-owned Kanban boards, columns, cards, and card movement.',
  },
});

export const swaggerUiHandlers: RequestHandler[] = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(openApiDocument);
