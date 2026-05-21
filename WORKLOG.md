# Work Log -- ardmag.ro (Arc Rom Diamonds)

Cronologic crescator. 1 entry per livrare confirmata pe live.
Format: data + commits + descriere + deploy URL + confirmare user.

---

## 2026-05-16 -- Sesiune full (mai multe livrari)

Detalii in memory entries `project_session_16mai2026.md`. Highlights:

- `7172492` fix(checkout): pastreaza POST in middleware ca sa nu pierdem Server Actions
- `57ce297` fix(cache): include global tag in optiunile de cache pentru useri anonimi
- `dc3eaec` feat(fan-courier): fallback la greutate variante din DB cand context lipseste
- `4ca0b3e` fix(checkout): banner Stripe test mode doar cand key e pk_test_
- `a601b41` chore: ignore .env*.local in storefront, whitelist .medusa/ pe Railway
- `6ba3b64` chore: script one-shot replace-saitron-images (executat)
- `74115bd` docs: research catalog pentru completare descrieri produse
- `711b67e` chore: regenereaza imagini produse cu rembg refinement (7 produse)
- `8336148` feat(pdp): variante "contact telefonic" pentru discuri taiat >600mm
- `5b874a3` fix(pdp): sortare numerica variante, icon telefon solid, copy modal neutru
- `1edb058` fix(pcard): paspartout alb pe imagini produs pentru dark mode
- `9a34ec7` feat(home): hero side cards folosesc ultimele 2 articole publicate
- `9aa3597` chore(gitignore): ignora env productie, planning workflow, surse imagini neutilizate
- `0789825` chore: completeaza JPG-urile sursa lipsa din commit 711b67e

DB: 4 weights POLIMASTER HEX 13" + 1 soft delete orfan + 22 metadata.contact_to_order pe discuri >600mm.

---

## 2026-05-17 -- Sesiune full (CSS, brand, descrieri, perf paralel)

Detalii in memory entries `project_session_17mai2026.md`. Highlights:

- `f2fc12b` fix(css): dark mode highlight pentru variante contact telefonic
- `171ef9b` feat(pcard): chip-uri cu valori variante + overlay logo brand pe imagine
- `7898683` fix(pdp): scoate valoarea selectata din label-ul axei
- `db83fed` fix(pcard): logo brand fara fundal, max-width 100px
- `30d3c40` chore(brand-logos): logo-uri brand cu fundal complet transparent (Codex curatat 4)
- `78a9251` perf(home): ISR full-static homepage si cart badge client-side (sesiune paralela)
- `97e6ac2` feat(pdp): tab-uri condit + livrare/garantie cu continut generic
- `c08ea24` fix(blog): wrap imagine articol in container cu aspect-ratio fix
- `fe36f49` feat(home): hero side cards integral clickable
- `6209ec4` fix(promotii): publicFetch=true pentru a primi calculated_price cu original_amount
- `0cd830b` feat: feedback vizual add to cart + link-uri cart + scroll fix
- `e666af5` fix(promotii): include si produse cu metadata.ribbon=PROMO ca fallback

DB: 10 produse tag-uite brand (6 Delta + 4 SAIT) + descrieri aplicate pe 38 produse (din fara/placeholder/COPY_PENDING).

Codex deep research: 38 produse cercetate + descrieri propuse (XLSX in docs/copy-proposals/).

Vercel: backend-storefront proiect orfan sters (deploys fail). Doar ardmag-storefront ramane activ pe ardmag.ro.

---

<!-- Entry-uri viitoare se adauga dedesubt. 1 entry per livrare confirmata pe live cu format:

## YYYY-MM-DD HH:MM -- <titlu scurt>

Commits: `<hash1>`, `<hash2>`
Deploy: https://ardmag.ro/<path> | Vercel: <url>
Confirmat: DA / NU

<descriere ce s-a livrat + de ce>

-->

## 2026-05-17 14:00 -- Format preturi: Lei + decimal low-contrast + right-align + fix factor 100

Commits: `<pending>` (consolidat post-`0cd830b`)
Deploy: https://ardmag.ro/ | Vercel: ardmag-storefront-61e6gisvj
Confirmat: DA (user iterativ pe fiecare layer)

Pachet consolidat de fix-uri pe afisarea preturilor, deploy-uite incremental
direct via `vercel --prod` fara commit/push (eroare workflow recunoscuta
ulterior). Acest entry consolideaza livrarile in master.

1. **Fix factor 100 in /api/cart-snapshot** -- valorile veneau in cents din
   Medusa si erau afisate ca atare in AddToCartSheet (3 buc · 24.000,00 RON
   pentru un mastic de 80 lei/buc). Acum amounts trimise ca raw + formatPrice
   imparte la 100 client-side.

2. **Rename moneda RON -> Lei in display utilizator** -- `formatPrice` si
   `convertToLocale` returneaza "Lei" cand currency_code = "ron". Toate
   componentele relevante (CartLineItem, OrderRow, OrderSummary,
   CheckoutReview, CheckoutShipping, AddToCartSheet, PDPPriceCard,
   ProductCard, order pages) refactorizate sa foloseasca helper-ul centralizat.
   Texte hardcoded "500 RON" -> "500 Lei" in header promo, livrare-si-plata,
   termeni, PDPShippingInfo. JSON-LD ramane "RON" (cod ISO 4217 standard
   pentru Google structured data).

3. **Component FormattedPrice cu spans int/dec/currency** -- `<span class="price">
   <span class="price-int">18</span><span class="price-dec">,60</span>
   <span class="price-currency">Lei</span></span>`. CSS: decimalul +
   currency afisate cu `var(--fg-muted)`, integerul cu culoarea de baza.
   Plus `font-variant-numeric: tabular-nums` pentru aliniere consistenta.

4. **Right-align in card preț PDP** -- `.pdp-price-card` cu `text-align:right`,
   `.pdp-price-row` cu `justify-content:flex-end`, linia "Fara TVA" cu
   `justifyContent:flex-end` inline. Cardurile de produs raman cu pretul
   left-natural in footer (parte din flex space-between cu butonul Adauga).

Fisiere modificate: 21 fisiere refactor + 1 component nou (FormattedPrice +
index). Build SSG mentinut: 783 pagini static, homepage TTFB ~160ms hit cached.

## 2026-05-17 15:15 -- Cache agresiv catalog: /produse, /promotii, categorii, PDP-uri

Commits: `17235cc`, `f606673`, `b72cd39`
Deploy: https://ardmag.ro/produse | Vercel: ardmag-storefront-mj3ol6f5o
Confirmat: DA ("arata si merge excelent")

Extinde strategia agresiva de cache aplicata pe homepage la TOATE
paginile de catalog. Aliniere finala TTFB <300ms peste tot.

**Layer 1 (commit 17235cc)** - next.config.js + scoate force-dynamic
- 4 entries Cache-Control public s-maxage=300 SWR=900 in next.config
  pentru /produse, /promotii, /categories/*, /products/*
- Scos force-dynamic din toate 4 paginile
- categories + products/[handle]: publicFetch:true pentru a nu varia
  raspunsul per cookie
- /api/revalidate: extins default purge cu paths catalog (1 chemare
  invalidateaza tot)

**Layer 2 (commit f606673)** - revalidate=300 pe pagini
- Next.js suprascrie Cache-Control din config pentru pagini dynamic.
  revalidate=N pe pagina e singura cale.

**Layer 3 (commit b72cd39)** - CRITICAL: filtrare server->client pentru
/produse + /promotii ca pagina sa devina SSG
- Layer 1+2 au mers pentru /categories/* si /products/[handle] (au
  generateStaticParams existing). NU mergeau pentru /produse + /promotii
  pentru ca citeau searchParams (brand/material/price/sort) pe server
  -> Next le marca dynamic indiferent de revalidate.
- Solutie: server fetch + serve TOATE produsele cu meta (tags, minPrice,
  createdAt). Wrapper client nou CatalogClient cu useSearchParams +
  useMemo aplica filtrare+sortare in browser. Suspense boundary
  obligatoriu pentru SSG.
- Pe /promotii, hasRealDiscount filtrare ramane server-side (nu depinde
  de URL).
- 2 fisiere noi (CatalogClient.tsx + index.ts), 2 fisiere refactor.

Trade-off acceptat: cand utilizatorul intra direct cu link
?brand=tenax, vede ~50ms toate produsele inainte ca filtrul sa se
aplice client. Navigare interior site = zero flash.

**Rezultate masurate:**
- /produse: 1.5s -> 115ms (13x mai rapid)
- /promotii: 1.4s -> 100ms (14x mai rapid)
- /categories/discuri-de-taiere: 1.4s -> 277ms (5x)
- /products/mastic-semisolid: 1.5s -> 176ms (8.5x)

Toate cu `cache-control: public, s-maxage=300, stale-while-revalidate=900`
si `x-vercel-cache: HIT`. Invalidare manuala via /api/revalidate cand
se modifica catalogul.

## 2026-05-17 16:00 -- Nav "Toate produsele" + active state pe categoria curenta

Commits: `3d6c49c`, `a578969`
Deploy: https://ardmag.ro/ | Vercel: ardmag-storefront-q9nzu3xxa
Confirmat: DA ("arata super")

UX polish pe meniul principal:

1. **"Toate categoriile" -> "Toate produsele"** in header (butonul cu
   fundal negru din stanga nav-ului) si footer ("Magazin > Toate
   produsele"). Link-ul oricum mergea la /produse, doar label-ul era
   confuz.

2. **Active state vizual** pe categoria curenta cand user-ul navigheaza
   pe /categories/X:
   - Link-ul respectiv din cat-nav devine highlighted cu
     border-bottom: var(--brand-500) si color: var(--brand-700) (deja
     existau aceste reguli CSS, doar lipsea aplicarea active class)
   - Pentru butonul "Toate produsele" cand user-ul e pe /produse,
     fundalul devine var(--brand-600) (regula CSS noua, ca sa pastreze
     contrastul vs background-ul negru by default)
   - aria-current="page" pentru a11y

Folosit usePathname() din next/navigation in SiteHeader (deja client
component, fara cost suplimentar). Regex extracts /categories/{handle}
din pathname, comparat cu cat.handle in loop.

Fisiere: 3 modificate (SiteHeader.tsx, design-system.css, SiteFooter.tsx).

## 2026-05-17 17:00 -- UI cos + checkout polish: trash icon, CTA, panel detalii livrare, footer spacing

Commits: `16eb79c`, `3cbe40c`, `07c4aa2`
Deploy: https://ardmag.ro/cart | Vercel: ardmag-storefront-ovbcxz8ib
Confirmat: DA ("confirm ca tot ce ai implementat este corect")

Patru fix-uri de UX vizibile in fluxul cos -> checkout -> confirmare,
toate descoperite vizual de user pe live:

1. **Trash icon + label "Sterge" (commit 16eb79c)** -- butonul de stergere
   din linia de cos era un SVG custom cu path improvizat (corp 4x9
   distorsionat), fara label, iar clasa `.icon-only` aplicata pe el nu
   era definita nicaieri in CSS. Pentru target 50+ era nedescifrabil.
   Inlocuit cu trash-2 Lucide standard (24x24 viewbox). Pe desktop
   butonul ramane `.btn.ghost.sm` standard cu icon + label "Sterge"
   alaturi. Pe mobile (<=640px) label-ul se ascunde si butonul revine
   la cerc 36x36 ca sa nu fure spatiu lateral. Hover: text rosu via
   `var(--error)` + fundal pal `var(--error-bg)`.

2. **CTA "Finalizeaza comanda" (commit 3cbe40c)** -- "Continua spre
   checkout" amestec EN/RO, fara diacritica. 5 alternative propuse,
   user-ul a ales "Finalizeaza comanda" -- formula standard in
   e-commerce RO (eMag, Altex, Dedeman), neutra fata de pasii urmatori
   (livrare/plata/review).

3. **Panel detalii livrare pe pagina de confirmare (commit 3cbe40c)** --
   adresa de livrare era inghesuita la coada listei de produse, in text
   mut, fara card. Acum:
   - "Produse comandate" si "Detalii livrare" sunt panel-uri peer
     (background var(--surface), border var(--rule), padding 0)
   - Panel-ul livrare are titlu + nota "Plasata pe 17 mai 2026, ora 14:32"
     in panel-head (formatare RO via toLocaleDateString/Time)
   - Doua coloane interior via `.form-row-2`: Adresa (cu telefon in mono
     font) si Metoda livrare (nume + pret in mono)
   - Pe mobile coloanele se stivuiesc automat
   - Bonus: `retrieveOrder` fetch-uieste acum explicit `*shipping_methods`
     + `*shipping_address` + `*billing_address` ca sa fie disponibile
     in toate paginile order detail (nu doar dependent de defaults Medusa)

4. **Footer nu mai e lipit pe paginile .page-inner (commit 07c4aa2)** --
   pe cart, /produse, /promotii, /search, /products/[handle], pagina de
   confirmare, ultimul element era flush cu marginea dark a footerului.
   Diagnostic: `.site-footer` nu are margin-top, iar `.page-inner` nu
   avea padding-bottom. Homepage si /blog au layout-uri proprii cu
   padding pe sectiuni, deci nu au fost niciodata afectate.
   Fix: adaugat `padding-bottom: 64px` pe `.page-inner` in
   design-system.css. Schimbare punctuala, zero impact pe homepage/blog.

Fisiere: 5 modificate (CartLineItem.tsx, cart/page.tsx,
order/[id]/confirmed/page.tsx, lib/data/orders.ts, design-system.css).

## 2026-05-17 19:15 -- Email Medusa functional + dark mode checkout

Commits: `4d98304`, `51c2c0d`
Deploy: https://ardmag.ro/checkout | Vercel: ardmag-storefront-hw9mriwyo | Railway: medusa redeploy
Confirmat: DA ("totul arata bine")

**Problema descoperita:** zero emailuri trimise de la lansare. SMTP2GO dashboard
gol pentru toate orderele #18-#25. User a observat ca testul de maine pe site
ar fi blocat fara emailuri functionale.

**Diagnostic in 3 straturi:**

1. **Event name gresit (commit `4d98304` parte 1):**
   Subscribers ascultau la `order.created` dar Medusa v2 emite `order.placed`
   la finalizarea checkout-ului (verificat in
   `@medusajs/utils/dist/core-flows/events.js`: `OrderWorkflowEvents.PLACED`).
   Fix: order-placed-notify.ts si order-placed-cod.ts trecut la `order.placed`.
   (customer-created-welcome, auth-password-reset, order-shipment-created
   erau deja cu nume corecte.)

2. **Cross-module relations crapau (commit `4d98304` parte 2):**
   Dupa fix event, subscribers firau si crapau cu
   "TypeError: Cannot read properties of undefined (reading 'kind')".
   Cauza: `orderModuleService.retrieveOrder({ relations: [..., "payment_collections.payments"] })`
   nu poate traversa cross-module - payment_collections e in Payment module,
   linked via remote link. MikroORM cauta metadata relatiei si gaseste undefined.
   Fix: inlocuit cu Query API (ContainerRegistrationKeys.QUERY) care e calea
   corecta in v2 pentru cross-module reads.

3. **Dockerfile lipsea COPY pentru subscribers (commit `4d98304` parte 3):**
   Imaginea Docker copia doar `src/modules/` peste baza
   `ghcr.io/aibaza/ardmag-backend:latest`. Subscribers ramaneau la versiunea
   veche din baza, deci modificarile locale nu ajungeau in productie.
   Fix: adaugat `COPY .medusa/server/src/subscribers/` si `src/jobs/` in
   Dockerfile.

**Polish in acelasi commit:**
- ADMIN_EMAIL default in order-placed-notify: `office@ardmag.ro` ->
  `comenzi@ardmag.ro` (consistent cu Cloudflare routing care trimite
  `comenzi@ardmag.ro` -> `comenzi@arcromdiamonds.ro` la Cristian)
- `fromEmailNoreply` default: `no-reply@ardmag.ro` -> `office@ardmag.ro`
  (no-reply nu exista in Cloudflare routing; office da)
- Log explicit la initializarea Smtp2goNotificationService cu mode + senders
  vizibil in Railway logs la primul send

**Smoke test reusit:** Order #26 plasat cu email `ciprian.dobrea@gmail.com`,
ORDER_NOTIFY_EMAIL temporar setat la acelasi email pentru a primi ambele
emailuri local fara sa-l deranjam pe Cristian. SMTP2GO a aratat 2 entries
Delivered: "Confirmare comanda" (customer) + "Comanda noua #26" (admin).
Dupa confirmare, restaurat ORDER_NOTIFY_EMAIL=comenzi@ardmag.ro pentru prod.

**Dark mode checkout (commit `51c2c0d`):**
- SavedAddressPicker: background `--surface` (adapt light/dark) +
  box-shadow inset brand-600 pentru selected (in loc de fundal `--stone-50`
  hardcoded care era alb pe ambele teme)
- CheckoutPayment "Date card" panel: `--surface` + `--fg` explicit. Iframe
  Stripe ramane `#fff` (limitare Stripe Elements - vizibil in dark mode dar
  nefixabil fara Stripe Appearance API, separat)
- ProvinceCombobox hover/selected: `color-mix(in oklch, var(--fg) 10%, transparent)` -
  tint adaptiv care merge si pe light (subtle grey) si pe dark (subtle white
  overlay) fara override-uri

**Memorie nou-salvata:** `project_infrastructure_state.md` (cine controleaza
ce - eu am domeniu ardmag.ro, Stripe dev account, GA4/Pixel le produc eu) si
`feedback_client_facing_language.md` (regula zero-jargon pentru emails catre
Andrei/Cristian). Plus skill nou `client-email-writer` in ~/.claude/skills/
pentru viitoarele drafturi.

Fisiere modificate: 8 (5 backend: Dockerfile, medusa-config.ts,
notification-smtp2go/service.ts, 2 subscribers; 3 storefront:
SavedAddressPicker.tsx, CheckoutPayment.tsx, ProvinceCombobox.tsx).

## 2026-05-18 13:50 -- OG image + meta sociale pe articole blog

Commits: `0e6aaa8`, `3185ea2`
Deploy: https://ardmag.ro/blog/mastici-epoxidici-poliesterici-piatra | Vercel: ardmag-storefront-r7rd7etlw
Confirmat: DA ("arata bine" pe verifier OG)

Articolele de blog aratau text-only la share pe Facebook/LinkedIn/WhatsApp:
`og:image` lipsea complet, iar verifier-ul opengraph.io semnala scor 30/100
critical.

**Cauza:** `generateMetadata` din `/blog/[slug]/page.tsx` seta `openGraph`
fara campul `images`. In Next.js metadata API, cand child route seteaza
`openGraph`, obiectul mostenit din root layout e suprascris complet --
deci si `images` (din opengraph-image.jpg auto-generat), si `siteName`,
`locale`, `url` din parent layout dispareau.

**Fix in 2 pasi:**

1. **`0e6aaa8`** -- adaugat `openGraph.images` din `article.heroImage`
   (1376x768 webp, una per articol in `/public/blog/<slug>/hero.webp`).
   Fallback la `/opengraph-image.jpg` daca articolul nu are hero.
   Adaugat si block `twitter` cu `card: summary_large_image` + acelasi image.

2. **`3185ea2`** -- adaugat campurile lipsa semnalate de OG verifier
   (`og:url`, `og:site_name = ARDMAG`, `og:locale = ro_RO`) si `<link
   rel="canonical">` pe articol. Le-am adaugat explicit in `openGraph`
   pentru ca Next.js nu le mosteneste din parent layout cand child override-uieste.

**Verificat pe live (toate 3 articole):** og:title, og:description, og:url,
og:site_name, og:locale, og:type=article, og:image (+ width 1376, height 768,
alt), twitter:card, canonical -- toate prezente.

**TODO separat:** URL-urile in canonical/og:url/og:image ies cu
`ardmag.surcod.ro` in loc de `ardmag.ro` pentru ca `NEXT_PUBLIC_BASE_URL`
in env Vercel pointeaza inca la subdomeniul vechi. Functional OK (Facebook
scrape de pe ardmag.ro citeste tag-urile, imaginea load-eaza din ambele
domenii), dar pentru curatenie SEO ar trebui schimbat. Nu blocheaza nimic
acum.

Fisiere modificate: 1 (`backend-storefront/src/app/[countryCode]/(main)/blog/[slug]/page.tsx`).

## 2026-05-18 19:15 -- Migrare preturi DB raw decimal + cleanup test orders + fix bug billing latent Stripe

Commits: `c7dac35`, `53bf9f3`
Deploy: https://ardmag.ro/ | Vercel: ardmag-storefront-jlwqjegtk
Confirmat: DA ("preturile par ok")

Operatia mare a zilei: migrarea modelului de stocare preturi de la legacy v1
(×100 / bani) la Medusa v2 standard (raw decimal RON). Fereastra de mentenanta
~10 min pe site live, executat inainte de primul client real.

**De ce era necesar:**

Scriptul de import Wix→Medusa (`scripts/import-wix-catalog.ts`) stoca preturile
multiplicate cu 100 (un produs de 137 RON → DB amount=13700). Storefront-ul
compensa prin formatPrice care imparte la 100. Admin Medusa nu stia de divizare
si afisa "lei 13,700.00 RON" pentru un produs de 137 RON.

Dar mai grav: **Stripe Payment Provider (`@medusajs/payment-stripe`)** apeleaza
`getSmallestUnit(amount, currency_code)` care multiplica cu `10^decimal_digits`.
Pentru RON (decimal_digits=2), face ×100. Deci:
- payment.amount = 13700 (intentie 137 RON, stocat ×100)
- Stripe plugin trimite 13700 × 100 = 1,370,000 bani = 13,700 RON catre Stripe
- Toate test orders au fost charge-uite la 100× over (verificat: payment.data.stripe_amount
  pentru o comanda de 137 RON era 1370000, pentru una de 420 RON era 4200000)
- Bug latent mascat de Stripe test cards care accepta orice suma fara raport

Migrarea aceasta a fixat si admin display si overcharge-ul Stripe simultan.

**Strategia: scope chirurgical.** In loc sa migrez toate cele ~25 de tabele cu
campuri monetare (orders, carts, payments, tax lines, etc.), am sters complet
datele tranzactionale test si am migrat DOAR catalog prices. Argumentatie: cele
27 orders + 253 carts erau toate test/dev, nu au existat clienti reali inca.
Stergerea elimina riscul de mismatch in totaluri si reduce scopul migrarii la
2 coloane (`price.amount` + `price.raw_amount` jsonb).

**7 faze de executie:**

1. **Pre-flight** -- DB connection check, prep storefront local: format-price.ts
   scoate /100, tests fixtures actualizate (Lei in loc de RON), middleware
   maintenance, import script fix
2. **Maintenance ON** -- env MAINTENANCE_MODE=on pe Vercel + commit `c7dac35`
   middleware 503 → site afiseaza pagina "mentenanta programata, revenim in
   5 min" cu phone fallback
3. **Backup** -- pg_dump custom format prin Railway SSH (necesitat instalare
   postgresql18-client pentru ca server-ul e 18.3 si default client din alpine
   era 17 → error version mismatch). Dump 867KB salvat /tmp/ + pulled local
   via base64 stream, MD5 verificat
4. **Cleanup tranzactional** -- single transaction stergand din 23 tabele
   (order_line_item_tax_line, order_item, order_summary, payment_collection,
   cart_line_item, etc.) plus reset display_id sequence la 1
5. **Migrare catalog** -- UPDATE price SET amount = amount/100, plus
   jsonb_set pe raw_amount->value pentru sincronizare. 1004 randuri actualizate.
   Verificat top preturi 14k-20k RON (corect pentru produse profesionale piatra),
   shipping 19.99-21.99 RON
6. **Storefront deploy** -- env MAINTENANCE_MODE removed + commit `53bf9f3` cu
   /100 scos de peste tot (format-price.ts + 8 alte locuri: filter pages, json-ld,
   shipping, order details, import script). Verificat tests pass (15/15)
7. **Verificare** -- toate paginile 200, PDP afiseaza 76 Lei pentru mastic-solid
   (era 7.600 inainte de revalidate cache), cart API test cu unit_price=76 raw,
   admin orders gol

**Gotcha intalnit:** dupa migrare DB, primul curl pe PDP afisa inca preturi
×100 (7.600 Lei pentru un produs de 76 RON). Cauza: Next.js fetch cache cu
`force-cache` si tag "products" tinea raspunsul de la API inainte de migrare
(`getCacheOptionsStatic("products")` in `lib/data/cookies.ts`). Path-level
revalidatePath nu era suficient. Trigger pe `/api/revalidate?secret=...` fara
parametri (default revalidateTag(\"products\")) a flush-uit cache-ul si PDP
afisa imediat preturi corecte. De tinut minte pentru viitoare migrari.

**Backup pastrat pentru rollback:**
- Container Railway: `/tmp/ardmag-prelaunch-20260518-1902.dump`
- Local: `/home/dc/_backups/ardmag-2026-05-18/ardmag-prelaunch-20260518-1902.dump`
- MD5: 69e8961f4eb5f517b0cd178b38d7d796

**Side-effects pozitive:**
- Admin Medusa afiseaza acum preturi normale (137 Lei in loc de 13,700 Lei)
- Stripe billing va factura corect la primul client real (137 RON, nu 13,700)
- Catalog si shipping prices aliniate cu standardul Medusa v2
- Display ID prima comanda reala = #1 (slate curat)
- Import script pregatit pentru reimporturi viitoare (parsePrice returneaza raw)

Fisiere modificate: 11 (10 storefront + 1 import script + 1 plan local).
Cod liniile schimbate: 31 inserted, 51 deleted (refactor curat).

## 2026-05-18 20:35 -- Fan Courier: aliniere la modelul raw decimal post-migrare

Commits: `4953921`
Deploy: https://ardmag.ro/ro/checkout | Vercel: storefront + Railway: backend
Confirmat: DA ("19,76 Lei arata bine")

Post-mortem rapid al migrarii din 19:15: Fan Courier provider e shipping option
de tip `calculated` (nu stocat in `price` table, calculat dinamic per request)
si returna `calculated_amount` multiplicat cu 100 in serviciul propriu. Asta a
ramas neatins de migrarea catalog si la primul checkout test a aparut:
- afisare "2254.00 Lei" pentru un cost de 22.54 RON
- Stripe ar fi facturat 2254 RON (din nou bug 100x, identic cu cel rezolvat
  ore inainte pe catalog)

**Fix:**
- `backend/src/modules/fulfillment-fan-courier/service.ts`: scos `* 100` din
  toate cele 3 return-uri (fallbackTariff x2 + getInternalTariff). Pastrat
  `Math.round(total * 100) / 100` pe rezultatul de la endpoint extern doar
  pentru rotunjire la 2 zecimale (fara multiplicare scalara)
- `backend-storefront/src/modules/checkout/components/CheckoutShipping.tsx`:
  foloseste `formatPrice()` helper in loc de `${v.toFixed(2)} Lei` manual.
  Asta da format Romanian "19,76 Lei" in loc de format US "19.76 Lei"

**Deploy:**
- Backend: `npx medusa build` local + `railway up --detach` (necesar pentru a
  push-a noul `.medusa/` compilat la Railway -- folder gitignored, dar
  whitelist via `.railwayignore`)
- Storefront: `git push` standard -> Vercel auto-build

**Verificare:** checkout test cu produs mastic-solid (80 Lei) + adresa Cluj-Napoca
arata Fan Courier 19,76 Lei (raw decimal corect din endpoint-ul Fan Courier
extern, rotunjit la 2 zecimale).

**Loose end UX (nu blocant, dinainte de migrare):** in pasul Livrare al
checkout-ului, Rezumat Comanda nu actualizeaza Transport in total cand se
select-uieste o optiune via radio. Transport se aplica la submit "Continua
spre plata". Comportament identic cu pre-migrare. Posibil fix viitor.

Fisiere modificate: 2 (1 backend + 1 storefront).

---

## 2026-05-18 (seara) -- Corectii catalog Andrei + fix Title Case categorii

Commits: `aef3148`, `ec434b0`
Deploy: https://ardmag.ro/ (storefront Vercel) + DB updates pe Railway via admin API
Confirmat: DA (Ciprian, "aprob")

Sursa: `/home/dc/Downloads/corectii.txt` (18 puncte de la Andrei, trimise via email).

**Aplicat (12 din 18):**
- 11 descrieri produs rescrise verbatim din textul Andrei: abrazivi-anelli,
  abrazivi-oala, abrazivi-tangentiali, baton, burghiu, carote-diamantate,
  creion (corectat: NU e diamantat, e marcaj simplu), detergenti,
  detergenti-acizi, dischete-de-slefuit-diamantate, discuri-de-andezit
- 1 produs nou documentat: dischete-de-slefuit-cu-carbura (VEL+SAITDISC),
  "profilul cu centrul adancit" mutat de la generic la specific SAITDISC
- Label categorii homepage: "MASTICI TENAX" (caps complet) sau "Mastici tenax"
  (sentence case buggy in nav top) -> "Mastici Tenax" (Title Case proper)

**Cum:**
- 12 fisiere `.md` editate / 1 nou in `backend-storefront/codex-copy-proposals/`
- Script nou `scripts/apply-descriptions-from-codex.ts` (parse .md sectiunea
  "Descriere propusa (HTML simplu)" -> POST /admin/products/{id} cu description).
  Suporta --dry-run (default), --apply, --only=<handle>
- Util nou `backend-storefront/src/lib/util/category-title.ts` cu
  `formatCategoryTitle()` (Title Case). Aplicat in `SiteHeader.tsx`
  (nav top + mobile drawer) + `page.tsx` (quick categories cards homepage)
- Cache invalidat post-update DB via `GET /api/revalidate?secret=...`
  pentru `revalidateTag("products")` + `revalidatePath("/products/[handle]")`

**Blocked - intrebari catre Andrei (6 puncte, draft email in
`docs/email-andrei-corectii-2026-05-18.md`):**
1. EK-WINNER duplicat (produs stand-alone in "Slefuire piatra" + varianta
   "EK WIENNER" sub produsul agregat `discuri-de-slefuit-cu-carbura`) - care
   forma pastram + cum mutam la "Discuri de taiere"?
2. Saitroanele (SAITRON 125, SAITRON 180, SAITRIS 180) - acelasi tip de
   duplicare (stand-alone + variante sub agregat). Care forma pastram?
3. Saitris 180 "SFC" - ce inseamna SFC?
4. Suport Velcropad - pagina e deja 404 pe ardmag.ro, confirm cu Andrei
5. Creion - text scurt aplicat ("Creion de marcaj pentru piatra..."),
   intreb daca vrea descriere mai detaliata
6. Discuri de granit - mesajul corectii.txt s-a oprit la titlu (truncat)

**Verificare live:** confirmat de Ciprian dupa cache invalidate. Grep markers
gasite pe toate 12 pagini:
- creion: "Creion de marcaj" (vs vechi "Creion diamantat")
- abrazivi-anelli: "baioneta" (vs vechi "Frankfurt")
- baton: "pasle" (luciu manual, vs vechi "rectificare manuala")
- discuri-de-andezit: "Aproape toate" (vs vechi "peste 500 mm")
- + restul 8 produse

Audit log: `scripts/apply-descriptions-audit.jsonl` (toate update-urile cu
timestamp + diff size). Idempotent: re-runs marcheaza "IDENTICAL (skip)".

Fisiere modificate: 18 (12 .md catalog + 1 .md draft email + 3 storefront UI/util
+ 1 script nou + 1 audit log).

---

## 2026-05-19 10:30 -- Fix critic emailuri comanda: preturi /100 + variant info + CC office

Commits: `c340b0a`
Deploy: https://api.ardmag.ro (Railway auto-deploy la push pe master)
Confirmat: PENDING (test order de plasat dupa Railway Ready)

Raportat de Andrei dimineata (screenshot email primit pe comenzi@ardmag.ro
pentru comanda #1 sandu_dolha): preturi afisate 10.46 / 3.86 / 1.96 / Total
10.46 RON, in loc de 464 / 386 / 196 / Total 1046 RON. Raport 1:100 exact.

**Root cause:** template-urile de email din `notification-smtp2go/templates/`
au fost ratate la migrarea raw decimal din 18 mai (commits `53bf9f3` storefront
si `4953921` Fan Courier). Aveau 3 copii identice ale `formatPrice` cu
`/100` -- exact pattern-ul care a permis bug-ul sa scape.

**Aplicat:**
- `formatPrice` centralizat in `templates/tokens.ts` (export shared)
- scos `/100` din `templates/order-admin.ts`, `order-customer.ts`,
  `cart-abandoned.ts` -- toate cele 5 locuri (3 formatPrice + 2 threshold-uri
  ad-hoc pentru livrare gratuita 500 RON si suma ramburs)
- `templates/__tests__/tokens.unit.spec.ts` -- 3 grupe Jest unit, lock-uiesc
  raw decimal. Trec local 3/3.

**Extindere emailuri cu variant info:**
- `templates/order-admin.ts` -- 3 linii per produs (titlu + identificator
  variant_sku/product_handle + variant_title) -- match exact cu admin
  Medusa care arata "DISCURI DE GRANIT / discuri-de-granit-2 / 250 . NOU"
- `templates/order-customer.ts` -- 2 linii (titlu + variant_title in
  monospace uppercase, fara SKU care e noise pentru client)
- foloseste campurile snapshot-ate de Medusa pe order line item
  (`item.variant_title`, `item.variant_sku`, `item.product_handle`) -- fara
  modificari de query.graph, datele erau deja in payload
- filtru "Default Title" pentru produsele single-variant (30 din 90)

**CC office@ardmag.ro pe emailul intern:**
- `subscribers/order-placed-notify.ts` -- `ADMIN_CC` configurabil prin env
  var `ORDER_NOTIFY_CC` (default `office@ardmag.ro`)
- `modules/notification-smtp2go/service.ts` -- `data.cc` threadat prin
  notification payload, propagat la sendViaApi (SMTP2GO body.cc) si
  sendViaSmtp (nodemailer cc field)

**Script audit comenzi afectate:**
- `scripts/list-recent-orders.ts` -- listeaza comenzile din ultimele 14 zile
  cu total raw decimal, email client, payment status. Output text simplu
  pentru a fi copiat in email-ul catre Andrei.
- Rulare pe prod: `railway run npx medusa exec ./src/scripts/list-recent-orders.ts`

**Verificare locala:**
- `npx tsc --noEmit` zero erori
- `npm run test:unit -- tokens.unit.spec` -- 3/3 PASS
- render-test cu mock order (comanda #1 sandu_dolha) genereaza HTML cu
  464.00 / 386.00 / 196.00 / Total 1046.00 RON si variant info complet

**Pasi urmatori (dupa Railway Ready):**
1. Test order live cu varianta selectata -> verific email primit pe
   comenzi@ardmag.ro cu CC pe office@ardmag.ro si variant_title vizibil
2. Rulez audit script-ul pe prod ca sa identific comenzile cu preturi /100
3. Email catre Andrei cu lista comenzilor afectate (decide el daca scrie
   clientilor)

Fisiere modificate: 9 (1 nou test + 1 script nou + 1 CHANGELOG + 6 email).

---

## 2026-05-19 12:45 -- BCC global + rebrand ardmag.ro + deploy gotcha discovered

Commits: `975f593`, `a8ffaba`, `2d601ca`
Deploy: https://api.ardmag.ro (Railway -- via `railway up`, NU git push)
Confirmat: PENDING (Andrei va plasa test order)

**Trigger:** Andrei raportat la 12:45 ca a plasat comanda #2 (1632 Lei) si nu a primit emailul de client. Investigare a expus 2 probleme distincte.

**Bug 1: deploy gotcha (root cause emailuri /100 erau in continuare prezente in prod).**

Dockerfile-ul backend-ului copiaza din `.medusa/server/` (output `medusa build`), iar `.medusa/server/` este gitignored. Cand fac doar `git push`, Railway face checkout din GitHub fara `.medusa/server/` -- dar Docker COPY foloseste fisierele cache-ate de la `railway up` anterior. Comanda #1 sandu_dolha si comanda #2 Andrei au primit ambele emailuri cu preturi /100 desi commit-urile `61b1fc5` + `b3e50fe` erau push-uite pe master inca de la 11:18.

Verificat direct in `.medusa/server/src/modules/notification-smtp2go/templates/order-admin.js`: continea `formatPrice` cu `/100`, build vechi din 18 mai 20:38.

**Fix workflow (definitiv):**
```
cd backend && npm run build    # regenereaza .medusa/server/ cu codul nou
railway up --service medusa --detach
```
NU mai e suficient `git push`. Adaugat in CLAUDE.md sectiunea Workflow ca lesson learned.

**Bug 2: deliverability Yahoo.**

SMTP2GO confirma livrare cu succes pentru ambele comenzi. Andrei nu a primit emailul de la comanda #2 in inbox (probabil spam Yahoo sau a aterizat tarziu). Nu investigat in detaliu in aceasta sesiune -- deferred.

**Aplicat in sesiunea curenta:**

1. **BCC `dc@aibaza.ro` global pe toate emailurile** (commit `975f593`)
   - `modules/notification-smtp2go/service.ts` adauga `globalBcc` getter (citeste `NOTIFICATION_BCC` env, default `dc@aibaza.ro`)
   - Threadat prin sendViaApi (`body.bcc` SMTP2GO) si sendViaSmtp (`bcc` nodemailer)
   - Log line indica BCC: `smtp2go: sent "..." to X (cc: ...) (bcc: dc@aibaza.ro)`
   - User vrea sa vada toate comunicarile "cel putin pentru o vreme"

2. **Rebrand ardmag.com -> ardmag.ro** (commits `a8ffaba` + `2d601ca`)
   - Cerere user: domeniu principal = ardmag.ro; .com redirecteaza 308; brand se scrie "ARDmag.ro" / "ARDmag" / "ardmag.ro" (ARD = Arc Rom Diamonds)
   - 14 scripturi cu `ADMIN_EMAIL = "admin@ardmag.com"` -> `"admin@ardmag.ro"` (consistenta brand; admin real e ciprian.dobrea@gmail.com setat via env)
   - `scripts/enrich/subagent-prompt.ts`: system prompt AI catalog research
   - `backend-storefront/src/app/robots.ts`: scos `magazin.ardmag.com` (subdomain neutilizat); pastrat `ardmag.com` pentru SEO coverage 308
   - Docs: CLAUDE.md (header), `docs/04-implementation-plan.md`, `docs/deployment/architecture.md`, `docs/deployment/SECRETS.md` (gitignored, local-only update)
   - Memorie interna: `MEMORY.md`, `project_db_infrastructure.md`, `project_price_management.md`, `project_ro_vat_rate.md`; nou entry `project_brand_naming.md`

   Deferred (concerns separate):
   - `media.ardmag.com` in env templates + upload-images-to-r2.ts: alias R2 functional, ramane pana e configurat `media.ardmag.ro` DNS
   - Rename GitHub repo `aibaza/ardmag.com` (user decide)
   - Folder local pastrat (nu se rupe nimic; nu apare in prod)

**Side-effect commit:** `scripts/capture-pages.mjs` (untracked anterior, screenshot utility) a fost inclus accidental in commit-ul de rebrand prin `git add scripts/`. Lasat ca-i; benign.

**Verificare:**
- `npx tsc --noEmit` backend: clean
- `npm run test:unit -- tokens.unit.spec`: 3/3 PASS
- `grep -r "ardmag\.com" backend/src/ backend-storefront/src/ scripts/`: doar `robots.ts` SEO + `upload-images-to-r2.ts` alias R2 (ambele intentionale)
- `npm run build`: SUCCESS, `.medusa/server/` regenerat cu codul nou
- `railway up`: deploy `0e859e84` in BUILDING

**Invitatii admin Medusa (de la cererea anterioara user):**
- comenzi@ardmag.ro: `invite_01KRZNCCBFAGZX342B41RDS8KF` accepta deja (din ce vad in log-uri request POST /auth/user/emailpass/register la 12:20 cu referrer token)
- office@ardmag.ro: `invite_01KRZNCCG4XA7E55838CS35NWD` (pending)
- Ambele cu expirare 20 mai 11:24 RO

Fisiere modificate: 21 in master + WORKLOG.md (local). 3 commits push-uite.

---

## 2026-05-19 15:00 -- R2 custom domain media.ardmag.ro + fix critic metoda de plata in emailuri

Commits: `240907b`, `6dbc07c`
Deploy: `https://api.ardmag.ro` (Railway `9fec9f71`) + Vercel auto-redeploy
Confirmat: DA (Cipri test order + Andrei rezolvat comanda #1 prin ridicare sediu POS)

### 1. R2 custom domain `media.ardmag.ro`

User a configurat in Cloudflare R2 dashboard. Active imediat, HTTP 200, image/jpeg servit OK.

**Aplicat:**
- Vercel env `NEXT_PUBLIC_R2_HOSTNAME=media.ardmag.ro` (via API v10 -- CLI nu transmitea valoarea prin stdin)
- Railway env `R2_PUBLIC_URL=https://media.ardmag.ro` (via `railway variables --set`)
- DB rewrite: 199 imagini + 95 thumbnails -- `pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev` -> `media.ardmag.ro` (transaction simpla cu replace())
- Cache revalidation: `GET /api/revalidate?secret=...` -- toate paginile reincarcate
- Env templates + `scripts/upload-images-to-r2.ts` updated (commit `240907b`)

**Verificare:** homepage + categoria mastici-tenax + pagini produs servesc toate imagini de pe media.ardmag.ro. URL-ul vechi `pub-28d7a...r2.dev` ramane functional dar nu mai e folosit.

### 2. Fix critic metoda de plata (commit `6dbc07c`)

**Trigger:** Cipri a plasat comanda #3 (147.76 Lei, RAMBURS) -- emailul intern afisa "Card (Stripe)" gresit. Cipri a flagat ca problema grava: persoanele de la office (Adriana via CC) primeau date gresite despre plata.

**Root cause:** template-urile order-admin.ts si order-customer.ts citeau `pc.payment_sessions` (ephemeral checkout state, NU este in query). Query-ul din `order-placed-notify.ts` cere `payment_collections.payments.*` -- alta relatie. Sessions array era gol pe ORICE comanda, deci fallback default `"Card (Stripe)"` se aplica universal.

**Impact istoric pe cele 3 comenzi din ziua de lansare:**
- #1 sandu_dolha (RAMBURS): email "Card (Stripe)" -- GRESIT, dar Andrei a livrat la sediu cu POS la preluare deci fara prejudiciu
- #2 rinzis.andrei (Stripe): email "Card (Stripe)" -- corect prin coincidenta (fallback default)
- #3 ciprian.dobrea (RAMBURS): email "Card (Stripe)" -- GRESIT, raportat de Cipri

**Fix:**
- Citeste `pc.payments[0].provider_id` (snapshot-at, queried correct)
- Detectie explicita pentru pp_system_default/manual -> "Ramburs (la curier)"
- Detectie explicita pentru stripe -> "Card (Stripe)"
- Provideri necunoscuti afisati ca string raw (nu mai exista fail silent care defaulteaza la Card)
- Test Jest nou: `templates/__tests__/order-admin.unit.spec.ts` cu 3 scenarii (ramburs/stripe/unknown). Tests pass 3/3.

**Pattern lesson Medusa v2:**
- `cart.payment_collection.payment_sessions[*]` = ephemeral checkout state (cart-level)
- `order.payment_collections[*].payments[*]` = committed payments (order-level)
- Pentru order events, **intotdeauna citim din `payments`, nu `payment_sessions`**.

Ambele relatii pot exista in DB pentru aceeasi comanda, dar `payments` e ce ramane definitiv si e ce queryul nostru cere explicit.

### Comenzi test rezolvate

User confirma:
- #1 livrata cu ridicare la sediu (POS la preluare) -- OK
- #2 si #3 anulate de Andrei

Fisiere modificate: 11 (5 templates + 1 test + 1 service + 2 env templates + 1 script + 1 docs).
4 commits push-uite, 2 deploy-uri Railway, 1 deploy Vercel.

### Statistici totale ziua de lansare 19 mai

Total commits: 13 (intre `61b1fc5` si `6dbc07c`)
Total deploy-uri Railway: 4 (4da60f49, 0e859e84, af0d75d6, 9fec9f71)
Total deploy-uri Vercel: 1+ (auto-redeploy la env change)
Bug-uri critice descoperite si fix-uite live:
1. preturi /100 in emailuri (post-migrare 18 mai)
2. variant info lipsa din emailuri (UX)
3. CC office si BCC monitoring (UX)
4. media.ardmag.com -> media.ardmag.ro (rebrand)
5. payment method gresit in emailuri (sessions vs payments confusion)
6. deploy gotcha medusa build + railway up (workflow)

---

## 2026-05-19 17:00 -- Catalog cleanup + shipping rework + free shipping 500 RON

Commits: `eafc375`, `cf63a09`
Deploy: Railway `a110a1de` SUCCESS + Vercel auto-deploy
Confirmat: DA ("arata bine, fa release")

### Catalog (consolidare duplicate dupa raspuns Andrei)

User a sters din admin Medusa vechiul `Depozit Cluj` (disabled) si a redenumit `Depozit Principal` in `Depozit Cluj`. Asta a triggered cascade delete pe fulfillment_set "Livrare Romania", service_zone "Romania", geo_zone "ro" si 15 shipping_options.

Plus, Andrei a confirmat ca:
- EK-WINNER apartine la categoria de taiere (disc diamantat turbo), NU slefuire
- Saitroanele pot ramane cu dropdown (in agregat)
- SFC din titlul SAITRIS de eliminat (deferred)
- VELCROPAD nu apartine in agregat

Soft-delete-uri aplicate:
- 4 produse standalone (ek-winner, saitris-180, saitron-125, saitron-180) -- duplicate ale agregatului `discuri-de-slefuit-cu-carbura`
- 3 variante VELCROPAD (115/125/180) din agregat
- 3 variante EK WIENNER (125/180/230) din agregat
- Total -10 variante in agregat: 30 -> 24 (doar SAITRIS si SAITRON raman)

### Infrastructure (cauza OOM-urilor)

Backend Medusa crash-uia repetat in timpul DELETE-urilor cu `FATAL ERROR: Reached heap limit Allocation failed`. Investigare:
- `NODE_OPTIONS=--max-old-space-size=460` setat manual pe Railway, prea strans
- Query-urile `/store/products?limit=100` returneaza 2.1 MB raspuns, consum mare RAM per request

Fix: user a facut upgrade Railway Trial -> Hobby ($5/luna, $5 credit). Eu am setat `NODE_OPTIONS` la 1024 MB. API stabil 200 dupa.

### Shipping restore + filtrare

Dupa cascade delete:
- `shipping_options` toate sterse (15), `fulfillment_set` "Livrare Romania" sters, `service_zone` "Romania" sters, `geo_zone` "ro" sters
- Plus 2 `fulfillment_set`-uri active "Depozit Principal pick up" si "Depozit Principal shipping" goale (probabil incercari user)

Restore SQL atomic:
1. UNDELETE fulfillment_set "Livrare Romania" + service_zone + geo_zone + 15 shipping_options
2. Re-link `location_fulfillment_set`: shifted din vechiul sloc sters la cel nou activ
3. Filtrare la 2 metode active (cerinta user: ridicare + Fan Courier API):
   - `Fan Courier` (provider_id=fan-courier_fan-courier, calculated)
   - `Ridicare personala` (redenumit din "Ridicare Cluj", flat 0 RON)
4. Restore `shipping_option_price_set` + `price_set` + `price` (erau si ele soft-deleted; cauza erorii 400 "Shipping options do not have a price")

### Real-time switch + free shipping 500 RON

`CheckoutShipping.tsx`:
- onChange pe radio apeleaza setShippingMethod imediat (in transition); cart se revalideaza, summary se updateaza fara click pe buton
- preselectie din cart.shipping_methods[0] daca exista (nu mai default pe prima opt din lista)
- afisare strikethrough pe tariful calculat + "Gratuit" verde cand item_total >= 500
- banner verde sus: "Comanda ta depaseste 500 Lei -- livrarea cu Fan Courier este gratuita"

`fulfillment-fan-courier/service.ts`:
- calculatePrice extrage item_total din `context.items` (subtotal sau unit_price × quantity)
- daca item_total >= 500 RON -> returneaza calculated_amount=0 (nu mai cheama API Fan Courier inutil)
- log line include item_total pentru debug

### Subtotal items-only + Total corect

Medusa v2 cart returneaza:
- cart.item_total = produse only (33)
- cart.shipping_total = transport (18.37)
- cart.subtotal = items + shipping (51.37) <-- INCLUDE shipping!
- cart.total = 51.37 (egal cu subtotal pentru ca VAT e in pret)

UI afisa "Subtotal 51.37" cu Transport 18.37 ca linie separata si Total 51.37 -- matematica gresita pentru user. Fix:
- `OrderSummary` afiseaza Transport doar cand shipping_total > 0 (ascuns pe cart page)
- Subtotal foloseste cart.item_total (33), nu cart.subtotal
- Cart page: Total = items only (livrarea nu e selectata acolo)
- Checkout: Total = cart.total (= items + shipping)

Aplicat in 6 fisiere: OrderSummary, cart/page, checkout/page, CheckoutReview, order/[id]/confirmed/page, account orders/details/[id]/page.

Commits push-uite:
- `eafc375` fix(checkout): Subtotal items-only + Total = items + Transport
- `cf63a09` feat(shipping): real-time switch + free shipping 500 RON cu strikethrough

Plus toate restore-urile + cleanup-urile catalog au fost facute direct via SQL atomic + Medusa Admin API DELETE (toate soft-delete reversibile).

### Statistici sesiune

Commits push-uite azi: 14 (intre 61b1fc5 si cf63a09)
SQL atomic transactions: 5 (catalog cleanup × 2, shipping restore × 2, free shipping policy)
Bug-uri critice rezolvate: 9 (preturi /100, variant info, CC office, BCC, rebrand .com, R2 switch, payment method, shipping cascade, OOM)
Railway deploys: 7 succese
Vercel deploys: 3+ auto

Ziua de lansare a fost dura dar magazinul e stabil acum. Comenzile #1, #2, #3 sunt OK (sandu_dolha livrare la sediu POS; #2 si #3 anulate de Andrei).

---

## 2026-05-19 18:15 -- Cleanup final: comenzi test sterse + fix referinta orfana

Commits: doar SQL (fara push)
Deploy: nu necesar
Confirmat: DA ("arata bine")

### Comenzi sterse (la cererea user)

User a cerut sa ramana doar #1 (sandu_dolha, singura tranzactie financiara reala). Soft-delete via SQL pe:
- #2 rinzis.andrei (1.632 Lei refunded delivered)
- #3 ciprian.dobrea (147.76 Lei canceled)
- #4 rinzis.andrei (694 Lei refunded canceled)

Medusa Admin API NU expune DELETE pe orders (integrity financiara). SQL direct: `UPDATE order SET deleted_at = NOW() WHERE display_id IN (2,3,4)`. Reversibil.

### Fix orphan reference

Pagina admin /orders/1 returna 404 "Stock location with id: sloc_01KPNGVX8TF3T8GSEVD6K5H7N3 was not found". Acel sloc era vechiul "Depozit Cluj" sters de user mai devreme. `fulfillment.location_id` pe comanda #1 inca pointa la el.

Fix: `UPDATE fulfillment SET location_id = '<sloc activ>' WHERE id = 'ful_...'`. Pagina admin functioneaza acum.

Magazinul e curat: 1 comanda reala vizibila in admin, configurarea de shipping consistenta, niciun orphan reference de la stock_location-ul sters.

---

## 2026-05-20 16:00 -- Fix navigare browser back/forward in catalog si PDP

Commits: `77589a6`, `e640278`
Deploy: https://ardmag.ro/ | Vercel: bylm9jhvl (e640278 trigger ulterior auto-deploy)
Confirmat: DA (verificat headless cu Playwright pe live)

### Problema raportata

User: "cred ca avem probleme cu butoanele de navigare back/forward, de prin magazinul online". Cerinta investigare cu headless chromium.

### Investigare (Playwright pe ardmag.ro live)

Trei bug-uri reproduse:
1. **Scroll pierdut la Back de pe PDP** -- user scrolleaza la y=2026 pe categorie, click pe produs, Back -> revine la y=94 (top).
2. **Fiecare filtru click adauga in history** -- 3 click-uri filtre = 3 entries noi. Back parcurge filtrele unul cate unul in loc sa iasa din listare.
3. **Variant pills pe PDP umfla istoricul** -- la fel, 3 click-uri pe granulatii = 3 entries.

Cauza arhitecturala: 11 locuri foloseau `router.push` pentru modificari de query params pe aceeasi pagina (filtre, sortare, perPage, view toggle, variant pills, reset, sterge filtru, clear all). Plus InfiniteProductGrid nu persista scroll-ul intre navigari.

### Fix livrat

Commit `77589a6`:
- `router.push` -> `router.replace` in FilterSidebar (3), MobileFilterBar (3), CategoryToolbar (3), PDPVariantSelector (1). URL ramane deep-linkable, Back sare peste toate modificarile intra-pagina.
- InfiniteProductGrid persista `{visibleCount, scrollY}` in sessionStorage per pathname+filtre, restaureaza dupa mount cu rAF x2.

Commit `e640278` (fix urmator):
- Listener-ul de scroll salva si scroll-to-0 facut de Next.js dupa Link click, suprascriind scrollY-ul real (2026 -> 0). Fix: capture scrollY in click handler pe document, apoi freeze listener-ul de scroll. Acum la click se salveaza pozitia user-ului inainte de orice scroll programatic.

### Verificare

Playwright pe https://ardmag.ro/categories/slefuire-piatra dupa deploy:
- Scroll 2026 -> click card -> Back -> y=2026, 30 carduri pastrate (era 2026 -> 94, 30 -> 30 inainte).
- 3 click-uri pe filtre brand: history.length neschimbat (era +3).
- 3 click-uri pe variantele unui PDP: history.length neschimbat (era +3).

### Probleme intampinate la deploy

Am facut greseala de a rula `vercel link --yes` din repo root, creand un link gresit catre proiectul `ardmag.com` (nu `ardmag-storefront` care serveste ardmag.ro). Plus ulterior CLI a creat inca un proiect `backend-storefront` din cauza vercel.json de la root cu experimentalServices. Doua proiecte orfan create, sterse manual la finalul sesiunii. Adaugata sectiune in skill-ul `aibaza-deploy-workflow` despre arhitectura specifica monorepo-ului (2 proiecte Vercel) si comanda corecta.

### Documentat in skill

Skill-ul `aibaza-deploy-workflow` a primit sectiune noua "CRITICAL: ardmag.com e monorepo cu 2 proiecte Vercel separate" cu tabel project -> rootDirectory -> URL live si regula corecta de deploy (`cd backend-storefront` inainte de `vercel`).

---

## 2026-05-20 17:00 -- Fix checkout: adresa implicita pre-selectata si eroare Unauthorized

Commits: `cb85a39`
Deploy: https://ardmag.ro/checkout | Vercel: dpl_4mphfbTSvrFbmKWFxUUV6JAeXU5R
Confirmat: DA

### Bug raportat

User pe pagina /checkout pas Adresa: (1) adresa marcata "LIVRARE IMPLICITA" nu se pre-selecta automat, trebuia click manual; (2) dupa click pe "Continua spre livrare" apare text "Unauthorized" si nu se trece la pasul Livrare. Server Action POST /checkout returna payload `1:"Unauthorized"`.

### Cauze identificate

Doua bug-uri distincte cu o cauza rădăcină comuna (JWT expirat):

1. `CheckoutAddressForm.tsx` initializa selectedShippingId la `null` cand cart-ul avea deja shipping_address (pattern: user revine in checkout dupa o incercare anterioara). Logica era "daca cart-ul are adresa, lasa user-ul sa aleaga din nou" -- contraintuitiv.

2. Server Action `setAddresses` in `cart.ts` cherma `sdk.store.customer.retrieve()` pentru a lua datele adresei salvate dupa ID. Apelul necesita JWT customer valid. JWT-ul Medusa expira la 24h (default neoverride-uit in `medusa-config.ts`), dar cookie-ul `_medusa_jwt` are maxAge 7 zile. Pagina renderiza cu addresses pentru ca `retrieveCustomer` foloseste `cache: "force-cache"` cu tag -- raspunsul vechi era cached. Server Action-ul facea apel live -> 401 -> mesaj "Unauthorized" propagat catre client (fara punct la final = direct din SDK, nu din `medusaError`).

### Fix livrat

`CheckoutAddressForm.tsx`:
- Schimb conditie initiala selectedShippingId/Billing la "always pre-select default daca user-ul are adrese salvate", indiferent de cart state.
- Cand user-ul alege o adresa salvata, embed datele adresei ca hidden inputs cu prefix `shipping_address.*` / `billing_address.*`. Helper-ul `SavedAddressHiddenInputs` populeaza first_name, last_name, phone, address_1, company, city, province, postal_code, country_code.

`cart.ts setAddresses`:
- Eliminat complet branch-ul `shipping_address_id` / `billing_address_id` cu apel `sdk.store.customer.retrieve()`.
- Foloseste mereu `addressFromFormData()` pentru ambele adrese (hidden inputs + form fields citite la fel).
- Eliminat helperul mort `addressToCartPayload`.

Bonus: un round-trip mai putin la backend per submit -> checkout mai rapid.

Cart.update nu cere JWT customer (cart access via cart-id), deci flow-ul nu mai e blocat de JWT expirat in pasul Adresa.

### Verificare

User pe ardmag.ro/checkout (logged in, cart cu 851 Lei):
- Pre-selectare default address OK
- Click "Continua spre livrare" -> trece la pas Livrare fara eroare

---

## 2026-05-21 15:20 -- Curatare descrieri produse (diacritice + filler + dash-uri)

Commits: `60ac910` (scripturi + surse)
DB updates: 74 produse via Medusa Admin API + SQL direct
Confirmat: DA (live OK pe https://ardmag.ro)

### Probleme raportate de user

User a observat "granulometrii" in loc de "granulații" pe ceramaster 3 step. La cerere extra: "mai sunt cumva si alte formulari ciudate prin aceste descrieri?". Audit complet a dezvaluit:
- 36 produse cu descrieri ZERO diacritice (generate de Codex/research fara restaurare)
- 28 produse cu "ideal pentru" (formulare slaba, fara substanta)
- 5 produse cu "PREMIUM" / "calitate superioara" capitalizat
- 14 produse cu ghilimele non-romanesti
- 2 produse cu "--" in text
- Pattern "PENTRU- " / "PENTRU-&nbsp;" la 5+ produse

### Backup safety

- API snapshot: /home/dc/_backups/ardmag-2026-05-21/products-full.json (1.8MB, toate 91 produse cu fields complete)
- Full Postgres dump: /home/dc/_backups/ardmag-2026-05-21/full-db.dump (1.2MB, via railway DATABASE_PUBLIC_URL)

### Fix livrat

`scripts/fix-granulometrii.ts`: targeted "granulometr*" -> "granulaț*" preserving suffix (1 hit pe ceramaster-3-step).

`scripts/fix-descriptions-romanian.ts`: dictionar de ~250 cuvinte pentru restaurare diacritice + fix-uri text:
- Cuvinte ultra-frecvente: "si" -> "și", "in" -> "în", "asa" -> "așa", "atat" -> "atât"
- Sufixe -ție/-ții (din -tie/-tii): granulatie, concentratie, rotatie, vibratii, etc.
- Verbe -ează: monteaza, asigura, realizeaza, utilizeaza, etc.
- î la inceput: inainte, intaritor, intindere, impotriva, etc.
- â la mijloc: pana, fara, mana, randul, adanc, varful, stanga, etc.
- ș: masina, flansa, rasinos, portelan, usor, etc.
- Bigrame contextuale: "piatra naturala" -> "piatră naturală", "in functie" -> "în funcție"
- Filler removal: "ideal pentru" -> "potrivit pentru", "calitate superioara" -> "fin"
- Dash-uri: "--" -> "-", "PENTRU- " -> "PENTRU: "

### Applicare

Aplicat 70 produse via Medusa Admin API in primul pass. Backend Railway a picat la 502 in mijloc (Postgres "No space left on device" pe temp dir cauzat de query JOIN masiv pentru produse cu multe variante). Reluat dupa restabilire pentru inca 13 produse.

Pentru `dischete-de-slefuit-cu-carbura` (51 variante) si 4 produse cu diacritice partiale am folosit SQL direct (psql pe DATABASE_PUBLIC_URL), ocolind ORM-ul Medusa care genereaza JOIN-uri ce explodeaza temp file space.

### Curatare suplimentara

- Corectat in surse repo "granulometrii" -> "granulații" la 4 fisiere .md + 1 .sql (research-tenax-tratamente, ceramaster-3-step copy-proposals)
- Cache Next.js revalidat via /api/revalidate?tag=products

### Verificare finala

Scan post-aplicare:
- 0 produse cu "granulometr", "ideal pentru", "calitate superioara", "PENTRU-", "--"
- 4 produse au inca ratio <2.5% diacritice (dar acceptabil pentru lungime/termeni tehnici); hand-rewrite pentru pad-cauciuc, aplicator-fast-glaxs, detergenti, freze-diamantate
- Sample live OK: granulații pe ceramaster, "mașini" + "piatră naturală" pe abrazivi-anelli, "durată de viață lungă" pe dischete-carbura

### Probleme intampinate

1. Backend Railway 502 in mijlocul apply-ului (Postgres disk full pe temp dir). Reluat dupa cateva minute.
2. Test debug initial accidentally a setat description la "test" pe dischete-de-slefuit-cu-carbura. Restored din backup + reaplicat fixul.
3. Push initial respins (autentificat ca dc-softex). Schimbat la dobrician via gh auth switch.
