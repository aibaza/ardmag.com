---
phase: 260419-pma
plan: 01
subsystem: storefront-filters
tags: [filter-sidebar, url-routing, checkboxes, client-component]
tech-stack:
  added: [useRouter, useSearchParams (next/navigation)]
  patterns: [URL-driven filtering, controlled checkboxes, server-side re-render via navigation]
key-files:
  created: []
  modified:
    - backend-storefront/src/lib/util/adapters/products-to-filter-groups.ts
    - backend-storefront/src/modules/category/filter-sidebar/FilterSidebar.tsx
    - backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
    - backend-storefront/src/app/[countryCode]/design-preview/category/page.tsx
    - backend-storefront/src/lib/util/adapters/__tests__/products-to-filter-groups.test.ts
decisions:
  - "Buton Aplica ramane indicator-only (fara onClick) -- filtrele se aplica imediat la check"
  - "Checkbox-uri controlled (checked={!!option.checked}) -- starea vine din URL via server, fara useState local"
  - "FilterSidebar paramKey tip string (nu brand|material) -- permite design-preview fixtures cu alte grupuri"
  - "CheckboxOption.value este required -- forteaza fixtures sa fie corecte, nu optional cu fallback"
metrics:
  duration: "~15 min"
  completed: "2026-04-19"
  tasks_completed: 2
  tasks_total: 3
  files_changed: 5
---

# Phase 260419-pma Plan 01: B3 FilterSidebar Interactiv - Summary

**One-liner:** Checkbox brand/material wired to URL via useRouter -- click updates ?brand=slug1,slug2, server re-renders with filtered products, reset clears filters preserving sortBy.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extinde adapter cu value + paramKey | 33da632 | products-to-filter-groups.ts, test |
| 2 | FilterSidebar interactiv + baseUrl din page | 666b608 | FilterSidebar.tsx, page.tsx, design-preview/category/page.tsx |

## Task 3 - Pending Human Verification

Task 3 is a `checkpoint:human-verify` gate. Browser verification required before marking complete.

## URL Behavior

- **Brand param:** `?brand=tenax,sait` (comma-separated raw slugs)
- **Material param:** `?material=granit`
- **Multi-param:** `?brand=tenax&material=granit`
- **Reset paginare:** `page` param sters la orice schimbare de filtru
- **Preserve sortBy:** parametru `sortBy` pastrat in URL la check/uncheck/reset
- **Reset button:** sterge `brand`, `material`, `page`; pastreaza orice alt param (ex sortBy)

## Decisions Made

1. **Aplica ramane indicator-only** -- buton fara onClick, afiseaza count de filtre active. Filtrele se aplica imediat la fiecare check (no pending state, no debounce).

2. **Controlled checkbox fara useState local** -- `checked={!!option.checked}` unde `checked` e derivat server-side din URL params in adapter. Nicio stare locala in componenta.

3. **paramKey: string in FilterSidebar, 'brand'|'material' in adapter** -- componenta accepta orice string (design-preview are grupuri custom: band, filet, stock). Adapter-ul exporta constrangerea stricta pentru use productie.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] design-preview/category/page.tsx: CheckboxOption fixtures fara value si paramKey**
- **Found during:** Task 2 TypeScript verification
- **Issue:** Introducerea `value: string` required si `paramKey: string` required in tipul FilterGroup/CheckboxOption a spart fixture-urile hardcodate din pagina de design preview.
- **Fix:** Adaugat `value` (slug raw) la toate optiunile de checkbox si `paramKey` la toate grupurile de tip checkboxes.
- **Files modified:** `backend-storefront/src/app/[countryCode]/design-preview/category/page.tsx`
- **Commit:** 666b608

### Pre-existing Issues (Not Fixed)

- `npm run build` esueaza cu erori de module-not-found in checkout (`@modules/checkout/...`, `@modules/common/...`). Erori preexistente confirmate -- build esua identic inainte de modificarile acestui plan.
- Test fixtures in `products-to-filter-groups.test.ts` au erori TS preexistente (StoreProductTag shape mismatch, BaseCalculatedPriceSet). Testele trec la runtime (vitest); erori doar la `tsc --noEmit`.

## Verification Status

| Check | Status | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` pe fisierele modificate | PASS | Zero erori in FilterSidebar.tsx, page.tsx, adapter, design-preview |
| `npx vitest run` | PASS | 95 teste trec, inclusiv noile assertions pentru value + paramKey |
| `npm run build` | PRE-EXISTING FAIL | Erori checkout unrelated la acest plan |
| Browser verification (11 scenarii) | PENDING | Task 3 - human checkpoint |

## Self-Check: PASSED

- [x] `backend-storefront/src/lib/util/adapters/products-to-filter-groups.ts` -- EXISTS, exports CheckboxOption + FilterGroup
- [x] `backend-storefront/src/modules/category/filter-sidebar/FilterSidebar.tsx` -- EXISTS, contains useRouter
- [x] `backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx` -- EXISTS, contains baseUrl={baseUrl}
- [x] Commit 33da632 -- EXISTS (feat adapter)
- [x] Commit 666b608 -- EXISTS (feat FilterSidebar)
