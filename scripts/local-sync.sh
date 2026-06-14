#!/usr/bin/env bash
# CFO-AI 저장소 동기화 스크립트
# - Mac 로컬: LOCAL_WORKSPACE_PATH 또는 기본 Mac 경로
# - Cloud Agent VM: 현재 /workspace Git 미러
#
# Usage:
#   ./scripts/local-sync.sh              # Mac 또는 Cloud 자동 감지
#   LOCAL_WORKSPACE_PATH=/path/to/repo ./scripts/local-sync.sh

set -euo pipefail

MAC_DEFAULT="/Users/jmpark/Documents/Playground/CFO-AI"
LOCAL_ROOT="${LOCAL_WORKSPACE_PATH:-$MAC_DEFAULT}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

is_cloud_vm() {
  [[ -d /workspace/.git ]] && [[ "$REPO_ROOT" == /workspace* ]]
}

# git pull 전: 로컬 변경/미추적 파일로 pull이 막히는 경우 정리
prepare_git_pull() {
  if [[ -f pnpm-lock.yaml ]] && ! git ls-files --error-unmatch pnpm-lock.yaml &>/dev/null; then
    echo "⚠️  추적되지 않은 pnpm-lock.yaml 제거 후 pull (원격 lockfile 사용)"
    rm -f pnpm-lock.yaml
  fi

  if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    echo "⚠️  로컬 변경 감지 → stash 후 pull (복구: git stash pop)"
    git stash push -u -m "local-sync auto-stash $(date +%Y%m%d-%H%M%S)" || true
  fi
}

sync_repo() {
  local root="$1"
  cd "$root"

  echo "📍 Workspace: $root"
  prepare_git_pull
  echo "⬇️  Pulling origin/main..."
  git fetch origin
  git pull origin main

  echo "📦 Installing monorepo dependencies..."
  export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  pnpm install

  if [[ -f apps/api/prisma/schema.prisma ]]; then
    echo "🗄️  Prisma generate..."
    (cd apps/api && pnpm db:generate)
  fi

  echo "✅ Sync complete."
  echo ""
  echo "Next (PostgreSQL required for db:push):"
  echo "  cp env.example.txt .env    # set DATABASE_URL, CFO_API_URL"
  echo "  pnpm db:push"
  echo "  pnpm dev                   # api:4000 + web:5555"
}

# 1) 명시 경로에 Git repo가 있으면 사용
if [[ -d "$LOCAL_ROOT/.git" ]]; then
  sync_repo "$LOCAL_ROOT"
  exit 0
fi

# 2) Cloud Agent VM — /workspace 미러 동기화
if is_cloud_vm; then
  echo "ℹ️  Cloud Agent VM에서 실행 중입니다."
  echo "   Mac 경로($LOCAL_ROOT)는 이 환경에 없습니다."
  echo "   → Cloud 미러(/workspace)를 동기화합니다."
  echo ""
  echo "   ⚠️  Mac에서 작업하려면 Mac Terminal.app 또는 Cursor Local 터미널에서 실행하세요:"
  echo "   mkdir -p /Users/jmpark/Documents/Playground"
  echo "   git clone https://github.com/whelp99-code/CFO-AIOS.git /Users/jmpark/Documents/Playground/CFO-AI"
  echo "   cd /Users/jmpark/Documents/Playground/CFO-AI && ./scripts/local-sync.sh"
  echo ""
  sync_repo "$REPO_ROOT"
  exit 0
fi

# 3) 스크립트 기준 repo root에 .git 있으면 사용 (다른 로컬 경로)
if [[ -d "$REPO_ROOT/.git" ]]; then
  echo "ℹ️  $LOCAL_ROOT 에 repo 없음 → 현재 repo 사용: $REPO_ROOT"
  sync_repo "$REPO_ROOT"
  exit 0
fi

# 4) 실패 — Mac 최초 클론 안내
echo "❌ Git repo not found."
echo ""
echo "Mac에서 처음 설정하는 경우 (Terminal.app 또는 Cursor Local 터미널):"
echo ""
echo "  mkdir -p /Users/jmpark/Documents/Playground"
echo "  git clone https://github.com/whelp99-code/CFO-AIOS.git /Users/jmpark/Documents/Playground/CFO-AI"
echo "  cd /Users/jmpark/Documents/Playground/CFO-AI"
echo "  ./scripts/local-sync.sh"
echo ""
echo "이미 다른 경로에 클론했다면:"
echo "  LOCAL_WORKSPACE_PATH=/your/path ./scripts/local-sync.sh"
exit 1
