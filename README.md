# DevBoard

DevBoard is a narrow MVP Kanban app: multi-user auth, private boards, columns/cards CRUD, card priority editing, and drag-and-drop card movement with PostgreSQL persistence. It is intentionally not a Jira clone.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind + dnd-kit
- Backend: Express + TypeScript + Prisma
- DB: PostgreSQL
- Auth: JWT + bcrypt
- API docs: OpenAPI + Swagger UI

## Repository Structure
- `apps/api` - backend API and Prisma schema
- `apps/web` - frontend app
- `docs` - architecture and UML docs

## Quick Start

### 1) Install dependencies
```bash
npm install
```

### 2) Configure env
```bash
cp .env.example .env
```

Set a strong `JWT_SECRET` in `.env`.

The included Docker Compose file exposes Postgres on host port `5433`, matching `.env.example`.

### 3) Start database
```bash
npm run db:up
```

### 4) Run migrations and seed
```bash
npm run db:migrate
npm run db:seed
```

### 5) Start apps
```bash
npm run dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`
- Swagger UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/openapi.json`

## Default seed user
- Email: `demo@devboard.local`
- Password: `password123`

## Useful Commands
```bash
npm run lint
npm run lint:fix
npm run format:check
npm run format
npm run build
npm run db:down
npm run db:generate
```

## API Overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/boards`
- `POST/PATCH/DELETE /api/columns`
- `POST/PATCH/DELETE /api/cards`
- `POST /api/cards/move`

All non-auth routes require `Authorization: Bearer <token>`.

API responses use a consistent envelope:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`

## Documentation
See:
- `docs/architecture/*`
- `docs/uml/*`
