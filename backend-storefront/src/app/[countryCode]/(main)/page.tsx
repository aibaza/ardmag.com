import { Metadata } from "next"
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'
import { SectionHead } from '@modules/@shared/components/section-head'
import { Hero } from '@modules/sections/hero'
import { getHeroFallback } from '@modules/sections/hero/hero-fallback'
import { productToHero } from '@modules/sections/hero/product-to-hero'
import { QuickCategories } from '@modules/sections/quick-categories'
import { SupplierStrip } from '@modules/sections/supplier-strip'
import { ProductGrid } from '@modules/products/product-grid'
import { SiteHeaderShell } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'
import { listCategories } from '@lib/data/categories'
import { listProducts } from '@lib/data/products'
import { productToCard } from '@lib/util/adapters/product-to-card'
import { HttpTypes } from '@medusajs/types'

const CAT_IMAGE_MAP: Record<string, string> = {
  'discuri-de-taiere': '/design-temp/cat-discuri-thumb.webp',
  'slefuire-piatra': '/design-temp/cat-slefuire-thumb.webp',
  'mastici-tenax': '/design-temp/cat-mastici-thumb.webp',
  'solutii-pentru-piatra': '/design-temp/cat-solutii-thumb.webp',
  'diverse': '/design-temp/cat-diverse-thumb.webp',
  'abrazivi-si-perii': '/design-temp/cat-abrazivi-perii-thumb.webp',
  'abrazivi-oala': '/design-temp/cat-abrazivi-oala-thumb.webp',
  'mese-de-taiat': '/design-temp/cat-mese-thumb.webp',
  'pachete-promotionale': '/design-temp/cat-pachete-thumb.webp',
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export const revalidate = 1800

export const metadata: Metadata = {
  title: "ARDMAG — Precizie solida. 25 de ani.",
  description: "Distribuitor autorizat Tenax in Romania. Scule diamantate, mastici, abrazive si consumabile pentru prelucrarea pietrei naturale. Livrare 24-48h in toata tara.",
  alternates: { canonical: "/ro" },
  openGraph: {
    title: "ARDMAG — Precizie solida. 25 de ani.",
    description: "Distribuitor autorizat Tenax in Romania. Scule diamantate, mastici si consumabile pentru ateliere de piatra.",
    url: "/ro",
  },
}

export default async function HomePage({ params }: Props) {
  const { countryCode } = await params

  const [categories, allProductsResult] = await Promise.all([
    listCategories(undefined, { staticCache: true }).catch(() => [] as HttpTypes.StoreProductCategory[]),
    listProducts({
      pageParam: 1,
      queryParams: {
        limit: 100,
        fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images',
      },
      countryCode,
      publicFetch: true,
    }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null })),
  ])

  const allProducts = allProductsResult.response.products

  const featuredProduct = allProducts.find((p) =>
    p.tags?.some((t) => t.value === "featured")
  )
  const heroProps = featuredProduct
    ? productToHero(featuredProduct, countryCode)
    : getHeroFallback(countryCode)

  const promoProducts = allProducts
    .filter((p) =>
      (p.variants ?? []).some((v: any) => {
        const cp = v.calculated_price
        return cp?.original_amount != null && cp.original_amount > cp.calculated_amount
      })
    )
    .slice(0, 8)

  const newProducts = [...allProducts]
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 4)

  // Use admin rank order from API; separate pachete-promotionale
  const pacheteCat = categories.find((c) => c.handle === 'pachete-promotionale')
  const pacheteIds = new Set(((pacheteCat as any)?.products ?? []).map((p: any) => p.id as string))
  const pacheteProducts = allProducts.filter((p) => pacheteIds.has(p.id)).slice(0, 4)

  const quickCatItems = categories
    .filter((c) => c.handle !== 'pachete-promotionale')
    .slice(0, 8)
    .map((cat) => ({
      href: `/categories/${cat.handle}`,
      image: CAT_IMAGE_MAP[cat.handle ?? ''] ?? '/design-temp/cat-echipamente.webp',
      imageAlt: cat.name ?? '',
      label: cat.name ?? '',
      count: (cat as any).products?.length ?? 0,
    }))

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />

      <main className="page-inner">

        {/* HERO -- driven by featured-tagged product; falls back to static copy */}
        <Hero {...heroProps} headingLevel="h1" />

        {/* Quick categories -- real Medusa categories, ordered by admin rank */}
        <QuickCategories items={quickCatItems} />

        {/* Pachete Promoționale -- separate section */}
        {pacheteProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow="Pachete Promoționale"
              title="Seturi complete"
              seeAllHref={`/categories/pachete-promotionale`}
              seeAllLabel="Vezi toate pachetele →"
            />
            <ProductGrid
              variant="mini"
              products={pacheteProducts.map((p) => productToCard(p, countryCode))}
              countryCode={countryCode}
            />
          </>
        )}

        {/* Promo products -- real data with promo:30 tag */}
        {promoProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow={`Promoții active · ${promoProducts.length} produse`}
              title="La reducere"
              seeAllHref={`/promotii`}
              seeAllLabel="Toate promoțiile →"
            />
            <ProductGrid
              variant="mini"
              products={promoProducts.map((p) => productToCard(p, countryCode))}
              countryCode={countryCode}
            />
          </>
        )}

        {/* Trust banner */}
        <TrustBanner variant="banner" items={[
          { icon: <TruckIcon fill="none" strokeLinecap="round" />, title: "Livrare 24-48h", subtitle: "țara întreagă" },
          { icon: <ReturnIcon fill="none" strokeLinecap="round" />, title: "14 zile retur", subtitle: "fără întrebări" },
          { icon: <SecureIcon fill="none" strokeLinecap="round" />, title: "Distribuitor autorizat", subtitle: "Tenax · Sait · Delta" },
          { icon: <SupportIcon fill="none" strokeLinecap="round" />, title: "Suport tehnic", subtitle: "L-V 08-16 · RO" },
        ]} />

        {/* Supplier strip */}
        <SupplierStrip
          heading="Distribuitor autorizat pentru"
          allHref="/produse"
          allLabel="Vezi toți partenerii →"
          suppliers={[
            { href: "/produse?brand=tenax", image: "/design-temp/dist-tenax.webp", imageAlt: "Tenax", sub: "Italia · 1960" },
            { href: "/produse?brand=sait", image: "/design-temp/dist-sait.webp", imageAlt: "Sait", sub: "Italia · 1953" },
            { href: "/produse?brand=woosuk", image: "/design-temp/dist-woosuk.webp", imageAlt: "Woosuk", sub: "Korea" },
            { href: "/produse?brand=diatex", image: "/design-temp/dist-diatex.webp", imageAlt: "Diatex", sub: "Franța" },
            { href: "/produse?brand=fox-ironstone", image: "/design-temp/dist-fox.webp", imageAlt: "Fox Ironstone", sub: "Italia" },
            { href: "/produse?brand=vbt", image: "/design-temp/dist-vbt.webp", imageAlt: "VBT", sub: "Italia" },
            { href: "/produse?brand=delta-research", image: "/design-temp/dist-delta.webp", imageAlt: "Delta Research", sub: "Cluj-Napoca" },
          ]}
        />

        {/* New arrivals -- newest products by created_at */}
        {newProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow="Recent adăugate"
              title="Produse noi în stoc"
              seeAllHref={`/categories/diverse`}
              seeAllLabel="Toate produsele →"
            />
            <ProductGrid
              variant="mini"
              products={newProducts.map((p) => productToCard(p, countryCode))}
              countryCode={countryCode}
            />
          </>
        )}

        <div style={{height:"48px"}}></div>
      </main>

      <SiteFooter />
    </>
  )
}
