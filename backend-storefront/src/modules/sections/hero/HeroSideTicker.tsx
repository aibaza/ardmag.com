"use client"

// Ticker vertical pentru cardurile de articole din hero: la fiecare tickMs,
// cardul de sus iese prin partea superioara si urmatorul articol din pool
// intra de jos (scroll simulat in sus). Se randeaza mereu 3 carduri (al
// treilea ascuns sub marginea containerului, overflow hidden); glisarea muta
// track-ul cu inaltimea unui card + gap, apoi indexul avanseaza si track-ul
// se reseteaza fara tranzitie - cheile stabile (href) pastreaza identitatea
// DOM, deci resetarea e invizibila. Pauza la hover si tab ascuns;
// prefers-reduced-motion dezactiveaza total glisarea. Sub 3 carduri se
// randeaza gridul static clasic (HeroSide ramane fallback-ul server-side).

import { useEffect, useRef, useState } from 'react'
import { abTrack } from '@lib/util/ab-track'

interface HeroSideCard {
  kicker: string
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel: string
  ctaHref: string
}

interface HeroSideTickerProps {
  cards: HeroSideCard[]
  tickMs?: number
}

const GAP = 16
const SLIDE_MS = 650

export function HeroSideTicker({ cards, tickMs = 20000 }: HeroSideTickerProps) {
  const [start, setStart] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [cardH, setCardH] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = wrapRef.current
    if (!el) return
    const measure = () => setCardH((el.clientHeight - GAP) / 2)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (cards.length < 3 || reducedMotionRef.current) return
    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return
      setSliding(true)
    }, tickMs)
    return () => clearInterval(timer)
  }, [cards.length, tickMs])

  const onSlideEnd = () => {
    if (!sliding) return
    setStart((s) => (s + 1) % cards.length)
    setSliding(false)
  }

  const visible = [0, 1, 2].map((i) => cards[(start + i) % cards.length])

  return (
    <div
      ref={wrapRef}
      className="hero-side hero-side-ticker"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div
        className="hst-track"
        style={{
          transform: sliding && cardH ? `translateY(-${cardH + GAP}px)` : 'translateY(0)',
          transition: sliding ? `transform ${SLIDE_MS}ms cubic-bezier(.33,.66,.24,1)` : 'none',
        }}
        onTransitionEnd={onSlideEnd}
      >
        {visible.map((card, i) => (
          <a
            key={card.ctaHref}
            className="hero-card with-img"
            href={card.ctaHref}
            aria-label={`${card.kicker}: ${card.title}`}
            aria-hidden={i === 2 ? true : undefined}
            tabIndex={i === 2 ? -1 : undefined}
            onClick={() => abTrack('hero_side_click', { slug: card.ctaHref.slice(0, 80), pos: i })}
          >
            <img className="hcard-bg" src={card.image} alt="" aria-hidden="true" width={800} height={450} loading="lazy" />
            <span className="hcard-fade" aria-hidden="true" />
            <span className="kicker">{card.kicker}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <span className="hcard-cta">{card.ctaLabel}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
