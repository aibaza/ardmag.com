# ardmag.com - Secrets si Credentiale

**UZ INTERN SURCOD. NU SE TRIMITE CLIENTULUI.**

Acest fisier contine toate credentialele active ale proiectului ardmag.com. Se pastreaza local, nu se comite in repo.

---

## Backend Railway - Environment Variables

Acestea se seteaza in Railway dashboard si in `backend/.env` pentru dev local.

```
# Baza de date
DATABASE_URL=postgres://dc@localhost:5432/ardmag        # dev local
# pe Railway: Railway injecteaza automat DATABASE_URL pentru addon-ul PostgreSQL

# Cache
REDIS_URL=redis://localhost:6379                        # dev local
# pe Railway: Railway injecteaza automat REDIS_URL pentru addon-ul Redis

# JWT / Cookie
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

# Stripe
STRIPE_API_KEY=sk_test_51R8iFVR4lUTZNLQUreqxgb9LGC80uR2aG4yZuZG0GLlo1pECLv7DQpDtmwT4s80wk77AM9Lhu8lFJTN2hLIUSLbU003HMk9Qy2
# STRIPE_WEBHOOK_SECRET - nesetat inca

# SMTP2GO
SMTP2GO_API_KEY=api-5AFD6A2F600948DFAF02F6E1AA140D55
SMTP2GO_BASE_URL=https://api.smtp2go.com/v3/
SMTP_FROM=ardmag@surcod.ro
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=587
SMTP_USER=office@surcod.ro
SMTP_PASS=tYtSGviz1thxxiw1

# Cloudflare R2
R2_ACCOUNT_ID=194d5055ba03a70f947b628fc0ecc1f6
R2_ACCESS_KEY_ID=0c80e8b17ea6a34ae0f60d5ca3a9f280
R2_SECRET_ACCESS_KEY=a1985267a5983d419fa8debe7f424fcd87a550baf3733605983b216f7c15ff54
R2_BUCKET=adrmag
R2_PUBLIC_URL=https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev

# CORS
STORE_CORS=http://localhost:8000,https://docs.medusajs.com,https://ardmag.surmont.co
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://admin.ardmag.surmont.co
AUTH_CORS=http://localhost:8000,http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://ardmag.surmont.co,https://admin.ardmag.surmont.co
```

---

## Storefront Vercel - Environment Variables

Fisier local: `backend-storefront/.env.local`

```
# Backend URL
MEDUSA_BACKEND_URL=http://localhost:9000                # dev local
# pe Vercel: MEDUSA_BACKEND_URL=https://api.ardmag.surcod.ro

# Publishable API Key Medusa
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_56dae88717f8f6c8d4632979fb5f50d99ef68a41a6e89096ef500063ee7a35af

# Base URL
NEXT_PUBLIC_BASE_URL=https://ardmag.surmont.co         # dev tunnel
# pe Vercel: NEXT_PUBLIC_BASE_URL=https://ardmag.surcod.ro

# Stripe
NEXT_PUBLIC_STRIPE_KEY=pk_test_51R8iFVR4lUTZNLQURMkoP7rsHLI5AJo2bGr0CRvYLSSjeW2a093r5YVnnTTiVAsQRXsBdU569kC1tnhRAUnCQ8eZ00DxP34qNH

# Regiune default
NEXT_PUBLIC_DEFAULT_REGION=ro

# Revalidare cache
REVALIDATE_SECRET=supersecret

# SMTP2GO (daca e folosit si din storefront)
SMTP2GO_API_KEY=api-5AFD6A2F600948DFAF02F6E1AA140D55
```

---

## Medusa Admin

- **URL:** https://api.ardmag.surcod.ro/app
- **Email:** admin@ardmag.com
- **Parola:** Admin1234!

---

## Cloudflare R2

- **Account ID:** 194d5055ba03a70f947b628fc0ecc1f6
- **Access Key ID:** 0c80e8b17ea6a34ae0f60d5ca3a9f280
- **Secret Access Key:** a1985267a5983d419fa8debe7f424fcd87a550baf3733605983b216f7c15ff54
- **S3 endpoint:** https://194d5055ba03a70f947b628fc0ecc1f6.r2.cloudflarestorage.com
- **Bucket:** `adrmag` (nu `ardmag` - typo intentional, asa a fost creat)
- **Public URL:** https://pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev

---

## Stripe

- **Test Publishable Key:** pk_test_51R8iFVR4lUTZNLQURMkoP7rsHLI5AJo2bGr0CRvYLSSjeW2a093r5YVnnTTiVAsQRXsBdU569kC1tnhRAUnCQ8eZ00DxP34qNH
- **Test Secret Key:** sk_test_51R8iFVR4lUTZNLQUreqxgb9LGC80uR2aG4yZuZG0GLlo1pECLv7DQpDtmwT4s80wk77AM9Lhu8lFJTN2hLIUSLbU003HMk9Qy2
- **Live keys:** asteptate de la Cristian Rinzis - neintegrate inca
- **Webhook secret (STRIPE_WEBHOOK_SECRET):** nesetat inca

---

## GHCR (GitHub Container Registry)

- **Organizatie GitHub:** github.com/aibaza
- **Image:** ghcr.io/aibaza/ardmag-backend:latest
- **Autentificare push:** `docker login ghcr.io -u <github-user> -p <PAT cu write:packages>`
- Railway trage automat imaginea noua la fiecare push (webhook configurat).

---

## DNS Cloudflare (zone: surcod.ro)

| Hostname | Tip | Target | Proxy |
|---|---|---|---|
| ardmag.surcod.ro | CNAME | cname.vercel-dns.com | DNS-only (gray cloud) |
| api.ardmag.surcod.ro | CNAME | vulr3lsz.up.railway.app | DNS-only (gray cloud) |
| ardmag.surmont.co | - | Cloudflare Tunnel (dev, laptop Ciprian) | - |
| admin.ardmag.surmont.co | - | Cloudflare Tunnel (dev) | - |

Nota: proxy-ul Cloudflare (orange cloud) este dezactivat pe ambele recorduri de productie. Daca il activezi, Railway si Vercel pot avea probleme cu SSL.

---

## Comenzi utile

```bash
# deploy imagine noua pe GHCR + Railway redeploy automat
cd backend
npm run build
docker build -f Dockerfile.ghcr -t ghcr.io/aibaza/ardmag-backend:latest .
docker push ghcr.io/aibaza/ardmag-backend:latest

# fix thumbnails R2 (daca e nevoie)
MEDUSA_BACKEND_URL=https://api.ardmag.surcod.ro npx ts-node scripts/fix-thumbnails-r2.ts --apply

# upload imagini in R2 (one-time)
MEDUSA_BACKEND_URL=https://api.ardmag.surcod.ro npx ts-node scripts/upload-images-to-r2.ts --apply

# smoke test productie
cd backend-storefront
BASE_URL=https://ardmag.surcod.ro npx playwright test tests/e2e/smoke.spec.ts --project=chromium-desktop
```
