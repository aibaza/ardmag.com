import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeaderShell } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { PDPGallery } from '@modules/product-detail/pdp-gallery'
import { PDPSummary } from '@modules/product-detail/pdp-summary'
import { PDPTabs } from '@modules/product-detail/pdp-tabs'
import { TruckIcon, ReturnIcon, SecureIcon } from '@modules/@shared/icons/TrustIcons'
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { productToPdpGallery } from "@lib/util/adapters/product-to-pdp-gallery"
import { productToPdpVariantSelector } from "@lib/util/adapters/product-to-pdp-variant-selector"
import { productToPdpPriceCard } from "@lib/util/adapters/product-to-pdp-price-card"
import { productToCard } from "@lib/util/adapters/product-to-card"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const regions = await listRegions().catch(() => [] as HttpTypes.StoreRegion[])
    const countryCodes = regions.flatMap((r) => (r.countries ?? []).map((c) => c.iso_2).filter(Boolean))

    const { response } = await listProducts({
      countryCode: countryCodes[0] ?? "ro",
      queryParams: { limit: 100, fields: "handle" },
    }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[] } }))

    return countryCodes.flatMap((cc) =>
      response.products
        .filter((p) => p.handle)
        .map((p) => ({ countryCode: cc, handle: p.handle }))
    )
  } catch {
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const { response } = await listProducts({
      countryCode: params.countryCode,
      queryParams: {
        handle: params.handle,
        fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images',
      },
    })
    const product = response.products[0]
    if (!product) return {}
    return {
      title: `${product.title} | ardmag.com`,
      description: product.description?.replace(/<[^>]+>/g, '').slice(0, 160) ?? product.title ?? '',
      openGraph: {
        title: `${product.title} | ardmag.com`,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  } catch {
    return {}
  }
}

const PDP_PERKS = [
  { icon: <TruckIcon fill="none" strokeLinecap="round" style={{width:16,height:16}} />, label: "Livrare 24-48h", sub: "toata tara" },
  { icon: <ReturnIcon fill="none" strokeLinecap="round" style={{width:16,height:16}} />, label: "14 zile retur", sub: "fara intrebari" },
  { icon: <SecureIcon fill="none" strokeLinecap="round" style={{width:16,height:16}} />, label: "Distribuitor autorizat", sub: "Tenax · Sait · Delta" },
]

function getStockLabel(product: HttpTypes.StoreProduct): { label: string; location: string } {
  const variants = product.variants ?? []
  const hasTracked = variants.some((v) => v.manage_inventory === true)
  if (!hasTracked) return { label: "Disponibil", location: "Cluj-Napoca" }

  const inStock = variants.some((v) => (v.inventory_quantity ?? 0) > 0)
  if (inStock) return { label: "In stoc", location: "Cluj-Napoca" }
  return { label: "Stoc epuizat", location: "" }
}

function extractBrand(product: HttpTypes.StoreProduct): { brand: string; brandHref: string } {
  const brandTag = (product.tags ?? []).find((t) => t.value?.startsWith("brand:"))
  if (!brandTag) return { brand: "", brandHref: "#" }
  const slug = brandTag.value.replace("brand:", "")
  const label = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  return { brand: label, brandHref: `/search?brand=${slug}` }
}

export default async function ProductPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  const { countryCode, handle } = params
  const selectedVariantId = searchParams.v_id

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      handle,
      fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images,+categories',
    },
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[] } }))

  const product = response.products[0]
  if (!product) notFound()

  // Pick selected variant or first variant
  const variants = product.variants ?? []
  const selectedVariant = selectedVariantId
    ? variants.find((v) => v.id === selectedVariantId) ?? variants[0]
    : variants[0]

  const galleryProps = productToPdpGallery(product)
  const variantGroups = productToPdpVariantSelector(product, selectedVariant?.id)
  const priceCardProps = selectedVariant
    ? productToPdpPriceCard(selectedVariant as HttpTypes.StoreProductVariant, product)
    : { price: "Pret la cerere" }

  const { brand, brandHref } = extractBrand(product)
  const { label: stockLabel, location: stockLocation } = getStockLabel(product)

  const categoryName = (product.categories ?? [])[0]?.name ?? "Categorie"
  const categoryHandle = (product.categories ?? [])[0]?.handle ?? ""
  const breadcrumbItems = [
    { label: "Acasă", href: `/${countryCode}` },
    { label: categoryName, href: `/${countryCode}/categories/${categoryHandle}` },
  ]

  const description = product.description ?? ""

  const firstVariant = variants[0] ?? { sku: null, ean: null }

  return (
    <>
      <SiteHeaderShell
        countryCode={countryCode}
        categoriesHref={`/${countryCode}/categories/${categoryHandle}`}
        drawerId="mDrawer"
        drawerClosedAttr
      />

      <main className="page-inner">
        <Breadcrumb items={breadcrumbItems} current={product.title ?? handle} />

        <section className="pdp">
          <PDPGallery {...galleryProps} />

          <PDPSummary
            brand={brand}
            brandHref={brandHref}
            title={product.title ?? ""}
            sku={(firstVariant as any).sku ?? ""}
            ean={(firstVariant as any).ean ?? ""}
            rating={{ score: 0, reviewCount: 0 }}
            {...priceCardProps}
            variantGroups={variantGroups}
            stockLabel={stockLabel}
            stockLocation={stockLocation}
            addToCartLabel="Adaugă în coș"
            variantId={selectedVariant?.id ?? null}
            countryCode={countryCode}
            perks={PDP_PERKS}
          />
        </section>

        {description && (
          <PDPTabs
            tabs={[
              { label: "Descriere", active: true },
              { label: "Specificații" },
              { label: "Livrare și garanție" },
            ]}
          >
            <div
              className="pdp-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </PDPTabs>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
