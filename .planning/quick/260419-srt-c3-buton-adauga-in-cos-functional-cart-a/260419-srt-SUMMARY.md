---
phase: quick/260419-srt
plan: 01
subsystem: storefront-cart
tags: [cart, pdp, add-to-cart, header-counter, server-action, useTransition]
dependency_graph:
  requires: [lib/data/cart.ts addToCart, lib/data/cart.ts retrieveCart]
  provides: [C3-CART-API, C3-PDP-BUTTON, C3-HEADER-COUNTER]
  affects: [PDPSummary, SiteHeader, homepage, category page, PDP page]
tech_stack:
  added: []
  patterns: [Next.js server action RPC from client component, server shell wrapping client component for data fetch, useTransition for pending state]
key_files:
  created:
    - backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/PDPAddToCartButton.tsx
    - backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/index.ts
    - backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
  modified:
    - backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx
    - backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
    - backend-storefront/src/modules/layout/site-header/index.ts
    - backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx
    - backend-storefront/src/app/[countryCode]/(main)/page.tsx
    - backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
decisions:
  - "SiteHeader stays 'use client' (useState for drawer) - server cart fetch extracted to SiteHeaderShell wrapper"
  - "addToCart called as server action RPC directly from PDPAddToCartButton - no API route needed"
  - "router.refresh() + revalidateTag('carts') combo ensures header counter updates without full reload"
  - "Inline opacity/cursor on disabled button is intentional functional feedback - design system has no :disabled token"
metrics:
  duration: 15min
  completed: 2026-04-19
  tasks_completed: 3
  files_created: 3
  files_modified: 6
---

# Quick Task 260419-srt: C3 Buton "Adaugă în coș" Functional + Cart Counter

**One-liner:** PDPAddToCartButton client island wired to addToCart server action with loading/success/error states; SiteHeaderShell server wrapper replaces hardcoded cart counter "12" with live item count from retrieveCart.

## What Was Built

### Task 1: PDPAddToCartButton client island

`PDPAddToCartButton.tsx` is a `"use client"` component that:
- Uses `useTransition` to call `addToCart({ variantId, quantity: 1, countryCode })` from `lib/data/cart.ts`
- Shows "Se adaugă..." during pending state (aria-busy, opacity 0.6, cursor not-allowed)
- Shows "Adăugat în coș" on success, reverts to original label after 2s
- Shows inline error message (red) on failure
- Calls `router.refresh()` post-success to trigger server component re-renders

`PDPSummary` now accepts `variantId: string | null` and `countryCode: string`, renders `<PDPAddToCartButton>` instead of the static `<button>`. PDP page passes `selectedVariant?.id ?? null` and `countryCode`.

### Task 2: SiteHeaderShell server component + live counter

`SiteHeaderShell.tsx` is an `async` server component that:
- Calls `retrieveCart().catch(() => null)` (safe -- returns null if no cart cookie)
- Computes `cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0`
- Renders `<SiteHeader {...props} cartItemCount={cartItemCount} />`

`SiteHeader` now accepts `cartItemCount?: number` (default 0) and conditionally renders the badge with `{cartItemCount > 0 && <span className="count">{cartItemCount}</span>}` for both desktop and mobile cart icons.

Three production pages (home, category, PDP) now import and use `SiteHeaderShell`. Design-preview pages continue using `SiteHeader` directly -- they are static and need no cart context.

### Why server shell was needed

`SiteHeader` uses `useState` for the mobile drawer (line 13), so it must be a client component. Server components cannot fetch inside client components, so the pattern is: server shell fetches count, passes it as a primitive prop to the client component. This is the official Next.js pattern for mixing server data + client interactivity.

### Why the cart counter updates without manual refresh

`addToCart` (already implemented in `lib/data/cart.ts`) calls `revalidateTag("carts")` after mutation. `retrieveCart` reads with `next: getCacheOptions("carts")` which tags the fetch. Combined with `router.refresh()` in PDPAddToCartButton, Next.js re-executes server components on the current page and they receive a fresh cart count.

## Verification Screenshot

Screenshot taken via Playwright after clicking "Adaugă în coș" on the PDP:

- URL: `http://localhost:8000/ro/products/discuri-marmura-si-andezit-tola-second`
- Action: `page.click('button.btn.primary.lg')`
- Result: Cart counter in header shows "1", confirming end-to-end flow works

Screenshot paths:
- Before click: `.planning/quick/260419-srt-c3-buton-adauga-in-cos-functional-cart-a/screenshots/before-add-to-cart.png`
- After click (counter shows "1"): `.planning/quick/260419-srt-c3-buton-adauga-in-cos-functional-cart-a/screenshots/after-add-to-cart.png`

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all wired to real Medusa data. Cart cookie, cart creation, and counter are fully functional.

## Next Quick-Task Candidates

- **Mini-cart drawer** -- clicking the cart icon in the header should open a slide-over showing cart items + totals
- **Remove item from cart** -- delete line item via `deleteLineItem` server action (already scaffolded in lib/data/cart.ts if present, otherwise 10-line addition)
- **Quantity stepper wired** -- QuantityStepper currently visual-only; wire to `updateLineItem` or pass quantity to addToCart
- **Cart page** -- `/ro/cart` showing full cart with subtotal, promo, checkout CTA
- **Checkout** -- redirect to Medusa checkout or custom checkout flow

## Self-Check: PASSED

- PDPAddToCartButton.tsx: FOUND
- SiteHeaderShell.tsx: FOUND
- Task 1 commit 5a67b22: FOUND
- Task 2 commit b870d00: FOUND
