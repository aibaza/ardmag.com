# Design Pending

Decizii vizuale în așteptare de la track-ul B. Actualizat pe măsură ce implementarea avansează.

Format: `- [ ] Componentă: <element> — <ce decizie se așteaptă>`

---

- [x] Componentă: card produs în listing — hover effect existent confirmat. Nicio schimbare.
- [x] Componentă: pagina de produs — galerie: thumbnail strip vertical stanga + main image. Confirmat. Selector variații si pret dinamic: implementate.
- [x] Componentă: listing categorie — infinite scroll. InfiniteProductGrid client component cu useIntersection, slice 24/pagina din allFiltered. Pagini: categories, produse, promotii.
- [x] Componentă: header — 3 straturi (util-bar + main-bar + cat-nav) confirmate. Mobile burger + logo + favorite + cos confirmat.
- [x] Componentă: homepage hero — promo hero dinamic din Medusa. Tag `featured` pe produs, adapter product-to-hero.ts, fallback static. Layout identic.
- [x] Componentă: mobile filter — inline confirmat. Header "Filtre" + buton "Închide ×" adaugat (era X izolat).
- [x] Componentă: footer — 5 coloane confirmate, ANPC in footer-bot. Date contact reale aplicate.
- [x] Componentă: checkout — multi-step. Progress bar (StepIndicator), billing address + same-as-billing, step guards, back navigation, review cu line items + totals.
- [x] Componentă: pagini cont — dashboard cu sidebar sticky (position: sticky, cat-layout grid). Fix route mismatch orders/details/[id]. aria-current pe link activ.
- [x] Componentă: card categorie — imagine + label + nr. produse. Confirmat.
- [x] Decizie: optiunea COLOR — chip buttons implementate (TRANSPARENT, BEJ, 1 LITRU). Confirmat.
- [x] Decizie: breadcrumbs — produs, categorie, /produse. Homepage fara. Confirmat.
- [x] Decizie: tipografie — IBM Plex Sans (body) + IBM Plex Mono (labels/preturi). Confirmat.
- [x] A11Y — Contrast CTA primary — `--brand-500` intunecat la `oklch(56% 0.190 42)`. Rezolvat.
- [x] A11Y — Contrast footer text — `.footer-top h5`, `.news-consent`, `.trust-item span`, `.footer-bot` swap `--stone-500` -> `--stone-400`. Rezolvat.
- [ ] Componentă: blog index -- layout lista carduri articole (imagine per card, tag chips, paginare)
- [ ] Componentă: blog article view -- tipografie editorial, hero image, breadcrumb, related articles
- [ ] Email templates -- layout vizual exact pentru review track B. Implementarea curenta: single-column 600px, header slate-900 + logo, footer cu identitate completa, tokens derivate din storefront globals.css. Nicio decizie noua de design -- doar aliniere cu ce exista pe site.
- [x] Componenta: imagini produs in dark mode (img.pimg pe cards listing) -- aplicat optiunea 2 (paspartout CSS universal): background #fff + border-radius var(--r-sm) pe .pimg. In light mode efect invizibil (alb pe alb), in dark mode imaginea apare cu rama alba intentionata.
