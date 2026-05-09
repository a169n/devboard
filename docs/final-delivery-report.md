# DevBoard Final Delivery Report

## Section 1 - Product Summary

The product name is DevBoard. It addresses the problem of managing personal or small-team tasks visually without the setup cost and complexity of larger project-management tools. The primary user is a student, freelancer, solo developer, or very small team member who needs private Kanban boards, columns, cards, priorities, and persistent drag-and-drop task movement.

## Section 2 - Requirements Delivery

| ID | Requirement | Type | Final Status | Evidence / Note | Sprint |
| --- | --- | --- | --- | --- | --- |
| FR-01 | Register a new account using a unique email and password. | Functional | Implemented | API registration, bcrypt password hashing, duplicate-email handling, and registration UI are implemented. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S1 |
| FR-02 | Authenticate users and issue JWT for protected requests. | Functional | Implemented | Login returns a JWT; protected requests use bearer auth; invalid sessions are cleared on the client. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S1 |
| FR-03 | Create, edit, and delete boards. | Functional | Implemented | Board CRUD endpoints and dashboard create, rename, and delete controls are implemented. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S2 |
| FR-04 | Create, edit, and delete columns within a board. | Functional | Implemented | Column CRUD endpoints and board-page column controls are implemented. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S2 |
| FR-05 | Create, edit, and delete task cards within a column. | Functional | Implemented | Card CRUD endpoints and card create, edit, and delete dialogs are implemented. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S2 |
| FR-06 | Update card description and priority value. | Functional | Implemented | Card editing supports title, description, and LOW/MEDIUM/HIGH priority. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S3 |
| FR-07 | Reorder cards within the same column. | Functional | Implemented | Same-column drag-and-drop reorder is handled through the card move endpoint and persisted order updates. Evidence: [68f4ba3](https://github.com/a169n/devboard/commit/68f4ba373f8a1d078cf404d15abbb24c42d0e249). | S3 |
| FR-08 | Move cards between columns using drag-and-drop. | Functional | Implemented | Cross-column drag-and-drop uses the board UI and `POST /api/cards/move`, then persists the new column/order. Evidence: [68f4ba3](https://github.com/a169n/devboard/commit/68f4ba373f8a1d078cf404d15abbb24c42d0e249). | S3 |
| FR-09 | Store and retrieve user-specific boards, columns, and cards. | Functional | Implemented | PostgreSQL and Prisma persist users, boards, columns, and cards; board loading retrieves nested columns/cards for the signed-in owner. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S1-S2 |
| FR-10 | Restrict access to data owned by the authenticated user. | Functional | Implemented | Board, column, and card queries are scoped to the authenticated user before reads, updates, deletes, and moves. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S3 |
| FR-11 | Validate incoming request data before database changes. | Functional | Implemented | Zod schemas validate auth, board, column, card, and card-move payloads before service logic runs. Evidence: [0e8df67](https://github.com/a169n/devboard/commit/0e8df678c3046e79cc696c01263ec4d46d5abb1f). | S3 |
| FR-12 | Return updated task or board state after successful mutations. | Functional | Implemented | API responses use a consistent success envelope and return created/updated resources or deleted IDs. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S3 |
| NFR-01 | Initial dashboard loading time should stay under 2 seconds. | Non-functional | Partial | Small board-summary payloads and React loading states are implemented. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). Missing: final timing screenshot or browser performance recording. | S4 |
| NFR-02 | Typical CRUD API response time should be about 300 ms or less. | Non-functional | Partial | Direct Prisma CRUD queries and relationship indexes support fast responses. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). Missing: benchmark screenshot. | S4 |
| NFR-03 | Visible card-move feedback should appear within 1 second. | Non-functional | Implemented | Drag overlay and sortable card movement provide immediate visual feedback. Evidence: [68f4ba3](https://github.com/a169n/devboard/commit/68f4ba373f8a1d078cf404d15abbb24c42d0e249). | S3 |
| NFR-04 | A first-time user should complete the basic flow without training. | Non-functional | Partial | UI labels, dialogs, loading states, and error toasts were polished. Evidence: [aea40e0](https://github.com/a169n/devboard/commit/aea40e0224d790548732a540d658cea910331342). Missing: documented external user observation or quote. | S4 |
| NFR-05 | Labels, states, and action buttons must remain consistent and uncluttered. | Non-functional | Implemented | Shared UI components and consistent board/card controls are implemented. Evidence: [aea40e0](https://github.com/a169n/devboard/commit/aea40e0224d790548732a540d658cea910331342). | S4 |
| NFR-06 | Passwords must be hashed before storage using bcrypt. | Non-functional | Implemented | Registration stores a bcrypt hash and API user responses do not expose `passwordHash`. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S1 |
| NFR-07 | All protected endpoints must require JWT-based authorization. | Non-functional | Implemented | Board, column, card, and current-user routes require JWT authorization. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S1 |
| NFR-08 | Users must not view or modify another user's data. | Non-functional | Implemented | Services verify owner-scoped access before returning or mutating board, column, and card data. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). | S3 |
| NFR-09 | Committed changes must persist between sessions. | Non-functional | Implemented | PostgreSQL persistence supports refresh, logout/login, and seeded demo data. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8), [4645620](https://github.com/a169n/devboard/commit/46456209df404263f9ed746a68e47c90dbafcfdb). | S2-S4 |
| NFR-10 | Invalid input or failed requests should return clear errors without crashes. | Non-functional | Implemented | Central error handling returns consistent validation, auth, not-found, rate-limit, and server-error responses. Evidence: [0e8df67](https://github.com/a169n/devboard/commit/0e8df678c3046e79cc696c01263ec4d46d5abb1f). | S4 |
| NFR-11 | The system should support moderate growth without major degradation. | Non-functional | Partial | Schema indexes and stateless API design support moderate growth. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8). Missing: large-dataset performance evidence. | S4 |
| NFR-12 | Backend should remain stateless for future scaling. | Non-functional | Implemented | The backend uses JWT bearer tokens and does not store server-side session state. Evidence: [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8), [df74f97](https://github.com/a169n/devboard/commit/df74f97a0f1ed83c9d38412fae82d7e7b0070e48). | S1-S4 |

Out of 24 carried-forward requirements, 20 are fully implemented, 4 are partially implemented, and 0 are descoped. The unmet requirements are evidence gaps for non-functional qualities, not missing core MVP behavior: timing, usability observation, and moderate-growth proof still need final screenshots or recorded observations.

## Section 3 - MVP Hypothesis Outcome

| Question | Your Answer |
| --- | --- |
| State the original hypothesis from Assignment 4 | "If we build a fast, low-setup Kanban board where a user can register, create a board, add columns and cards, assign priority, move cards between stages, and see changes persist, students, freelancers, solo developers, and very small teams will use it repeatedly - because simplicity and speed matter more to them than enterprise complexity." |
| What evidence supports it? | Product evidence: the implemented workflow is supported by [aac06cc](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8), with drag-and-drop hardening in [68f4ba3](https://github.com/a169n/devboard/commit/68f4ba373f8a1d078cf404d15abbb24c42d0e249). Final validation still requires external user evidence, such as a tester quote, usage observation, or short user-test result from someone outside friends/family. |
| What did not validate? | The MVP does not yet prove repeated use over multiple days. It also does not validate team collaboration because invitations, roles, comments, and real-time updates were intentionally outside the MVP. |
| What changed as a result? | The team kept the MVP focused on the private personal-board workflow and did not add comments, attachments, analytics, invitations, or notifications because those features did not test the core low-setup Kanban hypothesis. |

## Section 4 - Development Process

| Item | What to include |
| --- | --- |
| Methodology | Scrum was chosen in Assignment 2. In practice, the work was divided into sprint-like phases for authentication/setup, CRUD, drag-and-drop/access control, and final UI/documentation polish. |
| Github | Commit history: https://github.com/a169n/devboard/commits/main/. The history shows work across multiple dates, including [2026-04-16 initial MVP implementation](https://github.com/a169n/devboard/commit/aac06cce7c635578a70c28e141c320e1aea16ac8), [2026-04-29 drag-and-drop/UI hardening](https://github.com/a169n/devboard/commit/68f4ba373f8a1d078cf404d15abbb24c42d0e249), and [2026-04-29 final UI polish](https://github.com/a169n/devboard/commit/aea40e0224d790548732a540d658cea910331342). |
| Ceremonies/artefacts | Sprint planning was represented by the Assignment 1 traceability matrix and sprint allocation. Sprint review was represented by manual acceptance testing. A lightweight retrospective appears in the README known limitations notes. |
| What you learned | Scrum helped separate risky work such as auth, persistence, and drag-and-drop into smaller deliverable increments. Next time, automated tests should be added earlier for access control and card-order persistence. |

## Section 5 - Theory in Practice

| Item | Required content |
| --- | --- |
| Concept | Ken Schwaber and Jeff Sutherland, *The Scrum Guide* (2020), Increment, Scrum Guide section "Increment". |
| Where it appeared | The specific project decision was to finish one usable increment - registration, login, board/column/card CRUD, priority editing, drag-and-drop, and persistence - instead of adding wider collaboration features. |
| Outcome | Applying the increment concept helped because the final product can be inspected through a complete live workflow. The cost was reduced feature breadth: comments, attachments, analytics, invitations, and notifications were left out. |

## Section 6 - Architecture Delta

| Component / Decision | Original Design | Final Implementation |
| --- | --- | --- |
| Authentication token model | Earlier component text mentioned JWT access control with refresh tokens. | The final implementation uses a single 7-day JWT bearer token. This kept the backend stateless and simpler for the MVP, but token revocation remains coarse-grained. |
| Deployment evidence | Earlier planning expected free-tier hosting such as Vercel or Render. | The final project is deployed on Render: client at https://devboard-web-9b49.onrender.com, Swagger UI/API docs at https://devboard-lhtz.onrender.com/docs/, and PostgreSQL hosted on Render. |
| Testing strategy | Earlier requirements mentioned regression, invalid-input, access-control, and performance tests. | The final project relies on manual acceptance testing plus build/lint checks. This is acceptable for the demo but remains engineering debt. |
