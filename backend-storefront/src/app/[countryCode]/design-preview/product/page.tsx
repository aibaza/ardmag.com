"use client"

import { SectionHead } from '@modules/@shared/components/section-head'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { ProductGrid } from '@modules/products/product-grid'
import { Badge } from '@modules/@shared/components/badge'
import { PDPGallery } from '@modules/product-detail/pdp-gallery'
import { PDPSummary } from '@modules/product-detail/pdp-summary'
import { PDPTabs } from '@modules/product-detail/pdp-tabs'
import { SiteHeader } from '@modules/layout/site-header/SiteHeader'
import { SiteFooter } from '@modules/layout/site-footer'

export default function ProductPage() {
  return (
    <>
      <SiteHeader countryCode="ro" categoriesHref="/ro/design-preview/category" discuriHref="/ro/design-preview/category" drawerId="mDrawer" drawerClosedAttr />

      <Breadcrumb items={[{label:"Acasă",href:"/ro"},{label:"Scule diamantate",href:"#"},{label:"Discuri diamantate",href:"/ro/design-preview/category"}]} current="Delta Turbo Ø115" />

      {/* PDP -- 2 columns: gallery (1fr) + sticky summary (380px) */}
      <section className="pdp">

        {/* GALLERY: [thumbs 72px | main 1fr] */}
        <PDPGallery
          thumbs={[
            { src: "/design-temp/p-disc-delta-115.jpg", alt: "frontal", ariaLabel: "Imagine frontală", active: true },
            { src: "/design-temp/p-disc-turbo-180.jpg", alt: "unghi", ariaLabel: "Imagine unghi" },
            { src: "/design-temp/p-disc-delta-115.jpg", alt: "bandă", ariaLabel: "Detaliu bandă" },
            { src: "/design-temp/p-disc-turbo-180.jpg", alt: "ambalaj", ariaLabel: "Ambalaj" },
            { ariaLabel: "Vezi încă 3", extraCount: 3 },
          ]}
          mainImage={{ src: "/design-temp/p-disc-delta-115.jpg", alt: "Disc diamantat Delta Turbo Ø115" }}
          badges={[
            { type: "promo", label: "−20%" },
            { type: "new", label: "Nou" },
          ]}
        />

        {/* SUMMARY: sticky right sidebar */}
        <PDPSummary
          brand="Delta Research"
          brandHref="/ro/design-preview/category"
          title="Disc diamantat Delta Turbo Ultra Ø115 mm"
          sku="DLT-115-TX-ULTRA"
          ean="5944123456789"
          rating={{ score: 4.8, reviewCount: 47 }}
          price="38,40 RON"
          was="48,00 RON"
          save="−20% · 9,60 RON"
          priceNoTax="32,27 RON"
          unitLabel="Per bucată"
          promoLabel="Promoție activă până pe "
          promoDate="30 aprilie"
          variantGroups={[
            { title: 'Diametru', selectedValue: 'Ø 115 mm', options: [
              { label: 'Ø115', variantId: 'preview-v1', active: true },
              { label: 'Ø125', variantId: 'preview-v2' },
              { label: 'Ø150', variantId: 'preview-v3' },
              { label: 'Ø180', variantId: 'preview-v4' },
              { label: 'Ø230', variantId: 'preview-v5' },
            ]},
            { title: 'Filet / montare', selectedValue: '22.23 mm', options: [
              { label: '22.23 mm', variantId: 'preview-v1', active: true },
              { label: 'M14', variantId: 'preview-v6' },
              { label: '5/8″', variantId: 'preview-v7', unavailable: true },
            ]},
            { title: 'Pachet', selectedValue: '1 bucată', options: [
              { label: '1 buc', variantId: 'preview-v1', active: true },
              { label: '5 buc', variantId: 'preview-v8', discount: '−8%' },
              { label: '10 buc', variantId: 'preview-v9', discount: '−15%' },
            ]},
          ]}
          stockLabel="În stoc — 24 bucăți"
          stockLocation="Cluj · 24h"
          addToCartLabel="Adaugă în coș · 38,40 RON"
          perks={[
            { icon: <svg viewBox="0 0 20 20"><path d="M3 7h11v7H3z"/><path d="M14 9h3l1 3v2h-4z"/><circle cx="7" cy="15" r="1.3"/><circle cx="15" cy="15" r="1.3"/></svg>, label: 'Livrare 24–48h', sub: 'Cluj gratuit 500+ RON' },
            { icon: <svg viewBox="0 0 20 20"><path d="M4 7h12v10H4z"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/></svg>, label: '14 zile retur', sub: 'produs neutilizat' },
            { icon: <svg viewBox="0 0 20 20"><path d="M10 3 3 5v6c0 4 3 6 7 7 4-1 7-3 7-7V5z"/><path d="m7 10 2 2 4-4"/></svg>, label: 'Garanție producător', sub: 'Delta Research' },
            { icon: <svg viewBox="0 0 20 20"><path d="M4 4h12v10H8l-4 3z"/></svg>, label: 'Suport tehnic', sub: '0264 123 456' },
          ]}
        />
      </section>

      {/* TABS + CONTENT */}
      <PDPTabs tabs={[
        { label: 'Specificații', active: true },
        { label: 'Descriere' },
        { label: 'Utilizare & siguranță' },
        { label: 'Recenzii (47)' },
        { label: 'Fișiere & certificate' },
      ]}>
          <div className="prose">
            <h3>Disc diamantat Turbo Ultra pentru granit și marmură</h3>
            <p>Proiectat pentru tăieri rapide și curate în materiale dure — granit, marmură, plăci ceramice. Banda continuă turbo de 10 mm oferă o viteză de avans superioară și o durată de viață cu până la 40% mai lungă față de un disc segmentat echivalent.</p>
            <p>Compatibil cu polizoarele unghiulare standard, filet 22.23 mm. Viteza periferică maximă 80 m/s (13.300 rpm la Ø115).</p>
            <h3>Recomandări de utilizare</h3>
            <ul>
              <li>Folosiți sub apă pentru o durată de viață maximă</li>
              <li>Nu depășiți turația maximă marcată pe disc</li>
              <li>Verificați fixarea flanșei înainte de fiecare utilizare</li>
              <li>Nu e recomandat pentru beton armat dens — folosiți discul DLT-230-SG</li>
            </ul>

            <h3>Dimensiuni</h3>
            <table className="spec-table">
              <tbody>
                <tr><th>Diametru extern</th><td>Ø 115 mm</td></tr>
                <tr><th>Filet montare</th><td>22.23 mm</td></tr>
                <tr><th>Grosime disc</th><td>1.8 mm</td></tr>
                <tr><th>Înălțime bandă</th><td>10 mm</td></tr>
                <tr><th>Greutate</th><td>82 g</td></tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: "28px" }}>Caracteristici tehnice</h3>
            <table className="spec-table">
              <tbody>
                <tr><th>Tip bandă</th><td>Turbo continuă</td></tr>
                <tr><th>Turație max</th><td>13.300 rpm</td></tr>
                <tr><th>Viteza periferică</th><td>80 m/s</td></tr>
                <tr><th>Răcire</th><td>Uscat / umed</td></tr>
                <tr><th>Sistem de fixare</th><td>Flanșă standard</td></tr>
              </tbody>
            </table>
          </div>

          <aside>
            <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--f-mono)", margin: "0 0 12px" }}>Aplicații recomandate</h3>
            <table className="spec-table" style={{ marginBottom: "20px" }}>
              <tbody>
                <tr><th>Granit</th><td style={{ color: "var(--success-fg)" }}>★★★★★ Optim</td></tr>
                <tr><th>Marmură</th><td>★★★★☆ Foarte bun</td></tr>
                <tr><th>Beton</th><td>★★★☆☆ Acceptabil</td></tr>
                <tr><th>Beton armat</th><td style={{ color: "var(--error)" }}>★★☆☆☆ Nu e recomandat</td></tr>
                <tr><th>Ceramică</th><td>★★★★☆ Foarte bun</td></tr>
              </tbody>
            </table>
            <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--f-mono)", margin: "0 0 12px" }}>Identificare &amp; ambalaj</h3>
            <table className="spec-table">
              <tbody>
                <tr><th>Cod producător</th><td>DLT-115-TX-ULTRA</td></tr>
                <tr><th>EAN</th><td>5944123456789</td></tr>
                <tr><th>Origine</th><td>Cluj-Napoca, RO</td></tr>
                <tr><th>Ambalare</th><td>Blister individual</td></tr>
                <tr><th>Per cutie</th><td>25 bucăți</td></tr>
              </tbody>
            </table>
          </aside>
      </PDPTabs>

      {/* RELATED PRODUCTS */}
      <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 60px", borderTop: "1px solid var(--rule)", paddingTop: "32px" }}>
        <SectionHead eyebrow="Ai putea avea nevoie și de" title="Accesorii și produse compatibile" seeAllHref="/ro/design-preview/category" seeAllLabel="Vezi toate →" />
        <ProductGrid variant="mini" countryCode="ro" products={[
          { id: "DLT-180-TX", title: "Disc diamantat Turbo Ø180", sku: "DLT-180-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø180", href: "/ro/design-preview/product", price: { now: "113,60 RON", was: "142,00 RON" }, badges: [{ type: "promo", label: "−20%" }], defaultVariantId: null, hasMultipleRealVariants: false },
          { id: "WSK-7-M14", title: "Freză cupă M14 · 7 cupe", sku: "WSK-7-M14", brand: "Woosuk", brandHref: "/ro/design-preview/category", image: "/design-temp/p-freza-cupa-m14.jpg", imageAlt: "Freză cupă M14 · 7 cupe", href: "/ro/design-preview/product", price: { now: "310,00 RON" }, badges: [], defaultVariantId: null, hasMultipleRealVariants: false },
          { id: "SAT-4A-VEL-SET", title: "Pad abraziv Velcro - set 7 grit", sku: "SAT-4A-VEL-SET", brand: "Sait Abrazivi", brandHref: "/ro/design-preview/category", image: "/design-temp/p-pad-velcro-set.jpg", imageAlt: "Pad abraziv Velcro - set 7 grit", href: "/ro/design-preview/product", price: { now: "168,00 RON" }, badges: [], defaultVariantId: null, hasMultipleRealVariants: false },
          { id: "DLT-ECO-1000", title: "Impermeabilizant granit / marmura 1L", sku: "DLT-ECO-1000", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-impermeabilizant.jpg", imageAlt: "Impermeabilizant granit / marmura 1L", href: "/ro/design-preview/product", price: { now: "142,00 RON" }, badges: [], defaultVariantId: null, hasMultipleRealVariants: false },
        ]} />
      </section>

      <SiteFooter categoriesHref="/ro/design-preview/category" />
    </>
  )
}
