#!/usr/bin/env bash
# check-publishable-key-in-storefront.sh
# Verifica daca placeholder-ul `pk_REPLACE_ME_AFTER_SEED` mai e in env file.
# Exit 0 daca key-ul e valid. Exit 1 cu instructiuni daca nu.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

FILE_PRIMARY="${REPO_ROOT}/backend-storefront/.env.development.local"
FILE_FALLBACK="${REPO_ROOT}/backend-storefront/.env.development"
FILE_LEGACY="${REPO_ROOT}/backend-storefront/.env.local"

KEY=""
for f in "${FILE_PRIMARY}" "${FILE_FALLBACK}" "${FILE_LEGACY}"; do
  [[ -f "${f}" ]] || continue
  v=$(grep -E '^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=' "${f}" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  if [[ -n "${v}" && "${v}" != "pk_REPLACE_ME_AFTER_SEED" && "${v}" != "pk_..." ]]; then
    KEY="${v}"
    break
  fi
done

if [[ -z "${KEY}" ]]; then
  cat <<EOF >&2
[check-key] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY missing or still placeholder.

  1. make dev-publishable-key
     -> printeaza valoarea actuala din DB-ul dev curent

  2. Paste in: backend-storefront/.env.development

  3. Re-run.
EOF
  exit 1
fi
