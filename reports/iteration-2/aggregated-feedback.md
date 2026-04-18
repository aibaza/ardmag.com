# Aggregated Feedback — Iteration 2

Generated: 2026-04-19

## Iteration 2 verdict: NEEDS_WORK

All M1-M4 and m1-m8 issues from iteration 1 are fixed. Two new issues found:

---

## Issues for Iteration 3

### MAJOR — Fix in iteration 3

**M1 — Store page product grid missing mobile breakpoints**
- `src/modules/store/templates/paginated-products.tsx` — grid is hardcoded as `repeat(4, minmax(0, 1fr))` inline style. No media queries. At 375px renders 4 columns of ~65px wide cards.
- Fix: Add `.store-product-grid` CSS class with `<style>` tag:
  ```tsx
  <style>{`
    .store-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    @media (max-width: 860px) { .store-product-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .store-product-grid { grid-template-columns: 1fr; } }
  `}</style>
  ```
  Replace inline `gridTemplateColumns` style with `className="store-product-grid"`.

### MINOR — Fix in iteration 3

**m1 — Color token violations: `white` / `#ffffff` / `bg-white` instead of CSS vars**
- Pre-existing from iteration 1 (noted as m4 in iter-1 feedback, deferred). Now surfacing 16+ violations across:
  - `src/modules/home/components/hero/index.tsx` — `color: "white"` x3, `background: "white"`, `border: "1px solid white"`
  - `src/modules/layout/templates/footer/index.tsx` — `color: "#ffffff"` x2 in `<style>` tag
  - `src/modules/layout/components/site-header/main-bar.tsx` — `color: #ffffff` in `<style>` tag
  - `src/modules/products/components/product-card/index.tsx` — `bg-white`, `text-white`
  - `src/modules/products/components/product-row/index.tsx` — `bg-white`
  - `src/components/ui/input.tsx` — `bg-white`, `bg-stone-50` x2
  - `src/components/ui/stepper.tsx` — `bg-white`, `bg-stone-50` x2
- Rule: For white text on dark backgrounds use `var(--stone-50)`. For white surfaces use `var(--surface)` (= `#ffffff`). For `bg-stone-50` use `bg-[var(--stone-50)]` or inline `backgroundColor: "var(--stone-50)"`.
- Note: `color: "white"` on brand-500 backgrounds is semantically correct but should be `var(--stone-50)` for token consistency. Visual result identical.

---

## What passed in iteration 2

- Hero mobile: single column at 375px ✅
- CategoryGrid mobile: 2-col at 860px, 1-col at 520px ✅
- ProductGrid (homepage) mobile: same breakpoints ✅
- Footer mobile: 2-col at 640px, brand full-width ✅
- "PRECIZIE SOLIDĂ" diacritics in header and footer ✅
- Copyright 2026 in footer ✅
- "Vede" → "Vezi" on hero category card link ✅
- Design system tokens, fonts, orange CTAs, 2px radius all intact ✅
- `isProductOutOfStock` empty-variants guard ✅
- `getProductSpecsPreview` labeled format (TITLE: VALUE) ✅
- Stepper split to stepper.tsx, input.tsx without "use client" ✅
- Merged next/navigation imports ✅
- `any` type removed, HttpTypes.StoreProductVariant used ✅

---

## Priority implementation order for iteration 3

1. Fix store product grid mobile breakpoints (paginated-products.tsx) — biggest remaining UX issue
2. Replace color literals with CSS vars across all affected files
