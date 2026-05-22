#!/usr/bin/env bash
# wait-for-db.sh
# Polls dev Postgres container until pg_isready succeeds.
# Used internally by Makefile (make dev-up).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.dev.yml"

MAX_SECONDS="${MAX_SECONDS:-30}"

for i in $(seq 1 "${MAX_SECONDS}"); do
  if docker compose -f "${COMPOSE_FILE}" exec -T postgres pg_isready -U medusa -d postgres >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

echo "[wait-for-db] Postgres not ready after ${MAX_SECONDS}s" >&2
echo "[wait-for-db] Check: docker compose -f docker-compose.dev.yml logs postgres" >&2
exit 1
