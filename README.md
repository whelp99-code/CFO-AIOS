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

| 모듈 | 상태 | 비고 |
|------|------|------|
| 대시보드 (KPI) | ✅ | 실시간 매출/지출/순이익/잔고 |
| 프로젝트 관리 | ✅ | 노션 1:1 매핑 |
| 인보이스 (미수금) | ✅ | 노션 1:1 매핑 |
| 매입/비용 | ✅ | 노션 1:1 매핑 |
| 자금흐름 | ✅ | 노션 1:1 매핑 |
| AI CFO 챗봇 | 🚧 | OpenAI Function Calling 연동 예정 |
| 세금계산서 발행 | 🔌 | 팝빌 SDK 구조만, API 키 필요 |
| 은행/카드 자동수집 | 🔌 | CODEF API 구조만, API 키 필요 |
| 부가세 자동신고 | 🚧 | 데이터 수집 완료, 계산 로직 개발 중 |

## 환경 변수

`.env.example` 참고. 핵심 변수:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NOTION_API_KEY`: 노션 CSV export 후 임포트 시 사용
- `POPBILL_LINK_ID` / `POPBILL_SECRET_KEY`: 팝빌 API (세금계산서)
- `CODEF_CLIENT_ID` / `CODEF_CLIENT_SECRET`: CODEF API (금융 연동)
- `OPENAI_API_KEY`: OpenAI API

## 라이선스

Private
