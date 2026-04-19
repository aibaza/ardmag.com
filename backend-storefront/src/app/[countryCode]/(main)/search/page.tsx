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
            {query
              ? `${count} ${count === 1 ? 'produs gasit' : 'produse gasite'}`
              : "Foloseste bara de cautare din header."}
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
