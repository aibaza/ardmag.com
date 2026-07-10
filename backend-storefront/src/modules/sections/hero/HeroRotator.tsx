"use client"

// Blocul .hero-main rotativ pentru experimentul A/B hero_tenax30_v1.
// SSR si primul render client afiseaza variants[0] (zero hydration mismatch);
// la mount se face Fisher-Yates shuffle si se trece la varianta initiala
// random, mascata de acelasi fade de 400ms folosit la rotatie. Impresia SSR
// nu se masoara: doar varianta aleasa random emite hero_view mode:'initial'.
// Rotatie la rotateMs, pauza la hover si la tab ascuns; prefers-reduced-motion
// dezactiveaza rotatia (varianta initiala random ramane si e masurata).

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { abTrack } from '@lib/util/ab-track'
import type { HeroExperimentVariant } from './hero-experiment'

interface HeroRotatorProps {
  experiment: string
  rotateMs: number
  variants: HeroExperimentVariant[]
}

const GHOST_STYLE: CSSProperties = { color: '#fff', borderColor: 'var(--stone-700)' }

export function HeroRotator({ experiment, rotateMs, variants }: HeroRotatorProps) {
  const [order, setOrder] = useState<number[] | null>(null)
  const [pos, setPos] = useState(0)
  const pausedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const viewedRef = useRef<Map<string, 'initial' | 'rotate'>>(new Map())

  const active = order ? variants[order[pos % order.length]] : variants[0]

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const idx = variants.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    setOrder(idx)
  }, [variants])

  useEffect(() => {
    if (!order || reducedMotionRef.current) return
    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return
      setPos((p) => (p + 1) % order.length)
    }, rotateMs)
    return () => clearInterval(timer)
  }, [order, rotateMs])

  // hero_view: o data per varianta per pageload, doar cu pagina vizibila
  useEffect(() => {
    if (!order) return
    const variant = variants[order[pos % order.length]]
    if (viewedRef.current.has(variant.id)) return
    const mode: 'initial' | 'rotate' = viewedRef.current.size === 0 ? 'initial' : 'rotate'
    const fire = () => {
      if (viewedRef.current.has(variant.id)) return
      viewedRef.current.set(variant.id, mode)
      abTrack('hero_view', { exp: experiment, v: variant.id, mode })
    }
    if (document.visibilityState === 'visible') {
      fire()
      return
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fire()
        document.removeEventListener('visibilitychange', onVisible)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [order, pos, variants, experiment])

  const onCtaClick = (cta: 'primary' | 'ghost') => {
    abTrack('hero_cta_click', {
      exp: experiment,
      v: active.id,
      cta,
      mode: viewedRef.current.get(active.id) ?? 'initial',
    })
  }

  return (
    <div
      className="hero-main has-promo-img"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="hero-variant" key={active.id}>
        <span className="kicker">{active.kicker}</span>
        <h1>{active.title}</h1>
        <p>{active.description}</p>
        <div className="hactions">
          <a className="btn primary lg" href={active.primaryCta.href} onClick={() => onCtaClick('primary')}>
            {active.primaryCta.label}
          </a>
          <a className="btn ghost lg hero-ghost" href={active.ghostCta.href} style={GHOST_STYLE} onClick={() => onCtaClick('ghost')}>
            {active.ghostCta.label}
          </a>
        </div>
        <style>{`.hero-ghost:hover{background:var(--stone-700)!important;color:#fff!important}`}</style>
        <div className="stats">
          {active.stats.map((s, i) => (
            <div key={i}><strong>{s.value}</strong><span>{s.label}</span></div>
          ))}
        </div>
      </div>
      <img
        className="hero-promo-img"
        key={`img-${active.id}`}
        src={active.promoImage}
        alt=""
        aria-hidden="true"
        width={380}
        height={380}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
