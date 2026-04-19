"use client"

import { useState } from "react"
import { Badge } from '@modules/@shared/components/badge'

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


      <nav className="crumbs" aria-label="breadcrumb">
        <a href="/ro">Acasă</a>
        <span className="sep">/</span>
        <a href="#">Scule diamantate</a>
        <span className="sep">/</span>
        <a href="/ro/design-preview/category">Discuri diamantate</a>
        <span className="sep">/</span>
        <span className="cur">Delta Turbo Ø115</span>
      </nav>

      {/* PDP -- 2 columns: gallery (1fr) + sticky summary (380px) */}
      <section className="pdp">

        {/* GALLERY: [thumbs 72px | main 1fr] */}
        <div className="pdp-gallery">

          <div className="pdp-thumbs">
            <button className="pdp-thumb with-real on" aria-label="Imagine frontală"><img src="/design-temp/p-disc-delta-115.jpg" alt="frontal" /></button>
            <button className="pdp-thumb with-real" aria-label="Imagine unghi"><img src="/design-temp/p-disc-turbo-180.jpg" alt="unghi" /></button>
            <button className="pdp-thumb with-real" aria-label="Detaliu bandă"><img src="/design-temp/p-disc-delta-115.jpg" alt="bandă" /></button>
            <button className="pdp-thumb with-real" aria-label="Ambalaj"><img src="/design-temp/p-disc-turbo-180.jpg" alt="ambalaj" /></button>
            <button className="pdp-thumb" aria-label="Vezi încă 3">
              <div className="ph" style={{ background: "var(--stone-900)", color: "#fff", letterSpacing: "0.08em" }}>+3</div>
            </button>
          </div>

          <div className="pdp-main-img with-real">
            <img className="main" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Delta Turbo Ø115" />
            <div className="badges">
              <Badge type="promo" label="−20%" />
              <Badge type="new" label="Nou" />
            </div>
            <button className="zoom" aria-label="Mărește imaginea">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 4v6M4 7h6M14 14l-3.5-3.5"/></svg>
            </button>
          </div>

        </div>

        {/* SUMMARY: sticky right sidebar */}
        <aside className="pdp-summary">

          <div className="pdp-brand"><a href="/ro/design-preview/category" style={{ color: "inherit", textDecoration: "none" }}>Delta Research</a></div>
          <h1 className="pdp-title">Disc diamantat Delta Turbo Ultra Ø115 mm</h1>
          <div className="pdp-sku">
            <span>SKU <strong>DLT-115-TX-ULTRA</strong></span>
            <span>EAN <strong>5944123456789</strong></span>
          </div>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <span style={{ color: "var(--brand-500)", letterSpacing: "1px" }}>★★★★★</span>
            <strong>4.8</strong>
            <span style={{ color: "var(--fg-muted)" }}>· 47 recenzii</span>
            <span style={{ color: "var(--fg-muted)" }}>·</span>
            <a href="#reviews" style={{ color: "var(--brand-700)", textDecoration: "none", fontSize: "12px" }}>Vezi recenziile →</a>
          </div>

          {/* Price card */}
          <div className="pdp-price-card">
            <div className="pdp-price-row">
              <span className="pdp-price">38,40 RON</span>
              <span className="pdp-was">48,00 RON</span>
              <span className="pdp-save">−20% · 9,60 RON</span>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--f-mono)" }}>
              <span>Fără TVA: <strong style={{ color: "var(--fg)" }}>32,27 RON</strong></span>
              <span>·</span>
              <span>Per bucată</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "var(--brand-50)", borderRadius: "var(--r-sm)", fontSize: "12.5px", color: "var(--brand-800)", lineHeight: "1.3" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
              Promoție activă până pe <strong>30 aprilie</strong>
            </div>
          </div>

          {/* Variants */}
          <div className="variant-group">
            <div className="label">Diametru <strong>Ø 115 mm</strong></div>
            <div className="var-opts">
              <button className="var-opt on">Ø115</button>
              <button className="var-opt">Ø125</button>
              <button className="var-opt">Ø150</button>
              <button className="var-opt">Ø180</button>
              <button className="var-opt">Ø230</button>
            </div>
          </div>
          <div className="variant-group">
            <div className="label">Filet / montare <strong>22.23 mm</strong></div>
            <div className="var-opts">
              <button className="var-opt on">22.23 mm</button>
              <button className="var-opt">M14</button>
              <button className="var-opt off">5/8″</button>
            </div>
          </div>
          <div className="variant-group">
            <div className="label">Pachet <strong>1 bucată</strong></div>
            <div className="var-opts">
              <button className="var-opt on">1 buc</button>
              <button className="var-opt">5 buc <span style={{ color: "var(--brand-500)", fontSize: "10px", marginLeft: "4px" }}>−8%</span></button>
              <button className="var-opt">10 buc <span style={{ color: "var(--brand-500)", fontSize: "10px", marginLeft: "4px" }}>−15%</span></button>
            </div>
          </div>

          {/* Stock */}
          <div className="pdp-stock">
            <span className="dot"></span>
            <strong>În stoc — 24 bucăți</strong>
            <span className="loc">Cluj · 24h</span>
          </div>

          {/* Buy */}
          <div className="pdp-buy">
            <div className="qty-stepper">
              <button className="minus" aria-label="Scade cantitatea">−</button>
              <input type="number" defaultValue={1} min={1} />
              <button className="plus" aria-label="Crește cantitatea">+</button>
            </div>
            <button className="btn primary lg">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 3h2l1 9h10l1-6H5"/><circle cx="7" cy="15" r="1.3"/><circle cx="14" cy="15" r="1.3"/></svg>
              Adaugă în coș · 38,40 RON
            </button>
          </div>

          {/* Extras */}
          <div className="pdp-extras">
            <button className="btn ghost md">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z"/></svg>
              Favorite
            </button>
            <button className="btn ghost md">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h10v10H3zM6 7h4M6 10h4"/></svg>
              Cere ofertă
            </button>
          </div>

          {/* Perks */}
          <div className="pdp-perks">
            <div className="row">
              <svg viewBox="0 0 20 20"><path d="M3 7h11v7H3z"/><path d="M14 9h3l1 3v2h-4z"/><circle cx="7" cy="15" r="1.3"/><circle cx="15" cy="15" r="1.3"/></svg>
              <div><strong>Livrare 24–48h</strong> · <span className="sub">Cluj gratuit 500+ RON</span></div>
            </div>
            <div className="row">
              <svg viewBox="0 0 20 20"><path d="M4 7h12v10H4z"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/></svg>
              <div><strong>14 zile retur</strong> · <span className="sub">produs neutilizat</span></div>
            </div>
            <div className="row">
              <svg viewBox="0 0 20 20"><path d="M10 3 3 5v6c0 4 3 6 7 7 4-1 7-3 7-7V5z"/><path d="m7 10 2 2 4-4"/></svg>
              <div><strong>Garanție producător</strong> · <span className="sub">Delta Research</span></div>
            </div>
            <div className="row">
              <svg viewBox="0 0 20 20"><path d="M4 4h12v10H8l-4 3z"/></svg>
              <div><strong>Suport tehnic</strong> · <span className="sub">0264 123 456</span></div>
            </div>
          </div>

        </aside>
      </section>

      {/* TABS + CONTENT */}
      <section className="pdp-content">
        <div className="tabs" role="tablist">
          <button className="on">Specificații</button>
          <button>Descriere</button>
          <button>Utilizare &amp; siguranță</button>
          <button>Recenzii (47)</button>
          <button>Fișiere &amp; certificate</button>
        </div>

        <div className="tab-panel">
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
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 60px", borderTop: "1px solid var(--rule)", paddingTop: "32px" }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow-small">Ai putea avea nevoie și de</div>
            <h3>Accesorii și produse compatibile</h3>
          </div>
          <a className="see-all" href="/ro/design-preview/category">Vezi toate →</a>
        </div>
        <div className="mini-grid">

          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø180" loading="lazy" /><div className="top-tags"><Badge type="promo" label="−20%" /></div></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø180</a></h4>
              <div className="pcard-sku">DLT-180-TX</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">113,60 RON</span><span className="was">142,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-freza-cupa-m14.jpg" alt="Freză cupă M14 · 7 cupe" loading="lazy" /></a>
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
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-pad-velcro-set.jpg" alt="Pad abraziv Velcro — set 7 grit" loading="lazy" /></a>
            <div className="pcard-body">
              <a className="pcard-brand" href="/ro/design-preview/category">Sait Abrazivi</a>
              <h4 className="pcard-title"><a href="/ro/design-preview/product">Pad abraziv Velcro — set 7 grit</a></h4>
              <div className="pcard-sku">SAT-4A-VEL-SET</div>
            </div>
            <div className="pcard-foot">
              <div className="pcard-price"><span className="now">168,00 RON</span></div>
              <button className="btn primary sm">Adaugă</button>
            </div>
          </article>
          <article className="pcard">
            <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-impermeabilizant.jpg" alt="Impermeabilizant granit / marmură 1L" loading="lazy" /></a>
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
        </div>
      </section>

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
            <label className="news-consent"><input type="checkbox" defaultChecked /><span>Sunt de acord cu <a href="#" style={{ color: "var(--stone-300)", textDecoration: "underline" }}>prelucrarea datelor</a> pentru comunicări comerciale.</span></label>
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
