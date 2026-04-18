# Consistency Review -- Iteration 1

## Token usage

### Hardcoded colors found

| File | Line | Value | Context |
|------|------|-------|---------|
| `src/modules/layout/components/site-header/util-bar.tsx` | 35 | `#ffffff` | `color: "#ffffff"` inline style on "Transport gratuit" text |
| `src/modules/layout/components/site-header/cat-nav.tsx` | 34 | `#ffffff` | `.cat-nav-link--all { color: #ffffff; }` in `<style>` tag |
| `src/modules/layout/components/site-header/cat-nav.tsx` | 47 | `#ffffff` | `.cat-nav-link--all:hover { color: #ffffff; }` in `<style>` tag |
| `src/modules/layout/components/site-header/main-bar.tsx` | 52 | `#ffffff` | `.search-btn { color: #ffffff; }` in `<style>` tag |
| `src/modules/layout/components/mobile-drawer/index.tsx` | 69 | `#ffffff` | `.drawer-all-link { color: #ffffff; }` in `<style>` tag |
| `src/modules/layout/templates/footer/index.tsx` | 23 | `#ffffff` | `.footer-contact-link:hover { color: #ffffff; }` in `<style>` tag |
| `src/modules/layout/templates/footer/index.tsx` | 86 | `#ffffff` | `color: "#ffffff"` inline style on "ardmag" wordmark in footer brand col |
| `src/modules/layout/templates/footer/index.tsx` | 221 | `#ffffff` | `color: "#ffffff"` inline style on "TENAX" distributor label |

All 8 instances are `#ffffff` used as white text on dark backgrounds. The token `var(--surface)` is not the right semantic (it maps to the light surface color), but the correct approach would be to use `var(--stone-50)` or introduce a `--fg-on-dark` alias. All are classified **minor** -- the visual result is correct, but the values bypass the token system and will not adapt if the palette changes.

Note: `src/components/ui/input.tsx:257` contains `&#8722;` which is the HTML entity for a minus sign (U+2212), not a hex color -- false positive from the regex.

### Hardcoded fonts found

| File | Line | Value | Severity |
|------|------|-------|----------|
| `src/modules/checkout/components/payment-container/index.tsx` | 87 | `fontFamily: "Inter, sans-serif"` | **Major** -- hardcoded font stack bypasses `var(--f-sans)` entirely |

Note: `tailwind.config.js` defines `fontFamily.sans` and `fontFamily.mono` arrays with literal font names, but this is the Tailwind config layer (correct place), not component code.

### Hardcoded radii found

No hardcoded radius violations in the scoped review paths (product-card, product-row, category-card, spec-table, site-header, mobile-drawer, home components, ui components).

Two Tailwind radius classes found in UI components:

| File | Line | Class | Assessment |
|------|------|-------|------------|
| `src/components/ui/button.tsx` | 99 | `rounded-full` | Spinner indicator -- `rounded-full` is equivalent to `var(--r-full)` which is `9999px`. Functionally correct, **minor** inconsistency in class vs var usage |
| `src/components/ui/badge.tsx` | 49 | `rounded-full` | Dot indicator -- same as above, **minor** |

The `rounded-rounded` (8px), `rounded-large` (16px), `rounded-circle` (9999px), `rounded-rounded` usages visible in the broader grep output are all in old Medusa v2 starter files (`product-tabs/accordion.tsx`, `products/thumbnail/index.tsx`, `checkout/`, `account/`) that are outside the iteration-1 review scope and predate the design system.

---

## Component reuse

### Native `<button>` outside acceptable contexts

| File | Line | Context | Acceptable? |
|------|------|---------|-------------|
| `src/modules/layout/components/site-header/main-bar.tsx` | 172 | Search submit button inside `<form>` | YES -- documented acceptable exception |
| `src/modules/layout/components/mobile-drawer/index.tsx` | 77 | Hamburger open trigger | YES -- documented acceptable exception (mobile drawer trigger) |
| `src/modules/layout/components/mobile-drawer/index.tsx` | 153 | Close (`&times;`) button inside drawer | YES -- documented acceptable exception (mobile drawer) |

No violations. All three native `<button>` usages fall within the explicitly acceptable contexts defined in the rules.

### Native `<img>` for product images

No violations found. The grep returned no results outside of `product-image/index.tsx`.

### Badge reimplemented instead of reused

No violations. Both `product-card/index.tsx` and `product-row/index.tsx` correctly import `Badge` from `@components/ui/badge` and use `<Badge variant="promo">`, `<Badge variant="stock-out">`, and `<Badge variant="stock-in" dot>`. Zero inline reimplementations.

---

## Utility reuse

### getStemFromThumbnail imported correctly

| File | Status |
|------|--------|
| `src/modules/products/components/product-card/index.tsx` | PASS -- `import { getStemFromThumbnail } from "@lib/images"` on line 2, called on line 20 |
| `src/modules/products/components/product-row/index.tsx` | PASS -- `import { getStemFromThumbnail } from "@lib/images"` on line 2, called on line 20 |

No inline regex reimplementation found in either file.

### ProductImage used for product images

| File | Status |
|------|--------|
| `src/modules/products/components/product-card/index.tsx` | PASS -- `import ProductImage from "@modules/products/components/product-image"` on line 4, used in JSX with `variant="card"` |
| `src/modules/products/components/product-row/index.tsx` | PASS -- `import ProductImage from "@modules/products/components/product-image"` on line 4, used in JSX with `variant="thumb"` |

### Em-dash in strings

| File | Line | Content | Severity |
|------|------|---------|----------|
| `src/modules/layout/components/site-header/cat-nav.tsx` | 69, 98 | `{/* "Toate" — ... */}` and `{/* External Tenax link — ... */}` | Comments only -- not user-visible copy. **Minor** (violates CLAUDE.md coding convention) |
| `src/modules/layout/components/site-header/main-bar.tsx` | 191, 192, 228 | Comments with `—` | Comments only -- not user-visible copy. **Minor** |
| `src/modules/layout/templates/footer/index.tsx` | 56, 137, 154, 166, 193 | Column header comments with `—` | Comments only -- not user-visible copy. **Minor** |
| `src/modules/products/components/product-actions/mobile-actions.tsx` | 78 | `<span>—</span>` | **Major** -- this is rendered text in the UI (price separator in mobile product actions), directly violating the no-em-dash copy rule |

Note: `util-bar.tsx:1` contains `// Server component — no "use client"` which is a comment -- minor.

---

## Summary

| Category | Violation | Severity |
|----------|-----------|----------|
| Hardcoded color `#ffffff` | 8 occurrences across util-bar, cat-nav, main-bar, mobile-drawer, footer | Minor |
| Hardcoded font family | `"Inter, sans-serif"` in `payment-container/index.tsx:87` | **Major** |
| Hardcoded radius | `rounded-full` in button.tsx spinner and badge.tsx dot | Minor |
| Native `<button>` | 3 usages -- all acceptable | -- |
| Native `<img>` | None | -- |
| Badge reimplemented | None | -- |
| `getStemFromThumbnail` reuse | Correct in all files | -- |
| `ProductImage` reuse | Correct in all files | -- |
| Em-dash in rendered UI | `<span>—</span>` in `mobile-actions.tsx:78` | **Major** |
| Em-dash in code comments | Multiple files | Minor |

**Violations: 12 total**
- Critical (requires redesign): 0
- Major (needs fix): 2
  1. `src/modules/checkout/components/payment-container/index.tsx:87` -- hardcoded `"Inter, sans-serif"` must use `var(--f-sans)`
  2. `src/modules/products/components/product-actions/mobile-actions.tsx:78` -- `<span>—</span>` rendered em-dash in product price area must be replaced (use `·` or `-`)
- Minor (can defer): 10
  - 8x `#ffffff` hardcoded (should use a token; visually correct as-is)
  - 2x `rounded-full` in UI primitives (functionally equivalent to `var(--r-full)`, but uses Tailwind class instead of CSS var)

## Verdict: NEEDS_WORK

Two major violations prevent PASS:
1. Hardcoded font in payment-container -- not in the core iteration-1 components but still part of the codebase.
2. Em-dash rendered character in mobile-actions -- violates the explicit no-em-dash copy rule in CLAUDE.md.

The iteration-1 custom components (product-card, product-row, site-header, mobile-drawer, footer, badge, button) are well-structured: correct token usage for colors via `var(--stone-*)` and `var(--brand-*)`, correct component reuse for Badge/ProductImage/getStemFromThumbnail, and no native `<img>` for product images. The violations are isolated and fixable without structural changes.
