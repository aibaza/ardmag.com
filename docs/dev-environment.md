# ARDmag.ro — Local Development Environment

Ghid complet pentru a porni un mediu dev local izolat de productie pentru ardmag.ro. Tinta: dev nou productiv in <30 minute de la `git clone`.

> **Regula absoluta:** Niciun script din acest setup NU sterge DB-uri / volume Docker. Wipe-ul se face manual (sectiunea 8).

## Cuprins

1. [Prerequisites](#1-prerequisites)
2. [First-time setup](#2-first-time-setup)
3. [Daily workflow](#3-daily-workflow)
4. [Refreshing the DB clone](#4-refreshing-the-db-clone)
5. [Env vars management](#5-env-vars-management)
6. [Working with the MCP server](#6-working-with-the-mcp-server)
7. [Troubleshooting](#7-troubleshooting)
8. [Tearing down](#8-tearing-down)
9. [What NOT to do](#9-what-not-to-do)

---

## 1. Prerequisites

- **Docker Engine** >= 24 (testat cu 29.4) + Docker Compose v2
- **Node.js** >= 20 (backend `engines`)
- **npm** >= 10
- **Postgres client tools** (`psql`, `pg_dump`, `pg_restore`) — pe Arch: `pacman -S postgresql-libs postgresql`
- **Railway CLI** — DOAR daca vrei sa cloni DB-ul de prod (`pacman -S railway` sau `npm i -g @railway/cli`)
- **Stripe CLI** — OPTIONAL, pentru testat webhooks
- **Claude Code CLI** — pentru MCP integration
- ~5GB free disk (Docker images + Postgres data + node_modules)

Verifica:
```bash
docker --version && docker compose version
node --version && npm --version
psql --version && pg_dump --version
railway whoami   # optional
```

---

## 2. First-time setup

### 2.1 Clone repo + install deps

```bash
git clone <repo> ardmag.com
cd ardmag.com

# Backend deps
cd backend && npm install && cd ..

# Storefront deps
cd backend-storefront && npm install && cd ..

# Root deps (pentru scripturi)
npm install
```

### 2.2 Copy env templates

```bash
cp backend/.env.development.template backend/.env.development
cp backend-storefront/.env.development.template backend-storefront/.env.development
```

`backend/.env.development` are deja default-uri safe (DATABASE_URL pe :5433, Redis pe :6380, Stripe/R2/SMTP UNSET).

### 2.3 Pornește Docker infra

```bash
make dev-up
```

Output asteptat: ambele containere `healthy`, mesaj de info ca DB-urile nu exista inca.

### 2.4 Alege: clona prod (sanitized) sau fresh seed

#### Optiunea A — clona prod (recomandat pentru realism)

```bash
make dev-clone
```

Aceasta:
1. `pg_dump` din Railway prod (read-only)
2. Restore in `medusa_dev_clone` local
3. Sanitizeaza PII (emailuri, telefoane, adrese, Stripe IDs)
4. Regenereaza publishable key cu prefix `pk_dev_`

**Pasi obligatorii dupa clone** (parolele admin sunt sterse la sanitize):

```bash
make dev-admin DB=medusa_dev_clone     # creeaza dev@ardmag.local / dev123456
make dev-publishable-key DB=medusa_dev_clone   # afiseaza key-ul nou
```

Paste valoarea afisata in `backend-storefront/.env.development`:
```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_dev_xxxxxxxx...
```

#### Optiunea B — fresh seed (no real data)

```bash
make dev-seed-fresh
```

Aceasta creeaza `medusa_dev_fresh`, ruleaza migratiile, seed-ul, RO setup, si admin user. Publishable key se afiseaza la final — paste in storefront env.

In acest caz, editeaza `backend/.env.development`:
```
DATABASE_URL=postgres://medusa:medusa@127.0.0.1:5433/medusa_dev_fresh
```

### 2.5 Verifica + pornește apps

```bash
make dev-status   # toate verzi

# Doua terminale:
make dev-backend       # terminal A
make dev-storefront    # terminal B

# Sau ambele in paralel (cu logs prefixate):
make dev
```

Deschide:
- `http://localhost:8000` — storefront
- `http://localhost:9000/app` — admin (login: `dev@ardmag.local` / `dev123456`)

---

## 3. Daily workflow

```bash
make dev-up            # porneste docker (DB-urile sunt preservate intre sesiuni)
make dev               # backend + storefront paralel
# ... lucrezi ...
make dev-down          # opreste containerele (DATELE RAMAN)
```

Schimbi env vars in `backend/.env.development`: restart make dev-backend.
Schimbi env vars in `backend-storefront/.env.development`: restart make dev-storefront.

---

## 4. Refreshing the DB clone

Re-rulezi `make dev-clone` cand vrei date proaspete din prod.

Daca vrei o clona complet curata (NU doar restore peste tabele existente), trebuie sa dropezi MANUAL DB-ul:

```bash
PGPASSWORD=medusa psql -h 127.0.0.1 -p 5433 -U medusa -d postgres \
  -c 'DROP DATABASE "medusa_dev_clone"'
make dev-clone
```

Nu fac DROP automat — e o regula stricta.

---

## 5. Env vars management

Convention:
- `*.template` — committed, safe defaults
- `*.development` — gitignored, personal copy (tine modificari minore)
- `*.development.local` — gitignored, override absolut (Stripe test keys etc.)

**ATENTIE Medusa**: `loadEnv()` (in `@medusajs/utils`) pentru `NODE_ENV=development` citeste DOAR `.env` (NU `.env.development`). De aceea Makefile face `set -a && source .env.development && set +a` inainte de fiecare comanda backend. Pastreaza `backend/.env.development` ca singura sursa de adevar pentru dev.

Daca exista `backend/.env` cu config vechi (din inainte de docker setup), il poti lasa — Makefile-ul ignora `.env` cand sourceaza `.env.development`.

### Variabile critice de stiut

| Var | Default in template | Ce face |
|---|---|---|
| `DATABASE_URL` | `:5433/medusa_dev_clone` | Schimba la `:5433/medusa_dev_fresh` pentru fresh-seed path |
| `REDIS_URL` | `:6380` | Comenteaza pentru in-memory fallback |
| `SMTP2GO_API_KEY` + `SMTP_HOST` | ambele UNSET | Modulul email NU se inregistreaza |
| `R2_*` | UNSET | File module foloseste local file storage |
| `STRIPE_API_KEY` | UNSET | Stripe module NU se inregistreaza |
| `NOTIFICATION_BCC` | `""` (explicit) | Suprascrie default `dc@aibaza.ro` din prod config |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | placeholder | HARD-REQUIRED in storefront — paste dupa seed |

---

## 6. Working with the MCP server

### 6.1 Ce e + ce nu e

`medusa-mcp` (community, github.com/SGFGOV/medusa-mcp) wrap-uieste Medusa Admin + Store API ca tools MCP — Claude Code poate citi / scrie produse, comenzi, customers via natural language.

Hard-wired pe `http://localhost:9000`. NU se conecteaza la prod (vezi safety guard sectiunea 6.4).

Tool count: ~245 Admin + ~28 Store = ~273 tools totale. Lista completa: `tools/.medusa-mcp-tools.txt` (regenerated cu `make dev-mcp-probe`).

### 6.2 Setup (deja facut la first-time)

Clonarea + build se face o data:
```bash
git clone https://github.com/SGFGOV/medusa-mcp.git tools/medusa-mcp
cd tools/medusa-mcp && npm install && npm run build && cd ../..
```

Creeaza `tools/medusa-mcp/.env`:
```
MEDUSA_BACKEND_URL=http://localhost:9000
PUBLISHABLE_KEY=<pk_dev_... din DB>
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<acelasi>
MEDUSA_USERNAME=dev@ardmag.local
MEDUSA_PASSWORD=dev123456
NODE_ENV=development
```

### 6.3 Activare in Claude Code

`.claude/settings.json` are deja blocul `mcpServers.medusa-dev`. **Restart Claude Code** ca sa-l incarce.

Apoi in chat:
- "Listeaza primele 5 produse din medusa-dev MCP" → calls `StoreGetProducts`
- "Cate comenzi avem in dev DB?" → calls `AdminGetOrders`
- "Adu detaliile produsului MASTIC SEMISOLID WET" → calls `StoreGetProductsId`

### 6.4 Safety

Inainte de pornire (atat din `make dev-mcp-up` cat si din `tools/medusa-mcp-launcher.sh`), scripturile verifica `.env` pentru:
- hostnames `ardmag.ro`, `api.ardmag`, `railway.app`
- chei `sk_live_*`, `pk_live_*`

Daca gaseste, refuza sa porneasca. Vezi `scripts/dev/check-mcp-safety.sh`.

### 6.5 Reguli de utilizare

**Read-only (safe):** `AdminGet*`, `StoreGet*`, `StorePost(Cart|Auth)*`

**Write low-impact:** `AdminPostProducts*` (update title/description), `AdminPostProductTags`, `AdminPostCollections*`

**Write HIGH IMPACT — NU invoca fara confirmare per apel:**
- `AdminDelete*` (orice DELETE)
- `AdminPostOrdersOrderCancel`
- `AdminPostOrdersOrderRefund`
- `AdminPostOrdersOrderFulfillmentsCapture` (emite webhooks)
- `AdminDeleteApiKeysApiKey` (sparge storefront-ul!)
- `AdminPostUsersInvite` (emite email daca SMTP wired)

Cand AI agent (inclusiv Claude Code) propune un tool destructiv, intreaba intai. Nu chain-ui Delete-uri.

### 6.6 Comenzi MCP

```bash
make dev-mcp-up        # safety check + reminder restart
make dev-mcp-test      # curl direct (NU prin MCP) — izoleaza buguri backend vs MCP
make dev-mcp-probe     # dump lista tools -> tools/.medusa-mcp-tools.txt
```

---

## 7. Troubleshooting

### 7.1 Backend nu porneste

```bash
make dev-status      # verifica docker + ports
```

- `Postgres :5433 closed`: `make dev-up`
- `backend down` after dev-backend ran: check log, frecvent `.medusa` cache invalid → `rm -rf backend/.medusa && cd backend && npm run dev`

### 7.2 Storefront da 500 pe /

- Lipseste publishable key in `.env.development` → `make dev-publishable-key` si paste
- Backend down → `curl localhost:9000/health`

### 7.3 "redisUrl not found" warning

Modulul de locking foloseste in-memory default. Restul (event-bus, cache, workflow-engine) se conecteaza OK la Redis dupa initializare. Mesaj benign.

### 7.4 Backend connecteaza la Redis :6379 in loc de :6380

Inseamna ca `.env.development` NU a fost sourced. Verifica:
```bash
cd backend && set -a && source .env.development && set +a && echo $REDIS_URL
```
Trebuie sa printeze `redis://127.0.0.1:6380`. Daca nu, lipseste `.env.development` sau Makefile-ul nu sourceaza.

### 7.5 Sanitize SQL esueaza pe newsletter_subscriber

Tabela exista doar dupa migrari locale. SQL e wrapuit defensiv intr-un DO block care verifica `pg_class`. Daca tot esueaza, comenteaza sectiunea 13 din `scripts/dev/sanitize-clone.sql`.

### 7.6 MCP tools nu apar in Claude Code

- Ai restart-uit Claude Code dupa edit la `.claude/settings.json`? (Nu se hot-reload)
- `ls tools/medusa-mcp/dist/index.js` → exista?
- `make dev-mcp-test` → curl reuseste?

### 7.7 MCP store tools merg dar admin tools lipsesc

Login admin a esuat. Check `tools/medusa-mcp/.env`:
```bash
curl -X POST localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@ardmag.local","password":"dev123456"}'
```

---

## 8. Tearing down

### Stop temporar (datele raman)

```bash
make dev-down
```

### Wipe complet (DESTRUCTIV, manual)

```bash
docker compose -f docker-compose.dev.yml down -v
```

Aceasta sterge volumele `ardmag-dev-pg` si `ardmag-dev-redis`. Toate datele dispar. **Tip-o manual, nu am put-o intr-un make target.**

### Reset MCP

```bash
rm -rf tools/medusa-mcp tools/.medusa-mcp.sha tools/.medusa-mcp-tools.txt
# Apoi reincepi: git clone ... && npm install && npm run build
```

---

## 9. What NOT to do

1. **NU pune chei live (Stripe live, R2 prod, SMTP2GO live) in `.env.development.*`**. Doar in `.env.production.*` sau direct in Railway/Vercel.
2. **NU pointa `MEDUSA_BACKEND_URL` la `api.ardmag.ro` in tools/medusa-mcp/.env**. Safety guard refuza pornirea, dar e o regula sa nu uite.
3. **NU activa GA4 / Pixel in dev**. Pollueaza analytics-ul real. `NEXT_PUBLIC_GA4_MEASUREMENT_ID` si `NEXT_PUBLIC_META_PIXEL_ID` raman UNSET.
4. **NU folosi MCP-ul comunitar pentru workflows destructive (delete-multe, refund-bulk)**. Pre-1.0, fara audit, fara teste.
5. **NU `git add tools/medusa-mcp/`**. Subdir-ul e gitignored complet.
6. **NU `docker compose down -v` din script**. Doar manual.
7. **NU porni Claude Code MCP global cu medusa-dev**. Doar project-scoped via `.claude/settings.json` din repo.
8. **NU rula migrarile pe `medusa_dev_clone` DUPA clone**. Restore-ul aduce schema-ul prod completa; migrarile noi le rulezi DOAR daca te-ai dezvoltat o migrare custom locala.
