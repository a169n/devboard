# C4 Level 2 - Container Diagram

```mermaid
flowchart TB
  subgraph Browser
    React[React + Vite + Tailwind UI]
  end

  subgraph Server
    Express[Express TypeScript API]
    Auth[JWT Auth Middleware]
    Features[Boards/Columns/Cards Modules]
    Prisma[Prisma ORM]
  end

  PG[(PostgreSQL)]

  React -->|HTTPS JSON| Express
  Express --> Auth
  Express --> Features
  Features --> Prisma
  Prisma --> PG
```
