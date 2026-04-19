---
phase: 260419-skt-c2-variant-selector-live-url-v-id-sync-p
plan: "01"
subsystem: storefront/pdp
tags: [variant-selector, client-component, url-sync, adapter, tdd]
dependency_graph:
  requires: [C1-PDP-page-server-side-wiring]
  provides: [C2-01-variant-click-syncs-url, C2-02-server-re-renders-price-on-variant-change, C2-03-active-state-reflects-url]
  affects: [PDPVariantSelector, productToPdpVariantSelector, PDPSummary]
tech_stack:
  added: [useRouter, useSearchParams, usePathname from next/navigation]
  patterns: [client-component-url-sync, first-matching-variant-id]
key_files:
  modified:
    - backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts
    - backend-storefront/src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts
    - backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx
    - backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx
    - backend-storefront/src/app/[countryCode]/design-preview/product/page.tsx
decisions:
  - "variantId = first variant in array order containing that value (deterministic, simple; cross-dimension constraint solving deferred)"
  - "usePathname preferred over prop for base URL (component has no baseUrl prop and pathname is always correct)"
  - "No local useState for selected variant -- URL is the source of truth, server re-render drives active flag"
metrics:
  duration: "~15 min"
  completed: "2026-04-19"
  tasks_completed: 2
  files_modified: 5
---

# Quick Task 260419-skt: Variant Selector Live URL + v_id Sync

**One-liner:** PDP variant selector wired as client component -- clicking any option pushes `?v_id={variantId}` to URL, triggering server re-render that updates price card and active state.

## What Changed

### 1. Adapter: `product-to-pdp-variant-selector.ts`

`VariantOption` interface gains a required `variantId: string` field. In the dimension loop, after `variantsWithValue` is computed, `variantId` is set to `variantsWithValue[0]?.id` (first matching variant, deterministic by array order). Fallback to `variants[0]?.id ?? ""` is defensive only -- in practice, `variantsWithValue` is never empty because the value came from those variants.

### 2. Test coverage: `__tests__/product-to-pdp-variant-selector.test.ts`

Two new tests added:
- "each option carries variantId of the first matching variant" -- 3-variant fixture, asserts specific variantId values for all 4 options across 2 dimensions.
- "variantId is present on all options when single visible variant" -- single-option product, asserts `groups[0].options[0].variantId === "v1"`.

All 12 tests pass (10 existing + 2 new). TDD cycle: RED confirmed before GREEN.

### 3. Client component: `PDPVariantSelector.tsx`

Added `"use client"` directive on line 1. Hooks: `useRouter`, `useSearchParams`, `usePathname` from `next/navigation`. `handleSelect(variantId)` builds `URLSearchParams` from current params, sets `v_id`, and calls `router.push(pathname + "?" + params)` -- preserving all other URL params. Unavailable options get `disabled={true}` and `onClick={undefined}`. No visual/class changes.

### 4. Type sync: `PDPSummary.tsx`

Local `VariantOption` interface updated to include `variantId: string` (required). PDPSummary remains a server component -- it just passes `variantGroups` through to PDPVariantSelector.

### 5. Auto-fix (Rule 2): `design-preview/product/page.tsx`

Static preview fixture data lacked `variantId` on all option objects, causing TypeScript errors after `variantId` became required. Added placeholder `variantId` values (`"preview-v1"` through `"preview-v9"`) to satisfy the type constraint. Preview page behavior is unchanged.

## Variant ID Mapping Rule

**Rule:** `variantId` of a given option value in dimension D = `id` of the FIRST variant (in array order) whose options include `{dimensionTitle: D, value: V}`.

**Limitation:** Cross-dimension consistency is not solved. If a user selects "MARMURA" in dimension 1, the `variantId` on the "1200mm" option in dimension 2 might point to a variant with color "ANDEZIT" + size "1200" rather than "MARMURA" + "1200". After `router.push`, the server picks the variant by `v_id` directly, so the user gets the exact variant they clicked, not a cross-dimension-filtered one. This is acceptable for the current catalog structure.

## Server-Side page.tsx

No changes. The page was already wired:
- Reads `searchParams.v_id` as `selectedVariantId`
- Finds `selectedVariant = variants.find(v => v.id === selectedVariantId)`
- Passes `selectedVariant` to `productToPdpPriceCard` and `productToPdpVariantSelector`

## Out-of-Scope Future Work

1. **Shared VariantOption types file** -- `VariantOption` and `VariantGroup` are duplicated in adapter, `PDPVariantSelector`, and `PDPSummary`. Consolidate into `lib/util/types/variant-selector.ts` in a cleanup task.

2. **Smart cross-dimension variant resolution** -- When clicking "1200mm" after already selecting "MARMURA", ideally resolve to the variant that matches both "MARMURA" AND "1200mm" (if it exists). Current implementation picks the first variant containing "1200mm" regardless of other dimensions.

3. **SKU/EAN per selected variant** -- `PDPSummary` currently uses `firstVariant` for SKU/EAN display (from `page.tsx`), not `selectedVariant`. Out of scope per plan spec.

4. **Loading state on click** -- No spinner added. Next.js handles the server transition feedback.

## Visual Verification

Screenshot of PDP at `http://localhost:8000/ro/products/discuri-marmura-si-andezit-tola-second`:

**Path:** `/tmp/pdp-variant-selector-260419.png`

Observed: TIP PIATRA group (ANDEZIT active, MARMURA available) and DIAMETRU group (1200 active, 1000, 1100) render correctly. Price card shows 4.076,00 RON. Interactive click behavior requires manual browser test (see plan checkpoint).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing field] design-preview fixture data missing required variantId**
- **Found during:** Task 2 TypeScript check
- **Issue:** `design-preview/product/page.tsx` had static `VariantOption` objects without `variantId`, breaking after the field became required.
- **Fix:** Added placeholder `variantId` strings (`"preview-v1"` etc.) to all 11 option objects in the fixture.
- **Files modified:** `backend-storefront/src/app/[countryCode]/design-preview/product/page.tsx`
- **Commit:** included in 649d8c4

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 (TDD) | de8fe77 | feat(260419-skt-01): add variantId to adapter VariantOption and test coverage |
| 2 | 649d8c4 | feat(260419-skt-01): convert PDPVariantSelector to client component with router.push on click |

## Self-Check: PASSED

- adapter: FOUND
- PDPVariantSelector: FOUND
- PDPSummary: FOUND
- commit de8fe77: FOUND
- commit 649d8c4: FOUND
