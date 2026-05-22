# ARDmag.ro

Magazin propriu aiBaza pentru scule si consumabile pentru prelucrarea pietrei naturale. Companie: Arc Rom Diamonds, Cluj-Napoca, peste 25 ani pe piata.

Site-ul vechi rula pe Wix (legacy ardmag.com — 308 redirect la `.ro`). In productie din 19 mai 2026 pe stack Medusa v2 + Next.js.

## Quickstart dev local

```bash
# Pre-requisites: Docker, Node 20+, psql client. Vezi docs/dev-environment.md.

git clone <repo> ardmag.com && cd ardmag.com
cd backend && npm install && cd ..
cd backend-storefront && npm install && cd ..

cp backend/.env.development.template backend/.env.development
cp backend-storefront/.env.development.template backend-storefront/.env.development

make dev-up                # docker: Postgres :5433 + Redis :6380
make dev-clone             # cloneaza prod sanitized (sau: make dev-seed-fresh)
make dev-admin DB=medusa_dev_clone
make dev-publishable-key DB=medusa_dev_clone   # paste in storefront .env.development

# In doua terminale (sau `make dev` paralel)
make dev-backend           # localhost:9000
make dev-storefront        # localhost:8000
```

Doc completa: **[docs/dev-environment.md](docs/dev-environment.md)**.

## Stack

| Layer | Tech | Local | Prod |
|---|---|---|---|
| Backend | Medusa v2 (Node 20) | localhost:9000 | Railway (EU) |
| Storefront | Next.js 15 + Turbopack | localhost:8000 | Vercel (Frankfurt) |
| Database | Postgres 18.3 | docker :5433 | Railway Postgres |
| Cache / queue | Redis 7 | docker :6380 | Railway Redis |
| Media | local fs | local fs | Cloudflare R2 |
| Payments | n/a (test mode) | optional | Stripe live |
| Email | n/a | optional | SMTP2GO |
| Fulfillment | mock | optional | Fan Courier SelfAWB |

## Documente proiect

- [CLAUDE.md](CLAUDE.md) — reguli AI-assisted development + workflow deploy obligatoriu
- [docs/04-implementation-plan.md](docs/04-implementation-plan.md) — plan implementare pe faze
- [docs/dev-environment.md](docs/dev-environment.md) — setup + workflows dev local
- [WORKLOG.md](WORKLOG.md) — log cronologic sesiuni
- [CHANGELOG.md](CHANGELOG.md) — schimbari user-visible

## MCP server (medusa-mcp)

Server MCP comunitar pentru control runtime al magazinului prin natural language in Claude Code. Vezi [docs/dev-environment.md sectiunea 6](docs/dev-environment.md#6-working-with-the-mcp-server). Hard-wired pe localhost.

## License

Proprietary. (C) Arc Rom Diamonds SRL.
