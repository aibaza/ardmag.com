"use client"

import { useState } from "react"

interface SiteHeaderProps {
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
  cartItemCount?: number
}

export function SiteHeader({ categoriesHref = "#", discuriHref = "#", drawerId, drawerClosedAttr, cartItemCount = 0 }: SiteHeaderProps) {
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
            <a className="action-btn" href="#" aria-label="coș"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h3l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg></span><span className="label">Coș</span>{cartItemCount > 0 && <span className="count">{cartItemCount}</span>}</a>
          </div>
        </div>

        {/* Desktop: category nav */}
        <nav className="cat-nav"><div className="wrap">
          <a href={categoriesHref} className="all"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Toate categoriile</a>
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
          <button className="icon-btn" aria-label="coș"><svg viewBox="0 0 20 20"><path d="M3 4h2l1.5 9h9l1.5-6H6"/><circle cx="8" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>{cartItemCount > 0 && <span className="count">{cartItemCount}</span>}</button>
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
        id={drawerId}
        data-open={drawerOpen ? "true" : (drawerClosedAttr ? "false" : undefined)}
        onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false) }}
      >
        <div className="mobile-menu">
          <div className="mm-head">
            <a className="logo" href="/ro"><span className="mark">a</span><div className="word">ardmag</div></a>
            <button className="close" aria-label="închide" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="mm-section-label">Categorii</div>
          <div className="mm-nav">
            <a href={discuriHref}>Discuri diamantate <span className="count">148</span></a>
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
    </>
  )
}
