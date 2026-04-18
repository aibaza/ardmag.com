# Aggregated Feedback — Iteration 1

Generated: 2026-04-19

## Issues by priority (for Iteration 2 agent)

### BLOCKER — Fixed in iteration 1 wrap-up
- [x] **tokens.css `@layer base` wrapper** — caused CssSyntaxError in Turbopack, every page returned 500. Fixed by removing the wrapper, leaving bare `:root { }`.

---

### MAJOR — Fix in iteration 2

**M1 — Mobile responsive grids (UI/UX)**
- Hero: hard 2-column grid with no mobile fallback. On 375px, columns are 50% width each — too narrow.
- CategoryGrid: hard `repeat(4, 1fr)` — on mobile shows 4 cards at ~90px width each.
- Product grid (homepage): same issue, hard 4-col.
- Footer: 5-column grid has no responsive collapse.
- Fix: Add `gridTemplateColumns` changes at mobile breakpoints. Reference DS04 for footer breakpoints:
  - ≤1060px: `1fr 1fr 1fr` with brand col spanning full width
  - ≤640px: `1fr 1fr`
  - Hero: ≤900px: `1fr` (single column)
  - Category/Product grids: ≤860px: `repeat(2, 1fr)`, ≤520px: `1fr`

**M2 — Duplicate product utility functions (Code)**
- `isOutOfStock` and specs preview logic duplicated verbatim between:
  - `src/modules/products/components/product-card/index.tsx`
  - `src/modules/products/components/product-row/index.tsx`
- Fix: Extract to `src/lib/util/product.ts`:
  ```ts
  export function isProductOutOfStock(product: HttpTypes.StoreProduct): boolean
  export function getProductSpecsPreview(product: HttpTypes.StoreProduct, max: number): string[]
  ```
  Then import in both components.

**M3 — Stepper decrement bug (Code)**
- `src/components/ui/input.tsx` — Stepper decrement button disabled condition uses wrong logic.
- Fix: verify and simplify to `value <= min` for decrement, `value >= max` for increment.

**M4 — `any` type in product components (Code)**
- Both `product-card` and `product-row` use `(v: any)` when mapping variants.
- Fix: Use `HttpTypes.StoreProductVariant` from `@medusajs/types`.

---

### MINOR — Fix in iteration 2 (alphabetical by file)

**m1 — Typo: "Vede produsele" → "Vezi produsele"**
- `src/modules/home/components/hero/index.tsx`

**m2 — Missing diacritic: "SOLIDA" → "SOLIDĂ"**
- `src/modules/layout/components/site-header/main-bar.tsx`
- `src/modules/layout/templates/footer/index.tsx`
- Check all occurrences of "PRECIZIE SOLIDĂ" — the Ă must render correctly.

**m3 — Copyright year: 2025 → 2026**
- `src/modules/layout/templates/footer/index.tsx`

**m4 — `#ffffff` / `"white"` instead of CSS vars**
- Multiple files use `color: "white"` or `"#fff"` inline. For dark-on-dark contexts, use `var(--stone-50)` or `var(--stone-200)`. For text-on-brand-500 contexts, `white` is semantically correct but should be `#fff` not the string `"white"`.
- Files: util-bar.tsx, cat-nav.tsx, main-bar.tsx, mobile-drawer, footer, hero
- Low priority — visual result is correct.

**m5 — Raw oklch in promo-band**
- `src/modules/home/components/promo-band/index.tsx` has `color: "oklch(90% 0.06 42)"` hardcoded.
- This is a computed offset from brand-500 — acceptable exception per project rules. No fix needed.

**m6 — `"use client"` on entire input.tsx**
- Only `Stepper` needs client-side state. `Field`, `InputShell`, `TextInput`, `SelectInput` are stateless.
- Fix: split `Stepper` into `src/components/ui/stepper.tsx`, leave input.tsx without "use client" directive.
- Priority: LOW (doesn't break anything).

**m7 — Decorative `<style>` injection in server components**
- `util-bar.tsx` uses `<style>` tags for hover states instead of Tailwind.
- Fix: Use Tailwind group-hover or convert to client component for hover states, or use CSS-in-JS approach consistently.

**m8 — Double import in main-bar.tsx**
- Two `import ... from "next/navigation"` lines.
- Fix: merge into single import.

---

## What is working correctly

- IBM Plex Sans + Mono fonts loaded and applied via CSS vars
- Brand orange (--brand-500) on all CTAs
- Radii 2px (var(--r-sm)) consistent in components
- Header 3-layer structure (util-bar stone-900 / main-bar white / cat-nav)
- Dark hero with stone-900 background
- Orange promo band (brand-500)
- Dark footer stone-900
- ProductCard: image + mono price + CTA — structure correct
- Badge component reused (not reimplemented) in product cards
- getStemFromThumbnail imported correctly (no inline regex duplication)
- ProductImage used correctly (no native img for products)
- categories.ts constants file — single source of truth working
- tsconfig aliases @components/* and @constants/* added

---

## Priority implementation order for iteration 2

1. Fix mobile responsive breakpoints (Hero, CategoryGrid, ProductGrid, Footer) — biggest UX impact
2. Extract duplicate product utilities to src/lib/util/product.ts
3. Fix Stepper logic bug
4. Fix `any` type usage
5. Fix typos (m1, m2, m3)
6. Fix minor code quality (m6, m8)
