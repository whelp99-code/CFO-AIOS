# Phase 3B (AI Portal packages) — Deferred

Per [ADR-001](./ADR-001-cfo-ui-architecture.md), `@ai-portal/*` packages are **not** restored in this repo.

The former AI Portal web depended on 107 exports from missing packages. CFO-AIOS uses `@cfo/web` calling `@cfo/api` instead.

If you need the original AI Portal, recover it from git history before the CFO web rewrite or from a separate repository.
