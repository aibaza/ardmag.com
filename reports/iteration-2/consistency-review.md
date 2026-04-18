# Consistency Review -- Iteration 2

Generated: 2026-04-19

---

## Color tokens

### Violations -- hardcoded `"white"` or hex colors

| File | Line | Value | Context |
|---|---|---|---|
| `product-card/index.tsx` | 28 | `bg-white` | Article wrapper background |
| `product-card/index.tsx` | 98 | `bg-stone-50` | Foot area background |
| `product-card/index.tsx` | 120 | `text-white` | CTA button text |
| `product-row/index.tsx` | 27 | `bg-white` | Row wrapper background |
| `input.tsx` | 78 | `bg-white` | InputShell background |
| `stepper.tsx` | 55 | `bg-white` | Stepper wrapper background |
| `hero/index.tsx` | 5 | `color: "white"` | Section text color (inline style) |
| `hero/index.tsx` | 75 | `color: "white"` | CTA button text (inline style) |
| `hero/index.tsx` | 94 | `background: "white"` | Secondary CTA background (inline style) |
| `hero/index.tsx` | 95 | `border: "1px solid white"` | Secondary CTA border (inline style) |
| `hero/index.tsx` | 110 | `color: "white"` | Stats value color (inline style) |
| `hero/index.tsx` | 154 | `color: "white"` | Category card heading (inline style) |
| `footer/index.tsx` | 23 | `.footer-contact-link:hover { color: #ffffff; }` | CSS-in-JS hover rule |
| `footer/index.tsx` | 89 | `color: "#ffffff"` | Brand name "ardmag" color |
| `footer/index.tsx` | 224 | `color: "#ffffff"` | "TENAX" label color |
| `main-bar.tsx` | 51 | `color: #ffffff` | Search button text (CSS-in-JS block) |

**Assessment:** Hardcoded `"white"` and `#ffffff` appear across 5 files. The design system requires `var(--stone-0)` or whatever the designated white CSS var is. If no white token exists yet, these should be flagged with `/* DESIGN PENDING: --white token */` until one is defined. `bg-white` in Tailwind classes is also a violation -- it should be `bg-[var(--surface)]` or equivalent.

**Note on `bg-stone-50`:** Used for footer foot area background and input adornments -- this is a Tailwind utility that bypasses the token system. Should be `bg-[var(--stone-50)]` if the token exists, or a named surface token.

---

## Radii

### Tailwind utility radii

No bare `rounded-md` (6px), `rounded-lg` (8px), or `rounded-xl` found in any changed file. All explicit rounding uses `rounded-[var(--r-sm)]` -- correct.

### Bare pixel radii

No inline `borderRadius: "4px"`, `borderRadius: "6px"`, or `borderRadius: "8px"` found. All inline border-radius values use `var(--r-sm)` -- correct.

**Radii: PASS**

---

## Typography

### `--f-mono` usage (price, SKU, spec labels)

All price spans, SKU spans, spec labels, and stat values consistently use `font-mono` (Tailwind) or `fontFamily: "var(--f-mono)"` -- correct pattern.

### `--f-sans` usage (body text)

Body text and button labels correctly use `font-[family-name:var(--f-sans)]` or `fontFamily: var(--f-sans)` where needed. `TextInput` and `SelectInput` in `input.tsx` correctly gate between `--f-mono` and `--f-sans` via the `mono` prop.

**Typography: PASS**

---

## Client boundaries

| File | `"use client"` present | Hooks / event handlers used | Verdict |
|---|---|---|---|
| `lib/util/product.ts` | No | No (pure utility) | PASS |
| `product-card/index.tsx` | No | No -- pure render | PASS |
| `product-row/index.tsx` | No | No -- pure render | PASS |
| `input.tsx` | **Removed** | No state or event handlers (uses `React.forwardRef` which is compatible with server components in Next.js 14+) | PASS |
| `stepper.tsx` | Yes | Yes -- `useState` for decrement/increment, `onChange` event handler, `React.ChangeEvent` | PASS |
| `hero/index.tsx` | No | No -- pure render, `LocalizedClientLink` handles its own client boundary | PASS |
| `category-grid/index.tsx` | No | No -- pure render | PASS |
| `page.tsx` | No | No -- async server component | PASS |
| `footer/index.tsx` | No | No -- async server component | PASS |
| `main-bar.tsx` | Yes | Yes -- `useState`, `useRouter`, `useParams`, `onSubmit` | PASS |

**Client boundaries: PASS** -- `"use client"` propagation is appropriately contained. Removal from `input.tsx` is correct.

---

## Import paths

| File | Import | Path used | Correct alias? |
|---|---|---|---|
| `product-card/index.tsx` | `getProductSpecsPreview`, `isProductOutOfStock` | `@lib/util/product` | PASS |
| `product-row/index.tsx` | `getProductSpecsPreview`, `isProductOutOfStock` | `@lib/util/product` | PASS |

No relative `../../lib/util/product` imports found. All imports from the new util use the `@lib/util/product` tsconfig alias -- correct.

**Import paths: PASS**

---

## Summary of all findings

| Category | Status | Issues |
|---|---|---|
| Color tokens | **FAIL** | 16 instances of `"white"`, `"#ffffff"`, `bg-white`, `bg-stone-50` across 5 files |
| Radii | PASS | None |
| Typography | PASS | None |
| Client boundaries | PASS | None |
| Import paths | PASS | None |

---

## Required fixes before merge

1. **`hero/index.tsx`** -- Replace all 4 occurrences of `color: "white"` and `background: "white"` / `border: "1px solid white"` with CSS var equivalents (e.g. `var(--stone-0)`, or define `--white` token).

2. **`footer/index.tsx`** -- Replace `color: #ffffff` (lines 89, 224) and `.footer-contact-link:hover { color: #ffffff; }` (line 23) with CSS var.

3. **`main-bar.tsx`** -- Replace `color: #ffffff` in `.search-btn` CSS block (line 51) with CSS var.

4. **`product-card/index.tsx`** -- `bg-white` (line 28) and `text-white` (line 120): replace with CSS var equivalents. `bg-stone-50` (line 98) should be `bg-[var(--stone-50)]` or a named surface token.

5. **`product-row/index.tsx`** -- `bg-white` (line 27): replace with CSS var.

6. **`input.tsx`** -- `bg-white` (line 78): replace with CSS var. `bg-stone-50` (lines 96, 102) in adornment divs: replace with CSS var.

7. **`stepper.tsx`** -- `bg-white` (line 55) and `bg-stone-50` (lines 70, 103) in button backgrounds: replace with CSS var.

If a white/surface token (`--white`, `--surface-0`, etc.) does not yet exist in the design tokens, add it first and mark all touch points with `/* DESIGN PENDING: --white token -- using var(--stone-0) as placeholder */`.

---

## Verdict

**NEEDS_WORK**

One category fails: color tokens. No hardcoded hex or literal `"white"` should appear in new or changed code. All 16 violations are mechanical to fix once the white CSS var is defined (or confirmed as `var(--stone-0)` / `var(--surface)`). Radii, typography, client boundaries, and import paths are all clean.
