# DevBoard

DevBoard is a narrow MVP Kanban app: multi-user auth, private boards, columns/cards CRUD, card priority editing, and drag-and-drop card movement with PostgreSQL persistence. It is intentionally not a Jira clone.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind + dnd-kit
- Backend: Express + TypeScript + Prisma
- DB: PostgreSQL
- Auth: JWT + bcrypt
- API docs: OpenAPI + Swagger UI

## Live Deployment
- Client: https://devboard-web-9b49.onrender.com
- Swagger UI: https://devboard-lhtz.onrender.com/docs/
- Database: PostgreSQL hosted on Render

## Repository Structure
- `apps/api` - backend API and Prisma schema
- `apps/web` - frontend app
- `docs` - architecture, UML, research, and final delivery report docs

## Quick Start

### Prerequisites
- Node.js 20+
- npm
- Docker Desktop or another Docker Compose-compatible runtime

### 1) Install dependencies
```bash
npm install
```

### 2) Configure env

macOS/Linux/Git Bash:
```bash
cp .env.example .env
```

PowerShell:
```powershell
Copy-Item .env.example .env
```

Set a strong `JWT_SECRET` in the root `.env`. The API reads the root `.env` when run from npm workspaces, and the included Docker Compose file exposes Postgres on host port `5433`, matching `.env.example`.

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

## Render Deployment
The web app uses React Router, so deep links such as `/boards/:boardId` must be
served by `index.html` and handled client-side. The included `render.yaml`
configures the static web service with this rewrite:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

If the existing Render service was created manually instead of from the
Blueprint, add the same rule in the service's Redirects/Rewrites settings.

## Final Submission Materials
See:
- `docs/final-delivery-report.md` - six-section delivery report draft
- `README.md` - setup and demo instructions
- `docs/architecture/*` - architecture notes and trade-offs
- `docs/uml/*` - UML and ERD diagrams

## Manual Demo Checklist
1. Register a new user account.
2. Log in with those credentials.
3. Create a board from the dashboard.
4. Open the board.
5. Verify default columns are created automatically.
6. Create at least three cards.
7. Edit one card description and priority.
8. Drag a card within the same column.
9. Drag a card to another column.
10. Refresh the page and verify card state persists.
11. Log out and log back in, then verify board data still exists.
12. Register a second account and verify it cannot see the first user's boards.

## Known Limitations
- No automated test suite; final verification is manual through the demo checklist.
- No refresh-token flow; authentication uses a single 7-day JWT for the MVP.
- No password reset or account deletion flow.
- No comments, attachments, notifications, invitations, analytics, real-time collaboration, or calendar views.
- Drag-and-drop order updates prioritize correctness and readability over high-scale batch performance.

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
- `docs/final-delivery-report.md`
- `docs/architecture/*`
- `docs/uml/*`
