# Changelog

All notable changes to this project are documented here.
Format: [date] type: description

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
