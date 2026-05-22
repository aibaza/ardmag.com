#!/usr/bin/env bash
# check-mcp-safety.sh
#
# Verifica ca tools/medusa-mcp/.env NU contine referinte la productie.
# Refuza orice hostname *.ardmag.ro, *.railway.app, sau chei sk_live_/pk_live_.
#
# Apelat de make dev-mcp-up si make dev-mcp-test inainte de orice operatie.
# Exit 0 = OK. Exit !=0 = FAIL.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/tools/medusa-mcp/.env}"

red()   { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
green() { printf '\033[1;32m%s\033[0m\n' "$*"; }

if [[ ! -f "${ENV_FILE}" ]]; then
  red "[mcp-safety] FAIL: ${ENV_FILE} not found"
  red "[mcp-safety]   Copy from docs/dev-environment.md or create with:"
  red "[mcp-safety]   MEDUSA_BACKEND_URL=http://localhost:9000"
  red "[mcp-safety]   PUBLISHABLE_KEY=<pk_dev_...>"
  red "[mcp-safety]   MEDUSA_USERNAME=dev@ardmag.local"
  red "[mcp-safety]   MEDUSA_PASSWORD=dev123456"
  exit 1
fi

FORBIDDEN='(ardmag\.ro|ardmag\.com|admin\.ardmag|api\.ardmag|railway\.app|\.up\.railway|shinkansen\.proxy\.rlwy|sk_live_|pk_live_)'
if grep -E -- "${FORBIDDEN}" "${ENV_FILE}" >/dev/null 2>&1; then
  red "[mcp-safety] FAIL: ${ENV_FILE} contains production reference(s):"
  grep -E -n -- "${FORBIDDEN}" "${ENV_FILE}" >&2
  exit 2
fi

if ! grep -E '^MEDUSA_BACKEND_URL=https?://(localhost|127\.0\.0\.1):9000' "${ENV_FILE}" >/dev/null 2>&1; then
  red "[mcp-safety] FAIL: MEDUSA_BACKEND_URL must point to localhost:9000"
  red "[mcp-safety]   Current: $(grep '^MEDUSA_BACKEND_URL=' "${ENV_FILE}" || echo "(unset)")"
  exit 3
fi

if grep -E '^MEDUSA_USERNAME=.+@(arcromdiamonds|ardmag|aibaza|surcod)\.(ro|com)' "${ENV_FILE}" >/dev/null 2>&1; then
  red "[mcp-safety] FAIL: MEDUSA_USERNAME looks like a production account"
  grep -E '^MEDUSA_USERNAME=' "${ENV_FILE}" >&2
  exit 4
fi

green "[mcp-safety] OK: ${ENV_FILE} points only at localhost"
