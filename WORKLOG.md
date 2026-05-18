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
