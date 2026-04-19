import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'
import { SectionHead } from '@modules/@shared/components/section-head'
import { Hero } from '@modules/sections/hero'
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

export default async function HomePage({ params }: Props) {
  const { countryCode } = await params

  const [categories, allProductsResult] = await Promise.all([
    listCategories().catch(() => [] as HttpTypes.StoreProductCategory[]),
    listProducts({
      pageParam: 1,
      queryParams: {
        limit: 100,
        fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images',
      },
      countryCode,
    }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null })),
  ])

  const allProducts = allProductsResult.response.products

  const promoProducts = allProducts
    .filter((p) => (p.tags ?? []).some((t) => t.value === 'promo:30'))
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
      href: `/${countryCode}/categories/${cat.handle}`,
      image: CAT_IMAGE_MAP[cat.handle ?? ''] ?? '/design-temp/cat-echipamente.webp',
      imageAlt: cat.name ?? '',
      label: cat.name ?? '',
      count: (cat as any).products?.length ?? 0,
    }))

  return (
    <>
      <SiteHeaderShell countryCode={countryCode} />

      <main className="page-inner">

        {/* HERO -- promotional content, static until CMS is available */}
        <Hero
          kicker="Promo luna aprilie · până pe 30"
          title={<>Mastici Tenax<br />la <span style={{color:"var(--brand-400)"}}>-30%</span> reducere</>}
          description="Toată gama de mastici poliesterici și epoxidici Tenax la -30%. Stoc complet în Cluj, livrare 24-48h în toată țara."
          primaryCta={{ label: "Vezi promoția", href: `/${countryCode}/categories/mastici-tenax` }}
          ghostCta={{ label: "Toate produsele →", href: `/${countryCode}/categories/solutii-pentru-piatra`, style: {color:"#fff",borderColor:"var(--stone-700)"} }}
          stats={[
            { value: "480+", label: "SKU în stoc" },
            { value: "7", label: "furnizori autorizați" },
            { value: "24h", label: "livrare Cluj" },
          ]}
          sideCards={[
            { kicker: "Nou · Sait Abrazivi", title: "Pad-uri Velcro 7 gradații", description: "Set complet pentru polish granit de la grit 50 la 3000.", image: "/design-temp/hero-paduri.jpg", imageAlt: "Pad-uri Velcro", ctaLabel: "Descoperă setul →", ctaHref: `/${countryCode}/categories/slefuire-piatra` },
            { kicker: "Ghid tehnic", title: "Cum alegi discul corect", description: "Granit dur vs. marmura vs. beton armat -- cheatsheet PDF.", image: "/design-temp/hero-ghid.jpg", imageAlt: "Ghid discuri", ctaLabel: "Toate discurile →", ctaHref: `/${countryCode}/categories/discuri-de-taiere` },
          ]}
        />

        {/* Quick categories -- real Medusa categories, ordered by admin rank */}
        <QuickCategories items={quickCatItems} />

        {/* Pachete Promoționale -- separate section */}
        {pacheteProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow="Pachete Promoționale"
              title="Seturi complete"
              seeAllHref={`/${countryCode}/categories/pachete-promotionale`}
              seeAllLabel="Vezi toate pachetele →"
            />
            <ProductGrid
              variant="mini"
              products={pacheteProducts.map((p) => productToCard(p, countryCode))}
            />
          </>
        )}

        {/* Promo products -- real data with promo:30 tag */}
        {promoProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow={`Promoții active · ${promoProducts.length} produse`}
              title="La reducere"
              seeAllHref={`/${countryCode}/categories/mastici-tenax`}
              seeAllLabel="Toate promoțiile →"
            />
            <ProductGrid
              variant="mini"
              products={promoProducts.map((p) => productToCard(p, countryCode))}
            />
          </>
        )}

        {/* Trust banner */}
        <TrustBanner variant="banner" items={[
          { icon: <TruckIcon fill="none" strokeLinecap="round" />, title: "Livrare 24-48h", subtitle: "țara întreagă" },
          { icon: <ReturnIcon fill="none" strokeLinecap="round" />, title: "14 zile retur", subtitle: "fără întrebări" },
          { icon: <SecureIcon fill="none" strokeLinecap="round" />, title: "Distribuitor autorizat", subtitle: "Tenax · Sait · Delta" },
          { icon: <SupportIcon fill="none" strokeLinecap="round" />, title: "Suport tehnic", subtitle: "L-V 08-17 · RO" },
        ]} />

        {/* Supplier strip */}
        <SupplierStrip
          heading="Distribuitor autorizat pentru"
          allHref="#"
          allLabel="Vezi toți partenerii →"
          suppliers={[
            { href: "#", image: "/design-temp/dist-tenax.png", imageAlt: "Tenax", sub: "Italia · 1960" },
            { href: "#", image: "/design-temp/dist-sait.png", imageAlt: "Sait", sub: "Italia · 1953" },
            { href: "#", image: "/design-temp/dist-woosuk.png", imageAlt: "Woosuk", sub: "Korea" },
            { href: "#", image: "/design-temp/dist-diatex.png", imageAlt: "Diatex", sub: "Franța" },
            { href: "#", image: "/design-temp/dist-fox.png", imageAlt: "Fox Ironstone", sub: "Italia" },
            { href: "#", image: "/design-temp/dist-vbt.png", imageAlt: "VBT", sub: "Italia" },
            { href: "#", image: "/design-temp/dist-delta.png", imageAlt: "Delta Research", sub: "Cluj-Napoca" },
          ]}
        />

        {/* New arrivals -- newest products by created_at */}
        {newProducts.length > 0 && (
          <>
            <SectionHead
              eyebrow="Recent adăugate"
              title="Produse noi în stoc"
              seeAllHref={`/${countryCode}/categories/diverse`}
              seeAllLabel="Toate produsele →"
            />
            <ProductGrid
              variant="mini"
              products={newProducts.map((p) => productToCard(p, countryCode))}
            />
          </>
        )}

        <div style={{height:"48px"}}></div>
      </main>

      <SiteFooter />
    </>
  )
}
