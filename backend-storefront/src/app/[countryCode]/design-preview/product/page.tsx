"use client"

import { useState } from "react"
import { SectionHead } from '@modules/@shared/components/section-head'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { ProductGrid } from '@modules/products/product-grid'
import { Badge } from '@modules/@shared/components/badge'
import { PDPGallery } from '@modules/product-detail/pdp-gallery'
import { PDPSummary } from '@modules/product-detail/pdp-summary'
import { PDPTabs } from '@modules/product-detail/pdp-tabs'
import { SiteFooter } from '@modules/layout/site-footer'

export default function ProductPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Shared header partial; inlined into each page */}
      <div className="site-header">
        {/* Desktop: utility bar */}
        <div className="util-bar"><div className="wrap">
          <span className="promo"><strong>Transport gratuit</strong> peste 500 RON</span>
          <span className="divider">·</span>
          <a href="tel:0264123456">Tel. 0264 123 456</a>
          <span className="divider">·</span>
          <a href="#">L–V 08:00–17:00</a>
          <div className="right">
            <a href="#">Comanda mea</a><span className="divider">·</span>
            <a href="#">Cont B2B</a><span className="divider">·</span>
            <select aria-label="limbă"><option>RO</option><option>EN</option><option>HU</option></select>
          </div>
        </div></div>

        {/* Desktop: main bar */}
        <div className="main-bar">
          <a className="logo" href="/ro"><span className="mark">a</span><span><div className="word">ardmag</div><div className="tag">precizie solidă · din 2008</div></span></a>
          <form className="search-combo" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="cat" tabIndex={0}>Toate categoriile</div>
            <input type="search" placeholder="Caută produs, SKU, brand... (ex: DLT-115-TX)" aria-label="căutare" suppressHydrationWarning />
            <button type="submit"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><span>Caută</span></button>
          </form>
          <div className="actions">
            <a className="action-btn" href="#" aria-label="cont"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></span><span className="label">Cont</span></a>
            <a className="action-btn" href="#" aria-label="favorite"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20s-7-5-7-11a4 4 0 0 1 7-2.5A4 4 0 0 1 19 9c0 6-7 11-7 11z"/></svg></span><span className="label">Favorite</span><span className="count">4</span></a>
            <a className="action-btn" href="#" aria-label="coș"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h3l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg></span><span className="label">Coș</span><span className="count">12</span></a>
          </div>
        </div>

        {/* Desktop: category nav */}
        <nav className="cat-nav"><div className="wrap">
          <a href="/ro/design-preview/category" className="all"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Toate categoriile</a>
          <a href="/ro/design-preview/category" data-nav="discuri">Discuri diamantate</a>
          <a href="#">Freze &amp; profilatoare</a>
          <a href="#">Pad-uri &amp; abrazivi</a>
          <a href="#">Mastici &amp; adezivi</a>
          <a href="#">Tratamente</a>
          <a href="#">Echipamente</a>
          <div className="right"><a href="#">Catalog PDF</a></div>
        </div></nav>

        {/* Mobile: compact bar */}
        <div className="mobile-header">
          <button className="burger" aria-label="meniu" onClick={() => setDrawerOpen(true)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
          <a className="logo" href="/ro"><span className="mark">a</span><div className="word">ardmag</div></a>
          <div className="spacer"></div>
          <button className="icon-btn" aria-label="favorite"><svg viewBox="0 0 20 20"><path d="M10 17s-6-4-6-9a3.3 3.3 0 0 1 6-2 3.3 3.3 0 0 1 6 2c0 5-6 9-6 9z"/></svg><span className="count">4</span></button>
          <button className="icon-btn" aria-label="coș"><svg viewBox="0 0 20 20"><path d="M3 4h2l1.5 9h9l1.5-6H6"/><circle cx="8" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg><span className="count">12</span></button>
        </div>

        {/* Mobile: search row below bar */}
        <div className="mobile-search">
          <form className="search-combo" role="search" onSubmit={(e) => e.preventDefault()}>
            <input type="search" placeholder="Caută produs, SKU, brand..." aria-label="căutare" suppressHydrationWarning />
            <button type="submit"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><span>Caută</span></button>
          </form>
        </div>
      </div>

      {/* Mobile: slide-in drawer */}
      <div
        className="mobile-drawer"
        id="mDrawer"
        data-open={drawerOpen ? "true" : "false"}
        onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false) }}
      >
        <div className="mobile-menu">
          <div className="mm-head">
            <a className="logo" href="/ro"><span className="mark">a</span><div className="word">ardmag</div></a>
            <button className="close" aria-label="închide" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="mm-section-label">Categorii</div>
          <div className="mm-nav">
            <a href="/ro/design-preview/category">Discuri diamantate <span className="count">148</span></a>
            <a href="#">Freze &amp; profilatoare <span className="count">62</span></a>
            <a href="#">Pad-uri &amp; abrazivi <span className="count">84</span></a>
            <a href="#">Mastici &amp; adezivi <span className="count">37</span></a>
            <a href="#">Tratamente <span className="count">45</span></a>
            <a href="#">Echipamente <span className="count">29</span></a>
          </div>
          <div className="mm-section-label">Cont</div>
          <div className="mm-nav">
            <a href="#">Intră în cont <span className="chev">›</span></a>
            <a href="#">Comanda mea <span className="chev">›</span></a>
            <a href="#">Cont B2B <span className="chev">›</span></a>
            <a href="#">Catalog PDF <span className="chev">↗</span></a>
          </div>
          <div className="mm-foot">
            <div className="phone"><strong>0264 123 456</strong></div>
            <div className="sub">L–V 08:00–17:00 · Cluj-Napoca</div>
          </div>
        </div>
      </div>


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
              { label: 'Ø115', active: true },
              { label: 'Ø125' },
              { label: 'Ø150' },
              { label: 'Ø180' },
              { label: 'Ø230' },
            ]},
            { title: 'Filet / montare', selectedValue: '22.23 mm', options: [
              { label: '22.23 mm', active: true },
              { label: 'M14' },
              { label: '5/8″', unavailable: true },
            ]},
            { title: 'Pachet', selectedValue: '1 bucată', options: [
              { label: '1 buc', active: true },
              { label: '5 buc', discount: '−8%' },
              { label: '10 buc', discount: '−15%' },
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
        <ProductGrid variant="mini" products={[
          { id: "DLT-180-TX", title: "Disc diamantat Turbo Ø180", sku: "DLT-180-TX", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-disc-turbo-180.jpg", imageAlt: "Disc diamantat Turbo Ø180", href: "/ro/design-preview/product", price: { now: "113,60 RON", was: "142,00 RON" }, badges: [{ type: "promo", label: "−20%" }] },
          { id: "WSK-7-M14", title: "Freză cupă M14 · 7 cupe", sku: "WSK-7-M14", brand: "Woosuk", brandHref: "/ro/design-preview/category", image: "/design-temp/p-freza-cupa-m14.jpg", imageAlt: "Freză cupă M14 · 7 cupe", href: "/ro/design-preview/product", price: { now: "310,00 RON" }, badges: [] },
          { id: "SAT-4A-VEL-SET", title: "Pad abraziv Velcro — set 7 grit", sku: "SAT-4A-VEL-SET", brand: "Sait Abrazivi", brandHref: "/ro/design-preview/category", image: "/design-temp/p-pad-velcro-set.jpg", imageAlt: "Pad abraziv Velcro — set 7 grit", href: "/ro/design-preview/product", price: { now: "168,00 RON" }, badges: [] },
          { id: "DLT-ECO-1000", title: "Impermeabilizant granit / marmură 1L", sku: "DLT-ECO-1000", brand: "Delta Research", brandHref: "/ro/design-preview/category", image: "/design-temp/p-impermeabilizant.jpg", imageAlt: "Impermeabilizant granit / marmură 1L", href: "/ro/design-preview/product", price: { now: "142,00 RON" }, badges: [] },
        ]} />
      </section>

      <SiteFooter categoriesHref="/ro/design-preview/category" />
    </>
  )
}
