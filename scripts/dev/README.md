# scripts/dev/ — runbook scurt

Scripturi pentru mediul dev local. Detaliile complete: `docs/dev-environment.md`.

## Fisiere

| Fisier | Cand sa-l rulezi | Apelat de |
|---|---|---|
| `up.sh` | `make dev-up` (auto) | Makefile |
| `wait-for-db.sh` | (auto la dev-up) | Makefile |
| `clone-prod-to-dev.sh` | `make dev-clone` | Makefile |
| `sanitize-clone.sql` | (auto in clone-prod-to-dev.sh) | clone script |
| `print-publishable-key.sh` | `make dev-publishable-key [DB=...]` | Makefile |
| `check-publishable-key-in-storefront.sh` | inainte de `dev-storefront` (auto) | Makefile |
| `check-mcp-safety.sh` | inainte de `dev-mcp-up/test` (auto) | Makefile + launcher |
| `probe-mcp-tools.mjs` | `make dev-mcp-probe` | Makefile |

## Reguli importante

1. **Niciun script NU sterge DB-uri.** `clone-prod-to-dev.sh` doar restoreaza peste obiecte existente (cu `--clean --if-exists` la nivel de obiecte, NU drop la DB).
2. **`sanitize-clone.sql` se ruleaza in `--single-transaction`.** Failure → rollback complet. DB ramane in stare PRE-sanitize (cu PII real — NU folosi).
3. **`check-mcp-safety.sh` refuza orice `.env` cu prod refs.** Exit codes:
   - `0` OK
   - `1` `.env` lipseste
   - `2` contine hostname prod sau live key
   - `3` `MEDUSA_BACKEND_URL` nu pointeaza la localhost:9000
   - `4` `MEDUSA_USERNAME` pare cont prod

## Comenzi rapide

```bash
# Dry-run clone (fara sanitize - DB ramane cu PII real, NU FOLOSI)
SANITIZE=0 bash scripts/dev/clone-prod-to-dev.sh

# Re-clone cu DB fresh (DROP MANUAL inainte)
PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d postgres \
  -c 'DROP DATABASE "medusa_dev_clone"'
make dev-clone

# Verifica sanitization
PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d medusa_dev_clone -c \
  "SELECT email FROM customer LIMIT 3; SELECT external_id FROM account_holder LIMIT 1;"
# Asteptat: user-XXX@dev.local, dev_acchld_XXX (NU cus_XXX real)

# Test MCP fara restart Claude Code
make dev-mcp-test
```
