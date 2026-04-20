"use client"

import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { CategoryHero } from '@modules/category/category-hero'
import { Pagination } from '@modules/category/pagination'
import { CategoryToolbar } from '@modules/category/category-toolbar'
import { MobileFilterBar } from '@modules/category/mobile-filter-bar'
import { FilterSidebar } from '@modules/category/filter-sidebar'
import { ProductGrid } from '@modules/products/product-grid'
import { SiteHeader } from '@modules/layout/site-header/SiteHeader'
import { SiteFooter } from '@modules/layout/site-footer'

export default function CategoryPage() {
  return (
    <>
      <SiteHeader countryCode="ro" categoriesHref="/ro/design-preview/category" discuriHref="/ro/design-preview/category" drawerId="mDrawer" drawerClosedAttr />

      <Breadcrumb items={[{label:"Acasă",href:"/ro"},{label:"Scule diamantate",href:"#"}]} current="Discuri diamantate" />

      <CategoryHero
        eyebrow="Categorie · 142 produse"
        title="Discuri diamantate"
        description="Discuri diamantate profesionale pentru tăiere în granit, marmură, beton și materiale dure. Formate Ø100 până la Ø300, bandă turbo, continuă sau segmentată. Distribuitor autorizat Delta Research, Tenax, Woosuk și Diatex."
        meta={[
          <><strong>142</strong> produse</>,
          <><strong>7</strong> branduri</>,
          <><strong>Ø100–Ø300</strong> mm</>,
          <>Stoc <strong>Cluj-Napoca</strong></>,
        ]}
      />

      <div className="cat-layout">

        <FilterSidebar
          baseUrl="/ro/design-preview/category"
          groups={[
            { type: 'checkboxes', title: 'Brand', paramKey: 'brand', badge: '7', open: true, options: [
              { label: 'Delta Research', value: 'delta-research', count: 48, checked: true },
              { label: 'Tenax', value: 'tenax', count: 32, checked: true },
              { label: 'Woosuk', value: 'woosuk', count: 24 },
              { label: 'Diatex', value: 'diatex', count: 18 },
              { label: 'Sait', value: 'sait', count: 12 },
              { label: 'VBT', value: 'vbt', count: 8 },
            ]},
            { type: 'swatches', title: 'Diametru', badge: 'Ø', open: true, options: [
              { label: 'Ø100' },
              { label: 'Ø115', active: true },
              { label: 'Ø125', active: true },
              { label: 'Ø150' },
              { label: 'Ø180' },
              { label: 'Ø200' },
              { label: 'Ø230' },
              { label: 'Ø250' },
              { label: 'Ø300' },
            ]},
            { type: 'checkboxes', title: 'Tip bandă', paramKey: 'band', open: true, options: [
              { label: 'Turbo', value: 'turbo', count: 78, checked: true },
              { label: 'Continuă', value: 'continua', count: 34 },
              { label: 'Segmentată', value: 'segmentata', count: 30 },
            ]},
            { type: 'checkboxes', title: 'Material', paramKey: 'material', options: [
              { label: 'Granit', value: 'granit', count: 62 },
              { label: 'Marmură', value: 'marmura', count: 48 },
              { label: 'Beton', value: 'beton', count: 38 },
              { label: 'Beton armat', value: 'beton-armat', count: 14 },
              { label: 'Ceramică', value: 'ceramica', count: 12 },
              { label: 'Universal', value: 'universal', count: 22 },
            ]},
            { type: 'checkboxes', title: 'Filet / montare', paramKey: 'filet', options: [
              { label: 'M14', value: 'm14', count: 86 },
              { label: '22.23 mm', value: '22-23mm', count: 64 },
              { label: '5/8″', value: '5-8', count: 18 },
            ]},
            { type: 'price-range', title: 'Preț', open: true, min: 20, max: 250 },
            { type: 'checkboxes', title: 'Disponibilitate', paramKey: 'stock', options: [
              { label: 'În stoc', value: 'in-stoc', count: 128, checked: true },
              { label: 'Livrare la comandă', value: 'la-comanda', count: 14 },
              { label: 'Doar promoții', value: 'promotii', count: 22 },
            ]},
          ]}
          applyCount={142}
          helpCard={{
            label: 'Ai nevoie de ajutor?',
            description: 'Consultanții noștri tehnici te ajută să alegi discul potrivit pentru materialul tău.',
            phone: '0264 123 456',
            hours: 'L–V 08:00–17:00',
          }}
        />

        <main>

          <MobileFilterBar
            activeCount={3}
            sortOptions={["Sortare: Popularitate","Pret crescator","Pret descrescator","Nou"]}
            currentSort="Sortare: Popularitate"
            baseUrl="/ro/design-preview/category"
            activeFilters={[
              {label:"Delta Research", paramKey:"brand", value:"delta-research"},
              {label:"Tenax", paramKey:"brand", value:"tenax"},
              {label:"Pret 100-500 RON", paramKey:"price"},
            ]}
            onOpenFilters={() => { const el = document.getElementById('filters'); if (el) el.classList.add('open') }}
          />

          <CategoryToolbar
            count={142}
            sortOptions={["Popularitate","Nou intrat","Preț crescător","Preț descrescător","Brand A–Z"]}
            perPageOptions={[24,48,96]}
          />

          <ProductGrid variant="cat" countryCode="ro" products={[
            { id: "DLT-115-TX-ULTRA", title: "Disc diamantat Delta Turbo Ultra Ø115", sku: "DLT-115-TX-ULTRA", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat Delta Turbo Ultra Ø115", href: "/ro/design-preview/product", price: { now: "38,40 RON", was: "48,00 RON" }, badges: [{ type: "promo", label: "−20%" }], specs: ["Ø 115 mm", "Turbo", "Granit"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DLT-125-TX", title: "Disc diamantat Turbo Ø125 filet 22.23", sku: "DLT-125-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø125 filet 22.23", href: "/ro/design-preview/product", price: { now: "52,80 RON" }, badges: [{ type: "new", label: "Nou" }], specs: ["Ø 125 mm", "Turbo", "Universal"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DLT-180-TX", title: "Disc diamantat Turbo Ø180", sku: "DLT-180-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat Turbo Ø180", href: "/ro/design-preview/product", price: { now: "113,60 RON", was: "142,00 RON" }, badges: [{ type: "promo", label: "−20%" }, { type: "stock-low", label: "4 buc", dotVariant: true }], specs: ["Ø 180 mm", "Turbo", "Granit"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DLT-230-TX", title: "Disc diamantat Turbo Ø230 flanșă M14", sku: "DLT-230-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø230 flanșă M14", href: "/ro/design-preview/product", price: { now: "168,00 RON" }, badges: [], specs: ["Ø 230 mm", "Turbo", "Beton"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DLT-115-SG", title: "Disc diamantat segmentat Ø115", sku: "DLT-115-SG", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat segmentat Ø115", href: "/ro/design-preview/product", price: { now: "34,00 RON" }, badges: [], specs: ["Ø 115 mm", "Segmentat", "Beton"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "TNX-DC-200", title: "Disc diamantat continuu Ø200 marmură", sku: "TNX-DC-200", brand: "Tenax", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat continuu Ø200 marmură", href: "/ro/design-preview/product", price: { now: "198,00 RON" }, badges: [], specs: ["Ø 200 mm", "Continuu", "Marmură"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "TNX-DC-250", title: "Disc diamantat continuu Ø250 marmură", sku: "TNX-DC-250", brand: "Tenax", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat continuu Ø250 marmură", href: "/ro/design-preview/product", price: { now: "312,00 RON" }, badges: [{ type: "stock-low", label: "2 buc", dotVariant: true }], specs: ["Ø 250 mm", "Continuu", "Marmură"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "WSK-T-125", title: "Disc diamantat Turbo Ø125 premium", sku: "WSK-T-125", brand: "Woosuk", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø125 premium", href: "/ro/design-preview/product", price: { now: "78,00 RON", was: "98,00 RON" }, badges: [{ type: "promo", label: "−20%" }], specs: ["Ø 125 mm", "Turbo", "Granit"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "WSK-T-180", title: "Disc diamantat Turbo Ø180 premium", sku: "WSK-T-180", brand: "Woosuk", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat Turbo Ø180 premium", href: "/ro/design-preview/product", price: { now: "148,00 RON" }, badges: [], specs: ["Ø 180 mm", "Turbo", "Granit"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DTX-E-115", title: "Disc diamantat Ø115 economic", sku: "DTX-E-115", brand: "Diatex", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Ø115 economic", href: "/ro/design-preview/product", price: { now: "22,40 RON" }, badges: [], specs: ["Ø 115 mm", "Turbo", "Universal"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DTX-BA-230", title: "Disc diamantat Ø230 beton armat", sku: "DTX-BA-230", brand: "Diatex", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-delta-115.jpg", imageAlt: "Disc diamantat Ø230 beton armat", href: "/ro/design-preview/product", price: { now: "142,00 RON" }, badges: [], specs: ["Ø 230 mm", "Segmentat", "Beton armat"], defaultVariantId: null, hasMultipleRealVariants: false },
            { id: "DLT-115-TX-5", title: "Disc diamantat Turbo Ø115 - pachet 5 buc", sku: "DLT-115-TX-5", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø115 - pachet 5 buc", href: "/ro/design-preview/product", price: { now: "172,00 RON", was: "220,00 RON" }, badges: [{ type: "promo", label: "Pachet" }], specs: ["Ø 115 mm", "Turbo", "Pachet 5"], defaultVariantId: null, hasMultipleRealVariants: false },
          ]} />

          <Pagination
            prevHref="#"
            nextHref="#"
            pages={[
              { label: "1", href: "#", active: true },
              { label: "2", href: "#" },
              { label: "3", href: "#" },
              { label: "4", href: "#" },
              { label: "…", href: "#" },
              { label: "12", href: "#" },
            ]}
            resultsLabel="Afișate 1–12 din 142 · pagina 1 din 12"
          />

        </main>
      </div>
      <SiteFooter categoriesHref="/ro/design-preview/category" />
    </>
  )
}
