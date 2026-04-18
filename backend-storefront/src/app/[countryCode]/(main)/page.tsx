import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import PromoBand from "@modules/home/components/promo-band"
import SupplierStrip from "@modules/home/components/supplier-strip"
import ProductCard from "@modules/products/components/product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "ardmag - Scule profesionale pentru piatra naturala",
  description:
    "Distribuitor autorizat Tenax. Discuri diamantate, adezivi, scule de prelucrare piatra naturala. Livrare in 24h din Cluj-Napoca.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [categories, region] = await Promise.all([
    listCategories(),
    getRegion(countryCode),
  ])

  if (!region) return null

  const { response } = await listProducts({
    queryParams: { limit: 8 },
    regionId: region.id,
  })

  const products = response.products

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories ?? []} />
      <PromoBand />

      {/* Featured products */}
      <section style={{ background: "var(--surface)", padding: "48px 0" }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: "var(--fg)" }}>
              Produse noi
            </h2>
            <LocalizedClientLink
              href="/store"
              style={{ fontFamily: "var(--f-mono)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--stone-700)", textDecoration: "none" }}
            >
              Catalog complet
            </LocalizedClientLink>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <SupplierStrip />
    </>
  )
}
