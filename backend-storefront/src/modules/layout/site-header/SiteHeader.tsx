"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ThemeToggle } from "@modules/@shared/components/theme-toggle/ThemeToggle"
import { AddToCartSheet } from "@modules/cart/components/AddToCartSheet/AddToCartSheet"
import { formatCategoryTitle } from "@lib/util/category-title"

interface SiteHeaderProps {
  countryCode: string
  categoriesHref?: string
  discuriHref?: string
  drawerId?: string
  drawerClosedAttr?: boolean
  categories?: Array<{ name: string; handle: string; count: number }>
}

function ArcRomLogo() {
  // textTransform none: plasa de siguranta - "diamonds" trebuie sa ramana lowercase
  // chiar daca un container primeste text-transform:uppercase (istoric: .parent-group)
  return (
    <svg className="arc-logo" viewBox="29 26 422 212" role="img" aria-label="ARC ROM diamonds" style={{ textTransform: "none" }}>
      <g fill="currentColor">
        <path d="M 32.5 137.2 A 118 118 0 0 1 36.4 116.3 L 61.4 123.2 A 92 92 0 0 0 58.4 139.6 Z" />
        <path d="M 37.8 111.3 A 118 118 0 0 1 46.3 91.8 L 69.1 104.2 A 92 92 0 0 0 62.6 119.4 Z" />
        <path d="M 48.8 87.3 A 118 118 0 0 1 61.4 70.1 L 80.9 87.3 A 92 92 0 0 0 71.1 100.7 Z" />
        <path d="M 64.9 66.3 A 118 118 0 0 1 80.9 52.3 L 96.2 73.4 A 92 92 0 0 0 83.6 84.3 Z" />
        <path d="M 85.2 49.4 A 118 118 0 0 1 104 39.4 L 114.1 63.3 A 92 92 0 0 0 99.5 71.1 Z" />
        <path d="M 108.7 37.4 A 118 118 0 0 1 129.3 31.8 L 133.9 57.4 A 92 92 0 0 0 117.8 61.8 Z" />
        <path d="M 134.4 31 A 118 118 0 0 1 155.7 30.1 L 154.4 56.1 A 92 92 0 0 0 137.8 56.8 Z" />
        {/* Layout-ul si proportiile vin din referinta resources/arc-rom-logo/ (sigla
            fizica de la intrare): diamonds sub wordmark, acelasi font greu, marginea
            dreapta la fix cu ROM. textLength fixeaza latimea randata indiferent de
            fontul de pe sistemul vizitatorului - fara el, fallback-ul randa textul
            mai lat si iesea din viewBox, taiat ("diamonds" -> "DIAMOND"). Stroke-ul
            ingroasa literele ca pe sigla reala, indiferent de weight-urile disponibile. */}
        <text
          x="84"
          y="154"
          fontFamily='"Arial Narrow", "Helvetica Neue Condensed Bold", "Roboto Condensed", "Arial Black", Arial, sans-serif'
          fontSize="104"
          fontWeight="900"
          fontStretch="condensed"
          fontStyle="italic"
          letterSpacing="-8"
          stroke="currentColor"
          strokeWidth="3.2"
          textLength="358"
          lengthAdjust="spacingAndGlyphs"
        >
          ARC ROM
        </text>
        <text
          x="446"
          y="232"
          textAnchor="end"
          fontFamily='"Arial Narrow", "Helvetica Neue Condensed Bold", "Roboto Condensed", "Arial Black", Arial, sans-serif'
          fontSize="76"
          fontWeight="900"
          fontStretch="condensed"
          fontStyle="italic"
          letterSpacing="-3"
          stroke="currentColor"
          strokeWidth="3.2"
          textLength="269"
          lengthAdjust="spacingAndGlyphs"
        >
          diamonds
        </text>
      </g>
    </svg>
  )
}

export function SiteHeader({
  countryCode,
  categoriesHref: categoriesHrefProp,
  discuriHref,
  drawerId,
  drawerClosedAttr,
  categories = [],
}: SiteHeaderProps) {
  const categoriesHref = categoriesHrefProp ?? `/produse`
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [liveCartCount, setLiveCartCount] = useState<number | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname() ?? ""
  const isOnProduse = pathname === "/produse" || pathname === `/${countryCode}/produse`
  const activeCategoryHandle = (() => {
    const m = pathname.match(/^(?:\/[a-z]{2})?\/categories\/([^/?#]+)/)
    return m ? decodeURIComponent(m[1]) : null
  })()

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
          <span className="promo"><strong>Transport gratuit</strong> peste 500 Lei</span>
          <span className="divider">·</span>
          <a href="tel:+40722155441">Tel. +40 722 155 441</a>
          <span className="divider">·</span>
          <span>L-V 08:00-16:00</span>
          <div className="right">
            <a href="/blog">Blog</a>
            <ThemeToggle />
          </div>
        </div></div>

        {/* Desktop: main bar */}
        <div className="main-bar">
          <a className="logo" href="/">
            <div className="logo-main">
              <Image src="/logo.png" alt="ARDmag.ro" className="logo-img" width={1367} height={208} priority sizes="(max-width: 768px) 0px, 220px" />
              <div className="tag">Experți în piatră de peste 25 de ani</div>
            </div>
            <ArcRomLogo />
          </a>
          <form className="search-combo" role="search" onSubmit={handleSearchSubmit}>
            <input type="search" name="q" placeholder="Cauta produs sau brand..." aria-label="cautare" suppressHydrationWarning />
            <button type="submit"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><span>Cauta</span></button>
          </form>
          <div className="actions">
            <a className="action-btn" href={`/account`} aria-label="cont"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></span><span className="label">Cont</span></a>
            <a className="action-btn" href={`/cart`} aria-label="cos"><span className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h3l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg></span><span className="label">Cos</span>{liveCartCount === undefined ? <span className="count count-skeleton" aria-hidden="true" /> : liveCartCount > 0 && <span className="count">{liveCartCount}</span>}</a>
          </div>
        </div>

        {/* Desktop: category nav - live from API */}
        <nav className="cat-nav"><div className="wrap">
          <a href={categoriesHref} className={`all${isOnProduse ? " active" : ""}`}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Toate produsele</a>
          {categories.map((cat) => (
            <a
              key={cat.handle}
              href={`/categories/${cat.handle}`}
              className={cat.handle === activeCategoryHandle ? "active" : undefined}
              aria-current={cat.handle === activeCategoryHandle ? "page" : undefined}
            >
              {formatCategoryTitle(cat.name)}
            </a>
          ))}
        </div></nav>

        {/* Mobile: compact bar */}
        <div className="mobile-header">
          <button className="burger" aria-label="meniu" onClick={() => setDrawerOpen(true)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
          <a className="logo logo-compact" href="/">
            <Image src="/logo.png" alt="ARDmag.ro" className="logo-img" width={1367} height={208} priority sizes="150px" />
            <ArcRomLogo />
          </a>
          <div className="spacer"></div>
          <a className="icon-btn" href={`/cart`} aria-label="cos"><svg viewBox="0 0 20 20"><path d="M3 4h2l1.5 9h9l1.5-6H6"/><circle cx="8" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>{liveCartCount === undefined ? <span className="count count-skeleton" aria-hidden="true" /> : liveCartCount > 0 && <span className="count">{liveCartCount}</span>}</a>
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
            <a className="logo logo-compact" href="/"><Image src="/logo.png" alt="ARDmag.ro" className="logo-img" width={1367} height={208} loading="lazy" sizes="150px" /></a>
            <button className="close" aria-label="inchide" onClick={() => setDrawerOpen(false)}>x</button>
          </div>
          <div className="mm-section-label">Categorii</div>
          <nav className="mm-nav" aria-label="Categorii mobile">
            {categories.map((cat) => (
              <a key={cat.handle} href={`/categories/${cat.handle}`} onClick={() => setDrawerOpen(false)}>
                {formatCategoryTitle(cat.name)} <span className="chev">›</span>
              </a>
            ))}
          </nav>
          <div className="mm-section-label">Resurse</div>
          <nav className="mm-nav" aria-label="Resurse">
            <a href="/blog" onClick={() => setDrawerOpen(false)}>Blog <span className="chev">›</span></a>
          </nav>
          <div className="mm-section-label">Cont</div>
          <nav className="mm-nav" aria-label="Cont si comenzi">
            <a href={`/account`}>Intra in cont <span className="chev">›</span></a>
            <a href={`/account/orders`}>Comanda mea <span className="chev">›</span></a>
          </nav>
          <div className="mm-foot">
            <div className="phone"><a href="tel:+40722155441"><strong>+40 722 155 441</strong></a></div>
            <div className="sub">L-V 08:00-16:00 · Cluj-Napoca</div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <AddToCartSheet />
    </>
  )
}
