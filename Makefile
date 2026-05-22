# ============================================================
# ARDmag.ro - local dev orchestration
# ============================================================
# Vezi `make help` (sau doar `make`) pentru lista de targets.
#
# REGULA ABSOLUTA: niciun target NU sterge DB-uri / volume.
# Singura cale de wipe complet:
#   docker compose -f docker-compose.dev.yml down -v   <-- tipezi tu, manual

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:

COMPOSE := docker compose -f docker-compose.dev.yml
BACKEND := backend
STOREFRONT := backend-storefront

DB_FRESH := medusa_dev_fresh
DB_CLONE := medusa_dev_clone

PG_HOST := 127.0.0.1
PG_PORT := 5433
PG_USER := medusa
PG_PASS := medusa

# Colors
C_CYAN   := \033[36m
C_GREEN  := \033[32m
C_YELLOW := \033[33m
C_RED    := \033[31m
C_BOLD   := \033[1m
C_RESET  := \033[0m

.DEFAULT_GOAL := help

.PHONY: help \
        dev-up dev-down dev-restart dev-logs dev-status dev-ps \
        dev-clone dev-migrate dev-seed-fresh dev-admin \
        dev-publishable-key dev-check-storefront-env \
        dev-backend dev-storefront dev dev-stripe-listen \
        dev-shell-db dev-shell-redis \
        dev-mcp-up dev-mcp-test dev-mcp-probe \
        dev-clean-instructions

# ---- HELP ---------------------------------------------------
help:
	@printf "$(C_BOLD)ARDmag.ro dev targets$(C_RESET)\n\n"
	@printf "  $(C_BOLD)Infra$(C_RESET)\n"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-up"               "start Postgres + Redis (docker compose)"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-down"             "stop containers (DATELE RAMAN)"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-restart"          "down + up"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-status"           "show services, ports, DBs, processes"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-logs"             "tail docker logs"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-ps"               "docker compose ps"
	@printf "\n  $(C_BOLD)Date$(C_RESET)\n"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-clone"            "clone prod -> $(DB_CLONE) (sanitized)"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-seed-fresh"       "migrate + seed empty DB ($(DB_FRESH)) + RO setup + admin user"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-migrate"          "rulează migratiile Medusa pe DB-ul curent"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-admin"            "creeaza dev@ardmag.local / dev123456"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-publishable-key"  "printeaza publishable key din DB"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-shell-db"         "psql shell in DB-ul curent"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-shell-redis"      "redis-cli in container redis"
	@printf "\n  $(C_BOLD)Apps$(C_RESET)\n"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-backend"          "porneste Medusa develop pe :9000"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-storefront"       "porneste Next.js dev pe :8000"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev"                  "ambele in paralel (cu prefix logs)"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-stripe-listen"    "forward Stripe webhooks la :9000"
	@printf "\n  $(C_BOLD)MCP$(C_RESET)\n"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-mcp-up"           "safety check + reminder restart Claude Code"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-mcp-test"         "curl la backend (NU prin MCP) - izoleaza buguri"
	@printf "  $(C_CYAN)%-22s$(C_RESET) %s\n" "make dev-mcp-probe"        "dump tool list al MCP -> tools/.medusa-mcp-tools.txt"
	@printf "\n  $(C_YELLOW)WARNING$(C_RESET) - niciun target nu sterge date.\n"
	@printf "  Wipe volume manual: $(C_BOLD)docker compose -f docker-compose.dev.yml down -v$(C_RESET)\n"

# ---- DOCKER LIFECYCLE --------------------------------------
dev-up:
	@./scripts/dev/up.sh

dev-down:
	@printf "$(C_CYAN)[down]$(C_RESET) Stopping containers (DATELE RAMAN in volume)...\n"
	@$(COMPOSE) down
	@printf "$(C_GREEN)[down]$(C_RESET) Stopped. Re-run: make dev-up\n"

dev-restart: dev-down dev-up

dev-logs:
	@$(COMPOSE) logs -f --tail=100

dev-ps:
	@$(COMPOSE) ps

dev-status:
	@printf "$(C_BOLD)>> Docker services$(C_RESET)\n"
	@$(COMPOSE) ps 2>/dev/null || printf "  (docker compose not up)\n"
	@printf "\n$(C_BOLD)>> Postgres databases$(C_RESET)\n"
	@PGPASSWORD=$(PG_PASS) psql -h $(PG_HOST) -p $(PG_PORT) -U $(PG_USER) -d postgres -c "\l" 2>/dev/null | grep -E "medusa|Name|---" || printf "  (postgres not reachable)\n"
	@printf "\n$(C_BOLD)>> Ports$(C_RESET)\n"
	@printf "  Backend  :9000  "; (ss -ltn 2>/dev/null | grep -q ":9000 " && printf "$(C_GREEN)open$(C_RESET)\n") || printf "$(C_YELLOW)closed$(C_RESET)\n"
	@printf "  Storefront :8000  "; (ss -ltn 2>/dev/null | grep -q ":8000 " && printf "$(C_GREEN)open$(C_RESET)\n") || printf "$(C_YELLOW)closed$(C_RESET)\n"
	@printf "  Postgres :5433  "; (ss -ltn 2>/dev/null | grep -q ":5433 " && printf "$(C_GREEN)open$(C_RESET)\n") || printf "$(C_YELLOW)closed$(C_RESET)\n"
	@printf "  Redis    :6380  "; (ss -ltn 2>/dev/null | grep -q ":6380 " && printf "$(C_GREEN)open$(C_RESET)\n") || printf "$(C_YELLOW)closed$(C_RESET)\n"
	@printf "\n$(C_BOLD)>> Backend health$(C_RESET)\n"
	@curl -sf http://localhost:9000/health 2>/dev/null && printf "$(C_GREEN)OK$(C_RESET)\n" || printf "  $(C_YELLOW)down$(C_RESET)\n"

# ---- DB LIFECYCLE (NICIODATA STERGE) -----------------------
dev-clone:
	@./scripts/dev/clone-prod-to-dev.sh

# NOTA importanta: Medusa loadEnv (in @medusajs/utils/dist/common/load-env.js)
# pentru NODE_ENV=development citeste DOAR `.env` (NU `.env.development`).
# Lucru contraintuitiv vs. Next.js convention. Compensam in target-uri prin
# `set -a && source .env.development && set +a` inainte de fiecare comanda.
# Asa pastram backend/.env intact (config vechi de dev) si dam prioritate
# .env.development cand rulam via make.
SOURCE_BACKEND_ENV := set -a && source .env.development && set +a

dev-migrate:
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && NODE_ENV=development npx medusa db:migrate

dev-seed-fresh:
	@printf "$(C_CYAN)[seed-fresh]$(C_RESET) Bootstrap fresh DB $(DB_FRESH)...\n"
	@PGPASSWORD=$(PG_PASS) psql -h $(PG_HOST) -p $(PG_PORT) -U $(PG_USER) -d postgres -tAc \
		"SELECT 1 FROM pg_database WHERE datname='$(DB_FRESH)'" 2>/dev/null | grep -q 1 \
		|| PGPASSWORD=$(PG_PASS) psql -h $(PG_HOST) -p $(PG_PORT) -U $(PG_USER) -d postgres \
			-c "CREATE DATABASE \"$(DB_FRESH)\" WITH OWNER \"$(PG_USER)\" ENCODING 'UTF8';"
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && DATABASE_URL=postgres://$(PG_USER):$(PG_PASS)@$(PG_HOST):$(PG_PORT)/$(DB_FRESH) NODE_ENV=development npx medusa db:migrate
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && DATABASE_URL=postgres://$(PG_USER):$(PG_PASS)@$(PG_HOST):$(PG_PORT)/$(DB_FRESH) NODE_ENV=development npx medusa exec ./src/scripts/seed.ts
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && DATABASE_URL=postgres://$(PG_USER):$(PG_PASS)@$(PG_HOST):$(PG_PORT)/$(DB_FRESH) NODE_ENV=development npx medusa exec ./src/scripts/setup-ro-shipping.ts || true
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && DATABASE_URL=postgres://$(PG_USER):$(PG_PASS)@$(PG_HOST):$(PG_PORT)/$(DB_FRESH) NODE_ENV=development npx medusa exec ./src/scripts/setup-ro-payment.ts || true
	@$(MAKE) -s dev-admin DB=$(DB_FRESH)
	@printf "\n$(C_GREEN)[seed-fresh] DONE$(C_RESET)\n"
	@$(MAKE) -s dev-publishable-key DB=$(DB_FRESH)

dev-admin:
	@DB=$${DB:-$(DB_FRESH)}; \
	printf "$(C_CYAN)[admin]$(C_RESET) Creating dev@ardmag.local on DB=$$DB...\n"; \
	cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && DATABASE_URL=postgres://$(PG_USER):$(PG_PASS)@$(PG_HOST):$(PG_PORT)/$$DB NODE_ENV=development \
		npx medusa user --email dev@ardmag.local --password dev123456 \
		|| printf "$(C_YELLOW)[admin]$(C_RESET) User exists or DB unreachable (continui).\n"

dev-publishable-key:
	@DB=$${DB:-$(DB_CLONE)}; \
	./scripts/dev/print-publishable-key.sh $$DB

dev-check-storefront-env:
	@./scripts/dev/check-publishable-key-in-storefront.sh

dev-shell-db:
	@DB=$${DB:-$(DB_CLONE)}; \
	PGPASSWORD=$(PG_PASS) psql -h $(PG_HOST) -p $(PG_PORT) -U $(PG_USER) -d $$DB

dev-shell-redis:
	@docker exec -it ardmag-dev-redis redis-cli

# ---- APP PROCESSES -----------------------------------------
dev-backend:
	@cd $(BACKEND) && $(SOURCE_BACKEND_ENV) && NODE_ENV=development npm run dev

dev-storefront: dev-check-storefront-env
	@cd $(STOREFRONT) && npm run dev

dev: dev-check-storefront-env
	@printf "$(C_CYAN)[dev]$(C_RESET) Pornesc backend + storefront in paralel...\n"
	@$(MAKE) -j2 --output-sync=line dev-backend dev-storefront

dev-stripe-listen:
	@command -v stripe >/dev/null 2>&1 || { printf "$(C_RED)stripe CLI not installed.$(C_RESET) See: https://docs.stripe.com/stripe-cli\n"; exit 1; }
	@stripe listen --forward-to localhost:9000/hooks/payment/stripe_stripe

# ---- MCP ---------------------------------------------------
dev-mcp-up:
	@bash scripts/dev/check-mcp-safety.sh
	@test -f tools/medusa-mcp/dist/index.js || { printf "$(C_RED)MCP build missing.$(C_RESET) Run: cd tools/medusa-mcp && npm install && npm run build\n"; exit 1; }
	@printf "\n$(C_GREEN)[mcp-up]$(C_RESET) medusa-mcp wired in .claude/settings.json (medusa-dev).\n"
	@printf "         -> $(C_BOLD)Restart Claude Code$(C_RESET) ca sa incarce noul MCP.\n"
	@printf "         -> Apoi try: 'Listeaza 3 produse din medusa-dev MCP'\n"

dev-mcp-test:
	@bash scripts/dev/check-mcp-safety.sh
	@set -a && source tools/medusa-mcp/.env && set +a && \
	printf "$(C_CYAN)[mcp-test]$(C_RESET) GET %s/store/products\n" "$$MEDUSA_BACKEND_URL" && \
	curl -sf -H "x-publishable-api-key: $$PUBLISHABLE_KEY" "$$MEDUSA_BACKEND_URL/store/products?limit=1" | head -c 400 && \
	printf "\n$(C_CYAN)[mcp-test]$(C_RESET) admin login as %s\n" "$$MEDUSA_USERNAME" && \
	curl -sf -X POST "$$MEDUSA_BACKEND_URL/auth/user/emailpass" -H "Content-Type: application/json" \
		-d "{\"email\":\"$$MEDUSA_USERNAME\",\"password\":\"$$MEDUSA_PASSWORD\"}" | head -c 200 && \
	printf "\n$(C_GREEN)[mcp-test] OK$(C_RESET) backend reachable, publishable key valid, admin login works\n"

dev-mcp-probe:
	@test -f scripts/dev/probe-mcp-tools.mjs || { printf "$(C_RED)probe script missing.$(C_RESET)\n"; exit 1; }
	@node scripts/dev/probe-mcp-tools.mjs > tools/.medusa-mcp-tools.txt
	@wc -l tools/.medusa-mcp-tools.txt
	@head -20 tools/.medusa-mcp-tools.txt
