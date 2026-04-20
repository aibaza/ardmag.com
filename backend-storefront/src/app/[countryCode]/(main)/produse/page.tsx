import { Metadata } from "next"
import { Suspense } from "react"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { CategoryHero } from "@modules/category/category-hero"
import { CategoryToolbar } from "@modules/category/category-toolbar"
import { CategoryLayoutClient } from "@modules/category/category-layout-client"
import { ProductGrid } from "@modules/products/product-grid"
import { Pagination } from "@modules/category/pagination"
import { listProducts } from "@lib/data/products"
import { productsToFilterGroups } from "@lib/util/adapters/products-to-filter-groups"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { sortProducts, SortOptions } from "@lib/util/sort-products"
import { getProductMinPrice } from "@lib/util/adapters/format-price"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Toate produsele | ardmag.com",
  description: "Catalogul complet ardmag - scule si consumabile pentru prelucrarea pietrei naturale.",
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
  description: "Suntem disponibili L-V 08:00-17:00",
  phone: "+40 722 155 441",
  hours: "L-V 08-17",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildPageUrl(base: string, page: number, existingParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(existingParams)) {
    if (key === "page") continue
    if (typeof value === "string" && value) params.set(key, value)
  }
  params.set("page", String(page))
  return `${base}?${params.toString()}`
}

function buildPaginationPages(
  currentPage: number,
  totalPages: number,
  baseUrl: string,
  existingParams: Record<string, string | string[] | undefined> = {}
): Array<{ label: string; href: string; active?: boolean }> {
  const pages: Array<{ label: string; href: string; active?: boolean }> = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push({ label: String(i), href: buildPageUrl(baseUrl, i, existingParams), active: i === currentPage })
    } else if (pages[pages.length - 1]?.label !== "…") {
      pages.push({ label: "…", href: "#" })
    }
  }
  return pages
}

export default async function ProdusePage({ params, searchParams }: Props) {
  const [{ countryCode }, sp] = await Promise.all([params, searchParams])

  const sortLabel = (sp.sortBy as string | undefined) ?? "Relevanță"
  const currentPage = parseInt((sp.page as string) ?? "1", 10) || 1
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
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage))
  const offset = (currentPage - 1) * perPage
  const pageProducts = sortedProducts.slice(offset, offset + perPage)

  const filterGroups = productsToFilterGroups(allProducts, {
    brands: activeBrands,
    materials: activeMaterials,
  })
  const productCards = pageProducts.map((p) => productToCard(p, countryCode))

  const baseUrl = `/${countryCode}/produse`
  const paginationPages = buildPaginationPages(currentPage, totalPages, baseUrl, sp as Record<string, string | string[] | undefined>)
  const prevHref = currentPage > 1 ? buildPageUrl(baseUrl, currentPage - 1, sp as Record<string, string | string[] | undefined>) : "#"
  const nextHref = currentPage < totalPages ? buildPageUrl(baseUrl, currentPage + 1, sp as Record<string, string | string[] | undefined>) : "#"

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
          {pageProducts.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
              Niciun produs nu corespunde filtrelor selectate.
            </div>
          ) : (
            <ProductGrid variant="cat" products={productCards} countryCode={countryCode} />
          )}
          {totalPages > 1 && (
            <Pagination
              prevHref={prevHref}
              nextHref={nextHref}
              pages={paginationPages}
              resultsLabel={`${Math.min(offset + 1, totalFiltered)}-${Math.min(offset + perPage, totalFiltered)} din ${totalFiltered} produse`}
            />
          )}
        </CategoryLayoutClient>
      </main>

      <SiteFooter />
    </>
  )
}
