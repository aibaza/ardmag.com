# 04 — Plan de Implementare

---

## Principiu de execuție

Faza 1 se poate executa complet fără design din track-ul B — rulează pe template-ul Next.js starter Medusa, neutru. Fazele 3+ necesită livrarea designului. Marcajul `[TRACK-B]` indică dependența de designul din track-ul B.

---

## Faze

### Faza 0 — Decizii pre-implementare (0 ore cod, blocker pentru Faza 1)

**REZOLVAT — toate deciziile luate pe 2026-04-18.**

1. **Categoriile pentru cele 8 produse fără collection:** ÎNTREȚINERE ȘI CERURI, DETERGENȚI ACIZI, DETERGENȚI, TRATAMENTE SPECIFICE, IMPERMEABILIZANȚI PE BAZĂ DE APĂ, IMPERMEABILIZANȚI PE BAZĂ DE SOLVENȚI → SOLUȚII PENTRU PIATRĂ. CAROTE DIAMANTATE, DISC DE ȘLEFUIRE CONCAV → ȘLEFUIRE PIATRĂ.
2. **FIR DIAMANTAT și orice produs/variantă cu preț 0:** importat ca `draft` (nepublicat), marcat în `docs/catalog-issues.md`.
3. **Monedă:** RON, single-currency în Faza 1.
4. **TVA:** 21% standard (cota în vigoare din august 2025 în România).
5. **Plată Faza 1:** Cash on Delivery. Stripe în Faza 5 (producție).
6. **Email tranzacțional:** SMTP2GO (cont existent).
7. **Hosting producție:** decizie în Faza 5; DNS la registrar client (de clarificat). Dev exclusiv local până atunci.
8. **Audit log modificări catalog:** `docs/catalog-audit-log.md` — fiecare modificare față de CSV original, cu produs, câmp, valoare veche, valoare nouă, motiv.
9. **Issues catalog:** `docs/catalog-issues.md` — lista problemelor din catalog de rezolvat manual.

**Criteriu de gata:** ÎNDEPLINIT.

---

### Faza 1 — Bootstrap + Import Catalog (estimat: 8-12 ore)

**Deliverables:**
- Medusa v2 backend funcțional pe localhost (port 9000)
- Next.js storefront pe localhost (port 8000) pe template starter Medusa
- 90 produse importate cu variante active, categorii, imagini
- Admin Medusa la `localhost:9000/app` cu toate produsele vizibile

**Blockerele pentru start:** Deciziile din Faza 0 trebuie rezolvate.

**Pași:**

1. **Bootstrap Medusa v2** (1-2h)
   - `npx create-medusa-app@latest` cu PostgreSQL local
   - Configurare `.env`: DATABASE_URL, STORE_CORS, ADMIN_CORS, JWT_SECRET
   - `medusa migrations run`, `medusa seed` (seed default pentru a testa că totul funcționează)
   - Verificare: admin la `localhost:9000/app` e accesibil

2. **Bootstrap Next.js storefront** (1h)
   - Clonare `https://github.com/medusajs/nextjs-starter-medusa`
   - Configurare `.env.local`: `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000`
   - `npm install && npm run dev`
   - Verificare: homepage la `localhost:8000` afișează produsele seed

3. **Script de import CSV** (4-6h)
   - Locație: `scripts/import-wix-catalog.ts`
   - Input: `resources/Wix Products Catalog.csv`
   - Pași interni:
     - Parsare CSV (UTF-8 BOM)
     - Creare categorii (9 categorii cunoscute + categoriile decise din Faza 0)
     - Per fiecare Product row: creare produs, opțiuni, variante active
     - Construire URL imagini și descărcare (cu rate limiting)
     - Logging: progres, warning-uri (surcharge gol, FIR DIAMANTAT), erori
   - Verificare: `90 products created, 775 variants created` în log

4. **Validare post-import** (1h)
   - Admin Medusa: 90 produse vizibile în listing
   - Produs cu cele mai multe variante (DISCHETE DE ȘLEFUIT CU CARBURĂ): 100 variante, nu 360
   - Produs simplu (MASTIC SEMISOLID WET): 1 variantă default, preț 790 RON
   - Produs cu opțiune COLOR (MASTIC LICHID): opțiunile CULOARE + CANTITATE prezente
   - Cel puțin 3 imagini se încarcă corect
   - Storefront (`localhost:8000`): produsele apar în listing

**Criteriu de gata:** 90 produse în admin Medusa, storefront afișează produsele, niciun crash la navigare produs → categorie → produs.

**Checkpoint obligatoriu:** Ciprian validează admin-ul înainte de a trece la Faza 2.

---

### Faza 2 — Logică de Business (estimat: 6-10 ore)

**Deliverables:**
- Promoțiile funcționale (MASTICI TENAX -30%, Pachete Promoționale -20%)
- Free shipping threshold (500 RON)
- Checkout complet cu adresă, livrare, plată (Stripe test mode sau COD)
- Cont client: register, login, orders history

**Pași:**

1. **Promoții** (2-3h)
   - Promoție MASTICI TENAX: `POST /admin/promotions` — discount 30% pe categoria mastici-tenax, aplicat automat (fără coupon code)
   - Promoție PACHETE PROMOȚIONALE: discount 20% pe categoria pachete-promotionale
   - SET ADEZIV PROFESIONAL + DECAPANT: discount FIXED_AMOUNT 332 RON (per-produs)
   - Verificare în storefront: prețul afișat pe produsele din MASTICI TENAX reflectă -30%

2. **Free shipping** (1h)
   - Shipping option: `Free Delivery` cu condiție `order subtotal >= 50000 bani (500 RON)`
   - Shipping option fallback: livrare cu cost fix (Ciprian decide suma)

3. **Checkout** (2-3h)
   - Template starter Medusa are checkout funcțional out of the box
   - Configurare payment provider: COD (cash on delivery) pentru Faza 1 localhost; Stripe în Faza producție
   - Verificare: plasare comandă de test end-to-end

4. **Cont client** (1-2h)
   - Template starter are auth funcțional
   - Verificare: register, login, vizualizare orders

**Criteriu de gata:** Plasare comandă test completă de la listing → produs → coș → checkout → confirmare, cu promo MASTICI TENAX aplicat automat.

**Checkpoint:** Ciprian face un test de comandă end-to-end.

---

### Faza 3 — Aplicare Design din Track-ul B `[TRACK-B]`

**Start posibil NUMAI după livrarea designului din track-ul B.**

**Deliverables:**
- Storefront restilit cu designul nou (design tokens, culori, tipografie, spacing)
- Componentele cheie implementate: card produs, pagina de produs cu selector variații, listing categorie, header/footer, homepage

**Pași:**

1. Import design tokens (CSS variables sau Tailwind config) din livrarea track-ul B
2. Implementare componentă card produs în listing
3. Implementare pagina de produs cu selectoare variante și preț dinamic
4. Implementare listing categorie cu sortare
5. Implementare homepage: hero banner, grid categorii, furnizori
6. Implementare header cu navigare și coș
7. Implementare footer cu linkuri, contact, ANPC

**Estimare:** 20-40 ore, depinde de complexitatea designului livrat.

**Criteriu de gata:** Ciprian aprobă vizual toate paginile cheie pe desktop și mobile.

---

### Faza 4 — Conținut Static + SEO (estimat: 4-6 ore)

**Deliverables:**
- Pagina Despre Noi cu conținut real
- Pagina Termeni și Condiții completă
- Pagina Politică Livrări și Retururi completă
- Pagina Fișe Tehnice cu PDF-uri re-găzduite
- Meta tags (title, description) per pagină și per produs
- robots.txt, sitemap.xml generat

**Blocker:** Ciprian furnizează textele pentru paginile statice (Termeni, Livrări, Despre Noi).

**Estimare:** 4-6 ore după primirea conținutului.

---

### Faza 5 — Deploy Producție (estimat: 6-10 ore, post-localhost)

**Stack decis:**
- Medusa backend + PostgreSQL + Redis: **Railway** (regiune EU Frankfurt), ~$20-30/lună
- Next.js storefront: **Vercel** (cont existent)
- Email tranzacțional: **SMTP2GO** (cont existent)
- Plată: **Stripe** live mode cu RON
- DNS: Cloudflare recomandat (DDoS protection gratuit); registrar client de confirmat

**Deliverables:**
- Medusa backend deploiat pe Railway cu PostgreSQL și Redis
- Next.js storefront deploiat pe Vercel conectat la backend Railway
- Domeniu ardmag.com live pe noua infrastructură
- Stripe live mode configurat cu RON
- Email tranzacțional funcțional prin SMTP2GO
- SSL automat pe ambele servicii

**Blocker:** DNS la registrarul clientului (de clarificat cu clientul).

---

## Ce rămâne pentru post-lansare

- **e-Factura RO** — obligatorie pentru B2B; Medusa nu o are nativ, necesită plugin sau integrare cu Saga/SmartBill
- **Analytics** — Google Analytics 4 sau Plausible
- **Tier pricing (reduceri la cantitate)** — logica "35% la 50 bucăți" din additionalInfo; necesită plugin Medusa custom sau implementare în storefront
- **Căutare avansată** — Meilisearch integrat cu Medusa
- **Filtre în listing** — filtrare după opțiuni (diametru, granulație); necesită refactorizare listing
- **Imagini noi** — înlocuirea thumbnail-urilor duplicate cu imagini individuale per produs
- **SKU-uri semnificative** — în prezent generate sintetic

---

## Risk List

| Risc | Probabilitate | Impact | Mitigare |
|------|--------------|--------|---------|
| URL-uri imagini Wix returnează 403 în bulk | Medie | Mediu | Descarcă în batch-uri mici (10-20 la rând) cu delay; fallback: descărcare manuală din Wix Media Manager |
| Designul din track-ul B întârzie față de Faza 1-2 | Mare | Mic pentru Faza 1, Mare pentru Faza 3 | Fazele 1-2 rulează independent pe template starter. Faza 3 se amână, nu se blochează |
| Medusa v2 API breaking changes | Mică | Mare | Fixat versiunea în package.json la instalare (`@medusajs/medusa@2.x.x`); nu update fără test |
| 24 produse fără descriere afectează indexarea SEO | Mare (post-lansare) | Mediu | Notificat în `docs/design-pending.md`; completare content înainte de lansare producție |
| FIR DIAMANTAT fără preț blochează importul | Mică | Mic | Importat cu `status: "draft"` și preț 0 |
| Promoție MASTICI TENAX -30% greu de verificat corectitudinea | Medie | Mediu | Test manual: adaugă produs din MASTICI TENAX în coș, verifică că prețul final reflectă -30% |
| PostgreSQL sau Node.js versiune incompatibilă | Mică | Mare | Folosit Node.js LTS (>=20) și PostgreSQL >= 15; specificat în README |

---

## Decizii de design cerute din track-ul B

Componentele/paginile de mai jos nu pot fi implementate final fără input vizual din track-ul B. Până la livrare, rulează pe template starter Medusa (neutru, funcțional).

**Ordinea de prioritate (critice mai întâi):**

1. **Card produs în listing** — cel mai frecvent element vizual; apare pe toate paginile de categorie
2. **Pagina de produs cu selector de variații** — funcționalitate core (dropdown-uri, preț dinamic, adaugă în coș)
3. **Layout listing categorie** — cum sunt aranjate cardurile, câte pe rând, ce filtre/sort
4. **Header** — logo (deja livrat), navigare, coș, search, mobile menu
5. **Homepage** — hero banner, grid categorii, secțiunea furnizori, bannere promoționale
6. **Footer** — linkuri, contact, ANPC, newsletter (dacă există)
7. **Pagina de checkout** — multi-step sau single-page, câmpuri adresă
8. **Pagina de cont** — login/register, orders history
9. **Card categorie** — imagine + titlu + nr. produse pe homepage/listing
10. **Pagini statice** — Despre Noi, Termeni, Livrări (layout general)

---

## Checkpoints de validare

| Moment | Ce se validează | Cine |
|--------|----------------|------|
| Sfârșitul Fazei 0 | Ciprian a dat răspunsul la cele 4 decizii | Ciprian |
| Sfârșitul Fazei 1 | 90 produse în admin, storefront funcțional | Ciprian + Claude Code |
| Mijlocul Fazei 2 | Promoțiile reflectă prețurile corecte în coș | Ciprian |
| Sfârșitul Fazei 2 | Comandă test end-to-end plasată cu succes | Ciprian |
| Livrarea designului din Track B | Design aprobat, tokens livrați | Ciprian |
| Sfârșitul Fazei 3 | Toate paginile cheie aprobate vizual pe desktop + mobile | Ciprian |
| Pre-lansare producție | Testare completă: 3 comenzi test cu scenarii diferite | Ciprian |
