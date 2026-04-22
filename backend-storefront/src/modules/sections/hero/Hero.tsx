import { ReactNode, CSSProperties } from 'react'

interface HeroStat {
  value: string
  label: string
}

interface HeroSideCard {
  kicker: string
  title: string
  description: string
  image: string
  imageAlt: string
  ctaLabel: string
  ctaHref: string
}

interface HeroProps {
  kicker: string
  title: ReactNode
  description: string
  primaryCta: { label: string; href: string }
  ghostCta: { label: string; href: string; style?: CSSProperties }
  stats: HeroStat[]
  sideCards: HeroSideCard[]
  headingLevel?: "h1" | "h2"
}

export function Hero({ kicker, title, description, primaryCta, ghostCta, stats, sideCards, headingLevel }: HeroProps) {
  const Heading = headingLevel ?? "h2"
  return (
    <div className="hero">
      <div className="hero-main">
        <span className="kicker">{kicker}</span>
        <Heading>{title}</Heading>
        <p>{description}</p>
        <div className="hactions">
          <a className="btn primary lg" href={primaryCta.href}>{primaryCta.label}</a>
          <a className="btn ghost lg hero-ghost" href={ghostCta.href} style={ghostCta.style}>{ghostCta.label}</a>
        </div>
        <style>{`.hero-ghost:hover{background:var(--stone-700)!important;color:#fff!important}`}</style>
        <div className="stats">
          {stats.map((s, i) => (
            <div key={i}><strong>{s.value}</strong><span>{s.label}</span></div>
          ))}
        </div>
      </div>
      <div className="hero-side">
        {sideCards.map((card, i) => (
          <div key={i} className="hero-card with-img">
            <span className="kicker">{card.kicker}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <div className="img-wrap"><img src={card.image} alt={card.imageAlt} width={600} height={400} loading="lazy" /></div><a href={card.ctaHref}>{card.ctaLabel}</a>
          </div>
        ))}
      </div>
    </div>
  )
}
