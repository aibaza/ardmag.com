#!/usr/bin/env bash
# up.sh
# One-command dev infra bootstrap. Idempotent. Invoked by `make dev-up`.
#
# - Verifica Docker daemon
# - Porneste docker compose (postgres + redis)
# - Asteapta healthchecks
# - Inspecteaza ce DB-uri exista si printeaza pasii urmatori
# - NU porneste backend/storefront (intentionat - trebuie in terminale separate cu HMR)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.dev.yml"

DEV_PG_HOST="${DEV_PG_HOST:-127.0.0.1}"
DEV_PG_PORT="${DEV_PG_PORT:-5433}"
DEV_PG_USER="${DEV_PG_USER:-medusa}"
DEV_PG_PASSWORD="${DEV_PG_PASSWORD:-medusa}"
DB_FRESH="${DB_FRESH:-medusa_dev_fresh}"
DB_CLONE="${DB_CLONE:-medusa_dev_clone}"
REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6380}"

cyan()   { printf '\033[1;36m%s\033[0m\n' "$*"; }
green()  { printf '\033[1;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
red()    { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

cyan "[up] Step 1/5: verify Docker daemon"
if ! docker info >/dev/null 2>&1; then
  red  "[up] Docker daemon not running. Start it (systemctl start docker / Docker Desktop) and retry."
  exit 1
fi

cyan "[up] Step 2/5: docker compose up -d"
docker compose -f "${COMPOSE_FILE}" up -d

cyan "[up] Step 3/5: wait Postgres healthy (max 60s)"
for i in $(seq 1 12); do
  state="$(docker inspect --format='{{.State.Health.Status}}' ardmag-dev-postgres 2>/dev/null || echo missing)"
  if [[ "${state}" == "healthy" ]]; then
    green "[up]   Postgres healthy"
    break
  fi
  if [[ "${i}" == "12" ]]; then
    red  "[up] Postgres not healthy in 60s. Check: docker compose -f docker-compose.dev.yml logs postgres"
    exit 1
  fi
  sleep 5
done

cyan "[up] Step 4/5: wait Redis healthy (max 30s)"
for i in $(seq 1 6); do
  state="$(docker inspect --format='{{.State.Health.Status}}' ardmag-dev-redis 2>/dev/null || echo missing)"
  if [[ "${state}" == "healthy" ]]; then
    green "[up]   Redis healthy"
    break
  fi
  if [[ "${i}" == "6" ]]; then
    red  "[up] Redis not healthy in 30s. Check: docker compose -f docker-compose.dev.yml logs redis"
    exit 1
  fi
  sleep 5
done

cyan "[up] Step 5/5: inspecting available DBs"
export PGPASSWORD="${DEV_PG_PASSWORD}"
FRESH_EXISTS="$(psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${DB_FRESH}'" 2>/dev/null || echo "")"
CLONE_EXISTS="$(psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${DB_CLONE}'" 2>/dev/null || echo "")"

echo ""
green "[up] DEV INFRA READY"
echo ""
echo "  Postgres: ${DEV_PG_HOST}:${DEV_PG_PORT}  user=${DEV_PG_USER}"
echo "  Redis:    ${REDIS_HOST}:${REDIS_PORT}"
echo ""

if [[ "${FRESH_EXISTS}" != "1" && "${CLONE_EXISTS}" != "1" ]]; then
  yellow "[up] Niciun DB dev nu exista inca. Alege:"
  echo "    make dev-seed-fresh   # creeaza DB ${DB_FRESH} cu seed + RO setup + admin user"
  echo "    make dev-clone        # cloneaza prod -> ${DB_CLONE} sanitized"
elif [[ "${FRESH_EXISTS}" == "1" && "${CLONE_EXISTS}" != "1" ]]; then
  green  "[up] DB ${DB_FRESH} exista."
  echo   "  Continua: make dev-backend (terminal A) si make dev-storefront (terminal B)"
elif [[ "${CLONE_EXISTS}" == "1" && "${FRESH_EXISTS}" != "1" ]]; then
  green  "[up] DB ${DB_CLONE} exista."
  echo   "  Continua: make dev-backend (terminal A) si make dev-storefront (terminal B)"
  echo   "  (foloseste DATABASE_URL pentru ${DB_CLONE} in backend/.env.development)"
else
  green  "[up] Ambele DB-uri exista (${DB_FRESH}, ${DB_CLONE})."
  echo   "  Editeaza backend/.env.development -> DATABASE_URL ca sa alegi unul."
  echo   "  Apoi: make dev-backend + make dev-storefront"
fi
echo ""
