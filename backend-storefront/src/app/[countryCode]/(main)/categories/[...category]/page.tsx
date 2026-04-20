import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { SiteHeaderShell } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { CategoryHero } from '@modules/category/category-hero'
import { CategoryToolbar } from '@modules/category/category-toolbar'
import { CategoryLayoutClient } from '@modules/category/category-layout-client'
import { InfiniteProductGrid } from '@modules/products/infinite-product-grid/InfiniteProductGrid'
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { categoryToHero } from "@lib/util/adapters/category-to-hero"
import { productsToFilterGroups } from "@lib/util/adapters/products-to-filter-groups"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { sortProducts, SortOptions } from "@lib/util/sort-products"
import { getProductMinPrice } from "@lib/util/adapters/format-price"
import { HttpTypes, StoreRegion } from "@medusajs/types"

const VALID_PAGE_SIZES = [20, 40, 60]
const DEFAULT_PAGE_SIZE = 20
const SORT_OPTIONS = ["Relevanță", "Preț ascendent", "Preț descendent", "Cele mai noi"]
const SORT_MAP: Record<string, SortOptions> = {
  "Preț ascendent": "price_asc",
  "Preț descendent": "price_desc",
  "Cele mai noi": "created_at",
}

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  const [categories, regions] = await Promise.all([
    listCategories().catch(() => [] as HttpTypes.StoreProductCategory[]),
    listRegions().catch(() => [] as StoreRegion[]),
  ])

  const countryCodes = regions.flatMap((r) => (r.countries ?? []).map((c) => c.iso_2).filter(Boolean))
  return categories.flatMap((cat) =>
    countryCodes.map((cc) => ({ countryCode: cc, category: [cat.handle ?? cat.name] }))
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const category = await getCategoryByHandle(params.category)
    if (!category) return {}
    const canonical = `/${params.countryCode}/categories/${params.category.join("/")}`
    return {
      title: category.name,
      description: category.description ?? `${category.name} - scule si consumabile pentru prelucrarea pietrei`,
      alternates: { canonical },
      openGraph: { title: category.name, url: canonical },
    }
  } catch {
    return {}
  }
}

const HELP_CARD = {
  label: "Ai nevoie de ajutor?",
  description: "Suntem disponibili L-V 08:00-17:00",
  phone: "+40 722 155 441",
  hours: "L-V 08-17",
}


export default async function CategoryPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  const { category: categoryHandle, countryCode } = params

  const sortLabel = (searchParams.sortBy as string | undefined) ?? "Relevanță"
  const perPageParam = parseInt((searchParams.perPage as string) ?? "", 10)
  const perPage = VALID_PAGE_SIZES.includes(perPageParam) ? perPageParam : DEFAULT_PAGE_SIZE
  const activeBrands = (searchParams.brand as string | undefined)?.split(",").filter(Boolean) ?? []
  const activeMaterials = (searchParams.material as string | undefined)?.split(",").filter(Boolean) ?? []
  const activePriceMin = parseInt((searchParams.priceMin as string) ?? "", 10)
  const activePriceMax = parseInt((searchParams.priceMax as string) ?? "", 10)

  const productCategory = await getCategoryByHandle(categoryHandle).catch(() => null)
  if (!productCategory) notFound()

  const { response: { products: allCategoryProducts } } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: 200,
      category_id: [productCategory.id],
      fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images',
    },
    countryCode,
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[], count: 0 }, nextPage: null }))

  // Apply filters
  let filteredProducts = allCategoryProducts
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

  // Apply sort
  const sortBy = SORT_MAP[sortLabel]
  const sortedProducts = sortBy ? sortProducts(filteredProducts, sortBy) : filteredProducts

  const totalFiltered = sortedProducts.length

  // Build adaptor outputs
  const filterGroups = productsToFilterGroups(allCategoryProducts, {
    brands: activeBrands,
    materials: activeMaterials,
  })
  const heroProps = categoryToHero(productCategory, allCategoryProducts)
  const productCards = sortedProducts.map((p) => productToCard(p, countryCode))

  const baseUrl = `/${countryCode}/categories/${categoryHandle.join("/")}`
  const breadcrumbItems = [{ label: "Acasa", href: `/${countryCode}` }]
  const breadcrumbCurrent = productCategory.name ?? categoryHandle[categoryHandle.length - 1]

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
      <SiteHeaderShell
        countryCode={countryCode}
        drawerId="mDrawer"
        drawerClosedAttr
      />

      <main className="page-inner">
        <Breadcrumb items={breadcrumbItems} current={breadcrumbCurrent} meta={heroProps.meta} />
        <CategoryHero title={heroProps.title} description={heroProps.description} />
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
