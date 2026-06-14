#!/usr/bin/env bash
# Mac 로컬 CFO-AI 저장소 동기화 스크립트
# Usage: ./scripts/local-sync.sh

set -euo pipefail

LOCAL_ROOT="${LOCAL_WORKSPACE_PATH:-/Users/jmpark/Documents/Playground/CFO-AI}"

if [[ ! -d "$LOCAL_ROOT/.git" ]]; then
  echo "❌ Git repo not found at: $LOCAL_ROOT"
  echo "   Clone first: git clone https://github.com/whelp99-code/cfo-aios.git \"$LOCAL_ROOT\""
  exit 1
fi

cd "$LOCAL_ROOT"

echo "📍 Workspace: $LOCAL_ROOT"
echo "⬇️  Pulling origin/main..."
git fetch origin
git pull origin main

echo "📦 pnpm install..."
pnpm install

if [[ -f apps/api/prisma/schema.prisma ]]; then
  echo "🗄️  Prisma generate..."
  (cd apps/api && pnpm db:generate)
fi

echo "✅ Local sync complete."
echo ""
echo "Next:"
echo "  cd apps/api && pnpm dev   # http://localhost:4000"
echo "  cd apps/web && pnpm dev   # http://localhost:3000"
