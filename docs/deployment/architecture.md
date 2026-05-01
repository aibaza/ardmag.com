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
| Storefront (Next.js) | Self-hosted, 10.57.1.100:8000 | https://ardmag.surmont.co |
| Backend Admin + API | Self-hosted, 10.57.1.100:9000 | https://admin.ardmag.surmont.co |
| Backend API (storefront) | Railway | https://api.ardmag.surcod.ro |
| PostgreSQL | Self-hosted, localhost:5432/ardmag | pe aceeasi masina |
| Redis | Docker container `redis-ardmag`, localhost:6379 | pe aceeasi masina |
| Reverse proxy | OpenResty pe 10.57.1.10 | termina SSL, proxiaza la 10.57.1.100 |
| Object storage (imagini) | Cloudflare R2 | https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev |
| DNS | Cloudflare | surmont.co zone |

---

## URL-uri de productie

- **Storefront:** https://ardmag.surmont.co
- **Admin panel:** https://admin.ardmag.surmont.co/app
- **Health check backend local:** http://10.57.1.100:9000/health
- **API Railway (folosit de storefront):** https://api.ardmag.surcod.ro

---

## Infrastructura self-hosted

Masina de productie: IP extern 188.24.19.120, IP LAN 10.57.1.100.

### Servicii systemd (user dc)

```bash
# status
systemctl --user status ardmag-backend.service
systemctl --user status ardmag-storefront.service

# restart
systemctl --user restart ardmag-backend.service
systemctl --user restart ardmag-storefront.service

# logs
journalctl --user -u ardmag-backend.service -n 50
journalctl --user -u ardmag-storefront.service -n 50
```

Ambele servicii sunt enabled (pornesc automat la boot via linger: `loginctl enable-linger dc`).

### Redis

```bash
docker start redis-ardmag      # pornire manuala daca e cazul
docker ps | grep redis-ardmag  # verifica status
```

Containerul are `--restart unless-stopped` - porneste automat cu Docker daemon.

### Note importante

- `medusa start` ruleaza din `backend/` (directorul sursa), nu din `.medusa/server/`
- Admin build-ul trebuie sa existe la `backend/public/admin/` - daca lipseste, copiaza din `backend/.medusa/server/public/admin/`
- OpenResty (10.57.1.10) nu e pe aceeasi masina - nu ai SSH access direct; config-ul lui nu e in repo

---

## DNS Setup (Cloudflare)

| Record | Tip | Target |
|---|---|---|
| ardmag.surmont.co | A | 188.24.19.120 |
| admin.ardmag.surmont.co | A | 188.24.19.120 |
| api.ardmag.surcod.ro | CNAME | vulr3lsz.up.railway.app |

---

## Railway - Backend API (pentru storefront)

Storefront-ul (`ardmag.surmont.co`) face fetch-uri la `https://api.ardmag.surcod.ro` - acesta e un backend Medusa separat pe Railway. Gestionat independent.

### Port

Railway asigneaza automat `PORT=8080`.

---

## Cloudflare R2 - Object Storage

- **Bucket:** `adrmag` (nota: typo intentional - asa a fost creat, nu `ardmag`)
- **Public URL:** https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev
- **S3 endpoint:** https://194d5055ba03a70f947b628fc0ecc1f6.r2.cloudflarestorage.com

R2 serveste toate imaginile de produs. Bucket-ul are acces public activat. Credentialele (Account ID, Access Key, Secret Key) sunt in `docs/deployment/SECRETS.md` si in Railway env vars.

---

## Deploy - Backend self-hosted

La modificari de cod in `backend/`:

```bash
cd backend
npm run build
# copiaza admin build daca lipseste:
# cp -r .medusa/server/public/admin public/admin
systemctl --user restart ardmag-backend.service
```

La modificari in `backend-storefront/`:

```bash
cd backend-storefront
npm run build
systemctl --user restart ardmag-storefront.service
```

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
# health check backend
curl https://admin.ardmag.surmont.co/health

# storefront
curl -I https://ardmag.surmont.co/
```
