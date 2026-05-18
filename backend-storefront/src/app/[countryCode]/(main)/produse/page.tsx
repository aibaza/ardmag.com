import { Metadata } from "next"
import { Suspense } from "react"
import { SiteHeaderShell } from "@modules/layout/site-header"
import { SiteFooter } from "@modules/layout/site-footer"
import { Breadcrumb } from "@modules/@shared/components/breadcrumb/Breadcrumb"
import { CategoryHero } from "@modules/category/category-hero"
import { CatalogClient, type CatalogItem } from "@modules/products/catalog-client"
import { listProducts } from "@lib/data/products"
import { productsToFilterGroups } from "@lib/util/adapters/products-to-filter-groups"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { getProductMinPrice } from "@lib/util/adapters/format-price"
import { HttpTypes } from "@medusajs/types"

export const maxDuration = 60
export const revalidate = false

export const metadata: Metadata = {
  title: "Toate produsele",
  description: "Catalogul complet ardmag - scule si consumabile pentru prelucrarea pietrei naturale.",
  alternates: { canonical: "/produse" },
  openGraph: { title: "Toate produsele", url: "/produse" },
}

const VALID_PAGE_SIZES = [20, 40, 60]
const DEFAULT_PAGE_SIZE = 20
const SORT_OPTIONS = ["Relevanță", "Preț ascendent", "Preț descendent", "Cele mai noi"]

const HELP_CARD = {
  label: "Ai nevoie de ajutor?",
  description: "Suntem disponibili L-V 08:00-16:00",
  phone: "+40 722 155 441",
  hours: "L-V 08-16",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

function extractTagSlugs(product: HttpTypes.StoreProduct, prefix: string): string[] {
  return (product.tags ?? [])
    .map((t) => t.value)
    .filter((v): v is string => typeof v === "string" && v.startsWith(`${prefix}:`))
    .map((v) => v.slice(prefix.length + 1))
}

export default async function ProdusePage({ params }: Props) {
  const { countryCode } = await params

  const { response: { products: allProducts } } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: 200,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images,+categories",
    },
    countryCode,
    publicFetch: true,
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[], count: 0 }, nextPage: null }))

  const filterGroups = productsToFilterGroups(allProducts)

  const items: CatalogItem[] = allProducts.map((p) => {
    const minPrice = getProductMinPrice(p)
    return {
      card: productToCard(p, countryCode),
      meta: {
        brandSlugs: extractTagSlugs(p, "brand"),
        materialSlugs: extractTagSlugs(p, "material"),
        minPriceRon: minPrice,
        createdAtMs: p.created_at ? new Date(p.created_at).getTime() : 0,
      },
    }
  })

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

        <Suspense fallback={<div style={{ minHeight: 400 }} />}>
          <CatalogClient
            items={items}
            filterGroups={filterGroups as any}
            helpCard={HELP_CARD}
            baseUrl="/produse"
            countryCode={countryCode}
            sortOptions={SORT_OPTIONS}
            perPageOptions={VALID_PAGE_SIZES}
            defaultPerPage={DEFAULT_PAGE_SIZE}
          />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  )
}
