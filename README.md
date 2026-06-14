# CFO-AIOS

1인기업 대표를 위한 **AI CFO 비서** 플랫폼입니다.

## Monorepo 구조

```
.
├── apps/
│   ├── api/    @cfo/api   NestJS + Prisma  → :4000/api
│   └── web/    @cfo/web   Next.js CFO UI   → :3000
├── docs/       ADR, architecture decisions
├── package.json
└── pnpm-workspace.yaml
```

## Mac 로컬 빠른 시작

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
git pull origin main
./scripts/local-sync.sh
cp env.example.txt .env   # DATABASE_URL, CFO_API_URL
pnpm db:push
pnpm dev                  # API + Web
```

- API: http://localhost:4000/api
- Web: http://localhost:3000

상세: [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)

## 환경 변수 (repo 루트 `.env`)

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL |
| `CFO_API_URL` | Web → API (`http://localhost:4000/api`) |
| `API_KEY` | (선택) API `X-API-Key` 보호 |
| `OPENAI_API_KEY` | (선택) 챗봇 Function Calling |
| `POPBILL_*` | 세금계산서 |
| `CODEF_*` | 금융 연동 |
| `NOTION_EXPORT_DIR` | CSV import 경로 |

## 주요 API

| 모듈 | 엔드포인트 |
|------|-----------|
| Health | `GET /api/health`, `/api/health/ready` |
| Dashboard | `GET /api/dashboard/kpi`, `cashflow-forecast`, `monthly-trend` |
| Invoices | `GET/POST/PATCH /api/invoices` |
| Expenses | `GET/POST/PATCH /api/expenses` |
| Projects | `GET /api/projects` |
| Cashflows | `GET/POST /api/cashflows` |
| VAT | `GET /api/vat/calculate` |
| Subscriptions | CRUD `/api/subscriptions` |
| Month close | `/api/month-close/*` |
| Chatbot | `POST /api/chatbot/chat` |
| Popbill | `POST /api/popbill/issue` |
| Notion | `GET /api/notion-sync/status`, `POST /api/notion-sync/csv-import` |

## 아키텍처 결정

Option A (CFO 전용 UI): [docs/ADR-001-cfo-ui-architecture.md](./docs/ADR-001-cfo-ui-architecture.md)

## 노션 CSV import

```bash
NOTION_EXPORT_DIR=/path/to/notion-export pnpm --filter @cfo/api notion:import-csv
```

## 라이선스

Private
