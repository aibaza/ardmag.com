"use client"

import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'
import { SectionHead } from '@modules/@shared/components/section-head'
import { Hero } from '@modules/sections/hero'
import { QuickCategories } from '@modules/sections/quick-categories'
import { SupplierStrip } from '@modules/sections/supplier-strip'
import { ProductGrid } from '@modules/products/product-grid'
import { SiteHeader } from '@modules/layout/site-header'
import { SiteFooter } from '@modules/layout/site-footer'

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="page-inner">

        {/* HERO */}
        <Hero
          kicker="Promo luna aprilie · până pe 30"
          title={<>Discuri diamantate<br />Delta Turbo — până la <span style={{color:"var(--brand-400)"}}>−20%</span></>}
          description="Toate variantele pentru granit + beton armat la Ø115–230 mm. Stoc complet în Cluj, livrare 24–48h în toată țara."
          primaryCta={{ label: "Vezi promoția", href: "#" }}
          ghostCta={{ label: "Toate discurile →", href: "#", style: {color:"#fff",borderColor:"var(--stone-700)"} }}
          stats={[
            { value: "480+", label: "SKU în stoc" },
            { value: "7", label: "furnizori autorizați" },
            { value: "24h", label: "livrare Cluj" },
          ]}
          sideCards={[
            { kicker: "Nou · Sait Abrazivi", title: "Pad-uri Velcro 7 gradații", description: "Set complet pentru polish granit de la grit 50 la 3000.", image: "/design-temp/hero-paduri.jpg", imageAlt: "Pad-uri Velcro", ctaLabel: "Descoperă setul →", ctaHref: "#" },
            { kicker: "Ghid tehnic", title: "Cum alegi discul corect", description: "Granit dur vs. marmură vs. beton armat — cheatsheet PDF.", image: "/design-temp/hero-ghid.jpg", imageAlt: "Ghid discuri", ctaLabel: "Descarcă ghid →", ctaHref: "#" },
          ]}
        />

        {/* Quick categories */}
        <QuickCategories items={[
          { href: "/ro/design-preview/category", image: "/design-temp/cat-discuri.webp", imageAlt: "Discuri", label: "Discuri", count: 142 },
          { href: "/ro/design-preview/category", image: "/design-temp/cat-freze.jpg", imageAlt: "Freze", label: "Freze", count: 87 },
          { href: "/ro/design-preview/category", image: "/design-temp/cat-paduri.webp", imageAlt: "Pad-uri", label: "Pad-uri", count: 56 },
          { href: "/ro/design-preview/category", image: "/design-temp/cat-mastici.webp", imageAlt: "Mastici", label: "Mastici", count: 38 },
          { href: "/ro/design-preview/category", image: "/design-temp/cat-tratamente.webp", imageAlt: "Tratamente", label: "Tratamente", count: 24 },
          { href: "/ro/design-preview/category", image: "/design-temp/cat-echipamente.webp", imageAlt: "Echipamente", label: "Echipamente", count: 19 },
        ]} />

        {/* Promo products */}
        <SectionHead eyebrow="Promoții active · 12 produse" title="La reducere săptămâna aceasta" seeAllHref="#" seeAllLabel="Toate promoțiile →" />

        <ProductGrid variant="mini" products={[
          { id: "DLT-115-TX-ULTRA", title: "Disc diamantat Delta Turbo Ultra Ø115", sku: "DLT-115-TX-ULTRA", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat Delta Turbo Ultra Ø115", href: "/ro/design-preview/product", price: { now: "38,40 RON", was: "48,00 RON" }, badges: [{ type: "promo", label: "−20%" }] },
          { id: "TNX-F8-250", title: "Freză profil F8 Ø250 marmură", sku: "TNX-F8-250", brand: "Tenax", brandHref: "/ro/design-preview/category", image: "/design-temp/p-freza-f8-250.jpg", imageAlt: "Freză profil F8 Ø250 marmură", href: "/ro/design-preview/product", price: { now: "1.258,00 RON", was: "1.480,00 RON" }, badges: [{ type: "promo", label: "−15%" }] },
          { id: "DLT-180-TX", title: "Disc diamantat Turbo Ø180 filet 22.23", sku: "DLT-180-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø180 filet 22.23", href: "/ro/design-preview/product", price: { now: "113,60 RON", was: "142,00 RON" }, badges: [{ type: "promo", label: "−20%" }, { type: "stock-low", label: "4 buc", dotVariant: true }] },
          { id: "TNX-MP-1000-TR", title: "Mastice poliester transparent 1 kg", sku: "TNX-MP-1000-TR", brand: "Tenax", brandHref: "/ro/design-preview/category", image: "/design-temp/p-mastic-1kg.jpg", imageAlt: "Mastice poliester transparent 1 kg", href: "/ro/design-preview/product", price: { now: "282,00 RON", was: "376,00 RON" }, badges: [{ type: "promo", label: "Pachet 3+1" }] },
        ]} />

        {/* Trust banner */}
        <TrustBanner variant="banner" items={[
          { icon: <TruckIcon fill="none" strokeLinecap="round" />, title: "Livrare 24–48h", subtitle: "țara întreagă" },
          { icon: <ReturnIcon fill="none" strokeLinecap="round" />, title: "14 zile retur", subtitle: "fără întrebări" },
          { icon: <SecureIcon fill="none" strokeLinecap="round" />, title: "Distribuitor autorizat", subtitle: "Tenax · Sait · Delta" },
          { icon: <SupportIcon fill="none" strokeLinecap="round" />, title: "Suport tehnic", subtitle: "L–V 08–17 · RO" },
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

        {/* New arrivals */}
        <SectionHead eyebrow="Nou intrat · ultimele 30 zile" title="Produse noi în stoc" seeAllHref="#" seeAllLabel="Toate noutățile →" />

        <ProductGrid variant="mini" products={[
          { id: "SAT-4A-VEL-SET", title: "Pad abraziv Velcro — 7 gradații set", sku: "SAT-4A-VEL-SET", brand: "Sait Abrazivi", brandHref: "/ro/design-preview/category", image: "/design-temp/p-pad-velcro-set.jpg", imageAlt: "Pad abraziv Velcro — 7 gradații set", href: "/ro/design-preview/product", price: { now: "168,00 RON" }, badges: [{ type: "new", label: "Nou" }] },
          { id: "TNX-F20-200", title: "Freză profil F20 Ø200 granit", sku: "TNX-F20-200", brand: "Tenax", brandHref: "/ro/design-preview/category", image: "/design-temp/p-freza-f20-200.jpg", imageAlt: "Freză profil F20 Ø200 granit", href: "/ro/design-preview/product", price: { now: "1.890,00 RON" }, badges: [{ type: "new", label: "Nou" }] },
          { id: "DLT-ECO-1000", title: "Impermeabilizant granit / marmură 1L", sku: "DLT-ECO-1000", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-impermeabilizant.jpg", imageAlt: "Impermeabilizant granit / marmură 1L", href: "/ro/design-preview/product", price: { now: "142,00 RON" }, badges: [{ type: "new", label: "Nou" }] },
          { id: "WSK-7-M14", title: "Freză cupă M14 · 7 cupe", sku: "WSK-7-M14", brand: "Woosuk", brandHref: "/ro/design-preview/category", image: "/design-temp/p-freza-cupa-m14.jpg", imageAlt: "Freză cupă M14 · 7 cupe", href: "/ro/design-preview/product", price: { now: "310,00 RON" }, badges: [{ type: "new", label: "Nou" }] },
        ]} />

        <div style={{height:"48px"}}></div>
      </main>

      <SiteFooter />
    </>
  )
}
