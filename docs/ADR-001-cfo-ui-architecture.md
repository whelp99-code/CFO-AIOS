# ADR-001: CFO UI Architecture — Option A

## Status

Accepted (2026-06-14)

## Context

CFO-AIOS repo contains:

- `apps/api` — NestJS CFO backend with Prisma (complete)
- `apps/web` — Next.js AI Portal depending on missing `@ai-portal/*` packages (107 exports)

The AI Portal and CFO API use **different data models** and product goals.

## Decision

**Option A: CFO dedicated UI** — rewrite `apps/web` to call NestJS API only.

- Do **not** restore `@ai-portal/*` packages in this repo (Option B deferred)
- Single database: CFO Prisma schema via `apps/api`
- BFF proxy: Next.js `/api/cfo/*` → `CFO_API_URL`

## Consequences

- Positive: Aligns with README "AI CFO 비서" goal; simpler monorepo
- Positive: Mac `pnpm install` works without external packages
- Negative: AI Portal features (customers, PoC, automation) removed from this repo
- Migration: Old portal code archived under `apps/web-portal-archive/` reference only

## Alternatives rejected

| Option | Reason |
|--------|--------|
| B — Full monorepo | `@ai-portal/*` source unavailable; 107 exports too large |
| C — API only | Plan requires CFO web UI for 1-person CEO use case |
