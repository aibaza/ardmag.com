"use client"

import { useState } from "react"
import { Badge } from '@modules/@shared/components/badge'
import { Button } from '@modules/@shared/components/button'
import { ProductCardSpecTag } from '@modules/@shared/components/product-card-spec-tag'
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustItem } from '@modules/@shared/components/trust-item'

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

      <nav className="crumbs" aria-label="breadcrumb">
        <a href="/ro">Acasă</a>
        <span className="sep">/</span>
        <a href="#">Scule diamantate</a>
        <span className="sep">/</span>
        <span className="cur">Discuri diamantate</span>
      </nav>

      <header className="cat-hero">
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)' }}>Categorie · 142 produse</div>
          <h1>Discuri diamantate</h1>
          <p>Discuri diamantate profesionale pentru tăiere în granit, marmură, beton și materiale dure. Formate Ø100 până la Ø300, bandă turbo, continuă sau segmentată. Distribuitor autorizat Delta Research, Tenax, Woosuk și Diatex.</p>
          <div className="meta">
            <span><strong>142</strong> SKU</span>
            <span><strong>7</strong> branduri</span>
            <span><strong>Ø100–Ø300</strong> mm</span>
            <span>Stoc <strong>Cluj-Napoca</strong></span>
          </div>
        </div>
      </header>

      <div className="cat-layout">

        <aside className="filters" id="filters">
          <div className="filter-card">
            <details open>
              <summary>Brand <span className="fcount">7</span></summary>
              <div className="filter-body">
                <label className="chk"><input type="checkbox" defaultChecked />Delta Research<span className="cnt">48</span></label>
                <label className="chk"><input type="checkbox" defaultChecked />Tenax<span className="cnt">32</span></label>
                <label className="chk"><input type="checkbox" />Woosuk<span className="cnt">24</span></label>
                <label className="chk"><input type="checkbox" />Diatex<span className="cnt">18</span></label>
                <label className="chk"><input type="checkbox" />Sait<span className="cnt">12</span></label>
                <label className="chk"><input type="checkbox" />VBT<span className="cnt">8</span></label>
              </div>
            </details>
            <details open>
              <summary>Diametru <span className="fcount">Ø</span></summary>
              <div className="filter-body"><div className="swatches">
                <button className="swatch">Ø100</button>
                <button className="swatch on">Ø115</button>
                <button className="swatch on">Ø125</button>
                <button className="swatch">Ø150</button>
                <button className="swatch">Ø180</button>
                <button className="swatch">Ø200</button>
                <button className="swatch">Ø230</button>
                <button className="swatch">Ø250</button>
                <button className="swatch">Ø300</button>
              </div></div>
            </details>
            <details open>
              <summary>Tip bandă</summary>
              <div className="filter-body">
                <label className="chk"><input type="checkbox" defaultChecked />Turbo<span className="cnt">78</span></label>
                <label className="chk"><input type="checkbox" />Continuă<span className="cnt">34</span></label>
                <label className="chk"><input type="checkbox" />Segmentată<span className="cnt">30</span></label>
              </div>
            </details>
            <details>
              <summary>Material</summary>
              <div className="filter-body">
                <label className="chk"><input type="checkbox" />Granit<span className="cnt">62</span></label>
                <label className="chk"><input type="checkbox" />Marmură<span className="cnt">48</span></label>
                <label className="chk"><input type="checkbox" />Beton<span className="cnt">38</span></label>
                <label className="chk"><input type="checkbox" />Beton armat<span className="cnt">14</span></label>
                <label className="chk"><input type="checkbox" />Ceramică<span className="cnt">12</span></label>
                <label className="chk"><input type="checkbox" />Universal<span className="cnt">22</span></label>
              </div>
            </details>
            <details>
              <summary>Filet / montare</summary>
              <div className="filter-body">
                <label className="chk"><input type="checkbox" />M14<span className="cnt">86</span></label>
                <label className="chk"><input type="checkbox" />22.23 mm<span className="cnt">64</span></label>
                <label className="chk"><input type="checkbox" />5/8″<span className="cnt">18</span></label>
              </div>
            </details>
            <details open>
              <summary>Preț</summary>
              <div className="filter-body">
                <div className="price-range">
                  <div className="bar"></div>
                  <div className="inputs">
                    <input type="number" placeholder="Min" defaultValue="20" />
                    <input type="number" placeholder="Max" defaultValue="250" />
                  </div>
                </div>
              </div>
            </details>
            <details>
              <summary>Disponibilitate</summary>
              <div className="filter-body">
                <label className="chk"><input type="checkbox" defaultChecked />În stoc<span className="cnt">128</span></label>
                <label className="chk"><input type="checkbox" />Livrare la comandă<span className="cnt">14</span></label>
                <label className="chk"><input type="checkbox" />Doar promoții<span className="cnt">22</span></label>
              </div>
            </details>
            <div className="filter-actions">
              <button className="btn secondary sm">Resetează</button>
              <button className="btn primary sm">Aplică (142)</button>
            </div>
          </div>

          <div className="filter-card">
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)', marginBottom: '8px' }}>Ai nevoie de ajutor?</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--stone-700)', marginBottom: '12px' }}>Consultanții noștri tehnici te ajută să alegi discul potrivit pentru materialul tău.</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '14px', fontWeight: 500, color: 'var(--fg)' }}>0264 123 456</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginTop: '2px' }}>L–V 08:00–17:00</div>
            </div>
          </div>
        </aside>

        <main>

          <div className="mobile-filter-bar">
            <button className="btn secondary md" onClick={() => { const el = document.getElementById('filters'); if (el) el.classList.add('open') }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
              Filtre (3 active)
            </button>
            <select className="btn secondary md" style={{ appearance: 'auto', padding: '0 12px' }}><option>Sortare: Popularitate</option><option>Preț ↑</option><option>Preț ↓</option><option>Nou</option></select>
          </div>

          <div className="active-filters">
            <span className="lbl">Filtre active:</span>
            <span className="chip">Delta Research <button className="x" aria-label="șterge">×</button></span>
            <span className="chip">Tenax <button className="x">×</button></span>
            <span className="chip">Ø115 <button className="x">×</button></span>
            <span className="chip">Ø125 <button className="x">×</button></span>
            <span className="chip">Turbo <button className="x">×</button></span>
            <button className="chip clear">Șterge tot</button>
          </div>

          <div className="cat-toolbar">
            <div className="count"><strong>142</strong> produse</div>
            <div className="spacer"></div>
            <div className="tbl"><label htmlFor="sort">Sortare:</label>
              <select id="sort">
                <option>Popularitate</option>
                <option>Nou intrat</option>
                <option>Preț crescător</option>
                <option>Preț descrescător</option>
                <option>Brand A–Z</option>
              </select>
            </div>
            <div className="tbl"><label>Pe pagină:</label>
              <select><option>24</option><option>48</option><option>96</option></select>
            </div>
            <div className="view-toggle" role="tablist">
              <button className="on" aria-label="grid"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg></button>
              <button aria-label="list"><svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
            </div>
          </div>

          <div className="cat-grid">

            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Delta Turbo Ultra Ø115" loading="lazy" /><div className="top-tags"><Badge type="promo" label="−20%" /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Delta Turbo Ultra Ø115</a></h4>
                <div className="pcard-sku">DLT-115-TX-ULTRA</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 115 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Granit" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">38,40 RON</span><span className="was">48,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø125 filet 22.23" loading="lazy" /><div className="top-tags"><Badge type="new" label="Nou" /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø125 filet 22.23</a></h4>
                <div className="pcard-sku">DLT-125-TX</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 125 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Universal" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">52,80 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Turbo Ø180" loading="lazy" /><div className="top-tags"><Badge type="promo" label="−20%" /><Badge type="stock-low" label="4 buc" dotVariant /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø180</a></h4>
                <div className="pcard-sku">DLT-180-TX</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 180 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Granit" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">113,60 RON</span><span className="was">142,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø230 flanșă M14" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø230 flanșă M14</a></h4>
                <div className="pcard-sku">DLT-230-TX</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 230 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Beton" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">168,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat segmentat Ø115" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat segmentat Ø115</a></h4>
                <div className="pcard-sku">DLT-115-SG</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 115 mm" /><ProductCardSpecTag label="Segmentat" /><ProductCardSpecTag label="Beton" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">34,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat continuu Ø200 marmură" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Tenax</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat continuu Ø200 marmură</a></h4>
                <div className="pcard-sku">TNX-DC-200</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 200 mm" /><ProductCardSpecTag label="Continuu" /><ProductCardSpecTag label="Marmură" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">198,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat continuu Ø250 marmură" loading="lazy" /><div className="top-tags"><Badge type="stock-low" label="2 buc" dotVariant /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Tenax</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat continuu Ø250 marmură</a></h4>
                <div className="pcard-sku">TNX-DC-250</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 250 mm" /><ProductCardSpecTag label="Continuu" /><ProductCardSpecTag label="Marmură" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">312,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø125 premium" loading="lazy" /><div className="top-tags"><Badge type="promo" label="−20%" /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Woosuk</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø125 premium</a></h4>
                <div className="pcard-sku">WSK-T-125</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 125 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Granit" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">78,00 RON</span><span className="was">98,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Turbo Ø180 premium" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Woosuk</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø180 premium</a></h4>
                <div className="pcard-sku">WSK-T-180</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 180 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Granit" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">148,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Ø115 economic" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Diatex</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Ø115 economic</a></h4>
                <div className="pcard-sku">DTX-E-115</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 115 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Universal" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">22,40 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-delta-115.jpg" alt="Disc diamantat Ø230 beton armat" loading="lazy" /><div className="top-tags"></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Diatex</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Ø230 beton armat</a></h4>
                <div className="pcard-sku">DTX-BA-230</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 230 mm" /><ProductCardSpecTag label="Segmentat" /><ProductCardSpecTag label="Beton armat" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">142,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
            <article className="pcard">
              <a href="/ro/design-preview/product" className="pcard-img-link pcard-img with-real" aria-label="Vezi produs"><img className="pimg" src="/design-temp/p-disc-turbo-180.jpg" alt="Disc diamantat Turbo Ø115 - pachet 5 buc" loading="lazy" /><div className="top-tags"><Badge type="promo" label="Pachet" /></div></a>
              <div className="pcard-body">
                <a className="pcard-brand" href="/ro/design-preview/category">Delta Research</a>
                <h4 className="pcard-title"><a href="/ro/design-preview/product">Disc diamantat Turbo Ø115 - pachet 5 buc</a></h4>
                <div className="pcard-sku">DLT-115-TX-5</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <ProductCardSpecTag label="Ø 115 mm" /><ProductCardSpecTag label="Turbo" /><ProductCardSpecTag label="Pachet 5" />
                </div>
              </div>
              <div className="pcard-foot">
                <div className="pcard-price"><span className="now">172,00 RON</span><span className="was">220,00 RON</span></div>
                <Button variant="primary" size="sm">Adaugă</Button>
              </div>
            </article>
          </div>

          <div className="pagination">
            <span className="prev"><a href="#" aria-label="prev">←</a></span>
            <a href="#" className="on">1</a>
            <a href="#">2</a>
            <a href="#">3</a>
            <a href="#">4</a>
            <span className="dots">…</span>
            <a href="#">12</a>
            <a href="#" className="next">→</a>
          </div>
          <div className="results-foot">Afișate 1–12 din 142 · pagina 1 din 12</div>

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
          <div className="trust-strip">
            <TrustItem icon={<ReturnIcon />} title="14 zile retur" subtitle="fără întrebări" />
            <TrustItem icon={<TruckIcon />} title="Livrare 24-48h" subtitle="țara întreagă" />
            <TrustItem icon={<SecureIcon />} title="Plată securizată" subtitle="3DSecure · SSL" />
            <TrustItem icon={<SupportIcon />} title="Suport tehnic" subtitle="L–V 08–17 · RO" />
          </div>
          <div className="pay-strip"><span className="pay-chip">Visa</span><span className="pay-chip">Mastercard</span><span className="pay-chip">Netopia</span><span className="pay-chip">Ramburs</span><span className="pay-chip">OP B2B</span></div>
        </div>
        <div className="footer-bot"><div className="wrap"><div className="legal"><a href="#">Termeni &amp; condiții</a><a href="#">Politică confidențialitate</a><a href="#">Politică cookies</a><a href="#">GDPR</a><a href="#">ANPC</a><a href="#">Soluționare litigii</a></div><span className="cr">© 2008–2026 ardmag SRL</span></div></div>
      </footer>
    </>
  )
}
