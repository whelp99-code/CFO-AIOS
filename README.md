# CFO-AIOS

1인기업 대표를 위한 **AI CFO 비서** 플랫폼입니다.
세금계산서 발행, 은행/카드 자동수집, 부가세 신고, 인보이싱, 현금흐름 예측을 하나의 인터페이스에서 자동 처리합니다.

> 한국 세무/금융 환경에 특화되어 있으며 팝빌(세금계산서), CODEF(금융 연동), OpenAI(자동 분류)를 활용합니다.

## 아키텍처

```
.
├── apps/
│   ├── web/    # Next.js 16 (App Router, Turbopack) 프론트엔드
│   └── api/    # NestJS API + Prisma + Notion sync 스크립트
└── packages/   # (선택) 공유 모듈
```

## 빠른 시작

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 데이터베이스 준비

PostgreSQL이 로컬에 실행 중이어야 합니다.

```bash
cd apps/api
cp env.example.txt .env  # DATABASE_URL 등 환경변수 입력
npx prisma generate
npx prisma db push
```

### 3. 개발 서버 실행

```bash
# 터미널 1 (API)
cd apps/api && pnpm dev    # http://localhost:4000

# 터미널 2 (Web)
cd apps/web && pnpm dev    # http://localhost:3000
```

## 노션 데이터 임포트

노션에서 export한 CSV 파일을 Prisma DB에 일괄 삽입할 수 있습니다.

1. 노션에서 CFO 페이지를 Markdown & CSV로 export
2. 압축 해제 후 `notion-export/` 디렉터리에 CSV 배치
3. 실행:

```bash
cd apps/api
npx tsx scripts/import-csv-to-prisma.ts
```

## 제공 모듈

| 모듈 | 상태 | API |
|------|------|-----|
| 대시보드 (KPI / 현금흐름 예측 / 월별 추이) | ✅ | `GET /api/dashboard/{kpi,cashflow-forecast,monthly-trend}` |
| 프로젝트 관리 | ✅ | 노션 1:1 매핑 |
| 인보이스 (미수금) | ✅ | 노션 1:1 매핑 |
| 매입/비용 | ✅ | 노션 1:1 매핑 |
| 자금흐름 | ✅ | 노션 1:1 매핑 |
| 이중부기 원장 | ✅ | `GET /api/ledger/{entries,accounts,trial-balance,pnl}` |
| 부가세 자동 계산 | ✅ | `GET /api/vat/calculate?year&half`, `POST /api/vat/income-tax` |
| 종합소득세 예상 | ✅ | `POST /api/vat/income-tax` |
| 구독 추적 | ✅ | `GET/POST/PATCH/DELETE /api/subscriptions` |
| AI CFO 챗봇 | ✅ | `POST /api/chatbot/chat`, `POST /api/chatbot/sessions/:id/messages` |
| 월 마감 자동화 | ✅ | `GET/POST /api/month-close/:year/:month/{start,complete}` |
| 세금계산서 발행 (팝빌) | 🔌 | `POST /api/popbill/issue` (구조만, API 키 필요) |
| 은행/카드 자동수집 (CODEF) | 🔌 | `POST /api/codef/accounts/connect` (구조만, API 키 필요) |

### 챗봇 사용 예시

```bash
# 자연어 질문
curl -X POST http://localhost:4000/api/chatbot/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"이번 달 매출 얼마야?"}'

# 세션 기반 대화
curl -X POST http://localhost:4000/api/chatbot/sessions -H 'Content-Type: application/json' -d '{}'
curl -X POST http://localhost:4000/api/chatbot/sessions/<id>/messages \
  -H 'Content-Type: application/json' -d '{"content":"미수금 인보이스 보여줘"}'
```

### 부가세 계산 예시

```bash
curl http://localhost:4000/api/vat/calculate?year=2026&half=1
curl -X POST http://localhost:4000/api/vat/income-tax \
  -H 'Content-Type: application/json' -d '{"taxableBase": 50000000}'
```

### 팝빌 세금계산서 발행 (테스트 환경)

```bash
# .env에 POPBILL_LINK_ID, POPBILL_SECRET_KEY, POPBILL_IS_TEST=true, POPBILL_CORP_NUM 설정

# 1) 팝빌 연동 상태 확인
curl http://localhost:4000/api/popbill/status

# 2) 세금계산서 발행 (SELL = 매출)
curl -X POST http://localhost:4000/api/popbill/issue \
  -H 'Content-Type: application/json' \
  -d '{
    "direction": "sales",
    "supplierCorpNum": "1234567890",
    "supplierName": "주식회사 마이컴퍼니",
    "buyerCorpNum": "9876543210",
    "buyerName": "클라이언트",
    "supplyAmount": 1000000,
    "vatAmount": 100000,
    "totalAmount": 1100000,
    "issueDate": "2026-06-14",
    "items": [{"name":"웹 개발","qty":1,"unitPrice":1000000,"amount":1000000}]
  }'

# 3) 사업자등록 상태 조회
curl http://localhost:4000/api/popbill/biz-check/1234567890

# 4) 발행 이력
curl 'http://localhost:4000/api/popbill/history?direction=sales&limit=20'
```

> ⚠️ 팝빌 테스트 환경(`https://test.popbill.com`)에서는 실제 국세청 전송 없이 테스트 발급만 가능합니다.  
> 운영 환경 전환 시 `POPBILL_IS_TEST=false`로 변경 후 공동인증서를 팝빌 콘솔에 등록해야 합니다.

## 환경 변수

`env.example.txt` 참고. 핵심 변수:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NOTION_API_KEY`: 노션 CSV export 후 임포트 시 사용
- `POPBILL_LINK_ID` / `POPBILL_SECRET_KEY` / `POPBILL_IS_TEST` / `POPBILL_CORP_NUM`: 팝빌 API (세금계산서)
- `CODEF_CLIENT_ID` / `CODEF_CLIENT_SECRET`: CODEF API (금융 연동)
- `OPENAI_API_KEY`: OpenAI API

## 라이선스

Private
