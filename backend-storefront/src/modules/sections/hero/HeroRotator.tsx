"use client"

// Blocul .hero-main rotativ pentru experimentul A/B hero_tenax30_v1.
// SSR si primul render client afiseaza variants[0] (zero hydration mismatch);
// la mount se alege varianta initiala prin round-robin pe minutul curent
// (distributie garantat egala a impresiilor initiale), restul ordinii de
// rotatie fiind amestecat aleator per pageload.
// Rotatia e programata pe grila ceasului de perete (scheduleOnWallClockGrid,
// offset 0) ca sa comute exact in contratimp cu ticker-ul de articole
// (aceeasi perioada, offset jumatate). Pauza la hover si tab ascuns;
// prefers-reduced-motion dezactiveaza rotatia (varianta initiala ramane).
// Inaltime stabila: toate variantele se randeaza ca sizere invizibile intr-un
// stack de grid (aceeasi celula), deci .hero-main are mereu inaltimea celei
// mai inalte variante - fara salturi de layout intre variante.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { abTrack } from '@lib/util/ab-track'
import { scheduleOnWallClockGrid } from '@lib/util/grid-timer'
import type { HeroExperimentVariant } from './hero-experiment'

interface HeroRotatorProps {
  experiment: string
  rotateMs: number
  variants: HeroExperimentVariant[]
}

const GHOST_STYLE: CSSProperties = { color: '#fff', borderColor: 'var(--stone-700)' }

const LEAVE_MS = 240

interface VariantBodyProps {
  v: HeroExperimentVariant
  sizer?: boolean
  onCtaClick?: (cta: 'primary' | 'ghost') => void
}

function VariantBody({ v, sizer, onCtaClick }: VariantBodyProps) {
  return (
    <>
      <span className="kicker">{v.kicker}</span>
      {sizer ? <div className="hv-title">{v.title}</div> : <h1 className="hv-title">{v.title}</h1>}
      <p>{v.description}</p>
      <div className="hactions">
        {sizer ? (
          <>
            <span className="btn primary lg">{v.primaryCta.label}</span>
            <span className="btn ghost lg hero-ghost" style={GHOST_STYLE}>{v.ghostCta.label}</span>
          </>
        ) : (
          <>
            <a className="btn primary lg" href={v.primaryCta.href} onClick={() => onCtaClick?.('primary')}>
              {v.primaryCta.label}
            </a>
            <a className="btn ghost lg hero-ghost" href={v.ghostCta.href} style={GHOST_STYLE} onClick={() => onCtaClick?.('ghost')}>
              {v.ghostCta.label}
            </a>
          </>
        )}
      </div>
      <div className="stats">
        {v.stats.map((s, i) => (
          <div key={i}><strong>{s.value}</strong><span>{s.label}</span></div>
        ))}
      </div>
    </>
  )
}

export function HeroRotator({ experiment, rotateMs, variants }: HeroRotatorProps) {
  const [order, setOrder] = useState<number[] | null>(null)
  const [pos, setPos] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const pausedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const viewedRef = useRef<Map<string, 'initial' | 'rotate'>>(new Map())

  const active = order ? variants[order[pos % order.length]] : variants[0]

  // Varianta initiala = round-robin pe felii de timp (minutul curent mod N):
  // distributie garantat egala a impresiilor initiale la nivel de campanie
  // (fiecare varianta primeste acelasi numar de minute din fiecare ora,
  // intercalate uniform), fara stare partajata intre vizitatori. Restul
  // ordinii de rotatie ramane amestecat aleator per pageload.
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const initialIdx = Math.floor(Date.now() / 60000) % variants.length
    const rest = variants.map((_, i) => i).filter((i) => i !== initialIdx)
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rest[i], rest[j]] = [rest[j], rest[i]]
    }
    setOrder([initialIdx, ...rest])
  }, [variants])

  // tranzitie in doua faze pe grila ceasului de perete (offset 0): continutul
  // curent iese subtil (fade + 6px in sus, LEAVE_MS), apoi urmatoarea varianta
  // intra cu stagger (CSS .hero-variant)
  useEffect(() => {
    if (!order || reducedMotionRef.current) return
    let leaveTimer: ReturnType<typeof setTimeout> | null = null
    const cancel = scheduleOnWallClockGrid(rotateMs, 0, () => {
      if (pausedRef.current || document.hidden) return
      setLeaving(true)
      leaveTimer = setTimeout(() => {
        setPos((p) => (p + 1) % order.length)
        setLeaving(false)
      }, LEAVE_MS)
    })
    return () => {
      cancel()
      if (leaveTimer) clearTimeout(leaveTimer)
    }
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
      <div className="hero-variant-stack">
        {variants.map((v) => (
          <div key={`sizer-${v.id}`} className="hero-variant hv-sizer" aria-hidden="true">
            <VariantBody v={v} sizer />
          </div>
        ))}
        <div className={`hero-variant${leaving ? ' is-leaving' : ''}`} key={active.id}>
          <VariantBody v={active} onCtaClick={onCtaClick} />
          <style>{`.hero-ghost:hover{background:var(--stone-700)!important;color:#fff!important}`}</style>
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
