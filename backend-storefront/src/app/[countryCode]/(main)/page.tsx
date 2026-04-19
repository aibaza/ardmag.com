"use client"

import { useState } from "react"

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
        <div className="hero">
          <div className="hero-main">
            <span className="kicker">Promo luna aprilie · până pe 30</span>
            <h2>Discuri diamantate<br />Delta Turbo — până la <span style={{color:"var(--brand-400)"}}>−20%</span></h2>
            <p>Toate variantele pentru granit + beton armat la Ø115–230 mm. Stoc complet în Cluj, livrare 24–48h în toată țara.</p>
            <div className="hactions">
              <a className="btn primary lg" href="#">Vezi promoția</a>
              <a className="btn ghost lg" href="#" style={{color:"#fff",borderColor:"var(--stone-700)"}}>Toate discurile →</a>
            </div>
            <div className="stats">
              <div><strong>480+</strong><span>SKU în stoc</span></div>
              <div><strong>7</strong><span>furnizori autorizați</span></div>
              <div><strong>24h</strong><span>livrare Cluj</span></div>
            </div>
          </div>
          <div className="hero-side">
            <div className="hero-card with-img">
              <span className="kicker">Nou · Sait Abrazivi</span>
              <h3>Pad-uri Velcro 7 gradații</h3>
              <p>Set complet pentru polish granit de la grit 50 la 3000.</p>
              <div className="img-wrap"><img src="/design-temp/hero-paduri.jpg" alt="Pad-uri Velcro" loading="lazy" /></div><a href="#">Descoperă setul →</a>
            </div>
            <div className="hero-card with-img">
              <span className="kicker">Ghid tehnic</span>
              <h3>Cum alegi discul corect</h3>
              <p>Granit dur vs. marmură vs. beton armat — cheatsheet PDF.</p>
              <div className="img-wrap"><img src="/design-temp/hero-ghid.jpg" alt="Ghid discuri" loading="lazy" /></div><a href="#">Descarcă ghid →</a>
            </div>
          </div>
        </div>

        {/* Quick categories */}
        <div className="quick-cats">
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-discuri.webp" alt="Discuri" /></div><div className="label">Discuri</div><div className="count">142</div></a>
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-freze.jpg" alt="Freze" /></div><div className="label">Freze</div><div className="count">87</div></a>
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-paduri.webp" alt="Pad-uri" /></div><div className="label">Pad-uri</div><div className="count">56</div></a>
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-mastici.webp" alt="Mastici" /></div><div className="label">Mastici</div><div className="count">38</div></a>
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-tratamente.webp" alt="Tratamente" /></div><div className="label">Tratamente</div><div className="count">24</div></a>
          <a className="qc" href="/ro/design-preview/category"><div className="real"><img src="/design-temp/cat-echipamente.webp" alt="Echipamente" /></div><div className="label">Echipamente</div><div className="count">19</div></a>
        </div>

        {/* Promo products */}
        <div className="sec-head">
          <div>
            <div className="eyebrow-small">Promoții active · 12 produse</div>
            <h3>La reducere săptămâna aceasta</h3>
          </div>
          <a className="see-all" href="#">Toate promoțiile →</a>
        </div>

        <div className="mini-grid">
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Delta Turbo Ultra Ø115" loading="lazy" /><div className="top-tags"><span className="badge promo">−20%</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Delta Turbo Ultra Ø115</a></h4>
              <div className="pcard-sku">DLT-115-TX-ULTRA</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">38,40 RON</span><span className="was">48,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-freza-f8-250.jpg" alt="Freză profil F8 Ø250 marmură" loading="lazy" /><div className="top-tags"><span className="badge promo">−15%</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Tenax</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Freză profil F8 Ø250 marmură</a></h4>
              <div className="pcard-sku">TNX-F8-250</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">1.258,00 RON</span><span className="was">1.480,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø180 filet 22.23" loading="lazy" /><div className="top-tags"><span className="badge promo">−20%</span><span className="badge stock-low dot">4 buc</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø180 filet 22.23</a></h4>
              <div className="pcard-sku">DLT-180-TX</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">113,60 RON</span><span className="was">142,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-mastic-1kg.jpg" alt="Mastice poliester transparent 1 kg" loading="lazy" /><div className="top-tags"><span className="badge promo">Pachet 3+1</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Tenax</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Mastice poliester transparent 1 kg</a></h4>
              <div className="pcard-sku">TNX-MP-1000-TR</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">282,00 RON</span><span className="was">376,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
        </div>

        {/* Trust banner */}
        <div className="trust-banner">
          <div><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M3 7h13v8H3z"/><path d="M16 10h4l1 3v2h-5z"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/></svg><div><strong>Livrare 24–48h</strong><span>țara întreagă</span></div></div>
          <div><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M4 8h16l-1 10H5z"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/></svg><div><strong>14 zile retur</strong><span>fără întrebări</span></div></div>
          <div><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><div><strong>Distribuitor autorizat</strong><span>Tenax · Sait · Delta</span></div></div>
          <div><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M4 4h16v14H8l-4 4z"/><path d="M8 10h8M8 13h5"/></svg><div><strong>Suport tehnic</strong><span>L–V 08–17 · RO</span></div></div>
        </div>

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
        <div className="sec-head">
          <div>
            <div className="eyebrow-small">Nou intrat · ultimele 30 zile</div>
            <h3>Produse noi în stoc</h3>
          </div>
          <a className="see-all" href="#">Toate noutățile →</a>
        </div>

        <div className="mini-grid">
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-pad-velcro-set.jpg" alt="Pad abraziv Velcro — 7 gradații set" loading="lazy" /><div className="top-tags"><span className="badge new">Nou</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Sait Abrazivi</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Pad abraziv Velcro — 7 gradații set</a></h4>
              <div className="pcard-sku">SAT-4A-VEL-SET</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">168,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-freza-f20-200.jpg" alt="Freză profil F20 Ø200 granit" loading="lazy" /><div className="top-tags"><span className="badge new">Nou</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Tenax</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Freză profil F20 Ø200 granit</a></h4>
              <div className="pcard-sku">TNX-F20-200</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">1.890,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-impermeabilizant.jpg" alt="Impermeabilizant granit / marmură 1L" loading="lazy" /><div className="top-tags"><span className="badge new">Nou</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Impermeabilizant granit / marmură 1L</a></h4>
              <div className="pcard-sku">DLT-ECO-1000</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">142,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-freza-cupa-m14.jpg" alt="Freză cupă M14 · 7 cupe" loading="lazy" /><div className="top-tags"><span className="badge new">Nou</span></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Woosuk</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Freză cupă M14 · 7 cupe</a></h4>
              <div className="pcard-sku">WSK-7-M14</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">310,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
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
          <div className="trust-strip">
            <div className="trust-item"><svg viewBox="0 0 24 24"><path d="M4 8h16l-1 10H5z"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/></svg><div><strong>14 zile retur</strong><span>fără întrebări</span></div></div>
            <div className="trust-item"><svg viewBox="0 0 24 24"><path d="M3 7h13v8H3z"/><path d="M16 10h4l1 3v2h-5z"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/></svg><div><strong>Livrare 24-48h</strong><span>țara întreagă</span></div></div>
            <div className="trust-item"><svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><div><strong>Plată securizată</strong><span>3DSecure · SSL</span></div></div>
            <div className="trust-item"><svg viewBox="0 0 24 24"><path d="M4 4h16v14H8l-4 4z"/><path d="M8 10h8M8 13h5"/></svg><div><strong>Suport tehnic</strong><span>L–V 08–17 · RO</span></div></div>
          </div>
          <div className="pay-strip"><span className="pay-chip">Visa</span><span className="pay-chip">Mastercard</span><span className="pay-chip">Netopia</span><span className="pay-chip">Ramburs</span><span className="pay-chip">OP B2B</span></div>
        </div>
        <div className="footer-bot"><div className="wrap"><div className="legal"><a href="#">Termeni &amp; condiții</a><a href="#">Politică confidențialitate</a><a href="#">Politică cookies</a><a href="#">GDPR</a><a href="#">ANPC</a><a href="#">Soluționare litigii</a></div><span className="cr">© 2008–2026 ardmag SRL</span></div></div>
      </footer>
    </>
  )
}
