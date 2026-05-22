#!/usr/bin/env bash
# tools/medusa-mcp-launcher.sh
#
# Wrapper care lanseaza serverul medusa-mcp cu env-ul potrivit.
# Apelat de Claude Code via .claude/settings.json mcpServers.medusa-dev.
#
# De ce wrapper: dotenv.config() in MCP loadeaza .env din process.cwd().
# Claude Code spawneaza din repo root, deci .env nu se gaseste fara cd.
#
# Safety: delegheaza la scripts/dev/check-mcp-safety.sh (sursa unica).
# Asta evita drift intre doua liste de regex-uri.

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MCP_DIR="${SCRIPT_DIR}/medusa-mcp"
SAFETY_SCRIPT="${REPO_ROOT}/scripts/dev/check-mcp-safety.sh"

# Daca lipseste safety script-ul, refuza sa porneasca - regula stricta.
if [[ ! -x "${SAFETY_SCRIPT}" ]]; then
  echo "[mcp-launcher] FAIL: ${SAFETY_SCRIPT} missing or not executable. Refusing to start." >&2
  exit 1
fi

# Ruleaza safety check. Daca pica, abort.
if ! ENV_FILE="${MCP_DIR}/.env" bash "${SAFETY_SCRIPT}"; then
  echo "[mcp-launcher] FAIL: safety check failed. Refusing to start MCP." >&2
  exit 1
fi

cd "${MCP_DIR}"
exec node dist/index.js
