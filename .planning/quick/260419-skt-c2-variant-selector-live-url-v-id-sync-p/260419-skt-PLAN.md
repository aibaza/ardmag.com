---
phase: 260419-skt-c2-variant-selector-live-url-v-id-sync-p
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts
  - backend-storefront/src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts
  - backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx
autonomous: true
requirements:
  - C2-01-variant-click-syncs-url
  - C2-02-server-re-renders-price-on-variant-change
  - C2-03-active-state-reflects-url

must_haves:
  truths:
    - "Clicking a variant option pushes ?v_id={variantId} to the URL via router.push"
    - "After URL update, the server re-renders the page with the selected variant's price (PDPPriceCard reflects new amount)"
    - "The clicked option visually shows as active (.var-opt.on) on next render"
    - "Adapter productToPdpVariantSelector returns each option with a variantId field"
  artifacts:
    - path: "backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts"
      provides: "VariantOption type extended with variantId; each option carries the id of the first variant matching that value"
      contains: "variantId"
    - path: "backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx"
      provides: "Client component that pushes ?v_id={id} on option click"
      contains: "use client"
    - path: "backend-storefront/src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts"
      provides: "Vitest coverage for variantId mapping behavior"
      contains: "variantId"
  key_links:
    - from: "PDPVariantSelector.tsx button onClick"
      to: "Next.js router URL ?v_id={variantId}"
      via: "useRouter().push() with current pathname + updated searchParams"
      pattern: "router\\.push.*v_id"
    - from: "page.tsx server component"
      to: "selectedVariant via searchParams.v_id (already wired)"
      via: "variants.find((v) => v.id === selectedVariantId)"
      pattern: "selectedVariantId"
    - from: "productToPdpVariantSelector adapter"
      to: "each VariantOption.variantId"
      via: "first variant in the list whose options include {dimensionTitle: value}"
      pattern: "variantId"
---

<objective>
Make the PDP variant selector interactive: clicking an option updates the URL `?v_id={variantId}`, which triggers a server re-render that picks the selected variant and recomputes the price card. Server-side selection logic and price card rendering already exist in `page.tsx`; this plan wires the client-side click handler and threads `variantId` through the adapter.

Purpose: C2 PDP becomes functional. Users can switch between variants and see price/SKU/stock update without manual URL editing.

Output: One client component (`PDPVariantSelector.tsx`), one updated adapter (`product-to-pdp-variant-selector.ts`), and updated test coverage.
</objective>

<execution_context>
Quick task — single plan, single wave. Pattern is identical to FilterSidebar B3: `"use client"` + `useRouter` + `useSearchParams` + `router.push()`.

Server-side flow (already complete, do not modify):
1. `page.tsx` reads `searchParams.v_id`
2. Picks `selectedVariant` from product variants
3. Computes `priceCardProps = productToPdpPriceCard(selectedVariant, product)`
4. Computes `variantGroups = productToPdpVariantSelector(product, selectedVariant?.id)` — adapter already marks active option
5. Passes everything to PDPSummary which renders PDPPriceCard + PDPVariantSelector
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md

# Server-side wiring (read-only reference)
@backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx

# Files to modify
@backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts
@backend-storefront/src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts
@backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx

# Pattern reference (B3 FilterSidebar - same client-router approach)
@backend-storefront/src/modules/category/filter-sidebar/FilterSidebar.tsx

# Consumer (no changes needed - just passes variantGroups through)
@backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx

<interfaces>
<!-- Current VariantOption / VariantGroup shape exported by the adapter and consumed by PDPVariantSelector + PDPSummary -->

```typescript
// Current (in product-to-pdp-variant-selector.ts AND duplicated in both component files)
interface VariantOption {
  label: string
  active?: boolean
  unavailable?: boolean
  discount?: string
}

interface VariantGroup {
  title: string
  selectedValue: string
  options: VariantOption[]
}
```

```typescript
// After this plan: variantId added (required field)
interface VariantOption {
  label: string
  variantId: string         // NEW: id of the first variant matching this option value in this dimension
  active?: boolean
  unavailable?: boolean
  discount?: string
}
```

The interface is duplicated in three files (adapter, PDPVariantSelector, PDPSummary). All three must stay in sync — update all three. PDPSummary just passes the array through, so the field becomes available without behavioral changes there.

Next.js client hooks pattern (from FilterSidebar.tsx):
```typescript
"use client"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const router = useRouter()
const searchParams = useSearchParams()
const pathname = usePathname()

// Build URL with updated v_id, preserving other params
const params = new URLSearchParams(searchParams.toString())
params.set("v_id", variantId)
router.push(`${pathname}?${params.toString()}`)
```

Note: `usePathname` is preferred over a `baseUrl` prop here because PDPVariantSelector currently has no `baseUrl` prop and the pathname (`/{countryCode}/products/{handle}`) is already the right base.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add variantId to adapter output and update tests</name>
  <files>backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts, backend-storefront/src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts</files>
  <behavior>
    - Each VariantOption returned by productToPdpVariantSelector has a `variantId: string` field
    - variantId = id of the FIRST variant whose options include `{dimensionTitle, value}` (deterministic, in array order)
    - Existing behavior preserved: active marking, unavailable, discount, [] for default-variant-only products, dimension grouping order
    - Test coverage:
      * "each option carries variantId of the first matching variant" (new) -- multi-option product, assert option.variantId for known label
      * "variantId is stable when same value appears in multiple variants" (new) -- two variants share "1 LITRU"; option.variantId === first one's id
      * Update existing "groups variants by option dimension" assertion: also check that v1.id appears as variantId for v1's labels
  </behavior>
  <action>
    Edit `product-to-pdp-variant-selector.ts`:

    1. Add `variantId: string` (required, not optional) to the `VariantOption` interface.
    2. In the `options` map inside the dimension loop, set `option.variantId = variantsWithValue[0].id`. The existing `variantsWithValue` filter already finds variants matching that dimension+value; just take the first one's id. If `variantsWithValue` is empty (shouldn't happen since the value came from those variants, but defensive), fall back to `variants[0]?.id ?? ""`.
    3. Keep all other adapter logic untouched (active, unavailable, discount, dimension order, empty-cases).

    Edit `__tests__/product-to-pdp-variant-selector.test.ts`:

    4. Add a new test: "each option carries variantId of the first matching variant" -- use the existing 3-variant fixture from the "groups variants by option dimension" test. Assert:
       - `groups[0].options.find(o => o.label === "TRANSPARENT").variantId === "v1"` (v1 is first with TRANSPARENT)
       - `groups[0].options.find(o => o.label === "BEJ").variantId === "v2"`
       - `groups[1].options.find(o => o.label === "1 LITRU").variantId === "v1"` (v1 is first with 1 LITRU)
       - `groups[1].options.find(o => o.label === "5 LITRI").variantId === "v3"`

    5. Add a defensive test: "variantId is present on all options when single visible variant" -- reuse the "single variant with visible option" fixture, assert `groups[0].options[0].variantId === "v1"`.

    No need to update other existing tests -- they don't assert the absence of variantId, and adding a required field is additive at runtime.

    Avoid: Don't try to be clever about "best matching variant given current selection in other dimensions" -- per the invoking conversation, simplest implementation is "first variant containing that value." Cross-dimension constraint solving is a future optimization, not in scope.
  </action>
  <verify>
    <automated>cd backend-storefront && npx vitest run src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts</automated>
  </verify>
  <done>
    All existing tests still pass + 2 new tests pass. Adapter exports VariantOption with required `variantId: string`. TypeScript compiles cleanly (`npx tsc --noEmit` in backend-storefront).
  </done>
</task>

<task type="auto">
  <name>Task 2: Convert PDPVariantSelector to client component with router.push on click</name>
  <files>backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx, backend-storefront/src/modules/product-detail/pdp-summary/PDPSummary.tsx</files>
  <action>
    Edit `PDPVariantSelector.tsx`:

    1. Add `"use client"` directive at top of file (line 1).
    2. Import `useRouter`, `useSearchParams`, `usePathname` from `next/navigation`.
    3. Add `variantId: string` (required) to the local `VariantOption` interface so it matches the adapter output.
    4. Inside the component, instantiate the three hooks:
       ```ts
       const router = useRouter()
       const searchParams = useSearchParams()
       const pathname = usePathname()
       ```
    5. Add a click handler:
       ```ts
       function handleSelect(variantId: string) {
         const params = new URLSearchParams(searchParams.toString())
         params.set("v_id", variantId)
         router.push(`${pathname}?${params.toString()}`)
       }
       ```
    6. On the button element (currently line 28), add `onClick={() => handleSelect(option.variantId)}` and `type="button"` (defensive against accidental form submission). Skip the click handler when `option.unavailable === true` -- still render the button (so the disabled state stays visible) but make onClick a no-op for unavailable options. Implementation: `onClick={option.unavailable ? undefined : () => handleSelect(option.variantId)}` and add `disabled={option.unavailable}`.
    7. Do NOT change visual structure, classes, or any rendering logic. The only changes are: directive, hooks, click handler wiring, optional `disabled` attribute on the button.

    Edit `PDPSummary.tsx`:

    8. Update the local `VariantOption` interface (line 13) to include `variantId: string` (required) so the prop type matches what the adapter now produces. PDPSummary just passes `variantGroups` through, no other changes needed. PDPSummary stays a server component (no `"use client"` needed) -- only PDPVariantSelector becomes a client component.

    Avoid:
    - Don't refactor the duplicate VariantOption / VariantGroup interfaces into a shared types file. Out of scope for a quick task. Note this in code if you want, but don't do it.
    - Don't add useState for "currently selected" -- the URL is the source of truth, and the server re-render reflects it via the `active` flag from the adapter. Adding local state would create a race with server state.
    - Don't add a loading spinner on click. router.push triggers a server transition; Next.js handles the visual feedback. Optimization out of scope.
    - Don't change the button's existing `cls` template -- `option.active` (set by adapter on the next render) drives the `.on` class. After router.push completes and the server re-renders, the new active option will visually become "on".
  </action>
  <verify>
    <automated>cd backend-storefront && npx tsc --noEmit && npx vitest run src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts</automated>
  </verify>
  <done>
    - PDPVariantSelector.tsx starts with `"use client"` and uses useRouter/useSearchParams/usePathname.
    - Button onClick pushes `?v_id={variantId}` preserving other URL params.
    - Unavailable options have `disabled` attribute and no click handler.
    - TypeScript compiles cleanly.
    - PDPSummary's VariantOption interface includes `variantId: string` (matches adapter output).
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    PDP variant selector is now interactive:
    1. Adapter emits `variantId` on every option (first matching variant, deterministic).
    2. PDPVariantSelector is a client component that pushes `?v_id={id}` on click and disables unavailable options.
    3. PDPSummary's local type matches the new adapter output.
    4. Server `page.tsx` was already wired (selectedVariantId, selectedVariant, priceCardProps) -- nothing changed there.
  </what-built>
  <how-to-verify>
    1. Start the storefront: `cd backend-storefront && npm run dev` (port 8000).
    2. Navigate to a multi-variant product PDP, e.g. `http://localhost:8000/ro/products/mastic-tenax` (use any product with 2+ variants -- check Medusa admin if unsure which handle).
    3. Initial state: first variant should be active (one button has `.on` class), price card shows that variant's price.
    4. Click a different variant option button.
    5. Expected:
       - URL updates to include `?v_id={variant_id}` (visible in browser address bar).
       - Page re-renders (Next.js server transition -- may show brief loading indicator at top).
       - The clicked button now has the `.on` (active) class.
       - The price card shows the new variant's price (if prices differ between variants).
       - SKU/EAN in the summary still reflects the FIRST variant -- this is current `page.tsx` behavior (uses `firstVariant`), out of scope for this plan. Do not flag as a bug.
    6. Click an `unavailable` option (if the product has out-of-stock variants): button should be disabled, click should do nothing.
    7. Refresh the page with `?v_id={id}` in URL: same variant stays active.
    8. Verify other URL params (if any) are preserved when clicking a variant.

    If the price doesn't change but URL does, check that `productToPdpPriceCard(selectedVariant, product)` is being called in page.tsx with the right variant -- but that code wasn't modified, so it should work.
  </how-to-verify>
  <resume-signal>Type "approved" or describe what isn't working (URL not updating, active class not switching, price not changing, unavailable option still clickable, etc.)</resume-signal>
</task>

</tasks>

<verification>
- `npx vitest run src/lib/util/adapters/__tests__/product-to-pdp-variant-selector.test.ts` passes (all original + 2 new tests)
- `npx tsc --noEmit` in backend-storefront passes (no type errors from interface changes)
- Manual: clicking variant on PDP updates URL and re-renders price card
- Grep check: `grep -n "variantId" backend-storefront/src/lib/util/adapters/product-to-pdp-variant-selector.ts` shows the field is set
- Grep check: `grep -n "use client" backend-storefront/src/modules/product-detail/pdp-variant-selector/PDPVariantSelector.tsx` shows directive on line 1
</verification>

<success_criteria>
- Adapter VariantOption includes required `variantId: string`
- PDPVariantSelector is a client component using `useRouter`, `useSearchParams`, `usePathname`
- Click on option button -> URL gets `?v_id={variantId}` (preserving other params) -> server re-renders -> active class moves and price card updates
- Unavailable options are disabled and do not trigger navigation
- All existing tests still pass; 2 new tests cover variantId mapping
- No regressions in PDPSummary (still server component, props flow through)
</success_criteria>

<output>
After completion, create `.planning/quick/260419-skt-c2-variant-selector-live-url-v-id-sync-p/260419-skt-SUMMARY.md` documenting:
- What was changed (3 files: adapter + adapter test + client component, with PDPSummary type sync)
- The "first variant containing the value" mapping rule and its limitation (cross-dimension combinations not solved)
- Out-of-scope future work: shared VariantOption types file, smart cross-dimension variant resolution, SKU/EAN updating per selected variant in PDPSummary
- Confirmation that server-side `page.tsx` was already wired and required no changes
</output>
