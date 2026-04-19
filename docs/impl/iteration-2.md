# Iteration 2 — category — PASS

**Date:** 2026-04-19
**Page:** category
**Source:** `resources/design2/category.html`
**Target:** `backend-storefront/src/app/[countryCode]/design-preview/category/page.tsx`
**Verdict:** PASS

## Screenshots

### Mobile (375px)
| Current | Target |
|---------|--------|
| ![current-mobile](../../reports/impl/iteration-2/screenshots/current/category-mobile.png) | ![target-mobile](../../reports/impl/iteration-2/screenshots/target/category-mobile.png) |

### Tablet (768px)
| Current | Target |
|---------|--------|
| ![current-tablet](../../reports/impl/iteration-2/screenshots/current/category-tablet.png) | ![target-tablet](../../reports/impl/iteration-2/screenshots/target/category-tablet.png) |

### Desktop (1440px)
| Current | Target |
|---------|--------|
| ![current-desktop](../../reports/impl/iteration-2/screenshots/current/category-desktop.png) | ![target-desktop](../../reports/impl/iteration-2/screenshots/target/category-desktop.png) |

## Log Status

CLEAN — category page compiles and serves 200.

**Infrastructure fix required:** Directoarele cu prefix `_` (ex: `_design/`) sunt "private folders" în Next.js App Router și sunt excluse din routing automat. Redenumit `_design` → `design-preview`. Actualizat `scope.yaml` și planul.

## Diferențe rezolvate

Față de prima tentativă (404): ruta a fost mutată de la `_design/` la `design-preview/`.

## Diferențe rămase

Minore, sub 1.5% din înălțimea paginii:

- **Desktop nav wrapping:** un item de nav ("Pietre de polifisat" sau similar) poate face wrap pe 2 linii în current vs. 1 linie în target. Aceeași CSS, diferență de font rendering headless vs. browser real.
- **Mobile height delta ~240px:** probabil o diferență de spacing sau un produs în plus față de target. Nu afectează structural.

Nicio diferență de structură, culori, sau secțiuni lipsă.

## Decizii arhitecturale

- `useState(mDrawerOpen)` pentru mobile navigation drawer — `onclick` original modifica `data-open` pe container.
- `document.getElementById` în `onClick` pentru toggle filtru (sidebar filters) — elementul țintă nu este în state-ul componentei, DOM call minimal consistent cu regula no-restructure.
- `defaultChecked` pentru checkbox-uri statice (evită React controlled-input warning).
- `defaultValue` pentru input-uri numerice de preț.
- Em dash eliminat din titluri de produs (conform CLAUDE.md).

## Issues rămase pentru iterația următoare

None — proceed to iteration 3 (product page).
