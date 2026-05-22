#!/usr/bin/env bash
# print-publishable-key.sh
# Usage: ./print-publishable-key.sh [db_name]
# Afiseaza cel mai recent publishable key din DB-ul dat.

set -euo pipefail

DB="${1:-medusa_dev_clone}"
DEV_PG_HOST="${DEV_PG_HOST:-127.0.0.1}"
DEV_PG_PORT="${DEV_PG_PORT:-5433}"
DEV_PG_USER="${DEV_PG_USER:-medusa}"
DEV_PG_PASSWORD="${DEV_PG_PASSWORD:-medusa}"

export PGPASSWORD="${DEV_PG_PASSWORD}"

KEY=$(psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d "${DB}" -tAc \
  "SELECT token FROM api_key WHERE type='publishable' AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1;" 2>/dev/null || echo "")

if [[ -z "${KEY}" ]]; then
  echo "[publishable-key] No publishable key in '${DB}'. Run 'make dev-seed-fresh' or 'make dev-clone' first." >&2
  exit 1
fi

cat <<EOF

  Publishable key (DB=${DB}):

    ${KEY}

  Paste in backend-storefront/.env.development:
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${KEY}

EOF
