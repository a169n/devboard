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

## Assignment 4 — MVP Evidence

### MVP Hypothesis Being Tested
"If we build a fast, low-setup Kanban board where a user can register, create a board, add columns and cards, assign priority, move cards between stages, and see changes persist, students, freelancers, solo developers, and very small teams will use it repeatedly — because simplicity and speed matter more to them than enterprise complexity."

### Manual Acceptance Checklist
1. Register a new user account.
2. Log in with those credentials.
3. Create a board from the dashboard.
4. Open the board.
5. See default columns (Todo, In Progress, Done) created automatically.
6. Create at least 3 cards in any column.
7. Set priority (LOW / MEDIUM / HIGH) on one card.
8. Drag one card from one column to another.
9. Refresh the page — verify the card is still in the new column.
10. Log out.
11. Log back in — verify the board and all cards still exist.
12. Register a second account — verify it sees no boards from the first account.

### Intentionally Out of Scope
- Comments, activity feeds, file attachments
- Email notifications or reminders
- Team invitations and role systems
- Analytics dashboards or productivity scoring
- Real-time collaboration
- Calendar or timeline views
- Payments or subscriptions

### Privacy and Security Decisions Implemented
- Passwords hashed with bcrypt (cost factor 10) before storage
- No `passwordHash` field in any API response
- All board/column/card queries scoped to `req.user.sub` — cross-user IDOR prevented by design
- JWT tokens expire after 7 days; 401 on expiry clears token and redirects to login
- Rate limiting: 200 req/15min global, 50 req/15min on auth endpoints
- Data minimisation: only email, name, password hash collected — no phone, location, or tracking
- Boards private by default; no public sharing in MVP

### Product Debt Acknowledged
- Drag-and-drop reordering within a column works but uses a two-phase DB write that is inefficient at scale
- No automated test suite — acceptance is manual
- Auth is single-token (no refresh tokens); a 7-day expiry is a simplification
- Free-tier deployment (Render cold starts) can add perceived latency

### Known Limitations
- No password reset flow
- No account deletion (right to erasure is a known gap)
- No mobile-optimised drag-and-drop (pointer events only)
- The `@@unique([columnId, order])` constraint means bulk reorders require a transaction — concurrent users editing the same board could see conflicts (not relevant for solo/small-team MVP)
