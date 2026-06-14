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
- Web: http://localhost:5555

## 환경 변수 (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cfo_aios?schema=public
CFO_API_URL=http://localhost:4000/api
```

## 노션 CSV import

```bash
NOTION_EXPORT_DIR=/path/to/notion-export pnpm --filter @cfo/api notion:import-csv
```

## git pull 실패: pnpm-lock.yaml

로컬에 **추적되지 않은** `pnpm-lock.yaml`이 있으면 pull이 중단됩니다:

```
error: 병합 때문에 추적하지 않는 다음 작업 폴더의 파일을 덮어씁니다: pnpm-lock.yaml
```

**해결 (Mac 터미널):**

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
rm -f pnpm-lock.yaml
git pull origin main
pnpm install
```

또는 `./scripts/local-sync.sh` (자동 정리 후 pull).

## 문제 해결

| 증상 | 해결 |
|------|------|
| 검은/빈 화면 | **http://localhost:5555** 로 접속 (3000 아님) |
| API 연결 실패 | `pnpm dev:api` + PostgreSQL + `pnpm db:push` |
| `pnpm dev`만 실행 | turbo가 api+web 동시 기동 — 터미널 로그 확인 |

```bash
# 터미널 1
pnpm dev:api

# 터미널 2
pnpm dev:web
```

`.env`:
```
CFO_API_URL=http://127.0.0.1:4000/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cfo_aios?schema=public
```

CFO 전용 UI (Option A) — [docs/ADR-001-cfo-ui-architecture.md](./docs/ADR-001-cfo-ui-architecture.md)

AI Portal `@ai-portal/*` packages는 이 repo에 포함되지 않습니다 — [docs/PHASE-3B-DEFERRED.md](./docs/PHASE-3B-DEFERRED.md)
