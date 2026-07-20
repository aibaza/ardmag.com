# Changelog

All notable changes to this project are documented here.
Format: [date] type: description

---

## 2026-07-20 - Prioritate de rețea pentru imaginea principală de produs

### Schimbare livrată

Imaginea principală de pe pagina de produs este cerută explicit cu prioritate ridicată și încărcare imediată. Fișierul și dimensiunile vizuale rămân neschimbate; optimizarea nu atinge coșul, SEO sau analytics.

### Verificare

Baseline Lighthouse mobil pe `/products/mastic-lichid`: mediană din trei probe, LCP 5,42 s, TBT 282 ms, CLS 0, scor 74. Runner-ul acceptă acum un URL explicit și folosește implicit un produs existent.

---

## 2026-07-20 - Formulare naturală în grila articolului despre mastici Tenax

### Schimbare livrată

În grila de decizie din articolul „Mastici Tenax: cum alegi culoarea și cantitatea corectă”, formularea „Solido solid sau Liquido fin” a fost corectată la „Solido sau Liquido”, conform feedbackului expertului Andrei și nomenclaturii Tenax.

### Verificare

Articolul și draftul-sursă folosesc aceeași formulare; metadata și materialele sociale nu conțineau textul greșit.

---

## 2026-05-22 - Email automat la invitatie administrator

### Context

Cand cream un cont nou de administrator pentru cineva din echipa, Medusa crea invitatia in baza de date, dar nu trimitea email. Trebuia sa copiez link-ul si sa-l transmit manual prin alt canal. Daca uitam, persoana nu putea sa intre in admin.

### Schimbare livrata

La crearea unei invitatii noi (Settings -> Team in admin), persoana primeste automat pe email un mesaj cu butonul "Activeaza contul" si link de setare parola valabil 24 de ore. Marca expeditorului: office@ardmag.ro.

### Verificare

Test invite catre o adresa interna pe 22 mai: invitatie creata in admin -> email primit in cateva secunde -> link functional -> activare cont reusita.

---

## 2026-05-21 - Stripe live activat pe ardmag.ro

### Context

Pana acum site-ul folosea un cont Stripe de test pentru plati: comenzile cu cardul mergeau pana la final tehnic, dar banii nu se incasau efectiv. Andrei a dat go-ahead-ul sa trecem pe productie.

### Schimbare livrata

Cardul bancar la checkout foloseste de acum contul real Stripe Arc Rom Diamonds. Cand un client finalizeaza comanda cu cardul, banii ajung direct in cont, comanda apare in admin si email-ul de confirmare se trimite automat.

### Verificare

Trimisa cerere catre Andrei sa faca un order test mic cu card real pentru confirmarea end-to-end (UI checkout -> Stripe -> admin -> email). De finalizat sesiunea urmatoare.

---

## 2026-05-21 - Curatare descrieri produse: diacritice romanesti + formulari ciudate

### Probleme raportate de user

Pe ceramaster 3 step se vedea "granulometrii" in loc de "granulații" (cuvant tehnic incorect, fara diacritice). Audit la cererea user-ului a aratat ca multe descrieri de produse au probleme similare: zero diacritice in 36 produse, formulari fara substanta ca "ideal pentru" (28 produse) si "calitate superioara", separatori vizuali ciudati ("PENTRU- " in loc de "PENTRU: ") si "--" in text.

### Fix livrat

74 descrieri de produse au fost corectate cu:
- Diacritice romanesti complete (s->ș, t->ț, a->ă/â, i->î) pe cuvinte ca "mașini", "asigură", "piatră naturală", "granulație", "operațiuni", "vibrațiile", "concentrație", "rotație", "specifică", etc.
- "granulometrii" inlocuit cu "granulații" peste tot in catalog si in surse.
- Filler eliminat: "ideal pentru" -> "potrivit pentru", "calitate superioara" -> "fin".
- Separatori curatati: "PENTRU- Ceramică" -> "PENTRU: Ceramică".

Toate paginile de produs afiseaza acum textul in romana corecta, mai potrivit pentru profesionistii care lucreaza cu piatra naturala.

### Verificare

Live pe https://ardmag.ro pentru: ceramaster-3-step, abrazivi-anelli, dischete-de-slefuit-cu-carbura, burghiu, mastic-semisolid, pad-cauciuc, detergenti.

---

## 2026-05-20 - Fix checkout: adresa implicita pre-selectata si eroare Unauthorized

### Bug raportat de user

La checkout pas Adresa: adresa marcata "LIVRARE IMPLICITA" nu se pre-selecta automat (utilizatorul trebuia sa o aleaga manual de fiecare data), iar dupa selectie click pe "Continua spre livrare" returna eroare "Unauthorized" si flow-ul ramanea blocat la pasul Adresa.

### Cauza identificata

- Pre-selectia adresei implicite era conditionata de starea coșului (`!cartShippingAddress?.address_1`). Daca user-ul mai intrase in checkout anterior, cart-ul avea deja adresa setata si conditia bloca pre-selectia la reintrare.
- Server Action-ul pentru salvarea adreselor apela `sdk.store.customer.retrieve()` pentru a lua datele adresei salvate dupa ID. Apelul necesita JWT customer valid. JWT-ul Medusa expira la 24h (default), dar cookie-ul tine 7 zile, deci dupa 24h cookie-ul exista dar token-ul dinauntru e respins de backend cu 401. Pagina renderiza normal pentru ca raspunsul vechi era cached (`force-cache`), Server Action-ul facea apel live si primea 401.

### Fix livrat

- fix(checkout): pre-selectie adresa implicita ori de cate ori user-ul are adrese salvate, indiferent de starea coșului. User-ul poate inca schimba selectia, dar default-ul e mereu adresa marcata implicita.
- fix(checkout): cand user-ul alege o adresa salvata, datele se trimit ca hidden inputs in formular cu prefixele `shipping_address.*` / `billing_address.*`. Server Action-ul citeste totul din formData fara apel customer-dependent. Elimina dependenta de JWT customer in pasul Adresa.
- refactor(cart): eliminat helperul `addressToCartPayload` (nu mai e folosit dupa simplificare), si un round-trip catre backend per submit.

### Verificare

Test pe https://ardmag.ro/checkout cu user logged in si cart 851 Lei: adresa "Acasa" cu badge "LIVRARE IMPLICITA" preselectata la deschidere, click "Continua spre livrare" duce la pasul Livrare fara eroare. Confirmat de user pe live.

---

## 2026-05-20 - Fix navigare browser back/forward in catalog si PDP

### Bug raportat de user

Butoanele de Back/Forward din browser se comportau ciudat pe magazinul online: pe paginile de listare fiecare click pe filtru/sortare adauga o intrare noua in istoric, iar la revenirea de pe o pagina de produs scroll-ul pleca de la zero. Reprodus headless cu Playwright pe ardmag.ro live.

### Cauza identificata

- Filtre, sortare, perPage, view toggle si selectorul de varianta pe PDP foloseau `router.push` care creeaza intrare in browser history la fiecare click. Trei click-uri = trei intrari, Back-ul devenea inutil.
- InfiniteProductGrid pierdea scroll-ul la revenirea pe categorie pentru ca browser-ul restaura scroll inainte ca layout-ul produselor sa fie aseazat in DOM.

### Fix livrat

- fix(storefront): inlocuit `router.push` cu `router.replace` in `FilterSidebar`, `MobileFilterBar`, `CategoryToolbar`, `PDPVariantSelector` -- toate cele 10 interactiuni care modifica doar query params pe aceeasi pagina. URL ramane deep-linkable; Back sare peste toate modificarile intra-pagina.
- fix(storefront): persistat `{visibleCount, scrollY}` in sessionStorage in `InfiniteProductGrid`, cu cheie per pathname+filtre (canonicalizat). Restaurat dupa mount cu rAF x2 ca layout-ul sa se aseze inainte de scroll.

### Fix urmator dupa primul deploy

Primul fix salva scrollY in cleanup-ul de unmount, dar Next.js scrolleaza la 0 INAINTE de unmount, asa ca valoarea salvata era 0. Diagnosticat headless: sessionStorage la deschiderea PDP arata `scrollY:0` in loc de 2026.

- fix(storefront): capture scrollY in click handler pe document (capture phase), inainte de scroll-ul programatic al Next.js; "freeze" listener-ul de scroll dupa click pentru a nu fi suprascris.

### Verificare finala

Headless Playwright pe ardmag.ro live: scroll restaurat 2026 -> 2026 (era 2026 -> 94), 30 carduri pastrate, 0 intrari noi in history la 3 click-uri pe filtre, 0 la 3 click-uri pe variantele PDP.

---

## 2026-05-19 — Ziua de lansare: stabilizare emailuri, catalog cleanup, shipping rework

### Blog: masticuri epoxidice vs poliesterice

- docs(blog): clarificat evoluțiile recente din chimia masticurilor pentru piatră: tixotropie, low-styrene/low-VOC, cartușe bicomponente cu mixer static, compatibilitate cu engineered stone, UV și contact alimentar validate per produs.
- docs(blog): ton mai prudent juridic/comercial: low-VOC nu înseamnă netoxic, iar certificările se verifică în fișa tehnică/certificat, nu se deduc din familia chimică.

### Shipping: restore + filtrare la 2 metode (Fan Courier + Ridicare personala)

- fix(shipping): restore complet dupa cascade delete cand user-ul a sters vechiul stock_location "Depozit Cluj" (a luat cu el fulfillment_set "Livrare Romania", service_zone "Romania", geo_zone "ro" si 15 shipping_options)
- chore(shipping): filtrat catalogul de opțiuni la 2: `Fan Courier` (calculated, API tarif) si `Ridicare personala` (flat 0 RON, redenumit din "Ridicare Cluj"). Scoase: Cargus × 3, Sameday × 3, Posta Romana × 3, dubluri Fan Courier manual_manual × 2, dubluri Ridicare Cluj × 2
- fix(shipping): restore `shipping_option_price_set` + `price_set` + `price` care erau soft-deleted (pretul de baza era detached -> POST /carts/{id}/shipping-methods returna 400 "Shipping options do not have a price")

### Free shipping 500 RON (politica ARDmag)

- feat(shipping): `modules/fulfillment-fan-courier/service.ts` calculatePrice extrage item_total din context.items si returneaza 0 cand >= 500 RON
- feat(checkout): `CheckoutShipping.tsx` afiseaza strikethrough pe tariful calculat + "Gratuit" verde cand cart-ul depaseste 500 Lei; banner verde explicativ deasupra listei

### Real-time switch metoda de livrare

- feat(checkout): `CheckoutShipping.tsx` apeleaza `setShippingMethod` pe radio change (in transition) -- summary-ul de pe dreapta se actualizeaza instant, fara click pe "Continua spre plata"
- feat(checkout): preselectie din `cart.shipping_methods[0]` daca exista deja (nu mai default pe prima optiune din lista la fiecare reincarcare)

### Subtotal items-only + Total corect

- fix(checkout): in Medusa v2, `cart.subtotal` include shipping_total. UI afisa eronat "Subtotal 51.37 / Transport 18.37 / Total 51.37" pentru o comanda cu 33 RON produse + 18.37 livrare. Acum:
  - `OrderSummary` afiseaza linia Transport doar cand shipping_total > 0 (ascuns pe cart page)
  - Subtotal foloseste `cart.item_total` (produse only)
  - Total pe cart page = items only; Total pe checkout = items + transport

### Catalog cleanup (post raspuns Andrei pe duplicate)

- chore(catalog): soft-delete pe 4 produse standalone duplicate ale agregatului `discuri-de-slefuit-cu-carbura`: ek-winner, saitris-180, saitron-125, saitron-180 (variantele exista in agregat cu DIAMETRU 125/180/230 ca optiune separata)
- chore(catalog): soft-delete pe variantele VELCROPAD × 3 (115/125/180) din agregat -- nu apartin la slefuit cu carbura
- chore(catalog): soft-delete pe variantele EK WIENNER × 3 (125/180/230) din agregat -- per Andrei, EK WIENNER e disc diamantat turbo de taiere, nu slefuire
- Rezultat: agregatul are doar SAITRIS si SAITRON (24 variante), TIP DISC afiseaza doar 2 butoane

### Infrastructure: Railway Hobby + heap 1024 MB

- chore(infra): upgrade Railway de la trial la Hobby ($5/luna, $5 credit inclus); trial-ul expira in 2 zile, neupgrade ar fi insemnat pierderea proiectului
- fix(infra): `NODE_OPTIONS=--max-old-space-size` ridicat de la 460 MB la 1024 MB; root cause OOM crash recurent pe DELETE-uri si query-uri mari (/store/products?limit=100 returna 2.1 MB response)

### Bug critic metoda de plata in emailuri

### Bug critic metoda de plata in emailuri

- fix(email): `templates/order-admin.ts`, `templates/order-customer.ts` -- citesc `pc.payments[0].provider_id` (snapshot-at pe order, queried), NU `pc.payment_sessions` (ephemeral cart-level, neinclus in query.graph fields)
- impact: pe TOATE comenzile (din ziua de lansare), emailul afisa "Card (Stripe)" indiferent de plata reala -- fallback default cand sessions era undefined; sandu_dolha si ciprian aveau RAMBURS dar email zicea Stripe
- detectie explicita: `pp_system_default`/`manual` -> "Ramburs (la curier)"; `stripe` -> "Card (Stripe)"; alt provider -> string raw (nu mai e fail silent)
- test(email): `templates/__tests__/order-admin.unit.spec.ts` -- 3 scenarii (ramburs/Stripe/unknown), PASS

### Brand: ardmag.com -> ARDmag.ro

- refactor(brand): domeniul principal devine `ardmag.ro`; `ardmag.com` ramane activ doar pentru 308 redirect SEO-safe la `ardmag.ro`
- 14 scripturi de import/catalog: `ADMIN_EMAIL` default `admin@ardmag.com` -> `admin@ardmag.ro`
- `scripts/enrich/subagent-prompt.ts`: system prompt AI catalog research aliniat
- `backend-storefront/src/app/robots.ts`: scos `magazin.ardmag.com` (subdomain neutilizat); pastrat `ardmag.com` pentru SEO coverage 308
- docs: CLAUDE.md, docs/04-implementation-plan.md, docs/deployment/architecture.md, SECRETS.md aliniate

### Media domain: media.ardmag.ro custom domain R2

- chore(r2): adaugat custom domain `media.ardmag.ro` pentru bucket `ardmag-media` in Cloudflare R2
- env(vercel): `NEXT_PUBLIC_R2_HOSTNAME=media.ardmag.ro` (production + preview)
- env(railway): `R2_PUBLIC_URL=https://media.ardmag.ro`
- db: rewrite 199 imagini + 95 thumbnails -- `pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev` -> `media.ardmag.ro` (transaction simpla cu replace())
- toate paginile storefront servesc imagini de pe media.ardmag.ro; URL-ul vechi R2 default ramane functional dar nu mai e folosit

### Monitoring BCC

- feat(email): BCC global `dc@aibaza.ro` pe toate emailurile expediate (configurabil prin `NOTIFICATION_BCC` env)
- threadat prin SMTP2GO HTTP API si nodemailer SMTP fallback
- temporar, pentru visibility ridicata pe emailurile reale care pleaca clientilor in primele zile de productie

### Workflow lesson learned

- chore(deploy): pentru schimbari de cod backend NU e suficient `git push`. Dockerfile copiaza din `.medusa/server/` (gitignored), deci Railway nu vede codul nou pana nu rulam `npm run build` + `railway up --service medusa --detach` din `backend/`
- adaugat in CLAUDE.md ca regula explicita

### Bug critic preturi /100

- fix(email): `templates/order-admin.ts`, `templates/order-customer.ts`, `templates/cart-abandoned.ts` -- scoate `/100` din `formatPrice`; post-migrare 18 mai DB-ul stocheaza raw decimal
- fix(email): `templates/order-customer.ts` -- threshold ramburs (livrare gratuita >= 500 RON) si suma de plata afiseaza valoarea reala, nu 1/100
- fix(email): `templates/cart-abandoned.ts` -- threshold livrare gratuita 500 RON corect
- impact: comenzile post 18 mai (ex. comanda #1 sandu_dolha 1046 RON) afisau "10.46 RON" in email; acum afiseaza 1046.00 RON corect

### Variant info complet in emailuri

- feat(email): `templates/order-admin.ts` -- afiseaza 3 linii per produs (titlu, identificator handle/SKU, optiuni varianta) -- match cu admin Medusa
- feat(email): `templates/order-customer.ts` -- afiseaza 2 linii per produs (titlu, optiuni varianta in monospace uppercase)
- foloseste `item.variant_title` si `item.variant_sku`/`product_handle` (snapshot-ate pe order line item de Medusa, nu necesita modificari de query)
- filtru "Default Title" pentru produsele fara variante reale (90 produse, 30 single-variant)

### CC office@ardmag.ro pe emailul intern

- feat(email): `subscribers/order-placed-notify.ts` -- adauga `ADMIN_CC` (configurabil prin `ORDER_NOTIFY_CC`, default `office@ardmag.ro`)
- feat(email): `modules/notification-smtp2go/service.ts` -- threadat `cc` prin `data` payload; suport pentru SMTP2GO HTTP API (`body.cc`) si nodemailer SMTP fallback

### Refactor + test

- refactor(email): `formatPrice` centralizat in `templates/tokens.ts` (era duplicat in 3 template-uri); preveniri regresii viitoare la modelul de pret
- test(email): `templates/__tests__/tokens.unit.spec.ts` -- 3 grupe Jest unit; lock-uieste raw decimal (`formatPrice(464) === "464.00"`)

### Script audit

- chore(scripts): `scripts/list-recent-orders.ts` -- listeaza comenzile din ultimele 14 zile cu total real (raw decimal) si payment status; folosit pentru a identifica comenzile care au primit emailuri cu preturi /100

---

## 2026-05-01 — Catalog: preturi corecte, variante BUC., cleanup

### Preturi + greutati (Railway prod)

- fix(scripts): `update-all-prices-weights.ts` -- parseNum suporta format romanesc `1.100,00`
- fix(scripts): DISCURI DE TAIERE -- format variant corect `DISC {stone} / {model} / {size} / {flanso}`
- fix(scripts): K-series -- MARM->MARMURA DRY, PAV->PODELE, EDGE->PRESTIGE/PREMIUM EDGE
- fix(scripts): PAD POLIMASTER -- format corect cu inch (`17"`), HEX pentru 13"
- fix(scripts): CAROTE fara prefix D, BURGHIU cu sufix ` mm`
- fix(scripts): FREZE -- mapping explicit per tip (TALER, TURBO PIATRA/BETON, SEMIBASTON, BASTON)
- fix(scripts): PERIE OTEL/INOX -- combinate in DB ca varianta unica
- fix(scripts): VEL/SAITDISC CUTIE/BAX -- multiplica pret per bucata × cantitate (bug critic)
- aplicat pe Railway: 490 variante cu pret actualizat, 532 variante cu greutate

### Variante BUC. per bucata

- feat(scripts): `scripts/add-buc-variants.ts` -- script nou, adauga variante per bucata
- feat(db): 51 variante BUC. noi pe DISCHETE DE SLEFUIT CU CARBURA (VEL + SAITDISC, toate granulatiile), fiecare cu price_set + inventory complet wirat
- sincronizat pe local DB pentru consistenta cu scriptul de update preturi

### Cleanup catalog

- fix(db): MASA DE TAIAT arhivata (status=draft, variante soft-deleted) -- fabrica furnizorului a inchis
- fix(db): POMPA CU APA mutata in categoria DIVERSE
- fix(db): categoria MESE DE TAIAT soft-deleted

### Storefront: variant selector

- fix(adapter): `product-to-pdp-variant-selector.ts` -- selectie context-aware; la click pe o optiune pastreaza cat mai multe din selectiile curente
- efect: SAITDISC + diametru 125 functioneaza impreuna; parametrii nu se mai reseteaza
- test: `tests/e2e/variant-selector.spec.ts` -- 3 scenarii, toate PASS

---

## 2026-04-20 — Checkout RO complet: livrare, plata, finalizare comanda

### Livrare Romania

- feat(shipping): script idempotent `setup-ro-shipping.ts` — creeaza Regiune Romania (RON), Stock Location "Depozit Cluj", Fulfillment Set "Livrare Romania" (geo_zone country=ro), 5 optiuni de livrare (Fan Courier 19.99 RON, Sameday 21.99 RON, Cargus 22.99 RON, Posta Romana 14.99 RON, Ridicare Cluj 0 RON), regula free shipping la subtotal >= 500 RON
- feat(shipping): adauga RON la store currencies; asociaza Default Sales Channel cu Depozit Cluj; leaga fulfillment provider manual_manual
- fix(shipping): TVA Romania 21% (nu 19%)
- fix(payment): leaga `pp_system_default` (Ramburs la livrare) la Regiunea Romania via `updateRegionsWorkflow`
- fix(cart): `fix-product-shipping-profiles.ts` — leaga cele 86 de produse importate din Wix la profilul de livrare default; rezolva eroarea "cart items require shipping profiles" la `cart.complete()`
- chore(shipping): `cleanup-shipping-dupes.ts` — sterge optiunile de livrare duplicate create la rerulari partiale

### Checkout UI

- fix(checkout): logo corect cu transparenta (`logo-transparent.png`) in header-ul de checkout
- fix(checkout): step indicator afisare corecta (pills + separatori inline)
- fix(checkout): sumele din OrderSummary right-aligned cu `fontVariantNumeric: tabular-nums`

---

## 2026-04-20 — Review complet: A11Y + SEO

### Accesibilitate (WCAG AA)

- fix(a11y): PDPTabs convertit la client component cu role="tab", aria-selected, aria-controls, aria-labelledby, tabIndex si navigare cu tastele Arrow
- fix(a11y): CategoryToolbar — view-toggle schimbat din role="tablist" (incorect) in role="group" + aria-pressed pe butoane grid/list
- fix(a11y): SiteHeader — `<div>` -> `<header>` landmark; mobile drawer primeste role="dialog", aria-modal, aria-label; navigatii mobile `<div>` -> `<nav aria-label>`
- fix(a11y): Homepage — Hero primeste headingLevel="h1" (pagina nu avea H1)
- fix(a11y): `/produse` — `<h2 className="sr-only">` adaugat inainte de product grid (rezolva salt H1->H4)
- fix(a11y): `--brand-500` intunecat la `oklch(56% 0.190 42)` — contrast CTA orange trece WCAG AA (era 3.63:1, acum >4.5:1)
- fix(a11y): footer muted text — 4 selectoare swap `--stone-500` -> `--stone-400` pe fundal dark (era 4.0:1, acum >4.5:1)

### SEO

- feat(seo): `src/app/sitemap.ts` — App Router route, serveste `/sitemap.xml` cu toate produsele + categoriile + pagini statice; lastModified din `product.updated_at`
- feat(seo): `src/app/robots.ts` — staging (`ardmag.surmont.co`) returneaza `Disallow: /`; productie returneaza reguli corecte cu link catre sitemap
- feat(seo): `src/lib/util/json-ld.tsx` — OrganizationJsonLd (adresa, telefon, email), WebSiteJsonLd (cu SearchAction), BreadcrumbListJsonLd, ProductJsonLd (cu Offer, price, availability)
- feat(seo): root layout — title template `"%s · ARDMAG"`, description, OG defaults (locale ro_RO, siteName, type website), Twitter card summary_large_image
- feat(seo): homepage — metadata export cu title/description/OG/canonical
- feat(seo): pagina produs — canonical URL, OG description + URL, Twitter card cu imagine; ProductJsonLd injectat cu pret real din calculated_price
- feat(seo): pagini categorie — canonical URL, OG; eliminat sufix `| ardmag.com` (template root il adauga)
- feat(seo): collections — eliminat boilerplate `"| Medusa Store"`
- feat(seo): /promotii — canonical; /search — canonical + robots noindex/nofollow
- feat(seo): Breadcrumb — injecteaza BreadcrumbListJsonLd automat pe toate paginile cu breadcrumb
- fix(middleware): exclud `robots.txt` si `sitemap.xml` din matcher — "robots" continea "ro" si declansa un redirect loop
- chore: sters `next-sitemap.js` (config mort, referinta env gresita, pachet neinstalat)

---

## 2026-04-18 / 2026-04-19 — Faza 1: Bootstrap + Import Catalog

### Backend (Medusa v2)

- feat: bootstrap Medusa v2 backend pe localhost:9000
- feat: import catalog Wix CSV — 90 produse, 775 variante active (`scripts/import-wix-catalog.ts`)
- feat: download imagini produs de pe Wix, normalizare filename (strip `~mv2`, hash-based) (`scripts/download-images.ts`)
- feat: route statica imagini la `/static/images/[productSlug]/[filename]` pe portul 9000 (admin UI)
- feat: enrich catalog — tags (PROMO 30%), tipuri produs din colectie Wix (`scripts/enrich-catalog.ts`)
- feat: stoc 100 unitati per varianta, legat la Depozit Principal + Default Sales Channel

### Configurare Romania

- feat: regiune Romania (RON, tara ro)
- feat: taxa TVA 21% implicita (cod TVA-RO-21)
- feat: adresa depozit Depozit Principal — Calea Baciului 1-3, Cluj-Napoca, RO 400230
- feat: valuta RON setata ca default in store (inlocuieste EUR)

### Storefront (Next.js localhost:8000)

- feat: symlink `public/static/images` -> `resources/images` pentru servire imagini
- fix: `variant.images?.length` — crash cand varianta nu are imagini
- fix: regiune Romania in middleware (regionMapUpdated: 0 pentru refresh imediat)
- fix: `lang="ro"` in root layout
- feat: descrieri produs randate ca HTML cu `dangerouslySetInnerHTML` + `@tailwindcss/typography`
