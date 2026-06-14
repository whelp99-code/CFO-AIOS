# 로컬 개발 환경 (CFO-AI)

Cloud Agent VM과 Mac 로컬 저장소를 연동하는 가이드입니다.

## 경로

| 환경 | 경로 |
|------|------|
| **로컬 (기본)** | `/Users/jmpark/Documents/Playground/CFO-AI` |
| Cloud Agent VM | `/workspace` (Git 미러) |
| GitHub | `https://github.com/whelp99-code/cfo-aios` |

로컬 Mac이 **작업의 기준**입니다. Cloud Agent는 Git push/pull로만 동기화합니다.

---

## 1. 최초 연동 (Mac에서 1회)

> **주의:** 아래 명령은 **Mac Terminal.app** 또는 **Cursor Desktop → Local 터미널**에서 실행하세요.  
> Cloud Agent 터미널(`workspace $` 프롬프트)에서는 Mac 경로(`/Users/jmpark/...`)에 접근할 수 없습니다.

### A. 저장소가 아직 없는 경우 (처음)

Mac 터미널:

```bash
mkdir -p /Users/jmpark/Documents/Playground
git clone https://github.com/whelp99-code/CFO-AIOS.git /Users/jmpark/Documents/Playground/CFO-AI
cd /Users/jmpark/Documents/Playground/CFO-AI
./scripts/local-sync.sh
cp env.example.txt .env    # DATABASE_URL 입력 (PostgreSQL 필요)
pnpm db:push             # repo root에서
pnpm dev:api             # http://localhost:4000/api
```

> **API만 설치:** `apps/web`은 `@ai-portal/*` 패키지가 없어 현재 workspace에서 제외됩니다. CFO API(`apps/api`)만 사용합니다.

### B. 이미 클론되어 있는 경우

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
git pull origin main
./scripts/local-sync.sh
cp env.example.txt .env    # 최초 1회
pnpm db:push
pnpm dev:api
```

Cursor에서 **File → Open Folder** → `/Users/jmpark/Documents/Playground/CFO-AI` 를 열면 로컬 Agent가 이 경로에서 작업합니다.

---

## 2. Cloud Agent ↔ 로컬 동기화

### Cloud → 로컬 (Agent가 push한 뒤)

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
git pull origin main
pnpm install   # package.json 변경 시
```

### 로컬 → Cloud (로컬에서 작업한 뒤)

```bash
git add -A && git commit -m "your message" && git push origin main
```

Cloud Agent는 다음 턴에서 `git pull`로 반영합니다.

---

## 3. 개발 서버 (CFO API)

PostgreSQL이 로컬에서 실행 중이어야 `pnpm db:push`가 됩니다.

```bash
cd /Users/jmpark/Documents/Playground/CFO-AI
cp env.example.txt .env   # DATABASE_URL=postgresql://...
pnpm db:push
pnpm dev:api              # http://localhost:4000/api
```

Web Portal(`apps/web`)은 `@ai-portal/*` monorepo 패키지가 필요합니다. 현재 repo에는 포함되지 않았습니다.

---

## 4. `packages/` 워크스페이스

`apps/web`은 `@ai-portal/automation`, `@ai-portal/db` 등 **로컬 monorepo 패키지**에 의존합니다.

- 로컬 `CFO-AI/packages/`에 해당 패키지가 있어야 web 빌드가 됩니다.
- GitHub 원격에 `packages/`가 없다면 **로컬에만 있는 패키지는 push하지 말고** `.gitignore` 또는 별도 private repo로 관리하세요.

---

## 5. Cursor Agent를 로컬로 전환

Cloud Agent 대신 **로컬 Agent**를 쓰려면:

1. Cursor Desktop에서 `/Users/jmpark/Documents/Playground/CFO-AI` 폴더 열기
2. Agent/Chat에서 **Local** 모드 선택 (Cloud가 아닌 현재 Mac 워크스페이스)
3. `.cursor/local-workspace.json`이 로컬 경로를 가리키는지 확인

Cloud Agent VM은 Mac 파일시스템에 접근할 수 없습니다. DB, `.env`, `node_modules`는 반드시 로컬에서 실행하세요.

---

## 6. 빠른 동기화 스크립트

```bash
./scripts/local-sync.sh
```

pull + install + prisma generate까지 한 번에 실행합니다.
