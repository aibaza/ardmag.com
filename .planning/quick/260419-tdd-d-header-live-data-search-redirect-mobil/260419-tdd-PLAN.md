---
phase: 260419-tdd-d-header-live-data
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
  - backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
  - backend-storefront/src/app/[countryCode]/(main)/search/page.tsx
autonomous: false
requirements:
  - D-01
  - D-02
  - D-03

must_haves:
  truths:
    - "Submitting the desktop search form (Enter or click Caută) navigates to /{countryCode}/search?q=<query>"
    - "Submitting the mobile search form navigates to /{countryCode}/search?q=<query>"
    - "Empty query submission does NOT navigate (no-op)"
    - "Mobile drawer Categorii section lists real Medusa categories with live product counts (no hardcoded 'Discuri diamantate 148', etc.)"
    - "/{countryCode}/search?q=<query> renders a results page listing products matching the query via Medusa /store/products?q=..."
    - "Each mobile drawer category link points to /{countryCode}/categories/{handle}"
  artifacts:
    - path: backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
      provides: "Client SiteHeader with onSubmit search redirect and mobile drawer rendered from props.categories"
      contains: "useRouter"
    - path: backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
      provides: "Server wrapper that fetches cart count + categories and passes countryCode to SiteHeader"
      contains: "listCategories"
    - path: backend-storefront/src/app/[countryCode]/(main)/search/page.tsx
      provides: "Search results page using listProducts({ queryParams: { q } })"
      contains: "searchParams"
  key_links:
    - from: SiteHeader.tsx
      to: next/navigation router.push
      via: "form onSubmit handler builds /{countryCode}/search?q=<encoded query>"
      pattern: "router\\.push\\(.*search\\?q="
    - from: SiteHeaderShell.tsx
      to: SiteHeader.tsx
      via: "props.categories (from listCategories) and props.countryCode"
      pattern: "categories=\\{categories\\}"
    - from: search/page.tsx
      to: listProducts
      via: "queryParams.q passed through to Medusa /store/products"
      pattern: "queryParams:\\s*\\{[^}]*q:"
---

<objective>
Wire the site header's search form to redirect to a real search results page, and replace the hardcoded mobile drawer category list with live Medusa categories.

Purpose: Header is currently a static shell. Users cannot search and the mobile menu lies (shows fake categories). This is the last mile to make the header functional with real backend data.

Output:
- SiteHeader gets onSubmit handlers (desktop + mobile) that push `/{countryCode}/search?q=<query>`
- SiteHeaderShell fetches `listCategories()` and passes both `categories` and `countryCode` to SiteHeader
- Mobile drawer Categorii section renders from props.categories (handle, name, product count)
- New minimal search results page at `/[countryCode]/(main)/search/page.tsx` that calls `listProducts({ queryParams: { q } })` and renders `ProductGrid variant="cat"`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md

# Header files (modify)
@backend-storefront/src/modules/layout/site-header/SiteHeader.tsx
@backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx
@backend-storefront/src/modules/layout/site-header/index.ts

# Reference patterns (do not modify -- read for shape)
@backend-storefront/src/lib/data/categories.ts
@backend-storefront/src/lib/data/products.ts
@backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
@backend-storefront/src/modules/products/product-grid/ProductGrid.tsx

# Design source of truth for mobile drawer markup
@resources/design/Design System 04 - Chrome & Homepage.html

<interfaces>
<!-- Extracted from codebase. Use these directly -- no exploration needed. -->

From backend-storefront/src/lib/data/categories.ts:
```typescript
export const listCategories = async (query?: Record<string, any>) =>
  Promise<HttpTypes.StoreProductCategory[]>
// Each category includes: id, name, handle, products (array, used for count)
```

From backend-storefront/src/lib/data/products.ts:
```typescript
export const listProducts = async ({
  pageParam?: number,
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams, // supports q?: string
  countryCode?: string,
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number },
  nextPage: number | null,
  queryParams?: ...
}>
```

From backend-storefront/src/lib/util/adapters/product-to-card.ts:
```typescript
export function productToCard(product: HttpTypes.StoreProduct, countryCode: string): ProductGridItem
```

From backend-storefront/src/modules/products/product-grid/ProductGrid.tsx:
```typescript
interface ProductGridProps {
  variant: 'mini' | 'cat'
  products: ProductGridItem[]
}
```

Current SiteHeaderShell signature (will be extended):
```typescript
interface SiteHeaderShellProps {
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
}
```

Current SiteHeader signature (will be extended):
```typescript
interface SiteHeaderProps {
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
  cartItemCount?: number
}
```

Existing call sites for SiteHeaderShell (do not break):
- backend-storefront/src/app/[countryCode]/(main)/page.tsx:78  -> `<SiteHeaderShell />`
- backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx:136
- backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx:179
  -> passes categoriesHref, drawerId, drawerClosedAttr

All three call sites have `countryCode` available in scope already (from `params`). New required prop on SiteHeaderShell: `countryCode: string`. Update all three call sites.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add countryCode prop + categories fetch to SiteHeaderShell, wire search redirect + live categories in SiteHeader</name>
  <files>
    backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx,
    backend-storefront/src/modules/layout/site-header/SiteHeader.tsx,
    backend-storefront/src/app/[countryCode]/(main)/page.tsx,
    backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx,
    backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
  </files>
  <action>
**Step 1 -- SiteHeaderShell.tsx (server component)**

- Add required prop `countryCode: string` to `SiteHeaderShellProps`.
- In the function body, run `listCategories()` in parallel with `retrieveCart()`:
  ```ts
  const [cart, categories] = await Promise.all([
    retrieveCart().catch(() => null),
    listCategories().catch(() => [] as HttpTypes.StoreProductCategory[]),
  ])
  ```
- Map categories to a minimal shape the client component needs (avoid passing full SDK types):
  ```ts
  const drawerCategories = categories
    .filter((c) => c.handle !== 'pachete-promotionale') // mirror homepage exclusion
    .map((c) => ({
      name: c.name ?? '',
      handle: c.handle ?? '',
      count: (c as any).products?.length ?? 0,
    }))
  ```
- Pass to SiteHeader: `<SiteHeader {...props} cartItemCount={cartItemCount} categories={drawerCategories} countryCode={props.countryCode} />`
- Imports needed: `listCategories` from `@lib/data/categories`, `HttpTypes` from `@medusajs/types`.

**Step 2 -- SiteHeader.tsx (client component)**

- Extend `SiteHeaderProps` with:
  ```ts
  countryCode: string
  categories?: Array<{ name: string; handle: string; count: number }>
  ```
- Import `useRouter` from `next/navigation`. Default `categories = []`.
- Add a single `handleSearchSubmit` function reused by both desktop and mobile forms:
  ```ts
  const router = useRouter()
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = String(formData.get('q') ?? '').trim()
    if (!query) return
    setDrawerOpen(false) // close drawer if mobile submit
    router.push(`/${countryCode}/search?q=${encodeURIComponent(query)}`)
  }
  ```
- On both `<form className="search-combo">` blocks (desktop main-bar AND mobile-search), replace `onSubmit={(e) => e.preventDefault()}` with `onSubmit={handleSearchSubmit}` and add `name="q"` to each `<input type="search">`.
- In the mobile drawer section labeled `Categorii`, replace the hardcoded `<a>` block with:
  ```tsx
  <div className="mm-nav">
    {categories.map((cat) => (
      <a key={cat.handle} href={`/${countryCode}/categories/${cat.handle}`} onClick={() => setDrawerOpen(false)}>
        {cat.name} <span className="count">{cat.count}</span>
      </a>
    ))}
  </div>
  ```
- Also update the desktop top main-bar logo `href="/ro"` to `href={`/${countryCode}`}` and the mobile header logo + drawer header logo identically. Same for `cat-nav` "Toate categoriile" `<a className="all" href={categoriesHref}>` -- if `categoriesHref` is "#" default, keep as is (caller already passes a real value where it matters).
- DO NOT touch the desktop `cat-nav` hardcoded category list -- out of scope per planning context (only mobile drawer is requested). Add `// DESIGN PENDING: desktop cat-nav still hardcoded -- separate task` comment above the `<nav className="cat-nav">` block.

**Step 3 -- Update three call sites to pass `countryCode`**

For each of:
- `backend-storefront/src/app/[countryCode]/(main)/page.tsx` -- already destructures `countryCode` from params; change `<SiteHeaderShell />` to `<SiteHeaderShell countryCode={countryCode} />`.
- `backend-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx` -- ensure `countryCode` is in scope, then add prop.
- `backend-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx` -- already has `countryCode`, add prop.

**Why countryCode as prop instead of usePathname():**
- SiteHeader is a client component used inside server pages that already have `countryCode` -- passing it explicitly avoids a hydration round-trip and is consistent with how `productToCard(p, countryCode)` is called elsewhere.
- `usePathname()` would force the search redirect logic to parse `/ro/...` strings, which is fragile and re-runs on every render.
  </action>
  <verify>
    <automated>cd backend-storefront && npx tsc --noEmit 2>&1 | grep -E "site-header|search" || echo "no header/search type errors"</automated>
  </verify>
  <done>
    - `npx tsc --noEmit` passes for the three modified files (no new errors related to SiteHeader / SiteHeaderShell / call sites).
    - SiteHeaderShell accepts and requires `countryCode`.
    - SiteHeader's two search forms both have `onSubmit={handleSearchSubmit}` and inputs have `name="q"`.
    - Mobile drawer Categorii block renders from `categories.map(...)`, no hardcoded category names remain in that block.
    - All three call sites pass `countryCode={countryCode}`.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create minimal /[countryCode]/search results page</name>
  <files>backend-storefront/src/app/[countryCode]/(main)/search/page.tsx</files>
  <action>
Create new file `backend-storefront/src/app/[countryCode]/(main)/search/page.tsx` modeled after `categories/[...category]/page.tsx` but stripped to essentials -- this is intentionally minimal per planning brief (D-03: minimal search results page).

```tsx
import { Metadata } from "next"
import { SiteHeaderShell } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { ProductGrid } from '@modules/products/product-grid'
import { listProducts } from "@lib/data/products"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = {
  title: "Cautare | ardmag.com",
  description: "Rezultate cautare scule si consumabile pentru piatra naturala",
}

export default async function SearchPage(props: Props) {
  const [{ countryCode }, { q }] = await Promise.all([props.params, props.searchParams])
  const query = (q ?? "").trim()

  let products: HttpTypes.StoreProduct[] = []
  let count = 0

  if (query) {
    const result = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 60,
        q: query,
        fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images',
      },
      countryCode,
    }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[], count: 0 }, nextPage: null }))
    products = result.response.products
    count = result.response.count
  }

  const productCards = products.map((p) => productToCard(p, countryCode))
  const breadcrumbItems = [{ label: "Acasa", href: `/${countryCode}` }]
  const breadcrumbCurrent = query ? `Cautare: "${query}"` : "Cautare"

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="mDrawer" drawerClosedAttr />
      <main className="page-inner">
        <Breadcrumb items={breadcrumbItems} current={breadcrumbCurrent} />

        <div style={{ padding: "24px 0" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>
            {query ? `Rezultate pentru "${query}"` : "Cauta in catalog"}
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>
            {query ? `${count} ${count === 1 ? 'produs gasit' : 'produse gasite'}` : "Foloseste bara de cautare din header."}
          </p>
        </div>

        {query && productCards.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
            Niciun produs nu corespunde cautarii.
          </div>
        )}

        {productCards.length > 0 && <ProductGrid variant="cat" products={productCards} />}
      </main>
      <SiteFooter />
    </>
  )
}
```

**Notes:**
- Uses `q` query param, passed straight through to Medusa `/store/products?q=...` (Medusa supports `q?: string` on `StoreProductListParams` per `@medusajs/types`).
- No filter sidebar, no sort, no pagination -- per planning brief "minimal search results page". Keep scope tight; add later if needed.
- No copy invented: only labels needed for the page (Cautare, Rezultate pentru, Niciun produs..., Cauta in catalog) -- standard UI labels, not marketing copy. Per CLAUDE.md these are allowed.
- Avoid em dashes per CLAUDE.md (used double cratima or commas).
- No Romanian diacritics (a, i, s, t with cedilla) intentionally avoided in inline strings to mirror the rest of the storefront's plain-ASCII style for now -- if existing storefront uses diacritics, match that style instead.
  </action>
  <verify>
    <automated>cd backend-storefront && npx tsc --noEmit 2>&1 | grep -E "app/\[countryCode\].*search" || echo "no search page type errors"</automated>
  </verify>
  <done>
    - File `backend-storefront/src/app/[countryCode]/(main)/search/page.tsx` exists.
    - `npx tsc --noEmit` passes for the new file.
    - Page exports a default async server component that reads `searchParams.q` and calls `listProducts({ queryParams: { q } })`.
    - Renders `<ProductGrid variant="cat" products={...} />` when results exist.
    - Renders empty state when `q` is set but no results.
    - Renders prompt state when `q` is missing.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Manual verification of search redirect + live mobile drawer</name>
  <what-built>
    - SiteHeader desktop and mobile search forms now redirect to `/{countryCode}/search?q=<query>` on submit.
    - Mobile drawer Categorii section now lists real Medusa categories with live product counts.
    - New `/{countryCode}/search` results page renders products matching the query via Medusa `q` param.
  </what-built>
  <how-to-verify>
    Start the storefront (`cd backend-storefront && npm run dev`) and the backend (`cd backend && npm run dev`), then:

    1. **Desktop search redirect (homepage)**
       - Visit http://localhost:8000/ro
       - Type "tenax" in the desktop search input (in the main-bar) and press Enter.
       - Expected: URL becomes `/ro/search?q=tenax`. Page shows "Rezultate pentru \"tenax\"" header and a product grid with Tenax mastic products. Product count > 0.

    2. **Desktop search via Caută button**
       - Type "DLT" in the search input and click the "Caută" button.
       - Expected: URL becomes `/ro/search?q=DLT`. Grid shows discuri DLT products (or empty state if none match).

    3. **Empty query no-op**
       - Click into the search input, leave it empty, press Enter.
       - Expected: No navigation. URL stays on the current page.

    4. **Mobile search redirect**
       - Resize browser to ~400px width (or use DevTools mobile mode).
       - Use the mobile-search bar (below the mobile header) -- type "disc" and press Enter.
       - Expected: URL becomes `/ro/search?q=disc`. Results render.

    5. **Mobile drawer live categories**
       - Still on mobile width, click the burger button to open the drawer.
       - Under "Categorii", you should see REAL Medusa category names with REAL product counts (e.g., "Discuri de taiere 12", "Slefuire piatra 8" -- not the old hardcoded "Discuri diamantate 148"). The list should NOT include "Pachete promotionale".
       - Click any category. Expected: drawer closes, URL navigates to `/ro/categories/<handle>`, category page renders.

    6. **Search page direct visit with no query**
       - Visit http://localhost:8000/ro/search directly (no `?q=`).
       - Expected: Page renders with "Cauta in catalog" header and the helper text "Foloseste bara de cautare din header."

    7. **Search page with no results**
       - Visit http://localhost:8000/ro/search?q=zzzqqqxxx
       - Expected: "Niciun produs nu corespunde cautarii." empty state.

    8. **Header still works on PDP and category pages**
       - Visit a product detail page (any product) and a category page.
       - Open mobile drawer on each. Expected: Categories still load (no errors). Search still redirects.

    Report any visual issues or DESIGN PENDING items separately -- the focus here is functional correctness.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues (e.g., "drawer category counts are wrong", "search returns 500").</resume-signal>
</task>

</tasks>

<verification>
**Code verification:**
```bash
cd backend-storefront && npx tsc --noEmit
```
Expected: No new type errors in modified files.

**Build verification (optional but recommended):**
```bash
cd backend-storefront && npm run build
```
Expected: Build succeeds, new `/[countryCode]/search` route appears in route tree output.

**Manual verification:** see Task 3 checkpoint.
</verification>

<success_criteria>
- [ ] SiteHeader.tsx desktop and mobile search forms both call `router.push(/{countryCode}/search?q=...)` on non-empty submit
- [ ] SiteHeaderShell.tsx requires `countryCode` prop and fetches `listCategories()`
- [ ] All three existing call sites (homepage, PDP, category page) updated to pass `countryCode`
- [ ] Mobile drawer Categorii section renders from `categories.map(...)` -- no hardcoded category names
- [ ] `pachete-promotionale` excluded from mobile drawer (mirrors homepage)
- [ ] New file `backend-storefront/src/app/[countryCode]/(main)/search/page.tsx` exists and renders
- [ ] Search results page uses `listProducts({ queryParams: { q } })` -- not a custom filter
- [ ] `npx tsc --noEmit` passes
- [ ] Manual verification (Task 3) approved by user
- [ ] Commit message follows Conventional Commits: `feat(header): wire search redirect + live mobile drawer categories`
</success_criteria>

<output>
After all tasks complete and user approves the checkpoint:

1. Stage and commit:
   ```bash
   node ~/.claude/get-shit-done/bin/gsd-tools.cjs commit "feat(header): wire search redirect + live mobile drawer categories" --files \
     backend-storefront/src/modules/layout/site-header/SiteHeader.tsx \
     backend-storefront/src/modules/layout/site-header/SiteHeaderShell.tsx \
     backend-storefront/src/app/[countryCode]/\(main\)/page.tsx \
     backend-storefront/src/app/[countryCode]/\(main\)/products/\[handle\]/page.tsx \
     backend-storefront/src/app/[countryCode]/\(main\)/categories/\[...category\]/page.tsx \
     backend-storefront/src/app/[countryCode]/\(main\)/search/page.tsx
   ```

2. Create summary at `.planning/quick/260419-tdd-d-header-live-data-search-redirect-mobil/260419-tdd-SUMMARY.md` documenting:
   - What was wired (search redirect, mobile drawer live categories, search page)
   - Files modified + new files
   - Out-of-scope items left for later (desktop cat-nav still hardcoded, search page has no filters/sort/pagination)
   - Commit SHA

3. Update `.planning/STATE.md` Quick Tasks Completed table with this task's row.
</output>
