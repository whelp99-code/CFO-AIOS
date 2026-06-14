# 노션 MCP 실시간 연동 가이드

## 현재 상태

✅ **CSV 임포트 완료**: 4개 DB → Prisma DB 일괄 삽입 성공
- Project 17건, Invoice 14건, Expense 15건, Cashflow 8건

❌ **실시간 API 연동 미완료**: 노션 Integration이 자식 DB(Inline Database)에 접근 권한 없음
- 에러: `Invalid PageBlock ID`, `external_object_not_available`

## 원인

노션의 **Inline Database**(페이지 안에 임베드된 DB)는 **상위 페이지 공유와 별도로** 각각의 DB에 대해 Integration을 명시적으로 추가해야 접근 가능합니다. Integration은 기본적으로 자신이 추가된 페이지만 읽을 수 있고, 자식 DB는 자동으로 권한이 상속되지 않습니다.

## 해결 방법 (사용자 작업 필요)

### 1단계: 노션에서 Integration 추가

1. https://www.notion.so/profile/integrations 접속
2. 사용 중인 Integration 찾기 (예: `CFO Integration`)
3. **Capabilities** 탭에서 다음이 활성화되어 있는지 확인:
   - Read content ✅
   - Update content ✅
   - Read user information ✅
4. **Access** 탭에서:
   - User capability: No user information, No email
   - workspace capability 또는 page-level capability 설정

### 2단계: 4개 자식 DB에 Integration 추가

CFO 대시보드 페이지(`303367013518802e8ba2cf2829bf77aa`)에 접속한 뒤, 다음 4개 자식 DB 각각에 대해:

| DB 이름 | DB ID |
|---|---|
| 프로젝트 | `30336701-3518-8021-9409-cd1311c7f993` |
| 미수금/입금관리 | `30236701-3518-8038-8055-000b86d1987f` |
| 매입/비용 DB | `30236701-3518-806d-a98c-f696d7cb9402` |
| 자금흐름 DB | `30236701-3518-80b0-a49b-000b18989a09` |

각 DB의 우측 상단 **`•••`** 메뉴 → **`+ Add connections`** → 해당 Integration 선택

### 3단계: 토큰 재발급 + 동기화 실행

Integration의 **Internal Integration Secret**을 새로 발급받고:

```bash
export NOTION_API_KEY="ntn_..."  # 새 토큰
export NOTION_DATABASE_PROJECTS="30336701-3518-8021-9409-cd1311c7f993"
export NOTION_DATABASE_INVOICES="30236701-3518-8038-8055-000b86d1987f"
export NOTION_DATABASE_EXPENSES="30236701-3518-806d-a98c-f696d7cb9402"
export NOTION_DATABASE_CASHFLOWS="30236701-3518-80b0-a49b-000b18989a09"

cd apps/api
npx tsx scripts/migrate-notion-to-cfo.ts
```

성공 시 각 DB 데이터가 Prisma로 실시간 동기화됩니다.

## 현재 작동하는 임포트 (CSV)

권한 문제가 해결되기 전까지는 **CSV 임포트가 가장 안정적**입니다. 이미 1회 실행되어 DB가 채워졌으므로, 노션에 새 데이터를 추가한 뒤에는:

1. 노션 페이지 우측 상단 `•••` → **`Export`** → **`Markdown & CSV`** 선택 → **`Create export`**
2. 다운로드된 ZIP을 `notion-export/` 디렉터리에 압축 해제
3. `NOTION_EXPORT_DIR` 환경변수로 위치를 지정해 다시 실행:

```bash
cd apps/api
NOTION_EXPORT_DIR=/path/to/notion-export \
DATABASE_URL="postgresql://..." \
npx tsx scripts/import-csv-to-prisma.ts
```

> 💡 팁: **노션 export ZIP의 한글 디렉터리명이 macOS unzip에서 깨질 수 있습니다.** 이 경우 `extract-csv.py`로 추출하세요:
> ```bash
> python3 apps/api/scripts/extract-csv.py
> ```
> (스크립트가 자동으로 `cp437 → utf-8` 디코딩 fallback 처리합니다)
