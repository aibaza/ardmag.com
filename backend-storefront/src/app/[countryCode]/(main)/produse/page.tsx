import { Metadata } from "next"
import { Suspense } from "react"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { CategoryHero } from "@modules/category/category-hero"
import { CategoryToolbar } from "@modules/category/category-toolbar"
import { CategoryLayoutClient } from "@modules/category/category-layout-client"
import { InfiniteProductGrid } from "@modules/products/infinite-product-grid/InfiniteProductGrid"
import { listProducts } from "@lib/data/products"
import { productsToFilterGroups } from "@lib/util/adapters/products-to-filter-groups"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { sortProducts, SortOptions } from "@lib/util/sort-products"
import { getProductMinPrice } from "@lib/util/adapters/format-price"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Toate produsele",
  description: "Catalogul complet ardmag - scule si consumabile pentru prelucrarea pietrei naturale.",
  alternates: { canonical: "/produse" },
  openGraph: { title: "Toate produsele", url: "/produse" },
}

const VALID_PAGE_SIZES = [20, 40, 60]
const DEFAULT_PAGE_SIZE = 20
const SORT_OPTIONS = ["Relevanță", "Preț ascendent", "Preț descendent", "Cele mai noi"]
const SORT_MAP: Record<string, SortOptions> = {
  "Preț ascendent": "price_asc",
  "Preț descendent": "price_desc",
  "Cele mai noi": "created_at",
}

const HELP_CARD = {
  label: "Ai nevoie de ajutor?",
  description: "Suntem disponibili L-V 08:00-16:00",
  phone: "+40 722 155 441",
  hours: "L-V 08-16",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}


export default async function ProdusePage({ params, searchParams }: Props) {
  const [{ countryCode }, sp] = await Promise.all([params, searchParams])

  const sortLabel = (sp.sortBy as string | undefined) ?? "Relevanță"
  const perPageParam = parseInt((sp.perPage as string) ?? "", 10)
  const perPage = VALID_PAGE_SIZES.includes(perPageParam) ? perPageParam : DEFAULT_PAGE_SIZE
  const activeBrands = (sp.brand as string | undefined)?.split(",").filter(Boolean) ?? []
  const activeMaterials = (sp.material as string | undefined)?.split(",").filter(Boolean) ?? []
  const activePriceMin = parseInt((sp.priceMin as string) ?? "", 10)
  const activePriceMax = parseInt((sp.priceMax as string) ?? "", 10)

  const { response: { products: allProducts } } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: 200,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images,+categories",
    },
    countryCode,
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[], count: 0 }, nextPage: null }))

  let filteredProducts = allProducts
  if (activeBrands.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      (p.tags ?? []).some((t) => activeBrands.some((b) => t.value === `brand:${b}`))
    )
  }
  if (activeMaterials.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      (p.tags ?? []).some((t) => activeMaterials.some((m) => t.value === `material:${m}`))
    )
  }
  if (!isNaN(activePriceMin) || !isNaN(activePriceMax)) {
    filteredProducts = filteredProducts.filter((p) => {
      const price = getProductMinPrice(p)
      if (price === null) return false
      const priceRON = price / 100
      if (!isNaN(activePriceMin) && priceRON < activePriceMin) return false
      if (!isNaN(activePriceMax) && priceRON > activePriceMax) return false
      return true
    })
  }

  const sortBy = SORT_MAP[sortLabel]
  const sortedProducts = sortBy ? sortProducts(filteredProducts, sortBy) : filteredProducts

  const totalFiltered = sortedProducts.length

  const filterGroups = productsToFilterGroups(allProducts, {
    brands: activeBrands,
    materials: activeMaterials,
  })
  const productCards = sortedProducts.map((p) => productToCard(p, countryCode))

  const baseUrl = `/produse`

  const activeFilters: Array<{ label: string; paramKey: "brand" | "material" | "price"; value?: string }> = []
  for (const b of activeBrands) {
    const brandGroup = filterGroups.find((g) => g.type === "checkboxes" && g.paramKey === "brand")
    const displayLabel = (brandGroup?.type === "checkboxes" && brandGroup.options.find((o) => o.value === b)?.label) || b
    activeFilters.push({ label: displayLabel, paramKey: "brand", value: b })
  }
  for (const m of activeMaterials) {
    const materialGroup = filterGroups.find((g) => g.type === "checkboxes" && g.paramKey === "material")
    const displayLabel = (materialGroup?.type === "checkboxes" && materialGroup.options.find((o) => o.value === m)?.label) || m
    activeFilters.push({ label: displayLabel, paramKey: "material", value: m })
  }
  if (!isNaN(activePriceMin) || !isNaN(activePriceMax)) {
    const minStr = !isNaN(activePriceMin) ? String(activePriceMin) : "-"
    const maxStr = !isNaN(activePriceMax) ? String(activePriceMax) : "-"
    activeFilters.push({ label: `Pret ${minStr}-${maxStr} RON`, paramKey: "price" })
  }

  const filterActiveCount = activeBrands.length + activeMaterials.length + (!isNaN(activePriceMin) || !isNaN(activePriceMax) ? 1 : 0)

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="mDrawer" drawerClosedAttr />

      <main className="page-inner">
        <Breadcrumb
          items={[{ label: "Acasa", href: `/${countryCode}` }]}
          current="Toate produsele"
        />

        <CategoryHero
          title="Toate produsele"
          description={`${allProducts.length} ${allProducts.length === 1 ? "produs" : "produse"} in catalog`}
        />

        <h2 className="sr-only">Catalog produse</h2>

        <CategoryLayoutClient
          filterGroups={filterGroups}
          applyCount={filterActiveCount}
          helpCard={HELP_CARD}
          baseUrl={baseUrl}
          activeCount={filterActiveCount}
          sortOptions={SORT_OPTIONS}
          currentSort={sortLabel}
          activeFilters={activeFilters}
        >
          <Suspense fallback={<div className="cat-toolbar" />}>
            <CategoryToolbar
              count={totalFiltered}
              sortOptions={SORT_OPTIONS}
              perPageOptions={VALID_PAGE_SIZES}
              baseUrl={baseUrl}
              currentSort={sortLabel}
              currentPerPage={perPage}
            />
          </Suspense>
          {sortedProducts.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
              Niciun produs nu corespunde filtrelor selectate.
            </div>
          ) : (
            <InfiniteProductGrid allFiltered={productCards} countryCode={countryCode} />
          )}
        </CategoryLayoutClient>
      </main>

      <SiteFooter />
    </>
  )
}
