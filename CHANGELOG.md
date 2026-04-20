# Changelog

All notable changes to this project are documented here.
Format: [date] type: description

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
