---
phase: quick/260419-srt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/PDPAddToCartButton.tsx
  - backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/index.ts
  - backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx
  - backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx
  - backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
  - backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
  - backend-storefront/src/modules/layout/site-header/index.ts
autonomous: false
requirements:
  - C3-CART-API
  - C3-PDP-BUTTON
  - C3-HEADER-COUNTER

must_haves:
  truths:
    - "Click pe 'Adaugă în coș' din PDP creează cart-ul (dacă nu există) și adaugă variant-ul curent"
    - "Butonul afișează stare de loading în timpul cererii și label de succes după"
    - "Header-ul (desktop + mobile) afișează numărul real de articole din cart, nu valoarea hardcoded '12'"
    - "După add-to-cart, counter-ul din header se actualizează fără reload manual"
    - "Cart-ul persistă între sesiuni prin cookie (handled de getOrSetCart existent)"
  artifacts:
    - path: "backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/PDPAddToCartButton.tsx"
      provides: "Client island cu state loading/success/error care apelează server action addToCart"
      min_lines: 30
    - path: "backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx"
      provides: "Server wrapper care citește retrieveCart() și pasează itemCount la SiteHeader"
      min_lines: 15
  key_links:
    - from: "PDPAddToCartButton"
      to: "lib/data/cart.ts addToCart()"
      via: "server action import direct"
      pattern: "import.*addToCart.*from.*@lib/data/cart"
    - from: "PDPAddToCartButton"
      to: "router.refresh()"
      via: "useRouter from next/navigation post-success"
      pattern: "router\\.refresh\\(\\)"
    - from: "SiteHeaderShell"
      to: "lib/data/cart.ts retrieveCart()"
      via: "server fetch"
      pattern: "retrieveCart\\("
    - from: "ProductPage"
      to: "PDPSummary"
      via: "passes selectedVariant.id and countryCode as props"
      pattern: "selectedVariantId=.*selectedVariant"
---

<objective>
Activează butonul "Adaugă în coș" din PDP și înlocuiește counter-ul hardcoded "12" din header cu numărul real de articole. Cart-ul se creează lazy la primul add (server action `getOrSetCart` există deja în `lib/data/cart.ts`).

Purpose: Primul flow funcțional end-to-end de cart pe storefront — fără el PDP-ul e doar afișaj.
Output: Buton interactiv cu loading/success state + counter live în header (desktop + mobile).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
@backend-storefront/src/lib/data/cart.ts
@backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx
@backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
@backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx

<interfaces>
<!-- Cart server actions in lib/data/cart.ts (already implemented, do NOT rewrite) -->

```typescript
// All "use server" — call them directly from client components, Next.js wires the RPC.
export async function addToCart({
  variantId: string,
  quantity: number,
  countryCode: string,
}): Promise<void>
// → Internally calls getOrSetCart(countryCode) which creates cart + sets cookie if none.
// → Calls revalidateTag("carts") so server reads pick up the change.
// → Throws on failure (medusaError).

export async function retrieveCart(cartId?: string, fields?: string): Promise<HttpTypes.StoreCart | null>
// → Reads cart_id from cookies if cartId not passed.
// → Returns null if no cart cookie / cart not found.
// → Default fields include "*items" → cart.items is HttpTypes.StoreCartLineItem[]
```

```typescript
// Item count helper pattern (compute from cart.items):
const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
```

<!-- Existing SiteHeader markup keeps drawer state in useState — must remain "use client". -->
<!-- Hardcoded counts to replace: line 42 (favorites "4" — leave as-is), line 43 desktop cart "12", line 64 mobile favorites "4" (leave), line 65 mobile cart "12". -->

<!-- Existing PDP page already resolves selectedVariant server-side — just needs to pass id + countryCode through. -->
</interfaces>

</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PDPAddToCartButton client island and wire it into PDPSummary + ProductPage</name>
  <files>
    backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/PDPAddToCartButton.tsx,
    backend-storefront/src/modules/product-detail/pdp-add-to-cart-button/index.ts,
    backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx,
    backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx
  </files>
  <action>
    **1. Create `PDPAddToCartButton.tsx` (new client component):**

    ```tsx
    "use client"
    import { useState, useTransition } from "react"
    import { useRouter } from "next/navigation"
    import { addToCart } from "@lib/data/cart"

    interface Props {
      variantId: string | null
      countryCode: string
      label: string
    }

    export function PDPAddToCartButton({ variantId, countryCode, label }: Props) {
      const router = useRouter()
      const [isPending, startTransition] = useTransition()
      const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
      const [error, setError] = useState<string | null>(null)

      const disabled = !variantId || isPending

      const handleClick = () => {
        if (!variantId) return
        setError(null)
        setStatus("idle")
        startTransition(async () => {
          try {
            await addToCart({ variantId, quantity: 1, countryCode })
            setStatus("success")
            router.refresh()
            // Reset success label after 2s so user can add again with normal label
            setTimeout(() => setStatus("idle"), 2000)
          } catch (e: any) {
            setStatus("error")
            setError(e?.message ?? "Eroare la adăugarea în coș")
          }
        })
      }

      const buttonLabel = isPending
        ? "Se adaugă..."
        : status === "success"
          ? "Adăugat în coș"
          : label

      return (
        <>
          <button
            type="button"
            className="btn primary lg"
            onClick={handleClick}
            disabled={disabled}
            aria-busy={isPending}
            style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 3h2l1 9h10l1-6H5"/>
              <circle cx="7" cy="15" r="1.3"/>
              <circle cx="14" cy="15" r="1.3"/>
            </svg>
            {buttonLabel}
          </button>
          {error && (
            <div role="alert" style={{ color: "var(--danger-600, #b91c1c)", fontSize: 13, marginTop: 8 }}>
              {error}
            </div>
          )}
        </>
      )
    }
    ```

    Notes:
    - `addToCart` is a `"use server"` action — calling it from a client component is the official Next.js RPC pattern.
    - `router.refresh()` re-fetches server components (header counter) without full reload. Combined with `revalidateTag("carts")` inside `addToCart`, the SiteHeaderShell re-renders with new count.
    - `useTransition` keeps the UI responsive during the action. `aria-busy` for a11y.
    - Inline `style` for `opacity/cursor` is intentional — these are functional disabled-state cues (not visual design decisions). NOT a `// DESIGN PENDING` case because design system has no `:disabled` token defined and disabled feedback is required for the action to be perceivable as in-progress.

    **2. Create `index.ts` in same folder:**
    ```ts
    export { PDPAddToCartButton } from "./PDPAddToCartButton"
    ```

    **3. Update `PDPSummary.tsx`:**
    - Add to `PDPSummaryProps` interface:
      ```ts
      variantId: string | null
      countryCode: string
      ```
    - Replace the existing `<button className="btn primary lg">...</button>` block (lines 78-81) with:
      ```tsx
      <PDPAddToCartButton variantId={variantId} countryCode={countryCode} label={addToCartLabel} />
      ```
    - Add import: `import { PDPAddToCartButton } from '@modules/product-detail/pdp-add-to-cart-button'`
    - Destructure `variantId, countryCode` in the component signature.

    **4. Update PDP page (`products/[handle]/page.tsx`):**
    - Pass two new props to `<PDPSummary>` (after existing props, before `addToCartLabel`):
      ```tsx
      variantId={selectedVariant?.id ?? null}
      countryCode={countryCode}
      ```

    Do NOT modify `lib/data/cart.ts` — the server actions are already complete.
    Do NOT touch `QuantityStepper` — quantity is hardcoded to 1 per spec (it remains visual-only for this iteration).
  </action>
  <verify>
    <automated>cd backend-storefront && npx tsc --noEmit 2>&1 | grep -E "(PDPAddToCartButton|pdp-summary|products/\[handle\])" | head -20</automated>
    Manual smoke (covered by Task 3 checkpoint): click button → button shows "Se adaugă..." → after success "Adăugat în coș" → reverts to "Adaugă în coș" after 2s.
  </verify>
  <done>
    - `PDPAddToCartButton.tsx` exists, exports the component
    - `PDPSummary` renders `<PDPAddToCartButton>` instead of the static `<button>`
    - PDP page passes `variantId={selectedVariant?.id ?? null}` and `countryCode={countryCode}` to `PDPSummary`
    - `npx tsc --noEmit` passes with no errors related to these files
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace hardcoded cart counter in SiteHeader with server-fetched item count</name>
  <files>
    backend-storefront/src/modules/layout/site-header/SiteHeader.tsx,
    backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx,
    backend-storefront/src/modules/layout/site-header/index.ts
  </files>
  <action>
    Strategy: split SiteHeader into a server shell (fetches count) + existing client component (drawer state). Client component receives `cartItemCount` as a prop.

    **1. Add `cartItemCount` prop to existing `SiteHeader.tsx` (still `"use client"`):**

    Update `SiteHeaderProps`:
    ```ts
    interface SiteHeaderProps {
      categoriesHref?: string
      discuriHref?: string
      drawerId?: string
      drawerClosedAttr?: boolean
      cartItemCount?: number
    }
    ```

    Default in signature: `cartItemCount = 0`. Destructure it.

    Replace the hardcoded counters:
    - Line 43 (desktop cart action): `<span className="count">12</span>` → `{cartItemCount > 0 && <span className="count">{cartItemCount}</span>}`
    - Line 65 (mobile cart icon): `<span className="count">12</span>` → `{cartItemCount > 0 && <span className="count">{cartItemCount}</span>}`

    Leave the favorites counters ("4") untouched — those are out of scope for C3.

    **2. Create `SiteHeaderShell.tsx` (NEW server component):**

    ```tsx
    import { retrieveCart } from "@lib/data/cart"
    import { SiteHeader } from "./SiteHeader"

    interface SiteHeaderShellProps {
      categoriesHref?: string
      discuriHref?: string
      drawerId?: string
      drawerClosedAttr?: boolean
    }

    export async function SiteHeaderShell(props: SiteHeaderShellProps) {
      const cart = await retrieveCart().catch(() => null)
      const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

      return <SiteHeader {...props} cartItemCount={cartItemCount} />
    }
    ```

    No `"use client"` directive — this is a server component.

    **3. Update `index.ts` to export both:**
    ```ts
    export { SiteHeader } from "./SiteHeader"
    export { SiteHeaderShell } from "./SiteHeaderShell"
    ```

    Keep `SiteHeader` exported because design-preview routes import it directly with no cart context.

    **4. Swap `SiteHeader` → `SiteHeaderShell` in production pages ONLY:**

    In each of these three files, change `import { SiteHeader }` → `import { SiteHeaderShell }` and `<SiteHeader ...>` → `<SiteHeaderShell ...>`:
    - `backend-storefront/src/app/[countryCode]/(main)/page.tsx` (line 8 + line 78)
    - `backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx` (line 4 + line 179)
    - `backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx` (line 3 + line 136)

    Do NOT touch the design-preview pages (`design-preview/category/page.tsx`, `design-preview/product/page.tsx`) — those are static design previews, no cart needed.

    **Why this split:** SiteHeader uses `useState` for the mobile drawer (line 13), so it must stay `"use client"`. Server components can't fetch into client components, so we wrap with a thin server shell that does the fetch and passes the number down.

    **Why count update works without manual refresh:** `addToCart` calls `revalidateTag("carts")`. `retrieveCart` reads with `next: getCacheOptions("carts")` which tags the fetch. Combined with `router.refresh()` from Task 1, server components re-render with fresh count after add.
  </action>
  <verify>
    <automated>cd backend-storefront && npx tsc --noEmit 2>&1 | grep -E "(site-header|SiteHeader|SiteHeaderShell)" | head -20</automated>
    Visual: load `/ro` (no cart yet) → no "12" badge visible. Add item from PDP → header shows "1".
  </verify>
  <done>
    - `SiteHeaderShell.tsx` exists as server component, fetches cart, computes count
    - `SiteHeader.tsx` accepts `cartItemCount` prop, conditionally renders both desktop + mobile cart badges
    - Three production pages (home, category, PDP) import `SiteHeaderShell` instead of `SiteHeader`
    - Design-preview pages still import `SiteHeader` directly (unchanged)
    - `npx tsc --noEmit` passes with no errors related to these files
    - Hardcoded "12" no longer appears anywhere in `SiteHeader.tsx`
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify end-to-end cart flow + UI states</name>
  <what-built>
    - Cart server actions wired (already existed in `lib/data/cart.ts`, now consumed)
    - `PDPAddToCartButton` client island with loading + success + error states
    - `SiteHeaderShell` server component reading cart count from cookies
    - Header counters (desktop + mobile) replaced with live count, hidden when 0
  </what-built>
  <how-to-verify>
    Start dev server: `cd backend-storefront && npm run dev` (port 8000) with backend running on 9000.

    1. **Empty cart state:** Open `http://localhost:8000/ro` in a fresh incognito window. Verify NO cart badge "12" visible in header (desktop + mobile via DevTools responsive mode).

    2. **First add (cart creation):** Navigate to a PDP (e.g. `/ro/products/<some-handle>`). Click "Adaugă în coș". Expected sequence:
       - Button label changes to "Se adaugă..." and becomes disabled (visible opacity drop)
       - Within ~1-2s, label changes to "Adăugat în coș"
       - Header cart badge appears with "1" (desktop AND mobile)
       - After ~2s, button label reverts to "Adaugă în coș", button re-enabled

       Verify in DevTools → Application → Cookies that a cart cookie exists (`_medusa_cart_id` or similar).

    3. **Second add (same variant):** Click "Adaugă în coș" again. Header counter increments to "2".

    4. **Variant change + add:** Use variant selector to pick a different variant. Click "Adaugă în coș". Counter goes to "3".

    5. **Persistence:** Hard reload (`Ctrl+Shift+R`). Header still shows "3". Navigate to home `/ro`, then category, then back to PDP — counter persists across pages.

    6. **No-variant edge case:** If you can find a product with `variants.length === 0` (rare for ardmag), button should be disabled. Skip if no such product exists.

    7. **Network failure simulation (optional):** Kill the backend (`Ctrl+C` on the medusa dev server). Click "Adaugă în coș". Button shows "Se adaugă..." then a red error message appears below. Restart backend, retry — works.

    8. **Design preview unaffected:** Open `/ro/design-preview/product`. The static design preview should still render with its hardcoded counters (those use `SiteHeader` directly, not `SiteHeaderShell`).

    9. **TypeScript:** Run `cd backend-storefront && npx tsc --noEmit` — must pass with no new errors.

    Failure modes to watch for:
    - Button stuck on "Se adaugă..." → server action hanging or throwing silently → check browser console + backend terminal
    - Counter not updating after add → `router.refresh()` missing OR `revalidateTag` not propagating → check that `retrieveCart` is called fresh on next render (no stale cache)
    - Hydration warning on counter → server renders "0" but client has different value → ensure `cartItemCount` always passed as number, never undefined
  </how-to-verify>
  <resume-signal>Type "approved" if all 9 checks pass, or describe specific failures (which step, what you observed vs expected).</resume-signal>
</task>

</tasks>

<verification>
- TypeScript compiles clean (`npx tsc --noEmit`)
- Cart cookie set on first add
- Item count visible in header after add, hidden when 0
- Button shows loading + success states without page reload
- Cart persists across navigation and hard reload
</verification>

<success_criteria>
- User can click "Adaugă în coș" on PDP and see immediate feedback
- Header counter (desktop + mobile) reflects real cart contents from Medusa
- Cart created lazily on first add, persisted via cookie
- No hardcoded "12" remains in `SiteHeader.tsx` for cart badge
- Design system files in `resources/design/` not referenced for new visual tokens (only functional `:disabled` opacity + inline error color used; documented as intentional in Task 1 action)
</success_criteria>

<output>
After completion, create `.planning/quick/260419-srt-c3-buton-adauga-in-cos-functional-cart-a/260419-srt-SUMMARY.md` covering:
- Files added/modified
- How `addToCart` server action was wired (no need to rebuild — it existed)
- Why `SiteHeaderShell` server wrapper was needed (drawer useState forces SiteHeader to stay client)
- Any deviations from this plan
- Next quick-task candidates (e.g. mini-cart drawer, quantity stepper wired, remove item, cart page)
</output>
