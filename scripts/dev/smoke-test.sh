#!/usr/bin/env bash
# Non-destructive smoke test for the local ARDmag Medusa dev stack.
#
# Preconditions:
#   make dev-up
#   make dev-backend
#   optionally: make dev-storefront
#   tools/medusa-mcp/.env configured, if MCP checks are expected to pass

set -u -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMPOSE_FILE="${REPO_ROOT}/docker-compose.dev.yml"
DB_NAME="${DB:-medusa_dev_clone}"
PG_HOST="${DEV_PG_HOST:-127.0.0.1}"
PG_PORT="${DEV_PG_PORT:-5433}"
PG_USER="${DEV_PG_USER:-medusa}"
PG_PASSWORD="${DEV_PG_PASSWORD:-medusa}"
REDIS_CONTAINER="${REDIS_CONTAINER:-ardmag-dev-redis}"
BACKEND_URL="${MEDUSA_BACKEND_URL:-http://localhost:9000}"
STOREFRONT_URL="${STOREFRONT_URL:-http://localhost:8000}"
ADMIN_EMAIL="${MEDUSA_USERNAME:-dev@ardmag.local}"
ADMIN_PASSWORD="${MEDUSA_PASSWORD:-dev123456}"

export PGPASSWORD="${PG_PASSWORD}"

pass_count=0
fail_count=0

pass() {
  printf '\033[32mPASS\033[0m %s\n' "$*"
  pass_count=$((pass_count + 1))
}

fail() {
  printf '\033[31mFAIL\033[0m %s\n' "$*" >&2
  fail_count=$((fail_count + 1))
}

check() {
  local name="$1"
  shift
  if "$@" >/tmp/ardmag-smoke.out 2>/tmp/ardmag-smoke.err; then
    pass "${name}"
  else
    fail "${name}"
    sed -n '1,8p' /tmp/ardmag-smoke.err >&2
  fi
}

psql_scalar() {
  psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${DB_NAME}" -tAc "$1"
}

http_status() {
  curl -sS -o /tmp/ardmag-smoke-http.out -w '%{http_code}' "$@"
}

check_http_status() {
  local name="$1"
  local expected_prefix="$2"
  shift 2
  local status

  status="$(http_status "$@")"
  if [[ "${status}" == "${expected_prefix}"* ]]; then
    pass "${name}"
  else
    fail "${name} (HTTP ${status})"
    sed -n '1,8p' /tmp/ardmag-smoke-http.out >&2
  fi
}

get_publishable_key() {
  psql_scalar "SELECT token FROM api_key WHERE type='publishable' AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1;"
}

printf 'ARDmag local smoke test\n'
printf 'DB=%s backend=%s storefront=%s\n\n' "${DB_NAME}" "${BACKEND_URL}" "${STOREFRONT_URL}"

check "docker compose postgres is running" \
  bash -c "docker compose -f '${COMPOSE_FILE}' ps --status running --services | grep -qx postgres"

check "docker compose redis is running" \
  bash -c "docker compose -f '${COMPOSE_FILE}' ps --status running --services | grep -qx redis"

check "postgres accepts local connections" \
  psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d postgres -tAc "SELECT 1"

check "redis responds to PING" \
  bash -c "docker exec '${REDIS_CONTAINER}' redis-cli ping | grep -qx PONG"

check "target database exists: ${DB_NAME}" \
  bash -c "psql -h '${PG_HOST}' -p '${PG_PORT}' -U '${PG_USER}' -d postgres -tAc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -qx 1"

check "Medusa core tables are present" \
  bash -c "psql -h '${PG_HOST}' -p '${PG_PORT}' -U '${PG_USER}' -d '${DB_NAME}' -tAc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('product','api_key','customer','user')\" | grep -qx 4"

check "publishable key exists in DB" \
  bash -c "key=\"$(get_publishable_key)\"; [[ \"\${key}\" == pk_* ]]"

PUBLISHABLE_KEY="$(get_publishable_key 2>/dev/null || true)"

if [[ -n "${PUBLISHABLE_KEY}" ]]; then
  check_http_status "store API /store/products accepts DB publishable key" 2 \
    -H "x-publishable-api-key: ${PUBLISHABLE_KEY}" \
    "${BACKEND_URL}/store/products?limit=1"
else
  fail "store API skipped because publishable key is missing"
fi

check_http_status "backend /health returns 2xx" 2 \
  "${BACKEND_URL}/health"

check_http_status "admin emailpass login returns 2xx for ${ADMIN_EMAIL}" 2 \
  -X POST "${BACKEND_URL}/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}"

storefront_status="$(http_status "${STOREFRONT_URL}" 2>/dev/null || true)"
if [[ "${storefront_status}" == 2* || "${storefront_status}" == 3* ]]; then
  pass "storefront responds if running"
else
  fail "storefront responds if running (HTTP ${storefront_status:-curl-failed})"
fi

check "storefront env publishable key is not placeholder" \
  "${REPO_ROOT}/scripts/dev/check-publishable-key-in-storefront.sh"

check "MCP safety guard passes" \
  bash "${REPO_ROOT}/scripts/dev/check-mcp-safety.sh"

check "MCP build entry exists" \
  test -f "${REPO_ROOT}/tools/medusa-mcp/dist/index.js"

if node "${REPO_ROOT}/scripts/dev/probe-mcp-tools.mjs" >/tmp/ardmag-mcp-tools.txt 2>/tmp/ardmag-mcp-tools.err; then
  total="$(awk -F': ' '/^# total:/{print $2}' /tmp/ardmag-mcp-tools.txt | tail -1)"
  if [[ "${total:-0}" =~ ^[0-9]+$ && "${total}" -ge 200 ]]; then
    pass "MCP exposes admin+store tool list (${total} tools)"
  else
    fail "MCP tool count too low (${total:-missing}); admin auth probably failed"
  fi
  grep -q '^AdminGetProducts' /tmp/ardmag-mcp-tools.txt \
    && pass "MCP includes AdminGetProducts" \
    || fail "MCP missing AdminGetProducts"
  grep -q '^GetProducts' /tmp/ardmag-mcp-tools.txt \
    && pass "MCP includes Store GetProducts" \
    || fail "MCP missing Store GetProducts"
else
  fail "MCP tools/list probe failed"
  sed -n '1,12p' /tmp/ardmag-mcp-tools.err >&2
fi

if [[ "${DB_NAME}" == "medusa_dev_clone" ]]; then
  check "sanitized clone has no customer/admin emails from production domains" \
    bash -c "psql -h '${PG_HOST}' -p '${PG_PORT}' -U '${PG_USER}' -d '${DB_NAME}' -tAc \"SELECT COUNT(*) FROM (SELECT email FROM customer UNION ALL SELECT email FROM \\\"user\\\") s WHERE email ~* '(ardmag|arcromdiamonds|aibaza|surcod)\\.(ro|com)$'\" | grep -qx 0"

  check "sanitized clone has no Stripe cus_* account_holder external_id" \
    bash -c "psql -h '${PG_HOST}' -p '${PG_PORT}' -U '${PG_USER}' -d '${DB_NAME}' -tAc \"SELECT COUNT(*) FROM account_holder WHERE external_id LIKE 'cus_%'\" | grep -qx 0"

  check "sanitized clone publishable key is regenerated as pk_dev_*" \
    bash -c "key=\"$(get_publishable_key)\"; [[ \"\${key}\" == pk_dev_* ]]"
else
  pass "sanitized clone checks skipped for DB=${DB_NAME}"
fi

printf '\nSummary: %d passed, %d failed\n' "${pass_count}" "${fail_count}"
[[ "${fail_count}" -eq 0 ]]
