"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface SiteHeaderProps {
  countryCode: string
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
  cartItemCount?: number
  categories?: Array<{ name: string; handle: string; count: number }>
}

export function SiteHeader({
  countryCode,
  categoriesHref: categoriesHrefProp,
  discuriHref,
  drawerId,
  drawerClosedAttr,
  cartItemCount = 0,
  categories = [],
}: SiteHeaderProps) {
  const categoriesHref = categoriesHrefProp ?? `/produse`
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [liveCartCount, setLiveCartCount] = useState(cartItemCount)
  const router = useRouter()

  useEffect(() => {
    const refresh = () =>
      fetch("/api/cart-count")
        .then((r) => r.json())
        .then(({ count }: { count: number }) => setLiveCartCount(count))
        .catch(() => {})

    refresh()

    window.addEventListener("cartupdate", refresh)
    return () => window.removeEventListener("cartupdate", refresh)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = String(formData.get('q') ?? '').trim()
    if (!query) return
    setDrawerOpen(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <header className="site-header">
        {/* Desktop: utility bar */}
        <div className="util-bar"><div className="wrap">
          <span className="promo"><strong>Transport gratuit</strong> peste 500 RON</span>
          <span className="divider">·</span>
          <a href="tel:+40722155441">Tel. +40 722 155 441</a>
          <span className="divider">·</span>
          <span>L-V 08:00-16:00</span>
          <div className="right">
            <a href={`/account/orders`}>Comanda mea</a><span className="divider">·</span>
            <a href="mailto:office@arcromdiamonds.ro">Cont B2B</a><span className="divider">·</span>
            <select aria-label="limba"><option>RO</option><option>EN</option><option>HU</option></select>
          </div>
        </div></div>

        {/* Desktop: main bar */}
        <div className="main-bar">
          <a className="logo" href="/"><Image src="/logo.png" alt="ARDMAG" className="logo-img" width={1367} height={208} priority sizes="(max-width: 768px) 0px, 220px" /><div className="tag">25 de ani pe piatra</div></a>
          <form className="search-combo" role="search" onSubmit={handleSearchSubmit}>
            <input type="search" name="q" placeholder="Cauta produs sau brand..." aria-label="cautare" suppressHydrationWarning />
            <button type="submit"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><span>Cauta</span></button>
          </form>
          <div className="actions">
            <a className="action-btn" href={`/account`} aria-label="cont"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></span><span className="label">Cont</span></a>
            <a className="action-btn" href={`/cart`} aria-label="cos"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h3l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg></span><span className="label">Cos</span>{liveCartCount > 0 && <span className="count">{liveCartCount}</span>}</a>
          </div>
        </div>

        {/* Desktop: category nav — live from API */}
        <nav className="cat-nav"><div className="wrap">
          <a href={categoriesHref} className="all"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Toate categoriile</a>
          {categories.map((cat) => (
            <a key={cat.handle} href={`/categories/${cat.handle}`}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase()}</a>
          ))}
          <div className="right"></div>
        </div></nav>

        {/* Mobile: compact bar */}
        <div className="mobile-header">
          <button className="burger" aria-label="meniu" onClick={() => setDrawerOpen(true)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
          <a className="logo logo-compact" href="/"><Image src="/logo.png" alt="ARDMAG" className="logo-img" width={1367} height={208} priority sizes="150px" /></a>
          <div className="spacer"></div>
          <a className="icon-btn" href={`/cart`} aria-label="cos"><svg viewBox="0 0 20 20"><path d="M3 4h2l1.5 9h9l1.5-6H6"/><circle cx="8" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>{liveCartCount > 0 && <span className="count">{liveCartCount}</span>}</a>
        </div>

        {/* Mobile: search row */}
        <div className="mobile-search">
          <form className="search-combo" role="search" onSubmit={handleSearchSubmit}>
            <input type="search" name="q" placeholder="Cauta produs sau brand..." aria-label="cautare" suppressHydrationWarning />
            <button type="submit"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><span>Cauta</span></button>
          </form>
        </div>
      </header>

      {/* Mobile: slide-in drawer */}
      <div
        className="mobile-drawer"
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-label="Meniu mobil"
        data-open={drawerOpen ? "true" : (drawerClosedAttr ? "false" : undefined)}
        onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false) }}
      >
        <div className="mobile-menu">
          <div className="mm-head">
            <a className="logo logo-compact" href="/"><Image src="/logo.png" alt="ARDMAG" className="logo-img" width={1367} height={208} loading="lazy" sizes="150px" /></a>
            <button className="close" aria-label="inchide" onClick={() => setDrawerOpen(false)}>x</button>
          </div>
          <div className="mm-section-label">Categorii</div>
          <nav className="mm-nav" aria-label="Categorii mobile">
            {categories.map((cat) => (
              <a key={cat.handle} href={`/categories/${cat.handle}`} onClick={() => setDrawerOpen(false)}>
                {cat.name} <span className="chev">›</span>
              </a>
            ))}
          </nav>
          <div className="mm-section-label">Cont</div>
          <nav className="mm-nav" aria-label="Cont si comenzi">
            <a href={`/account`}>Intra in cont <span className="chev">›</span></a>
            <a href={`/account/orders`}>Comanda mea <span className="chev">›</span></a>
            <a href="mailto:office@arcromdiamonds.ro">Cont B2B <span className="chev">↗</span></a>
          </nav>
          <div className="mm-foot">
            <div className="phone"><strong>+40 722 155 441</strong></div>
            <div className="sub">L-V 08:00-16:00 · Cluj-Napoca</div>
          </div>
        </div>
      </div>
    </>
  )
}
