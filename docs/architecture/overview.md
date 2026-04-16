# DevBoard Architecture Overview

DevBoard is a modular monolith with a React frontend and an Express REST backend. The MVP supports user authentication, board/column/card CRUD, and persistent drag-and-drop card movement.

## Built capabilities
- JWT auth with register/login/me.
- Ownership-scoped board, column, and card APIs.
- Card reorder/move with transactional persistence.
- React UI for auth, dashboard, and board workflows.

## Why this architecture
- Keeps MVP narrow and easy for student teams.
- Clear separation between UI, API, and data layer.
- Stateless backend simplifies deployment.

## Major modules
- `apps/api/src/modules/auth`
- `apps/api/src/modules/boards`
- `apps/api/src/modules/columns`
- `apps/api/src/modules/cards`
- `apps/web/src/features/auth`
- `apps/web/src/features/boards`
