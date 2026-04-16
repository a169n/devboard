# Component Design

## 1. Auth API Component
- Register/login/current-user endpoints.
- Password hashing and JWT issuance.

## 2. Board Domain Component
- Board CRUD per authenticated owner.
- Returns board details including columns/cards.

## 3. Column/Card Domain Component
- Column CRUD under owned boards.
- Card CRUD, priority updates, and move/reorder logic.

## 4. Frontend Board Workspace Component
- Loads board state.
- Renders Kanban columns/cards.
- Executes optimistic drag/drop interaction with persisted move call.
