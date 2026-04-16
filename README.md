# DevBoard

DevBoard is a narrow MVP Kanban app: multi-user auth, private boards, columns/cards CRUD, and drag-and-drop card movement with PostgreSQL persistence.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Express + TypeScript + Prisma
- DB: PostgreSQL
- Auth: JWT + bcrypt
- DnD: dnd-kit

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

## Default seed user
- Email: `demo@devboard.local`
- Password: `password123`

## Useful Commands
```bash
npm run lint
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

## Documentation
See:
- `docs/architecture/*`
- `docs/uml/*`
