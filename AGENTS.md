# Agent workspace rules

## Primary workspace (local)

```
/Users/jmpark/Documents/Playground/CFO-AI
```

## Monorepo

```
CFO-AI/
├── apps/api/   @cfo/api  — NestJS CFO API (:4000)
├── apps/web/   @cfo/web  — Next.js CFO UI (:3000)
└── docs/       ADR-001 (Option A)
```

## Commands

```bash
pnpm install
pnpm db:push        # or pnpm db:migrate with PostgreSQL
pnpm dev            # turbo: api + web
pnpm dev:api
pnpm dev:web
```

Web calls API via `CFO_API_URL` (server) and BFF `/api/cfo/*`.

See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) and [docs/ADR-001-cfo-ui-architecture.md](./docs/ADR-001-cfo-ui-architecture.md).
