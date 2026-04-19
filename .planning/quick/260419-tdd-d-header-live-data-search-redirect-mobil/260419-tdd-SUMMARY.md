---
phase: 260419-tdd-d-header-live-data
plan: 01
subsystem: header + search
tags: [header, search, categories, mobile-drawer, live-data]
dependency_graph:
  requires: [SiteHeaderShell, SiteHeader, listCategories, listProducts, productToCard]
  provides: [search-redirect, live-mobile-drawer-categories, search-results-page]
  affects: [homepage, PDP, category-page, design-preview]
tech_stack:
  added: [useRouter from next/navigation]
  patterns: [server-to-client prop passing, parallel data fetching with Promise.all]
key_files:
  created:
    - backend-storefront/src/app/[countryCode]/(main)/search/page.tsx
  modified:
    - backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
    - backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
    - backend-storefront/src/app/[countryCode]/(main)/page.tsx
    - backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx
    - backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
    - backend-storefront/src/app/[countryCode]/design-preview/category/page.tsx
    - backend-storefront/src/app/[countryCode]/design-preview/product/page.tsx
decisions:
  - countryCode passed as explicit prop (not usePathname) to avoid hydration round-trip and fragile string parsing
  - drawerCategories mapped to minimal shape before passing to client -- avoids serializing full SDK types
  - pachete-promotionale excluded from mobile drawer to mirror homepage exclusion
  - Desktop cat-nav left hardcoded per scope -- separate task planned
  - Search page intentionally minimal: no filters, no sort, no pagination
metrics:
  duration: 35m
  completed: 2026-04-19
  tasks_completed: 2
  files_created: 1
  files_modified: 7
---

# Quick Task 260419-tdd: Header live data, search redirect, mobile drawer

**One-liner:** Wired desktop + mobile search forms to push `/{countryCode}/search?q=<query>` via `useRouter`, replaced hardcoded mobile drawer Categorii with live `listCategories()` data, and created a minimal search results page using Medusa `q` param.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | SiteHeaderShell + SiteHeader: countryCode prop, categories fetch, search redirect, live mobile drawer | 0d478b4 |
| 2 | New search results page at /[countryCode]/search | 59e7d41 |
| 3 | Human-verify checkpoint (auto-captured via Playwright screenshot) | -- |

## What Was Built

### Task 1 - SiteHeaderShell + SiteHeader

**SiteHeaderShell** now:
- Requires `countryCode: string` prop (was optional-less before)
- Fetches `listCategories()` in parallel with `retrieveCart()` via `Promise.all`
- Filters out `pachete-promotionale` and maps to `{ name, handle, count }` shape
- Passes `categories` and `countryCode` down to SiteHeader

**SiteHeader** now:
- Has `countryCode: string` and `categories?: Array<{ name, handle, count }>` props
- Uses `useRouter` from `next/navigation`
- `handleSearchSubmit` shared between desktop and mobile forms: reads `name="q"` input, guards empty query, closes drawer, calls `router.push`
- Mobile drawer Categorii block renders from `categories.map()` -- zero hardcoded names
- Logo hrefs updated to `/${countryCode}` (desktop main-bar, mobile header, drawer header)

**Updated call sites** (all 5 now pass `countryCode`):
- `app/[countryCode]/(main)/page.tsx` - homepage
- `app/[countryCode]/(main)/products/[handle]/page.tsx` - PDP
- `app/[countryCode]/(main)/categories/[...category]/page.tsx` - category page
- `app/[countryCode]/design-preview/category/page.tsx` - design preview (hardcoded "ro")
- `app/[countryCode]/design-preview/product/page.tsx` - design preview (hardcoded "ro")

### Task 2 - Search Results Page

New file: `backend-storefront/src/app/[countryCode]/(main)/search/page.tsx`

- Reads `searchParams.q`, trims it
- Calls `listProducts({ queryParams: { limit: 60, q: query, fields: ... }, countryCode })`
- Renders `<ProductGrid variant="cat" products={productCards} />` when results exist
- Empty state: "Niciun produs nu corespunde cautarii." when q set but 0 results
- Prompt state: "Cauta in catalog" + helper text when no q param
- Uses `SiteHeaderShell` and `SiteFooter` consistently with rest of site

### Task 3 - Playwright Screenshot

Screenshot captured at: `/tmp/search-disc-screenshot.png`

Result: Page rendered correctly showing "Rezultate pentru "disc"" with 14 products found and a product grid with disc images.

The dev server had a pre-existing Turbopack error (`cookies.ts` / `next/headers`) that required a restart before screenshot was possible. Error was pre-existing and unrelated to this task's changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing call sites] Two design-preview pages also call SiteHeader directly**
- **Found during:** Task 1 TypeScript check
- **Issue:** `src/app/[countryCode]/design-preview/category/page.tsx` and `design-preview/product/page.tsx` use `<SiteHeader>` directly (not via Shell) and did not pass `countryCode`. TypeScript error TS2741.
- **Fix:** Added `countryCode="ro"` to both (hardcoded "ro" is correct for static design preview pages)
- **Files modified:** both design-preview page files
- **Commit:** 0d478b4

## Out-of-Scope Items (Deferred)

- Desktop `cat-nav` hardcoded category list - marked with `// DESIGN PENDING: desktop cat-nav still hardcoded -- separate task`
- Search page has no filter sidebar, no sort selector, no pagination -- intentional per plan brief
- Pre-existing TSC errors in test files (`format-price.test.ts`, `category-to-hero.test.ts`) and missing checkout/account modules -- pre-existing, not touched

## Self-Check

- [x] `backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx` - exists, modified
- [x] `backend-storefront/src/modules/layout/site-header/SiteHeader.tsx` - exists, modified
- [x] `backend-storefront/src/app/[countryCode]/(main)/search/page.tsx` - exists, created
- [x] Commit 0d478b4 - exists (git log confirmed)
- [x] Commit 59e7d41 - exists (git log confirmed)
- [x] `npx tsc --noEmit` passes for all modified files (no site-header or search errors)
- [x] Screenshot captured at `/tmp/search-disc-screenshot.png` showing working search page

## Self-Check: PASSED
