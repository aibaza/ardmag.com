# ardmag.com - Arhitectura si Deployment

## Stack

| Component | Versiune / Tehnologie |
|---|---|
| Backend | Medusa v2.13.6 |
| Storefront | Next.js 15 |
| Baza de date | PostgreSQL |
| Cache | Redis |
| Object storage | Cloudflare R2 |
| Plati | Stripe |
| Email tranzactional | SMTP2GO |
| Container registry | GitHub Container Registry (GHCR) |

---

## Unde ruleaza fiecare serviciu

| Serviciu | Platforma | URL |
|---|---|---|
| Backend API + Admin | Railway | https://api.ardmag.surcod.ro |
| Storefront | Vercel | https://ardmag.surcod.ro |
| PostgreSQL | Railway (addon) | gestionat de Railway |
| Redis | Railway (addon) | gestionat de Railway |
| Object storage (imagini) | Cloudflare R2 | https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev |
| DNS | Cloudflare | surcod.ro zone |
| Container images | GHCR | ghcr.io/aibaza/ardmag-backend:latest |

---

## URL-uri de productie

- **Storefront:** https://ardmag.surcod.ro
- **Backend API:** https://api.ardmag.surcod.ro
- **Admin panel:** https://api.ardmag.surcod.ro/app
- **Health check:** https://api.ardmag.surcod.ro/health (trebuie sa returneze 200)

---

## DNS Setup (Cloudflare)

Ambele recorduri sunt DNS-only (gray cloud - proxy Cloudflare dezactivat).

| Record | Tip | Target |
|---|---|---|
| ardmag.surcod.ro | CNAME | cname.vercel-dns.com |
| api.ardmag.surcod.ro | CNAME | vulr3lsz.up.railway.app |

Subdomeniile `.surmont.co` sunt folosite pentru dev local (Cloudflare Tunnel pe laptopul lui Ciprian) si nu sunt relevante pentru productie.

---

## Railway - Backend

### Port

Railway asigneaza automat `PORT=8080`. Medusa trebuie sa asculte pe acest port, nu pe 9000 (care e default-ul Medusa pentru dev local).

### Start command

```
npx medusa db:migrate && npx medusa start
```

Migratiile ruleaza automat la fiecare deploy, inainte de pornirea serverului.

### Variabile de mediu

Toate secretele sunt setate ca environment variables in Railway dashboard. Nu exista fisiere `.env` pe Railway. Valorile concrete sunt in `docs/deployment/SECRETS.md` (uz intern SurCod, nu se da clientului).

---

## Vercel - Storefront

Storefront-ul Next.js este deploiat pe Vercel conectat la repo-ul GitHub. Deploy automat la push pe branch-ul principal.

Variabilele de mediu sunt setate in Vercel dashboard (Settings > Environment Variables). Valorile concrete sunt in `docs/deployment/SECRETS.md`.

---

## Cloudflare R2 - Object Storage

- **Bucket:** `adrmag` (nota: typo intentional - asa a fost creat, nu `ardmag`)
- **Public URL:** https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev
- **S3 endpoint:** https://194d5055ba03a70f947b628fc0ecc1f6.r2.cloudflarestorage.com

R2 serveste toate imaginile de produs. Bucket-ul are acces public activat. Credentialele (Account ID, Access Key, Secret Key) sunt in `docs/deployment/SECRETS.md` si in Railway env vars.

---

## Docker / GHCR - Container Flow

Exista doua Dockerfile-uri in `backend/`:

- **`backend/Dockerfile.ghcr`** - build real. Compileaza aplicatia, instaleaza dependintele, produce imaginea finala.
- **`backend/Dockerfile`** - FROM-only. Contine doar `FROM ghcr.io/aibaza/ardmag-backend:latest`. Acesta este fisierul pe care il foloseste Railway.

Logica: Railway nu face build local - trage imaginea pre-built din GHCR. Noi facem build local si push pe GHCR, Railway detecteaza imaginea noua si redeploy-uieste automat.

### Deploy flow complet

```bash
cd backend
npm run build
docker build -f Dockerfile.ghcr -t ghcr.io/aibaza/ardmag-backend:latest .
docker push ghcr.io/aibaza/ardmag-backend:latest
```

Dupa push, Railway trage automat imaginea noua si restarteaza serviciul.

---

## Servicii externe

| Serviciu | Rol | Status |
|---|---|---|
| GitHub (aibaza org) | Repo sursa + GHCR container registry | activ |
| Stripe | Procesare plati | test keys active, live keys neintegrate inca |
| SMTP2GO | Email tranzactional (confirmare comanda, reset parola) | activ |
| Cloudflare | DNS pentru surcod.ro + R2 object storage | activ |

---

## Unde sunt credentialele

| Mediu | Unde sunt secretele |
|---|---|
| Dev local | `backend/.env` (nu se comite in repo) |
| Productie backend | Railway dashboard - Environment Variables |
| Productie storefront | Vercel dashboard - Environment Variables |
| Documentatie interna | `docs/deployment/SECRETS.md` (uz intern SurCod) |

---

## Structura repo

```
ardmag.com/
- backend/              # Medusa v2 app + Dockerfile-uri
- backend-storefront/   # Next.js 15 storefront
- scripts/              # scripturi one-time (import catalog, upload imagini R2)
- docs/                 # documentatie proiect
- resources/            # design system, catalog Wix CSV, logo
```

---

## Smoke test productie

```bash
cd backend-storefront
BASE_URL=https://ardmag.surcod.ro npx playwright test tests/e2e/smoke.spec.ts --project=chromium-desktop
```
