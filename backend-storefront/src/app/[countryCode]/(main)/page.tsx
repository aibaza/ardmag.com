"use client"

import { useState } from "react"
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'
import { SectionHead } from '@modules/@shared/components/section-head'
import { Hero } from '@modules/sections/hero'
import { QuickCategories } from '@modules/sections/quick-categories'
import { ProductCard } from '@modules/products/product-card'

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
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
          <a href="#" className="all"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Toate categoriile</a>
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

        {/* Mobile: search row */}
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
        data-open={drawerOpen ? "true" : undefined}
        onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false) }}
      >
        <div className="mobile-menu">
          <div className="mm-head">
            <a className="logo" href="/ro"><span className="mark">a</span><div className="word">ardmag</div></a>
            <button className="close" aria-label="închide" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="mm-section-label">Categorii</div>
          <div className="mm-nav">
            <a href="#">Discuri diamantate <span className="count">148</span></a>
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

        <div className="mini-grid">
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
          }} />
          <ProductCard product={{
            id: "TNX-F8-250",
            title: "Freză profil F8 Ø250 marmură",
            sku: "TNX-F8-250",
            brand: "Tenax",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-freza-f8-250.jpg",
            imageAlt: "Freză profil F8 Ø250 marmură",
            href: "/ro/design-preview/product",
            price: { now: "1.258,00 RON", was: "1.480,00 RON" },
            badges: [{ type: "promo", label: "−15%" }],
          }} />
          <ProductCard product={{
            id: "DLT-180-TX",
            title: "Disc diamantat Turbo Ø180 filet 22.23",
            sku: "DLT-180-TX",
            brand: "Delta Research",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-disc-turbo-180.jpg",
            imageAlt: "Disc diamantat Turbo Ø180 filet 22.23",
            href: "/ro/design-preview/product",
            price: { now: "113,60 RON", was: "142,00 RON" },
            badges: [{ type: "promo", label: "−20%" }, { type: "stock-low", label: "4 buc", dotVariant: true }],
          }} />
          <ProductCard product={{
            id: "TNX-MP-1000-TR",
            title: "Mastice poliester transparent 1 kg",
            sku: "TNX-MP-1000-TR",
            brand: "Tenax",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-mastic-1kg.jpg",
            imageAlt: "Mastice poliester transparent 1 kg",
            href: "/ro/design-preview/product",
            price: { now: "282,00 RON", was: "376,00 RON" },
            badges: [{ type: "promo", label: "Pachet 3+1" }],
          }} />
        </div>

        {/* Trust banner */}
        <TrustBanner variant="banner" items={[
          { icon: <TruckIcon fill="none" strokeLinecap="round" />, title: "Livrare 24–48h", subtitle: "țara întreagă" },
          { icon: <ReturnIcon fill="none" strokeLinecap="round" />, title: "14 zile retur", subtitle: "fără întrebări" },
          { icon: <SecureIcon fill="none" strokeLinecap="round" />, title: "Distribuitor autorizat", subtitle: "Tenax · Sait · Delta" },
          { icon: <SupportIcon fill="none" strokeLinecap="round" />, title: "Suport tehnic", subtitle: "L–V 08–17 · RO" },
        ]} />

        {/* Supplier strip */}
        <div className="supplier-strip">
          <header>
            <h4>Distribuitor autorizat pentru</h4>
            <a href="#" style={{fontFamily:"var(--f-mono)",fontSize:"11px",color:"var(--stone-700)",textDecoration:"none",textTransform:"uppercase",letterSpacing:"0.05em"}}>Vezi toți partenerii →</a>
          </header>
          <div className="supplier-grid">
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-tenax.png" alt="Tenax" /></span><span className="sub">Italia · 1960</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-sait.png" alt="Sait" /></span><span className="sub">Italia · 1953</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-woosuk.png" alt="Woosuk" /></span><span className="sub">Korea</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-diatex.png" alt="Diatex" /></span><span className="sub">Franța</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-fox.png" alt="Fox Ironstone" /></span><span className="sub">Italia</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-vbt.png" alt="VBT" /></span><span className="sub">Italia</span></a>
            <a href="#" className="slogo with-real" aria-label="Vezi distribuitor"><span className="real"><img src="/design-temp/dist-delta.png" alt="Delta Research" /></span><span className="sub">Cluj-Napoca</span></a>
          </div>
        </div>

        {/* New arrivals */}
        <SectionHead eyebrow="Nou intrat · ultimele 30 zile" title="Produse noi în stoc" seeAllHref="#" seeAllLabel="Toate noutățile →" />

        <div className="mini-grid">
          <ProductCard product={{
            id: "SAT-4A-VEL-SET",
            title: "Pad abraziv Velcro — 7 gradații set",
            sku: "SAT-4A-VEL-SET",
            brand: "Sait Abrazivi",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-pad-velcro-set.jpg",
            imageAlt: "Pad abraziv Velcro — 7 gradații set",
            href: "/ro/design-preview/product",
            price: { now: "168,00 RON" },
            badges: [{ type: "new", label: "Nou" }],
          }} />
          <ProductCard product={{
            id: "TNX-F20-200",
            title: "Freză profil F20 Ø200 granit",
            sku: "TNX-F20-200",
            brand: "Tenax",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-freza-f20-200.jpg",
            imageAlt: "Freză profil F20 Ø200 granit",
            href: "/ro/design-preview/product",
            price: { now: "1.890,00 RON" },
            badges: [{ type: "new", label: "Nou" }],
          }} />
          <ProductCard product={{
            id: "DLT-ECO-1000",
            title: "Impermeabilizant granit / marmură 1L",
            sku: "DLT-ECO-1000",
            brand: "Delta Research",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-impermeabilizant.jpg",
            imageAlt: "Impermeabilizant granit / marmură 1L",
            href: "/ro/design-preview/product",
            price: { now: "142,00 RON" },
            badges: [{ type: "new", label: "Nou" }],
          }} />
          <ProductCard product={{
            id: "WSK-7-M14",
            title: "Freză cupă M14 · 7 cupe",
            sku: "WSK-7-M14",
            brand: "Woosuk",
            brandHref: "/ro/design-preview/category",
            image: "/design-temp/p-freza-cupa-m14.jpg",
            imageAlt: "Freză cupă M14 · 7 cupe",
            href: "/ro/design-preview/product",
            price: { now: "310,00 RON" },
            badges: [{ type: "new", label: "Nou" }],
          }} />
        </div>

        <div style={{height:"48px"}}></div>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="brand-col">
            <a className="logo" href="/ro"><span className="mark">a</span><span><div className="word">ardmag</div><div className="tag">scule &amp; abrazivi · din 2008</div></span></a>
            <p>Distribuitor autorizat Tenax, Sait, Woosuk. Scule profesionale pentru prelucrarea pietrei naturale, marmură și granit.</p>
            <div className="contact"><div className="phone">Tel. <strong>0264 123 456</strong></div><div>contact@ardmag.ro</div><div>Str. Industriei 14 · Cluj-Napoca</div></div>
          </div>
          <div><h5>Magazin</h5><ul><li><a href="#">Toate categoriile</a></li><li><a href="#">Noutăți</a></li><li><a href="#">Promoții</a></li><li><a href="#">Lichidări stoc</a></li><li><a href="#">Catalog PDF</a></li></ul></div>
          <div><h5>Cont &amp; comenzi</h5><ul><li><a href="#">Contul meu</a></li><li><a href="#">Comenzi &amp; facturi</a></li><li><a href="#">Urmărire livrare</a></li><li><a href="#">Retur produs</a></li><li><a href="#">Cont B2B</a></li></ul></div>
          <div><h5>Info</h5><ul><li><a href="#">Despre noi</a></li><li><a href="#">Parteneri</a></li><li><a href="#">Livrare &amp; plată</a></li><li><a href="#">Garanții</a></li><li><a href="#">Contact</a></li></ul></div>
          <div className="news-col">
            <h5>Newsletter</h5>
            <p>Promoții, stocuri noi, ghiduri tehnice. Maxim 2 emailuri pe lună.</p>
            <form className="news-form" onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="email@firma.ro" aria-label="email" suppressHydrationWarning /><button type="submit">Abonează-mă</button></form>
            <label className="news-consent"><input type="checkbox" defaultChecked /><span>Sunt de acord cu <a href="#" style={{color:"var(--stone-300)",textDecoration:"underline"}}>prelucrarea datelor</a> pentru comunicări comerciale.</span></label>
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
