import { Metadata } from "next"
import { preload } from "react-dom"
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
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Produse la reducere",
  description: "Toate produsele cu reducere activa - preturi reduse real, nu cosmetice.",
  alternates: { canonical: "/promotii" },
  openGraph: { title: "Produse la reducere", url: "/promotii" },
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

type VariantWithCalcPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number | null
    original_amount?: number | null
  } | null
}

function hasRealDiscount(product: HttpTypes.StoreProduct): boolean {
  const hasPriceListDiscount = (product.variants ?? []).some((v) => {
    const cp = (v as VariantWithCalcPrice).calculated_price
    return (
      cp?.original_amount != null &&
      cp.calculated_amount != null &&
      cp.original_amount > cp.calculated_amount
    )
  })
  if (hasPriceListDiscount) return true
  const ribbon = (product.metadata as Record<string, unknown> | null | undefined)?.["ribbon"]
  return typeof ribbon === "string" && ribbon.includes("PROMO")
}

function extractTagSlugs(product: HttpTypes.StoreProduct, prefix: string): string[] {
  return (product.tags ?? [])
    .map((t) => t.value)
    .filter((v): v is string => typeof v === "string" && v.startsWith(`${prefix}:`))
    .map((v) => v.slice(prefix.length + 1))
}

export default async function PromotiiPage({ params }: Props) {
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

  const discountedProducts = allProducts.filter(hasRealDiscount)

  const filterGroups = productsToFilterGroups(discountedProducts)

  const items: CatalogItem[] = discountedProducts.map((p) => {
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

  // LCP: primele imagini din grila sunt randate client-side (CatalogClient),
  // deci browserul le-ar descoperi abia dupa hidratare; preload-ul din server
  // le porneste imediat (incident LCP 5,6s - resource load delay 3,8s).
  for (const { card } of items.slice(0, 4)) {
    if (card.image) preload(card.image, { as: "image", fetchPriority: "high" })
  }

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} drawerId="mDrawer" drawerClosedAttr />

      <main className="page-inner">
        <Breadcrumb
          items={[{ label: "Acasa", href: `/${countryCode}` }]}
          current="Promotii"
        />

        <CategoryHero
          title="Produse la reducere"
          description={
            discountedProducts.length > 0
              ? `${discountedProducts.length} ${discountedProducts.length === 1 ? "produs" : "produse"} cu reducere activa`
              : "Momentan nu exista produse la reducere."
          }
        />

        {discountedProducts.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--fg-muted)" }}>
            Nu exista produse la reducere momentan.
          </div>
        ) : (
          <Suspense fallback={<div style={{ minHeight: 400 }} />}>
            <CatalogClient
              items={items}
              filterGroups={filterGroups as any}
              helpCard={HELP_CARD}
              baseUrl="/promotii"
              countryCode={countryCode}
              sortOptions={SORT_OPTIONS}
              perPageOptions={VALID_PAGE_SIZES}
              defaultPerPage={DEFAULT_PAGE_SIZE}
            />
          </Suspense>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
