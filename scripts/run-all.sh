#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Repo root: $REPO_ROOT"

# 1) Build backend (Maven)
echo "[1/4] Building backend (Maven)"
pushd "$REPO_ROOT/backend" >/dev/null
mvn -DskipTests clean package
popd >/dev/null

# 2) Run backend in background
echo "[2/4] Starting backend (Spring Boot)"
pushd "$REPO_ROOT/backend" >/dev/null
mvn -DskipTests spring-boot:run &
BACKEND_PID=$!
popd >/dev/null
echo "Backend PID: $BACKEND_PID"

# 3) Build frontend
echo "[3/4] Installing and building frontend"
pushd "$REPO_ROOT/frontend" >/dev/null
npm install
npm run build
popd >/dev/null

# 4) Run frontend (web dev server)
echo "[4/4] Starting frontend dev server (npm run web)"
pushd "$REPO_ROOT/frontend" >/dev/null
npm run web
FRONTEND_EXIT=$?
popd >/dev/null

echo "Stopping backend (PID: $BACKEND_PID)"
kill "$BACKEND_PID" 2>/dev/null || true

exit "$FRONTEND_EXIT"


