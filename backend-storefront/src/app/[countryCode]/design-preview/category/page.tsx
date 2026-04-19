"use client"

import { useState } from "react"
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'
import { Breadcrumb } from '@modules/@shared/components/breadcrumb'
import { CategoryHero } from '@modules/category/category-hero'
import { Pagination } from '@modules/category/pagination'
import { CategoryToolbar } from '@modules/category/category-toolbar'
import { MobileFilterBar } from '@modules/category/mobile-filter-bar'
import { FilterSidebar } from '@modules/category/filter-sidebar'
import { ProductCard } from '@modules/products/product-card'

export default function CategoryPage() {
  const [mDrawerOpen, setMDrawerOpen] = useState(false)

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
          <button className="burger" aria-label="meniu" onClick={() => setMDrawerOpen(true)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
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
      <div className="mobile-drawer" id="mDrawer" data-open={mDrawerOpen ? 'true' : 'false'} onClick={(e) => { if (e.target === e.currentTarget) setMDrawerOpen(false) }}>
        <div className="mobile-menu">
          <div className="mm-head">
            <a className="logo" href="/ro"><span className="mark">a</span><div className="word">ardmag</div></a>
            <button className="close" aria-label="închide" onClick={() => setMDrawerOpen(false)}>✕</button>
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

      <Breadcrumb items={[{label:"Acasă",href:"/ro"},{label:"Scule diamantate",href:"#"}]} current="Discuri diamantate" />

      <CategoryHero
        eyebrow="Categorie · 142 produse"
        title="Discuri diamantate"
        description="Discuri diamantate profesionale pentru tăiere în granit, marmură, beton și materiale dure. Formate Ø100 până la Ø300, bandă turbo, continuă sau segmentată. Distribuitor autorizat Delta Research, Tenax, Woosuk și Diatex."
        meta={[
          <><strong>142</strong> SKU</>,
          <><strong>7</strong> branduri</>,
          <><strong>Ø100–Ø300</strong> mm</>,
          <>Stoc <strong>Cluj-Napoca</strong></>,
        ]}
      />

      <div className="cat-layout">

        <FilterSidebar
          groups={[
            { type: 'checkboxes', title: 'Brand', badge: '7', open: true, options: [
              { label: 'Delta Research', count: 48, checked: true },
              { label: 'Tenax', count: 32, checked: true },
              { label: 'Woosuk', count: 24 },
              { label: 'Diatex', count: 18 },
              { label: 'Sait', count: 12 },
              { label: 'VBT', count: 8 },
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
            { type: 'checkboxes', title: 'Tip bandă', open: true, options: [
              { label: 'Turbo', count: 78, checked: true },
              { label: 'Continuă', count: 34 },
              { label: 'Segmentată', count: 30 },
            ]},
            { type: 'checkboxes', title: 'Material', options: [
              { label: 'Granit', count: 62 },
              { label: 'Marmură', count: 48 },
              { label: 'Beton', count: 38 },
              { label: 'Beton armat', count: 14 },
              { label: 'Ceramică', count: 12 },
              { label: 'Universal', count: 22 },
            ]},
            { type: 'checkboxes', title: 'Filet / montare', options: [
              { label: 'M14', count: 86 },
              { label: '22.23 mm', count: 64 },
              { label: '5/8″', count: 18 },
            ]},
            { type: 'price-range', title: 'Preț', open: true, min: 20, max: 250 },
            { type: 'checkboxes', title: 'Disponibilitate', options: [
              { label: 'În stoc', count: 128, checked: true },
              { label: 'Livrare la comandă', count: 14 },
              { label: 'Doar promoții', count: 22 },
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
            sortOptions={["Sortare: Popularitate","Preț ↑","Preț ↓","Nou"]}
            activeFilters={[{label:"Delta Research"},{label:"Tenax"},{label:"Ø115"},{label:"Ø125"},{label:"Turbo"}]}
            onOpenFilters={() => { const el = document.getElementById('filters'); if (el) el.classList.add('open') }}
          />

          <CategoryToolbar
            count={142}
            sortOptions={["Popularitate","Nou intrat","Preț crescător","Preț descrescător","Brand A–Z"]}
            perPageOptions={[24,48,96]}
          />

          <div className="cat-grid">

            <ProductCard product={{
              id: "DLT-115-TX-ULTRA",
              title: "Disc diamantat Delta Turbo Ultra Ø115",
              sku: "DLT-115-TX-ULTRA",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat Delta Turbo Ultra Ø115",
              href: "/ro/design-preview/product",
              price: { now: "38,40 RON", was: "48,00 RON" },
              badges: [{ type: "promo", label: "−20%" }],
              specs: ["Ø 115 mm", "Turbo", "Granit"],
            }} />
            <ProductCard product={{
              id: "DLT-125-TX",
              title: "Disc diamantat Turbo Ø125 filet 22.23",
              sku: "DLT-125-TX",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat Turbo Ø125 filet 22.23",
              href: "/ro/design-preview/product",
              price: { now: "52,80 RON" },
              badges: [{ type: "new", label: "Nou" }],
              specs: ["Ø 125 mm", "Turbo", "Universal"],
            }} />
            <ProductCard product={{
              id: "DLT-180-TX",
              title: "Disc diamantat Turbo Ø180",
              sku: "DLT-180-TX",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat Turbo Ø180",
              href: "/ro/design-preview/product",
              price: { now: "113,60 RON", was: "142,00 RON" },
              badges: [{ type: "promo", label: "−20%" }, { type: "stock-low", label: "4 buc", dotVariant: true }],
              specs: ["Ø 180 mm", "Turbo", "Granit"],
            }} />
            <ProductCard product={{
              id: "DLT-230-TX",
              title: "Disc diamantat Turbo Ø230 flanșă M14",
              sku: "DLT-230-TX",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat Turbo Ø230 flanșă M14",
              href: "/ro/design-preview/product",
              price: { now: "168,00 RON" },
              badges: [],
              specs: ["Ø 230 mm", "Turbo", "Beton"],
            }} />
            <ProductCard product={{
              id: "DLT-115-SG",
              title: "Disc diamantat segmentat Ø115",
              sku: "DLT-115-SG",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat segmentat Ø115",
              href: "/ro/design-preview/product",
              price: { now: "34,00 RON" },
              badges: [],
              specs: ["Ø 115 mm", "Segmentat", "Beton"],
            }} />
            <ProductCard product={{
              id: "TNX-DC-200",
              title: "Disc diamantat continuu Ø200 marmură",
              sku: "TNX-DC-200",
              brand: "Tenax",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat continuu Ø200 marmură",
              href: "/ro/design-preview/product",
              price: { now: "198,00 RON" },
              badges: [],
              specs: ["Ø 200 mm", "Continuu", "Marmură"],
            }} />
            <ProductCard product={{
              id: "TNX-DC-250",
              title: "Disc diamantat continuu Ø250 marmură",
              sku: "TNX-DC-250",
              brand: "Tenax",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat continuu Ø250 marmură",
              href: "/ro/design-preview/product",
              price: { now: "312,00 RON" },
              badges: [{ type: "stock-low", label: "2 buc", dotVariant: true }],
              specs: ["Ø 250 mm", "Continuu", "Marmură"],
            }} />
            <ProductCard product={{
              id: "WSK-T-125",
              title: "Disc diamantat Turbo Ø125 premium",
              sku: "WSK-T-125",
              brand: "Woosuk",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat Turbo Ø125 premium",
              href: "/ro/design-preview/product",
              price: { now: "78,00 RON", was: "98,00 RON" },
              badges: [{ type: "promo", label: "−20%" }],
              specs: ["Ø 125 mm", "Turbo", "Granit"],
            }} />
            <ProductCard product={{
              id: "WSK-T-180",
              title: "Disc diamantat Turbo Ø180 premium",
              sku: "WSK-T-180",
              brand: "Woosuk",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat Turbo Ø180 premium",
              href: "/ro/design-preview/product",
              price: { now: "148,00 RON" },
              badges: [],
              specs: ["Ø 180 mm", "Turbo", "Granit"],
            }} />
            <ProductCard product={{
              id: "DTX-E-115",
              title: "Disc diamantat Ø115 economic",
              sku: "DTX-E-115",
              brand: "Diatex",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat Ø115 economic",
              href: "/ro/design-preview/product",
              price: { now: "22,40 RON" },
              badges: [],
              specs: ["Ø 115 mm", "Turbo", "Universal"],
            }} />
            <ProductCard product={{
              id: "DTX-BA-230",
              title: "Disc diamantat Ø230 beton armat",
              sku: "DTX-BA-230",
              brand: "Diatex",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-delta-115.jpg",
              imageAlt: "Disc diamantat Ø230 beton armat",
              href: "/ro/design-preview/product",
              price: { now: "142,00 RON" },
              badges: [],
              specs: ["Ø 230 mm", "Segmentat", "Beton armat"],
            }} />
            <ProductCard product={{
              id: "DLT-115-TX-5",
              title: "Disc diamantat Turbo Ø115 - pachet 5 buc",
              sku: "DLT-115-TX-5",
              brand: "Delta Research",
              brandHref: "/ro/design-preview/category",
              image: "/design-temp/p-disc-turbo-180.jpg",
              imageAlt: "Disc diamantat Turbo Ø115 - pachet 5 buc",
              href: "/ro/design-preview/product",
              price: { now: "172,00 RON", was: "220,00 RON" },
              badges: [{ type: "promo", label: "Pachet" }],
              specs: ["Ø 115 mm", "Turbo", "Pachet 5"],
            }} />
          </div>

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
      {/* Shared footer partial; inlined into each page */}
      <footer className="site-footer">
        <div className="footer-top">
          <div className="brand-col">
            <a className="logo" href="/ro"><span className="mark">a</span><span><div className="word">ardmag</div><div className="tag">scule &amp; abrazivi · din 2008</div></span></a>
            <p>Distribuitor autorizat Tenax, Sait, Woosuk. Scule profesionale pentru prelucrarea pietrei naturale, marmură și granit.</p>
            <div className="contact"><div className="phone">Tel. <strong>0264 123 456</strong></div><div>contact@ardmag.ro</div><div>Str. Industriei 14 · Cluj-Napoca</div></div>
          </div>
          <div><h5>Magazin</h5><ul><li><a href="/ro/design-preview/category">Toate categoriile</a></li><li><a href="#">Noutăți</a></li><li><a href="#">Promoții</a></li><li><a href="#">Lichidări stoc</a></li><li><a href="#">Catalog PDF</a></li></ul></div>
          <div><h5>Cont &amp; comenzi</h5><ul><li><a href="#">Contul meu</a></li><li><a href="#">Comenzi &amp; facturi</a></li><li><a href="#">Urmărire livrare</a></li><li><a href="#">Retur produs</a></li><li><a href="#">Cont B2B</a></li></ul></div>
          <div><h5>Info</h5><ul><li><a href="#">Despre noi</a></li><li><a href="#">Parteneri</a></li><li><a href="#">Livrare &amp; plată</a></li><li><a href="#">Garanții</a></li><li><a href="#">Contact</a></li></ul></div>
          <div className="news-col">
            <h5>Newsletter</h5>
            <p>Promoții, stocuri noi, ghiduri tehnice. Maxim 2 emailuri pe lună.</p>
            <form className="news-form" onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="email@firma.ro" aria-label="email" suppressHydrationWarning /><button type="submit">Abonează-mă</button></form>
            <label className="news-consent"><input type="checkbox" defaultChecked /><span>Sunt de acord cu <a href="#" style={{ color: 'var(--stone-300)', textDecoration: 'underline' }}>prelucrarea datelor</a> pentru comunicări comerciale.</span></label>
          </div>
        </div>
        <div className="footer-mid">
          <TrustBanner variant="strip" items={[
            { icon: <ReturnIcon />, title: "14 zile retur", subtitle: "fără întrebări" },
            { icon: <TruckIcon />, title: "Livrare 24-48h", subtitle: "țara întreagă" },
            { icon: <SecureIcon />, title: "Plată securizată", subtitle: "3DSecure · SSL" },
            { icon: <SupportIcon />, title: "Suport tehnic", subtitle: "L–V 08–17 · RO" },
          ]} />
          <div className="pay-strip"><span className="pay-chip">Visa</span><span className="pay-chip">Mastercard</span><span className="pay-chip">Netopia</span><span className="pay-chip">Ramburs</span><span className="pay-chip">OP B2B</span></div>
        </div>
        <div className="footer-bot"><div className="wrap"><div className="legal"><a href="#">Termeni &amp; condiții</a><a href="#">Politică confidențialitate</a><a href="#">Politică cookies</a><a href="#">GDPR</a><a href="#">ANPC</a><a href="#">Soluționare litigii</a></div><span className="cr">© 2008–2026 ardmag SRL</span></div></div>
      </footer>
    </>
  )
}
