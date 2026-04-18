# UI/UX Review -- Iteration 1

Date: 2026-04-19

## Screenshots taken

All screenshots were captured via Playwright (chromium, system install at /usr/bin/playwright).

- `homepage-desktop.png` -- 1440x900, full page
- `homepage-mobile.png` -- 375x667, full page
- `cat-discuri-desktop.png` -- 1440x900
- `cat-discuri-mobile.png` -- 375x667
- `cat-solutii-desktop.png` -- 1440x900
- `cat-solutii-mobile.png` -- 375x667
- `product-glaxs-easy-desktop.png` -- 1440x900
- `product-glaxs-easy-mobile.png` -- 375x667
- `store-desktop.png` -- 1440x900
- `store-mobile.png` -- 375x667

**All screenshots show the Next.js error overlay, not the actual page.** The server returns HTTP 500 on every route. Screenshots are not useful for visual evaluation beyond confirming the site is fully broken.

---

## Root Cause: BLOCKER

**File:** `backend-storefront/src/styles/globals.css` + `backend-storefront/src/styles/tokens.css`

**Error:**
```
CssSyntaxError: @layer base is used but no matching @tailwind base directive is present.
```

**Why it breaks:** `globals.css` imports `tokens.css` first (line 1), then uses the legacy `@import "tailwindcss/base"` syntax (line 2). Turbopack processes these in order: when PostCSS encounters `@layer base` in `tokens.css`, the `@tailwind base` layer has not yet been declared, so the directive is invalid.

**Fix required in `globals.css`:** Replace the three legacy `@import "tailwindcss/..."` lines with a single `@tailwind` directive block, ordered BEFORE the `@import "./tokens.css"` line -- or switch `tokens.css` to use plain `:root {}` without `@layer base`.

Current `globals.css` lines 1-4:
```css
@import "./tokens.css";
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

Required fix (option A -- reorder + use directives):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "./tokens.css";
```

Required fix (option B -- remove @layer wrapper from tokens.css):
Strip `@layer base { ... }` from `tokens.css`, leaving only the bare `:root { ... }` block. The CSS custom properties in `:root` do not require a Tailwind layer.

Option B is simpler and avoids ordering sensitivity entirely. Recommended.

---

## Homepage

**Status: NOT EVALUABLE (HTTP 500 on all routes)**

Visual evaluation is impossible. The following is a code-level review against design targets.

| Criterion | Expected | Finding | Rating |
|-----------|----------|---------|--------|
| Font loaded | IBM Plex Sans/Mono | `layout.tsx` loads both via `next/font/google` with `--font-ibm-plex-sans` and `--font-ibm-plex-mono` CSS variables. `tailwind.config.js` sets `fontFamily.sans` and `fontFamily.mono` correctly. Code is correct. | CODE OK |
| Brand color on CTAs | Orange brand-500 | `product-card` CTA uses `bg-brand-500 border-brand-600`. Hero primary CTA uses `background: var(--brand-500)`. Promo band CTA uses `background: var(--stone-900)` (dark on orange -- correct contrast). All brand-500 references correctly wired. | CODE OK |
| Radii | 2px default (--r-sm) | All cards, buttons, and interactive elements use `rounded-[var(--r-sm)]` or inline `borderRadius: "var(--r-sm)"`. `--r-sm: 2px` defined in tokens. `tailwind.config.js` borderRadius.soft=2px. Consistent throughout. | CODE OK |
| Header layers | 3 distinct layers | `Nav` template: `<UtilBar>` (stone-900 dark bar) + `<MainBar>` (white, search + logo + cart) + `<CatNav>` (white, category links, borderTop). Correct 3-layer structure assembled in sticky `<header>`. | CODE OK |
| Hero dark | Stone-900 background | `Hero` uses `style={{ background: "var(--stone-900)", color: "white" }}`. Two-column grid with 1fr/1fr, minHeight 520px. Side column has two category highlight cards on stone-800. | CODE OK |
| Category grid | 4 columns with cards | `CategoryGrid` uses `gridTemplateColumns: "repeat(4, minmax(0, 1fr))"` with gap 16px. Renders only topLevel categories (max 8). No mobile breakpoint defined -- will stack poorly on narrow viewports without responsive grid. | MINOR |
| Promo band | Orange (brand-500) background | `PromoBand` uses `background: "var(--brand-500)"`. Contains tagline "25 de ani. La milimetru." and "Catalog produse" CTA. | CODE OK |
| Footer dark | Dark multi-column | `Footer` uses `background: "var(--stone-900)"`. 5-column grid (1.5fr 1fr 1fr 1fr 1.3fr). Logo, navigation, contact, legal strip at bottom. Multi-column confirmed. | CODE OK |
| Product cards | Image + price + CTA | `ProductCard` has: image (aspect-square) -> type badge -> title -> SKU (mono) -> specs preview -> price (mono, font-medium) -> "Adauga/Detalii" CTA (brand-500). Structure complete. | CODE OK |
| IBM Plex Mono on price | Mono font on prices | Price block: `className="font-mono text-[15px] font-medium text-stone-900"`. SKU: `className="font-mono text-[11px] text-stone-500"`. Specs: `className="font-mono text-[11px] text-stone-600"`. All correctly mono. | CODE OK |
| Tagline in hero | "25 de ani" or similar | Tagline "25 de ani. La milimetru." is in `PromoBand`, NOT in the Hero section. The Hero uses "Scule profesionale pentru piatra naturala" as h1 and stats (25+ ani, 500+ produse, 90 produse unice). Per design spec the tagline should appear in the hero section -- it is in the promo band instead. | MINOR |
| Mobile layout | Not broken on 375px | Category grid has no mobile breakpoint (fixed 4-column). Hero has fixed 2-column grid with no responsive collapse. Main bar layout untested. Mobile will overflow/break horizontally on 375px. | MAJOR |

---

## Category pages

**Status: NOT EVALUABLE (HTTP 500 on all routes)**

No category-specific components could be evaluated visually. The routes `/ro/categories/discuri-de-taiere` and `/ro/categories/solutii-pentru-piatra` both return 500 for the same root cause.

---

## Product page

**Status: NOT EVALUABLE (HTTP 500 on all routes)**

Route `/ro/products/glaxs-easy` returns 500. No product page UI available. `ProductCard` code was reviewed but the full product detail page template was not specifically reviewed.

---

## Store page

**Status: NOT EVALUABLE (HTTP 500 on all routes)**

Route `/ro/store` returns 500.

---

## Summary of issues

### BLOCKER

1. **CSS build error prevents all page rendering** -- `tokens.css` uses `@layer base` but `globals.css` declares `@tailwind base` (via legacy `@import "tailwindcss/base"`) after the token import. Turbopack rejects the CSS at compile time. Fix: either move `@import "./tokens.css"` after the tailwind directives, or strip `@layer base { }` wrapper from `tokens.css` and keep only the bare `:root { }` block. Every page returns HTTP 500 until this is resolved.

### MAJOR

2. **Mobile layout will break on 375px** -- `Hero` uses a hard 2-column grid (`gridTemplateColumns: "1fr 1fr"`) with no responsive fallback. `CategoryGrid` uses `gridTemplateColumns: "repeat(4, minmax(0, 1fr))"` with no mobile breakpoint. Both will produce horizontal overflow and unreadable content at 375px. Requires either Tailwind responsive grid classes or media query fallbacks.

### MINOR

3. **Tagline placement mismatch** -- Design spec places "25 de ani. La milimetru." in the hero section. Implementation has it in the `PromoBand` (the orange section below the category grid). The hero contains stat counters (25+ ani, 500+ produse) instead. If the tagline is required in the hero per spec, add it as a superscript or kicker line above the h1.

4. **Category grid shows max 8 items** -- `CategoryGrid` slices to `.slice(0, 8)` but the grid is fixed at 4 columns, so rows 1 and 2 fill. If fewer than 8 categories exist, the grid will have orphan cells. Not a design deviation, but worth noting for catalog completeness.

5. **No `<html lang>` country-code awareness** -- `layout.tsx` hardcodes `lang="ro"` regardless of `countryCode`. Minor SEO issue, not a visual concern.

---

## Verdict: NEEDS_WORK

**Cannot be evaluated visually until the BLOCKER CSS error is fixed.** Code-level review shows the design system implementation is largely correct: fonts, colors, radii, section backgrounds, 3-layer header, hero structure, promo band, footer, and product card anatomy all match the design targets. The two structural problems are the BLOCKER CSS syntax error (must fix before any visual review is possible) and missing mobile responsive breakpoints on the hero and category grid.

Priority order for the developer:
1. Fix `globals.css` / `tokens.css` CSS layer ordering (BLOCKER -- 5 min fix).
2. Add responsive grid breakpoints to `Hero` and `CategoryGrid` (MAJOR -- affects mobile usability).
3. Decide tagline placement: move "25 de ani. La milimetru." into the hero or accept current promo-band placement (MINOR -- product/design decision).
