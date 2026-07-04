# ARDmag.ro — CLAUDE.md

**Brand:** ARDmag.ro (sau ARDmag, ardmag, ardmag.ro). ARD vine de la **Arc Rom Diamonds** (compania mamă).
**Domeniu principal:** `ardmag.ro`. Domeniul legacy `ardmag.com` redirectează 308 la `ardmag.ro` (Vercel apex aliases). Nu mai folosim `.com` în comunicare nouă.
**Folder local:** `ardmag.com/` (păstrat pentru a nu rupe path-uri Claude Code și scripturi cu path-uri absolute; nu apare niciodată în producție).

## Workflow deploy + consemnare — OBLIGATORIU

**La orice modificare livrată pe ardmag.ro folosește skill-ul `aibaza-deploy-workflow`.** Acesta definește ordinea: deploy CLI pentru testare → confirmare user pe URL live → git commit/push + WORKLOG.md + ClickUp task + time entry.

Fără respectarea acestui flow, munca devine invizibilă: nu apare în istoric, nu apare în facturare, nu rămâne urmă de ce s-a făcut. Nu sări pași și nu presupune că „știi ce a fost livrat" — consemnezi de fiecare dată la confirmare.

**Lesson learned (19 mai 2026):** pentru deploy pe Railway nu e suficient `git push`. Backend-ul folosește Dockerfile care copiază din `.medusa/server/` (gitignored). Trebuie ÎNTOTDEAUNA: `cd backend && npm run build` (regenerează `.medusa/server/`) → `railway up --service medusa --detach`. Doar push pe master nu propagă schimbările de cod în container — vezi explicație în WORKLOG sesiunea 19 mai.

**Lesson learned (4 iul 2026):** `backend/Dockerfile` copiază DOAR anumite directoare compilate (`src/modules`, `src/api`, `src/subscribers`, `src/jobs`, `src/lib`, `medusa-config.js`). **Orice cod partajat nou (folder nou sub `backend/src/`) trebuie adăugat ca linie `COPY` în Dockerfile**, altfel `npm run build` reușește local dar containerul crapă la boot cu `Cannot find module`. Simptom: deploy Railway = FAILED, health rămâne 200 pe containerul vechi. Debug: `railway logs --service medusa --deployment <id> | grep -i 'cannot find module'`. Query rapid pe DB (comenzi etc.): `DATABASE_PUBLIC_URL` de pe serviciul `postgres` (NU `DATABASE_URL` intern `.railway.internal`, nereachable din VM).

---

## Context proiect

ardmag.ro este magazinul propriu al aiBaza pentru scule și consumabile destinate prelucrării pietrei naturale. Site-ul vechi rula pe Wix (domeniu istoric ardmag.com, acum redirect 308). Proiectul migrează pe **Medusa v2** (backend) + **Next.js** (storefront), self-hosted, cu dev inițial pe localhost.

Companie: prezentă pe piață din 2001, cel mai mare distribuitor Tenax din România. Contact: +40 722 155 441, office@arcromdiamonds.ro, Calea Baciului 1-3, Cluj-Napoca 400230.

---

## Două track-uri paralele

**Track A — Implementare (tu, Claude Code):** bootstrap Medusa v2, import catalog din CSV, API-uri, admin, logică de business, deploy pe localhost. Acesta este track-ul tău.

**Track B — Design (Ciprian cu Claude prin artifacts):** UI/UX complet nou pornind de la logo + tagline "Experți în piatră de peste 25 de ani" cu paleta slate/grey. Outputul din track-ul B ajunge în `resources/design/` sub formă de design tokens, componente HTML/React de referință și/sau screenshot-uri.

**Tu NU inventezi design.** Nicio decizie vizuală (culori, fonturi, spacing, layout, componente) nu se ia fără input din track-ul B. Dacă ai nevoie de o decizie vizuală pentru ca ceva să funcționeze, marchezi cu `// DESIGN PENDING: <ce aștepți>` în cod și adaugi o linie în `docs/design-pending.md`. Storefront-ul rulează pe template-ul oficial Next.js starter Medusa (neutru, nestilizat) până la livrarea designului.

## Sursă de adevăr pentru design -- OBLIGATORIU

**Design System-ul finalizat se află în `resources/design/`.** Fișierele HTML din acest folder sunt sursele unice de adevăr pentru orice decizie vizuală. Nu interpreta, nu simplifici, nu "îmbunătățești" -- implementezi exact ce e acolo.

**Fișiere de referință obligatorii (în ordine):**
- `Design System 04 - Chrome & Homepage.html` -- header (3 straturi), footer, homepage asamblat complet (hero, quick-cats, grile produse, trust banner, supplier strip). **Secțiunea 04** din acest fișier = sursă de adevăr pentru homepage.
- Orice alt fișier din `resources/design/` are aceeași autoritate pentru secțiunea sa.

**Reguli de implementare:**
1. Înainte să scrii orice componentă de UI, citești fișierul HTML de referință corespunzător.
2. Copiezi CSS tokens, clase, structură HTML exact -- nu le reinterpretezi.
3. Dacă există conflict între ce ai implementat anterior și design system, design system-ul câștigă.
4. Dacă o secțiune nu e acoperită de niciun fișier din `resources/design/`, marchezi `// DESIGN PENDING` și nu inventezi.

---

## Reguli absolute de migrare — nu negociabile

1. **1 produs Wix = 1 produs Medusa.** Nu se generează produse separate pentru variații. Rezultat final în admin: exact 90 de carduri de produs, nu mai mult.

2. **Variantele sunt rânduri sub produs.** Dacă un produs are 360 de combinații generate din care 40 sunt active, în Medusa va avea 40 de variante sub același produs.

3. **Importăm doar variantele active.** Din CSV: 775 `visible=true` din 2163. Cele 1388 cu `visible=false` nu se importă deloc.

4. **Produsele fără variante în Wix (30 din 90)** primesc în Medusa o variantă default internă (titlu "Default", fără opțiuni vizibile). Aceasta este o cerință a modelului Medusa, nu o opțiune vizibilă clientului.

5. **Migrare fidelă în Faza 1, optimizări în Faza 2+.** Nu restructurăm catalogul la import. Notăm în `docs/` orice problemă de structură și decidem separat.

6. **Niciun design nu se inventează.** (Repetat intenționat.)

---

## Structura de foldere

```
ardmag.com/
├── CLAUDE.md                    # acest fișier
├── docs/
│   ├── 01-catalog-analysis.md  # analiza CSV Wix
│   ├── 02-site-analysis.md     # analiza site live
│   ├── 03-wix-to-medusa-mapping.md  # mapare câmp cu câmp
│   ├── 04-implementation-plan.md   # plan pe faze
│   └── design-pending.md       # decizii vizuale în așteptare
├── resources/
│   ├── Wix Products Catalog.csv  # exportul Wix, sursă de adevăr pentru catalog
│   ├── logo designs.png           # brand identity (logo + tagline + paletă)
│   ├── aibaza_content_guidelines.md  # (urmează să fie adăugat)
│   └── design/                  # OUTPUT din track-ul B (design tokens, componente, screenshots)
├── backend/                     # Medusa v2 app
├── backend-storefront/          # Next.js starter storefront
└── scripts/
    └── import-wix-catalog.ts    # script de import CSV → Medusa (creat în Faza 1)
```

---

## Convenție DESIGN PENDING

Ori de câte ori o decizie de UI/UX nu are încă input din track-ul B:

**În cod:**
```tsx
// DESIGN PENDING: card produs — layout, hover state, badge reducere
```

**În `docs/design-pending.md`:** adaugă un rând cu `- [ ] Componentă: <ce element> — <ce decizie se așteaptă>`

---

## Convenții de cod

- **TypeScript strict** — `"strict": true` în tsconfig
- **Prettier** — config default Medusa/Next.js
- **ESLint** — config default din fiecare framework
- **Fără comentarii decorative** — comentariile doar pentru WHY non-obvious sau DESIGN PENDING
- **Fără em dash** în cod, copy sau docstrings — folosește cratimă (`-`) sau două cratime (`--`)

---

## Copy integrity -- regulă absolută

Zero copy inventat pe ardmag.ro. Toate textele afișate utilizatorului vin din surse autorizate:
1. Medusa API (date dinamice)
2. ardmag.ro / ardmag.com (legacy Wix) -- copy verificat
3. Date business confirmate (vezi secțiunea dedicată mai jos)
4. Labels UI standard

Dacă lipsește copy pentru o secțiune, lasă spațiul gol sau folosește tagline-ul aprobat. Nu inventezi slogans, nu inventezi beneficii, nu inventezi promises (livrare X ore, garanție Y zile, etc.).

---

## Date business confirmate pentru copy

- 25 ani experiență
- Distribuitor autorizat Tenax România
- Distribuție în 12-18 țări
- Cluj-Napoca, Calea Baciului 1-3, 400230
- +40 722 155 441
- office@arcromdiamonds.ro
- Livrare gratuită peste 500 RON
- Promoție -30% Mastici Tenax (aplicată la checkout)
- Tagline: "Experți în piatră de peste 25 de ani"
- Furnizori: Tenax, Sait, Woosuk, Diatex, Fox Ironstone, VBT, Delta Research
- ANPC link prezent pe toate paginile

---

## Reguli de copy (aplicabile în toate textele de pe site și în produse)

- Fără em dash (`—`) — folosit ca separator în titluri sau text de produs e nepotrivit pentru tonul site-ului
- Fără corporate speak și filler (`soluție completă`, `de calitate superioară`, `conform celor mai înalte standarde`)
- Ton direct și ferm — spune ce face produsul, nu ce sentimente trebuie să trezească
- Fără bullet points goale sau titluri fără conținut real
- Dacă există `resources/aibaza_content_guidelines.md`, el are prioritate față de regulile de mai sus

---

## Convenții commit

Format: [Conventional Commits](https://www.conventionalcommits.org/)

```
feat: adaugă script de import catalog Wix
fix: corectează calculul prețului pentru surcharge gol
docs: actualizează 04-implementation-plan cu Faza 5
refactor: extrage logica de construire URL imagini
chore: configurare ESLint pentru workspace
```

---

## Comenzi utile dev

Toate comenzile pleacă de la rădăcina repo-ului. Detalii complete în [docs/dev-environment.md](docs/dev-environment.md).

```bash
# Setup inițial (o singură dată după git clone)
cp backend/.env.development.template backend/.env.development
cp backend-storefront/.env.development.template backend-storefront/.env.development
cd backend && npm install && cd ..
cd backend-storefront && npm install && cd ..

# Workflow zilnic
make dev-up                # docker: Postgres :5433 + Redis :6380
make dev-backend           # terminal A — Medusa pe localhost:9000
make dev-storefront        # terminal B — Next.js pe localhost:8000
# sau ambele paralel:
make dev

# Tear down
make dev-down              # opreste containerele (DATELE RAMAN in volume)
make dev-status            # health check rapid

# Date
make dev-clone             # clone prod -> medusa_dev_clone (sanitized)
make dev-seed-fresh        # alternativ: fresh DB cu seed.ts + RO setup
make dev-migrate           # rulează migratiile pe DB-ul curent
make dev-admin             # creează dev@ardmag.local / dev123456
make dev-publishable-key   # afișează publishable key din DB

# Stripe webhooks (optional)
make dev-stripe-listen     # forward la localhost:9000/hooks/payment/stripe_stripe

# Toate comenzile
make                       # listă completă cu descrieri
```

**Reguli absolute:**

- Niciun script Make NU șterge DB-uri sau volume. Pentru wipe complet (DESTRUCTIV, manual):
  ```bash
  docker compose -f docker-compose.dev.yml down -v
  ```
- Backend: `cd backend` (NU `cd storefront` — folder-ul nu există).
- Storefront: `cd backend-storefront` (NU `cd storefront`).
- Pentru deploy: vezi skill-ul `aibaza-deploy-workflow` (commit + push + WORKLOG + ClickUp DOAR după confirmarea user pe URL live).

**Echivalente npm (alt mod de a invoca):**
```bash
npm run dev:up        # = make dev-up
npm run dev           # = make dev
npm run dev:status    # = make dev-status
```

---

## MCP server (medusa-mcp)

Server MCP comunitar pentru control runtime al magazinului via Claude Code. Hard-wired pe `http://localhost:9000`. Vezi [docs/dev-environment.md secțiunea 6](docs/dev-environment.md#6-working-with-the-mcp-server).

```bash
make dev-mcp-up        # safety check + reminder restart Claude Code
make dev-mcp-test      # curl direct la backend (NU prin MCP) — izolează buguri
make dev-mcp-probe     # dump lista de tools -> tools/.medusa-mcp-tools.txt
```

**REGULĂ:** Nu invoca tool-uri MCP `Delete*`, `*Cancel*`, `*Refund*` fără confirmare per apel. Pre-1.0 community server, fără teste publice.

---

## Plugin-uri Claude Code de instalat

```
/plugin marketplace add medusajs/medusa-claude-plugins
/plugin install medusa-dev@medusa
```

---

## Documentație de referință

- [01 — Analiză Catalog Wix](docs/01-catalog-analysis.md)
- [02 — Analiză Site Live](docs/02-site-analysis.md)
- [03 — Mapare Wix → Medusa v2](docs/03-wix-to-medusa-mapping.md)
- [04 — Plan de Implementare](docs/04-implementation-plan.md)
