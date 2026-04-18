# Code Quality Review -- Iteration 1

## TypeScript check results

`npx tsc --noEmit` reports 17 errors, but **zero are in scoped files**. All errors are in pre-existing
boilerplate files outside the iteration-1 scope:

- `src/modules/checkout/components/shipping/index.tsx` (3 errors -- `service_zone` vs `service_zone_id`)
- `src/modules/common/components/line-item-price/index.tsx` (5 errors -- possibly-undefined prices)
- `src/modules/common/components/line-item-unit-price/index.tsx` (6 errors -- possibly-undefined totals)
- `src/modules/layout/components/country-select/index.tsx` (1 error -- optional string assigned to required string)
- `src/app/[countryCode]/(main)/products/[handle]/page.tsx` (1 error -- `StoreProductImage[] | null` not assignable to `StoreProductImage[]`)

These are pre-existing, not introduced in iteration 1.

---

## Issues found

### Critical

None.

---

### Major

**M1 -- Stepper decrement guard is logically wrong**
File: `src/components/ui/input.tsx`, line 214

```ts
const decrement = () => {
  const next = value - step
  if (max === undefined || next >= min) onChange(Math.max(min, next))
}
```

The condition `max === undefined || next >= min` is wrong for decrement. `max` has no relevance to
decrementing -- you only need `next >= min`. The current guard skips the call when `max` is defined
AND `next < min`, but allows it when `max === undefined` regardless of min boundary. The `Math.max(min, next)`
clamps anyway so the guard does not cause a crash, but the logic is incorrect and misleading. The correct
condition is simply `next >= min` (or remove the guard and rely solely on `Math.max`).

**M2 -- `isOutOfStock` and `isSale` logic duplicated verbatim across two components**
Files:
- `src/modules/products/components/product-card/index.tsx` lines 12-16, 33-36
- `src/modules/products/components/product-row/index.tsx` lines 12-16, 31-34

`isOutOfStock` is copy-pasted function-for-function. `isSale` is copy-pasted expression-for-expression.
`specsPreview` extraction logic is nearly identical (differs only in `.slice(0, 3)` vs `.slice(0, 2)`
and join vs map). These belong in a shared utility file (e.g., `src/lib/util/product.ts`).

**M3 -- `(v: any)` in `isOutOfStock` in both product-card and product-row**
Files: `src/modules/products/components/product-card/index.tsx:15`,
`src/modules/products/components/product-row/index.tsx:15`

```ts
return product.variants.every(
  (v: any) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 0
)
```

`v` is `HttpTypes.StoreProductVariant`. No `any` needed -- use the correct type or destructure.

**M4 -- `PRODUCT_LIMIT` constant defined but not used where it matters**
File: `src/modules/store/templates/paginated-products.tsx`, lines 7 and 33

```ts
const PRODUCT_LIMIT = 12   // defined here
// ...
const queryParams: PaginatedProductsParams = {
  limit: 12,               // hardcoded again -- PRODUCT_LIMIT not used here
}
```

`PRODUCT_LIMIT` is used for `totalPages` calculation (line 67) but the `limit` sent in the query is
a separate hardcoded `12` on line 33. If the constant changes, pagination math and query limit diverge.

**M5 -- Two separate `import ... from "next/navigation"` lines in main-bar.tsx**
File: `src/modules/layout/components/site-header/main-bar.tsx`, lines 4-5

```ts
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
```

These should be a single combined import. Not a runtime bug, but violates standard module hygiene
and is flagged by most linters as a duplicate-import error.

---

### Minor

**m1 -- Typo in hero: "Vede produsele" should be "Vezi produsele"**
File: `src/modules/home/components/hero/index.tsx`, line 158

Romanian verb is "a vedea" -> imperative "Vezi", not "Vede" (indicative third person).

**m2 -- Tagline "PRECIZIE SOLIDA" is missing the diacritic -- should be "PRECIZIE SOLIDA" or the correct "PRECIZIE SOLIDĂ"**
Files: `src/modules/layout/components/site-header/main-bar.tsx:157`,
`src/modules/layout/templates/footer/index.tsx:103`

The project tagline per CLAUDE.md is "PRECIZIE SOLIDĂ". Both instances render "PRECIZIE SOLIDA"
(no diacritic on A). This is a content error visible to end users.

**m3 -- Hardcoded `#ffffff` and `"white"` keyword instead of `var(--surface)` or `var(--stone-50)`**
Locations:
- `src/modules/layout/components/site-header/util-bar.tsx:35` -- `color: "#ffffff"` inline style
- `src/modules/layout/components/site-header/main-bar.tsx:52` -- `color: #ffffff` in `<style>`
- `src/modules/layout/components/site-header/cat-nav.tsx:34,47` -- `color: #ffffff` in `<style>`
- `src/modules/layout/components/mobile-drawer/index.tsx:69` -- `color: #ffffff` in `<style>`
- `src/modules/layout/templates/footer/index.tsx:23,86,221` -- mix of `#ffffff` and `color: "#ffffff"`
- `src/modules/home/components/hero/index.tsx:5,72,90,107,151` -- `color: "white"` and `background: "white"`
- `src/modules/home/components/promo-band/index.tsx:11,30` -- `color: "white"`

`tokens.css` defines `--surface: #ffffff`. White text on dark backgrounds should use a literal
`white` or token -- but consistency matters. The `<style>` blocks use raw `#ffffff`, the inline
styles mix `"#ffffff"` and `"white"`. Standardize to `var(--surface)` or the appropriate token.

**m4 -- Hardcoded `oklch(...)` values outside token system**
Locations:
- `src/components/ui/button.tsx:54` -- `border-[oklch(44%_0.18_25)]` and `hover:bg-[oklch(46%_0.20_25)]` for destructive variant
- `src/components/ui/input.tsx:85` -- `focus-within:shadow-[0_0_0_3px_oklch(52%_0.20_25_/_0.25)]` for error focus ring
- `src/modules/home/components/promo-band/index.tsx:8,14` -- `color: "oklch(90% 0.06 42)"`

The `destructive` variant hover/border colors and the error focus shadow should reference tokens
(`--error`, `--error-bg`, or new `--error-hover`/`--error-muted` tokens). The promo-band color
`oklch(90% 0.06 42)` is close to `--brand-100` or `--brand-200` and should use the token.

**m5 -- `"use client"` on `input.tsx` marks the entire module as client-side**
File: `src/components/ui/input.tsx:1`

`Field` and `InputShell` are pure layout components with no hooks. Only `Stepper` requires
`"use client"` (it has `onClick`/`onChange` handlers). Marking the whole file client-side prevents
`Field` and `InputShell` from being used in server components without a boundary. Split `Stepper`
into its own file or add `"use client"` only there.

**m6 -- Decorative "what" comments at top of server components**
Files: `src/modules/layout/components/site-header/util-bar.tsx:1`,
`src/modules/layout/components/site-header/cat-nav.tsx:1`

```
// Server component — no "use client"
// Server component — async, fetches categories
```

Per CLAUDE.md: "comments only for non-obvious WHY or DESIGN PENDING". The absence of `"use client"`
is self-evident. Remove these.

**m7 -- JSX comments using em dash (`—`) in violation of project rules**
File: `src/modules/layout/components/site-header/cat-nav.tsx:69,98`
File: `src/modules/layout/components/site-header/main-bar.tsx:191,192,228`
File: `src/modules/layout/templates/footer/index.tsx:56,137,154,166,193`

```tsx
{/* "Toate" — all products link */}
{/* External Tenax link — ml-auto pushes it right */}
{/* Col 1 — Brand */}
```

CLAUDE.md explicitly bans em dash. Use `--` or `-` as separator.

**m8 -- Copyright year in footer is stale**
File: `src/modules/layout/templates/footer/index.tsx:255`

`&copy; 2025 Arcrom Diamonds SRL` -- current date is 2026-04-19. Should be 2026.

**m9 -- `<style>` blocks instead of Tailwind/token classes in layout components**
Files: `util-bar.tsx`, `main-bar.tsx`, `cat-nav.tsx`, `mobile-drawer/index.tsx`, `footer/index.tsx`

Multiple components inject raw `<style>` tags with class definitions (`.cat-nav-link`, `.search-btn`,
`.drawer-panel`, etc.). This is a scoping and performance regression compared to using Tailwind utility
classes. The styles are not co-located with the elements they target, making maintenance harder.
Not a bug, but a pattern divergence from how the rest of the codebase uses Tailwind.

---

## Summary

Total issues: 14 (0 critical, 5 major, 9 minor)

| # | Severity | File | Issue |
|---|----------|------|-------|
| M1 | Major | `components/ui/input.tsx` | Stepper decrement guard logically wrong |
| M2 | Major | `product-card`, `product-row` | `isOutOfStock`, `isSale`, `specsPreview` duplicated verbatim |
| M3 | Major | `product-card`, `product-row` | `(v: any)` in `isOutOfStock` -- unnecessary |
| M4 | Major | `store/templates/paginated-products.tsx` | `PRODUCT_LIMIT` not used for actual query limit |
| M5 | Major | `site-header/main-bar.tsx` | Duplicate `import ... from "next/navigation"` lines |
| m1 | Minor | `home/components/hero` | Typo "Vede produsele" |
| m2 | Minor | `main-bar`, `footer` | Tagline missing diacritic "SOLIDĂ" -> "SOLIDA" |
| m3 | Minor | Multiple layout/home files | `#ffffff` and `"white"` instead of design tokens |
| m4 | Minor | `button.tsx`, `input.tsx`, `promo-band` | Raw `oklch()` values outside token system |
| m5 | Minor | `components/ui/input.tsx` | `"use client"` on whole file when only Stepper needs it |
| m6 | Minor | `util-bar.tsx`, `cat-nav.tsx` | Decorative "what" comments at file top |
| m7 | Minor | `cat-nav`, `main-bar`, `footer` | Em dash in JSX comments (banned by CLAUDE.md) |
| m8 | Minor | `footer/index.tsx` | Copyright year 2025, should be 2026 |
| m9 | Minor | Layout components | `<style>` injection blocks instead of Tailwind classes |

## Verdict: NEEDS_WORK

5 major issues prevent a clean pass. M1 (Stepper bug) and M4 (PRODUCT_LIMIT divergence) are
functional correctness issues. M2+M3 (duplication + `any` type) are code quality blockers. M5
is a lint/style violation that most CI configs will catch.
