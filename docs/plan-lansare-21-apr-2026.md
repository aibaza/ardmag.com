# Plan — Finalizare și lansare ardmag.com (sprint 21-26 apr 2026)

> Document de referință. Nu modifica direct — e snapshot-ul planului aprobat pe 21 apr 2026.
> Sub-planuri de implementare se află în `.claude/plans/`. Dacă există conflicte, acest document are prioritate.

## Context

Pe 21 aprilie 2026 Ciprian (SurCod) și Andrei Rînziș (Arc Rom Diamonds) au avut o discuție WhatsApp care a deblocat decizia de migrare completă de pe Wix pe noul site Medusa v2 + Next.js construit în ultimele 2 săptămâni. Andrei a accesat site-ul deployment temporar pe `ardmag.surmont.co` (rulează de pe laptopul lui Ciprian — returnează 502 când laptopul e offline), a identificat câteva probleme (etichete brand Delta vs Tenax amestecate, orar 8-17 în loc de 8-16, TVA aplicat dublu) și au discutat arhitectura sistemelor actuale pe Wix.

Chat-ul a confirmat că pe Wix aproape nimic nu e automat: AWB-urile FAN Courier se generează manual, facturile se fac manual (Wix doar dă receipt), stock keeping e manual, nu există SKU (se referă la produse după denumire), listele de prețuri sunt out-of-date, catalogul master nu există (doar cataloage fizice per furnizor). Migrația aduce valoare reală, nu e port 1:1.

Target de lansare: **end-of-week 24-26 apr 2026** (agresiv). Asta implică MVP strict: ceea ce e absolut necesar pentru a încasa bani online și a procesa comenzi. Features secundare (FAN Courier API cu AWB auto, blog MDX cu articole, ANAF e-Factura, tax-exempt pentru clienți externi, WinMentor inventory sync) rămân post-launch.

**Strategie domain:** launch pe `magazin.ardmag.com` cu Wix viu pe apex `ardmag.com`. După verificare live ~1 săptămână, cutover DNS la Vercel cu 301 redirects de pe toate URL-urile Wix indexate.

---

## Stack final (6 servicii, 4 deja existente)

| Serviciu | Status | Cost/mo | Scop |
|---|---|---|---|
| GitHub | ✅ existent | 0 | Repo + Actions CI minim |
| Stripe | ✅ existent (keys de luat de la Cristian) | fee tranz | Plata card |
| SMTP2GO | ✅ existent plătit | 0 | Email tranzacțional |
| Cloudflare | ✅ existent | 0 | DNS + R2 imagini + CDN |
| Vercel | 🆕 nou (Hobby free) | 0 | Storefront Next.js |
| Railway | 🆕 nou | ~$15 | Medusa + Postgres + Redis bundled (EU Frankfurt) |

**Total infra nou: ~$15/mo** (vs ~50 EUR/mo Wix actual). Backup Postgres automat în Railway, rollback 1-click pe Vercel.

---

## Ce e deja făcut (verificat prin explorare cod)

**Catalog & checkout:**
- Medusa v2.13.6 + regiunea RO + tax 21% tax-inclusive (commit `97650a3`)
- Import complet Wix: 90 produse, 775 variante active, SKU auto-generate 100%
- Checkout complet RO: address → delivery → payment → review
- 5 shipping options flat-rate (FAN Courier, Sameday, Cargus, Poșta, pickup Cluj)
- Free shipping peste 500 RON

**Storefront:**
- Homepage + listing + PDP + cart + account — toate wire-d la Medusa real
- SEO infrastructure: metadata, sitemap dinamic, robots staging/prod, JSON-LD complet
- 26 componente design + 3 pagini refactorizate — PASS
- A11y WCAG AA verificat
- Orar 08-16 corect în toate locurile live

**Probleme semnalate de Andrei deja rezolvate:**
- ✅ Orar 8-17 → 8-16 (commit `97650a3`)
- ✅ TVA aplicat dublu → tax-inclusive (commit `97650a3`)

---

## Blocks de muncă — 8 blocuri prioritizate

### Bloc 1 — Data correctness (critic, primul)

**1.1 Audit etichete brand Delta vs Tenax**
- Script nou `backend/src/scripts/audit-brand-tags.ts`: listează produse + categorii cu brand real vs declarat
- Cross-check: GLAXS/TIXO/MASTIC* → Tenax; FILAGLOSS/ECOMULTI/STAINBLOC → Delta Research
- Output raport `docs/brand-audit-report.md` pentru review Andrei
- Aplicare corecții după OK via script update

**1.2 Update liste prețuri (blocker extern — Andrei)**
- Când vin prețurile actualizate: re-import cu flag `--update-prices-only`
- Validare prin `docs/reports/07-enrichment-report.md`

### Bloc 2 — Infrastructure cloud (critic — blochează totul)

**2.1 Railway backend setup**
- Creare proiect Railway + servicii: Medusa container, Postgres, Redis
- `backend/Dockerfile` nou (Node 20 + npm start) + `.dockerignore`
- `backend/railway.json` blueprint-as-code versionat în repo
- Env vars transferate din `backend/.env`: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `SMTP2GO_API_KEY`, `S3_*` R2 credentials
- Start command: `npx medusa db:migrate && npx medusa start`
- Healthcheck endpoint expus la `/health`

**2.2 Vercel storefront setup**
- Conectare repo GitHub la Vercel
- Env: `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.ardmag.com`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL=https://magazin.ardmag.com`
- Image optimization config pentru R2 bucket în `backend-storefront/next.config.js`
- Preview deployments automate pe PR

**2.3 Cloudflare DNS + R2 setup**
- R2 bucket `ardmag-media` creat
- Custom domain: `media.ardmag.com` → R2 bucket (CDN public)
- DNS records noi: `magazin.ardmag.com` CNAME → Vercel, `api.ardmag.com` CNAME → Railway, `staging.ardmag.com` CNAME → Vercel preview (long-lived branch `staging`)
- SSL auto via Cloudflare

**Critical files noi:**
- `backend/Dockerfile`, `backend/.dockerignore`, `backend/railway.json`
- `backend-storefront/next.config.js` (update image remote patterns pentru R2)
- `.github/workflows/ci.yml` (lint + tsc + auto-deploy trigger)

### Bloc 3 — Migrare imagini în R2 (critic — scoate 286MB din backend)

**3.1 Script upload one-time**
- `backend/src/scripts/upload-images-to-r2.ts`: scannează `backend/static/images/`, urcă în R2 cu același path, updatează URL-urile în DB
- Folosește AWS SDK v3 (S3-compatible) cu endpoint R2
- Dry-run mode + confirmare

**3.2 Medusa plugin S3 pentru upload-uri viitoare**
- `@medusajs/file-s3` instalat în `medusa-config.ts` modules config
- Env: `S3_FILE_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION=auto`, `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com`
- Admin Medusa urcă imaginile direct în R2 pentru produse viitoare

**3.3 Curățare repo**
- După upload confirmat: `git rm -r backend/static/images/` + `resources/images/`
- Repo scade de la ~500MB la <50MB
- Update `.gitignore` pentru a preveni re-adăugarea

### Bloc 4 — Stripe payment live

**4.1 Instalare Stripe provider**
- `@medusajs/payment-stripe` în `backend/medusa-config.ts` modules.paymentService
- Script `backend/src/scripts/setup-ro-payment.ts` (șablon `setup-ro-shipping.ts`) pentru link provider la regiunea RO

**4.2 Frontend checkout**
- Checkout UI deja pregătit (`CheckoutPayment.tsx:26-31`). Verificare integrare Elements / PaymentElement cu App Router Next.js 15
- Test end-to-end cu test keys înainte de comutare live

**4.3 Ramburs real**
- Actualul "Ramburs" e `pp_system_default` redenumit — marchează automat `paid`, incorect pentru COD
- Fix: subscriber `backend/src/subscribers/order-placed-cod.ts` care setează `payment_status: awaiting` pentru metoda "ramburs" până la confirmare curier

**Critical files:**
- `backend/medusa-config.ts` (modules update)
- `backend/src/scripts/setup-ro-payment.ts` nou
- `backend/src/subscribers/order-placed-cod.ts` nou
- `backend-storefront/src/modules/checkout/components/CheckoutPayment.tsx` (verificare integrare Elements)

### Bloc 5 — Notificări email via SMTP2GO

**5.1 Notification provider custom**
- `backend/src/modules/notification-smtp2go/` nou (Medusa v2 custom notification provider)
- Folosește `nodemailer` cu SMTP2GO SMTP relay
- Config în `medusa-config.ts` modules.notificationProviderService

**5.2 Subscriber `order.placed`**
- `backend/src/subscribers/order-placed-notify.ts` nou
- Email la `office@arcromdiamonds.ro`: număr comandă, client, produse, total, metodă plată, adresă livrare
- Email confirmare la client: template simplu text + HTML basic
- Templates în `backend/src/emails/` (fișiere HTML)

**5.3 Email template contact form**
- Același provider folosit pentru `/contact` submissions

### Bloc 6 — Pagini statice (Termeni, Livrare, GDPR, Contact, Despre)

Toate link-urile din `SiteFooter.tsx:21-23,40` sunt `href="#"`. Site-ul Wix nu are conținut reutilizabil (verificat — toate paginile sunt placeholder-uri template Wix). **Fallback la template RO generic**, personalizat cu datele Arc Rom Diamonds. Andrei/jurist revizuiesc post-launch.

**6.1 /despre-noi** — rescrisă pe baza `docs/02-site-analysis.md`: 2001, 25 ani, distribuitor Tenax, Delta Research preluată 2011, distribuție 12-18 țări

**6.2 /contact** — telefon +40 722 155 441, email office@arcromdiamonds.ro, adresă Calea Baciului 1-3 Cluj, orar 08-16, Google Maps embed, formular de contact (trimite prin SMTP2GO)

**6.3 /livrare-si-plata** — shipping options + costuri + "livrare gratuită peste 500 RON" + ramburs + Stripe + timp livrare 1-3 zile lucrătoare

**6.4 /termeni-si-conditii** — template GDPR + ANPC standard RO B2B/B2C adaptat cu date Arc Rom Diamonds (CUI 13828707, J12/553/2001, adresa), link ANPC

**6.5 /confidentialitate (GDPR)** — template datele colectate, cookie policy cross-reference, drepturi subiect, contact DPO

**6.6 /cookie-policy** — lista cookies folosite (GA4, Meta Pixel, Stripe session), legătură cu cookie consent banner

**Critical files noi:**
- `backend-storefront/src/app/[countryCode]/(main)/despre-noi/page.tsx`
- `backend-storefront/src/app/[countryCode]/(main)/contact/page.tsx`
- `backend-storefront/src/app/[countryCode]/(main)/livrare-si-plata/page.tsx`
- `backend-storefront/src/app/[countryCode]/(main)/termeni/page.tsx`
- `backend-storefront/src/app/[countryCode]/(main)/confidentialitate/page.tsx`
- `backend-storefront/src/app/[countryCode]/(main)/cookie-policy/page.tsx`

**Update:**
- `backend-storefront/src/modules/layout/site-footer/SiteFooter.tsx:21-23,40` (înlocuire `href="#"`)

### Bloc 7 — Analytics + Cookie consent (obligatoriu GDPR)

**7.1 Cookie consent banner**
- Component nou `backend-storefront/src/components/cookie-consent/CookieConsent.tsx`
- Librărie: `react-cookie-consent` (simplu, GDPR-compliant, zero server dep)
- Opțiuni: Accept all / Reject all / Customize (toggle GA4 / Meta Pixel separat)
- Stocare preferință în localStorage + cookie `ardmag-consent`

**7.2 GA4 wire-up conditional**
- Component `GoogleAnalytics.tsx` care se încarcă doar dacă consent acordat
- Env: `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXX` (Ciprian creează cont GA4 pentru ardmag.com)
- Events standard: page_view automat, add_to_cart, purchase (din checkout)

**7.3 Meta Pixel wire-up conditional**
- Același pattern, încărcat doar cu consent
- Env: `NEXT_PUBLIC_META_PIXEL_ID=XXXX` (blocker extern — Andrei dă admin FB, apoi creăm Pixel)
- Events: PageView, AddToCart, Purchase, InitiateCheckout

**Blocker extern:** accesul admin Facebook pentru crearea Pixel-ului e așteptat de la sora lui Andrei.

### Bloc 8 — SEO redirects Wix → site nou (pentru cutover apex)

**Nu e blocker pentru lansare pe `magazin.ardmag.com`, dar critic pentru cutover apex ulterior.**

**8.1 Export URL-uri indexate din Wix**
- Blocker extern: acces Google Search Console (Andrei / Cristian)
- Export `Performance > Pages` + `Coverage > Valid` → CSV

**8.2 Generare mapping slug-uri**
- Script `scripts/generate-redirect-map.ts`: citește CSV + slug-urile noi Medusa
- Output: `backend-storefront/src/middleware-redirects.ts` cu obiect `{ "/category/șlefuire-piatră": "/categorii/dischete-si-discuri-de-slefuit", ... }`
- Cross-check manual pentru mapări ambigue

**8.3 Vercel middleware redirects**
- `backend-storefront/middleware.ts`: 301 permanent pe match-uri
- Rute care nu match → homepage (soft)
- Submit sitemap nou în GSC post-cutover

---

## TODO-uri externe (blockers de la Andrei / Cristian)

**Infra + payments:**
- [ ] Furnizat Stripe live keys: `pk_live_*`, `sk_live_*`, `whsec_*` (Cristian are dashboard)
- [ ] Confirmat că DNS-ul pentru `ardmag.com` e la SurCod sau transferat (altfel trebuie transfer registrar)
- [ ] Acces Google Search Console pentru `ardmag.com` (pentru export URL-uri + submit sitemap nou)

**Content:**
- [ ] Trimisă lista de prețuri actualizată (digital, fără TVA) — pentru Bloc 1.2
- [ ] Listă exactă produse cu ribbon PROMO 30% Mastici Tenax (6 din 19 în categorie, de confirmat care)
- [ ] Trimise PDF-uri fișe tehnice pentru restul categoriilor (discuri, abrazivi)
- [ ] Decizie brand audit post-review raport Bloc 1.1

**Social:**
- [ ] Admin Facebook page pentru Ciprian (via sora lui Andrei) — blocker pentru Meta Pixel
- [ ] Admin Instagram (same)

**Wix decommission:**
- [ ] Decizie: export CSV clienți + comenzi istorice din Wix înainte de anulare abonament?

**Post-launch (neblocante acum):**
- [ ] Documentație API FAN Courier
- [ ] Documentație API WinMentor (pentru inventory sync)

---

## Timeline execuție (21-26 apr 2026)

**Marți 21 apr seara — Miercuri 22 apr**
- Bloc 1.1: audit brand Delta vs Tenax → raport pentru Andrei
- Bloc 2.1: Railway setup + Dockerfile + deploy backend
- Bloc 2.2: Vercel setup + deploy storefront preview
- Bloc 2.3: Cloudflare DNS + R2 bucket

**Joi 23 apr**
- Bloc 3: migrare imagini în R2 + curățare repo
- Bloc 4.1 + 4.2: Stripe în Medusa + test end-to-end cu test keys
- Bloc 5: SMTP2GO provider + subscriber order.placed

**Vineri 24 apr**
- Bloc 6: cele 6 pagini statice (templates RO adaptate)
- Bloc 7: cookie consent + GA4 (Meta Pixel când vin credențiale FB)
- Bloc 4.3: ramburs COD subscriber
- Re-găzduire PDF-uri fișe tehnice în R2

**Sâmbătă 25 apr — Duminică 26 apr**
- Integrare Stripe live keys (dacă primite)
- Integrare prețuri actualizate (dacă primite)
- Update catalog brand tags (dacă audit OK)
- Smoke test complet + Andrei testează comandă reală
- **Lansare pe `magazin.ardmag.com`** cu Wix viu pe apex

**Săptămâna 27 apr - 3 mai (post-launch)**
- Bloc 8: SEO redirects mapping + Vercel middleware
- Cutover apex `ardmag.com` la Vercel
- Meta Pixel wire-up după admin FB
- Blog MDX: primele 2-3 articole ("cum alegi un disc", "ce face diferența la un mastic de calitate")
- Prima campanie Facebook ads

**Q2 2026 (post-launch extensiv)**
- FAN Courier API integration (AWB auto, calcul transport pe greutate)
- WinMentor inventory sync
- ANAF e-Factura
- Tax-exempt pentru clienți externi
- Script AI extragere date din fișele tehnice PDF

---

## Riscuri majore + fallbacks

1. **Stripe live keys nu ajung vineri** — fallback: lansăm doar cu ramburs, Stripe la 48-72h după
2. **Cloudflare DNS nu e la SurCod** — fallback: lansăm pe `magazin.ardmag.com` cu subdomain temporar, cutover apex când Andrei face transfer
3. **Liste de prețuri întârziate** — fallback: lansare cu prețuri actuale, notă în admin pentru update bulk
4. **Bug critic Stripe descoperit vineri** — fallback: dezactivăm Stripe provider, rămâne doar ramburs până luni
5. **R2 upload eșuează parțial** — fallback: reluăm script cu skip-existing flag, imaginile nemigrate rămân servite de Railway volume temporar
6. **Facebook admin întârzie** — Meta Pixel se adaugă post-launch, nu blochează lansarea

---

## Verificare end-to-end (checklist pre go-live)

1. `https://magazin.ardmag.com` accesibil, fără HTTP 502, SSL verde
2. `https://api.ardmag.com/health` răspunde 200 OK
3. Formular contact trimite email la `office@arcromdiamonds.ro`
4. Comanda test cu card Stripe test: (a) plata trece, (b) Andrei primește email notificare, (c) clientul primește email confirmare, (d) statusul în admin Medusa = `paid`
5. Comanda test cu Ramburs: status = `awaiting payment` (nu `paid`)
6. Fișa tehnică PDF deschide corect de pe pagina produs (din R2)
7. Imaginile produselor se încarcă de pe `media.ardmag.com` (R2 CDN)
8. Free shipping peste 500 RON se aplică automat
9. Promoție -30% Mastici Tenax se aplică pe produsele marcate
10. Toate linkurile din footer funcționează (nu `#`)
11. Sitemap accesibil pe `/sitemap.xml`, robots permite crawl pe prod, disallow pe staging
12. Orar afișat 08-16 peste tot (homepage, footer, contact)
13. Cookie banner apare la primă vizită, respectă alegerea
14. GA4 primește events (page_view, add_to_cart, purchase) doar după consent
15. A11y WCAG AA verificat pe pagini noi (Termeni, GDPR, etc.)

---

## Artefacte de actualizat în repo

- `docs/04-implementation-plan.md` — marcare Faza 5 ca "în curs"
- `docs/impl/STATUS.md` — adăugare secțiune "Faza 5: Deploy + Launch"
- Nou: `docs/launch-checklist-25-apr.md` — checklist operațional pentru Ciprian
- Nou: `docs/brand-audit-report.md` — output Bloc 1.1 pentru Andrei
- Update: `CLAUDE.md` — stack production (Vercel + Railway + Cloudflare) documentat
