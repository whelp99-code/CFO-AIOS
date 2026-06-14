# 로컬 개발 환경 (CFO-AI)

> **Mac Terminal.app** 또는 **Cursor Local**에서 실행하세요. Cloud Agent(`workspace $`)는 Git 미러만 담당합니다.

## 경로

| 환경 | 경로 |
|------|------|
| Mac (기본) | `/Users/jmpark/Documents/Playground/CFO-AI` |
| GitHub | https://github.com/whelp99-code/CFO-AIOS |

## 최초 설정

```bash
mkdir -p /Users/jmpark/Documents/Playground
git clone https://github.com/whelp99-code/CFO-AIOS.git /Users/jmpark/Documents/Playground/CFO-AI
cd /Users/jmpark/Documents/Playground/CFO-AI
./scripts/local-sync.sh
cp env.example.txt .env
pnpm db:push
pnpm dev
```

- API: http://localhost:4000/api
- Web: http://localhost:3000

## 환경 변수 (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cfo_aios?schema=public
CFO_API_URL=http://localhost:4000/api
```

## 노션 CSV import

```bash
NOTION_EXPORT_DIR=/path/to/notion-export pnpm --filter @cfo/api notion:import-csv
```

## 아키텍처

CFO 전용 UI (Option A) — [docs/ADR-001-cfo-ui-architecture.md](./docs/ADR-001-cfo-ui-architecture.md)

AI Portal `@ai-portal/*` packages는 이 repo에 포함되지 않습니다 — [docs/PHASE-3B-DEFERRED.md](./docs/PHASE-3B-DEFERRED.md)
