# Agent workspace rules

## Primary workspace (local)

**Canonical development path:**

```
/Users/jmpark/Documents/Playground/CFO-AI
```

- Run installs, dev servers, DB migrations, and tests on the **local Mac path** above.
- The Cloud Agent VM (`/workspace`) is a Git mirror only — do not treat it as the source of truth for `.env`, `node_modules`, or `packages/`.
- Sync via Git: `git pull origin main` (local) ↔ push from Cloud Agent.

## Monorepo layout

```
CFO-AI/
├── apps/
│   ├── api/    # NestJS CFO backend (@cfo/api) — port 4000
│   └── web/    # Next.js portal (@ai-portal/web) — port 3000
├── packages/   # @ai-portal/* workspace packages (local only if not in remote)
├── .env        # repo-root env (DATABASE_URL, API keys)
└── pnpm-workspace.yaml
```

## Local dev commands

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
pnpm install
cp env.example.txt .env   # edit DATABASE_URL etc.

cd apps/api && pnpm db:generate && pnpm db:push && pnpm dev
cd apps/web && pnpm dev
```

## CFO API integration

- Web CFO screens should call `http://localhost:4000/api` (or `CFO_API_URL` from env).
- Notion CSV import: `cd apps/api && pnpm notion:import-csv`

See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for first-time setup and sync steps.
