import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { CategoryHero } from '@modules/category/category-hero'
import { CategoryToolbar } from '@modules/category/category-toolbar'
import { FilterSidebar } from '@modules/category/filter-sidebar'
import { ProductGrid } from '@modules/products/product-grid'
import { Pagination } from '@modules/category/pagination'
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { categoryToHero } from "@lib/util/adapters/category-to-hero"
import { productsToFilterGroups } from "@lib/util/adapters/products-to-filter-groups"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { sortProducts, SortOptions } from "@lib/util/sort-products"
import { HttpTypes, StoreRegion } from "@medusajs/types"

const PAGE_SIZE = 20
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
    return {
      title: `${category.name} | ardmag.com`,
      description: category.description ?? `${category.name} - scule și consumabile pentru prelucrarea pietrei`,
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

function buildPageUrl(base: string, page: number): string {
  return `${base}?page=${page}`
}

function buildPaginationPages(
  currentPage: number,
  totalPages: number,
  baseUrl: string
): Array<{ label: string; href: string; active?: boolean }> {
  const pages: Array<{ label: string; href: string; active?: boolean }> = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - currentPage) <= 1
    ) {
      pages.push({ label: String(i), href: buildPageUrl(baseUrl, i), active: i === currentPage })
    } else if (pages[pages.length - 1]?.label !== '…') {
      pages.push({ label: '…', href: '#' })
    }
  }
  return pages
}

export default async function CategoryPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  const { category: categoryHandle, countryCode } = params

  const sortLabel = (searchParams.sortBy as string | undefined) ?? "Relevanță"
  const currentPage = parseInt((searchParams.page as string) ?? "1", 10) || 1
  const activeBrands = (searchParams.brand as string | undefined)?.split(",").filter(Boolean) ?? []
  const activeMaterials = (searchParams.material as string | undefined)?.split(",").filter(Boolean) ?? []

  const productCategory = await getCategoryByHandle(categoryHandle).catch(() => null)
  if (!productCategory) notFound()

  const { response: { products: allCategoryProducts, count } } = await listProducts({
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

  // Apply sort
  const sortBy = SORT_MAP[sortLabel]
  const sortedProducts = sortBy
    ? sortProducts(filteredProducts, sortBy)
    : filteredProducts

  // Paginate
  const totalFiltered = sortedProducts.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const offset = (currentPage - 1) * PAGE_SIZE
  const pageProducts = sortedProducts.slice(offset, offset + PAGE_SIZE)

  // Build adaptor outputs
  const filterGroups = productsToFilterGroups(allCategoryProducts, {
    brands: activeBrands,
    materials: activeMaterials,
  })
  const heroProps = categoryToHero(productCategory, count)
  const productCards = pageProducts.map((p) => productToCard(p, countryCode))

  const baseUrl = `/${countryCode}/categories/${categoryHandle.join("/")}`
  const paginationPages = buildPaginationPages(currentPage, totalPages, baseUrl)
  const prevHref = currentPage > 1 ? buildPageUrl(baseUrl, currentPage - 1) : "#"
  const nextHref = currentPage < totalPages ? buildPageUrl(baseUrl, currentPage + 1) : "#"

  const breadcrumbItems = [{ label: "Acasă", href: `/${countryCode}` }]
  const breadcrumbCurrent = productCategory.name ?? categoryHandle[categoryHandle.length - 1]

  return (
    <>
      <SiteHeader
        categoriesHref={`/${countryCode}/categories/${categoryHandle[0]}`}
        drawerId="mDrawer"
        drawerClosedAttr
      />

      <main className="page-inner">
        <Breadcrumb items={breadcrumbItems} current={breadcrumbCurrent} />
        <CategoryHero {...heroProps} />
        <CategoryToolbar
          count={totalFiltered}
          sortOptions={SORT_OPTIONS}
          perPageOptions={[20, 40, 60]}
        />

        <div className="cat-layout">
          <FilterSidebar
            groups={filterGroups}
            applyCount={activeBrands.length + activeMaterials.length}
            helpCard={HELP_CARD}
          />
          <div className="cat-products">
            {pageProducts.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
                Niciun produs nu corespunde filtrelor selectate.
              </div>
            ) : (
              <ProductGrid variant="cat" products={productCards} />
            )}
            {totalPages > 1 && (
              <Pagination
                prevHref={prevHref}
                nextHref={nextHref}
                pages={paginationPages}
                resultsLabel={`${Math.min(offset + 1, totalFiltered)}-${Math.min(offset + PAGE_SIZE, totalFiltered)} din ${totalFiltered} produse`}
              />
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
