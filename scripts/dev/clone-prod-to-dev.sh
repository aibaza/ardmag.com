#!/usr/bin/env bash
# clone-prod-to-dev.sh
#
# Cloneaza Railway production Postgres -> local Docker Postgres, apoi sanitizeaza.
#
# - NU sterge niciodata vreun DB. Nu contine DROP DATABASE.
# - Daca DB-ul tinta exista, pg_restore foloseste --clean --if-exists pentru
#   a re-crea OBIECTELE in interior (tables, sequences). DB-ul ramane.
# - User-ul tipeaza manual `DROP DATABASE` daca vrea wipe complet.
#
# Preconditii (manual, o singura data per masina):
#   railway login
#   cd backend && railway link  (deja facut)
#   docker compose -f docker-compose.dev.yml up -d  (sau `make dev-up`)
#
# Env vars (toate au default-uri):
#   DEV_PG_HOST=127.0.0.1
#   DEV_PG_PORT=5433
#   DEV_PG_USER=medusa
#   DEV_PG_PASSWORD=medusa
#   DEV_DB_NAME=medusa_dev_clone
#   DUMP_DIR=./tmp/db-dumps
#   DUMP_MIN_BYTES=102400
#   RAILWAY_SERVICE=Postgres
#   SANITIZE=1   (set to 0 to skip sanitize - DB ramane cu PII real, NU FOLOSI)
#   KEEP_PROD_DUMP=0  (set to 1 ca sa pastrezi dump-ul .dump pe disc dupa succes)
#   RESTORE_ALLOW_MISSING_NEWSLETTER=1  (singura eroare pg_restore tolerata)

set -euo pipefail
umask 077   # fisiere noi (inclusiv dump-ul) au permisiuni 600/700, NU world-readable

DEV_PG_HOST="${DEV_PG_HOST:-127.0.0.1}"
DEV_PG_PORT="${DEV_PG_PORT:-5433}"
DEV_PG_USER="${DEV_PG_USER:-medusa}"
DEV_PG_PASSWORD="${DEV_PG_PASSWORD:-medusa}"
DEV_DB_NAME="${DEV_DB_NAME:-medusa_dev_clone}"
DUMP_DIR="${DUMP_DIR:-./tmp/db-dumps}"
DUMP_MIN_BYTES="${DUMP_MIN_BYTES:-102400}"
RAILWAY_SERVICE="${RAILWAY_SERVICE:-Postgres}"
SANITIZE="${SANITIZE:-1}"
KEEP_PROD_DUMP="${KEEP_PROD_DUMP:-0}"
RESTORE_ALLOW_MISSING_NEWSLETTER="${RESTORE_ALLOW_MISSING_NEWSLETTER:-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SANITIZE_SQL="${SCRIPT_DIR}/sanitize-clone.sql"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.dev.yml"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DUMP_FILE="${DUMP_DIR}/ardmag-prod-${TIMESTAMP}.dump"
DUMP_LOG="${DUMP_FILE}.log"
RESTORE_LOG="${DUMP_FILE}.restore.log"

log()    { printf '\033[1;36m[clone]\033[0m %s\n' "$*"; }
warn()   { printf '\033[1;33m[clone]\033[0m %s\n' "$*" >&2; }
err()    { printf '\033[1;31m[clone]\033[0m %s\n' "$*" >&2; exit 1; }
green()  { printf '\033[1;32m[clone]\033[0m %s\n' "$*"; }

# ---- Tool checks ----
command -v railway     >/dev/null 2>&1 || err "railway CLI not found. Install + 'railway login'."
command -v docker      >/dev/null 2>&1 || err "docker not found."
command -v psql        >/dev/null 2>&1 || err "psql client not found."
command -v pg_dump     >/dev/null 2>&1 || err "pg_dump not found."
command -v pg_restore  >/dev/null 2>&1 || err "pg_restore not found."
command -v python3     >/dev/null 2>&1 || err "python3 not found (used for JSON parsing)."

# ---- Container check ----
if ! docker compose -f "${COMPOSE_FILE}" ps --status running --services 2>/dev/null | grep -q '^postgres$'; then
  err "Container postgres nu ruleaza. Da intai: make dev-up"
fi

# ---- Connectivity check ----
export PGPASSWORD="${DEV_PG_PASSWORD}"
if ! psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d postgres -tAc 'SELECT 1' >/dev/null 2>&1; then
  err "Nu pot conecta la dev PG ${DEV_PG_HOST}:${DEV_PG_PORT} ca ${DEV_PG_USER}."
fi

# ---- Step 1: dump prod via Railway ----
log "Step 1/5: extract DATABASE_PUBLIC_URL din Railway (service: ${RAILWAY_SERVICE})"
mkdir -p "${DUMP_DIR}"
chmod 700 "${DUMP_DIR}"   # PII protection - dir-ul nu e world-readable

pushd "${REPO_ROOT}/backend" >/dev/null

# Best-effort save current linked service ca sa-l restauram
PREV_SERVICE="$(railway status --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('serviceName',''))" 2>/dev/null || echo "")"

# Switch to Postgres service for variable extraction
railway service "${RAILWAY_SERVICE}" >/dev/null 2>&1 || true

PROD_URL="$(railway variables --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('DATABASE_PUBLIC_URL', d.get('DATABASE_URL','')))" 2>/dev/null || echo "")"

# Restore previous service link (best-effort)
if [[ -n "${PREV_SERVICE}" ]]; then
  railway service "${PREV_SERVICE}" >/dev/null 2>&1 || true
fi

popd >/dev/null

if [[ -z "${PROD_URL}" ]]; then
  err "Nu am gasit DATABASE_PUBLIC_URL. Verifica: cd backend && railway service ${RAILWAY_SERVICE} && railway variables"
fi
green "  Got DATABASE_PUBLIC_URL"

log "Step 2/5: pg_dump -> ${DUMP_FILE}"
# --format=custom (-Fc): compresat, restore-able cu pg_restore selectiv si paralel.
# --no-owner --no-acl: la restore in dev nu setam ownership/grants pentru roluri prod.
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --no-acl \
  --verbose \
  --file="${DUMP_FILE}" \
  "${PROD_URL}" 2> "${DUMP_LOG}"

DUMP_SIZE="$(stat -c%s "${DUMP_FILE}" 2>/dev/null || stat -f%z "${DUMP_FILE}")"
if [[ "${DUMP_SIZE}" -lt "${DUMP_MIN_BYTES}" ]]; then
  err "Dump prea mic: ${DUMP_SIZE} bytes (minim ${DUMP_MIN_BYTES}). Vezi ${DUMP_LOG}"
fi
green "  Dump OK: ${DUMP_SIZE} bytes"

# ---- Step 3: ensure target DB exists (NICIODATA drop) ----
log "Step 3/5: verific daca DB ${DEV_DB_NAME} exista (NU dropez nimic)"
DB_EXISTS="$(psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${DEV_DB_NAME}'" || echo "")"

if [[ "${DB_EXISTS}" != "1" ]]; then
  log "  Creez DB ${DEV_DB_NAME}"
  psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d postgres \
    -c "CREATE DATABASE \"${DEV_DB_NAME}\" WITH OWNER \"${DEV_PG_USER}\" ENCODING 'UTF8' TEMPLATE template0;"
else
  warn "DB ${DEV_DB_NAME} exista deja. pg_restore va folosi --clean --if-exists pe obiectele interne."
  warn "Daca vrei restore complet curat: tip manual:"
  warn "  PGPASSWORD=${DEV_PG_PASSWORD} psql -h ${DEV_PG_HOST} -p ${DEV_PG_PORT} -U ${DEV_PG_USER} -d postgres -c 'DROP DATABASE \"${DEV_DB_NAME}\"'"
fi

# ---- Step 4: restore (FAIL-FAST cu whitelist explicit) ----
log "Step 4/5: pg_restore -> ${DEV_DB_NAME}"

RESTORE_EXIT_CODE=0
pg_restore \
  --host="${DEV_PG_HOST}" \
  --port="${DEV_PG_PORT}" \
  --username="${DEV_PG_USER}" \
  --dbname="${DEV_DB_NAME}" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --jobs=4 \
  --verbose \
  "${DUMP_FILE}" 2> "${RESTORE_LOG}" || RESTORE_EXIT_CODE=$?

# Daca pg_restore a returnat NON-zero, parsam logul:
# - daca singura sursa de erori e ABSENTA tabelei `newsletter_subscriber` (modul local-only),
#   acceptam si continuam (cunoscut, asteptat).
# - altfel, FAIL HARD: nu vrem sa sanitize pe DB partial/inconsistent.
if [[ "${RESTORE_EXIT_CODE}" -ne 0 ]]; then
  # Filtreaza erorile reale (linii cu "ERROR:" sau "pg_restore: error:")
  REAL_ERRORS="$(grep -E '^(pg_restore: error:|ERROR:)' "${RESTORE_LOG}" 2>/dev/null || true)"

  if [[ -z "${REAL_ERRORS}" ]]; then
    warn "pg_restore exit ${RESTORE_EXIT_CODE} dar fara linii ERROR/error in log - probabil warnings benigne"
  else
    # Categorisim erorile: newsletter_subscriber sau altele
    UNEXPECTED="$(echo "${REAL_ERRORS}" | grep -vE 'newsletter_subscriber|"newsletter_subscriber"' || true)"

    if [[ -z "${UNEXPECTED}" ]]; then
      if [[ "${RESTORE_ALLOW_MISSING_NEWSLETTER}" == "1" ]]; then
        warn "pg_restore: singurele erori sunt pe newsletter_subscriber (tabela locala-only) - WHITELIST"
      else
        err "pg_restore: erori doar pe newsletter_subscriber, dar RESTORE_ALLOW_MISSING_NEWSLETTER=0. Abort."
      fi
    else
      red_msg="pg_restore: erori UNEXPECTED, abort inainte de sanitize:"
      err "${red_msg}\n${UNEXPECTED}"
    fi
  fi
fi

green "  Restore OK (vezi ${RESTORE_LOG} pentru detalii)"

# ---- Step 5: sanitize ----
if [[ "${SANITIZE}" == "1" ]]; then
  [[ -f "${SANITIZE_SQL}" ]] || err "Nu gasesc ${SANITIZE_SQL}"
  log "Step 5/5: sanitize -> ${SANITIZE_SQL}"
  psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d "${DEV_DB_NAME}" \
    --single-transaction \
    --set ON_ERROR_STOP=on \
    --file="${SANITIZE_SQL}"
  green "  Sanitize complete"
else
  warn "SANITIZE=0 -> SKIPPED. DB-ul are PII real. NU folosi pentru screenshots/demos."
fi

# ---- Raport final ----
echo ""
log "Row counts post-restore:"
psql -h "${DEV_PG_HOST}" -p "${DEV_PG_PORT}" -U "${DEV_PG_USER}" -d "${DEV_DB_NAME}" -c "
  SELECT 'customer' AS t, COUNT(*) FROM customer
  UNION ALL SELECT 'customer_address', COUNT(*) FROM customer_address
  UNION ALL SELECT 'order',            COUNT(*) FROM \"order\"
  UNION ALL SELECT 'order_address',    COUNT(*) FROM order_address
  UNION ALL SELECT 'cart',             COUNT(*) FROM cart
  UNION ALL SELECT 'cart_address',     COUNT(*) FROM cart_address
  UNION ALL SELECT 'payment',          COUNT(*) FROM payment
  UNION ALL SELECT 'account_holder',   COUNT(*) FROM account_holder
  UNION ALL SELECT 'provider_identity', COUNT(*) FROM provider_identity
  UNION ALL SELECT 'user',             COUNT(*) FROM \"user\"
  UNION ALL SELECT 'api_key pub',      COUNT(*) FROM api_key WHERE type='publishable'
  UNION ALL SELECT 'product',          COUNT(*) FROM product
  UNION ALL SELECT 'product_variant',  COUNT(*) FROM product_variant
  ORDER BY 1;
"

# ---- Cleanup: sterge dump-ul brut dupa sanitize succes ----
# Dump-ul RAW contine PII (emailuri, telefoane, Stripe IDs). Sanitize-ul lucreaza
# pe DB, nu pe fisier. Lasarea pe disc contrazice spiritul "zero PII pe disc".
# Pastram doar daca user-ul cere explicit (KEEP_PROD_DUMP=1) sau sanitize a fost skip.
DUMP_KEPT_REASON=""
if [[ "${SANITIZE}" == "1" && "${KEEP_PROD_DUMP}" == "0" ]]; then
  log "Step 5b/5: cleanup dump (contine PII) - sterg ${DUMP_FILE}"
  rm -f "${DUMP_FILE}"
  # Pastram log-urile (nu PII, doar progres pg_restore/pg_dump)
elif [[ "${SANITIZE}" == "0" ]]; then
  DUMP_KEPT_REASON=" (PASTRAT - SANITIZE=0, dump are PII real)"
elif [[ "${KEEP_PROD_DUMP}" == "1" ]]; then
  DUMP_KEPT_REASON=" (PASTRAT - KEEP_PROD_DUMP=1)"
fi

cat <<EOF

$(green "[clone] DONE")
  DB:           ${DEV_DB_NAME} pe ${DEV_PG_HOST}:${DEV_PG_PORT}
  Dump:         ${DUMP_FILE} (${DUMP_SIZE} bytes)${DUMP_KEPT_REASON}
  Restore log:  ${RESTORE_LOG}
  Sanitize:     $( [[ "${SANITIZE}" == "1" ]] && echo "applied" || echo "SKIPPED" )

  Conexiune backend (in backend/.env.development):
    DATABASE_URL=postgres://${DEV_PG_USER}:${DEV_PG_PASSWORD}@${DEV_PG_HOST}:${DEV_PG_PORT}/${DEV_DB_NAME}
    REDIS_URL=redis://127.0.0.1:6380

  Pas urmator:
    1. make dev-admin     -> creeaza fresh admin (password hash-uri sterse la sanitize)
    2. make dev-publishable-key DB=${DEV_DB_NAME}  -> pune in storefront .env.development
    3. make dev-backend   (terminal A)
    4. make dev-storefront (terminal B)
EOF
